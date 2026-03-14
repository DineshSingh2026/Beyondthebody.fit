import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface WellnessService {
  title: string;
  icon: string;
  badge: string | null;
  is_featured: boolean;
  items: string[];
}

const FALLBACK: WellnessService[] = [
  {
    title: 'Licensed Therapists',
    icon: '🪪',
    badge: null,
    is_featured: false,
    items: ['Anxiety & Depression', 'Relationship Counseling', 'Life Transitions'],
  },
  {
    title: 'Specialized Experts',
    icon: '⚡',
    badge: 'Most Popular',
    is_featured: true,
    items: ['Eating Disorders', 'Workplace Stress', 'Family Therapy'],
  },
  {
    title: 'Trauma Specialists',
    icon: '💜',
    badge: null,
    is_featured: false,
    items: ['PTSD & Complex Trauma', 'Childhood Trauma Recovery', 'Crisis Intervention'],
  },
  {
    title: 'Group Facilitators',
    icon: '🤝',
    badge: null,
    is_featured: false,
    items: ['Support Circles', 'Grief & Loss Groups', 'Addiction Recovery'],
  },
];

@Injectable()
export class WellnessServicesService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<WellnessService[]> {
    if (!this.db.connected) return FALLBACK;
    try {
      const svc = await this.db.query(
        'SELECT id, title, icon, badge, is_featured FROM services ORDER BY sort_order, id',
      );
      const result: WellnessService[] = [];
      for (const s of svc.rows) {
        const items = await this.db.query(
          'SELECT text FROM service_items WHERE service_id = $1 ORDER BY sort_order, id',
          [s.id],
        );
        result.push({
          title: s.title,
          icon: s.icon,
          badge: s.badge,
          is_featured: s.is_featured,
          items: items.rows.map((r) => r.text),
        });
      }
      return result;
    } catch {
      return FALLBACK;
    }
  }
}
