import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

export interface Condition {
  name: string;
  fact: string;
  treatment: string;
  color: string;
  signs: string[];
  treatments: string[];
}

const FALLBACK: Condition[] = [
  {
    name: 'Anxiety',
    fact: 'Affects 40 million adults annually',
    treatment: '80-90% success rate',
    signs: [
      'Racing thoughts & constant worry',
      'Physical symptoms (heart racing, sweating)',
      'Avoidance of situations or activities',
      'Difficulty concentrating',
    ],
    treatments: [
      'Cognitive Behavioral Therapy (CBT)',
      'Exposure Response Prevention',
      'Mindfulness-based interventions',
      'Medication when appropriate',
    ],
    color: '#7B4FBE',
  },
  {
    name: 'Depression',
    fact: '17+ million adults experience this annually',
    treatment: '70-80% recovery with treatment',
    signs: [
      'Persistent sadness or emptiness',
      'Loss of interest in activities',
      'Changes in sleep/appetite',
      'Thoughts of worthlessness',
    ],
    treatments: [
      'Individual therapy (CBT, IPT, DBT)',
      'Lifestyle interventions',
      'Support group therapy',
    ],
    color: '#C2185B',
  },
  {
    name: 'Trauma & PTSD',
    fact: '70% of adults experience trauma in lifetime',
    treatment: '85% improvement with trauma-informed care',
    signs: [
      'Intrusive memories or flashbacks',
      'Avoidance of trauma reminders',
      'Hypervigilance or easily startled',
      'Negative changes in thoughts/mood',
    ],
    treatments: [
      'EMDR Therapy',
      'Trauma-Focused CBT',
      'Somatic therapy approaches',
      'Group trauma recovery',
    ],
    color: '#1565C0',
  },
  {
    name: 'Stress & Burnout',
    fact: '77% experience physical stress symptoms',
    treatment: '94% recovery rate with proper support',
    signs: [
      'Emotional exhaustion',
      'Cynicism about work/life',
      'Reduced sense of accomplishment',
      'Physical symptoms (headaches, insomnia)',
    ],
    treatments: [
      'Stress reduction techniques',
      'Boundary setting strategies',
      'Work-life balance coaching',
      'Mindfulness & relaxation training',
    ],
    color: '#2E7D32',
  },
];

@Injectable()
export class ConditionsService {
  constructor(private readonly db: DatabaseService) {}

  async findAll(): Promise<Condition[]> {
    if (!this.db.connected) return FALLBACK;
    try {
      const conds = await this.db.query(
        'SELECT id, name, fact, treatment, color FROM conditions ORDER BY id',
      );
      const result: Condition[] = [];
      for (const c of conds.rows) {
        const signs = await this.db.query(
          'SELECT text FROM condition_signs WHERE condition_id = $1 ORDER BY sort_order, id',
          [c.id],
        );
        const treatments = await this.db.query(
          'SELECT text FROM condition_treatments WHERE condition_id = $1 ORDER BY sort_order, id',
          [c.id],
        );
        result.push({
          name: c.name,
          fact: c.fact,
          treatment: c.treatment,
          color: c.color,
          signs: signs.rows.map((r) => r.text),
          treatments: treatments.rows.map((r) => r.text),
        });
      }
      return result;
    } catch {
      return FALLBACK;
    }
  }
}
