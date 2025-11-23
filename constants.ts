import { Player, Position, LeagueTeam } from './types';

export const INITIAL_ROSTER: Player[] = [
  { id: '1', name: 'Ignacio', number: 1, position: Position.COACH, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '2', name: 'Juanpe', number: 14, position: Position.GK, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '3', name: 'Luengo', number: 23, position: Position.DEF, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '4', name: 'Hugo', number: 19, position: Position.DEF, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '5', name: 'Mayor', number: 92, position: Position.DEF, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '6', name: 'Mateo', number: 9, position: Position.DEF, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '7', name: 'Manu', number: 17, position: Position.DEF, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '8', name: 'Vici', number: 4, position: Position.DEF, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '9', name: 'Paradela', number: 3, position: Position.DEF, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '10', name: 'Guilleto', number: 51, position: Position.MID, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '11', name: 'Jorpa', number: 74, position: Position.MID, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '12', name: 'Rentero', number: 22, position: Position.MID, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '13', name: 'Guille', number: 10, position: Position.MID, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '14', name: 'Garmendia', number: 18, position: Position.MID, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '15', name: 'Frabian Menor', number: 7, position: Position.MID, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '16', name: 'Guerre', number: 8, position: Position.MID, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '17', name: 'Daniel', number: 15, position: Position.FWD, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
  { id: '18', name: 'Pons', number: 44, position: Position.FWD, matchesPlayed: 0, goals: 0, assists: 0, cleanSheets: 0, totalPoints: 0, averageRating: 0, form: [] },
];

export const OPPONENTS = [
  "Thunder FC", "Real Vibe", "Atletico Coding", "Dynamo Data", "Sporting Server", "Inter Interface", "Rapid React"
];

export const INITIAL_LEAGUE: LeagueTeam[] = [
  { name: "My Team", played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 },
  ...OPPONENTS.map(name => ({ name, played: 0, won: 0, drawn: 0, lost: 0, gf: 0, ga: 0, points: 0 }))
];