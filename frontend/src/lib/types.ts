export interface Condition {
  name: string;
  fact: string;
  treatment: string;
  color: string;
  signs: string[];
  treatments: string[];
}

export interface BrainTip {
  title: string;
  description: string;
  category: string;
  icon: string;
}

export interface Quote {
  quote_text: string;
  author: string;
}

export interface WellnessService {
  title: string;
  icon: string;
  badge: string | null;
  is_featured: boolean;
  items: string[];
}
