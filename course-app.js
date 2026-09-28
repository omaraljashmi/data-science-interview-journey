(function () {
  "use strict";

  const view = document.getElementById("app-view");
  const state = CourseState;
  let quizRun = null;
  let activeLessonFeedback = null;
  let practiceResult = null;

  const icons = {
    home: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1Z'/></svg>",
    map: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='m9 18-6 3V6l6-3 6 3 6-3v15l-6 3-6-3Z'/><path d='M9 3v15m6-12v15'/></svg>",
    review: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M20 12a8 8 0 1 1-2.3-5.6L20 9'/><path d='M20 4v5h-5'/></svg>",
    code: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='m8 9-4 3 4 3m8-6 4 3-4 3m-3-9-2 12'/></svg>",
    mistake: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M12 3 2.8 19h18.4L12 3Z'/><path d='M12 9v4m0 3h.01'/></svg>",
    chart: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M4 20V10m6 10V4m6 16v-7m4 7H2'/></svg>",
    settings: "<svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='3'/><path d='M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z'/></svg>",
    menu: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M4 7h16M4 12h16M4 17h16'/></svg>",
    arrow: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='M5 12h14m-5-5 5 5-5 5'/></svg>",
    clock: "<svg viewBox='0 0 24 24' aria-hidden='true'><circle cx='12' cy='12' r='9'/><path d='M12 7v5l3 2'/></svg>",
    check: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='m5 12 4 4L19 6'/></svg>",
    spark: "<svg viewBox='0 0 24 24' aria-hidden='true'><path d='m12 3 1.3 4.7L18 9l-4.7 1.3L12 15l-1.3-4.7L6 9l4.7-1.3L12 3Zm6 11 .7 2.3L21 17l-2.3.7L18 20l-.7-2.3L15 17l2.3-.7L18 14Z'/></svg>"
  };

  function escapeHTML(value) {
    return String(value == null ? "" : value).replace(/[&<>'"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;" })[char]);
  }

  function toast(message) {
    const region = document.getElementById("toast-region");
    const item = document.createElement("div");
    item.className = "toast";
    item.textContent = message;
    region.appendChild(item);
    setTimeout(() => item.classList.add("show"), 10);
    setTimeout(() => { item.classList.remove("show"); setTimeout(() => item.remove(), 250); }, 2800);
  }

  function lessonById(id) { return COURSE_DATA.lessons.find((lesson) => lesson.id === id); }
  function challengeById(id) { return COURSE_DATA.challenges.find((challenge) => challenge.id === id); }
  function allQuestions() { return COURSE_DATA.lessons.flatMap((lesson) => lesson.questions.map((question) => Object.assign({ lessonId: lesson.id, lessonTitle: lesson.title }, question))); }
  function masteryBadge(level) { return `<span class="mastery-badge mastery-${level}"><i></i>${COURSE_DATA.mastery[level]}</span>`; }
  function stageDots(level) { return `<span class="stage-dots" aria-label="${COURSE_DATA.mastery[level]}">${Array.from({ length: 5 }, (_, i) => `<i class="${i < level ? "filled" : ""}"></i>`).join("")}</span>`; }
  function formatDate(date) { return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(new Date(date)); }
  function emptyState(icon, title, text, action) { return `<div class="empty-state"><span class="empty-icon">${icon}</span><h2>${title}</h2><p>${text}</p>${action || ""}</div>`; }

  function renderDashboard() {
    const session = state.getSession();
    const chapter = COURSE_DATA.chapter;
    const complete = COURSE_DATA.lessons.filter((lesson) => state.getMastery(lesson.id) > 0).length;
    const pct = Math.round((complete / COURSE_DATA.lessons.length) * 100);
    const mode = COURSE_DATA.studyModes[state.value.intensity];
    const nextIndex = session.items.findIndex((_, index) => !session.completed.includes(index));
    const allDone = nextIndex === -1;
    const nextItem = allDone ? null : session.items[nextIndex];
    const headline = allDone ? "Today’s session is complete." : session.completed.length ? `Next up: ${escapeHTML(nextItem.title)}.` : "Build fluency, one focused session at a time.";
    view.innerHTML = `
      <section class="dashboard-page page-wrap">
        <div class="welcome-row"><div><p class="date-line">${new Intl.DateTimeFormat("en-US", { weekday: "long", month: "long", day: "numeric" }).format(new Date())}</p><h1>${headline}</h1></div><div class="today-goal"><span>${mode.minutes}</span><small>minute focus</small></div></div>
        <div class="dashboard-grid">
          <section class="session-card ink-card"><div class="session-card-head"><div><p class="overline light">Today’s path</p><h2>${mode.label} session</h2></div><span class="session-count">${session.completed.length} / ${session.items.length} done</span></div>
            <ol class="session-list">${session.items.map((item, index) => { const done = session.completed.includes(index); return `<li class="${index === nextIndex ? "current" : ""} ${done ? "completed" : ""}"><span class="step-index">${done ? "✓" : String(index + 1).padStart(2, "0")}</span><div><small>${item.type}${index === nextIndex ? " · up next" : done ? " · done" : ""}</small><strong>${escapeHTML(item.title)}</strong></div><span class="step-time">${item.minutes} min</span></li>`; }).join("")}</ol>
            <a class="button button-primary button-light" href="#/session">${allDone ? "Review today’s session" : session.completed.length ? "Continue today’s session" : "Start today’s session"} ${icons.arrow}</a>
          </section>
          <section class="chapter-card panel"><div class="panel-head"><div><p class="overline">Current chapter</p><h2>${chapter.title}</h2></div><span class="big-percent">${pct}%</span></div><div class="progress-track"><span style="width:${pct}%"></span></div>
            <div class="lesson-mini-list">${chapter.lessons.map((lesson) => { const level = state.getMastery(lesson.id); return `<a href="#/lesson/${lesson.id}"><span class="lesson-check ${level ? "done" : ""}">${level ? "✓" : lesson.number}</span><div><strong>${lesson.title}</strong><small>${lesson.duration} min · ${COURSE_DATA.mastery[level]}</small></div><span class="mini-arrow">›</span></a>`; }).join("")}</div>
            <a class="text-link" href="#/chapters">View full chapter map ${icons.arrow}</a>
          </section>
        </div>
        <div class="dashboard-bottom">
          <section class="panel recall-panel"><div class="metric-icon cyan">↻</div><div><p class="overline">Due for review</p><h3>${state.getDueLessons().length} concepts</h3><p>Your queue adapts after every answer.</p></div><a class="round-link" href="#/review" aria-label="Open review queue">${icons.arrow}</a></section>
          <section class="panel recall-panel"><div class="metric-icon amber">△</div><div><p class="overline">Targeted practice</p><h3>${state.value.mistakes.filter((mistake) => !mistake.resolved).length} open mistakes</h3><p>Missed ideas return at the right time.</p></div><a class="round-link" href="#/mistakes" aria-label="Open mistake bank">${icons.arrow}</a></section>
        </div>
      </section>`;
  }

  function renderSession() {
    const session = state.getSession();
    const total = session.items.reduce((sum, item) => sum + item.minutes, 0);
    const done = session.completed.length;
    const pct = Math.round((done / session.items.length) * 100);
    const nextIndex = session.items.findIndex((_, index) => !session.completed.includes(index));
    view.innerHTML = `
      <section class="page-wrap session-page narrow-page">
        <div class="page-heading split-heading"><div><p class="overline">Adaptive study plan</p><h1>Today’s session</h1><p>Selected from due reviews, low-mastery concepts, and targeted practice.</p></div><div class="plan-time">${icons.clock}<strong>${total}</strong><span>minutes</span></div></div>
        <section class="panel session-plan"><div class="session-progress-line"><span style="width:${pct}%"></span></div><div class="session-plan-meta"><strong>${done} of ${session.items.length} complete</strong><span>${pct}%</span></div>
          <ol>${session.items.map((item, index) => { const complete = session.completed.includes(index); const href = item.type === "practice" ? `#/practice/${item.challengeId}` : item.type === "review" ? "#/review" : `#/lesson/${item.lessonId}`; return `<li class="${complete ? "complete" : ""} ${index === nextIndex ? "next" : ""}"><span class="step-marker" aria-hidden="true">${complete ? icons.check : index + 1}</span><div><span>${item.type}${index === nextIndex ? " · up next" : complete ? " · done" : ""}</span><h3>${escapeHTML(item.title)}</h3><p>${item.type === "learn" ? "Build the mental model, then retrieve it." : item.type === "review" ? "Recall first; reveal only after committing." : "Solve with fading guidance and self-checks."}</p></div><div class="session-item-action"><small>${item.minutes} min</small><div class="session-item-buttons">${complete ? `<span class="done-label">${icons.check} Done</span>` : `<button type="button" class="button button-secondary button-small" data-action="complete-session-item" data-index="${index}" aria-label="Mark ${escapeHTML(item.title)} done">Mark done</button>`}<a class="button ${index === nextIndex ? "button-primary" : "button-secondary"} button-small" href="${href}">${complete ? "Revisit" : "Open"} ${icons.arrow}</a></div></div></li>`; }).join("")}</ol>
          <div class="session-plan-foot"><p>Completing a step records study time on your heatmap.</p><button class="text-button" data-action="regenerate-session">Regenerate today’s plan</button></div>
        </section>
        ${done === session.items.length ? `<section class="completion-banner"><span>${icons.spark}</span><div><p class="overline">Session complete</p><h2>Good work. Let spacing do its job now.</h2></div><a class="button button-light" href="#/dashboard">Back to today</a></section>` : ""}
      </section>`;
  }

  function renderChapters() {
    const chapter = COURSE_DATA.chapter;
    const mastered = chapter.lessons.filter((lesson) => state.getMastery(lesson.id) >= 3).length;
    const average = Math.round(chapter.lessons.reduce((sum, lesson) => sum + state.getMastery(lesson.id), 0) / (chapter.lessons.length * 5) * 100);
    view.innerHTML = `
      <section class="page-wrap chapter-map-page">
        <div class="page-heading"><p class="overline">Seven interview tracks</p><h1>Your course map</h1><p>Chapter 1 of the Python track is written and ready. The other tracks are mapped but their lessons are not written yet.</p></div>
        <div class="track-strip" role="list" aria-label="Curriculum tracks">${COURSE_DATA.tracks.map((track, index) => `<article class="track-tile ${index === 0 ? "active" : "planned"}" role="listitem" style="--track-color:${track.color}"><span class="track-symbol" aria-hidden="true">${track.icon}</span><div><strong>${track.short}</strong><small>${track.chapters} chapters</small></div><span class="current-pill">${index === 0 ? "Current" : "Planned"}</span></article>`).join("")}</div>
        <section class="chapter-hero panel"><div class="chapter-index"><span>01</span><small>of 08</small></div><div class="chapter-intro"><p class="overline">Python + DSA</p><h2>${chapter.title}</h2><p>${chapter.description}</p><div class="chapter-meta"><span>${chapter.lessons.length} lessons</span><span>≈ 1 hr 45 min</span><span>${mastered}/${chapter.lessons.length} independent</span></div></div><div class="chapter-ring" style="--value:${average}"><strong>${average}%</strong><small>mastery</small></div></section>
        <section class="journey-list" aria-label="Chapter 1 lessons">${chapter.lessons.map((lesson, index) => { const level = state.getMastery(lesson.id); const next = index === chapter.lessons.findIndex((item) => state.getMastery(item.id) === 0); return `<article class="journey-item ${next ? "recommended" : ""}"><div class="journey-line"><span class="journey-node ${level ? "active" : ""}">${level ? "✓" : index + 1}</span></div><div class="journey-copy"><div><span class="lesson-kicker">${lesson.number} · ${lesson.kind === "coding" ? "Coding pattern" : lesson.eyebrow}</span>${next ? `<span class="recommended-label">Recommended next</span>` : ""}</div><h3><a href="#/lesson/${lesson.id}">${lesson.title}</a></h3><p>${lesson.summary}</p><div class="journey-meta">${masteryBadge(level)}<span>${icons.clock}${lesson.duration} min</span></div></div><a href="#/lesson/${lesson.id}" class="journey-action" aria-label="Open ${escapeHTML(lesson.title)}" tabindex="-1">${icons.arrow}</a></article>`; }).join("")}</section>
        <section class="upcoming-tracks"><div class="section-heading"><div><p class="overline">Planned tracks</p><h2>The rest of the journey</h2></div><p>These paths are mapped for later. Their lessons are not available yet.</p></div><div class="upcoming-grid">${COURSE_DATA.tracks.slice(1).map((track) => `<article style="--track-color:${track.color}"><span>${track.icon}</span><div><h3>${track.title}</h3><p>${track.description}</p></div><small>${track.chapters} chapters</small></article>`).join("")}</div></section>
      </section>`;
  }

  function renderLesson(id) {
    const lesson = lessonById(id) || COURSE_DATA.lessons[0];
    const index = COURSE_DATA.lessons.indexOf(lesson);
    const level = state.getMastery(lesson.id);
    const previous = COURSE_DATA.lessons[index - 1];
    const next = COURSE_DATA.lessons[index + 1];
    const feedback = activeLessonFeedback && activeLessonFeedback.lessonId === lesson.id ? activeLessonFeedback : null;
    const question = (feedback && lesson.questions.find((item) => item.id === feedback.questionId)) || pickLessonQuestion(lesson);
    view.innerHTML = `
      <section class="lesson-page"><div class="lesson-progress"><span style="width:${((index + 1) / COURSE_DATA.lessons.length) * 100}%"></span></div><div class="lesson-layout page-wrap">
        <article class="lesson-content"><div class="lesson-breadcrumb"><a href="#/chapters">Chapter 1</a><span>›</span><span>${lesson.number}</span></div>
          <header class="lesson-header"><div class="lesson-number">${lesson.number}</div><p class="overline">${lesson.eyebrow} · ${lesson.duration} min</p><h1>${lesson.title}</h1><p>${lesson.objective}</p><div class="lesson-status">${masteryBadge(level)}${stageDots(level)}</div></header>
          <section class="lesson-section concept-section"><p class="section-index">01</p><div><p class="overline">Mental model</p><h2>The idea to carry forward</h2>${lesson.concept.map((paragraph) => `<p>${paragraph}</p>`).join("")}</div></section>
          ${lesson.id === "big-o" ? `<section class="complexity-scale" aria-label="Common complexity growth rates">${[["O(1)","Constant"],["O(log n)","Logarithmic"],["O(n)","Linear"],["O(n log n)","Linearithmic"],["O(n²)","Quadratic"]].map((item, i) => `<div><span style="--bars:${i + 1}"></span><strong>${item[0]}</strong><small>${item[1]}</small></div>`).join("")}</section>` : ""}
          <section class="lesson-section worked-section"><p class="section-index">02</p><div><p class="overline">Worked example · guidance fades</p><h2>${lesson.workedExample.prompt}</h2><ol class="worked-steps">${lesson.workedExample.steps.map((step, stepIndex) => `<li class="${stepIndex > 0 ? "is-hidden" : ""}"><span>${stepIndex + 1}</span><p>${step}</p></li>`).join("")}</ol><button class="button button-secondary reveal-guidance" data-action="reveal-guidance">Reveal the remaining reasoning</button><div class="takeaway"><strong>Pattern to remember</strong><p>${lesson.workedExample.takeaway}</p></div></div></section>
          <section class="retrieval-check" data-lesson-check="${lesson.id}" data-question-id="${question.id}"><div class="retrieval-head"><span>03</span><div><p class="overline">Retrieval check</p><h2>Commit before you reveal</h2><p>Answer from memory, then rate your confidence.</p></div></div><div class="question-block"><p>${question.prompt}</p>${question.code ? `<pre><code>${escapeHTML(question.code)}</code></pre>` : ""}<div class="answer-options">${question.options.map((option, optionIndex) => `<button class="answer-option ${feedback && feedback.selected === optionIndex ? "selected" : ""} ${feedback ? (optionIndex === question.answer ? "correct" : feedback.selected === optionIndex ? "incorrect" : "") : ""}" data-action="lesson-option" data-value="${optionIndex}" ${feedback ? "disabled" : ""}><span>${String.fromCharCode(65 + optionIndex)}</span>${escapeHTML(option)}</button>`).join("")}</div></div>
            <div class="confidence-row" role="group" aria-label="How sure are you?"><span>How sure are you?</span>${[[1,"Guessing"],[2,"Fairly sure"],[3,"Certain"]].map(([value,label]) => `<button type="button" data-action="lesson-confidence" data-value="${value}" class="${feedback && feedback.confidence === value ? "selected" : ""}" aria-pressed="${Boolean(feedback && feedback.confidence === value)}" ${feedback ? "disabled" : ""}>${label}</button>`).join("")}</div>
            ${feedback ? `<div class="answer-feedback ${feedback.correct ? "success" : "needs-work"}" role="status"><div class="feedback-mark" aria-hidden="true">${feedback.correct ? "✓" : "!"}</div><div><p class="overline">${feedback.correct ? "Correct" : "Useful miss"}</p><h3>${question.explain}</h3><p>${feedback.correct ? `Next review: ${formatDate(state.value.review[lesson.id].due + "T12:00:00")}.` : `${question.misconception} This question was added to your mistake bank and will come back sooner.`}</p></div></div>` : `<button type="button" class="button button-primary check-answer" data-action="submit-lesson-check">Check answer</button>`}
          </section>
          ${lesson.challengeId ? `<section class="coding-bridge"><div><p class="overline">Apply the pattern</p><h2>Turn the idea into working Python.</h2><p>The practice workspace gives you hints gradually and checks the shape of your solution without pretending to execute Python in the browser.</p></div><a class="button button-primary" href="#/practice/${lesson.challengeId}">Open coding practice ${icons.arrow}</a></section>` : ""}
          <section class="misconception-section"><p class="overline">Watch for these traps</p><div>${lesson.misconceptions.map((item) => `<div class="trap"><strong><span aria-hidden="true">✕</span> ${escapeHTML(item.trap)}</strong><p><span aria-hidden="true">✓</span> ${escapeHTML(item.fix)}</p></div>`).join("")}</div></section>
          <footer class="lesson-footer">${previous ? `<a href="#/lesson/${previous.id}" class="lesson-direction"><small>Previous</small><strong>‹ ${previous.title}</strong></a>` : `<span></span>`}${level ? `<span class="lesson-learned-state">${icons.check} ${COURSE_DATA.mastery[level]}${state.value.review[lesson.id] ? ` · review ${formatDate(state.value.review[lesson.id].due + "T12:00:00")}` : ""}</span>` : `<button type="button" class="button button-secondary" data-action="mark-lesson-learned" data-lesson-id="${lesson.id}">Mark as learned</button>`}${next ? `<a href="#/lesson/${next.id}" class="lesson-direction next"><small>Next</small><strong>${next.title} ›</strong></a>` : `<a href="#/review" class="lesson-direction next"><small>Next</small><strong>Cumulative review ›</strong></a>`}</footer>
        </article>
        <aside class="lesson-rail"><div class="rail-card"><p class="overline">Chapter progress</p><strong>${index + 1} / ${COURSE_DATA.lessons.length}</strong><div class="progress-track"><span style="width:${((index + 1) / COURSE_DATA.lessons.length) * 100}%"></span></div></div><div class="rail-card"><label for="lesson-note">Memory note</label><p>Write one sentence you want your future self to recall.</p><textarea id="lesson-note" data-lesson-id="${lesson.id}" rows="5" placeholder="The key idea is…">${escapeHTML(state.value.lessonNotes[lesson.id] || "")}</textarea><small>Saved automatically</small></div><div class="rail-card subtle"><p class="overline">Mastery path</p><ol class="rail-stages" aria-label="Mastery stages">${COURSE_DATA.mastery.map((label, stage) => `<li class="rail-stage ${stage > 0 && stage <= level ? "reached" : ""} ${stage === level ? "current" : ""}" ${stage === level ? 'aria-current="step"' : ""}><i aria-hidden="true">${stage > 0 && stage <= level ? "✓" : stage}</i>${label}${stage === level ? "<small>now</small>" : ""}</li>`).join("")}</ol></div></aside>
      </div></section>`;
  }

  function pickLessonQuestion(lesson) {
    const attempts = {};
    state.value.quizHistory.forEach((result) => { attempts[result.questionId] = (attempts[result.questionId] || 0) + 1; });
    return lesson.questions.slice().sort((a, b) => (attempts[a.id] || 0) - (attempts[b.id] || 0))[0];
  }

  function buildAdaptiveQuiz(specificQuestionId) {
    const all = allQuestions();
    if (specificQuestionId) { const target = all.find((question) => question.id === specificQuestionId); if (target) return [target].concat(all.filter((question) => question.lessonId === target.lessonId && question.id !== target.id).slice(0, 1)); }
    const mistakes = state.value.mistakes.filter((mistake) => !mistake.resolved).map((mistake) => mistake.questionId);
    const dueIds = state.getDueLessons().map((lesson) => lesson.id);
    const ranked = all.slice().sort((a, b) => { const scoreA = (mistakes.includes(a.id) ? 100 : 0) + (dueIds.includes(a.lessonId) ? 40 : 0) + (5 - state.getMastery(a.lessonId)) * 5; const scoreB = (mistakes.includes(b.id) ? 100 : 0) + (dueIds.includes(b.lessonId) ? 40 : 0) + (5 - state.getMastery(b.lessonId)) * 5; return scoreB - scoreA; });
    const interleaved = [];
    ranked.forEach((question) => { const lastSame = interleaved.length && interleaved[interleaved.length - 1].lessonId === question.lessonId; if (lastSame) { const alternateIndex = ranked.findIndex((item) => item.lessonId !== question.lessonId && !interleaved.includes(item)); if (alternateIndex >= 0) interleaved.push(ranked[alternateIndex]); } if (!interleaved.includes(question)) interleaved.push(question); });
    const limit = state.value.intensity === "sprint" ? 3 : state.value.intensity === "deep" ? 7 : 5;
    return interleaved.slice(0, limit);
  }

  function startQuiz(specificQuestionId) { quizRun = { specific: specificQuestionId || null, questions: buildAdaptiveQuiz(specificQuestionId), index: 0, correct: 0, answered: false, selected: null, confidence: null, feedback: null, results: [] }; }

  function renderReview(specificQuestionId, preserve) {
    if (!preserve || !quizRun || quizRun.specific !== (specificQuestionId || null)) startQuiz(specificQuestionId);
    const total = quizRun.questions.length;
    const finished = quizRun.index >= total;
    if (finished) {
      const pct = total ? Math.round((quizRun.correct / total) * 100) : 0;
      const misses = quizRun.results.filter((result) => !result.correct);
      view.innerHTML = `<section class="page-wrap review-page narrow-page"><div class="quiz-finish panel"><div class="finish-ring" style="--score:${pct}"><strong>${pct}%</strong><span>recalled</span></div><p class="overline">Review complete</p><h1>${pct >= 80 ? "Strong retrieval." : "The misses did their job."}</h1><p>${misses.length ? `${misses.length} ${misses.length === 1 ? "idea was" : "ideas were"} added to targeted practice. They’ll return sooner.` : "Every concept was scheduled at a longer interval."}</p><div class="finish-stats"><span><b>${quizRun.correct}</b> correct</span><span><b>${total - quizRun.correct}</b> to revisit</span><span><b>${state.getDueLessons().length}</b> now due</span></div><div class="finish-actions"><button class="button button-secondary" data-action="restart-quiz">Review again</button><a class="button button-primary" href="#/dashboard">Finish session</a></div></div></section>`;
      return;
    }
    const question = quizRun.questions[quizRun.index];
    const lesson = lessonById(question.lessonId);
    const progress = Math.round((quizRun.index / total) * 100);
    view.innerHTML = `<section class="review-page"><div class="review-topline"><div class="review-progress"><span style="width:${progress}%"></span></div><span>${quizRun.index + 1} / ${total}</span></div><div class="page-wrap review-workspace"><aside class="review-context"><p class="overline">Adaptive review</p><h1>Recall first.<br>Then reveal.</h1><p>This queue interleaves topics and prioritizes due concepts, lower mastery, and past mistakes.</p><div class="review-queue-mini"><strong>In this set</strong>${Array.from(new Set(quizRun.questions.map((item) => item.lessonTitle))).map((title) => `<span>${title}</span>`).join("")}</div></aside>
      <section class="quiz-card panel" data-quiz-card><div class="quiz-card-head"><span class="question-number">Q${String(quizRun.index + 1).padStart(2, "0")}</span><div><p class="overline">${lesson.title}</p>${masteryBadge(state.getMastery(lesson.id))}</div></div><h2>${question.prompt}</h2>${question.code ? `<pre class="quiz-code"><code>${escapeHTML(question.code)}</code></pre>` : ""}<div class="answer-options quiz-options">${question.options.map((option, index) => `<button class="answer-option ${quizRun.selected === index ? "selected" : ""} ${quizRun.answered ? (index === question.answer ? "correct" : quizRun.selected === index ? "incorrect" : "") : ""}" data-action="quiz-option" data-value="${index}" ${quizRun.answered ? "disabled" : ""}><span>${String.fromCharCode(65 + index)}</span>${escapeHTML(option)}</button>`).join("")}</div>
        ${quizRun.answered ? `<div class="answer-feedback ${quizRun.feedback.correct ? "success" : "needs-work"}" role="status"><div class="feedback-mark" aria-hidden="true">${quizRun.feedback.correct ? "✓" : "!"}</div><div><p class="overline">${quizRun.feedback.correct ? "Correct" : "Targeted remediation"}</p><h3>${question.explain}</h3><p>${quizRun.feedback.correct ? `Next review: ${formatDate(state.value.review[lesson.id].due + "T12:00:00")}.` : question.misconception}</p></div></div>` : `<div class="confidence-row quiz-confidence" role="group" aria-label="Confidence"><span>How sure are you?</span>${[[1,"Low"],[2,"Medium"],[3,"High"]].map(([value,label]) => `<button type="button" data-action="quiz-confidence" data-value="${value}" class="${quizRun.confidence === value ? "selected" : ""}" aria-pressed="${quizRun.confidence === value}">${label}</button>`).join("")}</div>`}
        <div class="quiz-card-foot"><span>${quizRun.answered ? (quizRun.feedback.correct ? "Spacing increased" : "A related question may appear next") : "Choose an answer and confidence"}</span><button class="button button-primary" data-action="${quizRun.answered ? "next-question" : "submit-quiz-answer"}">${quizRun.answered ? (quizRun.index === total - 1 ? "See results" : "Next question") : "Check answer"} ${icons.arrow}</button></div>
      </section></div></section>`;
  }

  function renderPractice(id) {
    if (!id) {
      view.innerHTML = `<section class="page-wrap practice-index"><div class="page-heading"><p class="overline">Deliberate practice</p><h1>Python pattern lab</h1><p>Solve from a blank-enough page, use hints only when needed, and explain your complexity aloud.</p></div><div class="practice-list">${COURSE_DATA.challenges.map((challenge, index) => { const level = state.getMastery(challenge.lessonId); return `<a class="panel practice-tile" href="#/practice/${challenge.id}"><span class="problem-number">${String(index + 1).padStart(2, "0")}</span><div><span class="difficulty">${challenge.difficulty}</span><h2>${challenge.title}</h2><p>${lessonById(challenge.lessonId).summary}</p><div>${masteryBadge(level)}<span class="draft-state">${state.value.codeDrafts[challenge.id] ? "Draft saved" : "Not started"}</span></div></div><span class="practice-arrow">${icons.arrow}</span></a>`; }).join("")}</div><section class="practice-method panel"><p class="overline">Practice loop</p><div><span><b>1</b>Attempt</span><i>→</i><span><b>2</b>Self-check</span><i>→</i><span><b>3</b>Explain</span><i>→</i><span><b>4</b>Revisit later</span></div></section></section>`;
      return;
    }
    const challenge = challengeById(id) || COURSE_DATA.challenges[0];
    const draft = state.value.codeDrafts[challenge.id] || challenge.starter;
    const feedback = practiceResult && practiceResult.id === challenge.id ? practiceResult : null;
    view.innerHTML = `<section class="practice-workspace-page"><div class="practice-toolbar"><a href="#/practice">‹ All problems</a><div><span class="difficulty">${challenge.difficulty}</span><strong>${challenge.title}</strong></div>${masteryBadge(state.getMastery(challenge.lessonId))}</div><div class="practice-workspace">
      <article class="problem-pane"><p class="overline">Problem</p><h1>${challenge.title}</h1><p>${challenge.prompt}</p><pre class="signature"><code>${escapeHTML(challenge.signature)}</code></pre><h2>Examples</h2>${challenge.examples.map((example) => `<div class="example-case"><span>Input</span><code>${escapeHTML(example.input)}</code><span>Output</span><code>${escapeHTML(example.output)}</code></div>`).join("")}<div class="constraint-note"><strong>Interview constraint</strong><p>Aim for O(n) expected time. Be ready to name the space trade-off.</p></div></article>
      <section class="editor-pane"><div class="editor-head"><div><span class="language-dot" aria-hidden="true"></span>Python 3 · structural self-check only</div><span id="draft-status">${state.value.codeDrafts[challenge.id] && state.value.codeDrafts[challenge.id] !== challenge.starter ? "Draft saved on this device" : "Starter code"}</span></div><div class="editor-shell"><div class="line-numbers" id="line-numbers" aria-hidden="true">${draft.split("\n").map((_, i) => `<span>${i + 1}</span>`).join("")}</div><textarea id="code-editor" spellcheck="false" autocapitalize="off" autocorrect="off" aria-label="Python solution editor" data-challenge-id="${challenge.id}">${escapeHTML(draft)}</textarea></div><p class="editor-note">Your code is not executed. The self-check reads the text of your solution for the expected pattern, so trace the examples by hand to confirm behavior. In the editor, Ctrl+M lets Tab insert four spaces; Escape releases it.</p><div class="editor-actions"><button type="button" class="button button-secondary" data-action="reset-code" data-challenge-id="${challenge.id}">Reset to starter</button><button type="button" class="button button-primary" data-action="check-code" data-challenge-id="${challenge.id}">Self-check solution</button></div>
        <div class="hint-stack"><div class="hint-stack-head"><div><p class="overline">Fading guidance</p><h2>Reveal only what you need</h2></div><span id="hint-count">0 / ${challenge.hints.length}</span></div>${challenge.hints.map((hint, index) => `<details class="hint-card"><summary><span>Hint ${index + 1}</span>${index === 0 ? "Question" : index === challenge.hints.length - 1 ? "Pseudocode" : "Direction"}</summary><p>${hint}</p></details>`).join("")}</div>
        ${feedback ? `<section class="code-feedback ${feedback.passed ? "passed" : "partial"}"><div><span>${feedback.passed ? "✓" : "△"}</span><div><p class="overline">${feedback.passed ? "Structure looks strong" : "Keep iterating"}</p><h2>${feedback.passed ? "Your solution matches the intended pattern." : "Some self-checks need attention."}</h2></div></div><ul>${feedback.checks.map((check) => `<li class="${check.passed ? "pass" : "fail"}"><span aria-hidden="true">${check.passed ? "✓" : "○"}</span> ${check.label} <em>${check.passed ? "pass" : "not yet"}</em></li>`).join("")}</ul><p>This browser-only check inspects structure; it does not execute Python. Compare behavior against the examples and trace edge cases by hand.</p><details><summary>Compare with a reference solution</summary><pre><code>${escapeHTML(challenge.solution)}</code></pre><p>${challenge.explanation}</p></details></section>` : ""}
      </section></div></section>`;
    sizeEditor(document.getElementById("code-editor"));
  }

  function renderMistakes() {
    const open = state.value.mistakes.filter((mistake) => !mistake.resolved);
    const resolved = state.value.mistakes.filter((mistake) => mistake.resolved);
    view.innerHTML = `<section class="page-wrap mistakes-page"><div class="page-heading split-heading"><div><p class="overline">Targeted remediation</p><h1>Mistake bank</h1><p>Errors are saved as practice targets, not scores to hide.</p></div><div class="mistake-count"><strong>${open.length}</strong><span>open ideas</span></div></div>
      ${open.length ? `<div class="mistake-grid">${open.map((mistake) => { const lesson = lessonById(mistake.lessonId); return `<article class="panel mistake-card"><div class="mistake-card-head"><span>${lesson.number}</span><div><p class="overline">${lesson.title}</p><small>Missed ${mistake.count}× · ${formatDate(mistake.lastSeen)}</small></div><span class="confidence-tag">${["","Low","Medium","High"][mistake.confidence] || "Unrated"} confidence</span></div><h2>${escapeHTML(mistake.prompt)}</h2><div class="misconception-note"><strong>Correct the model</strong><p>${escapeHTML(mistake.misconception)}</p></div><div class="mistake-actions"><button class="text-button" data-action="resolve-mistake" data-mistake-id="${mistake.id}">I’ve corrected this</button><a class="button button-primary" href="#/review/${mistake.questionId}">Practice now ${icons.arrow}</a></div></article>`; }).join("")}</div>` : emptyState("△", "No open mistakes yet", "Complete a retrieval check. Any miss will become a focused future review.", `<a class="button button-primary" href="#/review">Start a calibration review</a>`)}
      ${resolved.length ? `<details class="resolved-list"><summary>${resolved.length} corrected ${resolved.length === 1 ? "idea" : "ideas"}</summary><div>${resolved.map((mistake) => `<span>${lessonById(mistake.lessonId).title} · ${escapeHTML(mistake.prompt)}</span>`).join("")}</div></details>` : ""}</section>`;
  }

  function buildHeatmap() {
    const days = [];
    const today = new Date();
    const mondayOffset = (today.getDay() + 6) % 7;
    const start = 11 * 7 + mondayOffset;
    for (let offset = start; offset >= 0; offset -= 1) { const date = new Date(); date.setDate(date.getDate() - offset); const key = state.localDateKey(date); const value = state.value.activity[key] || 0; const level = value === 0 ? 0 : value < 10 ? 1 : value < 25 ? 2 : value < 45 ? 3 : 4; days.push(`<i class="heat-${level} ${offset === 0 ? "today" : ""}" title="${key}: ${value} min"></i>`); }
    while (days.length % 7 !== 0) days.push(`<i class="heat-future" title="Upcoming"></i>`);
    return days.join("");
  }

  function renderProgress() {
    const levels = COURSE_DATA.lessons.map((lesson) => state.getMastery(lesson.id));
    const average = Math.round(levels.reduce((sum, level) => sum + level, 0) / (levels.length * 5) * 100);
    const quizAverage = state.value.quizHistory.length ? Math.round(state.value.quizHistory.filter((result) => result.correct).length / state.value.quizHistory.length * 100) : 0;
    view.innerHTML = `<section class="page-wrap progress-page"><div class="page-heading"><p class="overline">Mastery, not activity theater</p><h1>Progress</h1><p>Readiness grows when recall survives time, variation, and interview conditions.</p></div>
      <div class="progress-summary"><article class="panel"><span>Overall mastery</span><strong>${average}%</strong><div class="progress-track"><span style="width:${average}%"></span></div></article><article class="panel"><span>Retrieval accuracy</span><strong>${quizAverage}%</strong><small>${state.value.quizHistory.length} answered</small></article><article class="panel"><span>Focused time</span><strong>${state.value.totalMinutes}<em>m</em></strong><small>${state.value.sessionsCompleted} sessions completed</small></article><article class="panel"><span>Current streak</span><strong>${state.value.streak}<em>d</em></strong><small>Consistency without guilt</small></article></div>
      <div class="progress-main-grid"><section class="panel mastery-table-card"><div class="section-heading"><div><p class="overline">Chapter 1</p><h2>Mastery map</h2></div><span>Stages 0 to 5</span></div><div class="mastery-table">${COURSE_DATA.lessons.map((lesson) => { const level = state.getMastery(lesson.id); return `<a href="#/lesson/${lesson.id}"><div><span>${lesson.number}</span><strong>${lesson.title}</strong></div>${stageDots(level)}<span class="mastery-label">${COURSE_DATA.mastery[level]}</span></a>`; }).join("")}</div></section><section class="panel heatmap-card"><div class="section-heading"><div><p class="overline">Last 12 weeks</p><h2>Study rhythm</h2></div></div><div class="heatmap-wrap"><div class="heat-weekdays" aria-hidden="true"><span>Mon</span><span>Wed</span><span>Fri</span></div><div class="heatmap" role="img" aria-label="Twelve-week study activity heatmap. ${Object.keys(state.value.activity).length} active days, ${state.value.totalMinutes} minutes in total.">${buildHeatmap()}</div></div><div class="heat-legend" aria-hidden="true"><span>Less</span>${[0,1,2,3,4].map((level) => `<i class="heat-${level}"></i>`).join("")}<span>More</span></div><p>Minutes are recorded when you complete lessons, reviews, or session steps.</p></section></div>
      <section class="panel scale-card"><div><p class="overline">How mastery works</p><h2>Six stages, each earned differently</h2></div><ol>${COURSE_DATA.mastery.map((label, index) => `<li class="${levels.some((level) => level >= index) ? "active" : ""}"><span>${index}</span><strong>${label}</strong><p>${["Not studied yet.","Completed the mental model.","Correct on a retrieval check.","Passed a coding self-check, or recalled with confidence.","Recalled correctly on a review that came due after spacing.","Reliable under timed conditions. Earned in the mock-interview track, which is planned but not written yet."][index]}</p></li>`).join("")}</ol></section>
    </section>`;
  }

  function renderSettings() {
    view.innerHTML = `<section class="page-wrap settings-page narrow-page"><div class="page-heading"><p class="overline">Study settings</p><h1>Choose a sustainable pace</h1><p>Your intensity changes the daily mix, not the standards for mastery.</p></div>
      <section class="panel settings-section"><div><p class="overline">Daily intensity</p><h2>How much focus do you have?</h2></div><div class="intensity-grid">${Object.values(COURSE_DATA.studyModes).map((mode) => `<label class="intensity-option ${state.value.intensity === mode.id ? "selected" : ""}"><input type="radio" name="intensity" value="${mode.id}" ${state.value.intensity === mode.id ? "checked" : ""}><span class="intensity-time">${mode.minutes}<small>min</small></span><strong>${mode.label}</strong><p>${mode.learn} new lesson${mode.learn > 1 ? "s" : ""} · ${mode.review} reviews${mode.practice ? " · coding" : ""}</p></label>`).join("")}</div></section>
      <section class="panel settings-section storage-section"><div><p class="overline">Local progress</p><h2>Your data stays on this device</h2><p>Progress, code drafts, mistake history, notes, and settings are stored only in this browser’s local storage.</p></div><div class="storage-actions"><button class="button button-secondary" data-action="export-progress">Export backup</button><button class="danger-button" data-action="reset-progress">Reset all progress</button></div></section>
      <section class="learning-method"><p class="overline">Built into every session</p><div>${["Retrieval before reveal","Spaced repetition","Interleaved topics","Confidence calibration","Immediate explanation","Misconception repair"].map((item) => `<span>${icons.check}${item}</span>`).join("")}</div></section>
    </section>`;
  }

  function handleLessonAnswer() {
    const block = document.querySelector("[data-lesson-check]"); const selected = block.querySelector(".answer-option.selected"); const confidence = block.querySelector(".confidence-row button.selected");
    if (!selected || !confidence) { toast("Choose an answer and a confidence rating first."); return; }
    const lesson = lessonById(block.dataset.lessonCheck); const question = lesson.questions.find((item) => item.id === block.dataset.questionId) || lesson.questions[0]; const choice = Number(selected.dataset.value); const confidenceValue = Number(confidence.dataset.value); const correct = choice === question.answer;
    activeLessonFeedback = { lessonId: lesson.id, questionId: question.id, selected: choice, confidence: confidenceValue, correct };
    if (correct) { state.setMastery(lesson.id, Math.max(2, state.getMastery(lesson.id)), "quiz"); state.scheduleReview(lesson.id, confidenceValue === 3 ? 5 : confidenceValue === 2 ? 4 : 3); }
    else { state.setMastery(lesson.id, Math.max(1, state.getMastery(lesson.id)), "quiz"); state.addMistake({ questionId: question.id, lessonId: lesson.id, prompt: question.prompt, misconception: question.misconception, confidence: confidenceValue, userAnswer: question.options[choice] }); }
    state.recordQuiz({ questionId: question.id, lessonId: lesson.id, correct, confidence: confidenceValue, mode: "lesson" }); renderLesson(lesson.id);
  }

  function handleQuizAnswer() {
    if (quizRun.selected == null || quizRun.confidence == null) { toast("Choose an answer and confidence before checking."); return; }
    const question = quizRun.questions[quizRun.index]; const lesson = lessonById(question.lessonId); const correct = quizRun.selected === question.answer;
    quizRun.answered = true; quizRun.feedback = { correct }; quizRun.correct += correct ? 1 : 0; quizRun.results.push({ questionId: question.id, lessonId: lesson.id, correct, confidence: quizRun.confidence });
    if (correct) { const current = state.getMastery(lesson.id); const reviewMeta = state.value.review[lesson.id]; const wasDue = Boolean(reviewMeta && reviewMeta.due <= state.localDateKey()); let nextLevel = current; if (current < 2) nextLevel = 2; else if (current === 2 && quizRun.confidence >= 2) nextLevel = 3; else if (current === 3 && wasDue && quizRun.confidence >= 2) nextLevel = 4; state.setMastery(lesson.id, nextLevel, "quiz"); state.scheduleReview(lesson.id, quizRun.confidence === 3 ? 5 : quizRun.confidence === 2 ? 4 : 3); const priorMistake = state.value.mistakes.find((mistake) => mistake.questionId === question.id && !mistake.resolved); if (priorMistake && quizRun.confidence >= 2) state.resolveMistake(priorMistake.id); }
    else { state.addMistake({ questionId: question.id, lessonId: lesson.id, prompt: question.prompt, misconception: question.misconception, confidence: quizRun.confidence, userAnswer: question.options[quizRun.selected] }); const related = allQuestions().find((item) => item.lessonId === lesson.id && item.id !== question.id && !quizRun.questions.slice(quizRun.index + 1).some((queued) => queued.id === item.id)); if (related) quizRun.questions.splice(quizRun.index + 1, 0, related); }
    state.recordQuiz({ questionId: question.id, lessonId: lesson.id, correct, confidence: quizRun.confidence, mode: "review" }); renderReview(quizRun.specific, true);
  }

  function handleCodeCheck(challengeId) {
    const challenge = challengeById(challengeId); const code = document.getElementById("code-editor").value;
    if (code.trim() === challenge.starter.trim() || !code.trim()) { toast("Write an attempt first, then self-check it."); document.getElementById("code-editor").focus(); return; }
    const source = stripComments(code);
    const checks = challenge.checks.map((check) => ({ label: check.label, passed: runCheck(check, source) }));
    const passed = checks.every((check) => check.passed) && !/^\s*pass\s*$/m.test(source); practiceResult = { id: challenge.id, passed, checks }; state.saveDraft(challenge.id, code);
    if (passed) { state.setMastery(challenge.lessonId, Math.max(3, state.getMastery(challenge.lessonId)), "quiz"); state.scheduleReview(challenge.lessonId, 4); }
    else state.addMistake({ questionId: `code-${challenge.id}`, lessonId: challenge.lessonId, prompt: `Implement ${challenge.title} with the intended O(n) pattern.`, misconception: "Review the failed self-checks, trace an example, and explain what information your data structure stores.", confidence: 1, userAnswer: "Code attempt" });
    renderPractice(challenge.id); setTimeout(() => document.querySelector(".code-feedback")?.scrollIntoView({ behavior: "smooth", block: "center" }), 20);
  }

  function stripComments(code) {
    return code.split("\n").map((line) => {
      let out = ""; let quote = null;
      for (let i = 0; i < line.length; i += 1) {
        const ch = line[i];
        if (quote) { out += ch; if (ch === quote && line[i - 1] !== "\\") quote = null; continue; }
        if (ch === "'" || ch === '"') { quote = ch; out += ch; continue; }
        if (ch === "#") break;
        out += ch;
      }
      return out;
    }).join("\n");
  }

  function hasNestedLoops(source) {
    const stack = [];
    for (const raw of source.split("\n")) {
      if (!raw.trim()) continue;
      const indent = raw.match(/^\s*/)[0].length;
      while (stack.length && indent <= stack[stack.length - 1]) stack.pop();
      if (/^\s*(for|while)\b/.test(raw)) { if (stack.length) return true; stack.push(indent); }
    }
    return false;
  }

  function runCheck(check, source) {
    if (check.kind === "no-nested-loops") return !hasNestedLoops(source);
    if (check.kind === "order") { const first = source.search(check.first); const second = source.search(check.second); if (second < 0) return true; return first >= 0 && first < second; }
    if (check.pattern) return check.pattern.test(source);
    if (check.reject) return !check.reject.test(source);
    return true;
  }

  function exportProgress() { const blob = new Blob([JSON.stringify(state.value, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const link = document.createElement("a"); link.href = url; link.download = `interview-journey-backup-${state.localDateKey()}.json`; link.click(); URL.revokeObjectURL(url); toast("Progress backup downloaded."); }

  function setChrome(routeName) {
    const labels = { dashboard: "Today", session: "Study session", chapters: "Chapter map", lesson: "Lesson", review: "Adaptive review", practice: "Practice", mistakes: "Mistake bank", progress: "Progress", settings: "Study settings" };
    document.getElementById("route-title").textContent = labels[routeName] || "Today"; document.title = `${labels[routeName] || "Today"} · Data Science Interview Journey`; const navRoute = routeName === "lesson" ? "chapters" : routeName === "session" ? "dashboard" : routeName;
    document.querySelectorAll("[data-route]").forEach((element) => { const active = element.dataset.route === navRoute; element.classList.toggle("active", active); if (active) element.setAttribute("aria-current", "page"); else element.removeAttribute("aria-current"); }); const mode = COURSE_DATA.studyModes[state.value.intensity]; document.getElementById("intensity-label").textContent = `${mode.label} · ${mode.minutes} min`; document.getElementById("intensity-shortcut").setAttribute("aria-label", `Study intensity: ${mode.label}, ${mode.minutes} minutes. Open study settings.`); document.getElementById("streak-count").textContent = state.value.streak; document.querySelector(".streak-chip").setAttribute("aria-label", `${state.value.streak} day study streak`);
  }

  function route() {
    const parts = location.hash.replace(/^#\//, "").split("/").filter(Boolean); const routeName = parts[0] || "dashboard"; setChrome(routeName);
    if (routeName !== "lesson") activeLessonFeedback = null; if (routeName !== "practice") practiceResult = null;
    switch (routeName) { case "dashboard": renderDashboard(); break; case "session": renderSession(); break; case "chapters": renderChapters(); break; case "lesson": renderLesson(parts[1]); break; case "review": renderReview(parts[1], false); break; case "practice": renderPractice(parts[1]); break; case "mistakes": renderMistakes(); break; case "progress": renderProgress(); break; case "settings": renderSettings(); break; default: renderDashboard(); }
    closeNav(); window.scrollTo(0, 0); view.focus({ preventScroll: true });
  }

  function closeNav() { document.body.classList.remove("nav-open"); document.getElementById("menu-button").setAttribute("aria-expanded", "false"); }

  function registerWebMCP() {
    const context = document.modelContext; if (!context || typeof context.registerTool !== "function") return;
    const tools = [
      { name: "get_today_study_plan", title: "Read today’s study plan", description: "Return the locally generated study steps for today without changing progress.", inputSchema: { type: "object", properties: {}, additionalProperties: false }, annotations: { readOnlyHint: true, untrustedContentHint: false }, execute() { const session = state.getSession(); return { intensity: state.value.intensity, completed: session.completed.length, items: session.items }; } },
      { name: "set_study_intensity", title: "Set study intensity", description: "Choose sprint, steady, or deep mode and regenerate today’s local study plan.", inputSchema: { type: "object", properties: { intensity: { type: "string", enum: ["sprint", "steady", "deep"] } }, required: ["intensity"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { state.setIntensity(input.intensity); route(); return { intensity: input.intensity, plan: state.getSession().items }; } },
      { name: "mark_lesson_learned", title: "Mark lesson learned", description: "Mark one seeded Chapter 1 lesson as learned and schedule its first review.", inputSchema: { type: "object", properties: { lessonId: { type: "string", enum: COURSE_DATA.lessons.map((lesson) => lesson.id) } }, required: ["lessonId"], additionalProperties: false }, annotations: { readOnlyHint: false, untrustedContentHint: false }, execute(input) { state.setMastery(input.lessonId, Math.max(1, state.getMastery(input.lessonId)), "lesson"); const review = state.scheduleReview(input.lessonId, 3); route(); return { lessonId: input.lessonId, mastery: COURSE_DATA.mastery[state.getMastery(input.lessonId)], reviewDue: review.due }; } }
    ];
    tools.forEach((tool) => { try { Promise.resolve(context.registerTool(tool)).catch(() => {}); } catch (_) {} });
  }

  document.querySelectorAll("[data-icon]").forEach((node) => { node.innerHTML = icons[node.dataset.icon] || ""; });
  document.getElementById("intensity-shortcut").addEventListener("click", () => { location.hash = "#/settings"; });
  document.getElementById("menu-button").addEventListener("click", () => { const open = document.body.classList.toggle("nav-open"); document.getElementById("menu-button").setAttribute("aria-expanded", String(open)); if (open) { const first = document.querySelector(".primary-nav a.active") || document.querySelector(".primary-nav a"); if (first) first.focus(); } });
  document.getElementById("nav-scrim").addEventListener("click", closeNav);
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && document.body.classList.contains("nav-open")) { closeNav(); document.getElementById("menu-button").focus(); } });

  document.addEventListener("change", (event) => { if (event.target.matches('input[name="intensity"]')) { state.setIntensity(event.target.value); toast(`${COURSE_DATA.studyModes[event.target.value].label} mode selected. Today’s plan was refreshed.`); renderSettings(); setChrome("settings"); } });
  document.addEventListener("input", (event) => {
    if (event.target.id === "lesson-note") { state.value.lessonNotes[event.target.dataset.lessonId] = event.target.value; state.save(); }
    if (event.target.id === "code-editor") { state.saveDraft(event.target.dataset.challengeId, event.target.value); document.getElementById("draft-status").textContent = "Draft saved on this device"; document.getElementById("line-numbers").innerHTML = event.target.value.split("\n").map((_, i) => `<span>${i + 1}</span>`).join(""); sizeEditor(event.target); }
  });
  function sizeEditor(editor) { if (!editor) return; editor.style.height = "auto"; editor.style.height = Math.max(editor.scrollHeight, 320) + "px"; }
  document.addEventListener("keydown", (event) => {
    if (event.target.id === "code-editor" && event.key === "Tab" && !event.shiftKey && !event.ctrlKey && !event.metaKey && event.target.dataset.tabIndent === "on") {
      event.preventDefault(); const editor = event.target; const start = editor.selectionStart; const end = editor.selectionEnd; editor.setRangeText("    ", start, end, "end"); editor.dispatchEvent(new Event("input", { bubbles: true }));
    }
    if (event.target.id === "code-editor" && event.key === "Escape") { event.target.dataset.tabIndent = "off"; toast("Tab now moves focus. Press Ctrl+M in the editor to indent with Tab again."); }
    if (event.target.id === "code-editor" && event.key === "m" && event.ctrlKey) { event.preventDefault(); event.target.dataset.tabIndent = event.target.dataset.tabIndent === "on" ? "off" : "on"; toast(event.target.dataset.tabIndent === "on" ? "Tab inserts four spaces. Press Escape to release it." : "Tab now moves focus."); }
  });
  document.addEventListener("toggle", (event) => { if (event.target.matches(".hint-card")) { const total = document.querySelectorAll(".hint-card[open]").length; const count = document.getElementById("hint-count"); if (count) count.textContent = `${total} / ${document.querySelectorAll(".hint-card").length}`; } }, true);
  document.addEventListener("click", (event) => {
    const control = event.target.closest("[data-action]"); if (!control) return; const action = control.dataset.action;
    if (action === "reveal-guidance") { document.querySelectorAll(".worked-steps .is-hidden").forEach((step) => step.classList.remove("is-hidden")); control.remove(); }
    if (action === "lesson-option") { control.parentElement.querySelectorAll("button").forEach((button) => button.classList.remove("selected")); control.classList.add("selected"); }
    if (action === "lesson-confidence") { control.parentElement.querySelectorAll("button").forEach((button) => button.classList.remove("selected")); control.classList.add("selected"); }
    if (action === "submit-lesson-check") handleLessonAnswer();
    if (action === "mark-lesson-learned") { const id = control.dataset.lessonId; if (state.getMastery(id) > 0) { renderLesson(id); return; } state.setMastery(id, 1, "lesson"); const review = state.scheduleReview(id, 3); toast(`Marked as learned. Review scheduled for ${formatDate(review.due + "T12:00:00")}.`); renderLesson(id); }
    if (action === "quiz-option" && !quizRun.answered) { quizRun.selected = Number(control.dataset.value); renderReview(quizRun.specific, true); }
    if (action === "quiz-confidence" && !quizRun.answered) { quizRun.confidence = Number(control.dataset.value); renderReview(quizRun.specific, true); }
    if (action === "submit-quiz-answer") handleQuizAnswer();
    if (action === "next-question") { quizRun.index += 1; quizRun.answered = false; quizRun.selected = null; quizRun.confidence = null; quizRun.feedback = null; renderReview(quizRun.specific, true); }
    if (action === "restart-quiz") { startQuiz(quizRun.specific); renderReview(quizRun.specific, true); }
    if (action === "complete-session-item") { state.completeSessionItem(Number(control.dataset.index)); renderSession(); setChrome("session"); }
    if (action === "regenerate-session") { state.value.session = null; state.save(); state.buildSession(); renderSession(); toast("Today’s plan has been refreshed."); }
    if (action === "check-code") handleCodeCheck(control.dataset.challengeId);
    if (action === "reset-code") { const challenge = challengeById(control.dataset.challengeId); const current = (state.value.codeDrafts[challenge.id] || challenge.starter).trim(); if (current !== challenge.starter.trim() && !window.confirm("Replace your saved draft with the starter code?")) return; state.saveDraft(challenge.id, challenge.starter); practiceResult = null; renderPractice(challenge.id); }
    if (action === "resolve-mistake") { state.resolveMistake(control.dataset.mistakeId); renderMistakes(); toast("Moved to corrected ideas."); }
    if (action === "export-progress") exportProgress();
    if (action === "reset-progress" && window.confirm("Reset all lessons, reviews, mistakes, notes, and code drafts? This cannot be undone.")) { state.reset(); quizRun = null; toast("Progress reset."); renderSettings(); setChrome("settings"); }
  });

  window.addEventListener("hashchange", route);
  route();
  registerWebMCP();
})();
