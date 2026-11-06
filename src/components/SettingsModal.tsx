import React from 'react';
import { X, Volume2, Mic, Sliders, Shield, Keyboard } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-stone-100">
        {/* Header */}
        <div className="p-6 border-b border-stone-800 flex items-center justify-between bg-stone-950">
          <div className="flex items-center gap-3">
            <Sliders className="w-6 h-6 text-amber-500" />
            <div>
              <h2 className="font-display font-black text-xl text-stone-100">
                Game Settings & Community Rules
              </h2>
              <p className="text-xs text-stone-400 font-medium">
                Customize Audio, Microphone Shout, and Traditional Rules
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm">
          {/* Section 1: Audio & Speech */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Volume2 className="w-4 h-4" />
              Audio & Vocal Calls
            </h3>

            <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800/80 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-stone-300">Sound Effects & Wood Impact</span>
                <input
                  type="checkbox"
                  checked={settings.soundEnabled}
                  onChange={(e) => onUpdateSettings({ soundEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-stone-300">Synthesized "SOGOT!" Callouts</span>
                <input
                  type="checkbox"
                  checked={settings.speechSynthesisEnabled}
                  onChange={(e) => onUpdateSettings({ speechSynthesisEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-stone-300">Outdoor Savannah Ambience</span>
                <input
                  type="checkbox"
                  checked={settings.ambientSounds}
                  onChange={(e) => onUpdateSettings({ ambientSounds: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="pt-2 border-t border-stone-800 flex items-center gap-3">
                <span className="text-xs text-stone-400 min-w-[70px]">Volume:</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={settings.audioVolume}
                  onChange={(e) => onUpdateSettings({ audioVolume: Number(e.target.value) })}
                  className="accent-amber-500 flex-1 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold w-10 text-right">
                  {Math.round(settings.audioVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 2: Real Microphone Shout Detection */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Mic className="w-4 h-4" />
              Microphone Voice Input
            </h3>

            <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800/80 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-stone-200 block">Shout "SOGOT!" into Mic</span>
                  <span className="text-xs text-stone-400">
                    Use your voice to trigger the call-and-response ritual!
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.micShoutEnabled}
                  onChange={(e) => onUpdateSettings({ micShoutEnabled: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              {settings.micShoutEnabled && (
                <div className="pt-2 border-t border-stone-800 flex items-center gap-3">
                  <span className="text-xs text-stone-400 min-w-[70px]">Sensitivity:</span>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={settings.micSensitivity}
                    onChange={(e) => onUpdateSettings({ micSensitivity: Number(e.target.value) })}
                    className="accent-amber-500 flex-1 cursor-pointer"
                  />
                  <span className="text-xs font-mono font-bold w-10 text-right">
                    {settings.micSensitivity}/10
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Authentic Community Rules */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-amber-400 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Shield className="w-4 h-4" />
              Configurable Community Rules
            </h3>

            <div className="bg-stone-950/70 p-4 rounded-2xl border border-stone-800/80 space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium text-stone-200 block">Opponent Throwback Challenge</span>
                  <span className="text-xs text-stone-400">
                    Fielder throws stick back toward launcher; striker defends the circle.
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={settings.throwbackMechanic}
                  onChange={(e) => onUpdateSettings({ throwbackMechanic: e.target.checked })}
                  className="w-5 h-5 accent-amber-500 rounded cursor-pointer"
                />
              </div>

              <div className="flex justify-between items-center">
                <span className="font-medium text-stone-300">Attempts Per Player:</span>
                <select
                  value={settings.attemptsPerPlayer}
                  onChange={(e) => onUpdateSettings({ attemptsPerPlayer: Number(e.target.value) })}
                  className="bg-stone-900 border border-stone-700 text-stone-200 rounded-lg px-2.5 py-1 text-xs cursor-pointer"
                >
                  <option value={1}>1 Strike</option>
                  <option value={2}>2 Strikes</option>
                  <option value={3}>3 Strikes (Standard)</option>
                  <option value={5}>5 Strikes (Championship)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 pt-2 border-t border-stone-800">
                <span className="text-xs text-stone-400 min-w-[90px]">Catch Probability:</span>
                <input
                  type="range"
                  min="0"
                  max="50"
                  step="5"
                  value={settings.catchChancePercent}
                  onChange={(e) => onUpdateSettings({ catchChancePercent: Number(e.target.value) })}
                  className="accent-amber-500 flex-1 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold w-12 text-right">
                  {settings.catchChancePercent}%
                </span>
              </div>
            </div>
          </div>

          {/* Section 4: Controls Guide */}
          <div className="space-y-3">
            <h3 className="font-display font-bold text-stone-400 flex items-center gap-2 text-sm uppercase tracking-wider">
              <Keyboard className="w-4 h-4" />
              How to Play
            </h3>

            <div className="bg-stone-950/60 p-3 rounded-2xl border border-stone-800 text-xs space-y-1.5 text-stone-300">
              <p>
                • <strong>Spacebar / Tap:</strong> 1. Call Sogot ➔ 2. Flick / Lift ➔ 3. Hold & release to Strike!
              </p>
              <p>
                • <strong>Arrow Keys / Sliders:</strong> Adjust launch direction and loft elevation.
              </p>
              <p>
                • <strong>Key H:</strong> Toggle the bottom control dock for cinematic full-screen view.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-stone-800 bg-stone-950 flex justify-end">
          <button
            onClick={onClose}
            className="bg-amber-600 hover:bg-amber-500 text-stone-950 font-black px-6 py-2 rounded-xl text-sm cursor-pointer transition-all"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};
