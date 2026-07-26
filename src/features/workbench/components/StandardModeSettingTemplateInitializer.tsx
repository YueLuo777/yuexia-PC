import { useMemo, useState } from 'react';

import {
  SMART_TEMPLATE_PRESETS,
  cloneSmartTemplateStructure,
  recommendTemplateForNovelCategory,
} from '@/features/workbench/model/standardModeSmartSettingFlowModel';
import {
  readSavedSettingTemplates,
  saveSettingTemplate,
  summarizeTemplate,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';

import { StandardModeTemplateMindMap } from './StandardModeTemplateMindMap';

type ConfirmedTemplate = {
  id: string;
  name: string;
  structure: TemplateStructure;
};

type StandardModeSettingTemplateInitializerProps = {
  novelTitle: string;
  novelCategory: string;
  replacingExisting: boolean;
  onConfirm: (template: ConfirmedTemplate) => void;
};

export function StandardModeSettingTemplateInitializer({
  novelTitle,
  novelCategory,
  replacingExisting,
  onConfirm,
}: StandardModeSettingTemplateInitializerProps) {
  const recommended = useMemo(() => recommendTemplateForNovelCategory(novelCategory), [novelCategory]);
  const [selectedTemplateId, setSelectedTemplateId] = useState(recommended.id);
  const [selectedTemplateName, setSelectedTemplateName] = useState(recommended.title);
  const [structure, setStructure] = useState(() => cloneSmartTemplateStructure(recommended.structure));
  const [savedTemplates, setSavedTemplates] = useState(readSavedSettingTemplates);
  const [saveName, setSaveName] = useState(`${novelTitle}模板`);
  const stats = useMemo(() => summarizeTemplate(structure), [structure]);
  const visiblePresets = SMART_TEMPLATE_PRESETS.filter((preset) =>
    preset.channel === recommended.channel || preset.channel === 'general',
  );

  const selectBuiltIn = (id: string) => {
    const preset = SMART_TEMPLATE_PRESETS.find((item) => item.id === id);
    if (!preset) return;
    setSelectedTemplateId(preset.id);
    setSelectedTemplateName(preset.title);
    setStructure(cloneSmartTemplateStructure(preset.structure));
  };

  const selectSaved = (id: string) => {
    const template = savedTemplates.find((item) => item.id === id);
    if (!template) return;
    setSelectedTemplateId(template.id);
    setSelectedTemplateName(template.name);
    setSaveName(template.name);
    setStructure(cloneSmartTemplateStructure(template.structure));
  };

  return (
    <main className="flex min-h-0 flex-1 flex-col overflow-hidden bg-white" data-standard-setting-initializer="true">
      <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-6 py-3">
        <div>
          <div className="text-sm font-bold text-slate-800">
            已根据“{novelCategory || '玄幻'}”推荐“{recommended.title}”
          </div>
          <div className="mt-1 text-xs font-semibold text-slate-500">
            当前作品：{novelTitle}。可以更换模板，也可以直接修改模板节点。
          </div>
          {replacingExisting ? (
            <div className="mt-1 text-xs font-bold text-red-500">确认新模板后，现有设定内容会重新创建。</div>
          ) : null}
        </div>
        <div className="flex gap-3 text-xs font-bold text-slate-500">
          <span>{stats.domainCount} 个分类</span>
          <span>{stats.groupCount} 个分组</span>
          <span>{stats.entryCount} 个设定</span>
          <span>{stats.sectionCount} 个内部分类</span>
          <span>{stats.fieldCount} 个子设定</span>
        </div>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-y-auto border-r border-slate-200 bg-[#F7F9FB] p-4">
          <div className="mb-3 text-sm font-bold">推荐模板</div>
          <div className="space-y-2">
            {visiblePresets.map((preset) => (
              <button
                key={preset.id}
                type="button"
                aria-label={`选择内置模板：${preset.title}`}
                aria-pressed={selectedTemplateId === preset.id}
                onClick={() => selectBuiltIn(preset.id)}
                className={`w-full rounded-md border px-3 py-3 text-left ${
                  selectedTemplateId === preset.id
                    ? 'border-[#08AACE] bg-[#EAF9FD] shadow-[0_0_0_1px_#08AACE]'
                    : 'border-slate-200 bg-white hover:border-[#9DDFEA]'
                }`}
              >
                <strong className="block text-sm">{preset.title}</strong>
                <span className="mt-1.5 block text-xs font-medium leading-5 text-slate-500">{preset.description}</span>
              </button>
            ))}
          </div>
          <div className="mb-3 mt-6 border-t border-slate-200 pt-4 text-sm font-bold">我的模板</div>
          {savedTemplates.length === 0 ? (
            <div className="text-xs font-semibold text-slate-400">还没有保存的模板。</div>
          ) : (
            <div className="space-y-2">
              {savedTemplates.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  aria-label={`选择我的模板：${template.name}`}
                  aria-pressed={selectedTemplateId === template.id}
                  onClick={() => selectSaved(template.id)}
                  className={`w-full rounded-md border px-3 py-3 text-left text-sm font-bold ${
                    selectedTemplateId === template.id ? 'border-[#08AACE] bg-[#EAF9FD]' : 'border-slate-200 bg-white'
                  }`}
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}
        </aside>

        <StandardModeTemplateMindMap
          key={selectedTemplateId}
          structure={structure}
          initialActiveDomainId={structure[0]?.id}
          onChange={setStructure}
        />
      </div>

      <footer className="grid shrink-0 grid-cols-[minmax(180px,1fr)_auto_auto] items-center gap-3 border-t border-slate-200 bg-white px-5 py-3">
        <input
          aria-label="保存模板名称"
          value={saveName}
          onChange={(event) => setSaveName(event.target.value)}
          placeholder="输入模板名称"
          className="h-10 rounded-md border border-slate-300 px-3 text-sm font-semibold outline-none focus:border-[#08AACE]"
        />
        <button
          type="button"
          onClick={() => {
            const name = saveName.trim() || '未命名模板';
            const next = saveSettingTemplate(name, structure);
            setSavedTemplates(next);
            setSelectedTemplateId(next[0].id);
            setSelectedTemplateName(name);
          }}
          className="h-10 rounded-md border border-[#08AACE] bg-white px-5 text-sm font-bold text-[#078FAB]"
        >
          保存到我的模板
        </button>
        <button
          type="button"
          onClick={() => onConfirm({ id: selectedTemplateId, name: selectedTemplateName, structure })}
          className="h-10 rounded-md bg-[#08AACE] px-6 text-sm font-bold text-white"
        >
          确认模板并创建设定
        </button>
      </footer>
    </main>
  );
}
