
export enum Position {
  GK = 'Portero',
  DEF = 'Defensa',
  MID = 'Medio',
  FWD = 'Delantero',
  COACH = 'Mister'
}

export interface TeamConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  // Stats
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  totalPoints: number;
  averageRating: number;
  form: number[]; // Last 5 ratings
}

export interface PlayerPerformance {
  playerId: string;
  minutes: number;
  goals: number;
  assists: number;
  rating: number; // User input 1-10
  yellowCard: boolean;
  redCard: boolean;
  manOfTheMatch: boolean;
}

export interface MatchRecord {
  id: string;
  date: string;
  opponent: string;
  myScore: number;
  opponentScore: number;
  performances: PlayerPerformance[];
}




