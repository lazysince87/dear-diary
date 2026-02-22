# DD: Dear Diary

**The journal that reads between the lines.**

DD: Dear Diary is a relationship safety companion disguised as a cozy, aesthetically warm personal journal. On the surface, it’s a beautifully designed journaling app. Underneath, it uses a **Semantic RAG AI pipeline** to gently identify emotional manipulation patterns (gaslighting, love bombing, DARVO, isolation) and provides profound empathy and resources using a responsive, emotion-aware voice synthesizer.

Built at WiNGHacks 2026.

---

## 📖 Inspiration

Emotional abuse and relationship manipulation are often completely invisible. Unlike physical harm, they leave no visible marks, making them incredibly hard to recognize—especially for the person experiencing them. We realized that many people in unhealthy relationships (romantic, familial, or professional) don't have access to safe, private tools that help them reflect on their reality. Traditional resources like hotlines can feel like too high a barrier, or might not be safe to access openly if a partner is checking their phone.

We created **Dear Diary** to be a relationship safety companion disguised as a cozy personal journal—a tool that feels "like a warm hug," but has the technical power to gently identify red flags, teach users about healthy boundaries, and provide support without blowing their cover.

---

## ✨ Features

- **Semantic Pattern Recognition (RAG):** Users log traditional journal entries or paste conversations. Under the hood, the app analyzes the text for subtle emotional manipulation tactics.
- **Empathetic AI Responses:** It doesn't just flag abuse like a clinical robot. It leads with validation, gently names the manipulation tactic, explains why it is harmful, and provides a reflection question.
- **Emotion-Aware Voice Output:** Using ElevenLabs, the app speaks its responses using a custom-cloned voice of our team. The voice parameters dynamically adjust based on the user's detected distress level—sounding calm and grounding during emergencies, or warm and gentle during normal reflections.
- **Longitudinal Memory:** The AI doesn't have localized amnesia. It remembers your past entries to identify long-term patterns of manipulation across weeks or months.
- **Pattern Library & Resources:** A curated, browsable library of manipulation tactics with definitions, real-world examples, and a dedicated page linking to vetted external resources and hotlines.

---

## 🛠️ Architecture & Tech Stack

We built a mobile-first **React/Vite** frontend utilizing **Tailwind CSS** paired with smooth **GSAP** animations.

The heavy lifting happens in our **Node.js/Express** backend, which is dockerized and deployed to **Google Cloud Run** for auto-scaling. We implemented a **Semantic RAG (Retrieval-Augmented Generation)** pipeline to give our AI long-term memory:
1. We use **Google's `text-embedding-004`** model to turn every journal entry into a 768-dimensional vector coordinate.
2. We store these vectors in a **MongoDB Atlas** database.
3. When a user writes a new entry, we use **Atlas `$vectorSearch`** to instantly retrieve their most semantically relevant past memories. 
4. We inject this context into **Gemini 1.5 Flash**, allowing the LLM to detect long-term emotional abuse patterns rather than just analyzing a single event. 

Finally, the AI's response is passed to the **ElevenLabs API** for dynamic Text-to-Speech generation before returning to the frontend.

### Technology Used

* **Frontend:** React 19, Vite, Tailwind CSS 4, React Router 7, GSAP, Lucide React
* **Backend:** Node.js, Express, Mongoose, Helmet, express-rate-limit
* **AI & Voice:** Google Gemini API (`gemini-1.5-flash`, `text-embedding-004`), ElevenLabs API
* **Database:** MongoDB Atlas (with Atlas Vector Search)
* **Deployment:** Google Cloud Run (Backend), Vercel (Frontend)

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A MongoDB Atlas cluster
- A Google Gemini API key
- An ElevenLabs API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/lazysince87/winghacks-2026.git
cd winghacks-2026
```

2. Install backend dependencies & set up environment:
```bash
cd server
npm install
# Copy .env.example to .env and fill in your keys
cp .env.example .env
```

3. Install frontend dependencies & set up environment:
```bash
cd ../client
npm install
# Copy .env.example to .env and fill in your keys (Supabase)
cp .env.example .env
```

4. Start the development servers:
```bash
# In the server directory
npm run dev

# In the client directory (separate terminal)
npm run dev
```

---

## 🛡️ Security & Deployment

The application is deployed on **Vercel** (Frontend) and **Google Cloud Run** (Backend). API keys (Gemini, ElevenLabs, MongoDB) are strictly stored as environment variables on the Cloud Run backend and are **never** exposed to the client or committed to version control. 

To protect API quotas, the backend employs strict IP-based rate limiting (using `express-rate-limit`) and a 30-second global request timeout to instantly terminate any hung proxy connections.

---

## 🔮 What's Next

If we continue development, our roadmap includes:
- **Advanced UI & Interactive Elements:** Making our interface more intuitive and engaging by adding interactive 3D elements to the website.
- **Clinical-Grade AI Refinement:** Refining our AI agent significantly with advanced prompt engineering and fine-tuning, allowing it to understand human emotions and analyze conversational nuance with the accuracy of a licensed therapist.
- **Advanced RAG Architecture:** Exploring building a **ReAct** agent using **LangChain** and implementing **BM25** (hybrid search) for our RAG pipeline to ensure zero loss of critical user context.
- **Covert Mode:** Allowing the app to instantly reskin itself to look like an unrelated productivity or recipe app to ensure total safety for survivors whose devices might be monitored.

---

*Made with ♥️（ﾉ´∀`） by the DD Team*