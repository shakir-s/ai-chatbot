# 🤖 AI Chatbot

A simple, modern, and responsive AI chatbot web application powered by **Google Gemini API** and **Node.js Express**.

## 🌟 Features

- **Responsive Design**: Auto-aligning layout optimized for mobile, tablet, and desktop screens.
- **Full-Width AI Responses**: Top-aligned sender headers allowing maximum space for generated text and code.
- **Code Syntax & Copying**: Styled code blocks with 1-click code copying.
- **Speech Capabilities**: Voice input (Speech-to-Text) and Read Aloud (Text-to-Speech).
- **Dark & Light Mode**: HSL color system with smooth theme switching.
- **Chat Utilities**: Export conversation to `.txt`, retry prompts, and clear chat history.
- **Secure Server**: API keys remain safely on the Express backend server.

## 🛠️ Tech Stack

- **Frontend**: HTML5, Vanilla CSS, JavaScript (ES6)
- **Backend**: Node.js, Express.js
- **AI Provider**: Google Gemini API

## 🚀 Quick Start

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure API key**:
   Create `server/.env` file:
   ```env
   PORT=3000
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the application**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Visit `http://localhost:3000`


