import React from 'react';
import {
  BookOpen,
  Settings,
  Trophy,
  Volume2,
  VolumeX,
  RotateCcw,
  Flag,
} from 'lucide-react';
import { GameMode, Player } from '../types/game';

interface TopStatusBarProps {
  gameMode: GameMode;
  activePlayer: Player;
  currentDistance: number;
  bestDistance: number;
  attemptNumber: number;
  maxAttempts: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenLore: () => void;
  onOpenSettings: () => void;
  onOpenTournament: () => void;
  onResetGame: () => void;
}

export const TopStatusBar: React.FC<TopStatusBarProps> = ({
  gameMode,
  activePlayer,
  currentDistance,
  bestDistance,
  attemptNumber,
  maxAttempts,
  soundEnabled,
  onToggleSound,
  onOpenLore,
  onOpenSettings,
  onOpenTournament,
  onResetGame,
}) => {
  const getModeLabel = () => {
    switch (gameMode) {
      case 'practice':
        return 'Practice Field';
      case 'local_2p':
        return '2-Player Match';
      case 'teams':
        return 'Team Competition';
      case 'tournament':
        return 'South Sudan Cup';
    }
  };

  return (
    <header className="fixed top-3 left-0 right-0 z-30 px-3 md:px-6 pointer-events-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Left: Game Brand & Active Player */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* SOGOT Title Badge */}
          <div className="bg-stone-950/90 border border-amber-900/60 rounded-2xl px-3.5 py-2 shadow-xl backdrop-blur-md flex items-center gap-2">
            <span className="text-xl md:text-2xl" role="img" aria-label="South Sudan">
              🇸🇸
            </span>
            <div className="flex flex-col">
              <span className="font-display font-black text-amber-500 tracking-wider text-base md:text-lg leading-none">
                SOGOT
              </span>
              <span className="text-[10px] text-stone-400 font-semibold uppercase tracking-wider">
                {getModeLabel()}
              </span>
            </div>
          </div>

          {/* Active Player Card */}
          <div className="hidden sm:flex items-center gap-2.5 bg-stone-950/85 border border-stone-800 rounded-2xl px-3.5 py-2 shadow-lg backdrop-blur-md">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs text-stone-950 shadow-inner"
              style={{ backgroundColor: activePlayer.avatarColor }}
            >
              {activePlayer.avatarIcon}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-stone-200 leading-tight">
                {activePlayer.name}
              </span>
              <span className="text-[10px] text-amber-400 font-bold">
                Strike {attemptNumber} of {maxAttempts} • Uncaught Streak
              </span>
            </div>
          </div>
        </div>

        {/* Center: Live Distance HUD (Hero Readout) */}
        <div className="flex items-center pointer-events-auto">
          <div className="bg-stone-950/90 border border-amber-500/40 rounded-2xl px-5 py-1.5 shadow-2xl backdrop-blur-md flex items-baseline gap-2">
            <span className="text-xs uppercase font-bold text-stone-400 tracking-wider">
              Distance:
            </span>
            <span className="font-display font-black text-2xl md:text-3xl text-amber-400 tracking-tight">
              {currentDistance.toFixed(1)}
            </span>
            <span className="text-xs font-bold text-amber-500/80">meters</span>

            {bestDistance > 0 && (
              <div className="ml-2 pl-2 border-l border-stone-800 text-[11px] text-stone-400 flex items-center gap-1 hidden md:flex">
                <Flag className="w-3 h-3 text-emerald-400" />
                <span>Best:</span>
                <span className="font-bold text-emerald-400">{bestDistance.toFixed(1)}m</span>
              </div>
            )}
          </div>
        </div>

        {/* Right: Modals & Settings Actions */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          {/* Rules & Lore Button */}
          <button
            onClick={onOpenLore}
            title="Sogot Heritage & Traditional Rules"
            className="p-2.5 rounded-xl bg-stone-950/90 hover:bg-stone-900 text-amber-400 hover:text-amber-300 border border-stone-800 shadow-md backdrop-blur-md cursor-pointer transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <BookOpen className="w-4 h-4" />
            <span className="hidden md:inline">Heritage</span>
          </button>

          {/* Tournament View Button */}
          <button
            onClick={onOpenTournament}
            title="Tournament Bracket"
            className="p-2.5 rounded-xl bg-stone-950/90 hover:bg-stone-900 text-stone-200 hover:text-white border border-stone-800 shadow-md backdrop-blur-md cursor-pointer transition-all flex items-center gap-1 text-xs font-semibold"
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Tournament</span>
          </button>

          {/* Audio Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
            className="p-2.5 rounded-xl bg-stone-950/90 hover:bg-stone-900 text-stone-300 hover:text-white border border-stone-800 shadow-md backdrop-blur-md cursor-pointer transition-all"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-stone-500" />}
          </button>

          {/* Settings */}
          <button
            onClick={onOpenSettings}
            title="Settings & Community Rules"
            className="p-2.5 rounded-xl bg-stone-950/90 hover:bg-stone-900 text-stone-300 hover:text-white border border-stone-800 shadow-md backdrop-blur-md cursor-pointer transition-all"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* Mode Switch / Restart */}
          <button
            onClick={onResetGame}
            title="Change Game Mode"
            className="p-2.5 rounded-xl bg-stone-950/90 hover:bg-stone-900 text-stone-300 hover:text-white border border-stone-800 shadow-md backdrop-blur-md cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
