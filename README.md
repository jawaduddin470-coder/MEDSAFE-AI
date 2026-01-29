# AI-Based Early Medication Error and Risk Awareness System

A professional MedTech hackathon project designed to prevent medication errors through AI-based awareness and interaction checking.

## 🚀 Features
- **AI Risk Analysis**: Instantly checks for harmful drug interactions (e.g., Aspirin + Warfarin).
- **Medication Tracking**: Manage prescriptions, dosage, and frequency.
- **Family Profiles**: Monitor safety for dependents (Elderly parents, children).
- **Subscription System**: tiered access for advanced features.
- **Senior-Friendly UI**: High contrast, large text, and clear warnings.

## 🛠 Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js, MongoDB (Mongoose)
- **Auth**: JWT (JSON Web Tokens)

## 📦 Installation
Prerequisites: Node.js and MongoDB installed locally.

### 1. Backend Setup
```bash
cd medtech-app/server
npm install
# Create .env file based on .env.example
npm start
```
*Server runs on port 5001 by default.*

### 2. Frontend Setup
```bash
cd medtech-app/client
npm install
npm run dev
```
*Frontend runs on port 5173.*

## 🧪 Testing the AI Engine
To verify the risk analysis:
1. Register a new account.
2. Add **Aspirin** (100mg).
3. Add **Warfarin** (5mg).
4. Go to "Check Risks" and click Analyze. > **Result: HIGH RISK Alert**.

## ⚠️ Disclaimer
This is an assistive tool for awareness only. It does NOT provide medical diagnosis or treatment.
