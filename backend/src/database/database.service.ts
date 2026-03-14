import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { Pool, QueryResult } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleDestroy {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: Pool | null = null;
  connected = false;

  constructor() {
    const connectionString =
      process.env.DATABASE_URL ||
      (process.env.PGHOST && process.env.PGDATABASE
        ? `postgresql://${process.env.PGUSER || 'postgres'}:${process.env.PGPASSWORD || ''}@${process.env.PGHOST}:${process.env.PGPORT || 5432}/${process.env.PGDATABASE}`
        : null);

    if (connectionString) {
      this.pool = new Pool({
        connectionString,
        ssl:
          process.env.NODE_ENV === 'production'
            ? { rejectUnauthorized: false }
            : false,
      });
      this.connected = true;
      this.logger.log('PostgreSQL: connected');
    } else {
      this.logger.warn(
        'PostgreSQL: not configured (using fallback data). Set DATABASE_URL to use DB.',
      );
    }
  }

  async query(text: string, params?: any[]): Promise<QueryResult> {
    if (!this.pool) throw new Error('DB not configured');
    return this.pool.query(text, params);
  }

  async onModuleDestroy() {
    if (this.pool) await this.pool.end();
  }
}
