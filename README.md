# 🎓 EduBot AI — Smart 3D Teacher

<div align="center">
  <p><strong>An advanced, voice-powered 3D AI teacher designed for Indian students (Classes 9-12 and competitive exams like JEE/NEET)</strong></p>
  
  [![Next.js](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![React](https://img.shields.io/badge/React%2019-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
  [![Three.js](https://img.shields.io/badge/Three.js-000000?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
  [![Neo4j](https://img.shields.io/badge/Neo4j-008CC1?style=for-the-badge&logo=neo4j&logoColor=white)](https://neo4j.com/)
  [![Sarvam AI](https://img.shields.io/badge/Sarvam%20AI-FF6B00?style=for-the-badge)](https://www.sarvam.ai/)
</div>

---

## ✨ What is EduBot AI?

**EduBot AI** leverages state-of-the-art conversational AI, 3D character animation, and intelligent knowledge graphs to revolutionize how Indian students learn. It transforms education into an interactive, engaging, and personalized experience.

Students can choose their NCERT subject, ask questions via voice in their native Indian language, scan textbook problems, generate structured notes, view relevant video lessons, and take adaptive quizzes—all guided by an empathetic 3D AI teacher.

---

## 🚀 Key Features

| Feature | Description |
|---------|-------------|
| **🎙️ Voice-First Multilingual Chat** | Speak naturally in any of **10 Indian languages** (Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati, Kannada, Malayalam, Punjabi, or English). Powered by **Sarvam AI** STT & TTS with natural Indian accents. |
| **🎭 3D Avatar Teacher with Live Emotions** | An animated 3D VRM avatar acts as your virtual tutor with realistic **Laughing, Thinking, Sad, Shocked, Waving** animations synced to study context. Includes robust CSS fallback. |
| **📷 Textbook Question Scanner** | Upload or snapshot math/science problems from your textbook. **Tesseract OCR** extracts text and passes it to the teacher for step-by-step solutions. |
| **📝 AI Study Notes Generator** | Instantly generate structured, LaTeX-compatible study notes with Introductions, Formulae, Worked Examples, Common Mistakes, and Summaries. Export as clean PDF. |
| **🧠 Adaptive Quiz Mode** | AI-generated multiple-choice questions matched to your subject and topic with instant feedback and progress tracking. |
| **🕸️ Concept Knowledge Graph** | Visualize relationships between NCERT topics in an interactive **Neo4j** graph. Tracks mastery levels (mastered, weak, unstudied) dynamically. |
| **🎬 Video Lessons Finder** | Automatically finds the highest-rated NCERT explanation videos on **YouTube** for any topic you search. |

---

## 🛠️ Tech Stack

<table>
  <tr>
    <td align="center">
      <img src="https://cdn.worldvectorlogo.com/logos/next-js.svg" width="60" height="60"/><br/>
      <b>Next.js 16</b><br/>
      <sub>Frontend & Backend</sub>
    </td>
    <td align="center">
      <img src="https://cdn.worldvectorlogo.com/logos/react-1.svg" width="60" height="60"/><br/>
      <b>React 19</b><br/>
      <sub>UI Library</sub>
    </td>
    <td align="center">
      <img src="https://cdn.worldvectorlogo.com/logos/three-js.svg" width="60" height="60"/><br/>
      <b>Three.js</b><br/>
      <sub>3D Rendering</sub>
    </td>
    <td align="center">
      <img src="https://cdn.worldvectorlogo.com/logos/neo4j.svg" width="60" height="60"/><br/>
      <b>Neo4j AuraDB</b><br/>
      <sub>Graph Database</sub>
    </td>
  </tr>
  <tr>
    <td align="center">
      <img src="https://www.sarvam.ai/favicon.ico" width="60" height="60"/><br/>
      <b>Sarvam AI</b><br/>
      <sub>Voice & Translation</sub>
    </td>
    <td align="center">
      <img src="https://cdn.worldvectorlogo.com/logos/youtube-3.svg" width="60" height="60"/><br/>
      <b>YouTube API</b><br/>
      <sub>Video Discovery</sub>
    </td>
    <td align="center">
      <img src="https://cdn.worldvectorlogo.com/logos/zustand.svg" width="60" height="60" style="filter: brightness(0) invert(1);"/><br/>
      <b>Zustand</b><br/>
      <sub>State Management</sub>
    </td>
    <td align="center">
      <img src="https://cdn.worldvectorlogo.com/logos/css-3.svg" width="60" height="60"/><br/>
      <b>CSS3</b><br/>
      <sub>Styling & Design</sub>
    </td>
  </tr>
</table>

**Key Technologies:**
- **3D Animation**: Pixiv `@pixiv/three-vrm` (WebGL VRM model loading & skeletal bone interpolation)
- **OCR**: Tesseract for high-fidelity text extraction
- **Design**: Ultra-premium glassmorphism with floating ambient orbs & orange primary theme (`#FF6B00`)

---

## ⚙️ Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- NPM or Yarn

### Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/rtx-exe-666/EduBot.git
cd EduBot
npm install --legacy-peer-deps
```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📚 Documentation

For detailed setup guides, API integration, and troubleshooting, refer to our full documentation (coming soon).

---

## 🤝 Contributing

We welcome contributions from the community! Please feel free to submit issues, fork the repository, and create pull requests.

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Made with ❤️ for Indian students</p>
  <p><a href="https://github.com/rtx-exe-666/EduBot">⭐ Star us on GitHub</a></p>
</div>
