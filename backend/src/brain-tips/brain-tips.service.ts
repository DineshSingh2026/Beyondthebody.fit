import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface BrainTip {
  title: string;
  description: string;
  category: string;
  icon: string;
}

const FALLBACK: BrainTip[] = [
  {
    title: 'Box Breathing',
    description: 'Inhale 4s → Hold 4s → Exhale 4s → Hold 4s. Repeat for instant calm.',
    category: 'Anxiety Relief',
    icon: '🫁',
  },
  {
    title: '5-4-3-2-1 Grounding',
    description: 'Name 5 things you see, 4 you touch, 3 you hear, 2 you smell, 1 you taste.',
    category: 'Grounding',
    icon: '🌿',
  },
  {
    title: 'Cognitive Reframing',
    description: 'Ask: Is this thought 100% true? What would I tell a friend in this situation?',
    category: 'Mental Clarity',
    icon: '🧠',
  },
  {
    title: 'Progressive Relaxation',
    description: 'Tense each muscle group for 5 seconds, then release. Start from your toes.',
    category: 'Stress Relief',
    icon: '💪',
  },
  {
    title: 'Body Scan Meditation',
    description: 'Close your eyes and scan from head to toe, releasing tension wherever you find it.',
    category: 'Mindfulness',
    icon: '✨',
  },
  {
    title: 'Journaling Reset',
    description: 'Write 3 feelings, 3 gratitudes, 1 intention. Takes 5 minutes, shifts everything.',
    category: 'Emotional Health',
    icon: '📝',
  },
];

@Injectable()
export class BrainTipsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<BrainTip[]> {
    if (!this.db.connected) return FALLBACK;
    try {
      const r = await this.db.query(
        'SELECT title, description, category, icon FROM brain_tips ORDER BY sort_order, id',
      );
      return r.rows;
    } catch {
      return FALLBACK;
    }
  }
}
