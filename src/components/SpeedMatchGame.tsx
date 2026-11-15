import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, RotateCcw, Timer } from 'lucide-react';
import type { MatchPair } from '../types/study';
import { formatElapsedTime } from '../utils/gameLogic';

interface SpeedMatchGameProps {
  moduleId: string;
  pairs: MatchPair[];
  bestTimeMs?: number;
  onCompleteMatch: (moduleId: string, elapsedMs: number) => void;
}

function shuffleArray<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function SpeedMatchGame({
  moduleId,
  pairs,
  bestTimeMs,
  onCompleteMatch,
}: SpeedMatchGameProps) {
  const [seed, setSeed] = useState(0);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedIds, setMatchedIds] = useState<string[]>([]);
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [finishedMs, setFinishedMs] = useState<number | null>(null);

  const shuffledRight = useMemo(() => {
    void seed;
    return shuffleArray(pairs);
  }, [moduleId, pairs, seed]);

  useEffect(() => {
    setSelectedLeft(null);
    setMatchedIds([]);
    setWrongPair(null);
    setMistakes(0);
    setStartTime(null);
    setElapsedMs(0);
    setFinishedMs(null);
  }, [moduleId, seed]);

  useEffect(() => {
    if (startTime === null || finishedMs !== null) return;
    const timer = window.setInterval(() => {
      setElapsedMs(Date.now() - startTime);
    }, 100);
    return () => window.clearInterval(timer);
  }, [startTime, finishedMs]);

  function ensureTimerStarted(): number {
    if (startTime !== null) return startTime;
    const now = Date.now();
    setStartTime(now);
    return now;
  }

  function handlePickLeft(pairId: string) {
    if (matchedIds.includes(pairId) || finishedMs !== null) return;
    ensureTimerStarted();
    setWrongPair(null);
    setSelectedLeft(pairId);
  }

  function handlePickRight(rightPairId: string) {
    if (!selectedLeft || matchedIds.includes(rightPairId) || finishedMs !== null) return;
    const startedAt = ensureTimerStarted();

    if (selectedLeft === rightPairId) {
      const nextMatched = [...matchedIds, rightPairId];
      setMatchedIds(nextMatched);
      setSelectedLeft(null);
      setWrongPair(null);

      if (nextMatched.length === pairs.length) {
        const finalMs = Date.now() - startedAt;
        setFinishedMs(finalMs);
        setElapsedMs(finalMs);
        onCompleteMatch(moduleId, finalMs);
      }
    } else {
      setMistakes((m) => m + 1);
      setWrongPair({ left: selectedLeft, right: rightPairId });
      window.setTimeout(() => {
        setWrongPair(null);
        setSelectedLeft(null);
      }, 420);
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#5A606A] tabular-nums">
          Matched <span className="font-semibold text-[#141518]">{matchedIds.length}</span> of {pairs.length} · Mistakes: {mistakes}
          {bestTimeMs !== undefined && (
            <span className="ml-2 font-semibold text-[#254EDB]">
              · Best: {formatElapsedTime(bestTimeMs)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 font-mono text-sm font-bold text-[#141518] tabular-nums bg-[#ECEEF2] px-3 py-1.5 rounded-full">
            <Timer className="w-4 h-4 text-[#254EDB]" aria-hidden="true" />
            {formatElapsedTime(finishedMs ?? elapsedMs)}
          </span>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] text-xs font-semibold text-[#141518] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {finishedMs !== null ? (
        <div className="bg-[#A3E635]/25 rounded-2xl p-6 sm:p-8 border border-[#141518]/15 space-y-3">
          <p className="text-xs font-bold text-[#141518]">Board Cleared (+25 XP)</p>
          <h3 className="font-display text-2xl font-bold text-[#141518] tabular-nums">
            Finished in {formatElapsedTime(finishedMs)} with {mistakes} mistake{mistakes === 1 ? '' : 's'}
          </h3>
          <button
            type="button"
            onClick={() => setSeed((s) => s + 1)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#254EDB] hover:bg-[#1E40B8] text-white text-sm font-semibold transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Beat Your Time</span>
          </button>
        </div>
      ) : (
        <div className="bg-[#F5F3EE] rounded-2xl p-4 sm:p-6 border border-[#141518]/10">
          <p className="text-xs text-[#5A606A] mb-4">
            Pick a concept on the left, then tap its matching rule or result on the right.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2.5">
              {pairs.map((pair) => {
                const isMatched = matchedIds.includes(pair.id);
                const isSelected = selectedLeft === pair.id;
                const isWrong = wrongPair?.left === pair.id;
                return (
                  <button
                    key={pair.id}
                    type="button"
                    disabled={isMatched}
                    onClick={() => handlePickLeft(pair.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm font-semibold transition-all flex items-center justify-between gap-2 ${
                      isMatched
                        ? 'bg-[#A3E635]/30 border-[#141518]/15 text-[#5A606A] cursor-default'
                        : isWrong
                        ? 'bg-[#FF5A36]/20 border-[#FF5A36] text-[#141518] animate-shake'
                        : isSelected
                        ? 'bg-[#254EDB] border-[#254EDB] text-white cursor-pointer'
                        : 'bg-[#F8F9FA] hover:bg-white border-[#141518]/12 text-[#141518] cursor-pointer'
                    }`}
                  >
                    <span>{pair.left}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-[#141518] shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>

            <div className="space-y-2.5">
              {shuffledRight.map((pair) => {
                const isMatched = matchedIds.includes(pair.id);
                const isWrong = wrongPair?.right === pair.id;
                return (
                  <button
                    key={pair.id}
                    type="button"
                    disabled={isMatched || selectedLeft === null}
                    onClick={() => handlePickRight(pair.id)}
                    className={`w-full text-left px-4 py-3 rounded-xl border text-sm transition-all flex items-center justify-between gap-2 ${
                      isMatched
                        ? 'bg-[#A3E635]/30 border-[#141518]/15 text-[#5A606A] cursor-default'
                        : isWrong
                        ? 'bg-[#FF5A36]/20 border-[#FF5A36] text-[#141518] animate-shake'
                        : selectedLeft !== null
                        ? 'bg-[#ECEEF2] hover:bg-white border-[#254EDB]/35 text-[#141518] cursor-pointer font-medium'
                        : 'bg-[#ECEEF2]/60 border-[#141518]/8 text-[#5A606A] cursor-not-allowed'
                    }`}
                  >
                    <span>{pair.right}</span>
                    {isMatched && <CheckCircle2 className="w-4 h-4 text-[#141518] shrink-0" aria-hidden="true" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
