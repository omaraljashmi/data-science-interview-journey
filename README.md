# Data Science Interview Journey

A private, distraction-free learning app that runs locally in Chrome. It includes a daily adaptive study plan, seeded Chapter 1 lessons, retrieval quizzes, Python practice, spaced review, mastery tracking, a mistake bank, a study heatmap, and configurable study intensity.

No account, package installation, build step, or internet connection is required.

## Fastest way to open it

1. Open this folder.
2. Double-click `index.html`.
3. If macOS asks which app to use, choose Google Chrome.

All screens and interactions work directly from the file. Progress is stored by Chrome on this device.

## Recommended one-click launch on macOS

1. Double-click `start.command`.
2. A small local server starts and the app opens in Google Chrome.
3. Keep the Terminal window open while studying. Press **Control-C** there when finished.

If macOS blocks the first launch, right-click `start.command`, choose **Open**, and confirm once.

## Start it from Terminal

From this project folder, run:

```bash
python3 -m http.server 41739
```

Then open [http://localhost:41739](http://localhost:41739) in Chrome. Stop the server with **Control-C**.

## Windows

Double-click `start.bat`. It starts a local server and opens Chrome. Python 3 must be installed for this launcher; otherwise, open `index.html` directly.

## What is included

- Dashboard with a generated daily study session
- Seven curriculum tracks: Python/DSA/LeetCode, SQL, statistics, machine learning, experimentation, product/data cases, and mock interviews
- Seeded Chapter 1: Big-O, arrays/lists, hash maps/sets, Contains Duplicate, and Two Sum
- Lesson pages with worked examples, fading guidance, retrieval checks, confidence ratings, and immediate explanations
- Adaptive cumulative quizzes that prioritize due material, lower mastery, and prior mistakes
- Python practice editor with progressive hints, saved drafts, structural self-checks, and reference solutions
- Spaced-repetition scheduling and targeted misconception remediation
- Mastery scale: Unseen → Learned → Guided → Independent → Retained → Interview-ready
- Mistake bank, progress dashboard, 12-week activity heatmap, and study intensity settings
- Local progress export and reset controls

## How saving works

The app uses browser `localStorage`. Data never leaves the browser. Chrome keeps separate storage for the direct-file and local-server versions, so choose one launch method and keep using it for the most consistent history.

Use **Study settings → Export backup** to download a readable JSON copy of your progress.

## Project files

- `index.html` — app shell and navigation
- `styles.css` — responsive visual system and screen layouts
- `data.js` — tracks, Chapter 1 lessons, quiz questions, and coding challenges
- `state.js` — local persistence, review scheduling, mastery, mistakes, and daily plan generation
- `course-app.js` — routes, rendering, interactions, quiz adaptation, and code self-checks
- `CLAUDE_REVIEW_CONTEXT.md` — complete context and review brief for a Claude design pass
- `start.command` / `start.bat` — optional one-click local launchers

## Browser-only Python note

The code workspace deliberately does not pretend to execute Python. **Self-check solution** evaluates the structure of an answer, while the examples, hints, manual tracing, and reference solution support honest verification. For full execution, paste the saved solution into a local Python environment or LeetCode.

In the editor, Tab moves keyboard focus by default. Press Ctrl+M inside the editor to make Tab insert four spaces; press Escape to release it again. Self-check refuses untouched starter code so that an empty attempt is never recorded as a mistake.
