import React, { useState } from 'react';
import { X, BookOpen, Sparkles, Shield, Heart } from 'lucide-react';

interface CultureLoreModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CultureLoreModal: React.FC<CultureLoreModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'heritage' | 'rules' | 'call_response' | 'preservation'>(
    'heritage'
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-amber-800/60 rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-gradient-to-r from-stone-950 to-stone-900">
          <div className="flex items-center gap-3">
            <span className="text-3xl" role="img" aria-label="South Sudan">
              🇸🇸
            </span>
            <div>
              <h2 className="font-display font-black text-2xl text-amber-500 tracking-wide">
                SOGOT Heritage & Lore
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Traditional South Sudanese Stick Game Preservation
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

        {/* Tab Navigation */}
        <div className="flex border-b border-stone-800 bg-stone-950/60 px-6 gap-2 overflow-x-auto">
          {[
            { id: 'heritage', label: 'Cultural Roots' },
            { id: 'rules', label: 'Traditional Rules' },
            { id: 'call_response', label: 'The "SOGOT!" Call' },
            { id: 'preservation', label: 'Preservation' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`py-3 px-3 text-xs md:text-sm font-semibold border-b-2 cursor-pointer transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-amber-500 text-amber-400'
                  : 'border-transparent text-stone-400 hover:text-stone-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-stone-300 text-sm leading-relaxed">
          {activeTab === 'heritage' && (
            <div className="space-y-4">
              <div className="bg-amber-950/30 border border-amber-900/40 rounded-2xl p-4">
                <h3 className="font-display font-bold text-lg text-amber-400 mb-1 flex items-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Childhood in South Sudan
                </h3>
                <p>
                  Across South Sudan—from Juba, Malakal, Wau, Bor, and Torit to rural homesteads and
                  cattle camps—generations of children have gathered at dusk on red earth clearings to
                  play <strong>Sogot</strong>. With just two branches carved from native acacia or neem
                  trees and a small trench scooped out of the dirt with bare hands or the long stick,
                  an afternoon of joyful competition begins.
                </p>
              </div>

              <p>
                Sogot is more than a game of physical hand-eye coordination; it is a celebration of
                camaraderie, voice, courage, and agile defense. Children form teams, cheer their
                champions, and learn sportsmanship under the warm savannah sun.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800">
                  <span className="text-amber-400 font-bold block text-xs uppercase mb-1">
                    The Trench (Kan / Dhol)
                  </span>
                  <span className="text-xs text-stone-400">
                    A small oblong hole dug in the dirt to balance the short stick across.
                  </span>
                </div>
                <div className="bg-stone-950/60 rounded-xl p-3 border border-stone-800">
                  <span className="text-emerald-400 font-bold block text-xs uppercase mb-1">
                    The Two Sticks
                  </span>
                  <span className="text-xs text-stone-400">
                    One short stick (~20cm, projectile) and one long stick (~75cm, bat/lever).
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'rules' && (
            <div className="space-y-4">
              <h3 className="font-display font-bold text-lg text-amber-400">
                The 3 Traditional Stages of Sogot
              </h3>

              {/* Stage A */}
              <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950/50">
                <span className="bg-amber-500/20 text-amber-400 font-bold text-xs px-2.5 py-1 rounded-md uppercase">
                  Stage A — The Lift (Flick)
                </span>
                <p className="mt-2 text-xs md:text-sm text-stone-300">
                  The short stick is placed horizontally across the excavated trench. The striker
                  inserts the tip of the long stick beneath it and levers it upward with a quick flick,
                  popping the short stick into the air.
                </p>
              </div>

              {/* Stage B */}
              <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950/50">
                <span className="bg-red-500/20 text-red-400 font-bold text-xs px-2.5 py-1 rounded-md uppercase">
                  Stage B — The Sogot Strike
                </span>
                <p className="mt-2 text-xs md:text-sm text-stone-300">
                  Right after the sacred call-and-response ritual, as the short stick hangs at its
                  apex, the striker swings the long stick to strike it mid-air, launching it as far down
                  the field as possible!
                </p>
              </div>

              {/* Stage C */}
              <div className="border border-stone-800 rounded-2xl p-4 bg-stone-950/50">
                <span className="bg-emerald-500/20 text-emerald-400 font-bold text-xs px-2.5 py-1 rounded-md uppercase">
                  Stage C — Opponent Challenge & Defense
                </span>
                <p className="mt-2 text-xs md:text-sm text-stone-300">
                  Opponents spread across the fairway attempt to catch the flying stick. If caught in
                  the air, the striker is immediately eliminated and must pass the bat! If it lands on
                  the ground uncaught, the striker carries forward!
                </p>
              </div>

              {/* The 3 Strikes & "Kuoc" (Carry the Player) Rule */}
              <div className="border-2 border-amber-500/60 rounded-2xl p-4 bg-gradient-to-r from-amber-950/50 to-stone-950">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🏇</span>
                  <span className="text-amber-400 font-bold text-xs uppercase tracking-wider">
                    The 3-Strike Rule & "Kuoc" (Carrying the Player)
                  </span>
                </div>
                <p className="mt-2 text-xs md:text-sm text-stone-200">
                  If the stick is <strong>not caught</strong>, the striker has the right to continue hitting
                  the stick <strong>up to 3 times</strong>! If the striker completes all 3 strikes uncaught,
                  custom decrees the hilarious <strong>"Kuoc"</strong> penalty: the opposing fielder must
                  physically carry the striker on their back all the way from the field back to the launcher
                  ring to the cheers of all the village youth!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'call_response' && (
            <div className="space-y-4">
              <div className="bg-gradient-to-r from-amber-950/40 to-stone-900 border border-amber-600/30 rounded-2xl p-5">
                <h3 className="font-display font-black text-xl text-amber-400 mb-2">
                  The Signature Voice Ritual
                </h3>
                <p className="text-sm">
                  The call-and-response is the lifeblood of authentic Sogot. Before the wooden bat
                  meets the stick, the field falls silent, then erupts:
                </p>

                <div className="my-4 space-y-2">
                  <div className="flex items-center gap-3 bg-stone-950/80 p-3 rounded-xl border border-amber-500/30">
                    <span className="w-8 h-8 rounded-full bg-amber-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                      1
                    </span>
                    <span className="font-bold text-white text-base">
                      Player 1 shouts: <span className="text-amber-400 font-black">"SOGOT!"</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-950/80 p-3 rounded-xl border border-emerald-500/30">
                    <span className="w-8 h-8 rounded-full bg-emerald-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                      2
                    </span>
                    <span className="font-bold text-white text-base">
                      Opponents roar back:{' '}
                      <span className="text-emerald-400 font-black">"SOGOT! SOGOT!"</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-3 bg-stone-950/80 p-3 rounded-xl border border-red-500/30">
                    <span className="w-8 h-8 rounded-full bg-red-500 text-stone-950 font-bold flex items-center justify-center text-xs">
                      3
                    </span>
                    <span className="font-bold text-white text-base">
                      Countdown ends & the strike is delivered!
                    </span>
                  </div>
                </div>

                <p className="text-xs text-stone-400">
                  In this digital recreation, you can use your real microphone to shout "SOGOT!" or
                  listen to the authentic synthesized vocal calls!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'preservation' && (
            <div className="space-y-4">
              <div className="flex items-start gap-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                <Heart className="w-6 h-6 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Preserving Cultural Memory</h4>
                  <p className="text-xs text-stone-300">
                    Many traditional childhood games across Africa risk being forgotten as digital
                    screens replace dusty outdoor playgrounds. SOGOT 🇸🇸 exists to document, honor, and
                    preserve this cherished heritage for South Sudanese everywhere and share its beauty
                    with the world.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-stone-950/60 p-4 rounded-2xl border border-stone-800">
                <Shield className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-white mb-1">Regional Integrity</h4>
                  <p className="text-xs text-stone-300">
                    While similar stick-flipping games exist around the globe (such as Gilli Danda in
                    India, Lippa in Italy, and Kondi in Southeast Asia), Sogot has its own distinct
                    vernacular, vocal call-and-response, scoring traditions, and field ethos. We keep its
                    name and South Sudanese soul front and center.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-black px-6 py-2 rounded-xl text-sm shadow-md cursor-pointer transition-all"
          >
            Ready to Play
          </button>
        </div>
      </div>
    </div>
  );
};
