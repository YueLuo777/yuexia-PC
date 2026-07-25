import type { LucideIcon } from 'lucide-react';

export type TestItem = {
  title: string;
  description: string;
  path: string;
  icon: LucideIcon;
  badge: string;
};

export type TestGroup = {
  title: string;
  items: TestItem[];
};
