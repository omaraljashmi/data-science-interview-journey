(function () {
  "use strict";

  const STORAGE_KEY = "ds-interview-journey-v1";
  const DAY = 86400000;

  function localDateKey(date) {
    const d = date || new Date();
    return [d.getFullYear(), String(d.getMonth() + 1).padStart(2, "0"), String(d.getDate()).padStart(2, "0")].join("-");
  }

  function defaultState() {
    return {
      version: 1,
      intensity: "steady",
      mastery: {},
      review: {},
      mistakes: [],
      activity: {},
      streak: 0,
      lastStudyDate: null,
      totalMinutes: 0,
      sessionsCompleted: 0,
      quizHistory: [],
      codeDrafts: {},
      lessonNotes: {},
      session: null
    };
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && saved.version === 1 ? Object.assign(defaultState(), saved) : defaultState();
    } catch (_) {
      return defaultState();
    }
  }

  let state = load();

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function markActivity(minutes) {
    const today = localDateKey();
    const previous = state.lastStudyDate;
    if (previous !== today) {
      if (!previous) state.streak = 1;
      else {
        const diff = Math.round((new Date(today + "T12:00:00") - new Date(previous + "T12:00:00")) / DAY);
        state.streak = diff === 1 ? state.streak + 1 : 1;
      }
      state.lastStudyDate = today;
    }
    state.activity[today] = (state.activity[today] || 0) + (minutes || 1);
    state.totalMinutes += minutes || 1;
  }

  function getMastery(id) {
    return state.mastery[id] || 0;
  }

  function setMastery(id, level, reason) {
    const old = getMastery(id);
    state.mastery[id] = Math.max(0, Math.min(5, level));
    if (reason !== "silent") markActivity(reason === "lesson" ? 8 : 3);
    save();
    return { old, current: state.mastery[id] };
  }

  function scheduleReview(lessonId, quality) {
    const current = state.review[lessonId] || { interval: 0, ease: 2.35, repetitions: 0, due: localDateKey() };
    let interval;
    let repetitions = current.repetitions;
    let ease = current.ease;
    if (quality < 3) {
      repetitions = 0;
      interval = 1;
      ease = Math.max(1.3, ease - 0.2);
    } else {
      repetitions += 1;
      interval = repetitions === 1 ? 1 : repetitions === 2 ? 3 : Math.max(4, Math.round((current.interval || 3) * ease));
      ease = Math.max(1.3, ease + (quality === 5 ? 0.12 : quality === 4 ? 0.04 : -0.05));
    }
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + interval);
    state.review[lessonId] = { interval, ease, repetitions, due: localDateKey(dueDate), lastQuality: quality };
    save();
    return state.review[lessonId];
  }

  function addMistake(entry) {
    const existing = state.mistakes.find((m) => m.questionId === entry.questionId && !m.resolved);
    if (existing) {
      existing.count += 1;
      existing.lastSeen = new Date().toISOString();
      existing.confidence = entry.confidence;
      existing.userAnswer = entry.userAnswer;
    } else {
      state.mistakes.unshift(Object.assign({
        id: "mistake-" + Date.now() + "-" + Math.random().toString(36).slice(2, 6),
        count: 1,
        resolved: false,
        createdAt: new Date().toISOString(),
        lastSeen: new Date().toISOString()
      }, entry));
    }
    scheduleReview(entry.lessonId, 1);
    save();
  }

  function resolveMistake(id) {
    const item = state.mistakes.find((m) => m.id === id);
    if (item) {
      item.resolved = true;
      item.resolvedAt = new Date().toISOString();
      save();
    }
  }

  function getDueLessons() {
    const today = localDateKey();
    return COURSE_DATA.lessons.filter((lesson) => state.review[lesson.id] && state.review[lesson.id].due <= today);
  }

  function buildSession() {
    const mode = COURSE_DATA.studyModes[state.intensity];
    const due = getDueLessons().sort((a, b) => state.review[a.id].due.localeCompare(state.review[b.id].due));
    const low = COURSE_DATA.lessons.filter((l) => getMastery(l.id) < 2).sort((a, b) => getMastery(a.id) - getMastery(b.id));
    const learn = low.slice(0, mode.learn);
    const review = due.slice(0, mode.review);
    const challenge = mode.practice ? COURSE_DATA.challenges.find((c) => getMastery(c.lessonId) < 4) : null;
    const items = [];
    learn.forEach((l) => items.push({ type: "learn", lessonId: l.id, title: l.title, minutes: Math.min(18, l.duration) }));
    review.forEach((l) => {
      if (!items.some((x) => x.lessonId === l.id)) items.push({ type: "review", lessonId: l.id, title: l.title, minutes: 6 });
    });
    if (!review.length) {
      COURSE_DATA.lessons.filter((l) => getMastery(l.id) > 0).slice(0, Math.min(2, mode.review)).forEach((l) => {
        if (!items.some((x) => x.lessonId === l.id)) items.push({ type: "review", lessonId: l.id, title: l.title, minutes: 6 });
      });
    }
    if (challenge && !items.some((x) => x.type === "practice" && x.lessonId === challenge.lessonId)) {
      items.push({ type: "practice", lessonId: challenge.lessonId, challengeId: challenge.id, title: challenge.title, minutes: 16 });
    }
    if (!items.length) items.push({ type: "review", lessonId: "big-o", title: "Big-O Complexity", minutes: 8 });
    state.session = { date: localDateKey(), items, completed: [] };
    save();
    return state.session;
  }

  function completeSessionItem(index) {
    const session = getSession();
    if (!session.completed.includes(index)) {
      session.completed.push(index);
      markActivity(session.items[index] ? session.items[index].minutes : 2);
      if (session.completed.length === session.items.length) state.sessionsCompleted += 1;
      save();
    }
    return session;
  }

  function recordQuiz(result) {
    state.quizHistory.unshift(Object.assign({ at: new Date().toISOString() }, result));
    state.quizHistory = state.quizHistory.slice(0, 100);
    save();
  }

  function setIntensity(id) {
    if (!COURSE_DATA.studyModes[id]) throw new Error("Unknown study intensity");
    state.intensity = id;
    state.session = null;
    save();
  }

  function saveDraft(challengeId, code) {
    state.codeDrafts[challengeId] = code;
    save();
  }

  function getSession() {
    return state.session && state.session.date === localDateKey() ? state.session : buildSession();
  }

  function reset() {
    state = defaultState();
    save();
  }

  window.CourseState = {
    get value() { return state; },
    save,
    reset,
    localDateKey,
    getMastery,
    setMastery,
    scheduleReview,
    addMistake,
    resolveMistake,
    getDueLessons,
    buildSession,
    getSession,
    completeSessionItem,
    recordQuiz,
    setIntensity,
    saveDraft,
    markActivity
  };
})();
