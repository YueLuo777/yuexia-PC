import { RefreshCw } from 'lucide-react';

import { AppModalShell } from '@/shared/ui/AppModalShell';

import {
  type FullCardSettings,
  colorOptions,
  defaultBtnColors,
  defaultBtnOrder,
  defaultCardSettings,
  PillSegmentButton,
  PillSegmentGroup,
} from './NovelLibraryParts';

export function CardSettingsModal({
  isOpen,
  settings,
  onClose,
  onChange,
}: {
  isOpen: boolean;
  settings: FullCardSettings;
  onClose: () => void;
  onChange: (next: FullCardSettings) => void;
}) {
  if (!isOpen) return null;

  const totalSlots = settings.btnPerRow * settings.btnRows;
  const slots = settings.btnOrder.slice(0, totalSlots);
  while (slots.length < totalSlots) slots.push('');

  return (
    <AppModalShell
      title="作品卡片设置"
      subtitle="调整尺寸、文字、按钮排列，实时预览效果"
      isOpen={isOpen}
      onClose={onClose}
      widthClass="w-[720px]"
      heightClass="h-[580px] max-h-[90vh]"
      storageId="novel_card_settings"
    >
        <div className="flex flex-1 overflow-hidden">
          <div className="flex-1 space-y-4 overflow-y-auto border-r border-gray-100 p-5">
            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">卡片尺寸</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">卡片宽度</label>
                  <PillSegmentGroup>
                    {(['small', 'medium', 'large'] as const).map((value, index) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, cardWidth: value })}
                        active={settings.cardWidth === value}
                      >
                        {['小', '中', '大'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">封面高度</label>
                  <PillSegmentGroup>
                    {(['small', 'medium', 'large'] as const).map((value, index) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, coverHeight: value })}
                        active={settings.coverHeight === value}
                      >
                        {['小', '中', '大'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">文字设置</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">统计文字</label>
                  <PillSegmentGroup>
                    {(['small', 'medium', 'large'] as const).map((value, index) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, statFontSize: value })}
                        active={settings.statFontSize === value}
                      >
                        {['小', '中', '大'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">按钮文字</label>
                  <PillSegmentGroup>
                    {(['small', 'medium', 'large'] as const).map((value, index) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, buttonFontSize: value })}
                        active={settings.buttonFontSize === value}
                      >
                        {['小', '中', '大'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">按钮字重</label>
                  <PillSegmentGroup>
                    {(['normal', 'bold'] as const).map((value, index) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, buttonFontWeight: value })}
                        active={settings.buttonFontWeight === value}
                      >
                        {['常规', '粗体'][index]}
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
              </div>
            </div>

            <div>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">按钮设置</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">每行按钮</label>
                  <PillSegmentGroup>
                    {[2, 3].map((value) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, btnPerRow: value as 2 | 3 })}
                        active={settings.btnPerRow === value}
                      >
                        {value}个
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-600">按钮行数</label>
                  <PillSegmentGroup>
                    {[1, 2, 3].map((value) => (
                      <PillSegmentButton
                        key={value}
                        onClick={() => onChange({ ...settings, btnRows: value as 1 | 2 | 3 })}
                        active={settings.btnRows === value}
                      >
                        {value}行
                      </PillSegmentButton>
                    ))}
                  </PillSegmentGroup>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-[280px] flex-col gap-3 overflow-y-auto bg-gray-50/50 p-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">
                拖拽填空（{settings.btnRows}行×{settings.btnPerRow}个）
              </label>
              <div className="mx-auto flex w-[240px] flex-col rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                <div
                  className="grid gap-1.5"
                  style={{ gridTemplateColumns: `repeat(${settings.btnPerRow}, 1fr)`, gridAutoRows: '36px' }}
                >
                  {slots.map((label, index) => (
                    <div
                      key={index}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault();
                        const dragLabel = event.dataTransfer.getData('text/plain');
                        if (!dragLabel) return;
                        const newOrder = [...settings.btnOrder];
                        while (newOrder.length < totalSlots) newOrder.push('');
                        const oldLabel = newOrder[index];
                        const dragIndex = newOrder.indexOf(dragLabel);
                        if (dragIndex >= 0) newOrder[dragIndex] = oldLabel;
                        newOrder[index] = dragLabel;
                        while (newOrder.length > 0 && newOrder[newOrder.length - 1] === '') newOrder.pop();
                        onChange({ ...settings, btnOrder: newOrder });
                      }}
                      className={`flex h-full items-center justify-center rounded text-center text-sm transition-all ${
                        label
                          ? `${label === '删除' ? 'bg-red-500 text-white' : 'bg-brand text-white'} cursor-move`
                          : 'border border-dashed border-gray-300 bg-gray-50 text-gray-300'
                      }`}
                      draggable={!!label}
                      onDragStart={(event) => {
                        if (label) event.dataTransfer.setData('text/plain', label);
                      }}
                    >
                      {label || '空'}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">按钮池（拖拽到上方）</label>
              <div className="grid grid-cols-3 gap-1">
                {defaultBtnOrder.map((label) => (
                  <div
                    key={label}
                    draggable
                    onDragStart={(event) => {
                      event.dataTransfer.setData('text/plain', label);
                      event.dataTransfer.effectAllowed = 'copy';
                    }}
                    className={`cursor-grab select-none rounded py-2 text-center text-sm transition-opacity hover:opacity-80 active:cursor-grabbing ${label === '删除' ? 'bg-red-500 text-white' : 'bg-brand text-white'}`}
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-600">颜色</label>
              <div className="space-y-1">
                {settings.btnOrder
                  .slice(0, settings.btnPerRow * settings.btnRows)
                  .filter(Boolean)
                  .map((label) => (
                    <div key={label} className="flex items-center gap-1.5">
                      <span className="w-10 truncate text-xs text-gray-500">{label}</span>
                      <div className="flex flex-1 gap-0.5">
                        {colorOptions.map((option) => (
                          <button
                            key={`${label}-${option.value}`}
                            onClick={() =>
                              onChange({ ...settings, btnColors: { ...settings.btnColors, [label]: option.value } })
                            }
                            className={`h-3.5 w-3.5 rounded-full border transition-all ${(settings.btnColors[label] || 'gray') === option.value ? 'scale-110 border-gray-800' : 'border-transparent hover:scale-110'}`}
                            style={{
                              backgroundColor:
                                option.value === 'blue' ? '#1E71EF' : option.value === 'red' ? '#EF4444' : '#9CA3AF',
                            }}
                            title={option.label}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 bg-gray-50/50 px-6 py-3">
          <button
            onClick={() =>
              onChange({ ...defaultCardSettings, btnOrder: [...defaultBtnOrder], btnColors: { ...defaultBtnColors } })
            }
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-white"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            恢复默认
          </button>
          <button onClick={onClose} className="rounded-lg bg-brand px-6 py-2 text-sm text-white hover:bg-brand-dark">
            完成
          </button>
        </div>
    </AppModalShell>
  );
}
