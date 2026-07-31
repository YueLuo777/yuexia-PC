import {
  MALE_FANTASY_XIANXIA_FULL_STRUCTURE as full,
  MALE_FANTASY_XIANXIA_LIGHT_STRUCTURE as light,
  MALE_FANTASY_XIANXIA_STANDARD_STRUCTURE as standard,
} from '../../src/features/workbench/model/standardModeXianxiaSettingTemplates';

const count = (structure: typeof light) => structure
  .flatMap((domain) => domain.groups)
  .flatMap((group) => group.entries)
  .flatMap((entry) => entry.sections)
  .flatMap((section) => section.fields).length;

console.log({ light: count(light), standard: count(standard), full: count(full) });
