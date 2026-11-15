import { useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, Flame, PlayCircle, X, XCircle } from 'lucide-react';
import type { QuizQuestion, StudyModule } from '../types/study';
import { buildYouTubeSearchUrl } from '../utils/gameLogic';

interface QuickSprintModalProps {
  isOpen: boolean;
  modules: StudyModule[];
  onClose: () => void;
  onAnswerQuestion: (questionId: string, selectedIndex: number, question: QuizQuestion) => {
    isCorrect: boolean;
    pointsEarned: number;
  };
}

export function QuickSprintModal({
  isOpen,
  modules,
  onClose,
  onAnswerQuestion,
}: QuickSprintModalProps) {
  const sprintQuestions = useMemo(() => {
    return modules.map((mod) => ({
      moduleNumber: mod.number,
      moduleTitle: mod.shortTitle,
      question: mod.quiz[0],
    }));
  }, [modules]);

  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  if (!isOpen) return null;

  const entry = sprintQuestions[idx];
  const currentQ = entry?.question;

  function handlePick(optionIdx: number) {
    if (selected !== null || !currentQ) return;
    setSelected(optionIdx);
    const res = onAnswerQuestion(currentQ.id, optionIdx, currentQ);
    if (res.isCorrect) {
      setScore((s) => s + 1);
    }
  }

  function handleNext() {
    if (idx + 1 < sprintQuestions.length) {
      setIdx((i) => i + 1);
      setSelected(null);
    } else {
      setDone(true);
    }
  }

  function handleRestart() {
    setIdx(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sprint-dialog-title"
      className="fixed inset-0 z-50 bg-[#141518]/55 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div className="bg-[#F8F9FA] w-full max-w-2xl rounded-2xl border border-[#141518]/15 p-6 sm:p-7 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold text-[#254EDB]">
              Cross-Module Exam Sprint · 1 Question per Module
            </p>
            <h2 id="sprint-dialog-title" className="font-display text-xl font-bold text-[#141518]">
              {done ? 'Sprint Complete' : `Question ${idx + 1} of ${sprintQuestions.length}`}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Exam Sprint"
            className="w-9 h-9 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] flex items-center justify-center text-[#141518] cursor-pointer"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>

        {done ? (
          <div className="bg-[#F5F3EE] rounded-2xl p-6 border border-[#141518]/10 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#A3E635] text-[#141518] text-xs font-bold tabular-nums">
              <Flame className="w-3.5 h-3.5" aria-hidden="true" />
              Score: {score} / {sprintQuestions.length}
            </div>
            <p className="text-base text-[#141518]">
              {score >= 6
                ? 'Strong run across all 8 modules. Check your Review Queue if you want to tighten up any missed spots.'
                : 'Good warm-up! Jump into the modules you missed and watch the linked YouTube explanations.'}
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="px-5 py-2.5 rounded-full bg-[#254EDB] text-white text-sm font-semibold cursor-pointer"
              >
                Run Sprint Again
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-full bg-[#ECEEF2] text-[#141518] text-sm font-semibold cursor-pointer"
              >
                Back to Study Hub
              </button>
            </div>
          </div>
        ) : (
          currentQ && (
            <div className="space-y-4">
              <p className="text-xs text-[#5A606A]">
                Module {entry.moduleNumber}: {entry.moduleTitle} · {currentQ.subtopic}
              </p>
              <h3 className="font-display text-lg font-bold text-[#141518] leading-snug">
                {currentQ.question}
              </h3>

              <div className="space-y-2.5">
                {currentQ.options.map((opt, optIdx) => {
                  const answered = selected !== null;
                  const isCorrect = optIdx === currentQ.correctIndex;
                  const isPicked = optIdx === selected;
                  let cls = 'bg-[#ECEEF2]/70 hover:bg-[#ECEEF2] border-[#141518]/10 text-[#141518]';
                  if (answered) {
                    if (isCorrect) cls = 'bg-[#A3E635]/35 border-[#141518] font-semibold';
                    else if (isPicked) cls = 'bg-[#FF5A36]/15 border-[#FF5A36]';
                    else cls = 'bg-[#F8F9FA] border-[#141518]/8 text-[#5A606A]';
                  }
                  return (
                    <button
                      key={opt}
                      type="button"
                      disabled={answered}
                      onClick={() => handlePick(optIdx)}
                      className={`w-full text-left p-3.5 rounded-xl border text-sm flex items-center justify-between gap-2 ${
                        answered ? 'cursor-default' : 'cursor-pointer'
                      } ${cls}`}
                    >
                      <span>{opt}</span>
                      {answered && isCorrect && <CheckCircle2 className="w-4 h-4 text-[#141518] shrink-0" />}
                      {answered && isPicked && !isCorrect && <XCircle className="w-4 h-4 text-[#FF5A36] shrink-0" />}
                    </button>
                  );
                })}
              </div>

              {selected !== null && (
                <div className="bg-[#F5F3EE] rounded-xl p-4 border border-[#141518]/10 text-sm text-[#141518]">
                  {currentQ.explanation}
                </div>
              )}

              <div className="pt-3 border-t border-[#141518]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <a
                  href={buildYouTubeSearchUrl(currentQ.youtubeQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#254EDB] hover:underline"
                >
                  <PlayCircle className="w-4 h-4 text-[#FF5A36]" aria-hidden="true" />
                  <span>{currentQ.youtubeLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                </a>

                {selected !== null && (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center justify-center gap-1.5 px-5 py-2 rounded-full bg-[#254EDB] text-white text-sm font-semibold cursor-pointer"
                  >
                    <span>{idx + 1 < sprintQuestions.length ? 'Next' : 'See Score'}</span>
                    <ArrowRight className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>
            </div>
          )
        )}
      </div>
    </div>
  );
}
