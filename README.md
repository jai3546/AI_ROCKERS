<div align="center">

  <img src="https://readme-typing-svg.herokuapp.com?color=00ffaa&size=35&width=900&height=80&lines=VidyAI:+Next-Gen+AI+Tutor+%26+Visualizer!"/>

  <h1><b><a href="https://vidyaai-sage.vercel.app/">VidyAI</a></b></h1> 

<p>
  <img src="https://img.shields.io/github/stars/jai3546/AI_ROCKERS?style=for-the-badge&logo=github&color=6C63FF&cacheSeconds=0" alt="Stars"/>
  <img src="https://img.shields.io/github/forks/jai3546/AI_ROCKERS?style=for-the-badge&logo=github&color=7C3AED" alt="Forks"/>
  <img src="https://img.shields.io/github/watchers/jai3546/AI_ROCKERS?style=for-the-badge&logo=github&color=8B5CF6&cacheSeconds=0" alt="Watchers"/>
  <img src="https://img.shields.io/github/license/jai3546/AI_ROCKERS?style=for-the-badge&color=EC4899&cacheSeconds=0" alt="License"/>
  <img src="https://img.shields.io/badge/PRs-Welcome-brightgreen?style=for-the-badge" alt="PRs Welcome"/>
  <img src="https://img.shields.io/badge/Contributors-Welcome-blueviolet?style=for-the-badge" alt="Contributors Welcome"/>
</p>

[![Open Source Love](https://firstcontributions.github.io/open-source-badges/badges/open-source-v1/open-source.svg)](https://github.com/firstcontributions/open-source-badges)

<p><i>Transforming how students learn — one emotion at a time.</i></p>

</div>

---

## Table of Contents

- [About VidyAi](#about-vidyai)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Try It Live](#try-it-live)
- [Folder Structure](#folder-structure)
- [Setup and Installation](#setup-and-installation)
- [Code Guidelines and License](#code-guidelines-and-license)
- [License](LICENSE)
- [Future Roadmap](#future-roadmap)
- [Authors and Support](#authors-and-support)

---

## About VidyAi

VidyAi is a smart learning app that helps students study better by tracking how they feel. 

Usually, online learning platforms show the same static material to everyone, even if they are tired, bored, or confused. VidyAi changes this. It uses your web camera to check if you are paying attention and Google Gemini AI to act as a friendly private tutor. 

### How it works
* **If you are confused**: The built-in AI Tutor steps in to explain the topic in a simpler way.
* **If you get tired or lose focus**: The app suggests taking a short Pomodoro break.
* **If you are bored**: The app introduces interactive daily challenges and quizzes.

### Who is this for
* **Students**: Get a private, helpful study space that adapts to your speed and rewards you with streak points, level-ups, and badges.
* **Teachers and Schools**: Access a central dashboard showing class progress, general focus levels, and alerts if students are tired or struggling.

---

## Key Features

<table>
<tr>
<td width="50%">

### Real-Time Emotion Detection
Tracks facial expressions using your webcam (confusion, fatigue, focus, excitement) to see how you are engaging with the lessons.

### Gaze and Attention Tracking
Measures eye gaze and face position to detect when you look away or lose focus.

### Adaptive Curriculum Paths
Suggests easier or harder content, videos, or questions based on your current focus level.

### Smart Break Suggestions
Prompts you to take a Pomodoro-style rest if it detects you have been studying too long or are getting tired.

</td>
<td width="50%">

### Gemini AI Tutor
An always-online AI chat assistant that answers questions, explains complex concepts, and generates custom study flashcards.

### Multi-Language Voice Control
Supports hands-free voice commands in **English, Hindi, and Telugu** to navigate the app easily.

### Motivational Gamification
Earn XP points, study streaks, and unlock achievement badges as you study.

### School Analytics Dashboard
Gives teachers a complete view of student performance, progress summaries, and engagement logs.

</td>
</tr>
</table>

---

## Adaptive Learning Brain & Concept Visualizations

VidyAi provides an interactive learning dashboard containing the student's cognitive map (represented as an SVG knowledge network graph):

* **Prioritized AI Recommendations**: Positioned prominently at the top of the learning dashboard, highlighting "Next Topics", "Revision Priorities", and "Needs Revision" with accent headers and badges (`⭐ Recommended Next Step`).
* **Interactive Concept Actions**: Click on any concept node to open a beautiful action overlay menu offering single-click options:
  - **📖 Read Notes & Summaries** (filters summaries dashboard to the topic).
  - **🔄 Practice Flashcards** (launches review cards for the concept).
  - **📝 Take Practice Quiz** (starts a concept-specific assessment).
  - **🤖 Ask AI Tutor** (opens the chatbot pre-filled with the concept explanation request).
* **Student-Friendly Vocabulary**: Technical cognitive analytics are translated into student-friendly labels:
  - `"Foundations Deficit"` → `"Needs More Practice"`
  - `"Paths Improving"` → `"Getting Better"`
  - `"Strong Mastery"` → `"Well Learned"`
  - `"Knowledge Gap"` → `"Topic to Review"`
  - `"Weak Concept"` → `"Needs Revision"`
  - `"Learning Deficit"` → `"Learning Area to Improve"`

---

## Tech Stack

* **Frontend Framework**: Next.js 15 (App Router)
* **Code Language**: TypeScript
* **Styling**: Tailwind CSS + Radix UI
* **Animation**: Framer Motion
* **AI Engine**: Google Gemini API SDK
* **Face Tracking**: face-api.js (runs entirely in the browser, no backend server needed)
* **Attention Tracking**: Canvas API / Head pose estimation
* **Voice Navigation**: Web Speech API (runs directly in-browser)
* **Visual Charts**: Recharts

---

## Try It Live

You can access the live, deployed application here:
🔗 **[https://vidyaai-sage.vercel.app/](https://vidyaai-sage.vercel.app/)**

### Testing the App (No Account Required)
On the landing page, click **Try Demo** or **Demo Login**. This allows you to test both portals without creating credentials:
1. **Student Dashboard (Student UX)**: Test webcam tracking, chat with the AI Tutor, practice flashcards, and review voice commands.
2. **School Portal (School User UX)**: View mock analytics, check emotional alerts (e.g. fatigue flags), and test exporting student spreadsheets.

### Demo and Usage Examples
For a full step-by-step gallery of screenshots showing every single screen in action, check out the **[Project Images Catalog](Project%20Images.md)**.

---

## Folder Structure

Here is the complete folder structure of this Next.js 15 App Router codebase:

```
AI_ROCKERS/
├── .github/
│   ├── CODE_OF_CONDUCT.md           # Guidelines for community engagement
│   └── CONTRIBUTING.md              # Instructions for code submission and conventions
├── app/                             # Next.js App Router root layout and portal routes
│   ├── layout.tsx                   # Master global layout
│   ├── page.tsx                     # Core landing portal selector page
│   ├── globals.css                  # Core CSS styles (Tailwind imports & global variables)
│   ├── student-dashboard/
│   │   └── page.tsx                 # Detailed Student Learning interface
│   ├── admin-dashboard/
│   │   └── page.tsx                 # School/Educator Admin Analytics interface
│   ├── student-login/
│   │   └── page.tsx                 # Student credential-free login
│   ├── school-login/
│   │   └── page.tsx                 # Educator / admin portal gate
│   ├── demo-login/
│   │   └── page.tsx                 # Rapid role selection gate
│   └── api/
│       └── match-mentor/
│           └── route.ts             # Mentor matching logic endpoint
├── components/                      # Modular and reusable UI blocks
│   ├── tracking/                    # Webcam & face emotion tracking engines
│   │   ├── face-emotion-detector.tsx
│   │   ├── real-time-emotion-detector.tsx
│   │   ├── motion-tracker.tsx
│   │   ├── floating-emotion-tracker.tsx
│   │   └── webcam-access.tsx
│   ├── motion/                      # Client-side attention/movement sensors
│   │   ├── motion-detector.tsx
│   │   ├── accurate-motion-detector.tsx
│   │   └── floating-motion-tracker.tsx
│   ├── learning/                    # Adaptive study panels and AI tutoring helpers
│   │   ├── ai-tutor-chat.tsx        # Chat wrapper using Gemini API SDK
│   │   ├── ai-quiz-generator.tsx
│   │   ├── ai-flashcard-generator.tsx
│   │   ├── mentor-matching.tsx
│   │   ├── study-summaries.tsx
│   │   └── textbooks.tsx
│   ├── gamification/                # Incentive systems, badges, and levels
│   │   ├── achievement-badge.tsx
│   │   ├── leaderboard.tsx
│   │   ├── daily-challenge.tsx
│   │   └── reward-popup.tsx
│   ├── school/                      # Teacher management layout components
│   │   ├── student-management.tsx
│   │   └── weekly-progress.tsx
│   ├── reviews/                     # User review cards & ratings sections
│   ├── auth/                        # Login templates
│   ├── ui/                          # Custom primitive widgets (Radix + Tailwind)
│   ├── emotion-status-indicator.tsx # Real-time state indicators
│   ├── voice-command.tsx            # Multi-lingual speech synthesis navigation
│   ├── language-selector.tsx        # Portal translator selectors
│   └── theme-toggle.tsx             # Dark/Light selector
├── services/                        # Integrations and core business rules
│   ├── gemini-api.ts                # Gemini API integration service
│   ├── learning-style-service.ts    # Learning style profiles calculations
│   └── school-portal-service.ts     # Educator metrics data storage synchronization
├── data/                            # Static asset databases & JSON mock sources
│   ├── flashcards.ts
│   ├── quiz-questions.ts
│   ├── summaries.ts
│   ├── textbooks.ts
│   ├── mentors.json
│   └── students.json
├── hooks/                           # Custom React state hook helpers
├── lib/                             # Global helper utilities
│   └── utils.ts
├── public/                          # Server assets directory
│   ├── models/                      # Pre-trained face-api.js weights files
│   ├── manifest.json                # Progressive Web App manifest configurations
│   └── sw.js                        # Offline web service workers
├── scripts/                         # Command-line developer support scripts
│   └── download-face-api-models.js  # Network script to pull neural weights
├── styles/                          # Stylesheets folder
│   └── globals.css
├── components.json                  # UI template layout configurations
├── next.config.mjs                  # Next.js configurations
├── tailwind.config.ts               # Style configuration variables
├── tsconfig.json                    # TypeScript compiler configurations
└── package.json                     # System packages and engine specifications
```

---

## Setup and Installation

Follow these steps to run VidyAi on your local computer.

### System Requirements
1. **Node.js**: Version `20.x` or higher installed. (Run `node -v` to check).
2. **Webcam**: A functional webcam is needed to test local face tracking.
3. **API Key**: A Google Gemini API key is needed to run the AI Tutor features.

---

### Step-by-Step Setup

#### 1. Clone the project code
```bash
git clone https://github.com/jai3546/AI_ROCKERS.git
cd AI_ROCKERS
```

#### 2. Install dependencies
```bash
npm install
```

#### 3. Download the face tracking models
VidyAi tracks emotions entirely locally in your browser. Run this script to download the required models:
```bash
node scripts/download-face-api-models.js
```
*Note: This downloads the detector files to your `public/models/` folder. Your camera stream is fully private and processed locally—no data is sent to any external server.*

#### 4. Add your API Key
Create a file named `.env.local` in the root folder, and paste your Gemini API key:
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_actual_gemini_api_key_here
```

#### 5. Database Setup (PostgreSQL)
VidyAi uses a PostgreSQL database layer managed by Prisma ORM.

1. **Configure Database Connection (`DATABASE_URL`)**:
   Create or update the `DATABASE_URL` environment variable in your `.env` file at the project root to match your PostgreSQL provider connection string:
   ```env
   DATABASE_URL="postgresql://<user>:<password>@<host>:<port>/<dbname>?schema=public"
   ```
   
   VidyAi is compatible with modern serverless PostgreSQL providers:
   * **Neon**: Use the connection string provided in your Neon dashboard. Make sure to use the pooled database connection string (`-pooler`) if you are deploying to serverless platforms like Vercel.
   * **Supabase**: Use the connection string from your Supabase Project Settings (Database tab). Ensure you use port `6543` for connection pooling (PgBouncer/Supavisor) in serverless environments, or port `5432` for direct connection in development.
   * **Vercel Postgres**: If deploying to Vercel, link your Vercel project to a Vercel Postgres database, and the environment variables (`POSTGRES_PRISMA_URL` / `POSTGRES_URL`) will automatically be loaded. You can set `DATABASE_URL` to point to it.

2. **Run Database Migrations**:
   Prisma migrations manage the database schema over time.
   * **Development**: To apply migrations and generate client:
     ```bash
     npx prisma migrate dev
     ```
   * **Production / Deployment**: To apply pending migrations without resetting the database:
     ```bash
     npx prisma migrate deploy
     ```

3. **Seed the Database**:
   Populate your database with initial data (demo student & teacher accounts, achievements, topics, quizzes, and flashcards) using either:
   ```bash
   npx prisma db seed
   ```
   or directly:
   ```bash
   npx tsx scripts/seed.ts
   ```


#### 6. Start the application
```bash
npm run dev
```
Now, open your web browser and go to **[http://localhost:3000](http://localhost:3000)**. Use the **Try Demo** button to test the app.

---

### Pre-flight Checklist

| Step | What to Check | Why it is Needed |
|---|---|---|
| 1 | Node.js version is `20.x` | Prevents setup errors |
| 2 | `npm install` runs successfully | Installs all required libraries |
| 3 | Models are in `public/models/` | Enables face/attention tracking |
| 4 | `.env.local` contains Gemini key | Required to chat with the AI Tutor |
| 5 | Camera access is allowed in browser | Enables focus and emotion estimation |

---

## Code Guidelines and License

We want to make contributing to VidyAi as easy as possible. Please review these short documents if you want to write code for us:

* **[Contributing Guidelines](CONTRIBUTING.md)**: Explains branch names, how to format commits, and coding standards.
* **[Code of Conduct](CODE_OF_CONDUCT.md)**: Establishes a friendly, welcoming environment for everyone.
* **[MIT License](LICENSE)**: Legal notice permitting usage, modifications, and sharing of this project.

### Branch Naming Conventions
Please use these prefixes when creating a new branch to work on code:
* `feature/your-feature` — for adding new features.
* `fix/your-fix` — for fixing bugs.
* `docs/your-docs` — for improving documentation.

### Standard Commit Messages
We follow the Conventional Commits format to keep our git history clear:
`type(scope): description`

Examples:
* `feat(tutor): add multi-turn conversation memory`
* `fix(emotion): resolve webcam permission handling bug`

---

## Future Roadmap

- [ ] Add voice commands for Tamil, Kannada, Marathi, and Bengali.
- [ ] Build a mobile application using React Native.
- [ ] Implement class-wide focus analytics for teachers while preserving student privacy.
- [ ] Create a shared online marketplace for textbooks and quizzes.
- [ ] Add AI-facilitated group study rooms for students.

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
---

## Authors

* **[Tatikonda Jaideep](https://github.com/jai3546)**
### Support the Project
If you like VidyAi and want to support our open-source work, please **give this project a star** on GitHub!

**🌟 Star the repo · 🍴 Fork it · 📢 Share it**

<br/>

Made with ❤️ by **Team AI ROCKERS**

[![GitHub](https://img.shields.io/badge/GitHub-jai3546-181717?style=for-the-badge&logo=github)](https://github.com/jai3546)

</div>
