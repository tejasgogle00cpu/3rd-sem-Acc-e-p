import type { FillBlankChallenge, QuizQuestion, StudyModule, UserProgress } from '../types/study';

export function buildYouTubeSearchUrl(query: string): string {
  const cleaned = query.trim().replace(/\s+/g, ' ');
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(cleaned)}`;
}

export function normalizeAnswerText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/₹|rs\.?|inr/gi, '')
    .replace(/,/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function parseNumericCandidate(raw: string): number | null {
  const cleaned = normalizeAnswerText(raw).replace(/%$/g, '');
  if (!cleaned || !/^-?\d+(\.\d+)?$/.test(cleaned)) {
    return null;
  }
  const num = Number(cleaned);
  return Number.isFinite(num) ? num : null;
}

export function checkFillBlankAnswer(
  userInput: string,
  challenge: Pick<FillBlankChallenge, 'acceptedAnswers' | 'numericTolerance'>
): boolean {
  const trimmed = userInput.trim();
  if (!trimmed) return false;

  const normalizedUser = normalizeAnswerText(trimmed);
  const userNum = parseNumericCandidate(trimmed);
  const tolerance = challenge.numericTolerance ?? 0.5;

  for (const expected of challenge.acceptedAnswers) {
    const normalizedExpected = normalizeAnswerText(expected);
    if (normalizedUser === normalizedExpected) {
      return true;
    }

    if (userNum !== null) {
      const expectedNum = parseNumericCandidate(expected);
      if (expectedNum !== null && Math.abs(userNum - expectedNum) <= tolerance) {
        return true;
      }
    }
  }

  return false;
}

export function calculateStreakPoints(nextStreak: number): number {
  const base = 15;
  const bonus = Math.min(nextStreak - 1, 5) * 5;
  return base + Math.max(0, bonus);
}

export function evaluateQuizSelection(
  question: Pick<QuizQuestion, 'id' | 'correctIndex'>,
  selectedIndex: number,
  currentStreak: number,
  bestStreak: number
): {
  isCorrect: boolean;
  nextStreak: number;
  nextBestStreak: number;
  pointsEarned: number;
} {
  const isCorrect = selectedIndex === question.correctIndex;
  if (isCorrect) {
    const nextStreak = currentStreak + 1;
    return {
      isCorrect: true,
      nextStreak,
      nextBestStreak: Math.max(bestStreak, nextStreak),
      pointsEarned: calculateStreakPoints(nextStreak),
    };
  }
  return {
    isCorrect: false,
    nextStreak: 0,
    nextBestStreak: bestStreak,
    pointsEarned: 0,
  };
}

export function computeModuleMastery(mod: StudyModule, progress: UserProgress): {
  completedItems: number;
  totalItems: number;
  percent: number;
} {
  const totalItems =
    mod.flashcards.length +
    mod.quiz.length +
    mod.fillBlanks.length +
    (mod.matchPairs.length > 0 ? 1 : 0);

  if (totalItems === 0) {
    return { completedItems: 0, totalItems: 0, percent: 0 };
  }

  const flashIds = new Set(mod.flashcards.map((c) => c.id));
  const quizIds = new Set(mod.quiz.map((q) => q.id));
  const blankIds = new Set(mod.fillBlanks.map((b) => b.id));

  const masteredFlash = progress.masteredFlashcards.filter((id) => flashIds.has(id)).length;
  const solvedQuiz = progress.solvedQuizIds.filter((id) => quizIds.has(id)).length;
  const solvedBlanks = progress.solvedBlankIds.filter((id) => blankIds.has(id)).length;
  const matchDone = progress.bestMatchTimesMs[mod.id] ? 1 : 0;

  const completedItems = masteredFlash + solvedQuiz + solvedBlanks + matchDone;
  const percent = Math.min(100, Math.round((completedItems / totalItems) * 100));

  return { completedItems, totalItems, percent };
}

export function computeOverallReadiness(modules: StudyModule[], progress: UserProgress): {
  completedItems: number;
  totalItems: number;
  percent: number;
} {
  let completedItems = 0;
  let totalItems = 0;

  for (const mod of modules) {
    const m = computeModuleMastery(mod, progress);
    completedItems += m.completedItems;
    totalItems += m.totalItems;
  }

  const percent = totalItems === 0 ? 0 : Math.min(100, Math.round((completedItems / totalItems) * 100));
  return { completedItems, totalItems, percent };
}

export function formatElapsedTime(ms: number): string {
  const roundedTenths = Math.round(Math.max(0, ms) / 100) / 10;
  if (roundedTenths < 60) {
    return `${roundedTenths.toFixed(1)}s`;
  }
  const mins = Math.floor(roundedTenths / 60);
  const secs = (roundedTenths % 60).toFixed(1).padStart(4, '0');
  return `${mins}m ${secs}s`;
}

export function createInitialProgress(): UserProgress {
  return {
    masteredFlashcards: [],
    reviewQueueFlashcards: [],
    solvedQuizIds: [],
    missedQuizIds: [],
    solvedBlankIds: [],
    bestMatchTimesMs: {},
    currentStreak: 0,
    bestStreak: 0,
    xp: 0,
  };
}
