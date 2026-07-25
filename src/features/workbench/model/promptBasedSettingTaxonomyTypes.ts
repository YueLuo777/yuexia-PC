export type PromptTaxonomyDomainId = 'work' | 'character' | 'faction' | 'resource' | 'location' | 'monster' | 'foreshadow';

export type PromptTaxonomyTag = '男主' | '女主' | '配角' | '反派';

export type PromptTaxonomyTemplateKey =
  | 'work-positioning'
  | 'world-background'
  | 'power-system'
  | 'setting-red-lines'
  | 'overall-plot'
  | 'volume-plot'
  | 'payoff-design'
  | 'world-structure'
  | 'location'
  | 'danger-zone'
  | 'writing-style'
  | 'chapter-rules'
  | 'prohibited-content'
  | 'terminology-format'
  | 'timeline'
  | 'protagonist'
  | 'supporting-role'
  | 'antagonist'
  | 'faction'
  | 'ability'
  | 'item'
  | 'special-resource'
  | 'currency'
  | 'monster'
  | 'foreshadow';

export type PromptTaxonomyField = {
  label: string;
  hint: string;
  wide?: boolean;
};

export type PromptTaxonomySection = {
  title: string;
  fields: PromptTaxonomyField[];
};

export type PromptTaxonomyTemplate = {
  description: string;
  sections: PromptTaxonomySection[];
  softwareAdditions: string[];
};

export type PromptTaxonomyEntry = {
  id: string;
  title: string;
  template: PromptTaxonomyTemplateKey;
  sources: string[];
  note: string;
  tag?: PromptTaxonomyTag;
};

export type PromptTaxonomyGroup = {
  title: string;
  entries: PromptTaxonomyEntry[];
};

export type PromptTaxonomyDomain = {
  id: PromptTaxonomyDomainId;
  title: string;
  groups: PromptTaxonomyGroup[];
};
