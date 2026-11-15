import { Flame, CheckCircle2 } from 'lucide-react';
import type { MainSection, StudyModule, UserProgress } from '../types/study';
import { computeModuleMastery, computeOverallReadiness } from '../utils/gameLogic';

interface ModuleHeroAndOverviewProps {
  modules: StudyModule[];
  activeModule: StudyModule;
  activeSection: MainSection;
  progress: UserProgress;
  onSelectModule: (moduleId: string) => void;
  onSelectSection: (section: MainSection) => void;
}

export function ModuleHeroAndOverview({
  modules,
  activeModule,
  activeSection,
  progress,
  onSelectModule,
  onSelectSection,
}: ModuleHeroAndOverviewProps) {
  const overall = computeOverallReadiness(modules, progress);
  const currentMastery = computeModuleMastery(activeModule, progress);

  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (overall.percent / 100) * circumference;

  const mobileTabs: { id: MainSection; label: string }[] = [
    { id: 'guide', label: 'Guide' },
    { id: 'games', label: 'Games' },
    { id: 'problems', label: 'Problems' },
    { id: 'review', label: 'Review' },
  ];

  return (
    <section className="max-w-[1200px] mx-auto px-4 sm:px-6 pt-6 pb-5 border-b border-[#141518]/10">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        <div className="lg:col-span-8 flex flex-col justify-between">
          <div>
            <p className="text-xs font-medium text-[#5A606A] mb-1.5">
              Financial Accounting Exam Hub · Module {activeModule.number} of 08 · ~{activeModule.estimatedMinutes} min read
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight text-[#141518] max-w-2xl leading-[1.14]">
              {activeModule.title}
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#5A606A] max-w-2xl leading-relaxed">
              {activeModule.subtitle}
            </p>
          </div>

          <div className="mt-3 text-xs text-[#5A606A] flex flex-wrap items-center gap-x-1.5 gap-y-1">
            <span className="font-medium text-[#141518]">Covered files:</span>
            {activeModule.sourceFiles.map((file, idx) => (
              <span key={file}>
                {file}
                {idx < activeModule.sourceFiles.length - 1 && (
                  <span aria-hidden="true" className="ml-1.5 text-[#5A606A]/60">·</span>
                )}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 bg-[#ECEEF2] rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 border border-[#141518]/8">
          <div className="space-y-2 min-w-0">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#A3E635] text-[#141518] text-xs font-bold tabular-nums">
                <Flame className="w-3.5 h-3.5" aria-hidden="true" />
                {progress.currentStreak} Streak
              </span>
              <span className="text-xs font-medium text-[#5A606A] tabular-nums">
                Best {progress.bestStreak} · {progress.xp} XP
              </span>
            </div>

            <div>
              <p className="text-xs text-[#5A606A]">Overall course readiness</p>
              <p className="font-display text-lg sm:text-xl font-bold text-[#141518] tabular-nums">
                {overall.completedItems} of {overall.totalItems} checks done
              </p>
            </div>

            <div className="text-xs text-[#5A606A] tabular-nums">
              This module: <span className="font-semibold text-[#254EDB]">{currentMastery.percent}% mastered</span>
            </div>
          </div>

          <div className="relative w-18 h-18 shrink-0 flex items-center justify-center">
            <svg className="w-18 h-18 -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
              <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="#F8F9FA"
                strokeWidth="7"
              />
              <circle
                cx="36"
                cy="36"
                r={radius}
                fill="none"
                stroke="#254EDB"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                className="transition-all duration-300"
              />
            </svg>
            <span className="absolute font-mono text-xs font-bold text-[#141518] tabular-nums">
              {overall.percent}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Module Selector Pills — all 8 visible on desktop, horizontal scroll on mobile */}
      <div className="mt-5">
        <div
          role="tablist"
          aria-label="Course modules"
          className="flex sm:flex-wrap items-center gap-2 overflow-x-auto sm:overflow-visible pb-1 sm:pb-0"
        >
          {modules.map((mod) => {
            const isSelected = mod.id === activeModule.id;
            const modStats = computeModuleMastery(mod, progress);
            return (
              <button
                key={mod.id}
                role="tab"
                aria-selected={isSelected}
                type="button"
                onClick={() => onSelectModule(mod.id)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#254EDB] ${
                  isSelected
                    ? 'bg-[#254EDB] text-white'
                    : 'bg-[#ECEEF2] text-[#141518] hover:bg-[#E0E4EB]'
                }`}
              >
                <span className={`font-mono text-[11px] tabular-nums ${isSelected ? 'text-white/85' : 'text-[#5A606A]'}`}>
                  {mod.number}
                </span>
                <span>{mod.shortTitle}</span>
                {modStats.percent === 100 && (
                  <CheckCircle2
                    className={`w-3.5 h-3.5 ${isSelected ? 'text-[#A3E635]' : 'text-[#254EDB]'}`}
                    aria-label="Completed"
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile section switcher */}
        <div className="mt-3 flex md:hidden items-center gap-1.5 bg-[#ECEEF2] p-1 rounded-full">
          {mobileTabs.map((tab) => {
            const active = activeSection === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onSelectSection(tab.id)}
                className={`flex-1 py-2 px-2 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                  active ? 'bg-[#F8F9FA] text-[#254EDB]' : 'text-[#5A606A]'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
