import React, { useEffect, useState } from 'react';
import { Volume2, Mic, Sparkles, ChevronRight } from 'lucide-react';
import { soundManager } from '../audio/soundManager';

interface CallAndResponseOverlayProps {
  player1Name: string;
  player2Name: string;
  isAiOpponent?: boolean;
  onSequenceComplete: () => void;
  onStrikeTriggered: () => void;
}

type CallPhase = 'WAITING_P1' | 'P1_CALLED' | 'P2_RESPONDING' | 'COUNTDOWN' | 'STRIKE_WINDOW';

export const CallAndResponseOverlay: React.FC<CallAndResponseOverlayProps> = ({
  player1Name,
  player2Name,
  isAiOpponent = true,
  onSequenceComplete,
  onStrikeTriggered,
}) => {
  const [phase, setPhase] = useState<CallPhase>('WAITING_P1');
  const [countdown, setCountdown] = useState<number>(3);
  const [isMicActive, setIsMicActive] = useState<boolean>(false);
  const [micDetectedShout, setMicDetectedShout] = useState<boolean>(false);

  // Player 1 announces "SOGOT!"
  const triggerPlayer1Call = () => {
    if (phase !== 'WAITING_P1') return;
    setPhase('P1_CALLED');
    soundManager.playCall1(() => {
      // Transition to Player 2 response
      setTimeout(() => {
        triggerPlayer2Response();
      }, 350);
    });
  };

  // Player 2 responds "SOGOT! SOGOT!"
  const triggerPlayer2Response = () => {
    setPhase('P2_RESPONDING');
    soundManager.playCall2(() => {
      // Transition to Countdown
      setPhase('COUNTDOWN');
      setCountdown(3);
    });
  };

  // Countdown timer: 3.. 2.. 1.. STRIKE!
  useEffect(() => {
    if (phase !== 'COUNTDOWN') return;

    soundManager.playCountdownBeep(false);

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          soundManager.playCountdownBeep(true);
          setPhase('STRIKE_WINDOW');
          onSequenceComplete();
          return 0;
        }
        soundManager.playCountdownBeep(false);
        return prev - 1;
      });
    }, 700);

    return () => clearInterval(timer);
  }, [phase, onSequenceComplete]);

  // Handle live mic shouts
  const toggleMicrophone = async () => {
    if (isMicActive) {
      soundManager.stopMicrophoneListener();
      setIsMicActive(false);
    } else {
      const ok = await soundManager.initMicrophoneListener(() => {
        setMicDetectedShout(true);
        setTimeout(() => setMicDetectedShout(false), 800);
        if (phase === 'WAITING_P1') {
          triggerPlayer1Call();
        } else if (phase === 'P1_CALLED' && !isAiOpponent) {
          triggerPlayer2Response();
        } else if (phase === 'STRIKE_WINDOW') {
          onStrikeTriggered();
        }
      });
      setIsMicActive(ok);
    }
  };

  useEffect(() => {
    return () => {
      soundManager.stopMicrophoneListener();
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6 z-20">
      {/* Top Banner / Call Indicator */}
      <div className="flex justify-center pointer-events-auto">
        <div className="bg-stone-900/90 border border-amber-600/40 rounded-2xl px-6 py-3 shadow-2xl flex items-center gap-3 backdrop-blur-md">
          <div className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
          <span className="text-amber-400 font-bold uppercase tracking-wider text-xs md:text-sm">
            Traditional Sogot Call-and-Response
          </span>
          <button
            onClick={toggleMicrophone}
            title={isMicActive ? 'Mic active: Shout "SOGOT!" to trigger' : 'Enable microphone to shout "SOGOT!"'}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold transition-all ${
              isMicActive
                ? 'bg-red-500/30 border border-red-500 text-red-300'
                : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{isMicActive ? 'Mic On (Shout!)' : 'Mic Off'}</span>
          </button>
        </div>
      </div>

      {/* Main Center Speech Bubbles & Sequence Display */}
      <div className="flex flex-col items-center justify-center gap-6 my-auto">
        {/* Step 1: Player 1 "SOGOT!" Call */}
        {(phase === 'WAITING_P1' || phase === 'P1_CALLED') && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative pointer-events-auto">
              <div className="bg-amber-500 text-stone-950 font-black text-3xl md:text-5xl px-8 py-4 rounded-3xl shadow-2xl border-4 border-amber-300 flex items-center gap-3 transform -rotate-1 hover:rotate-0 transition-transform">
                <span>"SOGOT!"</span>
                <Volume2 className="w-8 h-8 text-stone-900" />
              </div>
              {/* Speech bubble tail */}
              <div className="w-6 h-6 bg-amber-500 rotate-45 mx-auto -mt-3 border-r-4 border-b-4 border-amber-300" />
            </div>

            <div className="text-center">
              <p className="text-white text-base md:text-lg font-semibold drop-shadow-md">
                <span className="text-amber-400">{player1Name}</span> initiates the challenge!
              </p>
              {phase === 'WAITING_P1' && (
                <div className="mt-3 pointer-events-auto flex items-center justify-center gap-3">
                  <button
                    onClick={triggerPlayer1Call}
                    className="bg-amber-600 hover:bg-amber-500 active:scale-95 text-stone-950 font-black px-6 py-2.5 rounded-xl shadow-lg border border-amber-400 flex items-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Shout "SOGOT!"</span>
                    <Sparkles className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 2: Player 2 / Field "SOGOT! SOGOT!" Response */}
        {phase === 'P2_RESPONDING' && (
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in-95 duration-300">
            <div className="relative">
              <div className="bg-emerald-500 text-stone-950 font-black text-3xl md:text-5xl px-8 py-4 rounded-3xl shadow-2xl border-4 border-emerald-300 flex items-center gap-3 transform rotate-1">
                <span>"SOGOT! SOGOT!"</span>
                <Volume2 className="w-8 h-8 text-stone-900" />
              </div>
              <div className="w-6 h-6 bg-emerald-500 rotate-45 mx-auto -mt-3 border-r-4 border-b-4 border-emerald-300" />
            </div>

            <p className="text-white text-base md:text-lg font-semibold drop-shadow-md text-center">
              <span className="text-emerald-400">{player2Name}</span> and the field accept the call!
            </p>
          </div>
        )}

        {/* Step 3: Countdown 3.. 2.. 1.. */}
        {phase === 'COUNTDOWN' && (
          <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-90 duration-200">
            <div className="w-24 h-24 rounded-full bg-stone-950/80 border-4 border-amber-500 flex items-center justify-center shadow-2xl backdrop-blur-md">
              <span className="text-amber-400 font-black text-5xl font-display">{countdown}</span>
            </div>
            <p className="text-stone-200 font-bold uppercase tracking-wider text-sm">
              Prepare to Strike!
            </p>
          </div>
        )}

        {/* Step 4: Strike Window Active */}
        {phase === 'STRIKE_WINDOW' && (
          <div className="flex flex-col items-center gap-2 animate-in fade-in zoom-in-90 duration-150">
            <div className="bg-red-600 text-white font-black text-3xl md:text-5xl px-8 py-3 rounded-2xl shadow-2xl border-2 border-red-400 flex items-center gap-2 animate-bounce">
              <span>STRIKE NOW!</span>
            </div>
            <p className="text-amber-300 font-bold text-sm bg-black/60 px-4 py-1 rounded-full">
              Release power / Tap Hit to launch the stick!
            </p>
          </div>
        )}

        {micDetectedShout && (
          <div className="bg-green-600/90 text-white font-bold px-4 py-1.5 rounded-full text-xs shadow-md">
            Mic Audio Triggered!
          </div>
        )}
      </div>

      {/* Skip / Fast Forward Option */}
      <div className="flex justify-end pointer-events-auto">
        {phase !== 'STRIKE_WINDOW' && (
          <button
            onClick={() => {
              soundManager.playCall1();
              soundManager.playCall2();
              setPhase('STRIKE_WINDOW');
              onSequenceComplete();
            }}
            className="bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-white px-4 py-2 rounded-xl text-xs font-semibold border border-stone-700/60 backdrop-blur-sm flex items-center gap-1.5 cursor-pointer transition-all"
          >
            <span>Skip Ritual</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};
