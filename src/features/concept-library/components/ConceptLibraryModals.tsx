import { Tags } from 'lucide-react';
import type { ConceptCloudConfig, InspirationConceptItem } from '../model/conceptLibraryTypes';
import type { ConceptAiRequestLog } from './ConceptLibraryParts';
import { buildConceptLogGroups } from './ConceptLibraryParts';
import { ActionButton } from '@/shared/ui/ActionButton';
import { AiRequestLogModalLayout } from '@/shared/ui/AiRequestLogModalLayout';
import { AppModalShell } from '@/shared/ui/AppModalShell';

export function ConceptLibraryModals({
  cloudOpen,
  cloudConfig,
  cloudObjectKey,
  cloudBusy,
  logOpen,
  log,
  associations,
  onCloudClose,
  onCloudChange,
  onCloudSave,
  onCloudUpload,
  onCloudRestore,
  onLogClose,
  onAssociationClose,
  onAssociationConfirm,
}: {
  cloudOpen: boolean;
  cloudConfig: ConceptCloudConfig;
  cloudObjectKey: string;
  cloudBusy: boolean;
  logOpen: boolean;
  log: ConceptAiRequestLog;
  associations: InspirationConceptItem[];
  onCloudClose: () => void;
  onCloudChange: (value: ConceptCloudConfig) => void;
  onCloudSave: () => void;
  onCloudUpload: () => void;
  onCloudRestore: () => void;
  onLogClose: () => void;
  onAssociationClose: () => void;
  onAssociationConfirm: () => void;
}) {
  const fields: [keyof ConceptCloudConfig, string, string?][] = [
    ['bucket', 'Bucket，例如 writer-1250000000'],
    ['region', 'Region，例如 ap-guangzhou'],
    ['secretId', 'SecretId'],
    ['secretKey', 'SecretKey', 'password'],
    ['prefix', '云端目录，例如 xinyuexia'],
  ];
  return (
    <>
      <AppModalShell
        title="COS 云同步"
        isOpen={cloudOpen}
        onClose={onCloudClose}
        widthClass="w-[min(560px,94vw)]"
        heightClass=""
        zIndexClass="z-[360]"
        backdropClassName="bg-slate-950/35 p-5"
        contentClassName="p-5"
      >
        <div className="mt-4 grid gap-3">
          {fields.map(([key, placeholder, type]) => (
            <input
              key={key}
              data-no-modal-drag
              value={cloudConfig[key]}
              onChange={(e) => onCloudChange({ ...cloudConfig, [key]: e.target.value })}
              placeholder={placeholder}
              type={type}
              className="h-10 rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm outline-none focus:border-cyan-400 focus:bg-white"
            />
          ))}
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2">
          <ActionButton onClick={onCloudSave} variant="secondary">
            保存
          </ActionButton>
          <ActionButton onClick={onCloudUpload} disabled={cloudBusy} variant="secondary">
            上传
          </ActionButton>
          <ActionButton onClick={onCloudRestore} disabled={cloudBusy} variant="secondary">
            恢复
          </ActionButton>
        </div>
        <p className="mt-4 break-all text-xs font-bold leading-5 text-slate-400">云端文件：{cloudObjectKey}</p>
      </AppModalShell>
      <AppModalShell
        title="输出日志"
        isOpen={logOpen}
        onClose={onLogClose}
        widthClass="w-[min(960px,94vw)]"
        heightClass="h-[min(760px,88vh)]"
        zIndexClass="z-[365]"
        backdropClassName="bg-slate-950/35 p-5"
        contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      >
        <AiRequestLogModalLayout
          metaItems={[
            { id: 'action', label: '动作', value: log.action },
            { id: 'model', label: '模型', value: log.modelName },
            { id: 'time', label: '时间', value: log.createdAt },
          ]}
          groups={buildConceptLogGroups(log)}
          storageKey="concept_library_ai_request_log_groups"
        />
      </AppModalShell>
      <AppModalShell
        title="AI 联想预览"
        subtitle={
          associations.length === 1
            ? associations[0]?.title
            : associations.length
              ? `${associations.length} 条`
              : undefined
        }
        isOpen={associations.length > 0}
        onClose={onAssociationClose}
        widthClass="w-[min(680px,94vw)]"
        heightClass="max-h-[86vh]"
        zIndexClass="z-[370]"
        backdropClassName="bg-slate-950/35 p-5"
        contentClassName="flex min-h-0 flex-col overflow-hidden"
        panelClassName="border border-cyan-100"
      >
        {associations.length > 0 && (
          <>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
              {associations.map((association, index) => (
                <article key={association.id} className="rounded-xl border border-cyan-100 bg-white p-4">
                  <h3 className="text-sm font-black text-slate-900">
                    {associations.length > 1 ? `${index + 1}. ` : ''}
                    {association.title}
                  </h3>
                  {association.summary && (
                    <p className="mt-2 rounded-lg bg-cyan-50 px-3 py-2 text-sm font-bold leading-6 text-cyan-800">
                      {association.summary}
                    </p>
                  )}
                  <div className="mt-3 whitespace-pre-wrap break-words text-sm leading-7 text-slate-700">
                    {association.content}
                  </div>
                  {association.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {association.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-500"
                        >
                          <Tags className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </article>
              ))}
            </div>
            <div className="grid shrink-0 grid-cols-2 gap-2 border-t border-slate-100 p-4">
              <ActionButton onClick={onAssociationClose} variant="secondary" className="w-full">
                取消
              </ActionButton>
              <ActionButton onClick={onAssociationConfirm} className="w-full">
                确认保存
              </ActionButton>
            </div>
          </>
        )}
      </AppModalShell>
    </>
  );
}
