import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, Award, Sparkles, ChevronRight, UserCheck } from 'lucide-react';
import { Player } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface CarryCelebrationModalProps {
  isOpen: boolean;
  player: Player;
  opponentName: string;
  threeStrikeTotalMeters: number;
  strikeDistances: number[];
  onContinue: () => void;
}

export const CarryCelebrationModal: React.FC<CarryCelebrationModalProps> = ({
  isOpen,
  player,
  opponentName,
  threeStrikeTotalMeters,
  strikeDistances,
  onContinue,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playCarryCelebration(player.name);
      try {
        confetti({
          particleCount: 160,
          spread: 90,
          origin: { y: 0.55 },
          colors: ['#fcdd09', '#078930', '#da121a', '#0f47af', '#ffffff'],
        });
      } catch {
        // Fallback
      }
    }
  }, [isOpen, player.name]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-gradient-to-b from-stone-900 via-stone-900 to-amber-950 border-2 border-amber-500 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden text-stone-100 flex flex-col">
        {/* Top Cultural Badge */}
        <div className="p-6 text-center border-b border-amber-800/40 bg-gradient-to-r from-amber-950/80 via-stone-900 to-amber-950/80">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/60 rounded-full px-4 py-1 text-xs font-black text-amber-400 mb-2">
            <span>Traditional South Sudanese Honor</span>
            <span>🇸🇸</span>
          </div>

          <div className="w-20 h-20 rounded-3xl bg-amber-500/30 border-2 border-amber-400 flex items-center justify-center mx-auto mb-3 shadow-xl">
            <span className="text-4xl" role="img" aria-label="Piggyback Carry">
              🏇
            </span>
          </div>

          <h2 className="font-display font-black text-3xl md:text-4xl text-amber-400 tracking-wide">
            KUOC! CARRY THE WINNER!
          </h2>
          <p className="text-sm font-bold text-stone-300 mt-1">
            3 Uncaught Strikes Completed!
          </p>
        </div>

        {/* Story & Cultural Context */}
        <div className="p-6 space-y-4 text-sm">
          <div className="bg-stone-950/80 border border-amber-700/40 rounded-2xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              The Traditional "Kuoc" (Piggyback) Penalty
            </div>
            <p className="text-stone-300 text-xs md:text-sm leading-relaxed">
              In authentic South Sudanese Sogot, because <strong>{opponentName}</strong> and the
              fielders failed to catch any of <strong>{player.name}</strong>'s 3 strikes, the losing
              opponent is required by custom to <strong>carry {player.name} on their back</strong> all
              the way from the far landing spot back to the launcher hole to celebratory cheers!
            </p>
          </div>

          {/* 3 Strikes Breakdown */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              3-Strike Distance Tally:
            </span>
            <div className="grid grid-cols-3 gap-2">
              {strikeDistances.map((dist, idx) => (
                <div
                  key={idx}
                  className="bg-stone-950/70 border border-stone-800 rounded-xl p-2.5 text-center"
                >
                  <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                    Hit #{idx + 1}
                  </span>
                  <span className="text-base font-black text-amber-400 font-mono">
                    {dist.toFixed(1)}m
                  </span>
                  <span className="text-[9px] text-emerald-400 font-bold block">✓ Uncaught</span>
                </div>
              ))}
            </div>
          </div>

          {/* Cumulative Total */}
          <div className="bg-emerald-950/40 border border-emerald-600/50 rounded-2xl p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-emerald-400" />
              <div>
                <span className="text-xs text-stone-300 block font-medium">Cumulative Streak Score:</span>
                <span className="text-xl font-black text-emerald-400 font-mono">
                  {threeStrikeTotalMeters.toFixed(1)} meters
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-stone-400 block uppercase">Status</span>
              <span className="text-xs font-bold text-amber-400">Carried in Triumph!</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onContinue}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 active:scale-98 text-stone-950 font-black py-3 px-6 rounded-2xl text-sm flex items-center justify-center gap-2 cursor-pointer shadow-xl transition-all"
          >
            <span>Pass Bat to Next Player</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
