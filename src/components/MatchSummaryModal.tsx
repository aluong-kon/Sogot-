import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RotateCcw, Share2, Award, Zap, Shield } from 'lucide-react';
import { Player, StrikeResult, GameMode } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface MatchSummaryModalProps {
  isOpen: boolean;
  gameMode: GameMode;
  players: Player[];
  strikeHistory: StrikeResult[];
  onPlayAgain: () => void;
  onChangeMode: () => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  isOpen,
  gameMode,
  players,
  strikeHistory,
  onPlayAgain,
  onChangeMode,
}) => {
  useEffect(() => {
    if (isOpen) {
      soundManager.playCrowdCheer(true);
      try {
        confetti({
          particleCount: 120,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#078930', '#da121a', '#0f47af', '#fcdd09', '#ffffff'],
        });
      } catch {
        // Safe fallback
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Determine winner
  const sortedPlayers = [...players].sort((a, b) => b.totalDistance - a.totalDistance);
  const winner = sortedPlayers[0];
  const longestStrike = strikeHistory.reduce(
    (max, item) => (item.distanceMeters > max ? item.distanceMeters : max),
    0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border-2 border-amber-500/70 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-6 text-center bg-gradient-to-b from-amber-950/60 to-stone-950 border-b border-stone-800">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/20 border-2 border-amber-500 flex items-center justify-center mx-auto mb-3 shadow-lg">
            <Trophy className="w-8 h-8 text-amber-400" />
          </div>
          <span className="text-xs uppercase font-black tracking-widest text-amber-500 block">
            Match Completed
          </span>
          <h2 className="font-display font-black text-3xl text-white mt-1">
            {gameMode === 'practice' ? 'Practice Summary' : `${winner?.name} Victorious! 🇸🇸`}
          </h2>
          {winner && gameMode !== 'practice' && (
            <p className="text-sm text-stone-300 mt-1">
              Led the match with a total of{' '}
              <strong className="text-amber-400">{winner.totalDistance.toFixed(1)} meters!</strong>
            </p>
          )}
        </div>

        {/* Stats Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm">
          {/* Key Match Highlights */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 text-center">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                Longest Hit
              </span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {longestStrike.toFixed(1)}m
              </span>
            </div>

            <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 text-center">
              <Award className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                Total Strikes
              </span>
              <span className="text-lg font-black text-white font-mono">
                {strikeHistory.length}
              </span>
            </div>

            <div className="bg-stone-950/80 p-3 rounded-2xl border border-stone-800 text-center">
              <Shield className="w-4 h-4 text-blue-400 mx-auto mb-1" />
              <span className="text-[10px] text-stone-400 uppercase font-semibold block">
                Catches
              </span>
              <span className="text-lg font-black text-blue-400 font-mono">
                {strikeHistory.filter((s) => s.isCaught).length}
              </span>
            </div>
          </div>

          {/* Player Leaderboard Table */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Player Standings
            </span>
            <div className="space-y-2">
              {sortedPlayers.map((player, rank) => (
                <div
                  key={player.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border ${
                    rank === 0
                      ? 'bg-amber-950/40 border-amber-600/60'
                      : 'bg-stone-950/60 border-stone-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-black text-stone-400">
                      {rank === 0 ? '🥇' : rank === 1 ? '🥈' : `${rank + 1}.`}
                    </span>
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-stone-950"
                      style={{ backgroundColor: player.avatarColor }}
                    >
                      {player.avatarIcon}
                    </div>
                    <div>
                      <span className="font-bold text-white block leading-tight">
                        {player.name}
                      </span>
                      <span className="text-[11px] text-stone-400">
                        Best: {player.bestDistance.toFixed(1)}m • {player.attempts} attempts
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-black text-base text-amber-400">
                      {player.totalDistance.toFixed(1)}m
                    </span>
                    <span className="text-[10px] text-stone-500 block uppercase">Total Distance</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex flex-wrap gap-2 justify-end">
          <button
            onClick={onChangeMode}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold px-4 py-2.5 rounded-xl text-xs cursor-pointer transition-all"
          >
            Change Mode
          </button>

          <button
            onClick={onPlayAgain}
            className="bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-6 py-2.5 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Play Again</span>
          </button>
        </div>
      </div>
    </div>
  );
};
