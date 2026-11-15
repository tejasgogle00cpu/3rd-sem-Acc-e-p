import { useEffect, useState } from 'react';
import { STUDY_MODULES } from './data/studyContent';
import type { GameMode, MainSection, QuizQuestion, UserProgress } from './types/study';
import { createInitialProgress, evaluateQuizSelection } from './utils/gameLogic';
import { Header } from './components/Header';
import { ModuleHeroAndOverview } from './components/ModuleHeroAndOverview';
import { TopicGuideView } from './components/TopicGuideView';
import { GamesStudio } from './components/GamesStudio';
import { WorkedProblemsView } from './components/WorkedProblemsView';
import { ReviewQueueView } from './components/ReviewQueueView';
import { QuickSprintModal } from './components/QuickSprintModal';

const STORAGE_KEY = 'ledgerloop_exam_progress_v1';

function loadSavedProgress(): UserProgress {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialProgress();
    const parsed = JSON.parse(raw) as Partial<UserProgress>;
    return {
      ...createInitialProgress(),
      ...parsed,
    };
  } catch {
    return createInitialProgress();
  }
}

export default function App() {
  const [activeModuleId, setActiveModuleId] = useState<string>(STUDY_MODULES[0].id);
  const [activeSection, setActiveSection] = useState<MainSection>('guide');
  const [activeGame, setActiveGame] = useState<GameMode>('flashcards');
  const [sprintOpen, setSprintOpen] = useState(false);
  const [progress, setProgress] = useState<UserProgress>(loadSavedProgress);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch {
      // Ignore storage quota errors
    }
  }, [progress]);

  const activeModule =
    STUDY_MODULES.find((m) => m.id === activeModuleId) ?? STUDY_MODULES[0];

  const reviewCount =
    progress.reviewQueueFlashcards.length + progress.missedQuizIds.length;

  function handleSwipeCard(cardId: string, action: 'got-it' | 'review-again') {
    setProgress((prev) => {
      if (action === 'got-it') {
        const alreadyMastered = prev.masteredFlashcards.includes(cardId);
        return {
          ...prev,
          masteredFlashcards: alreadyMastered
            ? prev.masteredFlashcards
            : [...prev.masteredFlashcards, cardId],
          reviewQueueFlashcards: prev.reviewQueueFlashcards.filter((id) => id !== cardId),
          xp: alreadyMastered ? prev.xp : prev.xp + 10,
        };
      }
      const alreadyQueued = prev.reviewQueueFlashcards.includes(cardId);
      return {
        ...prev,
        masteredFlashcards: prev.masteredFlashcards.filter((id) => id !== cardId),
        reviewQueueFlashcards: alreadyQueued
          ? prev.reviewQueueFlashcards
          : [...prev.reviewQueueFlashcards, cardId],
      };
    });
  }

  function handleQuizAnswer(
    questionId: string,
    selectedIndex: number,
    questionOverride?: QuizQuestion
  ): { isCorrect: boolean; pointsEarned: number } {
    const question =
      questionOverride ??
      activeModule.quiz.find((q) => q.id === questionId) ??
      STUDY_MODULES.flatMap((m) => m.quiz).find((q) => q.id === questionId);

    if (!question) {
      return { isCorrect: false, pointsEarned: 0 };
    }

    const result = evaluateQuizSelection(
      question,
      selectedIndex,
      progress.currentStreak,
      progress.bestStreak
    );

    setProgress((prev) => {
      if (result.isCorrect) {
        const solvedAlready = prev.solvedQuizIds.includes(questionId);
        return {
          ...prev,
          solvedQuizIds: solvedAlready
            ? prev.solvedQuizIds
            : [...prev.solvedQuizIds, questionId],
          missedQuizIds: prev.missedQuizIds.filter((id) => id !== questionId),
          currentStreak: result.nextStreak,
          bestStreak: result.nextBestStreak,
          xp: prev.xp + result.pointsEarned,
        };
      }
      const missedAlready = prev.missedQuizIds.includes(questionId);
      return {
        ...prev,
        missedQuizIds: missedAlready
          ? prev.missedQuizIds
          : [...prev.missedQuizIds, questionId],
        currentStreak: 0,
      };
    });

    return {
      isCorrect: result.isCorrect,
      pointsEarned: result.pointsEarned,
    };
  }

  function handleCompleteMatch(moduleId: string, elapsedMs: number) {
    setProgress((prev) => {
      const existingBest = prev.bestMatchTimesMs[moduleId];
      const nextBest =
        existingBest === undefined ? elapsedMs : Math.min(existingBest, elapsedMs);
      return {
        ...prev,
        bestMatchTimesMs: {
          ...prev.bestMatchTimesMs,
          [moduleId]: nextBest,
        },
        xp: prev.xp + 25,
      };
    });
  }

  function handleSolveBlank(challengeId: string) {
    setProgress((prev) => {
      const already = prev.solvedBlankIds.includes(challengeId);
      return {
        ...prev,
        solvedBlankIds: already
          ? prev.solvedBlankIds
          : [...prev.solvedBlankIds, challengeId],
        xp: already ? prev.xp : prev.xp + 20,
      };
    });
  }

  function handleSelectModule(moduleId: string) {
    setActiveModuleId(moduleId);
    if (activeSection === 'review') {
      setActiveSection('guide');
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F9FA] text-[#141518]">
      <Header
        activeSection={activeSection}
        reviewCount={reviewCount}
        onSelectSection={setActiveSection}
        onStartSprint={() => setSprintOpen(true)}
      />

      <main className="flex-1 pb-16">
        <ModuleHeroAndOverview
          modules={STUDY_MODULES}
          activeModule={activeModule}
          activeSection={activeSection}
          progress={progress}
          onSelectModule={handleSelectModule}
          onSelectSection={setActiveSection}
        />

        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6">
          {/* Desktop Section Switcher Bar directly inside workspace */}
          {activeSection !== 'review' && (
            <div className="hidden md:flex items-center justify-between gap-4 pb-4 mb-5 border-b border-[#141518]/8">
              <div
                role="tablist"
                aria-label="Module workspace sections"
                className="inline-flex items-center gap-1 p-1 bg-[#ECEEF2] rounded-xl"
              >
                <button
                  role="tab"
                  aria-selected={activeSection === 'guide'}
                  type="button"
                  onClick={() => setActiveSection('guide')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeSection === 'guide'
                      ? 'bg-[#F8F9FA] text-[#254EDB]'
                      : 'text-[#5A606A] hover:text-[#141518]'
                  }`}
                >
                  Bite-Sized Guide & Cheat Sheet
                </button>
                <button
                  role="tab"
                  aria-selected={activeSection === 'games'}
                  type="button"
                  onClick={() => setActiveSection('games')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeSection === 'games'
                      ? 'bg-[#F8F9FA] text-[#254EDB]'
                      : 'text-[#5A606A] hover:text-[#141518]'
                  }`}
                >
                  Mini-Games Studio
                </button>
                <button
                  role="tab"
                  aria-selected={activeSection === 'problems'}
                  type="button"
                  onClick={() => setActiveSection('problems')}
                  className={`px-4 py-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                    activeSection === 'problems'
                      ? 'bg-[#F8F9FA] text-[#254EDB]'
                      : 'text-[#5A606A] hover:text-[#141518]'
                  }`}
                >
                  Worked Exam Problems
                </button>
              </div>

              <span className="text-xs text-[#5A606A] tabular-nums">
                {activeModule.flashcards.length} flashcards · {activeModule.quiz.length} quiz questions · {activeModule.fillBlanks.length} calculations
              </span>
            </div>
          )}

          {activeSection === 'guide' && (
            <TopicGuideView
              module={activeModule}
              onJumpToGames={() => {
                setActiveSection('games');
                setActiveGame('flashcards');
              }}
              onJumpToProblems={() => setActiveSection('problems')}
            />
          )}

          {activeSection === 'games' && (
            <GamesStudio
              module={activeModule}
              activeGame={activeGame}
              progress={progress}
              onSelectGame={setActiveGame}
              onSwipeCard={handleSwipeCard}
              onAnswerQuestion={(qId, selIdx) => handleQuizAnswer(qId, selIdx)}
              onCompleteMatch={handleCompleteMatch}
              onSolveBlank={handleSolveBlank}
            />
          )}

          {activeSection === 'problems' && (
            <WorkedProblemsView
              module={activeModule}
              onPracticeFillBlanks={() => {
                setActiveSection('games');
                setActiveGame('fill-blank');
              }}
            />
          )}

          {activeSection === 'review' && (
            <ReviewQueueView
              modules={STUDY_MODULES}
              progress={progress}
              onMarkFlashcardMastered={(cardId) => handleSwipeCard(cardId, 'got-it')}
              onJumpToModuleQuiz={(modId) => {
                setActiveModuleId(modId);
                setActiveSection('games');
                setActiveGame('quiz');
              }}
              onResetProgress={() => setProgress(createInitialProgress())}
            />
          )}
        </div>
      </main>

      <footer className="border-t border-[#141518]/10 bg-[#F8F9FA]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#5A606A]">
          <span>LedgerLoop · Built from your 8 Financial Accounting course modules</span>
          <span>Progress saves automatically in this browser</span>
        </div>
      </footer>

      <QuickSprintModal
        isOpen={sprintOpen}
        modules={STUDY_MODULES}
        onClose={() => setSprintOpen(false)}
        onAnswerQuestion={(qId, selIdx, q) => handleQuizAnswer(qId, selIdx, q)}
      />
    </div>
  );
}
