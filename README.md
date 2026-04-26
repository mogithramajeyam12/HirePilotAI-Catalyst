# HirePilot AI — AI-Powered Talent Scouting & Engagement Agent
> Catalyst Hackathon · Deccan AI · April 2026

[![Demo](https://img.shields.io/badge/Demo-Live-brightgreen)](./index.html)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

---

## 🎯 Problem

Recruiters waste hours sifting through profiles and chasing candidate interest. HirePilot AI is an AI agent that:
1. **Parses** a Job Description using NLP
2. **Discovers** matching candidates with explainable scores
3. **Engages** candidates conversationally to assess genuine interest
4. **Outputs** a ranked shortlist scored on two dimensions: **Match Score** and **Interest Score**

---

## 🚀 Quick Start

### Option A — Open directly (zero setup)
```bash
open index.html   # macOS
start index.html  # Windows
xdg-open index.html  # Linux
```

### Option B — Local dev server
```bash
npx serve .
# Open http://localhost:3000
```

> **Note**: The app supports two modes:
> - **Live AI mode** with Anthropic API key (higher realism)
> - **Fallback demo mode** without API key (deterministic mock data, no external dependency)
>
> In live mode, calls are made from the browser to `https://api.anthropic.com/v1/messages`. For production, proxy through a backend to protect your key.

### Environment (optional for live mode)
Set your Anthropic key in the browser before running:
```js
localStorage.setItem("ANTHROPIC_API_KEY", "your_key_here")
```
Refresh the page after setting the key.

---

## 🏗 Architecture

```
┌─ INPUT ─────────────────────────────────────────────────────┐
│  Raw Job Description Text (any format, any length)           │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ STAGE 1: JD PARSER ────────────────────────────────────────┐
│  Model: claude-sonnet-4                                      │
│  Input: Raw JD text                                          │
│  Output: Structured JSON                                     │
│    { title, seniority, required_skills, nice_to_have,       │
│      experience_years, location, salary_range, key_traits }  │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ STAGE 2: CANDIDATE DISCOVERY ──────────────────────────────┐
│  Model: claude-sonnet-4                                      │
│  Input: Parsed JD JSON                                       │
│  Output: 8 candidate profiles, each with:                   │
│    - match_score (0–100)                                     │
│    - match_reasons (explainability)                          │
│    - match_gaps (transparency)                               │
│    - skills, experience, education, location                 │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ STAGE 3: CONVERSATIONAL ENGAGEMENT ────────────────────────┐
│  Model: claude-sonnet-4 (persona roleplay)                   │
│  Recruiter sends outreach → AI plays candidate               │
│  Multi-turn: candidate responds based on their profile       │
│  After 3+ turns: injects [INTEREST:high/medium/low] signal   │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ STAGE 4: INTEREST SCORER ──────────────────────────────────┐
│  Model: claude-sonnet-4                                      │
│  Input: Full chat transcript                                 │
│  Output:                                                     │
│    - interest_score (0–100)                                  │
│    - interest_level (high/medium/low)                        │
│    - key_signals (positive evidence)                         │
│    - concerns (hesitation signals)                           │
│    - recommended_action                                      │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ STAGE 5: RANKING ENGINE ───────────────────────────────────┐
│  Combined Score = Match × 0.55 + Interest × 0.45            │
│  Sort by Combined (default), Match, or Interest              │
│  Filter: All | Strong Match | Open to Work | Engaged         │
└─────────────────────────────────────────────────────────────┘
         │
         ▼
┌─ OUTPUT ────────────────────────────────────────────────────┐
│  Ranked Shortlist with:                                      │
│  - Dual-dimension scores                                     │
│  - Explainability (reasons + gaps)                           │
│  - Skill coverage bars                                       │
│  - Interest signals & recommended actions                    │
│  - One-click outreach / scheduling                           │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Scoring Methodology

### Match Score (0–100)
Computed by the AI during candidate discovery, evaluating:
| Factor | Weight |
|--------|--------|
| Skill overlap with required skills | High |
| Years of experience vs. requirement | Medium |
| Seniority alignment | Medium |
| Domain relevance (e.g. fintech) | Medium |
| Location / remote compatibility | Low |
| Nice-to-have skills | Low |

### Interest Score (0–100)
Derived from conversational transcript analysis:
| Signal | Impact |
|--------|--------|
| Response quality & depth | High |
| Enthusiasm about role/company | High |
| Proactive questions asked | Medium |
| Salary alignment signals | Medium |
| Availability timeline | Low |

### Combined Score
```
Combined = (Match × 0.55) + (Interest × 0.45)
```
**Why 55/45?** Match is the baseline qualifier — a candidate must be technically capable. Interest breaks ties and surfaces engaged passive candidates who might otherwise be overlooked.

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 (CDN), vanilla CSS |
| AI Engine | Claude claude-sonnet-4 (Anthropic API) |
| JD Parsing | Structured JSON prompt engineering |
| Candidate Discovery | Contextual simulation from parsed JD |
| Chat Engine | Multi-turn persona roleplay with memory |
| Interest Scoring | Transcript analysis agent |
| Deployment | Static HTML — zero build step |

---

## 📂 Project Structure

- `index.html` — app shell and script/style includes
- `styles.css` — complete UI styling and design system
- `app.js` — React application logic (JD parsing, candidate generation, engagement, ranking)
- `sample-input.md` — example JD input
- `sample-output.json` — example ranked shortlist output

---

## 🖥 Features

- **JD Parser**: Extracts role, skills, seniority, salary, location from any JD format
- **Candidate Cards**: Expandable with skill coverage bars and match explainability
- **Live Chat**: Engage any candidate — AI responds as that candidate persona
- **Interest Scoring**: Automatic after 3+ chat turns
- **Shortlist View**: Ranked table with dual scores, ready-to-action buttons
- **Dashboard**: Pipeline overview with key metrics
- **Architecture View**: In-app documentation of the system

---

## 📁 Sample Input

See:
- `SAMPLE_JD` in `index.html`
- [`sample-input.md`](sample-input.md)

## 📤 Sample Output

See [`sample-output.json`](sample-output.json) for a representative ranked shortlist payload.

Typical run characteristics:
- 8 candidates ranked by match score (usually ~55–92 range)
- top candidates show strong React/TypeScript/Node.js + FinTech overlap
- explainability includes positive reasons and explicit gaps
- post-engagement scores add `interest_score` and `interest_level`

---

## ✅ Catalyst Submission Checklist

Before the deadline (**Monday, April 27, 2026 at 1:00 AM IST**), submit:

1. **Git repository URL**  
   Example: `https://github.com/<username>/hirepilot-ai-catalyst`
2. **Git username**
3. **Project documentation / README**  
   This file (with architecture + scoring + setup)
4. **Demo video link (3–5 minutes)**  
   Suggested structure:
   - 0:00–0:45 problem and approach
   - 0:45–2:15 live JD parsing + candidate scouting
   - 2:15–3:45 conversational engagement + interest scoring
   - 3:45–4:30 shortlist and explainability
5. **Project site URL**  
   Recommended: GitHub Pages deployment of `index.html`

Also share repository access with `hackathon@deccan.ai` before final submission.

---

## 🌐 Deployment (GitHub Pages)

```bash
git init
git add .
git commit -m "Catalyst submission: HirePilot AI prototype"
git branch -M main
git remote add origin https://github.com/<username>/<repo>.git
git push -u origin main
```

Then enable GitHub Pages:
- Repo Settings → Pages
- Source: `Deploy from a branch`
- Branch: `main` / `/ (root)`

Your project URL will look like:
`https://<username>.github.io/<repo>/`

---

## 🔮 Future Roadmap

- [ ] Real LinkedIn/GitHub API integration
- [ ] Resume/CV parsing (PDF upload)
- [ ] Email outreach automation
- [ ] ATS integration (Greenhouse, Lever, Workday)
- [ ] Candidate history & notes persistence
- [ ] Team collaboration features
- [ ] Analytics dashboard with conversion funnels

---

## 👥 Team

Built for **Catalyst Hackathon** by **Deccan AI**  
Submission deadline: April 27, 2026 · 1:00 AM IST

---

## 📄 License

MIT License — see [LICENSE](LICENSE)
