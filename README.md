<div align="center">

# CodeSensei 🎓

### AI-Powered Coding Judge & Mentor

[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Gemini AI](https://img.shields.io/badge/Gemini_AI-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)

</div>

---

## 📸 Demo

<div align="center">

   <img width="1920" height="1080" alt="CodeSensei Screenshot 1" src="https://github.com/user-attachments/assets/bf20e88a-5822-44f1-af6d-a7fa5d48d791" />
   <img width="1920" height="1080" alt="CodeSensei Screenshot 2" src="https://github.com/user-attachments/assets/44678fcb-cced-4cbc-9db9-5db8a17f5a39" />

</div>

---

## 📖 About

**CodeSensei** is an AI-powered coding judge and mentor that combines the rigor of a coding contest platform with the guidance of a personal AI tutor. Powered by Google Gemini AI, it generates industry-relevant coding problems, evaluates your solutions with deep analysis, and provides voice-enabled mentorship — all in your browser.

Whether you're preparing for technical interviews or sharpening your algorithmic skills, CodeSensei adapts to your journey, tracks your progress, and keeps you motivated with streaks and a ranking system.

---

## ✨ Features

- 🤖 **AI Problem Generation** — Industry-relevant coding problems generated on-demand by Gemini AI, tailored to real-world engineering contexts
- ⚖️ **AI Solution Evaluation** — Deep analysis of correctness, time complexity, space complexity, and code cleanliness with actionable feedback
- 🎙️ **Voice-Enabled Sensei** — Audio feedback and hints delivered via the Web Audio API for an immersive mentorship experience
- 💬 **Chat-based Hints** — Ask Sensei for hints at any time without spoiling the full solution
- 📈 **XP & Ranking System** — Track your progress through ranks: Novice → Apprentice → Journeyman → Expert
- 🔥 **Streak Tracking** — Daily coding streak counter to keep you consistently practicing
- 🌐 **Multi-language Support** — Solve problems in Python and more
- ⚡ **Performance Optimized** — `useCallback` and `useMemo` hooks ensure a smooth, lag-free experience

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| **TypeScript** | Type-safe application code |
| **React 19** | UI framework |
| **Google Gemini AI** | Problem generation, evaluation & voice |
| **Web Audio API** | Voice playback for AI Sensei |
| **Vite** | Fast development build tool |
| **lucide-react** | Icon library |
| **localStorage** | Client-side persistence (XP, streaks, stats) |

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- A [Google Gemini API key](https://aistudio.google.com/app/apikey)

### Installation

```bash
git clone https://github.com/abhishekgautam95/CodeSensei.git
cd CodeSensei
npm install
# Add GEMINI_API_KEY to .env
npm run dev
```

Create a `.env` file in the project root:

```env
GEMINI_API_KEY=your_api_key_here
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧠 How It Works

1. **Start a Contest** — Click "New Contest" and Gemini AI generates a fresh, industry-context coding problem for you
2. **Read the Problem** — Review the problem statement, constraints, and examples
3. **Write Your Solution** — Use the built-in code editor with language selection
4. **Ask for Hints** — Chat with Sensei at any point for guided hints without spoilers
5. **Submit** — Submit your solution for AI-powered evaluation
6. **Get Feedback** — Receive detailed feedback on correctness, time & space complexity, and code quality
7. **Hear from Sensei** — Enable voice to hear your AI mentor deliver feedback aloud
8. **Earn XP & Rank Up** — Correct solutions award XP, advance your rank, and extend your streak

---

## ⚡ Performance Optimizations

CodeSensei has been optimized for maximum performance and efficiency:

- ⚡ **React optimizations** using `useCallback` and `useMemo` to prevent unnecessary re-renders
- 🚀 **Fast audio processing** with optimized typed array operations (30-50% faster)
- 💾 **Efficient memory usage** through proper memoization and typed arrays
- 🎯 **Minimal re-renders** with properly memoized event handlers

See [PERFORMANCE.md](PERFORMANCE.md) for a detailed breakdown of all optimizations.

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).

---

## 👤 Author

**Abhishek Gautam**

[![GitHub](https://img.shields.io/badge/GitHub-abhishekgautam95-181717?style=flat&logo=github)](https://github.com/abhishekgautam95)
