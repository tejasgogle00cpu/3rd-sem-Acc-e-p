import { useState } from 'react';
import { ArrowUpRight, Eye, PlayCircle } from 'lucide-react';
import type { StudyModule } from '../types/study';
import { buildYouTubeSearchUrl } from '../utils/gameLogic';

interface WorkedProblemsViewProps {
  module: StudyModule;
  onPracticeFillBlanks: () => void;
}

export function WorkedProblemsView({
  module,
  onPracticeFillBlanks,
}: WorkedProblemsViewProps) {
  const [revealedSteps, setRevealedSteps] = useState<Record<string, number>>({});

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#141518]">
            Worked Exam Problems
          </h2>
          <p className="text-sm text-[#5A606A]">
            Step-by-step solutions taken directly from your module handouts and problem sets.
          </p>
        </div>

        <button
          type="button"
          onClick={onPracticeFillBlanks}
          className="px-4 py-2 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] text-xs font-semibold text-[#141518] transition-colors cursor-pointer whitespace-nowrap self-start sm:self-auto"
        >
          Test Yourself in Fill-in-the-Blank
        </button>
      </div>

      <div className="space-y-6">
        {module.workedProblems.map((prob) => {
          const shownCount = revealedSteps[prob.id] ?? prob.steps.length;
          return (
            <article
              key={prob.id}
              className="bg-[#F8F9FA] rounded-2xl p-6 border border-[#141518]/12 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-medium text-[#5A606A]">
                    {prob.sourceRef}
                  </p>
                  <h3 className="mt-1 font-display text-xl font-bold text-[#141518]">
                    {prob.title}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setRevealedSteps((prev) => ({
                      ...prev,
                      [prob.id]: shownCount === 0 ? prob.steps.length : 0,
                    }))
                  }
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] text-xs font-semibold text-[#141518] transition-colors cursor-pointer shrink-0"
                >
                  <Eye className="w-3.5 h-3.5 text-[#254EDB]" aria-hidden="true" />
                  <span>{shownCount === 0 ? 'Reveal Solution' : 'Hide Solution (Practice)'}</span>
                </button>
              </div>

              <div className="bg-[#F5F3EE] rounded-xl p-4 border border-[#141518]/8 text-sm text-[#141518] leading-relaxed">
                {prob.scenario}
              </div>

              {shownCount > 0 ? (
                <div className="space-y-2.5">
                  {prob.steps.slice(0, shownCount).map((step, idx) => (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-[#ECEEF2]/70 text-sm text-[#141518] font-mono leading-relaxed"
                    >
                      {step}
                    </div>
                  ))}
                  <div className="p-4 rounded-xl bg-[#A3E635]/25 border border-[#141518]/15 text-sm font-bold text-[#141518]">
                    {prob.finalAnswer}
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-[#ECEEF2]/50 text-xs text-[#5A606A] flex items-center justify-between gap-3">
                  <span>Solution hidden so you can work it out on paper first.</span>
                  <button
                    type="button"
                    onClick={() =>
                      setRevealedSteps((prev) => ({
                        ...prev,
                        [prob.id]: 1,
                      }))
                    }
                    className="font-semibold text-[#254EDB] hover:underline cursor-pointer shrink-0"
                  >
                    Reveal Step 1
                  </button>
                </div>
              )}

              {shownCount > 0 && shownCount < prob.steps.length && (
                <button
                  type="button"
                  onClick={() =>
                    setRevealedSteps((prev) => ({
                      ...prev,
                      [prob.id]: shownCount + 1,
                    }))
                  }
                  className="px-4 py-2 rounded-full bg-[#254EDB] text-white text-xs font-semibold cursor-pointer"
                >
                  Reveal Next Step ({shownCount}/{prob.steps.length})
                </button>
              )}

              <div className="pt-3 border-t border-[#141518]/10">
                <a
                  href={buildYouTubeSearchUrl(prob.youtubeQuery)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#254EDB] hover:underline"
                >
                  <PlayCircle className="w-4 h-4 text-[#FF5A36] shrink-0" aria-hidden="true" />
                  <span>{prob.youtubeLabel}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                </a>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
