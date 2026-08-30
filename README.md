<p align="center">
  <img src="openseal.gif" alt="OpenSeal" width="300" />
</p>

<h1 align="center">OpenSeal</h1>

<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Mastra-7C3AED?style=for-the-badge&logo=mastra&logoColor=white" alt="Mastra" />
  <img src="https://img.shields.io/badge/OpenRouter-FF5500?style=for-the-badge&logo=openrouter&logoColor=white" alt="OpenRouter" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Any%20Model-6366F1?style=for-the-badge&logo=openrouter&logoColor=white" alt="Any Model" />
</p>

<p align="center">
  <strong>A self-improving AI assistant built on Mastra — with real-time web access, file operations, and a skill learning system.</strong>
</p>

---

## 🧠 What is OpenSeal?

OpenSeal is a TypeScript-based agent powered by the [Mastra framework](https://mastra.ai). It can fetch live weather, search the web, calculate math, read and write files, and — most importantly — **learn from experience** by creating its own skills as `.md` files.

---

## ⚙️ Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js ≥ 22.13 |
| Language | TypeScript 6 |
| Agent Framework | Mastra |
| LLM Provider | OpenRouter (any model) |
| Embeddings | FastEmbed (local, no API key) |
| Storage | LibSQL (file-based) |
| Memory | Semantic Recall + Observational Memory |

---

## 🛠️ Tools

OpenSeal has **10 tools** across 4 categories:

### 🌤️ Real-world Access
| Tool | id | Description |
|------|----|-------------|
| `weather` | `get-weather` | Fetch live weather from Open-Meteo API |
| `webSearch` | `web-search` | Search DuckDuckGo (free, no API key) |
| `webFetch` | `web-fetch` | Extract clean Markdown from any URL |

### 🧮 Utility
| Tool | id | Description |
|------|----|-------------|
| `calculator` | `calculator` | Evaluate math expressions safely |

### 📁 File Operations
| Tool | id | Approval | Description |
|------|----|:---:|-------------|
| `read` | `read_file` | — | Read any file in the project |
| `write` | `write_file` | ✅ | Create or overwrite files |
| `edit` | `edit_file` | ✅ | Exact string replacement in files |
| `list` | `list_directory` | — | List directory contents with glob |
| `search` | `grep_files` | — | Regex search across files |
| `remove` | `delete_file` | ✅ | Delete files |

> File write/edit/delete operations require **human approval** via Mastra Studio.

---

## 🎓 Skills System

OpenSeal learns from experience. It can create `.md` skill files that capture knowledge, preferences, and behavior patterns.

### How it works

```
User: "I always want temperatures in Celsius"
  ↓
OpenSeal reads skill_creator.md for the format
  ↓
OpenSeal creates skills/celsius_preference.md (with your approval)
  ↓
Next conversation: OpenSeal loads the skill, remembers your preference
```

### Skill format

Every skill is a `.md` file with:
- **Triggers** — when the skill should activate
- **Instructions** — what to do when triggered
- **Examples** — sample interactions

### `skill_creator.md`

The meta-skill that teaches the agent **how** to create skills. Located at `src/mastra/skills/skill_creator.md`. Read-only to the agent — it can read it but never modify it.

---

## 🗂️ Project Structure

```
OpenSeal/
├── src/mastra/
│   ├── agents/
│   │   └── openseal-agent.ts        # Main agent definition
│   ├── tools/
│   │   ├── weather-tool.ts       # Live weather API
│   │   ├── calculator-tool.ts    # Safe math evaluator
│   │   ├── web-tools.ts          # DuckDuckGo search + URL fetch
│   │   └── file-tools.ts         # File CRUD + grep + list
│   ├── scorers/
│   │   └── weather-scorer.ts     # Evaluation scorers
│   ├── workflows/
│   │   └── weather-workflow.ts   # Activity planning workflow
│   ├── skills/
│   │   └── skill_creator.md      # Meta-skill (read-only)
│   └── index.ts                  # Mastra entry point
├── .env                          # API keys (OpenRouter)
├── package.json
└── tsconfig.json
```

---

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Start the dev server
npm run dev

# Open Mastra Studio
# → http://localhost:4111
```

### Environment

Create a `.env` file (see `.env.example`). OpenSeal uses **OpenRouter**, so you just need an OpenRouter API key and can pick any model:

```env
OPENROUTER_API_KEY=sk-or-your-key-here
OPENROUTER_MODEL=openrouter/anthropic/claude-haiku-4.5
```


---

## 🧠 Memory

OpenSeal uses a dual memory system:

| Memory Type | What it does |
|-------------|-------------|
| **Semantic Recall** | Vector search across past messages using FastEmbed |
| **Observational Memory** | Background Observer/Reflector agents compress long conversations into dense observations |
| **Skills** | Agent-created `.md` files for persistent preferences and patterns |

---

<p align="center">
  <sub>Built with Mastra · Powered by OpenRouter · Self-improving by design</sub>
</p>
