import { ArrowUpRight, Check, PlayCircle, RotateCcw } from 'lucide-react';
import type { FlashcardItem, QuizQuestion, StudyModule, UserProgress } from '../types/study';
import { buildYouTubeSearchUrl } from '../utils/gameLogic';

interface ReviewQueueViewProps {
  modules: StudyModule[];
  progress: UserProgress;
  onMarkFlashcardMastered: (cardId: string) => void;
  onJumpToModuleQuiz: (moduleId: string) => void;
  onResetProgress: () => void;
}

export function ReviewQueueView({
  modules,
  progress,
  onMarkFlashcardMastered,
  onJumpToModuleQuiz,
  onResetProgress,
}: ReviewQueueViewProps) {
  const flaggedCards: { module: StudyModule; card: FlashcardItem }[] = [];
  const missedQuestions: { module: StudyModule; question: QuizQuestion }[] = [];

  for (const mod of modules) {
    for (const card of mod.flashcards) {
      if (progress.reviewQueueFlashcards.includes(card.id)) {
        flaggedCards.push({ module: mod, card });
      }
    }
    for (const q of mod.quiz) {
      if (progress.missedQuizIds.includes(q.id)) {
        missedQuestions.push({ module: mod, question: q });
      }
    }
  }

  const totalItems = flaggedCards.length + missedQuestions.length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#141518]">
            Your Review Queue
          </h2>
          <p className="text-sm text-[#5A606A]">
            Any flashcard you swipe "Review Again" or quiz question you miss lands here for targeted revision.
          </p>
        </div>

        <button
          type="button"
          onClick={onResetProgress}
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] text-xs font-semibold text-[#141518] transition-colors cursor-pointer self-start sm:self-auto"
        >
          <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Reset All Progress</span>
        </button>
      </div>

      {totalItems === 0 ? (
        <div className="bg-[#F5F3EE] rounded-2xl p-8 border border-[#141518]/10 space-y-2">
          <h3 className="font-display text-xl font-bold text-[#141518]">
            Your review queue is clear
          </h3>
          <p className="text-sm text-[#5A606A] max-w-xl">
            As you swipe flashcards with "Review Again" or miss questions in Streak Quiz, they will collect here alongside direct YouTube explanation links.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {flaggedCards.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-[#141518]">
                Flashcards to Revisit ({flaggedCards.length})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {flaggedCards.map(({ module, card }) => (
                  <div
                    key={card.id}
                    className="bg-[#F5F3EE] rounded-2xl p-5 border border-[#141518]/10 flex flex-col justify-between gap-4"
                  >
                    <div>
                      <p className="text-xs text-[#5A606A]">
                        Module {module.number} · {card.subtopic}
                      </p>
                      <p className="mt-1.5 font-display text-base font-bold text-[#141518]">
                        {card.prompt}
                      </p>
                      <p className="mt-2 text-sm text-[#141518]/85">{card.answer}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => onMarkFlashcardMastered(card.id)}
                      className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#A3E635] hover:bg-[#95D62B] text-[#141518] text-xs font-bold cursor-pointer self-start"
                    >
                      <Check className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Mark Got It</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {missedQuestions.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-display text-lg font-bold text-[#141518]">
                Missed Quiz Questions ({missedQuestions.length})
              </h3>
              <div className="space-y-4">
                {missedQuestions.map(({ module, question }) => (
                  <div
                    key={question.id}
                    className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#FF5A36]/35 space-y-3"
                  >
                    <p className="text-xs text-[#5A606A]">
                      Module {module.number} · {question.subtopic} · {question.sourceRef}
                    </p>
                    <p className="font-display text-base font-bold text-[#141518]">
                      {question.question}
                    </p>
                    <p className="text-sm text-[#141518]">
                      Answer: <span className="font-semibold">{question.options[question.correctIndex]}</span>
                    </p>
                    <p className="text-sm text-[#5A606A]">{question.explanation}</p>
                    <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
                      <a
                        href={buildYouTubeSearchUrl(question.youtubeQuery)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#254EDB] hover:underline"
                      >
                        <PlayCircle className="w-4 h-4 text-[#FF5A36]" aria-hidden="true" />
                        <span>{question.youtubeLabel}</span>
                        <ArrowUpRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </a>
                      <button
                        type="button"
                        onClick={() => onJumpToModuleQuiz(module.id)}
                        className="px-3.5 py-1.5 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] text-xs font-semibold text-[#141518] cursor-pointer"
                      >
                        Retry in Module {module.number}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
