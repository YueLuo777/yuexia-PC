import { AssociationSegmentedControl } from '@/shared/ui/AssociationSegmentedControl';
import { WordCountText } from '@/shared/ui/WordCountText';

type OutlineAssociationControlProps = {
  linked: boolean;
  wordCount: number;
  onOpen: () => void;
  onClear: () => void;
};

export function OutlineAssociationControl({
  linked,
  wordCount,
  onOpen,
  onClear,
}: OutlineAssociationControlProps) {
  return (
    <AssociationSegmentedControl
      segments={[
        {
          id: 'outline',
          label: linked ? '已关联大纲' : '大纲',
          active: linked,
          onClick: linked ? onClear : onOpen,
          minWidthClassName: 'w-28',
        },
      ]}
      meta={
        linked ? (
          <>
            关联 <WordCountText value={wordCount} compact />
          </>
        ) : undefined
      }
    />
  );
}
