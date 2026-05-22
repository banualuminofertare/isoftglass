export type ManualRole = 'admin' | 'subscriber' | 'all';

export interface ManualSection {
  id: string;
  title: string;
  category: string;
  roles: ManualRole[];
  order: number;
  content: string; // markdown
  image?: string;       // ex: '/manual/setari-companie.png'
  imageAlt?: string;
  tips?: string[];
  warnings?: string[];
  accent?: 'green' | 'amber' | 'red';
}

export interface ManualCategory {
  id: string;
  label: string;
  order: number;
}
