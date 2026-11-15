import { useEffect, useState } from 'react';
import { Check, RotateCcw, Shuffle } from 'lucide-react';
import type { FlashcardItem } from '../types/study';

interface FlashcardGameProps {
  moduleId: string;
  cards: FlashcardItem[];
  masteredIds: string[];
  reviewQueueIds: string[];
  onSwipeCard: (cardId: string, action: 'got-it' | 'review-again') => void;
}

export function FlashcardGame({
  moduleId,
  cards,
  masteredIds,
  reviewQueueIds,
  onSwipeCard,
}: FlashcardGameProps) {
  const [deck, setDeck] = useState<FlashcardItem[]>(cards);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [lastActionLabel, setLastActionLabel] = useState<string | null>(null);

  useEffect(() => {
    setDeck(cards);
    setIndex(0);
    setFlipped(false);
    setLastActionLabel(null);
  }, [moduleId, cards]);

  const currentCard = deck[index];
  const masteredCount = cards.filter((c) => masteredIds.includes(c.id)).length;

  function handleFlip() {
    setFlipped((prev) => !prev);
  }

  function handleSwipe(action: 'got-it' | 'review-again') {
    if (!currentCard) return;
    onSwipeCard(currentCard.id, action);
    setLastActionLabel(
      action === 'got-it' ? 'Marked Got It (+10 XP)' : 'Added to Review Queue'
    );
    setFlipped(false);
    setIndex((prev) => (prev + 1 < deck.length ? prev + 1 : 0));
  }

  function handleShuffle() {
    const copy = [...deck];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    setDeck(copy);
    setIndex(0);
    setFlipped(false);
    setLastActionLabel('Deck shuffled');
  }

  if (!currentCard) {
    return null;
  }

  const isMastered = masteredIds.includes(currentCard.id);
  const isQueued = reviewQueueIds.includes(currentCard.id);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs text-[#5A606A] tabular-nums">
          Card <span className="font-semibold text-[#141518]">{index + 1}</span> of {deck.length} ·{' '}
          <span className="font-semibold text-[#254EDB]">{masteredCount}/{cards.length} Got It</span>
          {lastActionLabel && (
            <span className="ml-2 font-medium text-[#141518]">· {lastActionLabel}</span>
          )}
        </div>

        <button
          type="button"
          onClick={handleShuffle}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ECEEF2] hover:bg-[#E0E4EB] text-xs font-semibold text-[#141518] transition-colors cursor-pointer"
        >
          <Shuffle className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Shuffle Deck</span>
        </button>
      </div>

      {/* Tactile 3D Flip Card */}
      <div className="perspective-1000">
        <button
          type="button"
          onClick={handleFlip}
          aria-label={flipped ? 'Flip flashcard to question side' : 'Flip flashcard to answer side'}
          className="w-full text-left cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#254EDB] rounded-2xl"
        >
          <div
            className={`relative w-full min-h-[210px] transition-transform duration-300 transform-style-3d ${
              flipped ? 'rotate-y-180' : ''
            }`}
          >
            {/* Front Side */}
            <div className="absolute inset-0 backface-hidden bg-[#F5F3EE] rounded-2xl p-6 border border-[#141518]/12 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 text-xs text-[#5A606A]">
                <span>{currentCard.subtopic} · Prompt</span>
                <span>
                  {isMastered ? 'Status: Got It' : isQueued ? 'Status: In Review' : 'Click card to flip'}
                </span>
              </div>
              <p className="font-display text-xl sm:text-2xl font-bold text-[#141518] leading-snug my-4">
                {currentCard.prompt}
              </p>
              <span className="text-xs font-semibold text-[#254EDB]">
                Tap to reveal answer
              </span>
            </div>

            {/* Back Side */}
            <div className="absolute inset-0 backface-hidden rotate-y-180 bg-[#ECEEF2] rounded-2xl p-6 sm:p-8 border border-[#254EDB]/30 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-2 text-xs text-[#254EDB] font-semibold">
                <span>{currentCard.subtopic} · Answer</span>
                <span className="text-[#5A606A] font-normal">Tap to flip back</span>
              </div>
              <div className="my-4 space-y-2">
                <p className="text-base sm:text-lg font-semibold text-[#141518] leading-relaxed">
                  {currentCard.answer}
                </p>
                {currentCard.memoryTip && (
                  <p className="text-xs text-[#5A606A]">
                    Tip: {currentCard.memoryTip}
                  </p>
                )}
              </div>
              <span className="text-xs text-[#5A606A]">
                Pick Got It or Review Again below
              </span>
            </div>
          </div>
        </button>
      </div>

      {/* Swipe / Decision Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => handleSwipe('review-again')}
          className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#FF5A36]/12 hover:bg-[#FF5A36]/20 text-[#141518] border border-[#FF5A36]/40 text-sm font-bold transition-all active:scale-[0.99] cursor-pointer"
        >
          <RotateCcw className="w-4 h-4 text-[#FF5A36]" aria-hidden="true" />
          <span>Review Again</span>
        </button>
        <button
          type="button"
          onClick={() => handleSwipe('got-it')}
          className="inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#A3E635] hover:bg-[#95D62B] text-[#141518] text-sm font-bold transition-all active:scale-[0.99] cursor-pointer"
        >
          <Check className="w-4 h-4 text-[#141518]" aria-hidden="true" />
          <span>Got It</span>
        </button>
      </div>
    </div>
  );
}
