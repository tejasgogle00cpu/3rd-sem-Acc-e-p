import type { MainSection } from '../types/study';

interface HeaderProps {
  activeSection: MainSection;
  reviewCount: number;
  onSelectSection: (section: MainSection) => void;
  onStartSprint: () => void;
}

export function Header({
  activeSection,
  reviewCount,
  onSelectSection,
  onStartSprint,
}: HeaderProps) {
  const navItems: { id: MainSection; label: string }[] = [
    { id: 'guide', label: 'Study Guide' },
    { id: 'games', label: 'Mini-Games' },
    { id: 'problems', label: 'Exam Problems' },
    {
      id: 'review',
      label: reviewCount > 0 ? `Review Queue (${reviewCount})` : 'Review Queue',
    },
  ];

  return (
    <header className="sticky top-0 z-30 bg-[#F8F9FA]/95 backdrop-blur-sm border-b border-[#141518]/10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onSelectSection('guide')}
          className="font-display text-xl font-extrabold tracking-tight text-[#141518] whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#254EDB] rounded"
        >
          LedgerLoop
        </button>

        <nav aria-label="Primary navigation" className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectSection(item.id)}
                className={`relative py-1.5 text-sm font-medium whitespace-nowrap shrink-0 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#254EDB] rounded ${
                  isActive
                    ? 'text-[#254EDB] font-semibold'
                    : 'text-[#5A606A] hover:text-[#141518]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#254EDB] rounded-full"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onStartSprint}
            className="px-4 py-2 text-sm font-semibold text-white bg-[#254EDB] hover:bg-[#1E40B8] active:scale-[0.98] rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#254EDB]"
          >
            Quick Exam Sprint
          </button>
        </div>
      </div>
    </header>
  );
}
