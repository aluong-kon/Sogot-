import React, { useState } from 'react';
import { Target, Users, Trophy, Play, Sparkles, BookOpen } from 'lucide-react';
import { GameMode, Player, Team } from '../types/game';

interface ModeSelectModalProps {
  isOpen: boolean;
  onStartGame: (mode: GameMode, players: Player[], teams?: Team[]) => void;
  onOpenLore: () => void;
}

export const ModeSelectModal: React.FC<ModeSelectModalProps> = ({
  isOpen,
  onStartGame,
  onOpenLore,
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('practice');
  const [p1Name, setP1Name] = useState<string>('Deng');
  const [p2Name, setP2Name] = useState<string>('Ajak');

  if (!isOpen) return null;

  const handleLaunch = () => {
    if (selectedMode === 'practice') {
      const player: Player = {
        id: 'p1',
        name: p1Name.trim() || 'Practitioner',
        avatarColor: '#fcdd09',
        avatarIcon: '🇸🇸',
        totalDistance: 0,
        bestDistance: 0,
        attempts: 0,
        catches: 0,
        eliminations: 0,
      };
      onStartGame('practice', [player]);
    } else if (selectedMode === 'local_2p') {
      const players: Player[] = [
        {
          id: 'p1',
          name: p1Name.trim() || 'Player 1',
          avatarColor: '#fcdd09',
          avatarIcon: '⚡',
          totalDistance: 0,
          bestDistance: 0,
          attempts: 0,
          catches: 0,
          eliminations: 0,
        },
        {
          id: 'p2',
          name: p2Name.trim() || 'Player 2',
          avatarColor: '#078930',
          avatarIcon: '🌟',
          totalDistance: 0,
          bestDistance: 0,
          attempts: 0,
          catches: 0,
          eliminations: 0,
        },
      ];
      onStartGame('local_2p', players);
    } else if (selectedMode === 'teams') {
      const teamA: Team = {
        id: 'A',
        name: 'Bright Stars 🇸🇸',
        color: '#078930',
        accentColor: '#fcdd09',
        players: [
          {
            id: 'tA1',
            name: `${p1Name} (Captain)`,
            teamId: 'A',
            avatarColor: '#078930',
            avatarIcon: '⭐',
            totalDistance: 0,
            bestDistance: 0,
            attempts: 0,
            catches: 0,
            eliminations: 0,
          },
          {
            id: 'tA2',
            name: 'Bol',
            teamId: 'A',
            avatarColor: '#078930',
            avatarIcon: '⚡',
            totalDistance: 0,
            bestDistance: 0,
            attempts: 0,
            catches: 0,
            eliminations: 0,
          },
        ],
        totalDistance: 0,
        roundsWon: 0,
      };

      const teamB: Team = {
        id: 'B',
        name: 'Nile Gazelles 🦌',
        color: '#da121a',
        accentColor: '#0f47af',
        players: [
          {
            id: 'tB1',
            name: `${p2Name} (Captain)`,
            teamId: 'B',
            avatarColor: '#da121a',
            avatarIcon: '🦌',
            totalDistance: 0,
            bestDistance: 0,
            attempts: 0,
            catches: 0,
            eliminations: 0,
          },
          {
            id: 'tB2',
            name: 'Majok',
            teamId: 'B',
            avatarColor: '#da121a',
            avatarIcon: '🔥',
            totalDistance: 0,
            bestDistance: 0,
            attempts: 0,
            catches: 0,
            eliminations: 0,
          },
        ],
        totalDistance: 0,
        roundsWon: 0,
      };

      onStartGame('teams', [...teamA.players, ...teamB.players], [teamA, teamB]);
    } else if (selectedMode === 'tournament') {
      const players: Player[] = [
        {
          id: 'p1',
          name: p1Name.trim() || 'Champion',
          avatarColor: '#fcdd09',
          avatarIcon: '🏆',
          totalDistance: 0,
          bestDistance: 0,
          attempts: 0,
          catches: 0,
          eliminations: 0,
        },
      ];
      onStartGame('tournament', players);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="bg-stone-900 border-2 border-amber-600/50 rounded-3xl max-w-xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Banner Hero */}
        <div className="p-6 text-center bg-gradient-to-b from-amber-950/80 via-stone-900 to-stone-900 border-b border-stone-800">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/40 rounded-full px-4 py-1 text-xs font-bold text-amber-400 mb-2">
            <span>South Sudanese Cultural Recreation</span>
            <span>🇸🇸</span>
          </div>
          <h1 className="font-display font-black text-4xl md:text-5xl tracking-wider text-amber-500 drop-shadow-md">
            SOGOT
          </h1>
          <p className="text-xs md:text-sm text-stone-300 mt-1 max-w-md mx-auto">
            Traditional childhood stick game with the authentic call-and-response ritual, 3D physics,
            and field challenges.
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Mode Selection Grid */}
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-stone-400 block">
              Choose Game Mode
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                {
                  id: 'practice',
                  title: 'Practice Mode',
                  desc: 'Master the lift, strike, and call-and-response freely',
                  icon: Target,
                  badge: 'Recommended',
                },
                {
                  id: 'local_2p',
                  title: '2-Player Match',
                  desc: 'Pass & play on one device, turn by turn',
                  icon: Users,
                  badge: 'Head-to-Head',
                },
                {
                  id: 'teams',
                  title: 'Team Competition',
                  desc: 'Bright Stars 🇸🇸 vs Nile Gazelles 🦌',
                  icon: Sparkles,
                  badge: '2v2 Teams',
                },
                {
                  id: 'tournament',
                  title: 'National Cup',
                  desc: '8-team South Sudan regional knockout bracket',
                  icon: Trophy,
                  badge: 'Cup Bracket',
                },
              ].map((m) => {
                const Icon = m.icon;
                const isSelected = selectedMode === m.id;
                return (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMode(m.id as GameMode)}
                    className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500 shadow-md ring-1 ring-amber-500'
                        : 'bg-stone-950/50 border-stone-800 hover:border-stone-700'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-1.5">
                        <Icon
                          className={`w-5 h-5 ${isSelected ? 'text-amber-400' : 'text-stone-400'}`}
                        />
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-800 text-stone-300">
                          {m.badge}
                        </span>
                      </div>
                      <span className="font-bold text-sm block text-white">{m.title}</span>
                      <span className="text-[11px] text-stone-400 leading-tight block mt-1">
                        {m.desc}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Player Customization */}
          <div className="bg-stone-950/60 p-4 rounded-2xl border border-stone-800/80 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
              Player Names
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-stone-400 block mb-1">Player 1 Name:</label>
                <input
                  type="text"
                  value={p1Name}
                  maxLength={16}
                  onChange={(e) => setP1Name(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
                />
              </div>

              {(selectedMode === 'local_2p' || selectedMode === 'teams') && (
                <div>
                  <label className="text-xs text-stone-400 block mb-1">Player 2 Name:</label>
                  <input
                    type="text"
                    value={p2Name}
                    maxLength={16}
                    onChange={(e) => setP2Name(e.target.value)}
                    className="w-full bg-stone-900 border border-stone-700 rounded-xl px-3 py-2 text-sm text-stone-100 font-semibold focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex items-center justify-between">
          <button
            onClick={onOpenLore}
            className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 font-semibold cursor-pointer"
          >
            <BookOpen className="w-4 h-4" />
            <span>Read Traditional Lore</span>
          </button>

          <button
            onClick={handleLaunch}
            className="bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-95 text-stone-950 font-black px-8 py-3 rounded-2xl text-sm flex items-center gap-2 cursor-pointer shadow-xl transition-all"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Enter Field & Play</span>
          </button>
        </div>
      </div>
    </div>
  );
};
