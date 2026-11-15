export interface YouTubeResource {
  label: string;
  explainsWhat: string;
  query: string;
}

export interface TakeawayItem {
  id: string;
  title: string;
  summary: string;
  example?: string;
}

export interface CheatSheetTable {
  title: string;
  headers: string[];
  rows: string[][];
}

export interface FormulaItem {
  label: string;
  expression: string;
  note?: string;
}

export interface FlashcardItem {
  id: string;
  prompt: string;
  answer: string;
  subtopic: string;
  memoryTip?: string;
}

export interface QuizQuestion {
  id: string;
  kind: 'mcq' | 'true-false';
  subtopic: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  sourceRef: string;
  youtubeLabel: string;
  youtubeQuery: string;
}

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

export interface FillBlankChallenge {
  id: string;
  subtopic: string;
  prompt: string;
  blankLabel: string;
  placeholder: string;
  acceptedAnswers: string[];
  numericTolerance?: number;
  hint: string;
  workedSolution: string;
  youtubeLabel: string;
  youtubeQuery: string;
}

export interface WorkedProblem {
  id: string;
  title: string;
  sourceRef: string;
  scenario: string;
  steps: string[];
  finalAnswer: string;
  youtubeLabel: string;
  youtubeQuery: string;
}

export interface StudyModule {
  id: string;
  number: string;
  shortTitle: string;
  title: string;
  subtitle: string;
  sourceFiles: string[];
  estimatedMinutes: number;
  memoryHook: string;
  takeaways: TakeawayItem[];
  formulas: FormulaItem[];
  cheatSheet: CheatSheetTable;
  youtubeLinks: YouTubeResource[];
  flashcards: FlashcardItem[];
  quiz: QuizQuestion[];
  matchPairs: MatchPair[];
  fillBlanks: FillBlankChallenge[];
  workedProblems: WorkedProblem[];
}

export type GameMode = 'flashcards' | 'quiz' | 'match' | 'fill-blank';
export type MainSection = 'guide' | 'games' | 'problems' | 'review';

export interface UserProgress {
  masteredFlashcards: string[];
  reviewQueueFlashcards: string[];
  solvedQuizIds: string[];
  missedQuizIds: string[];
  solvedBlankIds: string[];
  bestMatchTimesMs: Record<string, number>;
  currentStreak: number;
  bestStreak: number;
  xp: number;
}
