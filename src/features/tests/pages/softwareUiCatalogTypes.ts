import type { ReactNode } from 'react';

export type FontSample = {
  id: string;
  name: string;
  usage: string;
  className: string;
  sample: string;
};

export type ColorSample = {
  id: string;
  name: string;
  usage: string;
  value: string;
  textClass?: string;
};

export type UiSample = {
  id: string;
  group: string;
  name: string;
  usage: string;
  preview: ReactNode;
  specs?: Partial<UiSpecs>;
};

export type UiSpecs = {
  width: number;
  height: number;
  fontSize: number;
  radius: number;
  paddingX: number;
  gap: number;
  iconSize: number;
  plusMinusSize: number;
};

export type TechItem = {
  id: string;
  name: string;
  plain: string;
  tech: string;
};
