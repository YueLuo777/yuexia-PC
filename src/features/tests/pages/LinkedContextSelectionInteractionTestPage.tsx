import { Check, ChevronDown, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';

type TestMaterial = {
  id: string;
  group: string;
  title: string;
  content: string;
};

const materials: TestMaterial[] = [
  {
    id: 'world',
    group: '核心设定',
    title: '世界观',
    content: '蓝星进入高武时代三十年后，城市表面霓虹繁华，地下却被武馆联盟、财阀资本、军方机构和异域裂隙共同切割。每个人从学生时代就被气血检测决定前途，武者阶层凌驾普通人之上，底层只能靠卖命、陪练、跑墟活着。',
  },
  {
    id: 'pain-system',
    group: '核心设定',
    title: '痛觉转化系统',
    content: '主角在濒死训练中觉醒痛觉转化系统，每承受一次真实伤害，都能把痛苦转化为气血、筋骨强度、神经反应或战斗经验。但系统不会免疫伤害，主角必须在真实疼痛中判断风险。',
  },
  {
    id: 'plot-main',
    group: '主线剧情',
    title: '剧情大纲',
    content: '主角从地下训练场陪练开始，被迫卷入赵氏集团和武馆联盟的资源争夺。前期靠痛觉转化系统完成反向突破，中期揭开地下裂隙与财阀实验的关系，后期进入更高层武道学院和异域前线。',
  },
  {
    id: 'rank',
    group: '等级体系',
    title: '修炼境界',
    content: '气血武徒、锻骨武者、开脉武师、罡劲宗师、裂隙行者、天门武圣。每一阶不仅是数值提升，还会改变身体承载极限和战场角色。',
  },
];

function countWords(text: string) {
  return text.replace(/\s/g, '').length;
}

export function LinkedContextSelectionInteractionTestPage() {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(['world']));
  const [previewId, setPreviewId] = useState('world');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [events, setEvents] = useState<string[]>(['初始：已关联「世界观」，右侧预览「世界观」。']);

  const previewItem = materials.find((item) => item.id === previewId) ?? materials[0];
  const selectedItems = materials.filter((item) => selectedIds.has(item.id));
  const selectedWordCount = selectedItems.reduce((sum, item) => sum + countWords(item.content), 0);
  const groups = useMemo(() => {
    const map = new Map<string, TestMaterial[]>();
    materials.forEach((item) => {
      map.set(item.group, [...(map.get(item.group) ?? []), item]);
    });
    return Array.from(map.entries()).map(([group, items]) => ({ group, items }));
  }, []);

  const pushEvent = (message: string) => {
    setEvents((current) => [message, ...current].slice(0, 6));
  };

  const toggleItem = (item: TestMaterial) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(item.id)) {
        next.delete(item.id);
        pushEvent(`取消关联：「${item.title}」。`);
      } else {
        next.add(item.id);
        pushEvent(`关联：「${item.title}」。`);
      }
      return next;
    });
  };

  const previewOnly = (item: TestMaterial) => {
    setPreviewId(item.id);
    pushEvent(`只预览：「${item.title}」，没有改变关联状态。`);
  };

  const toggleGroup = (items: TestMaterial[]) => {
    const allSelected = items.every((item) => selectedIds.has(item.id));
    setSelectedIds((current) => {
      const next = new Set(current);
      items.forEach((item) => {
        if (allSelected) next.delete(item.id);
        else next.add(item.id);
      });
      return next;
    });
    pushEvent(`${allSelected ? '取消关联分组' : '关联分组'}：${items[0]?.group ?? '未分类'}。`);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-slate-50 p-5">
      <header className="mb-4 shrink-0">
        <div className="text-xs font-black text-[#08AACE]">交互方案测试</div>
        <h1 className="mt-1 text-2xl font-black text-slate-950">关联资料：预览和勾选分离</h1>
        <p className="mt-2 text-sm font-bold text-slate-500">
          测试目标：点击条目主体只查看右侧预览；只有点击小勾选框或右侧按钮，才改变关联状态。
        </p>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[300px_minmax(0,1fr)_320px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <aside className="min-h-0 border-r border-slate-100 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between gap-2 px-2">
            <div className="min-w-0 truncate text-[15px] font-black text-slate-400">设定导航</div>
            <button
              type="button"
              onClick={() => {
                const allSelected = materials.every((item) => selectedIds.has(item.id));
                setSelectedIds(allSelected ? new Set() : new Set(materials.map((item) => item.id)));
                pushEvent(allSelected ? '取消关联全部设定。' : '关联全部设定。');
              }}
              className="h-8 shrink-0 rounded-xl border border-[#08AACE] bg-white px-3 text-xs font-black text-[#08AACE] hover:bg-[#EAF9FD]"
            >
              关联所有
            </button>
          </div>

          <div className="editor-scrollbar h-full space-y-1 overflow-y-auto pb-8">
            {groups.map((group) => {
              const collapsed = collapsedGroups[group.group] ?? false;
              return (
                <div className="rounded-xl border border-[#cceef6] bg-white p-1">
                  <button
                    type="button"
                    onClick={() => setCollapsedGroups((current) => ({ ...current, [group.group]: !collapsed }))}
                    className="flex h-10 w-full items-center justify-between gap-2 rounded-lg bg-[#E6F7FB] px-2 text-left text-[15px] font-black text-slate-700 hover:bg-[#d7f1f8]"
                  >
                    <span className="min-w-0 truncate">{group.group}</span>
                    <span className="flex shrink-0 items-center gap-1 text-[13px] text-slate-400">
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          toggleGroup(group.items);
                        }}
                        onKeyDown={(event) => {
                          if (event.key !== 'Enter' && event.key !== ' ') return;
                          event.preventDefault();
                          event.stopPropagation();
                          toggleGroup(group.items);
                        }}
                        className="rounded-md bg-white px-1.5 py-0.5 text-[11px] font-black text-[#08AACE] hover:bg-[#EAF9FD]"
                      >
                        全选
                      </span>
                      {group.items.length}
                      {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                    </span>
                  </button>

                  {!collapsed && (
                    <div className="mt-1 space-y-1 bg-white">
                      {group.items.map((item) => {
                        const checked = selectedIds.has(item.id);
                        const active = previewItem.id === item.id;
                        return (
                          <button
                            type="button"
                            onClick={() => previewOnly(item)}
                            className={
                              'flex h-10 w-full items-center gap-2 rounded-lg px-2 text-left text-[15px] font-black ' +
                              (active ? 'bg-[#FFF7ED] text-gray-900' : 'bg-white text-slate-500 hover:bg-slate-50 hover:text-slate-800')
                            }
                          >
                            <span
                              role="checkbox"
                              aria-checked={checked}
                              tabIndex={0}
                              onClick={(event) => {
                                event.stopPropagation();
                                setPreviewId(item.id);
                                toggleItem(item);
                              }}
                              onKeyDown={(event) => {
                                if (event.key !== 'Enter' && event.key !== ' ') return;
                                event.preventDefault();
                                event.stopPropagation();
                                setPreviewId(item.id);
                                toggleItem(item);
                              }}
                              className={
                                'grid h-4 w-4 shrink-0 place-items-center rounded border text-[10px] ' +
                                (checked ? 'border-[#08AACE] bg-[#08AACE] text-white' : 'border-slate-300 bg-white text-transparent')
                              }
                            >
                              <Check className="h-3 w-3" />
                            </span>
                            <span className="min-w-0 truncate">{item.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        <section className="min-h-0 p-5">
          <article
            className={
              'flex h-full min-h-0 flex-col rounded-2xl border px-5 py-4 ' +
              (selectedIds.has(previewItem.id) ? 'border-[#08AACE] bg-[#FFF7ED] text-slate-900' : 'border-gray-100 bg-gray-50 text-gray-600')
            }
          >
            <div className="mb-3 flex shrink-0 items-start justify-between gap-4">
              <div className="flex min-w-0 items-center gap-2">
                <button
                  type="button"
                  onClick={() => toggleItem(previewItem)}
                  className={
                    'grid h-7 shrink-0 place-items-center rounded-xl border px-3 text-xs font-black ' +
                    (selectedIds.has(previewItem.id)
                      ? 'border-[#08AACE] bg-[#08AACE] text-white'
                      : 'border-slate-300 bg-white text-slate-600 hover:border-[#08AACE] hover:text-[#08AACE]')
                  }
                >
                  {selectedIds.has(previewItem.id) ? '已关联' : '关联此项'}
                </button>
                <h2 className="truncate text-lg font-black text-slate-900">{previewItem.title}</h2>
                <span className="shrink-0 rounded-full bg-white px-2 py-0.5 text-xs font-black text-[#08AACE]">{previewItem.group}</span>
              </div>
              <span className="shrink-0 text-sm font-black text-[#08AACE]">{countWords(previewItem.content)} 字</span>
            </div>
            <div className="editor-scrollbar min-h-0 flex-1 overflow-y-auto whitespace-pre-wrap break-words pr-2 text-sm font-semibold leading-7 text-slate-600">
              {previewItem.content}
            </div>
          </article>
        </section>

        <aside className="min-h-0 border-l border-slate-100 bg-slate-50 p-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-black text-slate-400">读取统计</div>
            <div className="mt-2 text-2xl font-black text-slate-950">{selectedItems.length} 项</div>
            <div className="mt-1 text-sm font-bold text-[#08AACE]">{selectedWordCount} 字</div>
          </div>
          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-black text-slate-400">操作日志</div>
            <div className="mt-3 space-y-2">
              {events.map((event) => (
                <div className="rounded-xl bg-slate-50 px-3 py-2 text-xs font-bold leading-5 text-slate-600">
                  {event}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default LinkedContextSelectionInteractionTestPage;
