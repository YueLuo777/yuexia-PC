import { Plus, Trash2 } from 'lucide-react';

import {
  createEmptyCustomSettingEntry,
  createEmptyCustomSettingField,
  createEmptyCustomSettingGroup,
  type StandardSettingCustomGroup,
} from '@/features/workbench/model/standardModeSettingModel';

type StandardModeCustomTemplateBuilderProps = {
  groups: StandardSettingCustomGroup[];
  error: string;
  onChange: (groups: StandardSettingCustomGroup[]) => void;
  onFinish: () => void;
};

const inputClass =
  'h-10 min-w-0 rounded-md border border-[#cfd8e3] bg-white px-3 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-400 focus:border-[#08AACE] focus:ring-1 focus:ring-[#08AACE]';
const iconButtonClass =
  'grid h-9 w-9 shrink-0 place-items-center rounded-md border border-slate-200 bg-white text-slate-400 hover:border-red-200 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-35';

export function StandardModeCustomTemplateBuilder({
  groups,
  error,
  onChange,
  onFinish,
}: StandardModeCustomTemplateBuilderProps) {
  const updateGroup = (groupId: string, updater: (group: StandardSettingCustomGroup) => StandardSettingCustomGroup) => {
    onChange(groups.map((group) => (group.id === groupId ? updater(group) : group)));
  };

  return (
    <section className="min-h-0 flex-1 overflow-hidden border-l border-[#dce3eb] bg-white">
      <header className="flex h-[74px] items-center justify-between border-b border-[#dce3eb] px-5">
        <div>
          <h2 className="text-base font-bold text-slate-900">自定义模板</h2>
          <p className="mt-1 text-sm font-medium text-slate-500">依次创建分组、设定和设定下的子设定。</p>
        </div>
        <button
          type="button"
          onClick={() => onChange([...groups, createEmptyCustomSettingGroup()])}
          className="grid h-9 w-9 place-items-center rounded-md border border-[#9edeea] bg-[#eaf9fc] text-[#078fab] hover:bg-[#dff5f9]"
          title="新增分组"
          aria-label="新增分组"
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      <div className="h-[calc(100%-74px)] overflow-y-auto px-5 py-4">
        <div className="space-y-4">
          {groups.map((group, groupIndex) => (
            <section key={group.id} className="rounded-md border border-[#d7e0e9] bg-[#f8fafc] p-4">
              <div className="flex items-center gap-3">
                <span className="w-16 shrink-0 text-sm font-bold text-slate-600">分组 {groupIndex + 1}</span>
                <input
                  aria-label={`分组${groupIndex + 1}名称`}
                  value={group.title}
                  onChange={(event) => updateGroup(group.id, (current) => ({ ...current, title: event.target.value }))}
                  placeholder="例如：人物设定"
                  className={`${inputClass} flex-1`}
                />
                <button
                  type="button"
                  onClick={() => onChange(groups.filter((item) => item.id !== group.id))}
                  disabled={groups.length === 1}
                  className={iconButtonClass}
                  title="删除分组"
                  aria-label={`删除分组${groupIndex + 1}`}
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 space-y-3 border-l-2 border-[#b8e7ef] pl-4">
                {group.entries.map((entry, entryIndex) => (
                  <div key={entry.id} className="border-b border-[#e3e8ee] pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="w-16 shrink-0 text-sm font-bold text-slate-500">设定 {entryIndex + 1}</span>
                      <input
                        aria-label={`${groupIndex + 1}-${entryIndex + 1}设定名称`}
                        value={entry.title}
                        onChange={(event) =>
                          updateGroup(group.id, (current) => ({
                            ...current,
                            entries: current.entries.map((item) =>
                              item.id === entry.id ? { ...item, title: event.target.value } : item,
                            ),
                          }))
                        }
                        placeholder="例如：男主角"
                        className={`${inputClass} flex-1`}
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateGroup(group.id, (current) => ({
                            ...current,
                            entries: current.entries.filter((item) => item.id !== entry.id),
                          }))
                        }
                        disabled={group.entries.length === 1}
                        className={iconButtonClass}
                        title="删除设定"
                        aria-label={`删除设定${entryIndex + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-2 grid grid-cols-2 gap-2 pl-[76px]">
                      {entry.fields.map((field, fieldIndex) => (
                        <div key={field.id} className="flex min-w-0 items-center gap-2">
                          <input
                            aria-label={`${entry.title || `设定${entryIndex + 1}`}子设定${fieldIndex + 1}`}
                            value={field.title}
                            onChange={(event) =>
                              updateGroup(group.id, (current) => ({
                                ...current,
                                entries: current.entries.map((item) =>
                                  item.id !== entry.id
                                    ? item
                                    : {
                                        ...item,
                                        fields: item.fields.map((currentField) =>
                                          currentField.id === field.id
                                            ? { ...currentField, title: event.target.value }
                                            : currentField,
                                        ),
                                      },
                                ),
                              }))
                            }
                            placeholder="子设定名称"
                            className={`${inputClass} flex-1`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              updateGroup(group.id, (current) => ({
                                ...current,
                                entries: current.entries.map((item) =>
                                  item.id === entry.id
                                    ? { ...item, fields: item.fields.filter((currentField) => currentField.id !== field.id) }
                                    : item,
                                ),
                              }))
                            }
                            disabled={entry.fields.length === 1}
                            className={iconButtonClass}
                            title="删除子设定"
                            aria-label={`删除子设定${fieldIndex + 1}`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        updateGroup(group.id, (current) => ({
                          ...current,
                          entries: current.entries.map((item) =>
                            item.id === entry.id
                              ? { ...item, fields: [...item.fields, createEmptyCustomSettingField()] }
                              : item,
                          ),
                        }))
                      }
                      className="ml-[76px] mt-2 h-8 rounded-md border border-[#b9dfe7] bg-white px-3 text-xs font-bold text-[#078fab] hover:bg-[#edfafd]"
                    >
                      新增子设定
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() =>
                    updateGroup(group.id, (current) => ({
                      ...current,
                      entries: [...current.entries, createEmptyCustomSettingEntry()],
                    }))
                  }
                  className="h-9 rounded-md border border-[#b9dfe7] bg-white px-4 text-sm font-bold text-[#078fab] hover:bg-[#edfafd]"
                >
                  新增设定
                </button>
              </div>
            </section>
          ))}
        </div>
        {error ? <p className="mt-3 text-sm font-bold text-red-500">{error}</p> : null}
        <div className="sticky bottom-0 mt-5 flex justify-end border-t border-[#e2e8f0] bg-white py-4">
          <button
            type="button"
            onClick={onFinish}
            className="h-10 min-w-[128px] rounded-md bg-[#08AACE] px-5 text-sm font-bold text-white hover:bg-[#0797b8]"
          >
            完成并创建
          </button>
        </div>
      </div>
    </section>
  );
}
