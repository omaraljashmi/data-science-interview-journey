# Claude Design Review and Improvement Context

## Your role

Act as a senior product designer and front-end engineer. Review this working local web app in the browser, identify material usability or visual-design issues, and implement improvements when they genuinely make the experience clearer, calmer, more coherent, or more accessible.

Do not replace the product with a mockup or stop at written feedback. Preserve what works, make focused edits in the existing files, and verify the resulting app across its primary routes.

## Product

**Name:** Data Science Interview Journey

**Purpose:** A private, distraction-free course platform for preparing for data science interviews. It combines structured lessons, retrieval practice, coding exercises, adaptive quizzes, spaced repetition, mistake remediation, and mastery tracking.

**Audience:** Someone independently preparing for data science interviews who wants a guided curriculum without feeds, social features, engagement tricks, or chat-based distractions.

The desired feeling is calm, rigorous, and encouraging—closer to a well-designed field notebook or serious course platform than a gamified learning app.

## Run the app

No installation or build is required.

Fastest option:

1. Open `index.html` in Chrome.

Recommended local-server option:

```bash
python3 -m http.server 41739
```

Then visit:

```text
http://localhost:41739/#/dashboard
```

On macOS, `start.command` performs these steps automatically.

## Technology and constraints

- Plain HTML, CSS, and JavaScript
- No framework, build step, package manager, CDN, or external font dependency
- Must continue working when `index.html` is opened directly
- Must continue working offline
- Progress is stored in browser `localStorage`
- Preserve the storage key: `ds-interview-journey-v1`
- Preserve existing saved-state compatibility unless a migration is added
- Do not add authentication, analytics, remote requests, feeds, sharing, or social features
- Do not add decorative imagery merely to fill space
- Do not pretend to execute Python in the browser
- Keep the app responsive and keyboard accessible
- Keep main body text at 16px or larger where practical; frequently used labels should generally be at least 14px
- Respect `prefers-reduced-motion`

## Important files

- `index.html` — persistent shell, sidebar, top bar, favicon, and scripts
- `styles.css` — complete responsive design system and route styling
- `data.js` — curriculum tracks, Chapter 1 lessons, questions, and code challenges
- `state.js` — persistence, mastery, review scheduling, mistakes, drafts, activity, and session generation
- `course-app.js` — routing, rendering, interactions, adaptive quizzes, and code self-checking
- `README.md` — user-facing launch and feature documentation

There is intentionally no framework and no generated build directory.

## Routes to inspect

Review every route, not only the dashboard:

```text
#/dashboard
#/session
#/chapters
#/lesson/big-o
#/lesson/arrays
#/lesson/hash-maps
#/lesson/contains-duplicate
#/lesson/two-sum
#/review
#/practice
#/practice/contains-duplicate
#/practice/two-sum
#/mistakes
#/progress
#/settings
```

## Core user flows to preserve

### Daily study

The dashboard generates a daily plan based on the selected intensity, due reviews, lower-mastery lessons, and coding practice. The session page lets the learner open and complete each step.

### Lessons

Each seeded lesson contains:

- A concise mental model
- A worked example with fading guidance
- A retrieval question
- A confidence rating
- Immediate explanatory feedback
- Misconception warnings
- A locally saved memory note
- A path into coding practice where applicable

### Adaptive review

Questions are prioritized using:

- Open mistakes
- Due reviews
- Lower mastery
- Interleaving across concepts

Incorrect answers create or update mistake records and schedule earlier practice. Correct answers extend the review interval.

### Coding practice

Contains Duplicate and Two Sum include:

- A local code draft
- Progressive hints
- Examples and target complexity
- Structural self-checks
- A clearly disclosed limitation that Python is not actually executed
- Reference solutions after self-checking

### Mastery

The six stages are:

```text
Unseen → Learned → Guided → Independent → Retained → Interview-ready
```

The intended meaning is:

- Learned: completed the concept
- Guided: retrieved correctly with support
- Independent: solved or recalled without support
- Retained: recalled successfully after spacing
- Interview-ready: reliable under realistic interview conditions

Do not make mastery advance simply because the interface was clicked repeatedly.

### Persistence

The app saves:

- Mastery
- Review schedules
- Mistakes
- Quiz history
- Code drafts
- Lesson notes
- Daily activity and study time
- Study intensity
- Current daily session

## Existing visual direction

The current design uses a “quiet field notebook” direction:

- Deep navy navigation and focused-work surfaces
- Cool paper-gray page background
- White working panels
- Restrained blue for primary actions
- Cyan for successful learning states
- Amber for uncertainty, due work, and misconceptions
- Georgia for editorial lesson headings
- System sans-serif for interface text
- Monospace for code, lesson numbers, and small technical labels
- Soft borders, moderate corner radii, and restrained shadows

The design should remain original. It may share the clarity and structure of excellent modern course platforms, but it should not visually copy Anthropic or any other brand.

## Review objectives

Inspect the app as a real learning product. Prioritize issues that affect comprehension, focus, navigation, feedback, or practice quality.

### 1. Information hierarchy

- Is the next useful action obvious in the first viewport?
- Are lesson headings, supporting explanations, and metadata clearly differentiated?
- Do secondary controls compete with the main learning task?
- Are dense screens broken into understandable visual groups?

### 2. Course navigation

- Is it always clear where the learner is in the course?
- Do dashboard, chapter map, lesson, practice, and review transitions feel coherent?
- Is mobile navigation usable without obscuring content?
- Are active, completed, recommended, and due states distinguishable without relying only on color?

### 3. Learning interactions

- Does the interface make the learner commit before revealing an answer?
- Are confidence ratings easy to understand and operate?
- Is correct/incorrect feedback immediate, specific, and visually calm?
- Does fading guidance feel intentional?
- Is a mistake framed as actionable information rather than failure?

### 4. Coding workspace

- Are the prompt, examples, editor, hints, and self-check results balanced well?
- Is the editor usable at laptop and mobile widths?
- Is it unmistakable that the browser performs structural checks rather than executing Python?
- Are saved-draft and self-check states clear?

### 5. Visual consistency

- Check spacing rhythm, type scale, border radii, shadows, icon treatment, colors, and control heights.
- Look for sections that feel as though they belong to a different product.
- Avoid adding generic dashboard cards or visual decoration without functional value.
- Do not make every surface look identical; lessons, review, and coding should retain task-appropriate layouts.

### 6. Accessibility

- Test keyboard navigation and visible focus states.
- Check color contrast and meaning conveyed by color.
- Check button and link labels.
- Check heading order and semantic structure.
- Check touch target sizes.
- Check layout at 200% browser zoom.
- Ensure no horizontal scrolling at normal mobile widths.

### 7. Responsive behavior

Review at approximately:

- 1440 × 900 desktop
- 1024 × 768 small laptop/tablet landscape
- 768 × 1024 tablet portrait
- 390 × 844 mobile

Pay particular attention to:

- Sidebar conversion to mobile navigation
- Sticky headers and lesson progress bars
- Chapter track strip overflow
- Long quiz options
- Lesson rail placement
- Code editor sizing
- Progress heatmap overflow
- Mastery-table label wrapping

## Improvement rules

1. Start by using the product and documenting a short prioritized issue list.
2. Fix high-impact issues first.
3. Prefer CSS and small rendering changes over broad architectural rewrites.
4. Preserve the existing curriculum and learning logic unless you find a concrete defect.
5. Keep visible language direct and useful; remove filler instead of adding it.
6. Do not introduce new dependencies unless there is a compelling, documented reason.
7. Do not replace functional controls with visually attractive but inert elements.
8. Preserve local-only operation and direct-file compatibility.
9. Avoid excessive animation, gradients, glowing effects, or gamification.
10. If the design is already effective in an area, leave it alone.

## Functional checks after editing

Verify at minimum:

- Every route above renders without an exception
- Sidebar and mobile navigation work
- Changing study intensity regenerates the daily plan
- A lesson answer requires both an option and confidence rating
- Correct and incorrect lesson answers show the right feedback
- An incorrect answer appears in the mistake bank
- Adaptive review can reach its results screen
- Code drafts persist after navigating away and returning
- Code self-check shows pass/fail criteria
- Completing session steps updates progress
- Notes persist after navigating away and returning
- Export backup downloads valid JSON
- Reset requires confirmation
- Reloading the page preserves state

## Desired deliverable

If improvements are warranted:

1. Edit the existing project files directly.
2. Keep the app runnable without a build step.
3. Summarize the design problems you found.
4. Summarize the changes you implemented and why.
5. List the routes and viewport sizes you verified.
6. Call out any remaining limitations separately.

If no meaningful improvement is needed, provide a concise review explaining why and identify only genuinely optional refinements. Do not manufacture changes for the sake of producing a diff.
