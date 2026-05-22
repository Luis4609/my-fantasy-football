import { TeamConfig, League, MatchRecord, Player, PlayerEditState } from '@/types';

type ApiFetch = (endpoint: string, options?: RequestInit) => Promise<any>;

/**
 * Fetches all fantasy league data for the authenticated user.
 */
export const getAllData = async (apiFetch: ApiFetch): Promise<{
  teamConfig: TeamConfig;
  leagues?: League[];
  matches?: MatchRecord[];
  customPlayers?: Player[];
  playerEdits?: Record<string, PlayerEditState>;
  linkedPlayerId?: string | null;
}> => {
  return apiFetch('/all-data');
};

/**
 * Synchronizes all offline/local data to the backend.
 */
export const syncAllData = async (
  apiFetch: ApiFetch,
  data: {
    teamConfig?: TeamConfig;
    leagues?: League[];
    matches?: MatchRecord[];
    customPlayers?: Player[];
    playerEdits?: Record<string, PlayerEditState>;
  }
): Promise<any> => {
  return apiFetch('/sync-all', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

/**
 * Saves the current team configuration to the backend.
 */
export const saveTeamConfig = async (apiFetch: ApiFetch, config: TeamConfig): Promise<any> => {
  return apiFetch('/team-config', {
    method: 'POST',
    body: JSON.stringify(config),
  });
};

/**
 * Saves the match history to the backend.
 */
export const saveMatches = async (apiFetch: ApiFetch, matches: MatchRecord[]): Promise<any> => {
  return apiFetch('/matches', {
    method: 'POST',
    body: JSON.stringify(matches),
  });
};

/**
 * Saves all leagues to the backend.
 */
export const saveLeagues = async (apiFetch: ApiFetch, leagues: League[]): Promise<any> => {
  return apiFetch('/leagues', {
    method: 'POST',
    body: JSON.stringify(leagues),
  });
};

/**
 * Saves player manual stats/info edits to the backend.
 */
export const savePlayerEdits = async (
  apiFetch: ApiFetch,
  playerEdits: Record<string, PlayerEditState>
): Promise<any> => {
  return apiFetch('/player-edits', {
    method: 'POST',
    body: JSON.stringify(playerEdits),
  });
};

/**
 * Saves the list of custom added players to the backend.
 */
export const saveCustomPlayers = async (apiFetch: ApiFetch, customPlayers: Player[]): Promise<any> => {
  return apiFetch('/custom-players', {
    method: 'POST',
    body: JSON.stringify(customPlayers),
  });
};

/**
 * Associates the authenticated user account with a specific player card ID.
 */
export const linkPlayerCard = async (apiFetch: ApiFetch, playerId: string | null): Promise<any> => {
  return apiFetch('/users/link-player', {
    method: 'POST',
    body: JSON.stringify({ playerId }),
  });
};
