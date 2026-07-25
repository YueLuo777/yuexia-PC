import { useEffect, useState } from 'react';

import { FormDialog } from '@/shared/ui/FormDialog';

export function PromptCategoryCreateModal({
  isOpen,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (name: string) => void;
}) {
  const [name, setName] = useState('');
  useEffect(() => {
    if (isOpen) setName('');
  }, [isOpen]);

  const confirm = () => {
    if (!name.trim()) return;
    onConfirm(name);
  };

  return (
    <FormDialog
      title="新增分类"
      subtitle="输入小说提示词的分类名称"
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={confirm}
      label="分类名称"
      value={name}
      onValueChange={setName}
      inputId="prompt-category-name"
      placeholder="请输入分类名称"
      widthClass="w-[440px]"
      storageId="prompt_category_create"
      zIndexClass="z-[300]"
    />
  );
}
