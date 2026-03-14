import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Quote {
  quote_text: string;
  author: string;
}

const FALLBACK: Quote[] = [
  {
    quote_text:
      'You, yourself, as much as anybody in the entire universe, deserve your love and affection.',
    author: 'Buddha',
  },
  {
    quote_text:
      "Mental health is not a destination, but a process. It's about how you drive, not where you're going.",
    author: 'Noam Shpancer',
  },
  {
    quote_text:
      'Recovery is not one and done. It is a lifelong journey that takes place one day, one step at a time.',
    author: 'Unknown',
  },
];

@Injectable()
export class QuotesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Quote[]> {
    if (!this.db.connected) return FALLBACK;
    try {
      const r = await this.db.query(
        'SELECT quote_text, author FROM quotes ORDER BY sort_order, id',
      );
      return r.rows;
    } catch {
      return FALLBACK;
    }
  }
}
