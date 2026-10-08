# 🧠 Athena AI

Athena AI is a full-stack AI-powered mental wellness and productivity platform built under the **HealthTech** category during a 24-hour hackathon.

The system combines conversational AI, structured journaling, task management, calendar scheduling, and cognitive organization tools to help users improve mental clarity and daily well-being.

🏆 Top 5 Finalist — Protothon 2K25 (HealthTech Track)

---

## 📌 Problem Statement

Students and young professionals face:

- Cognitive overload
- Unstructured thoughts
- Poor routine consistency
- Limited access to structured mental wellness tools

Most solutions are fragmented across journaling apps, task managers, and chatbots.

There is no unified, AI-assisted HealthTech platform that integrates mental reflection with daily execution planning.

---

## 💡 Solution

Athena AI provides:

- AI-guided conversational support
- Structured journaling for thought clarity
- Task management for routine building
- Calendar scheduling
- Mind mapping for idea organization

It converts unstructured thoughts into structured action plans.

---

## 🏗 System Architecture

High-Level Flow:

User  
→ React Frontend (Vite)  
→ Node.js API Layer  
→ Python AI Service  
→ Processed Response to Frontend  

Firebase manages authentication and user sessions.

---

## 🛠 Tech Stack

Frontend:
- React (Vite)
- TailwindCSS
- Firebase Authentication

Backend:
- Node.js (API Layer)
- Python (AI Processing Service)

Tooling:
- ESLint
- PostCSS
- Vite

---

## 📂 Project Structure

.
├── client/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── config/        # Firebase Auth init
│   │   ├── features/      # conversations, tasks, notes, calendar, mindmap
│   │   ├── pages/         # login, profile, settings, code-editor, feedback
│   │   ├── components/    # shared UI
│   │   ├── services/      # API clients
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   ├── index.css
│   │   └── App.css
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── vite.config.js
│
├── server/
│   ├── src/           # app.js, server.js, config, routes, controllers, services, middleware, utils
│   ├── scripts/
│   └── server.py
│
├── package.json
└── README.md

---

## 🔑 Core Features

- AI-powered mental wellness chat
- Structured journaling interface
- Daily task management
- Calendar scheduling
- Visual mind mapping
- Code editor module
- User authentication and profile system
- Notification and smart interaction controls

---

## ⚙️ Installation & Setup

1. Clone the repository

git clone https://github.com/your-username/athena-ai.git  
cd athena-ai

2. Setup Frontend

cd client  
npm install  
npm run dev  

Runs on:  
http://localhost:5173

3. Setup Node Backend

cd server  
npm install  
npm start  

4. Setup Python AI Service

cd server  
pip install -r requirements.txt  
python server.py  

Ensure Python 3.9+ is installed.

---

## 🔐 Environment Variables

Create `.env` files where required.

Frontend (.env inside client/)

VITE_FIREBASE_API_KEY=  
VITE_FIREBASE_AUTH_DOMAIN=  
VITE_FIREBASE_PROJECT_ID=  

Backend (.env inside server/)

PORT=5000  
OPENAI_API_KEY=  

Do not commit `.env` files.

---

## ⚠ HealthTech Disclaimer

Athena AI is a digital mental wellness support tool.  
It is not a diagnostic system and does not replace professional medical or psychological care.

---

## 🚧 Current Limitations

- Prototype-level implementation
- Limited AI personalization
- No long-term behavioral analytics
- Not production-scaled

---

## 🔮 Future Improvements

- Emotion trend detection
- AI fine-tuning for personalization
- Secure cloud deployment
- Clinical collaboration features
- Mobile application release

---

## 🏆 Hackathon Details

Event: Protothon 2K25  
Track: HealthTech  
Duration: 24 Hours  
Achievement: Top 5 Finalist  

---

## 👥 Team

- Sai Prashanth M  
- Sree Anirudh Alwar
- Suriya  
