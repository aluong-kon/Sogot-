import React from 'react';
import { X, Trophy, Award, ChevronRight, Play } from 'lucide-react';
import { TournamentMatch } from '../types/game';

interface TournamentModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: TournamentMatch[];
  currentMatchIndex: number;
  onStartTournamentMatch: (matchId: string) => void;
}

export const TournamentModal: React.FC<TournamentModalProps> = ({
  isOpen,
  onClose,
  matches,
  currentMatchIndex,
  onStartTournamentMatch,
}) => {
  if (!isOpen) return null;

  const quarters = matches.filter((m) => m.round === 'quarter');
  const semis = matches.filter((m) => m.round === 'semi');
  const finals = matches.filter((m) => m.round === 'final');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-800/60 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-stone-950 via-stone-900 to-amber-950/40">
          <div className="flex items-center gap-3">
            <Trophy className="w-8 h-8 text-amber-500" />
            <div>
              <h2 className="font-display font-black text-2xl text-amber-400 tracking-wide">
                South Sudan SOGOT National Cup 🇸🇸
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Traditional Knockout Bracket — Best of 3 Turns Cumulative Distance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-400 hover:text-white cursor-pointer transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Bracket Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Round 1: Quarterfinals */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Quarterfinals
                </span>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                  4 Matches
                </span>
              </div>

              <div className="space-y-3">
                {quarters.map((match, idx) => (
                  <div
                    key={match.id}
                    className={`p-3.5 rounded-2xl border transition-all ${
                      idx === currentMatchIndex && !match.completed
                        ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-500/50'
                        : match.completed
                        ? 'bg-stone-950/70 border-stone-800'
                        : 'bg-stone-950/40 border-stone-800/60 opacity-80'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-stone-400 font-semibold">Match {idx + 1}</span>
                      {match.completed && (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Winner: {match.winner}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5 text-sm">
                      <div className="flex justify-between items-center font-bold">
                        <span className={match.winner === match.teamA ? 'text-amber-400' : 'text-stone-200'}>
                          {match.teamA}
                        </span>
                        <span className="text-stone-400 font-mono text-xs">{match.scoreA.toFixed(1)}m</span>
                      </div>
                      <div className="flex justify-between items-center font-bold">
                        <span className={match.winner === match.teamB ? 'text-amber-400' : 'text-stone-200'}>
                          {match.teamB}
                        </span>
                        <span className="text-stone-400 font-mono text-xs">{match.scoreB.toFixed(1)}m</span>
                      </div>
                    </div>

                    {!match.completed && idx === currentMatchIndex && (
                      <button
                        onClick={() => onStartTournamentMatch(match.id)}
                        className="mt-3 w-full bg-amber-500 hover:bg-amber-400 text-stone-950 font-black py-1.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Play Match Now</span>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Round 2: Semifinals */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Semifinals
                </span>
                <span className="text-[10px] bg-stone-800 text-stone-300 px-2 py-0.5 rounded-full">
                  2 Matches
                </span>
              </div>

              <div className="space-y-3">
                {semis.map((match, idx) => (
                  <div
                    key={match.id}
                    className={`p-3.5 rounded-2xl border ${
                      match.completed
                        ? 'bg-stone-950/70 border-stone-800'
                        : match.teamA
                        ? 'bg-stone-950/40 border-stone-800'
                        : 'bg-stone-950/20 border-dashed border-stone-800 opacity-60'
                    }`}
                  >
                    <div className="flex justify-between items-center text-xs mb-1.5 text-stone-400">
                      <span>Semi {idx + 1}</span>
                      {match.completed && (
                        <span className="text-emerald-400 font-bold">{match.winner}</span>
                      )}
                    </div>
                    <div className="space-y-1.5 text-sm font-bold">
                      <div className="flex justify-between">
                        <span>{match.teamA || 'TBD (Winner QF)'}</span>
                        <span className="text-xs text-stone-400 font-mono">{match.scoreA.toFixed(1)}m</span>
                      </div>
                      <div className="flex justify-between">
                        <span>{match.teamB || 'TBD (Winner QF)'}</span>
                        <span className="text-xs text-stone-400 font-mono">{match.scoreB.toFixed(1)}m</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Round 3: Grand Final */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-stone-800">
                <span className="text-xs font-bold uppercase tracking-wider text-yellow-400 flex items-center gap-1">
                  <Trophy className="w-3.5 h-3.5" />
                  Grand Final
                </span>
              </div>

              {finals.map((match) => (
                <div
                  key={match.id}
                  className="p-5 rounded-3xl bg-gradient-to-b from-amber-950/50 to-stone-950 border-2 border-amber-500/60 shadow-xl"
                >
                  <div className="text-center mb-3">
                    <span className="text-xs font-black text-amber-400 uppercase tracking-widest">
                      Championship Decider
                    </span>
                  </div>

                  <div className="space-y-3 text-base font-black">
                    <div className="bg-stone-900/80 p-3 rounded-2xl border border-stone-800 flex justify-between items-center">
                      <span>{match.teamA || 'Finalist 1'}</span>
                      <span className="text-amber-400 font-mono">{match.scoreA.toFixed(1)}m</span>
                    </div>
                    <div className="bg-stone-900/80 p-3 rounded-2xl border border-stone-800 flex justify-between items-center">
                      <span>{match.teamB || 'Finalist 2'}</span>
                      <span className="text-amber-400 font-mono">{match.scoreB.toFixed(1)}m</span>
                    </div>
                  </div>

                  {match.completed && (
                    <div className="mt-4 p-3 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-center">
                      <span className="text-xs text-emerald-300 font-bold block uppercase">
                        Cup Champions 🏆
                      </span>
                      <span className="text-lg font-black text-white">{match.winner}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="bg-stone-800 hover:bg-stone-700 text-stone-200 font-bold px-6 py-2 rounded-xl text-sm cursor-pointer transition-all"
          >
            Close Bracket
          </button>
        </div>
      </div>
    </div>
  );
};
