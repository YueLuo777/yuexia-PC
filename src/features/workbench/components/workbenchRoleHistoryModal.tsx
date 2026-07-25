import {
  buildRoleStateSettingsText,
  normalizeRoleStateSettings,
  ROLE_HISTORY_LIMIT,
  type RoleContent,
} from './workbenchRoleContent';
import { WorkbenchModal } from './WorkbenchModal';

interface RoleHistoryModalProps {
  entryTitle: string;
  role: RoleContent;
  onClose: () => void;
}

export function RoleHistoryModal({ entryTitle, role, onClose }: RoleHistoryModalProps) {
  const history = role.history ?? [];

  return (
    <WorkbenchModal
      title="历史版本"
      subtitle={`${entryTitle} · ${history.length} / ${ROLE_HISTORY_LIMIT}`}
      isOpen
      onClose={onClose}
      widthClass="w-[860px]"
      heightClass="h-[72vh]"
      storageId="role_history"
      zIndexClass="z-[10020]"
    >
        <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto p-5">
          {history.length === 0 ? (
            <div className="flex h-full items-center justify-center rounded-xl border border-dashed border-gray-200 bg-gray-50 text-sm text-gray-400">
              暂无历史版本，修改角色后会自动记录。
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((version, index) => (
                <article key={`${version.savedAt}-${index}`} className="rounded-xl border border-gray-200 bg-white p-4">
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 truncate text-sm font-bold text-gray-900">
                      版本 {history.length - index}：{version.title}
                    </div>
                    <span className="shrink-0 text-xs text-gray-400">{version.savedAt}</span>
                  </div>
                  <div className="mb-3 text-xs font-bold text-gray-500">分类：{version.type}</div>
                  <div className="grid grid-cols-2 gap-3 text-xs leading-5 text-gray-500">
                    <div className="min-h-32 rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 font-bold text-gray-700">基础设定</div>
                      <p className="whitespace-pre-wrap">{version.baseSetting || version.background || '暂无内容'}</p>
                    </div>
                    <div className="min-h-32 rounded-lg bg-gray-50 p-3">
                      <div className="mb-1 font-bold text-gray-700">状态设定</div>
                      <p className="whitespace-pre-wrap">
                        {buildRoleStateSettingsText(
                          normalizeRoleStateSettings(version.stateSettings, version.status),
                        ) || '暂无内容'}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
    </WorkbenchModal>
  );
}
