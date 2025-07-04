# 🚗 Auto Intake Platform – AI-Powered Customer Intake System

## 🧩 Project Goal
To build an AI-enhanced web app that streamlines **customer intake** for automotive businesses (mechanics, service centers, dealerships) using **voice-to-text**, **AI validation**, and **automated summaries**.

---

## 🏗️ Core Architecture
- **Frontend**: React + Tailwind CSS
- **Backend**: Node.js + Express
- **Database**: MongoDB (Cloud or Local)
- **AI Model**: GPT-4 Turbo (OpenAI) or Gemini Pro (Google)
- **Voice Transcription**: Whisper (OpenAI) or alternatives (e.g. Deepgram, VOSK)
- **Optional Tools**: Twilio (calls), SendGrid (emails), Zapier (automation)

---

## 🔑 MVP Features
1. **AI-Powered Voice Bot**
   - Captures customer voice via browser
   - Transcribes input and feeds into AI
   - Validates intent + classifies service type

2. **Dynamic Intake Form**
   - Adjusts fields based on customer input
   - Real-time error detection and suggestion

3. **AI Summarization**
   - Generates a human-readable summary
   - Optional: auto-email or webhook delivery

4. **Admin Dashboard**
   - View and manage submissions
   - Role-based access control

---

## 📦 Tech Stack

| Layer        | Stack                       |
|--------------|-----------------------------|
| Frontend     | React, Tailwind, React Hook Form |
| Backend      | Express.js, Node.js, JWT    |
| Database     | MongoDB (via Mongoose)      |
| AI Models    | OpenAI GPT-4 / Gemini Pro   |
| Transcription| Whisper / Deepgram / VOSK   |

---

## 🔐 Environment Variables

```env
# If using Gemini
GEMINI_API_KEY=your_gemini_api_key

# If using OpenAI
OPENAI_API_KEY=your_openai_key

# MongoDB
MONGO_URI=mongodb://127.0.0.1:27017/intake_app

# JWT Secret
JWT_SECRET=your_jwt_secret

