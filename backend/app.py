# ARKA AI Teacher Backend — Firebase Admin + Gemini
# Place your Firebase service account key JSON in backend/ and set path below.

import os
import uuid
from datetime import datetime, timezone

from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

# ── Bootstrap ──────────────────────────────────────────────────────────────────
load_dotenv()

app = Flask(__name__)
CORS(app, origins=["http://localhost:3000"])  # Adjust for production

# Firebase Admin SDK  (uses service-account JSON, NOT the web SDK)
if not firebase_admin._apps:
    cred = credentials.Certificate(
        os.getenv("FIREBASE_SERVICE_ACCOUNT_PATH", "serviceAccountKey.json")
    )
    firebase_admin.initialize_app(cred)

db = firestore.client()

# Gemini AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY", ""))
gemini_model = genai.GenerativeModel("gemini-1.5-flash")


# ── Helper: sanitize skill_id to Firestore field key ──────────────────────────
def _skill_key(skill_id: str) -> str:
    """Converts 'web-dev' -> 'web_development', keeps others snake_cased."""
    slug_map = {
        "web-dev": "web_development",
        "python": "python_automation",
        "data": "data_analysis",
        "ai": "ai_engineering",
        "cyber": "cyber_security",
        "graphic-design": "graphic_design",
        "video-editing": "video_editing",
        "social-media": "social_media",
        "content-writing": "content_writing",
        "digital-marketing": "digital_marketing",
        "technical-writing": "technical_writing",
    }
    return slug_map.get(skill_id, skill_id.replace("-", "_"))


# ══════════════════════════════════════════════════════════════════════════════
# 1.  GET /api/progress/<user_id>/<skill_id>
#     Fetches the user's current progress for a specific skill from Firestore.
#     Document path:  users/{user_id}/skills/{skill_key}
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/api/progress/<user_id>/<skill_id>", methods=["GET"])
def get_skill_progress(user_id: str, skill_id: str):
    """
    Returns the user's progress document for the given skill.
    Creates a default document if one doesn't yet exist.
    """
    key = _skill_key(skill_id)
    doc_ref = db.collection("users").document(user_id).collection("skills").document(key)
    doc = doc_ref.get()

    if doc.exists:
        return jsonify({"status": "ok", "progress": doc.to_dict()}), 200

    # ── First visit: initialise a blank progress record ──────────────────────
    default_progress = {
        "skill_id": key,
        "skill_slug": skill_id,
        "rank": "apprentice",          # apprentice → associate → specialist → professional
        "milestones_completed": 0,
        "milestones_total": 5,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    doc_ref.set(default_progress)
    return jsonify({"status": "initialized", "progress": default_progress}), 201


# ══════════════════════════════════════════════════════════════════════════════
# 2.  POST /api/session/init
#     Creates a new chat_session in Firestore if one doesn't exist for the
#     current user + skill + milestone combination.
#     Document path:  chat_sessions/{session_id}
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/api/session/init", methods=["POST"])
def init_chat_session():
    """
    Body JSON:
        { "user_id": "...", "skill_id": "web-dev", "milestone": "apprentice" }

    Returns the session_id (existing or newly created).
    """
    data = request.get_json(silent=True) or {}
    user_id  = data.get("user_id")
    skill_id = data.get("skill_id")
    milestone = data.get("milestone", "apprentice")

    if not user_id or not skill_id:
        return jsonify({"error": "user_id and skill_id are required"}), 400

    key = _skill_key(skill_id)

    # Check whether an active session already exists for this exact context
    existing = (
        db.collection("chat_sessions")
        .where("user_id", "==", user_id)
        .where("skill_id", "==", key)
        .where("milestone", "==", milestone)
        .where("active", "==", True)
        .limit(1)
        .stream()
    )

    for session in existing:
        return jsonify({"status": "existing", "session_id": session.id}), 200

    # ── No session found → create a fresh one ────────────────────────────────
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "user_id": user_id,
        "skill_id": key,
        "skill_slug": skill_id,
        "milestone": milestone,
        "active": True,
        "messages": [],   # Will be appended by /api/chat
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }
    db.collection("chat_sessions").document(session_id).set(session_data)
    return jsonify({"status": "created", "session_id": session_id}), 201


# ══════════════════════════════════════════════════════════════════════════════
# 3.  POST /api/chat
#     Receives a user message, calls Gemini with a skill-aware system prompt,
#     persists both turns to Firestore, and streams the AI reply back.
#     Body JSON:
#         { "session_id": "...", "user_id": "...", "skill_id": "web-dev",
#           "message": "How do I center a div in CSS?" }
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/api/chat", methods=["POST"])
def chat():
    """
    Sends the user message to Gemini, persists conversation, returns AI reply.
    """
    data = request.get_json(silent=True) or {}
    session_id = data.get("session_id")
    user_id    = data.get("user_id")
    skill_id   = data.get("skill_id", "web-dev")
    user_msg   = data.get("message", "").strip()

    if not session_id or not user_id or not user_msg:
        return jsonify({"error": "session_id, user_id, and message are required"}), 400

    key = _skill_key(skill_id)

    # ── Fetch session to rebuild Gemini history ───────────────────────────────
    session_ref = db.collection("chat_sessions").document(session_id)
    session_doc = session_ref.get()

    if not session_doc.exists:
        return jsonify({"error": "Session not found. Call /api/session/init first."}), 404

    stored = session_doc.to_dict()
    history = stored.get("messages", [])   # list of {role, text} dicts

    # ── Build Gemini conversation history ─────────────────────────────────────
    gemini_history = []
    for turn in history:
        role = "user" if turn["role"] == "user" else "model"
        gemini_history.append({"role": role, "parts": [turn["text"]]})

    # ── System prompt — gives Gemini context about the skill ──────────────────
    system_prompt = (
        f"You are the ARKA AI Instructor — a concise, encouraging, Socratic tutor "
        f"specialising in **{key.replace('_', ' ').title()}**. "
        f"The student is currently at the '{stored.get('milestone', 'apprentice')}' milestone. "
        f"Keep responses under 120 words unless asked to expand. "
        f"Always end with a single actionable next step or a clarifying question."
    )

    # Prepend system prompt as the first user/model pair if history is empty
    if not gemini_history:
        gemini_history = [
            {"role": "user",  "parts": [system_prompt]},
            {"role": "model", "parts": ["Understood. I'm ready to teach!"]},
        ]

    chat_session = gemini_model.start_chat(history=gemini_history)
    response = chat_session.send_message(user_msg)
    ai_reply = response.text.strip()

    # ── Persist both turns to Firestore ───────────────────────────────────────
    now = datetime.now(timezone.utc).isoformat()
    new_messages = history + [
        {"role": "user",  "text": user_msg,  "ts": now},
        {"role": "ai",    "text": ai_reply,  "ts": now},
    ]
    session_ref.update({"messages": new_messages, "updated_at": now})

    return jsonify({"reply": ai_reply, "session_id": session_id}), 200


# ── Entry point ────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, port=5001)
