# 🌿 EcoScan AI: Smart Waste Segregation Advisor

**EcoScan AI** is an advanced, high-fidelity waste segregation and environmental sustainability advisor built for the **HACKHAZARDS '26** hackathon. 

It provides users with an instant, intelligent recommendation on how to clean, sort, and properly dispose of everyday waste items. Utilizing state-of-the-art AI and graph-database technologies, EcoScan AI aims to reduce recycling contamination and drive real, measurable reductions in carbon footprints.

---

## 🚀 Key Features

* **🔬 Dual-Mode Intelligent Classification**:
  * **Text Query**: Type any waste item (e.g., "Plastic bottle", "Old laptop").
  * **Multilingual Voice Input (Sarvam STT)**: Speak the item's name naturally in any of 10 supported Indian languages.
  * **Image Upload & Camera Scan**: Upload photos or use the live-feed camera modal (with countdown and camera-flip controls) to visually classify waste items.
* **🕸️ Neo4j Knowledge Graph Integration**:
  * Traversing live relationships between **Waste Items**, **Material Compositions**, **Disposal Paths**, and **Color-coded Bins**.
  * Shows related items in the same category, category item count, and full material breakdown.
  * Features a gorgeous, interactive, animated SVG Knowledge Graph view inside the result card.
* **🌐 Multilingual AI translation & Premium TTS**:
  * Seamless support for **10 Indian languages** (Hindi, Bengali, Marathi, Punjabi, Gujarati, Tamil, Telugu, Kannada, Malayalam, and English).
  * Automatically translates all classification summaries, instructions, and environmental impacts using Sarvam Translate.
  * Provides premium natural-sounding voice read-aloud via Sarvam's Bulbul v2 TTS engine (`anushka` model), with robust browser-level text-to-speech fallback.
* **🌱 Environmental Footprint Tracking**:
  * Dynamically calculates and displays the estimated **grams of CO₂ saved** for proper recycling of the item.
  * Interactive scan history sidebar to persist and review previous scans.

---

## 🛠️ The Tech Stack

EcoScan AI is built using a modern, performant, and high-performance stack:

1. **Frontend & Backend**: [Next.js 15](https://nextjs.org/) (App Router, built with Turbopack for lightning-fast loads)
2. **AI Classification**: [Google Gemini 2.0 Flash API](https://ai.google.dev/) (advanced text and multi-modal image classification)
3. **Graph Database**: [Neo4j AuraDB](https://neo4j.com/cloud/platform/auradb/) (structured waste management ontology and relationship mapping)
4. **Voice & Localization**: [Sarvam AI API Suite](https://www.sarvam.ai/):
   * **Sarvam Saarika v2.5** (Speech-to-Text / STT)
   * **Sarvam Translate** (Multilingual formal translations)
   * **Sarvam Bulbul v2** (Natural Voice Text-to-Speech / TTS)
5. **Styling**: Vanilla CSS3 (Custom design system featuring ultra-premium glassmorphism, glowing orbs, smooth hover states, and dynamic micro-animations)

---

## 📊 Database Schema (Neo4j)

The knowledge graph is modeled with high-integrity nodes and relationships to map the lifecycle of waste items:
* `(:WasteItem)` — Represents specific waste objects (e.g., Plastic Bottle).
* `(:Category)` — Groups waste into Recyclable, Organic, Hazardous, E-Waste, Medical, and General.
* `(:Material)` — Represents physical material compositions (e.g., PET Plastic).
* `(:DisposalMethod)` — Detailed paths of disposal (e.g., Curbside Recycling).
* `(:BinType)` — Direct color-coded containers (e.g., Blue Recycling Bin).

**Relationships**:
* `(:WasteItem)-[:BELONGS_TO]->(:Category)`
* `(:WasteItem)-[:MADE_OF]->(:Material)`
* `(:WasteItem)-[:DISPOSED_VIA]->(:DisposalMethod)`
* `(:DisposalMethod)-[:USES_BIN]->(:BinType)`

---

## ⚙️ Local Setup

### 1. Prerequisites
- [Node.js](https://nodejs.org/) (v18.x or later)
- NPM or Yarn

### 2. Installation
Clone this repository and install the dependencies:
```bash
git clone https://github.com/YOUR_USERNAME/waste-advisor.git
cd waste-advisor
npm install
```

### 3. Environment Variables Setup
Create a `.env.local` file in the root folder and add the following keys:
```env
# Gemini API Key (If left blank, the app will run in high-fidelity Demo Mode)
GEMINI_API_KEY=your_gemini_key_here

# Neo4j Aura Graph Database
NEO4J_URI=neo4j+s://86bcb973.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=jk17a26hzWS8S10f60i6p4pT7LnncQqO7Q-U-sdHsNQ

# Sarvam AI API Credentials
SARVAM_API_KEY=sk_tzp3mmec_z9O6RmIm8MWPLBNaPvJZhmtQ
```

### 4. Database Seeding
To automatically populate your Neo4j instance with the default waste ontology, open your browser and navigate to:
```
http://localhost:3000/api/seed
```
This will run the Cypher scripts and build the knowledge graph instantly.

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## 🌍 Together for a Sustainable Future!
Built with 💚 for **HACKHAZARDS '26**. Let's make circular waste management smart, accessible, and multilingual!
