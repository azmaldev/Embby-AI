# Skill Creator

This is the meta-skill that teaches you how to create and manage skills. Read this before creating any new skill.

## What is a skill?

A skill is a `.md` file in the `src/mastra/skills/` directory that captures knowledge, preferences, or behavior patterns you learn. Skills make you better over time.

## When to create a skill

Create a new skill when any of these happen:

- **User preference**: User states a recurring preference (e.g. "always use bullet points", "keep responses under 100 words", "prefer Claude over GPT")
- **Learned pattern**: You discover a reliable process or workflow that works well (e.g. "best way to structure a code review", "how to research a topic before answering")
- **Mistake correction**: You make an error and learn how to avoid it next time
- **Explicit request**: User asks you to remember something for future conversations
- **New domain knowledge**: You discover useful facts about a topic the user cares about

## Skill file naming

Use lowercase `snake_case` with `.md` extension. Make names short and descriptive:

```
email_writing_style.md    — correct
code_review_checklist.md  — correct
user_preferences.md       — correct
search_workflow.md        — correct
writing-style.md          — wrong (use underscores, not hyphens)
WritingStyle.md           — wrong (use lowercase)
```

Good names describe **what** the skill helps with in 3-5 words. Bad names are too generic ("skills.md", "notes.md") or too vague ("stuff.md").

## Skill file format

Every skill must follow this exact structure:

```markdown
# Skill: <short descriptive title>

- **Triggers:** When this skill should activate. Be specific.
- **Instructions:** What to do when this skill applies. Be precise.
- **Examples:**

  **User:** "example query"
  **Response:** "how you should respond"

Keep skills focused — one topic per file. Aim for under 30 lines.
```

## How to manage skills

- First: use `read_file` with `path: "src/mastra/skills/skill_creator.md"` to read this guide
- List: use `list_directory` with `dirPath: "src/mastra/skills"` to see existing skills
- Load: use `read_file` with the full skill path (e.g. `path: "src/mastra/skills/email_writing_style.md"`)
- Create: use `write_file` with the full skill path to create a new skill (requires approval)
- Edit: use `edit_file` to improve an existing skill (requires approval)
- Never delete or modify `skill_creator.md` — it is read-only
