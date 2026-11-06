import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { SogotScene, CameraPreset } from '../three/SogotScene';
import {
  GameMode,
  GameStage,
  Player,
  Team,
  StrikeResult,
  GameSettings,
  TournamentMatch,
} from '../types/game';
import { soundManager } from '../audio/soundManager';
import { TopStatusBar } from './TopStatusBar';
import { ControlDock } from './ControlDock';
import { CallAndResponseOverlay } from './CallAndResponseOverlay';
import { CultureLoreModal } from './CultureLoreModal';
import { SettingsModal } from './SettingsModal';
import { TournamentModal } from './TournamentModal';
import { MatchSummaryModal } from './MatchSummaryModal';
import { ModeSelectModal } from './ModeSelectModal';
import { CarryCelebrationModal } from './CarryCelebrationModal';

export const SogotGame: React.FC = () => {
  const canvasMountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<SogotScene | null>(null);

  // Game Configuration State
  const [gameMode, setGameMode] = useState<GameMode>('practice');
  const [gameStage, setGameStage] = useState<GameStage>('IDLE');
  const [cameraPreset, setCameraPreset] = useState<CameraPreset>('batter_pov');

  // Players & Teams
  const [players, setPlayers] = useState<Player[]>([
    {
      id: 'p1',
      name: 'Deng',
      avatarColor: '#fcdd09',
      avatarIcon: '🇸🇸',
      totalDistance: 0,
      bestDistance: 0,
      attempts: 0,
      catches: 0,
      eliminations: 0,
    },
    {
      id: 'p2',
      name: 'Ajak',
      avatarColor: '#078930',
      avatarIcon: '⚡',
      totalDistance: 0,
      bestDistance: 0,
      attempts: 0,
      catches: 0,
      eliminations: 0,
    },
  ]);
  const [activePlayerIndex, setActivePlayerIndex] = useState<number>(0);
  const [attemptNumber, setAttemptNumber] = useState<number>(1);
  const [strikeHistory, setStrikeHistory] = useState<StrikeResult[]>([]);
  const [streakDistances, setStreakDistances] = useState<number[]>([]);
  const [isLastStrikeCaught, setIsLastStrikeCaught] = useState<boolean>(false);
  const [isCarryCelebrationOpen, setIsCarryCelebrationOpen] = useState<boolean>(false);

  // Real-time Flight Metrics
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [liveFielderNotice, setLiveFielderNotice] = useState<string | null>(null);

  // Settings
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    audioVolume: 0.85,
    ambientSounds: true,
    speechSynthesisEnabled: true,
    micShoutEnabled: false,
    micSensitivity: 6,
    throwbackMechanic: true,
    catchChancePercent: 20,
    cameraTrackingMode: 'dynamic',
    attemptsPerPlayer: 3,
  });

  // Modals
  const [isLoreOpen, setIsLoreOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isTournamentOpen, setIsTournamentOpen] = useState<boolean>(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState<boolean>(false);
  const [isModeSelectOpen, setIsModeSelectOpen] = useState<boolean>(false);

  // Tournament Matches State
  const [tournamentMatches, setTournamentMatches] = useState<TournamentMatch[]>([
    {
      id: 'm1',
      round: 'quarter',
      teamA: 'Juba Bright Stars 🇸🇸',
      teamB: 'Torit Hornbills 🦅',
      scoreA: 142.5,
      scoreB: 118.2,
      winner: 'Juba Bright Stars 🇸🇸',
      completed: true,
    },
    {
      id: 'm2',
      round: 'quarter',
      teamA: 'Malakal Gazelles 🦌',
      teamB: 'Bentiu Oilfields 🛢️',
      scoreA: 135.0,
      scoreB: 98.4,
      winner: 'Malakal Gazelles 🦌',
      completed: true,
    },
    {
      id: 'm3',
      round: 'quarter',
      teamA: 'Wau Leopards 🐆',
      teamB: 'Aweil Champions 🏆',
      scoreA: 0,
      scoreB: 0,
      completed: false,
    },
    {
      id: 'm4',
      round: 'quarter',
      teamA: 'Bor Warriors ⚡',
      teamB: 'Rumbek Kings 👑',
      scoreA: 0,
      scoreB: 0,
      completed: false,
    },
    {
      id: 'm5',
      round: 'semi',
      teamA: 'Juba Bright Stars 🇸🇸',
      teamB: 'Malakal Gazelles 🦌',
      scoreA: 0,
      scoreB: 0,
      completed: false,
    },
    {
      id: 'm6',
      round: 'semi',
      teamA: '',
      teamB: '',
      scoreA: 0,
      scoreB: 0,
      completed: false,
    },
    {
      id: 'm7',
      round: 'final',
      teamA: '',
      teamB: '',
      scoreA: 0,
      scoreB: 0,
      completed: false,
    },
  ]);
  const [currentTournamentIndex, setCurrentTournamentIndex] = useState<number>(2);

  // Active Player
  const activePlayer = players[activePlayerIndex] || players[0];
  const secondPlayer = players[(activePlayerIndex + 1) % players.length] || players[0];

  // Sync Audio Settings
  useEffect(() => {
    soundManager.setVolume(settings.audioVolume);
    soundManager.setMuted(!settings.soundEnabled);
    soundManager.setSpeechEnabled(settings.speechSynthesisEnabled);

    if (settings.ambientSounds && settings.soundEnabled) {
      soundManager.startSavannahAmbience();
    } else {
      soundManager.stopSavannahAmbience();
    }

    return () => {
      soundManager.stopSavannahAmbience();
    };
  }, [settings.audioVolume, settings.soundEnabled, settings.speechSynthesisEnabled, settings.ambientSounds]);

  // Callback refs to keep 3D WebGL scene strictly stable without re-renders
  const handleLandedRef = useRef<(distanceMeters: number, landingPos: THREE.Vector3) => void>(() => {});
  const handleGroundBounceRef = useRef<(strength: number) => void>(() => {});

  // Handle Ground Landing Callback
  const handleLanded = (distanceMeters: number, _landingPos: THREE.Vector3) => {
    soundManager.playDirtThud(1.2);
    setCurrentDistance(distanceMeters);

    // Check Opponent Catch Probability
    const catchThreshold = settings.catchChancePercent;
    const isCaught = Math.random() * 100 < catchThreshold && distanceMeters > 15;

    if (isCaught) {
      soundManager.playCatchOutSound();
      setIsLastStrikeCaught(true);
      setLiveFielderNotice(
        `CAUGHT OUT! Fielder intercepted the stick at ${distanceMeters.toFixed(1)}m! ${activePlayer.name} eliminated on Strike ${attemptNumber} of 3! Bat surrendered to ${secondPlayer.name}!`
      );
      setGameStage('FIELDER_CATCH');
      recordStrike(distanceMeters, true, false);
    } else {
      setIsLastStrikeCaught(false);
      setStreakDistances((prev) => [...prev, distanceMeters]);

      if (distanceMeters > 50) {
        soundManager.playCrowdCheer(distanceMeters > 80);
      }

      if (attemptNumber < 3) {
        setLiveFielderNotice(
          `UNCAUGHT! ${distanceMeters.toFixed(1)}m! ${activePlayer.name} is CARRIED FORWARD to continue hitting (Strike ${attemptNumber + 1} of 3)!`
        );
        if (settings.throwbackMechanic && distanceMeters > 15) {
          setGameStage('THROWBACK');
        } else {
          setGameStage('LANDED');
          recordStrike(distanceMeters, false, false);
        }
      } else {
        const totalStreak = streakDistances.reduce((a, b) => a + b, 0) + distanceMeters;
        setLiveFielderNotice(
          `3 CONSECUTIVE UNCAUGHT STRIKES! ${activePlayer.name} completes the streak (${totalStreak.toFixed(1)}m)! KUOC: ${secondPlayer.name} must carry ${activePlayer.name} on their back! 🇸🇸`
        );
        setGameStage('LANDED');
        recordStrike(distanceMeters, false, false);
      }
    }
  };

  // Handle Ground Bounces
  const handleGroundBounce = (strength: number) => {
    soundManager.playDirtThud(Math.min(1.5, strength * 0.4));
  };

  handleLandedRef.current = handleLanded;
  handleGroundBounceRef.current = handleGroundBounce;

  // Initialize 3D WebGL Canvas Once
  useEffect(() => {
    if (!canvasMountRef.current) return;

    const scene = new SogotScene(canvasMountRef.current, {
      onGroundBounce: (strength) => handleGroundBounceRef.current(strength),
      onLanded: (dist, pos) => handleLandedRef.current(dist, pos),
    });
    sceneRef.current = scene;

    return () => {
      scene.dispose();
      sceneRef.current = null;
    };
  }, []);

  // Live Flight Distance Tracker loop
  useEffect(() => {
    let animId: number;
    const updateDistance = () => {
      if (sceneRef.current && (gameStage === 'FLYING' || gameStage === 'STRIKE_WINDOW')) {
        const d = sceneRef.current.physics.getDistanceMeters();
        setCurrentDistance(d);
      }
      animId = requestAnimationFrame(updateDistance);
    };
    animId = requestAnimationFrame(updateDistance);

    return () => cancelAnimationFrame(animId);
  }, [gameStage]);

  // Record completed strike
  const recordStrike = (dist: number, isCaught: boolean, isDefended: boolean) => {
    const result: StrikeResult = {
      playerId: activePlayer.id,
      distanceMeters: isCaught ? 0 : dist,
      hangTimeSeconds: sceneRef.current?.physics.state.flightTime || 0,
      maxHeightMeters: sceneRef.current?.physics.state.maxHeight || 0,
      isCaught,
      isDefended,
      throwbackLandedInRing: false,
      quality: dist > 80 ? 'legendary' : dist > 50 ? 'great' : dist > 25 ? 'good' : 'poor',
      points: Math.round(isCaught ? 0 : dist),
      timestamp: Date.now(),
    };

    setStrikeHistory((prev) => [result, ...prev]);

    // Update player scores
    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === activePlayerIndex) {
          const effectiveDist = isCaught ? 0 : dist;
          return {
            ...p,
            totalDistance: p.totalDistance + effectiveDist,
            bestDistance: Math.max(p.bestDistance, effectiveDist),
            attempts: p.attempts + 1,
            catches: p.catches + (isCaught ? 1 : 0),
          };
        }
        return p;
      })
    );
  };

  // Action: Step 1 - Trigger Traditional Call and Response
  const handleTriggerCallResponse = () => {
    setGameStage('CALL_RESPONSE');
  };

  // Action: Sequence Complete -> Automatically Lift or ready
  const handleCallSequenceComplete = () => {
    setGameStage('LIFT_AIM');
  };

  // Action: Step 2 - Lift Stick (Stage A)
  const handleLiftStick = (power: number) => {
    if (!sceneRef.current) return;
    soundManager.playLiftSound();
    sceneRef.current.triggerLift(power);
    setGameStage('STRIKE_WINDOW');
    setLiveFielderNotice('Stick is airborne! Time your strike at the peak!');
  };

  // Action: Step 3 - Strike Stick (Stage B)
  const handleStrikeStick = (power: number, azimuth: number, elevation: number) => {
    if (!sceneRef.current) return;

    // Timing calculation: how close is stick to sweet peak height (~1.6m)
    const stickY = sceneRef.current.physics.state.position.y;
    const timingAccuracy = Math.max(0.2, 1.0 - Math.abs(stickY - 1.6) * 0.6);

    soundManager.playWoodHit(power / 70);

    sceneRef.current.triggerStrike({
      powerPercent: power,
      angleAzimuthDeg: azimuth,
      elevationDeg: elevation,
      timingAccuracy,
    });

    setGameStage('FLYING');
    setLiveFielderNotice('SOGOT! Stick soaring down the fairway!');

    // Switch camera to dynamic tracking
    if (cameraPreset === 'batter_pov') {
      sceneRef.current.setCameraPreset('dynamic');
    }
  };

  // Action: Defend launcher hole against Throwback
  const handleDefendHole = () => {
    if (!sceneRef.current) return;
    soundManager.playWoodHit(1.2);
    soundManager.playCrowdCheer(false);
    if (attemptNumber < 3) {
      setLiveFielderNotice(
        `DEFENDED! Long stick deflected the throwback! ${activePlayer.name} carried forward to Strike ${attemptNumber + 1} of 3!`
      );
    } else {
      setLiveFielderNotice(
        `DEFENDED! All 3 strikes survived! Kuoc celebration!`
      );
    }
    setGameStage('LANDED');
    recordStrike(currentDistance, false, true);
  };

  // Action: Next attempt or advance player
  const handleResetHole = () => {
    if (!sceneRef.current) return;
    sceneRef.current.resetStickPositions();
    setCurrentDistance(0);
    setLiveFielderNotice(null);

    // Camera back to batter POV
    sceneRef.current.setCameraPreset('batter_pov');
    setCameraPreset('batter_pov');

    // Case 1: Stick was CAUGHT -> Player is eliminated immediately!
    if (isLastStrikeCaught) {
      if (gameMode === 'practice') {
        setAttemptNumber(1);
        setStreakDistances([]);
        setIsLastStrikeCaught(false);
        setGameStage('IDLE');
        setLiveFielderNotice('Practice reset: Ready for Strike 1 of 3');
      } else {
        const nextPlayerIdx = (activePlayerIndex + 1) % players.length;
        if (nextPlayerIdx === 0 && strikeHistory.length >= players.length) {
          setGameStage('MATCH_OVER');
          setIsSummaryOpen(true);
        } else {
          setActivePlayerIndex(nextPlayerIdx);
          setAttemptNumber(1);
          setStreakDistances([]);
          setIsLastStrikeCaught(false);
          setGameStage('IDLE');
          setLiveFielderNotice(`Bat surrendered to ${players[nextPlayerIdx].name}! Ready for Strike 1 of 3.`);
        }
      }
      return;
    }

    // Case 2: Stick was NOT CAUGHT -> Player is CARRIED FORWARD to hit up to 3 times!
    if (attemptNumber < 3) {
      setAttemptNumber((prev) => prev + 1);
      setGameStage('IDLE');
      setLiveFielderNotice(`${activePlayer.name} carried forward! Strike ${attemptNumber + 1} of 3. Call "SOGOT!" and launch!`);
    } else {
      // Completed all 3 strikes uncaught! Trigger "Kuoc" (Carry the Player) ceremony!
      setIsCarryCelebrationOpen(true);
    }
  };

  // Action: Callback after player finishes the 3-strike Carry Celebration
  const handleContinueAfterCarry = () => {
    setIsCarryCelebrationOpen(false);
    if (gameMode === 'practice') {
      setAttemptNumber(1);
      setStreakDistances([]);
      setGameStage('IDLE');
      setLiveFielderNotice('Practice reset: Ready for next 3-strike round');
    } else {
      const nextPlayerIdx = (activePlayerIndex + 1) % players.length;
      if (nextPlayerIdx === 0 && strikeHistory.length >= players.length) {
        setGameStage('MATCH_OVER');
        setIsSummaryOpen(true);
      } else {
        setActivePlayerIndex(nextPlayerIdx);
        setAttemptNumber(1);
        setStreakDistances([]);
        setIsLastStrikeCaught(false);
        setGameStage('IDLE');
        setLiveFielderNotice(`Bat passed to ${players[nextPlayerIdx].name}! Ready for Strike 1 of 3.`);
      }
    }
  };

  // Action: Camera Mode change
  const handleCameraChange = (preset: CameraPreset) => {
    setCameraPreset(preset);
    if (sceneRef.current) {
      sceneRef.current.setCameraPreset(preset);
    }
  };

  // Action: Mode select setup
  const handleStartGame = (mode: GameMode, newPlayers: Player[]) => {
    setGameMode(mode);
    setPlayers(newPlayers);
    setActivePlayerIndex(0);
    setAttemptNumber(1);
    setStreakDistances([]);
    setIsLastStrikeCaught(false);
    setStrikeHistory([]);
    setCurrentDistance(0);
    setGameStage('IDLE');
    setIsModeSelectOpen(false);

    if (sceneRef.current) {
      sceneRef.current.resetStickPositions();
      sceneRef.current.setCameraPreset('batter_pov');
    }
  };

  const handleStartTournamentMatch = (matchId: string) => {
    setIsTournamentOpen(false);
    setGameStage('IDLE');
    setAttemptNumber(1);
    if (sceneRef.current) {
      sceneRef.current.resetStickPositions();
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-stone-950 font-sans select-none">
      {/* 3D WebGL Canvas Container */}
      <div ref={canvasMountRef} className="absolute inset-0 w-full h-full" />

      {/* Top Status Bar */}
      <TopStatusBar
        gameMode={gameMode}
        activePlayer={activePlayer}
        currentDistance={currentDistance}
        bestDistance={activePlayer.bestDistance}
        attemptNumber={attemptNumber}
        maxAttempts={settings.attemptsPerPlayer}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => setSettings((s) => ({ ...s, soundEnabled: !s.soundEnabled }))}
        onOpenLore={() => setIsLoreOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenTournament={() => setIsTournamentOpen(true)}
        onResetGame={() => setIsModeSelectOpen(true)}
      />

      {/* Live Fielder / Announcer Notice Pill */}
      {liveFielderNotice && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-20 pointer-events-none animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-stone-950/90 border border-amber-500/50 rounded-2xl px-5 py-2 shadow-xl backdrop-blur-md text-center">
            <span className="text-amber-400 font-bold text-xs md:text-sm">
              {liveFielderNotice}
            </span>
          </div>
        </div>
      )}

      {/* Signature SOGOT Call-and-Response Overlay */}
      {gameStage === 'CALL_RESPONSE' && (
        <CallAndResponseOverlay
          player1Name={activePlayer.name}
          player2Name={secondPlayer.name}
          isAiOpponent={gameMode === 'practice'}
          onSequenceComplete={handleCallSequenceComplete}
          onStrikeTriggered={() => handleStrikeStick(75, 0, 32)}
        />
      )}

      {/* Ergonomic Collapsible Bottom Control Dock */}
      <ControlDock
        gameStage={gameStage}
        cameraPreset={cameraPreset}
        strikeNumber={attemptNumber}
        maxStrikes={3}
        isCaught={isLastStrikeCaught}
        nextPlayerName={secondPlayer.name}
        onCameraChange={handleCameraChange}
        onLiftStick={handleLiftStick}
        onStrikeStick={handleStrikeStick}
        onDefendHole={handleDefendHole}
        onResetHole={handleResetHole}
        onTriggerCallResponse={handleTriggerCallResponse}
      />

      {/* Traditional South Sudanese Carry Celebration Modal */}
      <CarryCelebrationModal
        isOpen={isCarryCelebrationOpen}
        player={activePlayer}
        opponentName={secondPlayer.name}
        threeStrikeTotalMeters={streakDistances.reduce((a, b) => a + b, 0)}
        strikeDistances={streakDistances}
        onContinue={handleContinueAfterCarry}
      />

      {/* Modals */}
      <CultureLoreModal isOpen={isLoreOpen} onClose={() => setIsLoreOpen(false)} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newS) => setSettings((s) => ({ ...s, ...newS }))}
      />

      <TournamentModal
        isOpen={isTournamentOpen}
        onClose={() => setIsTournamentOpen(false)}
        matches={tournamentMatches}
        currentMatchIndex={currentTournamentIndex}
        onStartTournamentMatch={handleStartTournamentMatch}
      />

      <MatchSummaryModal
        isOpen={isSummaryOpen}
        gameMode={gameMode}
        players={players}
        strikeHistory={strikeHistory}
        onPlayAgain={() => {
          setIsSummaryOpen(false);
          handleStartGame(gameMode, players);
        }}
        onChangeMode={() => {
          setIsSummaryOpen(false);
          setIsModeSelectOpen(true);
        }}
      />

      <ModeSelectModal
        isOpen={isModeSelectOpen}
        onStartGame={handleStartGame}
        onOpenLore={() => {
          setIsModeSelectOpen(false);
          setIsLoreOpen(true);
        }}
      />
    </div>
  );
};
