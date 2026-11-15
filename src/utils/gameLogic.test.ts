import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildYouTubeSearchUrl,
  checkFillBlankAnswer,
  computeModuleMastery,
  computeOverallReadiness,
  createInitialProgress,
  evaluateQuizSelection,
  formatElapsedTime,
} from './gameLogic';
import type { StudyModule } from '../types/study';

test('buildYouTubeSearchUrl produces valid encoded YouTube search URL', () => {
  const url = buildYouTubeSearchUrl('FIFO inventory valuation stores ledger');
  assert.equal(
    url,
    'https://www.youtube.com/results?search_query=FIFO%20inventory%20valuation%20stores%20ledger'
  );
});

test('checkFillBlankAnswer accepts currency symbols, commas, and slight rounding tolerance', () => {
  const challenge = {
    acceptedAnswers: ['350', 'Rs. 350', '₹350'],
    numericTolerance: 0.5,
  };
  assert.equal(checkFillBlankAnswer('350', challenge), true);
  assert.equal(checkFillBlankAnswer('₹ 350', challenge), true);
  assert.equal(checkFillBlankAnswer('Rs. 350.00', challenge), true);
  assert.equal(checkFillBlankAnswer('340', challenge), false);

  const decimalChallenge = {
    acceptedAnswers: ['1833', '1833.33'],
    numericTolerance: 1,
  };
  assert.equal(checkFillBlankAnswer('1,833.3', decimalChallenge), true);
  assert.equal(checkFillBlankAnswer('1840', decimalChallenge), false);
});

test('checkFillBlankAnswer handles case-insensitive text answers cleanly', () => {
  const textChallenge = {
    acceptedAnswers: ['Suspense Account', 'Suspense A/c'],
  };
  assert.equal(checkFillBlankAnswer('  suspense account ', textChallenge), true);
  assert.equal(checkFillBlankAnswer('SUSPENSE A/C', textChallenge), true);
  assert.equal(checkFillBlankAnswer('Capital Account', textChallenge), false);
});

test('evaluateQuizSelection updates streak and awards escalating points', () => {
  const q = { id: 'q1', correctIndex: 1 };
  const first = evaluateQuizSelection(q, 1, 0, 0);
  assert.equal(first.isCorrect, true);
  assert.equal(first.nextStreak, 1);
  assert.equal(first.nextBestStreak, 1);
  assert.equal(first.pointsEarned, 15);

  const second = evaluateQuizSelection(q, 1, 1, 1);
  assert.equal(second.nextStreak, 2);
  assert.equal(second.pointsEarned, 20);

  const miss = evaluateQuizSelection(q, 0, 2, 2);
  assert.equal(miss.isCorrect, false);
  assert.equal(miss.nextStreak, 0);
  assert.equal(miss.nextBestStreak, 2);
  assert.equal(miss.pointsEarned, 0);
});

test('computeModuleMastery and computeOverallReadiness calculate completion accurately', () => {
  const fakeModule: StudyModule = {
    id: 'm1',
    number: '01',
    shortTitle: 'Concepts',
    title: 'Concepts',
    subtitle: 'Sub',
    sourceFiles: ['a.pdf'],
    estimatedMinutes: 10,
    memoryHook: 'Hook',
    takeaways: [],
    formulas: [],
    cheatSheet: { title: 'T', headers: [], rows: [] },
    youtubeLinks: [],
    flashcards: [
      { id: 'f1', prompt: 'p1', answer: 'a1', subtopic: 's1' },
      { id: 'f2', prompt: 'p2', answer: 'a2', subtopic: 's1' },
    ],
    quiz: [{ id: 'q1', kind: 'mcq', subtopic: 's', question: 'q', options: ['a', 'b'], correctIndex: 0, explanation: 'e', sourceRef: 'r', youtubeLabel: 'y', youtubeQuery: 'y' }],
    matchPairs: [{ id: 'p1', left: 'L', right: 'R' }],
    fillBlanks: [{ id: 'b1', subtopic: 's', prompt: 'p', blankLabel: 'b', placeholder: '', acceptedAnswers: ['10'], hint: 'h', workedSolution: 'w', youtubeLabel: 'y', youtubeQuery: 'y' }],
    workedProblems: [],
  };

  const progress = createInitialProgress();
  progress.masteredFlashcards = ['f1'];
  progress.solvedQuizIds = ['q1'];
  progress.bestMatchTimesMs = { m1: 12400 };

  const mastery = computeModuleMastery(fakeModule, progress);
  assert.equal(mastery.totalItems, 5);
  assert.equal(mastery.completedItems, 3);
  assert.equal(mastery.percent, 60);

  const overall = computeOverallReadiness([fakeModule], progress);
  assert.equal(overall.percent, 60);
});

test('formatElapsedTime formats seconds and minutes cleanly', () => {
  assert.equal(formatElapsedTime(8450), '8.5s');
  assert.equal(formatElapsedTime(65200), '1m 05.2s');
});
