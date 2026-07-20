import { X } from 'lucide-react';
import type { ModelItem } from '@/features/models/model/modelTypes';
import type { PromptItem } from '@/features/prompts/model/promptTypes';
import { CombinedAiConfigSelect } from '@/shared/ui/CombinedAiConfigSelect';

export function WorkbenchAiConfigPanel({
  model,
  modelId,
  prompt,
  promptId,
  models,
  prompts,
  onModelChange,
  onPromptChange,
  onModelManage,
  onPromptManage,
}: {
  model: ModelItem | null;
  modelId: string;
  prompt: PromptItem | null;
  promptId: string;
  models: ModelItem[];
  prompts: PromptItem[];
  onModelChange: (value: string) => void;
  onPromptChange: (value: string) => void;
  onModelManage: () => void;
  onPromptManage: () => void;
}) {
  const status =
    !model || model.connectionStatus === 'failed' ? (
      <X className="h-3.5 w-3.5 text-red-500" />
    ) : model.connectionStatus === 'connected' ? (
      <span className="text-xs font-bold tabular-nums text-emerald-600">
        {typeof model.connectionLatencyMs === 'number' ? `${model.connectionLatencyMs}ms` : '--ms'}
      </span>
    ) : null;
  return (
    <div className="w-full shrink-0 overflow-visible">
      <div className="max-w-full">
        <CombinedAiConfigSelect
          className="w-full"
          modelValue={model?.id ?? modelId}
          promptValue={prompt?.id ?? prompts[0]?.id ?? promptId}
          modelOptions={
            models.length
              ? models.map((item) => ({ value: item.id, label: item.name }))
              : [{ value: '', label: '无可用模型', disabled: true }]
          }
          promptOptions={
            prompts.length
              ? prompts.map((item) => ({ value: item.id, label: item.name }))
              : [{ value: '', label: '无可用提示词', disabled: true }]
          }
          onModelChange={onModelChange}
          onPromptChange={onPromptChange}
          onModelManage={onModelManage}
          onPromptManage={onPromptManage}
        />
        {status ? <div className="mt-1 flex h-4 justify-end text-xs font-bold">{status}</div> : null}
      </div>
    </div>
  );
}
