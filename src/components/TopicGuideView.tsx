import { ArrowUpRight, PlayCircle, Sparkles } from 'lucide-react';
import type { StudyModule } from '../types/study';
import { buildYouTubeSearchUrl } from '../utils/gameLogic';

interface TopicGuideViewProps {
  module: StudyModule;
  onJumpToGames: () => void;
  onJumpToProblems: () => void;
}

export function TopicGuideView({
  module,
  onJumpToGames,
  onJumpToProblems,
}: TopicGuideViewProps) {
  return (
    <div className="space-y-10">
      {/* Memory Hook + Action Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 bg-[#F5F3EE] rounded-2xl p-6 border border-[#141518]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#254EDB] mb-2">
              <Sparkles className="w-4 h-4" aria-hidden="true" />
              <span>Quick Memory Hook</span>
            </div>
            <p className="text-base sm:text-lg font-medium text-[#141518] leading-relaxed">
              {module.memoryHook}
            </p>
          </div>
          <div className="mt-5 pt-4 border-t border-[#141518]/10 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onJumpToGames}
              className="px-4 py-2 rounded-full bg-[#254EDB] hover:bg-[#1E40B8] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Play Module Mini-Games
            </button>
            <button
              type="button"
              onClick={onJumpToProblems}
              className="px-4 py-2 rounded-full bg-[#F8F9FA] hover:bg-[#ECEEF2] text-[#141518] border border-[#141518]/15 text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              See Worked Exam Problem
            </button>
          </div>
        </div>

        {/* Topic-Level YouTube Explanations */}
        <aside className="lg:col-span-4 bg-[#ECEEF2] rounded-2xl p-6 border border-[#141518]/8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-[#5A606A] mb-3">
              Topic Video Explanations
            </p>
            <div className="space-y-3">
              {module.youtubeLinks.map((yt) => (
                <a
                  key={yt.label}
                  href={buildYouTubeSearchUrl(yt.query)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3.5 rounded-xl bg-[#F8F9FA] hover:bg-white border border-[#141518]/10 transition-colors group"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#254EDB] group-hover:underline leading-snug">
                      <PlayCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#FF5A36]" aria-hidden="true" />
                      <span>{yt.label}</span>
                    </span>
                    <ArrowUpRight className="w-4 h-4 shrink-0 text-[#5A606A] group-hover:text-[#254EDB]" aria-hidden="true" />
                  </div>
                  <p className="mt-1.5 text-xs text-[#5A606A] leading-relaxed">
                    {yt.explainsWhat}
                  </p>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </div>

      {/* Bite-Sized Takeaways (Asymmetric 2-column Editorial Layout) */}
      <div>
        <div className="flex items-baseline justify-between gap-4 mb-5">
          <h2 className="font-display text-2xl font-bold text-[#141518]">
            Bite-Sized Takeaways
          </h2>
          <span className="text-xs text-[#5A606A]">
            4 core ideas · zero fluff
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {module.takeaways.map((item, idx) => (
            <article
              key={item.id}
              className="bg-[#F8F9FA] rounded-2xl p-5 border border-[#141518]/10 flex flex-col justify-between"
            >
              <div>
                <span className="font-mono text-xs font-semibold text-[#254EDB]">
                  0{idx + 1}
                </span>
                <h3 className="mt-1.5 font-display text-lg font-bold text-[#141518] leading-snug">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-[#5A606A] leading-relaxed">
                  {item.summary}
                </p>
              </div>
              {item.example && (
                <p className="mt-4 pt-3 border-t border-[#141518]/8 text-xs font-mono text-[#141518]">
                  {item.example}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>

      {/* Key Formulas Strip */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[#141518] mb-4">
          Must-Know Formulas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {module.formulas.map((formula) => (
            <div
              key={formula.label}
              className="bg-[#ECEEF2] rounded-xl p-4 border border-[#141518]/8"
            >
              <p className="text-xs font-semibold text-[#5A606A]">{formula.label}</p>
              <p className="mt-1 font-mono text-sm sm:text-base font-semibold text-[#141518] tabular-nums">
                {formula.expression}
              </p>
              {formula.note && (
                <p className="mt-1.5 text-xs text-[#5A606A]">{formula.note}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick-Scan Cheat Sheet Table */}
      <div>
        <h2 className="font-display text-2xl font-bold text-[#141518] mb-4">
          {module.cheatSheet.title}
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-[#141518]/10 bg-[#F8F9FA]">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#ECEEF2] border-b border-[#141518]/10">
                {module.cheatSheet.headers.map((header) => (
                  <th
                    key={header}
                    className="py-3 px-4 text-xs font-bold text-[#141518] whitespace-nowrap"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#141518]/8">
              {module.cheatSheet.rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="hover:bg-[#F5F3EE]/60 transition-colors">
                  {row.map((cell, cellIndex) => (
                    <td
                      key={cellIndex}
                      className={`py-3 px-4 text-sm ${
                        cellIndex === 0
                          ? 'font-semibold text-[#141518]'
                          : 'text-[#5A606A]'
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
