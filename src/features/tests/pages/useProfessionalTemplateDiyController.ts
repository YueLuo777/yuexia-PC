import { useTemplateDiyController } from '@/features/templates/hooks/useTemplateDiyController';

import { professionalTemplateStructure } from './professionalTemplateHierarchyModel';

export {
  getDiyEntryFields,
  type DiyLevel,
  type DiyLockedLevels,
  type TemplateDiyController as ProfessionalTemplateDiyController,
} from '@/features/templates/hooks/useTemplateDiyController';

export function useProfessionalTemplateDiyController() {
  return useTemplateDiyController({ initialStructure: professionalTemplateStructure });
}
