import { IDatabasePort } from '../ports/db.port.js';
import { SQLiteDatabaseAdapter } from './sqlite.db.js';

let dbInstance: IDatabasePort;

export async function initializeDatabase(): Promise<IDatabasePort> {
  const dbType = process.env.DB_TYPE || 'sqlite';

  if (dbType === 'sqlite') {
    const dbPath = process.env.SQLITE_DB_PATH || './database.sqlite';
    const adapter = new SQLiteDatabaseAdapter(dbPath);
    await adapter.init();
    dbInstance = adapter;
    console.log(`Database initialized: SQLite (${dbPath})`);
  } else {
    // In the future, we can add PostgreSQL or Supabase adapters here:
    // else if (dbType === 'postgres') { ... }
    throw new Error(`Unsupported database type: ${dbType}`);
  }

  return dbInstance;
}

export function getDatabase(): IDatabasePort {
  if (!dbInstance) {
    throw new Error('Database has not been initialized yet.');
  }
  return dbInstance;
}
