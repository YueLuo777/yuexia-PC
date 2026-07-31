import type { DiyLevel } from '@/features/templates/hooks/useTemplateDiyController';

export const DIY_LEVEL_ORDER: DiyLevel[] = ['domain', 'group', 'entry', 'field'];

export const DIY_LEVEL_THEME: Record<DiyLevel, {
  card: string;
  cardInactive: string;
  name: string;
  text: string;
  badge: string;
  focus: string;
}> = {
  domain: {
    card: 'border-[#D7A51C] bg-[#FFF7DA] text-[#7A5410]',
    cardInactive: 'border-[#E6D8AA] bg-[#FFF7DA] text-[#7A5410] hover:border-[#D7A51C] hover:bg-[#FFF9E8]',
    name: 'bg-[#F8D36A] text-[#5F3E00] ring-[#D7A51C]',
    text: 'text-[#7A5410]',
    badge: 'border-[#D7A51C] bg-[#FFF7DA] text-[#7A5410]',
    focus: 'focus-visible:ring-[#D7A51C]',
  },
  group: {
    card: 'border-[#B38AF2] bg-[#F5EDFF] text-[#6338A6]',
    cardInactive: 'border-[#D8C6F5] bg-[#F5EDFF] text-[#6338A6] hover:border-[#B38AF2] hover:bg-[#FAF6FF]',
    name: 'bg-[#D7B8FF] text-[#4C238A] ring-[#B38AF2]',
    text: 'text-[#6338A6]',
    badge: 'border-[#B38AF2] bg-[#F5EDFF] text-[#6338A6]',
    focus: 'focus-visible:ring-[#B38AF2]',
  },
  entry: {
    card: 'border-[#7CB8F2] bg-[#EAF5FF] text-[#235C9A]',
    cardInactive: 'border-[#BBD6EF] bg-[#EAF5FF] text-[#235C9A] hover:border-[#7CB8F2] hover:bg-[#F2F8FF]',
    name: 'bg-[#B9DBFF] text-[#174C86] ring-[#7CB8F2]',
    text: 'text-[#235C9A]',
    badge: 'border-[#7CB8F2] bg-[#EAF5FF] text-[#235C9A]',
    focus: 'focus-visible:ring-[#7CB8F2]',
  },
  field: {
    card: 'border-[#7EC99B] bg-[#ECFAF1] text-[#247446]',
    cardInactive: 'border-[#B9DFC7] bg-[#ECFAF1] text-[#247446] hover:border-[#7EC99B] hover:bg-[#F3FCF6]',
    name: 'bg-[#B9E8C9] text-[#145C31] ring-[#7EC99B]',
    text: 'text-[#247446]',
    badge: 'border-[#7EC99B] bg-[#ECFAF1] text-[#247446]',
    focus: 'focus-visible:ring-[#7EC99B]',
  },
};

export function getDiyLevelTheme(level: DiyLevel) {
  return DIY_LEVEL_THEME[level];
}

export function getDiyLevelByIndex(index: number): DiyLevel {
  return DIY_LEVEL_ORDER[Math.min(Math.max(index, 0), DIY_LEVEL_ORDER.length - 1)];
}
