# Auto Intake Platform

<p align="center">
  <img src="https://www.datocms-assets.com/96965/1683539914-logo.svg" alt="Deepgram Logo" width="120"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://cloudinary-res.cloudinary.com/image/upload/c_scale,dpr_2.0,q_auto,w_120/cloudinary_logo_for_white_bg.svg" alt="Cloudinary Logo" width="120"/>
  &nbsp;&nbsp;&nbsp;
  <img src="https://d1z9ara1acwrvo.cloudfront.net/assets/logo/clio-logo-99c8fde363d56f656c7c6687b29ae8f04fa76ee4a65fe66757008097b0cc17b6.svg" alt="Clio Logo" width="120"/>
</p>



## 📝 Project Goal

This project aims to build an AI-enhanced web application that streamlines **customer intake** for automotive businesses (mechanics, service centers, dealerships). It leverages **voice-to-text**, **AI validation**, and **automated summaries** to create a seamless and efficient intake process.

## 🏗️ Core Architecture

The platform is built with a modern web stack, integrating AI capabilities for intelligent processing:

-   **Frontend**: React + Tailwind CSS
-   **Backend**: Node.js + Express
-   **Database**: MongoDB (Cloud or Local)
-   **AI Model**: GPT-4 Turbo (OpenAI) or Gemini Pro (Google)
-   **Voice Transcription**: Whisper (OpenAI) or alternatives (e.g., Deepgram, VOSK)
-   **Optional Tools**: Twilio (for calls), SendGrid (for emails), Zapier (for automation), Clio (for legal practice management integration)

## ✨ MVP Features

1.  **AI-Powered Voice Bot**
    -   Captures customer voice via browser.
    -   Transcribes input and feeds into AI.
    -   Validates intent and classifies service type.

2.  **Dynamic Intake Form**
    -   Adjusts fields based on customer input.
    -   Provides real-time error detection and suggestions.

3.  **AI Summarization**
    -   Generates human-readable summaries of intake data.
    -   Optional: Automated email or webhook delivery of summaries.

4.  **Admin Dashboard**
    -   Allows administrators to view and manage submissions.
    -   Includes role-based access control.

## 📦 Tech Stack

| Layer         | Stack                               |
| :------------ | :---------------------------------- |
| Frontend      | React, Tailwind CSS, React Hook Form |
| Backend       | Express.js, Node.js, JWT            |
| Database      | MongoDB (via Mongoose)              |
| AI Models     | OpenAI GPT-4 / Google Gemini Pro    |
| Transcription | Whisper / Deepgram / VOSK           |
| Storage       | Cloudinary                          |
| CRM/LPM       | Clio                                |

## 🚀 Getting Started

Follow these steps to set up and run the project locally.

### 🔐 Environment Variables

Create a `.env` file in the `backend/` directory and populate it with the following environment variables:

```env
# If using Gemini
GEMINI_API_KEY=your_gemini_api_key

# If using OpenAI
OPENAI_API_KEY=your_openai_key

# MongoDB Connection URI
MONGO_URI=mongodb://127.0.0.1:27017/intake_app

# JWT Secret for authentication
JWT_SECRET=your_jwt_secret

# Twilio (if used for calls)
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
SERVER_URL=http://localhost:5000 # Your backend server URL

# Deepgram (if used for transcription)
DEEPGRAM_API_KEY=your_deepgram_api_key

# Email (if using SendGrid or similar)
EMAIL_SERVICE_PROVIDER=SendGrid # e.g., SendGrid, Gmail
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass
ATTORNEY_EMAIL=attorney@example.com # Email to send intake summaries to
```

### 💻 Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/your-username/auto-intake-platform.git
    cd auto-intake-platform
    ```

2.  **Install Backend Dependencies:**

    ```bash
    cd backend
    npm install
    ```

3.  **Install Frontend Dependencies:**

    ```bash
    cd ../frontend
    npm install
    ```

### ▶️ Running the Application

1.  **Start the Backend Server:**

    ```bash
    cd backend
    npm start
    ```

2.  **Start the Frontend Development Server:**

    ```bash
    cd frontend
    npm run dev
    ```

    The frontend application should now be running at `http://localhost:5173` (or another port if 5173 is in use).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/your-feature-name`).
3.  Make your changes.
4.  Commit your changes (`git commit -m 'feat: Add new feature'`).
5.  Push to the branch (`git push origin feature/your-feature-name`).
6.  Open a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
