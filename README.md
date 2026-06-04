# 🎓 EduBot AI — Smart 3D Teacher

**EduBot AI** is an advanced, voice-powered 3D AI teacher designed for Indian students (Classes 9-12 and competitive exams like JEE/NEET). It leverages state-of-the-art conversational AI, 3D character animation, and graph databases to make learning interactive, personalized, and multilingual.

Students can choose their NCERT subject, ask questions via voice in their native Indian language, scan textbook problems, generate structured notes, view relevant video lessons, and take adaptive quizzes to track their progress.

---

## 🚀 Key Features

* **🎙️ Voice-First Multilingual Chat (Sarvam AI)**:
  * Speak naturally to EduBot in any of **10 Indian languages** (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, or English).
  * Speech-to-Text (Sarvam STT) converts your voice into text, and the AI translates it to answer in a custom blend of English and the native language (Hinglish/Tanglish).
  * High-quality Text-to-Speech (Sarvam TTS) reads answers aloud with natural Indian accents.
* **🎭 3D Avatar Teacher with Live Emotions**:
  * An animated 3D VRM avatar acts as your virtual tutor.
  * Expresses realistic animations for **Laughing, Thinking, Sad, Shocked, Waving**, and **Conversational gestures** synced with the context of study.
  * Robust holographic 2D CSS fallback if Three.js VRM assets are unavailable.
* **📷 Textbook Question Scanner (Tesseract OCR)**:
  * Upload or snapshot a math/science problem from your textbook.
  * High-fidelity OCR extracts the text and passes it to the teacher for a step-by-step first-principles solution.
* **📝 AI Study Notes Generator (PDF Export)**:
  * Enter any topic to instantly generate structured, LaTeX-compatible study notes (comprising Introductions, Formulae, Worked Examples, Common Mistakes, and Summaries).
  * Export the generated notes as a clean PDF for offline reading.
* **🧠 Adaptive Quiz Mode**:
  * Test your understanding with AI-generated multiple-choice questions matched to your chosen subject and topic.
  * Interactive answers with instant feedback and progress recording.
* **🕸️ Concept Knowledge Graph (Neo4j)**:
  * Visualize relationships between NCERT topics and key concepts in an interactive graph layout.
  * Tracks and highlights student mastery levels (mastered, weak, unstudied) dynamically.
* **🎬 Video Lessons Finder (YouTube API)**:
  * Finds the highest-rated NCERT explanation videos on YouTube for any topic you search.

---

## 🛠️ The Tech Stack

1. **Frontend & Backend**: Next.js 16 (App Router, React 19)
2. **3D Rendering**: Three.js & Pixiv `@pixiv/three-vrm` (WebGL VRM model loading & skeletal bone interpolation)
3. **Graph Database**: Neo4j AuraDB (Curriculum mapping & student progress logging)
4. **AI APIs**:
   * **Sarvam AI**: Speech-to-Text (STT), translation, and Text-to-Speech (TTS)
   * **YouTube Data API v3**: Contextual NCERT videos matching topics
5. **State Management**: Zustand
6. **Styling**: Vanilla CSS3 (Custom design system featuring ultra-premium glassmorphism, floating ambient orbs, and orange primary theme tokens `#FF6B00`)

---

## ⚙️ Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- NPM or Yarn

### 2. Installation
Clone the repository and install the dependencies:
```bash
git clone https://github.com/rtx-exe-666/EduBot.git
cd EduBot
npm install --legacy-peer-deps
```

### 3. Environment Variables Setup
Create a `.env.local` file in the root folder and add the following keys:
```env
# Sarvam AI API Key
SARVAM_API_KEY=your_sarvam_api_key_here

# YouTube Data API v3 Key
YOUTUBE_API_KEY=your_youtube_api_key_here

# Neo4j Aura DB Credentials
NEO4J_URI=neo4j+s://your-database-id.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_neo4j_password_here

# Public path to load the VRM avatar
NEXT_PUBLIC_EDUBOT_RPM_AVATAR_URL=/avatar.vrm
```

### 4. Database Seeding
To automatically populate your Neo4j instance with the default NCERT subject/topic hierarchy, run the application and navigate to:
```
http://localhost:3000/api/seed
```
This Cypher script creates the subject and topic nodes and prerequisite relationships.

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
