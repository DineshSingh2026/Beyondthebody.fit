import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

const FALLBACK = [
  'I choose to prioritize my mental wellness alongside my physical health.',
  'I am worthy of healing, growth, and unconditional love.',
  'Every day I move beyond limitations and discover my true potential.',
  'My mind and body work in harmony to support my wellbeing.',
  'I embrace the journey of healing with courage and compassion.',
  'I deserve peace, joy, and a life that feels aligned with my soul.',
  'Healing is not linear, and I honor every step of my journey.',
  'I release what no longer serves me and welcome transformation.',
  'My mental health matters and I invest in it every single day.',
  'I am beyond my struggles. I am resilient, strong, and capable.',
];

@Injectable()
export class AffirmationsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<string[]> {
    if (!this.db.connected) return FALLBACK;
    try {
      const r = await this.db.query(
        'SELECT text FROM affirmations ORDER BY sort_order, id',
      );
      return r.rows.map((row) => row.text);
    } catch {
      return FALLBACK;
    }
  }
}
