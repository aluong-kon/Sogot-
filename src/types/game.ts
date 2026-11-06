export type GameMode = 'practice' | 'local_2p' | 'teams' | 'tournament';

export type GameStage =
  | 'MENU'
  | 'SETUP'
  | 'IDLE' // Ready at the hole
  | 'LIFT_AIM' // Positioning long stick, charging flick
  | 'CALL_RESPONSE' // SOGOT! -> SOGOT! SOGOT!
  | 'STRIKE_WINDOW' // Stick popped up, timing the strike
  | 'FLYING' // In flight across the dirt field
  | 'FIELDER_CATCH' // Opponent attempting to catch
  | 'THROWBACK' // Opponent throwing stick back at the launcher hole
  | 'LANDED' // Distance calculated, result displayed
  | 'CARRY_CELEBRATION' // 3 uncaught strikes or victorious carry ritual!
  | 'MATCH_OVER';

export type CallStage =
  | 'IDLE'
  | 'P1_CALL' // Player 1 shouts "SOGOT!"
  | 'P2_RESPONSE' // Player 2 shouts "SOGOT! SOGOT!"
  | 'COUNTDOWN' // 3... 2... 1... STRIKE!
  | 'READY_TO_HIT';

export interface Player {
  id: string;
  name: string;
  teamId?: 'A' | 'B';
  avatarColor: string;
  avatarIcon: string;
  totalDistance: number;
  bestDistance: number;
  attempts: number;
  catches: number;
  eliminations: number;
  isAi?: boolean;
}

export interface Team {
  id: 'A' | 'B';
  name: string;
  color: string;
  accentColor: string;
  players: Player[];
  totalDistance: number;
  roundsWon: number;
}

export interface StrikeResult {
  playerId: string;
  distanceMeters: number;
  hangTimeSeconds: number;
  maxHeightMeters: number;
  isCaught: boolean;
  isDefended: boolean;
  throwbackLandedInRing: boolean;
  quality: 'miss' | 'poor' | 'good' | 'great' | 'legendary';
  points: number;
  timestamp: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  audioVolume: number; // 0-1
  ambientSounds: boolean;
  speechSynthesisEnabled: boolean;
  micShoutEnabled: boolean;
  micSensitivity: number; // 1-10
  throwbackMechanic: boolean;
  catchChancePercent: number; // 0-100
  cameraTrackingMode: 'dynamic' | 'top_down' | 'batter_pov' | 'free_orbit';
  attemptsPerPlayer: number;
}

export interface TournamentMatch {
  id: string;
  round: 'quarter' | 'semi' | 'final';
  teamA: string;
  teamB: string;
  scoreA: number;
  scoreB: number;
  winner?: string;
  completed: boolean;
}
