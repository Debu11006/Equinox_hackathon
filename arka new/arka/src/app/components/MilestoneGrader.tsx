'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Play, CheckCircle2, XCircle, Loader2, Code, Trophy } from 'lucide-react';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';

declare global {
  interface Window {
    loadPyodide?: (opts: { indexURL: string }) => Promise<any>;
    _pyodideInstance?: any;
  }
}

// ── Python test suites (appended after user code) ─────────────────────────────
const PYTHON_TESTS: Record<string, string> = {
  default: `
assert callable(my_function), "my_function must be defined"
assert my_function(2) == 4,   "my_function(2) should return 4"
assert my_function(0) == 0,   "my_function(0) should return 0"
assert my_function(5) == 10,  "my_function(5) should return 10"
print("All tests passed ✅")
`,
  python: `
assert callable(my_function), "my_function must be defined"
assert my_function(3) == 9,   "my_function(3) should return 9"
print("All tests passed ✅")
`,
};

// ── Web dev tests: inline test script injected into the iframe ────────────────
// The script runs inside the iframe and posts {arkaResult:'pass'|'fail', reason?} to parent.
const WEBDEV_TESTS: Record<string, { starter: string; testScript: string; hint: string }> = {
  default: {
    starter: `<!DOCTYPE html>
<html>
<head>
<style>
  #target { background-color: blue; width: 100px; height: 100px; }
</style>
</head>
<body>
  <div id="target"></div>
</body>
</html>`,
    testScript: `
      var el = document.getElementById('target');
      if (!el) {
        parent.postMessage({ arkaResult: 'fail', reason: 'No element with id="target" found.' }, '*');
      } else {
        var bg = getComputedStyle(el).backgroundColor;
        if (bg === 'rgb(0, 0, 255)') {
          parent.postMessage({ arkaResult: 'pass' }, '*');
        } else {
          parent.postMessage({ arkaResult: 'fail', reason: 'Expected blue background, got: ' + bg }, '*');
        }
      }
    `,
    hint: 'Create a <div id="target"> with background-color: blue.',
  },
  'web-dev': {
    starter: `<!DOCTYPE html>
<html>
<head><title>My Page</title></head>
<body>
  <nav id="main-nav"></nav>
  <h1 id="hero">Hello World</h1>
</body>
</html>`,
    testScript: `
      var nav = document.getElementById('main-nav');
      var hero = document.getElementById('hero');
      if (nav && hero) {
        parent.postMessage({ arkaResult: 'pass' }, '*');
      } else {
        parent.postMessage({ arkaResult: 'fail', reason: 'Missing <nav id="main-nav"> or <h1 id="hero">.' }, '*');
      }
    `,
    hint: 'Page must have <nav id="main-nav"> and <h1 id="hero">.',
  },
};

// ── Pyodide loader (cached on window) ─────────────────────────────────────────
async function getPyodide(): Promise<any> {
  if (window._pyodideInstance) return window._pyodideInstance;
  if (!window.loadPyodide) {
    await new Promise<void>((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js';
      s.onload = () => resolve();
      s.onerror = reject;
      document.head.appendChild(s);
    });
  }
  const pyodide = await window.loadPyodide!({
    indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.25.1/full/',
  });
  window._pyodideInstance = pyodide;
  return pyodide;
}

// ── Component ─────────────────────────────────────────────────────────────────
interface MilestoneGraderProps {
  skillId: string;
  milestoneId: string;
  userId: string;
  skillKey: string;
  /** Called after Firestore write succeeds — lets parent control success UI */
  onSuccess?: () => void;
  /** Reset trigger — increment to reset the grader to idle */
  resetKey?: number;
}

export default function MilestoneGrader({ skillId, milestoneId, userId, skillKey, onSuccess, resetKey = 0 }: MilestoneGraderProps) {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'pass' | 'fail'>('idle');
  const [output, setOutput] = useState('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const isPython = ['python', 'data', 'ai'].includes(skillId);
  const isWebDev = skillId === 'web-dev';

  // Pre-fill starter code — also reset when resetKey changes
  useEffect(() => {
    setStatus('idle');
    setOutput('');
    if (isPython) {
      setCode('def my_function(n):\n    # Write your solution here\n    return n * 2\n');
    } else if (isWebDev) {
      const cfg = WEBDEV_TESTS[skillId] ?? WEBDEV_TESTS.default;
      setCode(cfg.starter);
    } else {
      setCode('# Write your solution here\n');
    }
  }, [skillId, resetKey]);

  // ── Firebase: mark milestone complete in parent skill doc ───────────────
  const handleSuccess = async () => {
    setStatus('pass');
    setOutput('✅ All tests passed! Milestone marked complete.');
    try {
      // Write into the milestones map on the skill document itself.
      // setDoc with merge:true creates the doc if missing — no subcollection needed.
      const skillRef = doc(db, 'users', userId, 'skills', skillKey);
      await setDoc(
        skillRef,
        {
          milestones: {
            [milestoneId]: {
              status: 'completed',
              completedAt: new Date().toISOString(),
            },
          },
        },
        { merge: true }
      );
      // Notify parent — parent will handle success UI transition
      onSuccess?.();
    } catch (err) {
      console.warn('Firestore write failed:', err);
    }
  };

  // ── Python grader via Pyodide ─────────────────────────────────────────────
  const runPythonTests = async () => {
    setStatus('loading');
    setOutput('⏳ Loading Python runtime…');
    try {
      const pyodide = await getPyodide();
      const tests = PYTHON_TESTS[skillId] ?? PYTHON_TESTS.default;
      pyodide.runPython('import sys, io\nsys.stdout = io.StringIO()');
      pyodide.runPython(code + '\n' + tests);
      const stdout: string = pyodide.runPython('sys.stdout.getvalue()');
      setOutput(stdout || '✅ All tests passed!');
      await handleSuccess();
    } catch (err: any) {
      setStatus('fail');
      setOutput(`❌ Tests Failed\n\n${err?.message ?? String(err)}`);
    }
  };

  // ── Web Dev grader via postMessage (avoids cross-origin contentDocument) ──
  const runWebDevTests = () => {
    setStatus('loading');
    setOutput('🔍 Running sandbox tests…');

    const cfg = WEBDEV_TESTS[skillId] ?? WEBDEV_TESTS.default;

    // Inject the test script just before </body> so DOM is ready
    const testTag = `<script>
(function() {
  window.addEventListener('load', function() {
    try {
      ${cfg.testScript}
    } catch(e) {
      parent.postMessage({ arkaResult: 'fail', reason: e.message }, '*');
    }
  });
})();
</script>`;

    const injected = code.includes('</body>')
      ? code.replace('</body>', testTag + '</body>')
      : code + testTag;

    // Listen for the iframe's postMessage result
    let settled = false;
    const onMessage = (e: MessageEvent) => {
      if (!e.data?.arkaResult || settled) return;
      settled = true;
      window.removeEventListener('message', onMessage);

      if (e.data.arkaResult === 'pass') {
        handleSuccess();
      } else {
        setStatus('fail');
        setOutput(`❌ Tests Failed\n\n${e.data.reason ?? cfg.hint}`);
      }
    };
    window.addEventListener('message', onMessage);

    // Write HTML into srcdoc — triggers iframe reload + onload → script fires
    if (iframeRef.current) iframeRef.current.srcdoc = injected;

    // Safety timeout in case script never posts
    setTimeout(() => {
      if (!settled) {
        settled = true;
        window.removeEventListener('message', onMessage);
        setStatus('fail');
        setOutput('❌ Timeout: sandbox did not respond. Check your HTML syntax.');
      }
    }, 8000);
  };

  const runGenericTest = () => {
    setStatus('fail');
    setOutput('⚠️ Auto-grading is not available for this skill type.\nSubmit your files for manual review.');
  };

  const handleRun = () => {
    if (isPython) runPythonTests();
    else if (isWebDev) runWebDevTests();
    else runGenericTest();
  };

  const statusBorder = { idle: 'border-zinc-800', loading: 'border-amber-500/30', pass: 'border-emerald-500/30', fail: 'border-red-500/30' };
  const statusText   = { idle: 'text-zinc-400',   loading: 'text-amber-400',     pass: 'text-emerald-400',     fail: 'text-red-400'     };
  const btnClass = {
    idle:    'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20',
    loading: 'bg-amber-500/10 border-amber-500/30 text-amber-400 opacity-60 cursor-not-allowed',
    pass:    'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 cursor-default',
    fail:    'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20',
  };

  return (
    <div className="flex flex-col h-full gap-3">

      {/* Label — shrink-0 */}
      <div className="flex items-center gap-2 shrink-0">
        <Code className="w-4 h-4 text-zinc-400" />
        <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">
          {isPython ? 'Python' : isWebDev ? 'HTML / CSS / JS' : 'Your Code'}
        </span>
      </div>

      {/* Code textarea — flex-1 min-h-0 so it grows to fill available space */}
      <textarea
        value={code}
        onChange={(e) => setCode(e.target.value)}
        spellCheck={false}
        className="flex-1 min-h-0 w-full bg-[#0A0A0A] border border-zinc-800 text-zinc-100 font-mono text-sm leading-[1.75] rounded-xl p-5 resize-none outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/10 transition-all"
        placeholder={isPython ? '# Write your Python solution here…' : '<!-- Write your HTML here… -->'}
      />

      {/* Run button — shrink-0, always visible */}
      <button
        onClick={handleRun}
        disabled={status === 'loading' || status === 'pass'}
        className={`shrink-0 flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm border transition-all ${btnClass[status]}`}
      >
        {status === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> :
         status === 'pass'    ? <Trophy  className="w-4 h-4" /> :
                                <Play    className="w-4 h-4" />}
        {{ idle: 'Run Tests & Submit', loading: 'Running…', pass: 'Completed ✓', fail: 'Retry' }[status]}
      </button>

      {/* Output console — shrink-0, appears below button */}
      {output && (
        <div className={`shrink-0 bg-[#0A0A0A] border rounded-xl p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto ${statusBorder[status]}`}>
          <div className={`flex items-center gap-2 mb-2 font-bold text-[11px] uppercase tracking-wider ${statusText[status]}`}>
            {status === 'pass' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />}
            {status === 'pass' ? 'Test Output' : 'Test Results'}
          </div>
          {output}
        </div>
      )}

      {/* Hidden sandboxed iframe */}
      <iframe
        ref={iframeRef}
        title="arka-grader-sandbox"
        sandbox="allow-scripts"
        className="hidden"
        aria-hidden="true"
      />
    </div>
  );
}
