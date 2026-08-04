# 🤖 AI Chatbot — Simple & Modern AI Chatbot

A production-ready, lightweight, full-stack AI chatbot web application built with **HTML5, CSS3, Vanilla JavaScript**, and a **Node.js Express backend**.

---

## ✨ Features

- 🎨 **Modern Glassmorphic UI**: HSL dark/light modes with fluid transitions, custom scrollbars, and vibrant accents.
- 💬 **Interactive Chat Experience**: Rounded chat bubbles, markdown syntax rendering, auto-scrolling, character counter, and message timestamps.
- 🔒 **Secure Server-side API**: Keeps API secret keys on the Express server; never exposes secrets to frontend code.
- ⚡ **Rate Limiting & Validation**: Built-in backend rate limiting (`express-rate-limit`) to prevent API abuse.
- 🎙️ **Speech-to-Text (Voice Input)**: Speak directly into your microphone using the Web Speech API.
- 🔊 **Text-to-Speech (Read Aloud)**: Optional automatic or on-demand audio read-aloud of AI responses.
- 🤖 **Model Selector**: Switch dynamically between models (Gemini 3.5 Flash-Lite, Gemini 3.1 Flash-Lite).
- 📋 **Extra Utilities**: Copy message to clipboard, retry last prompt, clear chat history, and export conversation to `.txt`.

---

## 📁 Project Folder Structure

```
Web/
├── client/
│   ├── index.html        # Main HTML structure & semantic elements
│   ├── style.css         # Custom CSS tokens, glassmorphism, animations & dark/light theme
│   └── script.js         # ES6 Frontend logic, API fetch, Speech API & state management
├── server/
│   ├── server.js         # Express server entry point, CORS, rate-limiter & static serving
│   ├── routes/
│   │   └── chat.js       # /api/chat endpoint validation & routing
│   └── services/
│       └── aiService.js  # Service layer for Google Gemini & OpenAI API integration
├── .env.example          # Environment variables template
├── package.json          # Node.js project manifest & script commands
└── README.md             # Complete setup, running, and deployment guide
```

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) v18+ installed on your machine.
- A free Google Gemini API key from [Google AI Studio](https://aistudio.google.com/).

### 2. Installation
Clone or navigate to the project directory, then install dependencies:

```bash
npm install
```

### 3. Environment Setup
Copy `.env.example` to create your local `.env` configuration file:

```bash
cp .env.example server/.env
```

Open `server/.env` and add your secret API key:

```env
PORT=3000
ALLOWED_ORIGINS=*
GEMINI_API_KEY=your_actual_gemini_api_key_here
DEFAULT_MODEL=gemini-2.5-flash
```

### 4. Running Locally

#### Development Mode (with auto-reload):
```bash
npm run dev
```

#### Production Mode:
```bash
npm start
```

Once started, open your browser and navigate to:
```
http://localhost:3000
```

---

## 📡 API Endpoint Reference

### `POST /api/chat`
Sends user prompt to AI provider and returns structured JSON response.

**Request Body:**
```json
{
  "prompt": "Explain quantum computing in simple terms.",
  "model": "gemini-2.5-flash",
  "history": []
}
```

**Success Response (200 OK):**
```json
{
  "success": true,
  "message": "Quantum computing uses qubits...",
  "model": "gemini-2.5-flash",
  "timestamp": "2026-07-29T22:20:00.000Z"
}
```

**Error Response (400 / 500):**
```json
{
  "success": false,
  "error": "Validation Error: Message cannot be empty."
}
```

---

## 🌐 Deployment Instructions

### Option A: Full-Stack Single-Server Deployment (Render / Railway)

Because Express serves the static files inside `/client`, you can deploy the entire app as a single service:

#### 1. Deploying to **Render**
1. Push your codebase to a GitHub repository.
2. Sign in to [Render](https://render.com/) and click **New +** -> **Web Service**.
3. Connect your repository.
4. Set the following settings:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: Your Google Gemini API Key
   - `NODE_ENV`: `production`
6. Click **Create Web Service**.

#### 2. Deploying to **Railway**
1. Sign in to [Railway.app](https://railway.app/).
2. Create a **New Project** -> **Deploy from GitHub repo**.
3. Add environment variable `GEMINI_API_KEY` under Variables tab.
4. Railway automatically detects `package.json` and runs `npm start`.

---

### Option B: Decoupled Deployment (Frontend on Vercel/Netlify + Backend on Render)

If you prefer deploying the frontend separately:

#### 1. Deploy Frontend to **Vercel**
1. Import your repository into [Vercel](https://vercel.com/).
2. Set Root Directory to `client`.
3. In `client/script.js`, update the API fetch endpoint to point to your live backend domain:
   ```javascript
   const response = await fetch('https://your-backend-service.onrender.com/api/chat', { ... });
   ```
4. Click **Deploy**.

#### 2. Deploy Frontend to **Netlify**
1. Drag and drop the `client/` folder into [Netlify Drop](https://app.netlify.com/drop) or import from GitHub.
2. Ensure your backend server's `ALLOWED_ORIGINS` in `.env` includes your Netlify domain for CORS security.

---

## 🛡️ Security & Performance Highlights

- 🔑 **Zero Key Exposure**: Client never holds API keys. All credentials reside strictly in server environment variables.
- ⏳ **Rate Limiting**: Configured with `express-rate-limit` (30 requests/minute per IP).
- 🧹 **Sanitized Input**: Validates type, presence, and limits prompt text length to 4000 characters.
- 📱 **Mobile First**: Built with flexible CSS Grid/Flexbox for seamless touch & desktop experience.

---

## 📄 License
This project is open-source under the MIT License.
