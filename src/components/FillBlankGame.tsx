import { useEffect, useState, type FormEvent } from 'react';
import { ArrowRight, ArrowUpRight, CheckCircle2, HelpCircle, PlayCircle, XCircle } from 'lucide-react';
import type { FillBlankChallenge } from '../types/study';
import { buildYouTubeSearchUrl, checkFillBlankAnswer } from '../utils/gameLogic';

interface FillBlankGameProps {
  moduleId: string;
  challenges: FillBlankChallenge[];
  solvedIds: string[];
  onSolveChallenge: (challengeId: string) => void;
}

export function FillBlankGame({
  moduleId,
  challenges,
  solvedIds,
  onSolveChallenge,
}: FillBlankGameProps) {
  const [idx, setIdx] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [status, setStatus] = useState<'idle' | 'correct' | 'wrong'>('idle');
  const [revealSolution, setRevealSolution] = useState(false);

  useEffect(() => {
    setIdx(0);
    setInputValue('');
    setShowHint(false);
    setStatus('idle');
    setRevealSolution(false);
  }, [moduleId]);

  const challenge = challenges[idx];
  const solvedCount = challenges.filter((c) => solvedIds.includes(c.id)).length;

  if (!challenge) return null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!inputValue.trim()) return;
    const ok = checkFillBlankAnswer(inputValue, challenge);
    if (ok) {
      setStatus('correct');
      setRevealSolution(true);
      onSolveChallenge(challenge.id);
    } else {
      setStatus('wrong');
    }
  }

  function handleNext() {
    setIdx((prev) => (prev + 1 < challenges.length ? prev + 1 : 0));
    setInputValue('');
    setShowHint(false);
    setStatus('idle');
    setRevealSolution(false);
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#5A606A] tabular-nums">
          Challenge <span className="font-semibold text-[#141518]">{idx + 1}</span> of {challenges.length} ·{' '}
          <span className="font-semibold text-[#254EDB]">{solvedCount}/{challenges.length} Solved</span>
        </div>

        <button
          type="button"
          onClick={() => setShowHint((h) => !h)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] text-xs font-semibold text-[#141518] transition-colors cursor-pointer"
        >
          <HelpCircle className="w-3.5 h-3.5 text-[#254EDB]" aria-hidden="true" />
          <span>{showHint ? 'Hide Formula Hint' : 'Show Formula Hint'}</span>
        </button>
      </div>

      <div className="bg-[#F8F9FA] rounded-2xl p-6 border border-[#141518]/10 space-y-5">
        <div>
          <p className="text-xs font-semibold text-[#254EDB] mb-1.5">
            {challenge.subtopic}
          </p>
          <p className="text-base sm:text-lg font-medium text-[#141518] leading-relaxed">
            {challenge.prompt}
          </p>
        </div>

        {showHint && (
          <div className="bg-[#F5F3EE] rounded-xl p-3.5 border border-[#141518]/10 text-xs text-[#141518]">
            Hint: {challenge.hint}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <label htmlFor="blank-answer-input" className="block text-xs font-semibold text-[#5A606A]">
            {challenge.blankLabel}
          </label>
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              id="blank-answer-input"
              type="text"
              value={inputValue}
              onChange={(e) => {
                setInputValue(e.target.value);
                if (status !== 'idle') setStatus('idle');
              }}
              placeholder={challenge.placeholder}
              className="flex-1 px-4 py-3 rounded-xl bg-[#ECEEF2]/70 border border-[#141518]/15 focus:border-[#254EDB] focus:bg-white focus:outline-none font-mono text-sm text-[#141518] tabular-nums"
            />
            <button
              type="submit"
              className="px-6 py-3 rounded-xl bg-[#254EDB] hover:bg-[#1E40B8] text-white text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap"
            >
              Check Answer
            </button>
          </div>
        </form>

        {status === 'correct' && (
          <div className="bg-[#A3E635]/25 rounded-xl p-4 border border-[#141518]/15 text-sm text-[#141518] flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#141518] shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="font-bold">Spot on (+20 XP)</p>
              <p className="mt-1">{challenge.workedSolution}</p>
            </div>
          </div>
        )}

        {status === 'wrong' && (
          <div className="bg-[#FF5A36]/12 rounded-xl p-4 border border-[#FF5A36]/35 text-sm text-[#141518] flex items-start justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <XCircle className="w-5 h-5 text-[#FF5A36] shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="font-bold">Not quite — check your numbers or try the hint.</p>
                {revealSolution && <p className="mt-1">{challenge.workedSolution}</p>}
              </div>
            </div>
            {!revealSolution && (
              <button
                type="button"
                onClick={() => setRevealSolution(true)}
                className="text-xs font-semibold text-[#254EDB] hover:underline shrink-0 cursor-pointer"
              >
                Reveal Solution
              </button>
            )}
          </div>
        )}

        <div className="pt-4 border-t border-[#141518]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <a
            href={buildYouTubeSearchUrl(challenge.youtubeQuery)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#254EDB] hover:underline"
          >
            <PlayCircle className="w-4 h-4 text-[#FF5A36] shrink-0" aria-hidden="true" />
            <span>{challenge.youtubeLabel}</span>
            <ArrowUpRight className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
          </a>

          <button
            type="button"
            onClick={handleNext}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] text-xs font-semibold text-[#141518] transition-colors cursor-pointer shrink-0"
          >
            <span>Next Challenge</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}
