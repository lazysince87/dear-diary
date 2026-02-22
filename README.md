# Dear Diary

**A mobile-first relationship safety companion disguised as a personal journal.**

Dear Diary is a web application built to help users identify emotional manipulation patterns -- such as gaslighting, love bombing, D.A.R.V.O., and isolation tactics -- across all types of relationships, including romantic, familial, platonic, and professional. It presents itself as a cozy, warm journaling app so that it remains safe and inconspicuous for users in vulnerable situations.

Built at WiNGHacks 2026.

---

## Table of Contents

- [Problem Statement](#problem-statement)
- [Our Approach](#our-approach)
- [Educational Mission](#educational-mission)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Deployment](#deployment)
- [License](#license)

---

## Problem Statement

Emotional abuse and manipulation are often invisible. Unlike physical harm, they leave no visible marks, making them harder to recognize -- especially for the person experiencing them. Many people in unhealthy relationships do not have access to safe, private tools that help them reflect on what they are going through. Traditional resources like hotlines or counseling may feel too high a barrier, or may not be safe to access openly.

## Our Approach

Dear Diary bridges that gap. On the surface, it looks and feels like a personal diary app -- warm colors, rounded corners, a comforting tone. Underneath, it uses AI-powered analysis to gently identify red flags in user-submitted journal entries and pasted conversations. The response always leads with empathy, then names any identified tactic, explains why it is harmful, and offers a reflection question to encourage self-awareness.

The app is designed so that anyone looking over a user's shoulder would see nothing more than a personal journaling tool.

## Educational Mission

Dear Diary is built with a strong educational focus. The goal is not just to detect red flags, but to **teach users what healthy and unhealthy relationship behaviors look like** across all types of relationships:

- **Pattern Library**: A curated, browsable library of manipulation tactics (gaslighting, love bombing, minimizing, D.A.R.V.O., isolation, and more) with clear definitions, real-world examples, and guidance on healthy alternatives.
- **Contextual Learning**: When the AI identifies a pattern in a journal entry, it does not simply flag it. It provides a plain-language explanation of the tactic, why it is harmful, and how healthy communication differs -- turning every interaction into a learning moment.
- **Reflection Prompts**: Each AI response ends with a reflection question designed to build critical thinking about relationship dynamics.
- **Resource Hub**: A dedicated page linking to vetted external resources, hotlines, and educational material on relationship health and safety.

The app serves as both a personal safety tool and an ongoing educational resource, helping users build the vocabulary and awareness needed to recognize manipulation in any relationship context.

---

## Features

**Core (MVP)**

- Text-based journaling with AI-powered analysis of entries and pasted conversations
- Structured, empathetic responses that identify manipulation tactics with explanations
- Browsable pattern library of common emotional manipulation tactics
- Resource page with links to support organizations and educational material
- Mobile-first, responsive design with a warm and approachable UI
- Secure backend routing so that API keys are never exposed on the client

**Stretch Goals**

- Voice input and output via ElevenLabs for accessibility
- Covert Mode toggle that instantly reskins the app to look like an unrelated application for user safety
- Code Phrase System that silently contacts an emergency contact when a specific phrase is entered
- Longitudinal analysis across multiple journal entries to detect patterns over time

---

## Tech Stack

### Frontend

| Technology | Purpose |
|---|---|
| React 19 | UI component framework |
| Vite 7 | Build tool and development server |
| Tailwind CSS 4 | Utility-first CSS framework for styling |
| React Router 7 | Client-side routing and navigation |
| Lucide React | Icon library |

### Backend

| Technology | Purpose |
|---|---|
| Node.js | Server runtime |
| Express 5 | HTTP server and API routing |
| Mongoose 9 | MongoDB object modeling and data layer |
| Helmet | HTTP security headers |
| CORS | Cross-origin resource sharing middleware |
| Multer | File/audio upload handling |
| dotenv | Environment variable management |

### AI and APIs

| Technology | Purpose |
|---|---|
| Google Gemini API | Core AI engine for analyzing journal entries and identifying manipulation patterns |
| ElevenLabs API | Speech-to-text and text-to-speech for voice accessibility (stretch goal) |

### Database

| Technology | Purpose |
|---|---|
| MongoDB Atlas | Cloud-hosted database for storing journal entries, pattern library data, and session information |

### Deployment

| Technology | Purpose |
|---|---|
| DigitalOcean App Platform | Cloud hosting for the backend server and static frontend |

---

## Project Structure

```
dear-diary/
  client/                  # Frontend React application
    src/
      components/          # Reusable UI components
      context/             # React context providers
      pages/               # Page-level components
      services/            # API service layer
      index.css            # Global styles
      App.jsx              # Root application component
      main.jsx             # Application entry point
    index.html             # HTML shell
    vite.config.js         # Vite configuration
    package.json
  server/                  # Backend Node.js application
    src/
      middleware/           # Express middleware
      models/              # Mongoose data models
      routes/              # API route handlers
      services/            # Business logic and API integrations
    server.js              # Server entry point
    package.json
  README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm
- A MongoDB Atlas cluster
- A Google Gemini API key
- (Optional) An ElevenLabs API key

### Installation

1. Clone the repository:

```bash
git clone https://github.com/lazysince87/winghacks-2026.git
cd winghacks-2026
```

2. Install backend dependencies:

```bash
cd server
npm install
```

3. Install frontend dependencies:

```bash
cd ../client
npm install
```

4. Set up environment variables (see below).

5. Start the development servers:

```bash
# In the server directory
npm run dev

# In the client directory (separate terminal)
npm run dev
```

---

## Environment Variables

Create a `.env` file in the `server/` directory based on `.env.example`. The following variables are required:

| Variable | Description |
|---|---|
| `PORT` | Port for the Express server (default: 3001) |
| `MONGODB_URI` | Connection string for MongoDB Atlas |
| `GEMINI_API_KEY` | API key for Google Gemini |
| `ELEVENLABS_API_KEY` | API key for ElevenLabs (optional) |
| `CLIENT_URL` | URL of the frontend for CORS configuration |

---

## Deployment

The application is configured for deployment on DigitalOcean App Platform. The `.do/` directory contains the necessary deployment configuration. The backend serves the API and the frontend is deployed as a static site.

---

## License

This project was built at WiNGHacks 2026.