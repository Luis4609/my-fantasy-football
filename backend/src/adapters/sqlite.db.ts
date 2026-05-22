import { open, Database } from 'sqlite';
import sqlite3 from 'sqlite3';
import { IDatabasePort, UserEntity } from '../ports/db.port.js';
import { Player, MatchRecord, TeamConfig, League } from '../ports/types.js';
import crypto from 'crypto';

const INITIAL_ROSTER = [
  { id: '1', name: 'Ignacio', number: 1, position: 'COACH' },
  { id: '2', name: 'Juanpe', number: 14, position: 'GK' },
  { id: '3', name: 'Luengo', number: 23, position: 'DEF' },
  { id: '4', name: 'Hugo', number: 19, position: 'DEF' },
  { id: '5', name: 'Mayor', number: 92, position: 'DEF' },
  { id: '6', name: 'Mateo', number: 9, position: 'DEF' },
  { id: '7', name: 'Manu', number: 17, position: 'DEF' },
  { id: '8', name: 'Vici', number: 4, position: 'DEF' },
  { id: '9', name: 'Paradela', number: 3, position: 'DEF' },
  { id: '10', name: 'Guilleto', number: 51, position: 'MID' },
  { id: '11', name: 'Jorpa', number: 74, position: 'MID' },
  { id: '12', name: 'Rentero', number: 22, position: 'MID' },
  { id: '13', name: 'Guille', number: 10, position: 'MID' },
  { id: '14', name: 'Garmendia', number: 18, position: 'MID' },
  { id: '15', name: 'Frabian Menor', number: 7, position: 'MID' },
  { id: '16', name: 'Guerre', number: 8, position: 'MID' },
  { id: '17', name: 'Daniel', number: 15, position: 'FWD' },
  { id: '18', name: 'Pons', number: 44, position: 'FWD' },
];

export class SQLiteDatabaseAdapter implements IDatabasePort {
  private db: Database | null = null;
  private dbPath: string;

  constructor(dbPath: string = './database.sqlite') {
    this.dbPath = dbPath;
  }

  async init(): Promise<void> {
    this.db = await open({
      filename: this.dbPath,
      driver: sqlite3.Database
    });

    // Enable foreign keys
    await this.db.exec('PRAGMA foreign_keys = ON;');

    // Create tables if they do not exist
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS teams (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        primary_color TEXT NOT NULL,
        secondary_color TEXT NOT NULL,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS players (
        id TEXT PRIMARY KEY,
        team_id TEXT NOT NULL,
        user_id TEXT UNIQUE,
        name TEXT NOT NULL,
        number INTEGER NOT NULL,
        position TEXT NOT NULL,
        is_custom INTEGER DEFAULT 0,
        matches_offset INTEGER DEFAULT 0,
        goals_offset INTEGER DEFAULT 0,
        assists_offset INTEGER DEFAULT 0,
        clean_sheets_offset INTEGER DEFAULT 0,
        points_offset INTEGER DEFAULT 0,
        FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS leagues (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        name TEXT NOT NULL,
        year TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS rival_teams (
        id TEXT PRIMARY KEY,
        league_id TEXT NOT NULL,
        name TEXT NOT NULL,
        FOREIGN KEY(league_id) REFERENCES leagues(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS matches (
        id TEXT PRIMARY KEY,
        league_id TEXT NOT NULL,
        date TEXT NOT NULL,
        opponent TEXT NOT NULL,
        my_score INTEGER NOT NULL,
        opponent_score INTEGER NOT NULL,
        FOREIGN KEY(league_id) REFERENCES leagues(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS player_performances (
        id TEXT PRIMARY KEY,
        match_id TEXT NOT NULL,
        player_id TEXT NOT NULL,
        minutes INTEGER NOT NULL,
        goals INTEGER NOT NULL,
        assists INTEGER NOT NULL,
        yellow_card INTEGER NOT NULL,
        red_card INTEGER NOT NULL,
        rating REAL NOT NULL,
        man_of_the_match INTEGER NOT NULL,
        FOREIGN KEY(match_id) REFERENCES matches(id) ON DELETE CASCADE,
        FOREIGN KEY(player_id) REFERENCES players(id) ON DELETE CASCADE
      );
    `);

    // Self-healing migration for has_custom_roster column
    try {
      await this.db.exec('ALTER TABLE teams ADD COLUMN has_custom_roster INTEGER DEFAULT 0;');
    } catch (err) {
      // Column already exists, ignore
    }
  }

  private getDb(): Database {
    if (!this.db) {
      throw new Error('Database not initialized. Call init() first.');
    }
    return this.db;
  }

  private async ensureUserTeam(userId: string): Promise<string> {
    const db = this.getDb();
    const teamRow = await db.get('SELECT id FROM teams WHERE user_id = ?', userId);
    if (teamRow) {
      return teamRow.id;
    }

    const teamId = crypto.randomUUID();
    await db.run('BEGIN TRANSACTION;');
    try {
      await db.run(
        'INSERT INTO teams (id, user_id, name, primary_color, secondary_color) VALUES (?, ?, ?, ?, ?)',
        teamId,
        userId,
        'My Team',
        '#4f46e5',
        '#10b981'
      );

      for (const p of INITIAL_ROSTER) {
        const dbPlayerId = `${teamId}_${p.id}`;
        await db.run(
          'INSERT INTO players (id, team_id, name, number, position, is_custom) VALUES (?, ?, ?, ?, ?, 0)',
          dbPlayerId,
          teamId,
          p.name,
          p.number,
          p.position
        );
      }
      await db.run('COMMIT;');
    } catch (err) {
      await db.run('ROLLBACK;');
      throw err;
    }
    return teamId;
  }

  // --- Auth / Users ---

  async createUser(email: string, passwordHash: string): Promise<UserEntity> {
    const db = this.getDb();
    const userId = crypto.randomUUID();
    const teamId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    await db.run('BEGIN TRANSACTION;');
    try {
      await db.run(
        'INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)',
        userId,
        email,
        passwordHash,
        createdAt
      );

      // Create default team
      await db.run(
        'INSERT INTO teams (id, user_id, name, primary_color, secondary_color) VALUES (?, ?, ?, ?, ?)',
        teamId,
        userId,
        'My Team',
        '#4f46e5',
        '#10b981'
      );

      // Seed default players roster linked to team
      for (const p of INITIAL_ROSTER) {
        const dbPlayerId = `${teamId}_${p.id}`;
        await db.run(
          'INSERT INTO players (id, team_id, name, number, position, is_custom) VALUES (?, ?, ?, ?, ?, 0)',
          dbPlayerId,
          teamId,
          p.name,
          p.number,
          p.position
        );
      }

      await db.run('COMMIT;');
    } catch (err) {
      await db.run('ROLLBACK;');
      throw err;
    }

    return {
      id: userId,
      email,
      passwordHash,
      createdAt,
      playerId: null
    };
  }

  async getUserByEmail(email: string): Promise<UserEntity | null> {
    const db = this.getDb();
    const row = await db.get('SELECT * FROM users WHERE email = ?', email);
    if (!row) return null;

    // Ensure team and players exist for legacy user
    await this.ensureUserTeam(row.id);

    // Check if there is a linked player
    const playerRow = await db.get('SELECT id FROM players WHERE user_id = ?', row.id);
    const cleanPlayerId = playerRow ? playerRow.id.substring(playerRow.id.indexOf('_') + 1) : null;

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      playerId: cleanPlayerId
    };
  }

  async getUserById(id: string): Promise<UserEntity | null> {
    const db = this.getDb();
    const row = await db.get('SELECT * FROM users WHERE id = ?', id);
    if (!row) return null;

    // Ensure team and players exist for legacy user
    await this.ensureUserTeam(row.id);

    // Check if there is a linked player
    const playerRow = await db.get('SELECT id FROM players WHERE user_id = ?', row.id);
    const cleanPlayerId = playerRow ? playerRow.id.substring(playerRow.id.indexOf('_') + 1) : null;

    return {
      id: row.id,
      email: row.email,
      passwordHash: row.password_hash,
      createdAt: row.created_at,
      playerId: cleanPlayerId
    };
  }

  async linkUserToPlayerCard(userId: string, playerId: string | null): Promise<void> {
    const db = this.getDb();
    const teamId = await this.ensureUserTeam(userId);
    await db.run('BEGIN TRANSACTION;');
    try {
      // Clear existing links
      await db.run('UPDATE players SET user_id = NULL WHERE user_id = ?', userId);

      if (playerId) {
        const dbPlayerId = `${teamId}_${playerId}`;
        await db.run('UPDATE players SET user_id = ? WHERE id = ? AND team_id = ?', userId, dbPlayerId, teamId);
      }
      await db.run('COMMIT;');
    } catch (err) {
      await db.run('ROLLBACK;');
      throw err;
    }
  }

  // --- Team Config ---

  async getTeamConfig(userId: string): Promise<TeamConfig | null> {
    const db = this.getDb();
    const teamId = await this.ensureUserTeam(userId);
    const row = await db.get('SELECT * FROM teams WHERE id = ?', teamId);
    if (!row) return null;
    return {
      name: row.name,
      primaryColor: row.primary_color,
      secondaryColor: row.secondary_color,
      hasCustomRoster: row.has_custom_roster === 1
    };
  }

  async saveTeamConfig(userId: string, config: TeamConfig): Promise<void> {
    const db = this.getDb();
    await this.ensureUserTeam(userId);
    await db.run(
      'UPDATE teams SET name = ?, primary_color = ?, secondary_color = ?, has_custom_roster = ? WHERE user_id = ?',
      config.name,
      config.primaryColor,
      config.secondaryColor,
      config.hasCustomRoster ? 1 : 0,
      userId
    );
  }

  // --- Leagues ---

  async getLeagues(userId: string): Promise<League[]> {
    const db = this.getDb();
    await this.ensureUserTeam(userId); // ensure legacy users have their team
    const leagues = await db.all('SELECT * FROM leagues WHERE user_id = ?', userId);
    const result: League[] = [];

    for (const league of leagues) {
      const teams = await db.all('SELECT * FROM rival_teams WHERE league_id = ?', league.id);
      result.push({
        id: league.id,
        name: league.name,
        year: league.year,
        isActive: league.is_active === 1,
        teams: teams.map(t => ({ id: t.id, name: t.name }))
      });
    }

    return result;
  }

  async saveLeagues(userId: string, leagues: League[]): Promise<void> {
    const db = this.getDb();
    await this.ensureUserTeam(userId);
    await db.run('BEGIN TRANSACTION;');
    try {
      const existingLeagues = await db.all('SELECT id FROM leagues WHERE user_id = ?', userId);
      for (const el of existingLeagues) {
        await db.run('DELETE FROM rival_teams WHERE league_id = ?', el.id);
      }
      await db.run('DELETE FROM leagues WHERE user_id = ?', userId);

      for (const league of leagues) {
        await db.run(
          'INSERT INTO leagues (id, user_id, name, year, is_active) VALUES (?, ?, ?, ?, ?)',
          league.id,
          userId,
          league.name,
          league.year,
          league.isActive ? 1 : 0
        );

        for (const team of league.teams) {
          await db.run(
            'INSERT INTO rival_teams (id, league_id, name) VALUES (?, ?, ?)',
            team.id,
            league.id,
            team.name
          );
        }
      }
      await db.run('COMMIT;');
    } catch (err) {
      await db.run('ROLLBACK;');
      throw err;
    }
  }

  // --- Matches ---

  async getMatches(userId: string): Promise<MatchRecord[]> {
    const db = this.getDb();
    const teamId = await this.ensureUserTeam(userId);

    const matches = await db.all(
      `SELECT m.* FROM matches m 
       JOIN leagues l ON m.league_id = l.id 
       WHERE l.user_id = ?`,
      userId
    );

    const result: MatchRecord[] = [];

    for (const match of matches) {
      const perfs = await db.all('SELECT * FROM player_performances WHERE match_id = ?', match.id);
      result.push({
        id: match.id,
        leagueId: match.league_id,
        date: match.date,
        opponent: match.opponent,
        myScore: match.my_score,
        opponentScore: match.opponent_score,
        performances: perfs.map(p => ({
          playerId: p.player_id.substring(p.player_id.indexOf('_') + 1),
          minutes: p.minutes,
          goals: p.goals,
          assists: p.assists,
          yellowCard: p.yellow_card === 1,
          redCard: p.red_card === 1,
          rating: p.rating,
          manOfTheMatch: p.man_of_the_match === 1
        }))
      });
    }

    return result;
  }

  async saveMatches(userId: string, matches: MatchRecord[]): Promise<void> {
    const db = this.getDb();
    const teamId = await this.ensureUserTeam(userId);

    await db.run('BEGIN TRANSACTION;');
    try {
      const existingMatches = await db.all(
        `SELECT m.id FROM matches m 
         JOIN leagues l ON m.league_id = l.id 
         WHERE l.user_id = ?`,
        userId
      );

      for (const em of existingMatches) {
        await db.run('DELETE FROM player_performances WHERE match_id = ?', em.id);
        await db.run('DELETE FROM matches WHERE id = ?', em.id);
      }

      for (const match of matches) {
        await db.run(
          'INSERT INTO matches (id, league_id, date, opponent, my_score, opponent_score) VALUES (?, ?, ?, ?, ?, ?)',
          match.id,
          match.leagueId,
          match.date,
          match.opponent,
          match.myScore,
          match.opponentScore
        );

        for (const perf of match.performances) {
          const dbPlayerId = `${teamId}_${perf.playerId}`;
          await db.run(
            `INSERT INTO player_performances 
             (id, match_id, player_id, minutes, goals, assists, yellow_card, red_card, rating, man_of_the_match) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            crypto.randomUUID(),
            match.id,
            dbPlayerId,
            perf.minutes,
            perf.goals,
            perf.assists,
            perf.yellowCard ? 1 : 0,
            perf.redCard ? 1 : 0,
            perf.rating,
            perf.manOfTheMatch ? 1 : 0
          );
        }
      }
      await db.run('COMMIT;');
    } catch (err) {
      await db.run('ROLLBACK;');
      throw err;
    }
  }

  // --- Custom Players ---

  async getCustomPlayers(userId: string): Promise<Player[]> {
    const db = this.getDb();
    const teamId = await this.ensureUserTeam(userId);

    const players = await db.all(
      'SELECT * FROM players WHERE team_id = ? AND is_custom = 1',
      teamId
    );

    return players.map(p => ({
      id: p.id.substring(p.id.indexOf('_') + 1),
      name: p.name,
      number: p.number,
      position: p.position as any,
      matchesPlayed: 0,
      goals: 0,
      assists: 0,
      cleanSheets: 0,
      totalPoints: 0,
      averageRating: 0,
      form: []
    }));
  }

  async saveCustomPlayers(userId: string, players: Player[]): Promise<void> {
    const db = this.getDb();
    const teamId = await this.ensureUserTeam(userId);

    await db.run('BEGIN TRANSACTION;');
    try {
      await db.run('DELETE FROM players WHERE team_id = ? AND is_custom = 1', teamId);

      for (const p of players) {
        const dbPlayerId = `${teamId}_${p.id}`;
        await db.run(
          `INSERT INTO players 
           (id, team_id, name, number, position, is_custom, matches_offset, goals_offset, assists_offset, clean_sheets_offset, points_offset) 
           VALUES (?, ?, ?, ?, ?, 1, ?, ?, ?, ?, ?)`,
          dbPlayerId,
          teamId,
          p.name,
          p.number,
          p.position,
          p.matchesPlayed || 0,
          p.goals || 0,
          p.assists || 0,
          p.cleanSheets || 0,
          p.totalPoints || 0
        );
      }
      await db.run('COMMIT;');
    } catch (err) {
      await db.run('ROLLBACK;');
      throw err;
    }
  }

  // --- Player Edits ---

  async getPlayerEdits(userId: string): Promise<Record<string, any>> {
    const db = this.getDb();
    const teamId = await this.ensureUserTeam(userId);

    const players = await db.all('SELECT * FROM players WHERE team_id = ?', teamId);
    const edits: Record<string, any> = {};

    for (const p of players) {
      const cleanId = p.id.substring(p.id.indexOf('_') + 1);
      const defaultPlayer = INITIAL_ROSTER.find(dr => dr.id === cleanId);
      
      const hasOffset = p.matches_offset !== 0 || p.goals_offset !== 0 || p.assists_offset !== 0 || p.clean_sheets_offset !== 0 || p.points_offset !== 0;
      let hasEdit = hasOffset;

      if (defaultPlayer) {
        if (p.name !== defaultPlayer.name || p.number !== defaultPlayer.number || p.position !== defaultPlayer.position) {
          hasEdit = true;
        }
      }

      if (hasEdit) {
        edits[cleanId] = {
          name: p.name,
          number: p.number,
          position: p.position,
          matchesOffset: p.matches_offset,
          goalsOffset: p.goals_offset,
          assistsOffset: p.assists_offset,
          cleanSheetsOffset: p.clean_sheets_offset,
          pointsOffset: p.points_offset
        };
      }
    }

    return edits;
  }

  async savePlayerEdits(userId: string, edits: Record<string, any>): Promise<void> {
    const db = this.getDb();
    const teamId = await this.ensureUserTeam(userId);

    await db.run('BEGIN TRANSACTION;');
    try {
      for (const [playerId, edit] of Object.entries(edits)) {
        const dbPlayerId = `${teamId}_${playerId}`;
        const playerRow = await db.get('SELECT * FROM players WHERE id = ? AND team_id = ?', dbPlayerId, teamId);

        if (playerRow) {
          await db.run(
            `UPDATE players SET 
              name = ?,
              number = ?,
              position = ?,
              matches_offset = ?,
              goals_offset = ?,
              assists_offset = ?,
              clean_sheets_offset = ?,
              points_offset = ?
             WHERE id = ? AND team_id = ?`,
            edit.name !== undefined ? edit.name : playerRow.name,
            edit.number !== undefined ? edit.number : playerRow.number,
            edit.position !== undefined ? edit.position : playerRow.position,
            edit.matchesOffset !== undefined ? edit.matchesOffset : playerRow.matches_offset,
            edit.goalsOffset !== undefined ? edit.goalsOffset : playerRow.goals_offset,
            edit.assistsOffset !== undefined ? edit.assistsOffset : playerRow.assists_offset,
            edit.cleanSheetsOffset !== undefined ? edit.cleanSheetsOffset : playerRow.clean_sheets_offset,
            edit.pointsOffset !== undefined ? edit.pointsOffset : playerRow.points_offset,
            dbPlayerId,
            teamId
          );
        }
      }
      await db.run('COMMIT;');
    } catch (err) {
      await db.run('ROLLBACK;');
      throw err;
    }
  }
}
