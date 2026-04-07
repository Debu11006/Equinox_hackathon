# Equinox Hackathon - Arka Project

Welcome to the Arka Project repository! This project is built using Next.js and Firebase.

## Project Structure

The main application code is located in the nested `arka new/arka` directory. 

## Getting Started

To get the project running locally, follow these steps:

### 1. Prerequisites
Ensure you have [Node.js](https://nodejs.org/) installed on your machine.

### 2. Navigate to the Project Directory
The main Next.js project is inside the `arka new/arka` folder.
Open your terminal and run:
```bash
cd "arka new/arka"
```

### 3. Install Dependencies
Install all the required npm packages:
```bash
npm install
```

### 4. Environment Variables
This project uses Firebase for authentication and database. 
You will need to set up your environment variables to connect to Firebase.
Create a `.env.local` file inside the `arka new/arka` directory (if it doesn't already exist or if you are pulling fresh from GitHub) and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```
*(Ask your teammate for the correct values if you don't have them).*

### 5. Run the Development Server
Start the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Version Control

- `node_modules` and environment files (`.env*`) are ignored to prevent uploading massive modules and sensitive keys to GitHub.
- **Do not commit `.env.local`**. It contains secrets that shouldn't be public.


