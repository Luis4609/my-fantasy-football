export enum Position {
  GK = 'GK',
  DEF = 'DEF',
  MID = 'MID',
  FWD = 'FWD',
  COACH = 'COACH'
}

export interface Player {
  id: string;
  name: string;
  number: number;
  position: Position;
  matchesPlayed: number;
  goals: number;
  assists: number;
  cleanSheets: number;
  totalPoints: number;
  averageRating: number;
  form: number[];
}

export interface PlayerPerformance {
  playerId: string;
  minutes: number;
  goals: number;
  assists: number;
  yellowCard: boolean;
  redCard: boolean;
  rating: number;
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

export interface TeamConfig {
  name: string;
  primaryColor: string;
  secondaryColor: string;
}
