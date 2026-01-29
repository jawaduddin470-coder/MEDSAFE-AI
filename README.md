# MedSafe AI - AI-Based Medication Error & Risk Awareness System

A professional MedTech platform designed to prevent medication errors through AI-powered risk analysis, family profiles, and modern UX design.

---

## 👨‍💻 About the Developer
**Name:** Mohammed Meraj Uddin  
**Role:** First-Year Engineering Student  
**Context:** This is my first real-world full-stack project, built to solve medication safety awareness challenges using the MERN stack.

---

## 🚀 Key Features
- **🌓 Theme Switching**: Seamless transition between light and dark modes with system preference detection.
- **🤖 AI Assistant**: Intelligent chatbot for medication safety awareness and regimen understanding.
- **🛡️ Risk Analysis**: Instantly checks for harmful drug interactions (e.g., Aspirin + Warfarin).
- **📋 Medication Tracking**: Manage prescriptions, dosage, frequency, and timing.
- **👨‍👩‍👧‍👦 Family Profiles**: Monitor safety for dependents (Elderly parents, children).
- **🎬 UX/UI**: Smooth page transitions, hover animations, and fully responsive layout.

---

## 🛠 Tech Stack
- **Frontend**: React (Vite 5), Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: OpenAI (via OpenRouter API)
- **State Management**: React Context API
- **Auth**: JWT (JSON Web Tokens)

---

## 🌍 Global Deployment Guide

### 1. Backend (Hosted on Render.com)
1. **Repository**: Push this code to your GitHub.
2. **Setup**: Create a new Web Service on Render and link your repository.
4. **Build Settings**:
   - **Root Directory**: `server`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. **Environment Variables**:
   - `MONGO_URI`: Your MongoDB Atlas connection string.
   - `JWT_SECRET`: A secure random string.
   - `OPENAI_API_KEY`: Your OpenRouter/OpenAI key.
   - `NODE_ENV`: `production`

### 2. Frontend (Hosted on Vercel.com)
1. **Link Repo**: Import your repo into Vercel.
2. **Configure Project**:
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_API_URL`: The URL of your **hosted Render backend** (e.g., `https://medsafe-api.onrender.com`).

---

## 🧪 Local Setup
1. **Install Dependencies**: `npm install` in both `client` and `server` folders.
2. **Environment**: Create `.env` files based on `.env.example`.
3. **Run Backend**: `cd server && npm run dev` (Port 5001).
4. **Run Frontend**: `cd client && npm run dev` (Port 5173).

---

## ⚠️ Disclaimer
MedSafe AI is an assistive tool for educational awareness only. It does NOT provide medical diagnosis or treatment. Always consult a healthcare professional.
