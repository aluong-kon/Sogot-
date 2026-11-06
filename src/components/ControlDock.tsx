import React, { useState, useEffect, useRef } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Camera,
  Compass,
  Zap,
  RotateCcw,
  Shield,
  Flame,
  Volume2,
} from 'lucide-react';
import { CameraPreset } from '../three/SogotScene';
import { GameStage } from '../types/game';
import { soundManager } from '../audio/soundManager';

interface ControlDockProps {
  gameStage: GameStage;
  cameraPreset: CameraPreset;
  strikeNumber?: number;
  maxStrikes?: number;
  isCaught?: boolean;
  nextPlayerName?: string;
  onCameraChange: (preset: CameraPreset) => void;
  onLiftStick: (power: number) => void;
  onStrikeStick: (power: number, azimuth: number, elevation: number) => void;
  onDefendHole: () => void;
  onResetHole: () => void;
  onTriggerCallResponse: () => void;
}

export const ControlDock: React.FC<ControlDockProps> = ({
  gameStage,
  cameraPreset,
  strikeNumber = 1,
  maxStrikes = 3,
  isCaught = false,
  nextPlayerName = 'Player 2',
  onCameraChange,
  onLiftStick,
  onStrikeStick,
  onDefendHole,
  onResetHole,
  onTriggerCallResponse,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [azimuthAngle, setAzimuthAngle] = useState<number>(0); // -25 to +25 degrees
  const [elevationAngle, setElevationAngle] = useState<number>(32); // 18 to 45 degrees
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [chargePower, setChargePower] = useState<number>(65);

  const chargeRef = useRef<number>(65);
  const chargeDirectionRef = useRef<number>(1);
  const chargeAnimRef = useRef<number | null>(null);

  // Power charging animation loop
  useEffect(() => {
    if (isCharging) {
      const chargeStep = () => {
        let next = chargeRef.current + chargeDirectionRef.current * 1.8;
        if (next >= 100) {
          next = 100;
          chargeDirectionRef.current = -1;
        } else if (next <= 20) {
          next = 20;
          chargeDirectionRef.current = 1;
        }
        chargeRef.current = next;
        setChargePower(Math.round(next));
        chargeAnimRef.current = requestAnimationFrame(chargeStep);
      };
      chargeAnimRef.current = requestAnimationFrame(chargeStep);
    } else {
      if (chargeAnimRef.current) {
        cancelAnimationFrame(chargeAnimRef.current);
        chargeAnimRef.current = null;
      }
    }

    return () => {
      if (chargeAnimRef.current) {
        cancelAnimationFrame(chargeAnimRef.current);
      }
    };
  }, [isCharging]);

  // Keyboard shortcut listener ('H' to toggle dock, Space for lift/strike)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key.toLowerCase() === 'h') {
        setIsCollapsed((prev) => !prev);
      } else if (e.code === 'Space') {
        e.preventDefault();
        if (gameStage === 'IDLE' || gameStage === 'LIFT_AIM') {
          onLiftStick(chargePower / 100);
        } else if (gameStage === 'STRIKE_WINDOW' && !isCharging) {
          setIsCharging(true);
        } else if (gameStage === 'LANDED') {
          onResetHole();
        }
      } else if (e.key === 'ArrowLeft') {
        setAzimuthAngle((prev) => Math.max(-25, prev - 3));
      } else if (e.key === 'ArrowRight') {
        setAzimuthAngle((prev) => Math.min(25, prev + 3));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space' && gameStage === 'STRIKE_WINDOW' && isCharging) {
        setIsCharging(false);
        onStrikeStick(chargeRef.current, azimuthAngle, elevationAngle);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [
    gameStage,
    isCharging,
    chargePower,
    azimuthAngle,
    elevationAngle,
    onLiftStick,
    onStrikeStick,
    onResetHole,
  ]);

  const handlePointerDown = () => {
    if (gameStage === 'STRIKE_WINDOW') {
      setIsCharging(true);
    }
  };

  const handlePointerUp = () => {
    if (gameStage === 'STRIKE_WINDOW' && isCharging) {
      setIsCharging(false);
      onStrikeStick(chargeRef.current, azimuthAngle, elevationAngle);
    }
  };

  return (
    <div
      className="fixed z-30 transition-transform duration-300 pointer-events-auto"
      style={{
        bottom: '16px',
        left: '50%',
        transform: `translateX(-50%) translateY(${isCollapsed ? 'calc(100% - 36px)' : '0'})`,
        maxWidth: 'min(940px, 95vw)',
        width: '100%',
      }}
    >
      {/* Collapse/Expand Toggle Tab */}
      <div className="flex justify-center mb-1">
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="bg-stone-900/90 hover:bg-stone-800 text-stone-300 hover:text-white px-4 py-1.5 rounded-t-xl text-xs font-semibold border-t border-x border-stone-700/60 shadow-lg flex items-center gap-1.5 cursor-pointer backdrop-blur-md"
        >
          {isCollapsed ? (
            <>
              <ChevronUp className="w-3.5 h-3.5 text-amber-500" />
              <span>Show Controls (H)</span>
            </>
          ) : (
            <>
              <ChevronDown className="w-3.5 h-3.5 text-amber-500" />
              <span>Zen / Cinema View (H)</span>
            </>
          )}
        </button>
      </div>

      {/* Main Glassmorphic Dock Container */}
      <div className="bg-stone-950/95 border border-amber-900/40 rounded-2xl shadow-2xl p-4 backdrop-blur-xl text-stone-100 flex flex-col gap-3">
        {/* Top Control Bar: Action Buttons & Power Meter */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Main Action Trigger */}
          <div className="md:col-span-5 flex items-center gap-2">
            {gameStage === 'IDLE' && (
              <button
                onClick={() => onTriggerCallResponse()}
                className="w-full bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 active:scale-98 text-stone-950 font-black py-3 px-4 rounded-xl shadow-lg border border-amber-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Volume2 className="w-5 h-5 text-stone-950" />
                <span className="text-sm md:text-base">1. Call "SOGOT!" (Start)</span>
              </button>
            )}

            {gameStage === 'LIFT_AIM' && (
              <button
                onClick={() => onLiftStick(chargePower / 100)}
                className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 active:scale-98 text-stone-950 font-black py-3 px-4 rounded-xl shadow-lg border border-emerald-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Zap className="w-5 h-5 text-stone-950" />
                <span className="text-sm md:text-base">2. Flick & Lift Stick (Stage A)</span>
              </button>
            )}

            {gameStage === 'STRIKE_WINDOW' && (
              <button
                onPointerDown={handlePointerDown}
                onPointerUp={handlePointerUp}
                className="w-full bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 active:scale-98 text-white font-black py-3 px-4 rounded-xl shadow-xl border border-red-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Flame className="w-5 h-5" />
                <span className="text-sm md:text-base">
                  {isCharging ? 'Release to Strike!' : 'Hold / Tap to Strike! (Stage B)'}
                </span>
              </button>
            )}

            {gameStage === 'THROWBACK' && (
              <button
                onClick={onDefendHole}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 active:scale-98 text-white font-black py-3 px-4 rounded-xl shadow-xl border border-blue-300 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Shield className="w-5 h-5" />
                <span className="text-sm md:text-base">Defend Launcher Hole!</span>
              </button>
            )}

            {gameStage === 'FIELDER_CATCH' && (
              <button
                onClick={onResetHole}
                className="w-full bg-gradient-to-r from-red-700 to-rose-600 hover:from-red-600 hover:to-rose-500 active:scale-98 text-white font-bold py-3 px-4 rounded-xl shadow-lg border border-red-400 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <RotateCcw className="w-5 h-5" />
                <span className="text-sm md:text-base">Caught Out! Pass Bat to {nextPlayerName} (Space)</span>
              </button>
            )}

            {(gameStage === 'FLYING' || gameStage === 'LANDED') && (
              <button
                onClick={onResetHole}
                className={`w-full font-bold py-3 px-4 rounded-xl shadow-lg border flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 ${
                  strikeNumber < maxStrikes
                    ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 border-amber-300 font-black'
                    : 'bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white border-emerald-300 font-black'
                }`}
              >
                {strikeNumber < maxStrikes ? (
                  <>
                    <Zap className="w-5 h-5 text-stone-950" />
                    <span className="text-sm md:text-base">
                      Carry Forward ➔ Strike #{strikeNumber + 1} of {maxStrikes} (Space)
                    </span>
                  </>
                ) : (
                  <>
                    <RotateCcw className="w-5 h-5" />
                    <span className="text-sm md:text-base">
                      3 Strikes Uncaught! Celebrate & Carry Champion (Space)
                    </span>
                  </>
                )}
              </button>
            )}
          </div>

          {/* Dynamic Strike Power Meter */}
          <div className="md:col-span-4 flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-400 font-medium flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Power Meter
              </span>
              <span className="font-bold text-amber-400">{chargePower}%</span>
            </div>
            <div className="w-full h-3.5 bg-stone-900 rounded-full overflow-hidden p-0.5 border border-stone-800">
              <div
                className={`h-full rounded-full transition-all duration-75 ${
                  chargePower > 80
                    ? 'bg-gradient-to-r from-amber-500 to-red-500'
                    : 'bg-gradient-to-r from-emerald-500 to-amber-500'
                }`}
                style={{ width: `${chargePower}%` }}
              />
            </div>
          </div>

          {/* Camera View Switcher */}
          <div className="md:col-span-3 flex items-center justify-end gap-1.5">
            <Camera className="w-4 h-4 text-stone-400 mr-1 hidden sm:inline" />
            {(
              [
                { id: 'batter_pov', label: 'Batter' },
                { id: 'dynamic', label: 'Flight' },
                { id: 'top_down', label: 'Field' },
                { id: 'free_orbit', label: 'Inspect' },
              ] as const
            ).map((cam) => (
              <button
                key={cam.id}
                onClick={() => {
                  onCameraChange(cam.id);
                  soundManager.playCountdownBeep(false);
                }}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  cameraPreset === cam.id
                    ? 'bg-amber-500 text-stone-950 font-bold shadow-sm'
                    : 'bg-stone-900 hover:bg-stone-800 text-stone-300'
                }`}
              >
                {cam.label}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Tuning Sub-bar: Aim Direction & Loft Angle */}
        <div className="pt-2 border-t border-stone-800/80 flex flex-wrap items-center justify-between gap-4 text-xs text-stone-300">
          {/* Aim Azimuth */}
          <div className="flex items-center gap-2 min-w-[200px]">
            <Compass className="w-4 h-4 text-amber-500" />
            <span className="font-medium text-stone-400">Aim Direction:</span>
            <input
              type="range"
              min="-25"
              max="25"
              value={azimuthAngle}
              onChange={(e) => setAzimuthAngle(Number(e.target.value))}
              className="accent-amber-500 flex-1 cursor-pointer"
            />
            <span className="font-bold w-12 text-right text-stone-200">
              {azimuthAngle === 0 ? 'Center' : azimuthAngle > 0 ? `+${azimuthAngle}° R` : `${azimuthAngle}° L`}
            </span>
          </div>

          {/* Elevation Loft */}
          <div className="flex items-center gap-2 min-w-[180px]">
            <span className="font-medium text-stone-400">Loft:</span>
            <input
              type="range"
              min="18"
              max="45"
              value={elevationAngle}
              onChange={(e) => setElevationAngle(Number(e.target.value))}
              className="accent-amber-500 flex-1 cursor-pointer"
            />
            <span className="font-bold w-10 text-right text-stone-200">{elevationAngle}°</span>
          </div>

          {/* Quick Help Hint */}
          <div className="text-stone-500 text-xs hidden lg:block">
            Controls: <kbd className="px-1.5 py-0.5 bg-stone-900 rounded text-stone-300 font-mono">Space</kbd> Action
            • <kbd className="px-1.5 py-0.5 bg-stone-900 rounded text-stone-300 font-mono">← / →</kbd> Aim •{' '}
            <kbd className="px-1.5 py-0.5 bg-stone-900 rounded text-stone-300 font-mono">H</kbd> Hide Dock
          </div>
        </div>
      </div>
    </div>
  );
};
