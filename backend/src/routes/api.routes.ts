import { Router, Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getDatabase } from '../adapters/db.js';

const router = Router();

// GET /api/all-data - Fetches all user data in a single request
router.get('/all-data', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const db = getDatabase();
    const [teamConfig, leagues, matches, customPlayers, playerEdits, userDetails] = await Promise.all([
      db.getTeamConfig(userId),
      db.getLeagues(userId),
      db.getMatches(userId),
      db.getCustomPlayers(userId),
      db.getPlayerEdits(userId),
      db.getUserById(userId)
    ]);

    return res.status(200).json({
      teamConfig: teamConfig || { name: 'My Team', primaryColor: '#4f46e5', secondaryColor: '#10b981' },
      leagues,
      matches,
      customPlayers,
      playerEdits,
      linkedPlayerId: userDetails?.playerId || null
    });
  } catch (error) {
    console.error('Error fetching all data:', error);
    return res.status(500).json({ message: 'Error retrieving user data' });
  }
});

// POST /api/users/link-player - Link user account to a player profile card
router.post('/users/link-player', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { playerId } = req.body;
    const db = getDatabase();
    await db.linkUserToPlayerCard(userId, playerId);
    return res.status(200).json({ message: 'Successfully linked user to player card', playerId });
  } catch (error) {
    console.error('Error linking user to player card:', error);
    return res.status(500).json({ message: 'Error linking user to player card' });
  }
});


function sanitizeString(val: any): string {
  if (typeof val !== 'string') return '';
  return val.trim().replace(/<[^>]*>/g, '');
}

// POST /api/team-config
function validateTeamConfig(config: any): string | null {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return 'Team configuration must be an object';
  }
  if (!config.name || typeof config.name !== 'string' || config.name.trim() === '') {
    return 'Team name is required';
  }
  config.name = sanitizeString(config.name);
  if (config.name === '') {
    return 'Team name must contain valid characters';
  }
  if (config.name.length > 50) {
    return 'Team name must be 50 characters or less';
  }
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!config.primaryColor || typeof config.primaryColor !== 'string' || !hexColorRegex.test(config.primaryColor)) {
    return 'Primary color must be a valid 6-character hex code (e.g. #4f46e5)';
  }
  if (!config.secondaryColor || typeof config.secondaryColor !== 'string' || !hexColorRegex.test(config.secondaryColor)) {
    return 'Secondary color must be a valid 6-character hex code (e.g. #10b981)';
  }
  return null;
}

router.post('/team-config', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const err = validateTeamConfig(req.body);
    if (err) {
      return res.status(400).json({ message: err });
    }

    const db = getDatabase();
    await db.saveTeamConfig(userId, req.body);
    return res.status(200).json({ message: 'Team configuration saved successfully' });
  } catch (error) {
    console.error('Error saving team config:', error);
    return res.status(500).json({ message: 'Error saving team configuration' });
  }
});

// POST /api/leagues
function validateLeagues(leagues: any): string | null {
  if (!Array.isArray(leagues)) {
    return 'Leagues must be an array';
  }
  if (leagues.length === 0) {
    return 'At least one league is required';
  }
  for (let i = 0; i < leagues.length; i++) {
    const league = leagues[i];
    if (!league.id || typeof league.id !== 'string') {
      return `League at index ${i} is missing a valid ID`;
    }
    if (!league.name || typeof league.name !== 'string' || league.name.trim() === '') {
      return `League at index ${i} is missing a name`;
    }
    league.name = sanitizeString(league.name);
    if (league.name === '') {
      return `League name at index ${i} must contain valid characters`;
    }
    if (league.name.length > 50) {
      return `League name at index ${i} must be 50 characters or less`;
    }
    if (!league.year || typeof league.year !== 'string' || !/^\d{4}$/.test(league.year)) {
      return `League at index ${i} has an invalid 4-digit year`;
    }
    const yearNum = parseInt(league.year);
    if (yearNum < 1900 || yearNum > 2100) {
      return `League at index ${i} must have a year between 1900 and 2100`;
    }
    if (!Array.isArray(league.teams)) {
      return `League "${league.name}" is missing a valid teams array`;
    }

    const teamNamesSeen = new Set<string>();
    for (let j = 0; j < league.teams.length; j++) {
      const team = league.teams[j];
      if (!team.id || typeof team.id !== 'string') {
        return `Team at index ${j} in league "${league.name}" is missing a valid ID`;
      }
      if (!team.name || typeof team.name !== 'string' || team.name.trim() === '') {
        return `Team at index ${j} in league "${league.name}" is missing a name`;
      }
      team.name = sanitizeString(team.name);
      if (team.name === '') {
        return `Team name at index ${j} in league "${league.name}" must contain valid characters`;
      }
      if (team.name.length > 50) {
        return `Team name "${team.name}" in league "${league.name}" must be 50 characters or less`;
      }
      const normName = team.name.trim().toLowerCase();
      if (teamNamesSeen.has(normName)) {
        return `Rival team "${team.name}" is duplicated in league "${league.name}"`;
      }
      teamNamesSeen.add(normName);
    }
  }
  return null;
}

router.post('/leagues', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const err = validateLeagues(req.body);
    if (err) {
      return res.status(400).json({ message: err });
    }

    const db = getDatabase();
    await db.saveLeagues(userId, req.body);
    return res.status(200).json({ message: 'Leagues saved successfully' });
  } catch (error) {
    console.error('Error saving leagues:', error);
    return res.status(500).json({ message: 'Error saving leagues' });
  }
});

function validateMatches(matches: any): string | null {
  if (!Array.isArray(matches)) {
    return 'Matches must be an array';
  }

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    if (!match.opponent || typeof match.opponent !== 'string' || match.opponent.trim() === '') {
      return `Match at index ${i} is missing a valid opponent name`;
    }
    match.opponent = sanitizeString(match.opponent);
    if (match.opponent === '') {
      return `Match opponent name at index ${i} must contain valid characters`;
    }
    if (match.opponent.length > 50) {
      return `Match opponent name at index ${i} must be 50 characters or less`;
    }
    if (!match.date || typeof match.date !== 'string' || match.date.trim() === '') {
      return `Match at index ${i} is missing a valid date`;
    }
    if (isNaN(Date.parse(match.date))) {
      return `Match at index ${i} has an invalid date format`;
    }
    if (typeof match.myScore !== 'number' || !Number.isInteger(match.myScore) || match.myScore < 0 || match.myScore > 99) {
      return `Match at index ${i} has an invalid score for your team (must be an integer 0-99)`;
    }
    if (typeof match.opponentScore !== 'number' || !Number.isInteger(match.opponentScore) || match.opponentScore < 0 || match.opponentScore > 99) {
      return `Match at index ${i} has an invalid opponent score (must be an integer 0-99)`;
    }
    if (!Array.isArray(match.performances) || match.performances.length === 0) {
      return `Match against ${match.opponent} must have at least one player performance record`;
    }

    let totalPlayerGoals = 0;
    let totalPlayerAssists = 0;
    let motmCount = 0;

    for (let j = 0; j < match.performances.length; j++) {
      const perf = match.performances[j];
      if (!perf.playerId || typeof perf.playerId !== 'string') {
        return `Performance at index ${j} in match against ${match.opponent} is missing a valid playerId`;
      }
      if (typeof perf.minutes !== 'number' || !Number.isInteger(perf.minutes) || perf.minutes <= 0 || perf.minutes > 120) {
        return `Player ${perf.playerId} in match against ${match.opponent} must have minutes between 1 and 120`;
      }
      if (typeof perf.goals !== 'number' || !Number.isInteger(perf.goals) || perf.goals < 0) {
        return `Player ${perf.playerId} in match against ${match.opponent} has invalid goals`;
      }
      if (typeof perf.assists !== 'number' || !Number.isInteger(perf.assists) || perf.assists < 0) {
        return `Player ${perf.playerId} in match against ${match.opponent} has invalid assists`;
      }
      if (typeof perf.rating !== 'number' || perf.rating < 1 || perf.rating > 10) {
        return `Player ${perf.playerId} in match against ${match.opponent} must have a rating between 1 and 10`;
      }
      if (typeof perf.yellowCard !== 'boolean') {
        return `Player ${perf.playerId} in match against ${match.opponent} must have a boolean yellowCard field`;
      }
      if (typeof perf.redCard !== 'boolean') {
        return `Player ${perf.playerId} in match against ${match.opponent} must have a boolean redCard field`;
      }
      if (typeof perf.manOfTheMatch !== 'boolean') {
        return `Player ${perf.playerId} in match against ${match.opponent} must have a boolean manOfTheMatch field`;
      }

      totalPlayerGoals += perf.goals;
      totalPlayerAssists += perf.assists;
      if (perf.manOfTheMatch) {
        motmCount++;
      }
    }

    if (totalPlayerGoals > match.myScore) {
      return `Sum of individual player goals (${totalPlayerGoals}) in match against ${match.opponent} cannot exceed your team's score (${match.myScore})`;
    }
    if (totalPlayerAssists > match.myScore) {
      return `Sum of individual player assists (${totalPlayerAssists}) in match against ${match.opponent} cannot exceed your team's score (${match.myScore})`;
    }
    if (motmCount > 1) {
      return `Match against ${match.opponent} has more than one Man of the Match selected`;
    }
  }

  return null;
}

// POST /api/matches
router.post('/matches', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const validationError = validateMatches(req.body);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const db = getDatabase();
    await db.saveMatches(userId, req.body);
    return res.status(200).json({ message: 'Matches saved successfully' });
  } catch (error) {
    console.error('Error saving matches:', error);
    return res.status(500).json({ message: 'Error saving matches' });
  }
});

// POST /api/custom-players
function validateCustomPlayers(players: any): string | null {
  if (!Array.isArray(players)) {
    return 'Players must be an array';
  }
  const validPositions = ['GK', 'DEF', 'MID', 'FWD', 'COACH'];
  for (let i = 0; i < players.length; i++) {
    const p = players[i];
    if (!p.id || typeof p.id !== 'string') {
      return `Player at index ${i} is missing a valid ID`;
    }
    if (!p.name || typeof p.name !== 'string' || p.name.trim() === '') {
      return `Player at index ${i} is missing a name`;
    }
    p.name = sanitizeString(p.name);
    if (p.name === '') {
      return `Player at index ${i} name must contain valid characters`;
    }
    if (p.name.length > 50) {
      return `Player name at index ${i} must be 50 characters or less`;
    }
    if (typeof p.number !== 'number' || !Number.isInteger(p.number) || p.number < 1 || p.number > 99) {
      return `Player "${p.name}" must have an integer shirt number between 1 and 99`;
    }
    if (typeof p.position !== 'string' || !validPositions.includes(p.position)) {
      return `Player "${p.name}" has an invalid position (must be GK, DEF, MID, FWD, or COACH)`;
    }
    if (typeof p.matchesPlayed !== 'number' || !Number.isInteger(p.matchesPlayed) || p.matchesPlayed < 0) {
      return `Player "${p.name}" has invalid matches played count`;
    }
    if (typeof p.goals !== 'number' || !Number.isInteger(p.goals) || p.goals < 0) {
      return `Player "${p.name}" has invalid goals count`;
    }
    if (typeof p.assists !== 'number' || !Number.isInteger(p.assists) || p.assists < 0) {
      return `Player "${p.name}" has invalid assists count`;
    }
  }
  return null;
}

router.post('/custom-players', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const err = validateCustomPlayers(req.body);
    if (err) {
      return res.status(400).json({ message: err });
    }

    const db = getDatabase();
    await db.saveCustomPlayers(userId, req.body);
    return res.status(200).json({ message: 'Custom players saved successfully' });
  } catch (error) {
    console.error('Error saving custom players:', error);
    return res.status(500).json({ message: 'Error saving custom players' });
  }
});

// POST /api/player-edits
function validatePlayerEdits(edits: any): string | null {
  if (!edits || typeof edits !== 'object' || Array.isArray(edits)) {
    return 'Player edits must be an object';
  }
  const validPositions = ['GK', 'DEF', 'MID', 'FWD', 'COACH'];
  for (const playerId in edits) {
    if (Object.prototype.hasOwnProperty.call(edits, playerId)) {
      const edit = edits[playerId];
      if (!edit || typeof edit !== 'object') {
        return `Edit entry for player ID ${playerId} is invalid`;
      }
      if (edit.name !== undefined) {
        if (typeof edit.name !== 'string' || edit.name.trim() === '') {
          return `Edited name for player ID ${playerId} cannot be empty`;
        }
        edit.name = sanitizeString(edit.name);
        if (edit.name === '') {
          return `Edited name for player ID ${playerId} must contain valid characters`;
        }
        if (edit.name.length > 50) {
          return `Edited name for player ID ${playerId} must be 50 characters or less`;
        }
      }
      if (edit.number !== undefined) {
        if (typeof edit.number !== 'number' || !Number.isInteger(edit.number) || edit.number < 1 || edit.number > 99) {
          return `Edited shirt number for player ID ${playerId} must be an integer between 1 and 99`;
        }
      }
      if (edit.position !== undefined) {
        if (typeof edit.position !== 'string' || !validPositions.includes(edit.position)) {
          return `Edited position for player ID ${playerId} is invalid`;
        }
      }
      const offsetFields = ['matchesOffset', 'goalsOffset', 'assistsOffset', 'cleanSheetsOffset', 'pointsOffset'];
      for (const field of offsetFields) {
        if (edit[field] !== undefined) {
          if (typeof edit[field] !== 'number' || !Number.isInteger(edit[field])) {
            return `Offset field ${field} for player ID ${playerId} must be an integer`;
          }
        }
      }
    }
  }
  return null;
}

router.post('/player-edits', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const err = validatePlayerEdits(req.body);
    if (err) {
      return res.status(400).json({ message: err });
    }

    const db = getDatabase();
    await db.savePlayerEdits(userId, req.body);
    return res.status(200).json({ message: 'Player edits saved successfully' });
  } catch (error) {
    console.error('Error saving player edits:', error);
    return res.status(500).json({ message: 'Error saving player edits' });
  }
});

// POST /api/sync-all - Helper to import local data on initial signup/login
router.post('/sync-all', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const { teamConfig, leagues, matches, customPlayers, playerEdits } = req.body;
    const db = getDatabase();

    if (teamConfig) {
      const err = validateTeamConfig(teamConfig);
      if (err) return res.status(400).json({ message: err });
    }
    if (leagues) {
      const err = validateLeagues(leagues);
      if (err) return res.status(400).json({ message: err });
    }
    if (matches) {
      const err = validateMatches(matches);
      if (err) return res.status(400).json({ message: err });
    }
    if (customPlayers) {
      const err = validateCustomPlayers(customPlayers);
      if (err) return res.status(400).json({ message: err });
    }
    if (playerEdits) {
      const err = validatePlayerEdits(playerEdits);
      if (err) return res.status(400).json({ message: err });
    }

    const promises: Promise<void>[] = [];
    if (teamConfig) promises.push(db.saveTeamConfig(userId, teamConfig));
    if (leagues) promises.push(db.saveLeagues(userId, leagues));
    if (matches) promises.push(db.saveMatches(userId, matches));
    if (customPlayers) promises.push(db.saveCustomPlayers(userId, customPlayers));
    if (playerEdits) promises.push(db.savePlayerEdits(userId, playerEdits));

    await Promise.all(promises);
    return res.status(200).json({ message: 'All data synchronized successfully' });
  } catch (error) {
    console.error('Error syncing all data:', error);
    return res.status(500).json({ message: 'Error synchronizing data' });
  }
});

export default router;
