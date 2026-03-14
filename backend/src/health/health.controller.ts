import { Controller, Get } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Controller('health')
export class HealthController {
  constructor(private readonly db: DatabaseService) {}

  @Get()
  async check() {
    let dbOk = false;
    if (this.db.connected) {
      try {
        await this.db.query('SELECT 1');
        dbOk = true;
      } catch {
        // db error
      }
    }
    return {
      ok: true,
      db: dbOk ? 'connected' : this.db.connected ? 'error' : 'not configured',
    };
  }
}
