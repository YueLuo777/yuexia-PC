import { useEffect, useMemo, useState } from 'react';

import {
  SMART_TEMPLATE_PRESETS,
  sortSmartTemplatePresetsForDisplay,
} from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import type {
  SavedTemplateApplicability,
  SavedTemplateChannel,
  SavedTemplateClassification,
} from '@/features/workbench/model/standardModeTemplateModel';
import { AppModalShell } from '@/shared/ui/AppModalShell';

export type TemplateCreationChoice = SavedTemplateClassification & {
  baseMode: 'empty' | 'preset';
  suggestedName: string;
};

const CHANNEL_LABELS: Record<SavedTemplateChannel, string> = {
  male: '男频',
  female: '女频',
};

function getGenreOptions(channel: SavedTemplateChannel) {
  return [...new Set(
    SMART_TEMPLATE_PRESETS
      .filter((preset) => preset.genreCategory !== '通用' && (preset.channel === channel || preset.channel === 'general'))
      .map((preset) => preset.genreCategory),
  )];
}

export function TemplateCreateDialog({
  isOpen,
  onClose,
  onCreate,
}: {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (choice: TemplateCreationChoice) => void;
}) {
  const [channel, setChannel] = useState<SavedTemplateChannel>('male');
  const [applicability, setApplicability] = useState<SavedTemplateApplicability>('genre');
  const genreOptions = useMemo(() => getGenreOptions(channel), [channel]);
  const [genreCategory, setGenreCategory] = useState('玄幻仙侠');
  const [baseMode, setBaseMode] = useState<'empty' | 'preset'>('preset');
  const [basePresetId, setBasePresetId] = useState('male-fantasy-xianxia-light');
  const basePresets = useMemo(() => sortSmartTemplatePresetsForDisplay(
    SMART_TEMPLATE_PRESETS.filter((preset) => applicability === 'general'
      ? preset.genreCategory === '通用'
      : preset.genreCategory === genreCategory && (preset.channel === channel || preset.channel === 'general')),
  ), [applicability, channel, genreCategory]);

  useEffect(() => {
    if (!isOpen) return;
    setChannel('male');
    setApplicability('genre');
    setGenreCategory('玄幻仙侠');
    setBaseMode('preset');
    setBasePresetId('male-fantasy-xianxia-light');
  }, [isOpen]);

  useEffect(() => {
    if (!genreOptions.includes(genreCategory)) setGenreCategory(genreOptions[0] ?? '通用');
  }, [genreCategory, genreOptions]);

  useEffect(() => {
    if (baseMode !== 'preset') return;
    if (!basePresets.some((preset) => preset.id === basePresetId)) {
      setBasePresetId(basePresets[0]?.id ?? '');
    }
  }, [baseMode, basePresetId, basePresets]);

  const create = () => {
    const selectedGenre = applicability === 'general' ? '通用' : genreCategory;
    const selectedPreset = baseMode === 'preset'
      ? basePresets.find((preset) => preset.id === basePresetId)
      : undefined;
    onCreate({
      channel,
      applicability,
      genreCategory: selectedGenre,
      baseMode,
      ...(selectedPreset ? { basePresetId: selectedPreset.id } : null),
      suggestedName: selectedPreset
        ? `${selectedPreset.title}扩展`
        : `${CHANNEL_LABELS[channel]}${selectedGenre}空模板`,
    });
  };

  return (
    <AppModalShell
      title="新建我的模板"
      subtitle="先确定模板用途，再选择空模板或内置模板作为起点"
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[900px]"
      heightClass="h-auto max-h-[86vh]"
      contentClassName="flex min-h-0 flex-1 flex-col overflow-hidden"
      storageId="template-create-dialog"
      centerOnOpen
    >
      <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5">
        <ChoiceSection number="1" title="选择类型">
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="模板类型">
            {(['male', 'female'] as const).map((item) => (
              <ChoiceButton
                key={item}
                active={channel === item}
                title={CHANNEL_LABELS[item]}
                description={item === 'male' ? '用于男频作品和男频通用模板' : '用于女频作品和女频通用模板'}
                onClick={() => setChannel(item)}
              />
            ))}
          </div>
        </ChoiceSection>

        <ChoiceSection number="2" title="选择适用范围">
          <div className="grid grid-cols-2 gap-3" role="group" aria-label="模板适用范围">
            <ChoiceButton
              active={applicability === 'genre'}
              title="按题材"
              description="只用于指定题材，例如玄幻仙侠、都市或现代言情"
              onClick={() => setApplicability('genre')}
            />
            <ChoiceButton
              active={applicability === 'general'}
              title={`${CHANNEL_LABELS[channel]}通用`}
              description={`适用于所有${CHANNEL_LABELS[channel]}题材，但不会与另一频道混用`}
              onClick={() => setApplicability('general')}
            />
          </div>
          {applicability === 'genre' ? (
            <label className="mt-3 block text-sm font-bold text-slate-700">
              题材
              <select
                aria-label="模板题材"
                value={genreCategory}
                onChange={(event) => setGenreCategory(event.target.value)}
                className="mt-2 h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
              >
                {genreOptions.map((genre) => <option key={genre} value={genre}>{genre}</option>)}
              </select>
            </label>
          ) : null}
        </ChoiceSection>

        <ChoiceSection number="3" title="选择起点">
          <div className="grid grid-cols-2 gap-3">
            <ChoiceButton
              active={baseMode === 'empty'}
              title="新建空模板"
              description="从零开始，创建后自行新增一级至四级设定"
              onClick={() => setBaseMode('empty')}
            />
            {basePresets.map((preset) => (
              <ChoiceButton
                key={preset.id}
                active={baseMode === 'preset' && basePresetId === preset.id}
                title={`基于：${preset.title}`}
                description={preset.description}
                onClick={() => {
                  setBaseMode('preset');
                  setBasePresetId(preset.id);
                }}
              />
            ))}
          </div>
        </ChoiceSection>
      </div>

      <footer className="flex shrink-0 items-center justify-end gap-3 border-t border-slate-200 bg-slate-50 px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="h-10 rounded-md border border-slate-300 bg-white px-5 text-sm font-bold text-slate-600 hover:border-slate-400"
        >
          取消
        </button>
        <button
          type="button"
          onClick={create}
          disabled={baseMode === 'preset' && !basePresets.some((preset) => preset.id === basePresetId)}
          className="h-10 rounded-md bg-[#08AACE] px-5 text-sm font-black text-white hover:bg-[#0797B8] disabled:bg-slate-200 disabled:text-slate-400"
        >
          创建模板
        </button>
      </footer>
    </AppModalShell>
  );
}

function ChoiceSection({
  number,
  title,
  children,
}: {
  number: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 flex items-center gap-2 text-sm font-black text-slate-800">
        <span className="grid h-6 w-6 place-items-center rounded-full bg-[#08AACE] text-xs text-white">{number}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function ChoiceButton({
  active,
  title,
  description,
  onClick,
}: {
  active: boolean;
  title: string;
  description: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={`min-h-20 rounded-lg border p-3 text-left transition-colors ${
        active
          ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
          : 'border-slate-200 bg-white hover:border-[#9DDFEA] hover:bg-[#F8FDFF]'
      }`}
    >
      <strong className="block text-sm font-black text-slate-800">{title}</strong>
      <span className="mt-1 block text-xs font-semibold leading-5 text-slate-500">{description}</span>
    </button>
  );
}
