import type { GameMode, StudyModule, UserProgress } from '../types/study';
import { FlashcardGame } from './FlashcardGame';
import { StreakQuizGame } from './StreakQuizGame';
import { SpeedMatchGame } from './SpeedMatchGame';
import { FillBlankGame } from './FillBlankGame';

interface GamesStudioProps {
  module: StudyModule;
  activeGame: GameMode;
  progress: UserProgress;
  onSelectGame: (mode: GameMode) => void;
  onSwipeCard: (cardId: string, action: 'got-it' | 'review-again') => void;
  onAnswerQuestion: (questionId: string, selectedIndex: number) => {
    isCorrect: boolean;
    pointsEarned: number;
  };
  onCompleteMatch: (moduleId: string, elapsedMs: number) => void;
  onSolveBlank: (challengeId: string) => void;
}

export function GamesStudio({
  module,
  activeGame,
  progress,
  onSelectGame,
  onSwipeCard,
  onAnswerQuestion,
  onCompleteMatch,
  onSolveBlank,
}: GamesStudioProps) {
  const modes: { id: GameMode; label: string; count: string }[] = [
    { id: 'flashcards', label: 'Swipe Flashcards', count: `${module.flashcards.length}` },
    { id: 'quiz', label: 'Streak Quiz', count: `${module.quiz.length}` },
    { id: 'match', label: 'Speed-Match', count: `${module.matchPairs.length} pairs` },
    { id: 'fill-blank', label: 'Fill-in-the-Blank', count: `${module.fillBlanks.length}` },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#141518]">
            Module {module.number} Mini-Games
          </h2>
          <p className="text-sm text-[#5A606A]">
            Practice directly on the concepts, entries, and numericals from {module.shortTitle}.
          </p>
        </div>

        <div
          role="tablist"
          aria-label="Mini-game modes"
          className="inline-flex flex-wrap sm:flex-nowrap items-center gap-1 p-1 bg-[#ECEEF2] rounded-xl shrink-0 self-start lg:self-auto"
        >
          {modes.map((m) => {
            const active = activeGame === m.id;
            return (
              <button
                key={m.id}
                role="tab"
                aria-selected={active}
                type="button"
                onClick={() => onSelectGame(m.id)}
                className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-[#254EDB] text-white'
                    : 'text-[#5A606A] hover:text-[#141518]'
                }`}
              >
                {m.label} <span className="opacity-75 font-mono">({m.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {activeGame === 'flashcards' && (
        <FlashcardGame
          moduleId={module.id}
          cards={module.flashcards}
          masteredIds={progress.masteredFlashcards}
          reviewQueueIds={progress.reviewQueueFlashcards}
          onSwipeCard={onSwipeCard}
        />
      )}

      {activeGame === 'quiz' && (
        <StreakQuizGame
          moduleId={module.id}
          questions={module.quiz}
          currentStreak={progress.currentStreak}
          solvedIds={progress.solvedQuizIds}
          onAnswerQuestion={onAnswerQuestion}
        />
      )}

      {activeGame === 'match' && (
        <SpeedMatchGame
          moduleId={module.id}
          pairs={module.matchPairs}
          bestTimeMs={progress.bestMatchTimesMs[module.id]}
          onCompleteMatch={onCompleteMatch}
        />
      )}

      {activeGame === 'fill-blank' && (
        <FillBlankGame
          moduleId={module.id}
          challenges={module.fillBlanks}
          solvedIds={progress.solvedBlankIds}
          onSolveChallenge={onSolveBlank}
        />
      )}
    </div>
  );
}
