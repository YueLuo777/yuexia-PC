import { TemplateDiyColumnsEditor } from '@/features/templates/components/TemplateDiyColumnsEditor';

import type { ProfessionalTemplateDiyController } from './useProfessionalTemplateDiyController';

export function ProfessionalSettingDiyColumnsVariant({
  controller,
}: {
  controller: ProfessionalTemplateDiyController;
}) {
  return <TemplateDiyColumnsEditor controller={controller} />;
}
