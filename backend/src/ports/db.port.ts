import { Player, MatchRecord, TeamConfig, League } from './types.js';

// The ID type of the user
export interface UserEntity {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  playerId?: string | null;
}

export interface IDatabasePort {
  // Authentication / User operations
  createUser(email: string, passwordHash: string): Promise<UserEntity>;
  getUserByEmail(email: string): Promise<UserEntity | null>;
  getUserById(id: string): Promise<UserEntity | null>;
  linkUserToPlayerCard(userId: string, playerId: string | null): Promise<void>;

  // Team Config operations
  getTeamConfig(userId: string): Promise<TeamConfig | null>;
  saveTeamConfig(userId: string, config: TeamConfig): Promise<void>;

  // League operations
  getLeagues(userId: string): Promise<League[]>;
  saveLeagues(userId: string, leagues: League[]): Promise<void>;

  // Match History operations
  getMatches(userId: string): Promise<MatchRecord[]>;
  saveMatches(userId: string, matches: MatchRecord[]): Promise<void>;

  // Custom Players operations
  getCustomPlayers(userId: string): Promise<Player[]>;
  saveCustomPlayers(userId: string, players: Player[]): Promise<void>;

  // Player Edits operations
  getPlayerEdits(userId: string): Promise<Record<string, any>>;
  savePlayerEdits(userId: string, edits: Record<string, any>): Promise<void>;
}

