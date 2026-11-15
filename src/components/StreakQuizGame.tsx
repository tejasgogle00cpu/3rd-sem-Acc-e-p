import { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, Flame, PlayCircle, RotateCcw, XCircle } from 'lucide-react';
import type { QuizQuestion } from '../types/study';
import { buildYouTubeSearchUrl } from '../utils/gameLogic';

interface StreakQuizGameProps {
  moduleId: string;
  questions: QuizQuestion[];
  currentStreak: number;
  solvedIds: string[];
  onAnswerQuestion: (questionId: string, selectedIndex: number) => {
    isCorrect: boolean;
    pointsEarned: number;
  };
}

export function StreakQuizGame({
  moduleId,
  questions,
  currentStreak,
  solvedIds,
  onAnswerQuestion,
}: StreakQuizGameProps) {
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [earnedThisTurn, setEarnedThisTurn] = useState(0);
  const [roundFinished, setRoundFinished] = useState(false);

  useEffect(() => {
    setIdx(0);
    setSelected(null);
    setEarnedThisTurn(0);
    setRoundFinished(false);
  }, [moduleId]);

  const currentQ = questions[idx];
  const solvedCount = questions.filter((q) => solvedIds.includes(q.id)).length;

  function handleChoose(optionIdx: number) {
    if (selected !== null || !currentQ) return;
    setSelected(optionIdx);
    const res = onAnswerQuestion(currentQ.id, optionIdx);
    setEarnedThisTurn(res.pointsEarned);
  }

  function handleNext() {
    if (idx + 1 < questions.length) {
      setIdx((prev) => prev + 1);
      setSelected(null);
      setEarnedThisTurn(0);
    } else {
      setRoundFinished(true);
    }
  }

  function handleRestart() {
    setIdx(0);
    setSelected(null);
    setEarnedThisTurn(0);
    setRoundFinished(false);
  }

  if (roundFinished) {
    return (
      <div className="bg-[#F5F3EE] rounded-2xl p-6 sm:p-8 border border-[#141518]/10 space-y-4">
        <p className="text-xs font-semibold text-[#254EDB]">Round Complete</p>
        <h3 className="font-display text-2xl font-bold text-[#141518]">
          {solvedCount} of {questions.length} module questions mastered
        </h3>
        <p className="text-sm text-[#5A606A]">
          Current live streak: <span className="font-semibold text-[#141518]">{currentStreak}</span>. Replay this deck or switch to Speed-Match and Fill-in-the-Blank above.
        </p>
        <button
          type="button"
          onClick={handleRestart}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#254EDB] hover:bg-[#1E40B8] text-white text-sm font-semibold transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" aria-hidden="true" />
          <span>Play Quiz Again</span>
        </button>
      </div>
    );
  }

  if (!currentQ) return null;

  const isAnswered = selected !== null;
  const isCorrect = selected === currentQ.correctIndex;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#5A606A] tabular-nums">
          Question <span className="font-semibold text-[#141518]">{idx + 1}</span> of {questions.length} ·{' '}
          {currentQ.kind === 'true-false' ? 'True / False' : 'Multiple Choice'} · {currentQ.sourceRef}
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#A3E635] text-[#141518] text-xs font-bold tabular-nums">
          <Flame className="w-3.5 h-3.5" aria-hidden="true" />
          Streak: {currentStreak}
        </span>
      </div>

      <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-[#141518]/10 space-y-5">
        <div>
          <p className="text-xs font-semibold text-[#254EDB] mb-1.5">
            {currentQ.subtopic}
          </p>
          <h3 className="font-display text-lg sm:text-xl font-bold text-[#141518] leading-snug">
            {currentQ.question}
          </h3>
        </div>

        <div className="space-y-2.5">
          {currentQ.options.map((opt, optIdx) => {
            const isOptionSelected = selected === optIdx;
            const isOptionCorrect = optIdx === currentQ.correctIndex;

            let style =
              'bg-[#ECEEF2]/70 hover:bg-[#ECEEF2] border-[#141518]/10 text-[#141518]';
            if (isAnswered) {
              if (isOptionCorrect) {
                style = 'bg-[#A3E635]/35 border-[#141518] text-[#141518] font-semibold';
              } else if (isOptionSelected && !isOptionCorrect) {
                style = 'bg-[#FF5A36]/15 border-[#FF5A36] text-[#141518]';
              } else {
                style = 'bg-[#F8F9FA] border-[#141518]/8 text-[#5A606A]';
              }
            }

            return (
              <button
                key={opt}
                type="button"
                disabled={isAnswered}
                onClick={() => handleChoose(optIdx)}
                className={`w-full text-left p-4 rounded-xl border text-sm transition-all flex items-center justify-between gap-3 ${
                  isAnswered ? 'cursor-default' : 'cursor-pointer active:scale-[0.995]'
                } ${style}`}
              >
                <span>{opt}</span>
                {isAnswered && isOptionCorrect && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#141518] shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-[#141518]" aria-hidden="true" />
                    Correct
                  </span>
                )}
                {isAnswered && isOptionSelected && !isOptionCorrect && (
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FF5A36] shrink-0">
                    <XCircle className="w-4 h-4 text-[#FF5A36]" aria-hidden="true" />
                    Your pick
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Instant Feedback + Question-Level YouTube Link */}
        <div className="pt-4 border-t border-[#141518]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <a
            href={buildYouTubeSearchUrl(currentQ.youtubeQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#254EDB] hover:underline"
          >
            <PlayCircle className="w-4 h-4 text-[#FF5A36] shrink-0" aria-hidden="true" />
            <span>{currentQ.youtubeLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </a>

          {isAnswered && (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-full bg-[#254EDB] hover:bg-[#1E40B8] text-white text-sm font-semibold transition-colors cursor-pointer shrink-0"
            >
              <span>{idx + 1 < questions.length ? 'Next Question' : 'Finish Round'}</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </button>
          )}
        </div>

        {isAnswered && (
          <div
            className={`rounded-xl p-4 text-sm leading-relaxed border ${
              isCorrect
                ? 'bg-[#A3E635]/20 border-[#141518]/15 text-[#141518]'
                : 'bg-[#FF5A36]/10 border-[#FF5A36]/30 text-[#141518]'
            }`}
          >
            <p className="font-bold mb-1">
              {isCorrect ? `Correct (+${earnedThisTurn} XP)` : 'Missed — added to Review Queue'}
            </p>
            <p className="text-[#141518]/90">{currentQ.explanation}</p>
          </div>
        )}
      </div>
    </div>
  );
}
