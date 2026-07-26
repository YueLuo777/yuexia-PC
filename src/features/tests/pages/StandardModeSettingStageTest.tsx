import { useEffect, useMemo, useState } from 'react';

import {
  STANDARD_SETTING_FIELDS,
  type SettingGenerationStatus,
  type StandardTestBrainstorm,
} from './standardModeFourStageTestModel';

interface StandardModeSettingStageTestProps {
  linkedBrainstorm?: StandardTestBrainstorm;
  values: Record<string, string>;
  activeFieldId: string;
  generationStatus: SettingGenerationStatus;
  checkMessage: string;
  onChangeField: (id: string, value: string) => void;
  onSelectField: (id: string) => void;
  onStartOrContinue: () => void;
  onPause: () => void;
  onClear: () => void;
  onCheck: () => void;
  onEnterCreation: () => void;
}

const CATEGORIES = Array.from(new Set(STANDARD_SETTING_FIELDS.map((field) => field.category)));

function getStatusText(status: SettingGenerationStatus) {
  if (status === 'running') return 'AI正在逐项生成';
  if (status === 'paused') return '生成已暂停，可以继续';
  if (status === 'complete') return '所有设定已生成';
  return '等待开始生成';
}

export function StandardModeSettingStageTest({
  linkedBrainstorm,
  values,
  activeFieldId,
  generationStatus,
  checkMessage,
  onChangeField,
  onSelectField,
  onStartOrContinue,
  onPause,
  onClear,
  onCheck,
  onEnterCreation,
}: StandardModeSettingStageTestProps) {
  const activeField = STANDARD_SETTING_FIELDS.find((field) => field.id === activeFieldId) ?? STANDARD_SETTING_FIELDS[0];
  const [selectedCategory, setSelectedCategory] = useState(activeField.category);
  const categoryFields = useMemo(
    () => STANDARD_SETTING_FIELDS.filter((field) => field.category === selectedCategory),
    [selectedCategory],
  );
  const completedCount = STANDARD_SETTING_FIELDS.filter((field) => values[field.id]?.trim()).length;
  const allComplete = completedCount === STANDARD_SETTING_FIELDS.length;

  useEffect(() => {
    if (generationStatus === 'running') setSelectedCategory(activeField.category);
  }, [activeField.category, generationStatus]);

  return (
    <div className="grid h-full min-h-0 grid-cols-[230px_minmax(480px,1fr)_340px] bg-white" data-testid="standard-setting-stage">
      <aside className="min-h-0 overflow-y-auto border-r border-[#dce1e8] bg-[#f8f9fa] p-3">
        <div className="px-2 pb-3">
          <div className="text-sm font-semibold text-[#26323f]">设定目录</div>
          <div className="mt-1 text-xs text-[#8a95a2]">{completedCount}/{STANDARD_SETTING_FIELDS.length} 项已填写</div>
        </div>
        <div className="space-y-2">
          {CATEGORIES.map((category) => {
            const fields = STANDARD_SETTING_FIELDS.filter((field) => field.category === category);
            const complete = fields.filter((field) => values[field.id]?.trim()).length;
            const selected = category === selectedCategory;
            return (
              <div key={category}>
                <button
                  type="button"
                  aria-current={selected ? 'true' : undefined}
                  onClick={() => setSelectedCategory(category)}
                  className={[
                    'flex h-10 w-full items-center justify-between rounded-md border bg-white px-3 text-sm font-semibold',
                    selected ? 'border-[#08AACE] text-[#078FAB]' : 'border-[#dce1e8] text-[#44515f] hover:border-[#9fdce8]',
                  ].join(' ')}
                >
                  <span>{category}</span>
                  <span className="text-xs font-medium text-[#8a95a2]">{complete}/{fields.length}</span>
                </button>
                {selected ? (
                  <div className="ml-4 mt-1 border-l border-[#9fdce8] pl-2">
                    {fields.map((field) => (
                      <button
                        key={field.id}
                        type="button"
                        onClick={() => onSelectField(field.id)}
                        className={[
                          'block h-8 w-full truncate px-2 text-left text-xs',
                          field.id === activeFieldId ? 'font-semibold text-[#078FAB]' : 'text-[#657180]',
                        ].join(' ')}
                      >
                        {field.label}{values[field.id]?.trim() ? ' · 已填' : ''}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </aside>

      <main className="min-h-0 overflow-y-auto px-7 py-5">
        <div className="flex items-center justify-between border-b border-[#e7eaee] pb-4">
          <div>
            <div className="text-xs font-medium text-[#078FAB]">{selectedCategory}</div>
            <h2 className="mt-1 text-lg font-semibold text-[#26323f]">逐项完善设定</h2>
          </div>
          <span className={generationStatus === 'running' ? 'text-xs font-medium text-[#078FAB]' : 'text-xs text-[#8a95a2]'}>
            {getStatusText(generationStatus)}
          </span>
        </div>

        {linkedBrainstorm ? (
          <div className="mt-4 flex items-center justify-between rounded-md border border-[#b9e6ef] bg-[#f4fbfc] px-4 py-3">
            <div className="min-w-0">
              <div className="text-xs font-medium text-[#078FAB]">已自动关联脑洞</div>
              <div className="mt-1 truncate text-sm font-semibold text-[#44515f]">{linkedBrainstorm.title} · {linkedBrainstorm.summary}</div>
            </div>
          </div>
        ) : (
          <div className="mt-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">尚未关联脑洞，也可以根据书籍信息直接生成。</div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-4">
          {categoryFields.map((field) => {
            const active = field.id === activeFieldId;
            return (
              <label key={field.id} className="block">
                <span className="mb-2 flex items-center justify-between text-sm font-medium text-[#44515f]">
                  <span>{field.label}</span>
                  {active && generationStatus === 'running' ? <span className="text-xs text-[#078FAB]">正在输出</span> : null}
                </span>
                <textarea
                  value={values[field.id] ?? ''}
                  onFocus={() => onSelectField(field.id)}
                  onChange={(event) => onChangeField(field.id, event.target.value)}
                  placeholder={`等待生成${field.label}`}
                  className={[
                    'h-40 w-full resize-none rounded-md border bg-white p-3 text-sm leading-6 text-[#44515f] outline-none',
                    active ? 'border-[#08AACE]' : 'border-[#cfd6dd] focus:border-[#08AACE]',
                  ].join(' ')}
                />
              </label>
            );
          })}
        </div>
      </main>

      <aside className="flex min-h-0 flex-col border-l border-[#dce1e8] bg-[#f8f9fa] p-4">
        <div>
          <h2 className="text-base font-semibold text-[#26323f]">AI设定操作台</h2>
          <p className="mt-1 text-xs leading-5 text-[#8a95a2]">AI会按目录逐项输出，当前输出位置会自动切换到中间区域。</p>
        </div>
        <textarea
          placeholder="补充设定要求，例如：力量体系不要过度复杂"
          className="mt-4 h-28 resize-none rounded-md border border-[#cfd6dd] bg-white p-3 text-sm leading-6 text-[#44515f] outline-none focus:border-[#08AACE]"
        />

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={generationStatus === 'complete'}
            onClick={generationStatus === 'running' ? onPause : onStartOrContinue}
            className="col-span-2 h-11 rounded-md bg-[#08AACE] text-sm font-semibold text-white hover:bg-[#078FAB] disabled:cursor-default disabled:bg-[#8fcdd9]"
          >
            {generationStatus === 'running'
              ? '暂停生成'
              : generationStatus === 'paused'
                ? '继续生成'
                : generationStatus === 'complete'
                  ? '设定已生成'
                  : '开始生成设定'}
          </button>
          <button type="button" onClick={onClear} className="h-10 rounded-md border border-[#d85b5b] bg-white text-sm font-medium text-[#c74848]">
            一键清空
          </button>
          <button type="button" onClick={onCheck} className="h-10 rounded-md border border-[#08AACE] bg-white text-sm font-medium text-[#078FAB]">
            一键检查
          </button>
        </div>

        {checkMessage ? (
          <div className={allComplete ? 'mt-4 rounded-md bg-[#edf9f6] px-3 py-3 text-sm text-[#247a65]' : 'mt-4 rounded-md bg-amber-50 px-3 py-3 text-sm text-amber-700'}>
            {checkMessage}
          </div>
        ) : null}

        <div className="mt-auto border-t border-[#dce1e8] pt-4">
          <button
            type="button"
            disabled={!allComplete}
            onClick={onEnterCreation}
            className="h-11 w-full rounded-md bg-[#08AACE] text-sm font-semibold text-white hover:bg-[#078FAB] disabled:cursor-not-allowed disabled:bg-[#cbd3d9]"
          >
            进入创作阶段
          </button>
        </div>
      </aside>
    </div>
  );
}
