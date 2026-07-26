import { useEffect, useLayoutEffect, useRef, useState } from 'react';

import { ConfirmDialog } from '@/shared/ui/ConfirmDialog';

import {
  addTemplateDomain,
  addTemplateEntry,
  addTemplateField,
  addTemplateGroup,
  addTemplateSection,
  deleteTemplateNode,
  renameTemplateNode,
  type TemplateStructure,
} from '@/features/workbench/model/standardModeTemplateModel';
import {
  StandardModeTemplateNodeWorkbench,
  type TemplateMindMapSelection,
} from './StandardModeTemplateNodeWorkbench';
import { StandardModeTemplateDomainOverview } from './StandardModeTemplateDomainOverview';

type PendingDelete = {
  selection: Exclude<TemplateMindMapSelection, { kind: 'root' }>;
  title: string;
};

type StandardModeTemplateMindMapProps = {
  structure: TemplateStructure;
  onChange: (structure: TemplateStructure) => void;
  initialActiveDomainId?: string;
};

export function StandardModeTemplateMindMap({
  structure,
  onChange,
  initialActiveDomainId = '',
}: StandardModeTemplateMindMapProps) {
  const initialDomainId = initialActiveDomainId || structure[0]?.id || '';
  const [selection, setSelection] = useState<TemplateMindMapSelection>(() => initialDomainId
    ? { kind: 'domain', domainId: initialDomainId }
    : { kind: 'root' });
  const [activeDomainId, setActiveDomainId] = useState(initialDomainId);
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const [dragging, setDragging] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const dragMovedRef = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const panStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (activeDomainId && !structure.some((domain) => domain.id === activeDomainId)) {
      setActiveDomainId('');
    }
    if (selection.kind === 'root') return;
    if (!structure.some((domain) => domain.id === selection.domainId)) {
      setSelection({ kind: 'root' });
    }
  }, [activeDomainId, selection, structure]);

  const activeDomain = structure.find((domain) => domain.id === activeDomainId);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    const content = contentRef.current;
    if (!canvas || !content) return;

    const alignVisiblePath = () => {
      const targetZoom = activeDomain
        ? Math.max(0.45, Math.min(1, (canvas.clientWidth - 48) / content.scrollWidth))
        : 1;
      zoomRef.current = targetZoom;
      setZoom(targetZoom);
      setPan({
        x: canvas.clientWidth / 2 - content.scrollWidth * targetZoom / 2,
        y: activeDomain ? 16 : 0,
      });
    };

    alignVisiblePath();
    const frame = window.requestAnimationFrame(alignVisiblePath);
    const settledLayoutTimer = window.setTimeout(() => {
      alignVisiblePath();
    }, 120);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(settledLayoutTimer);
    };
  }, [activeDomain, activeDomainId, structure]);

  const requestDelete = (nextSelection: PendingDelete['selection'], title: string) => {
    setPendingDelete({ selection: nextSelection, title });
  };

  const addDomain = (title: string) => {
    const result = addTemplateDomain(structure);
    onChange(renameTemplateNode(result.structure, { domainId: result.domain.id }, title));
    setActiveDomainId(result.domain.id);
    setSelection({ kind: 'domain', domainId: result.domain.id });
  };

  const addGroup = (domainId: string, title: string) => {
    const result = addTemplateGroup(structure, domainId);
    onChange(renameTemplateNode(
      result.structure,
      { domainId, groupId: result.group.id },
      title,
    ));
    setSelection({ kind: 'group', domainId, groupId: result.group.id });
  };

  const addEntry = (domainId: string, groupId: string, title: string) => {
    const result = addTemplateEntry(structure, domainId, groupId);
    onChange(renameTemplateNode(result.structure, {
      domainId,
      groupId,
      entryId: result.entry.id,
    }, title));
    setSelection({ kind: 'entry', domainId, groupId, entryId: result.entry.id });
  };

  const addSection = (domainId: string, groupId: string, entryId: string, title: string) => {
    const result = addTemplateSection(structure, domainId, groupId, entryId);
    onChange(renameTemplateNode(result.structure, {
      domainId,
      groupId,
      entryId,
      sectionId: result.section.id,
    }, title));
    setSelection({ kind: 'section', domainId, groupId, entryId, sectionId: result.section.id });
  };

  const addField = (domainId: string, groupId: string, entryId: string, sectionId: string, title: string) => {
    const result = addTemplateField(structure, domainId, groupId, entryId, sectionId);
    onChange(renameTemplateNode(result.structure, {
      domainId,
      groupId,
      entryId,
      sectionId,
      fieldId: result.field.id,
    }, title));
    setSelection({ kind: 'field', domainId, groupId, entryId, sectionId, fieldId: result.field.id });
  };

  const confirmDelete = () => {
    if (!pendingDelete) return;
    onChange(deleteTemplateNode(structure, pendingDelete.selection));
    const removed = pendingDelete.selection;
    if (removed.kind === 'domain') {
      setActiveDomainId('');
      setSelection({ kind: 'root' });
    }
    if (removed.kind === 'group') setSelection({ kind: 'domain', domainId: removed.domainId });
    if (removed.kind === 'entry') {
      setSelection({ kind: 'group', domainId: removed.domainId, groupId: removed.groupId });
    }
    if (removed.kind === 'section') {
      setSelection({
        kind: 'entry',
        domainId: removed.domainId,
        groupId: removed.groupId,
        entryId: removed.entryId,
      });
    }
    if (removed.kind === 'field') {
      setSelection({
        kind: 'section',
        domainId: removed.domainId,
        groupId: removed.groupId,
        entryId: removed.entryId,
        sectionId: removed.sectionId,
      });
    }
    setPendingDelete(null);
  };

  const renameSelectedNode = (title: string) => {
    if (selection.kind === 'root') return;
    onChange(renameTemplateNode(structure, selection, title));
  };

  const addSiblingNode = (title: string) => {
    if (selection.kind === 'domain') addDomain(title);
    if (selection.kind === 'group') addGroup(selection.domainId, title);
    if (selection.kind === 'entry') addEntry(selection.domainId, selection.groupId, title);
    if (selection.kind === 'section') addSection(selection.domainId, selection.groupId, selection.entryId, title);
    if (selection.kind === 'field') {
      addField(selection.domainId, selection.groupId, selection.entryId, selection.sectionId, title);
    }
  };

  const addChildNode = (title: string) => {
    if (selection.kind === 'root') addDomain(title);
    if (selection.kind === 'domain') addGroup(selection.domainId, title);
    if (selection.kind === 'group') addEntry(selection.domainId, selection.groupId, title);
    if (selection.kind === 'entry') addSection(selection.domainId, selection.groupId, selection.entryId, title);
    if (selection.kind === 'section') {
      addField(selection.domainId, selection.groupId, selection.entryId, selection.sectionId, title);
    }
  };

  const requestSelectedDelete = () => {
    if (selection.kind === 'root') return;
    const targetTitle = (() => {
      const domain = structure.find((item) => item.id === selection.domainId);
      if (!domain || selection.kind === 'domain') return domain?.title ?? '当前分类';
      const group = domain.groups.find((item) => item.id === selection.groupId);
      if (!group || selection.kind === 'group') return group?.title ?? '当前分组';
      const entry = group.entries.find((item) => item.id === selection.entryId);
      if (!entry || selection.kind === 'entry') return entry?.title ?? '当前设定';
      const section = entry.sections.find((item) => item.id === selection.sectionId);
      if (!section || selection.kind === 'section') return section?.title ?? '当前分类';
      return section.fields.find((item) => item.id === selection.fieldId)?.title ?? '当前子设定';
    })();
    requestDelete(selection, targetTitle);
  };

  const renderActiveDomain = () => {
    if (!activeDomain) return null;
    return activeDomain.groups.map((group) => (
      <StandardModeTemplateDomainOverview
        key={group.id}
        domain={activeDomain}
        group={group}
        selection={selection}
        onSelectGroup={() => setSelection({
          kind: 'group',
          domainId: activeDomain.id,
          groupId: group.id,
        })}
        onSelectEntry={(entry) => setSelection({
          kind: 'entry',
          domainId: activeDomain.id,
          groupId: group.id,
          entryId: entry.id,
        })}
        onSelectSection={(entry, section) => setSelection({
          kind: 'section',
          domainId: activeDomain.id,
          groupId: group.id,
          entryId: entry.id,
          sectionId: section.id,
        })}
        onSelectField={(entry, section, field) => setSelection({
          kind: 'field',
          domainId: activeDomain.id,
          groupId: group.id,
          entryId: entry.id,
          sectionId: section.id,
          fieldId: field.id,
        })}
      />
    ));
  };

  return (
    <div className="flex min-h-0 flex-1 overflow-hidden bg-[#F8FAFB]" data-testid="template-mind-map">
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <nav
          aria-label="设定一级分类"
          className="grid shrink-0 grid-cols-7 gap-2 border-b border-slate-200 bg-white px-5 py-3"
        >
          {structure.map((domain) => {
            const active = domain.id === activeDomain?.id;
            return (
              <button
                key={domain.id}
                type="button"
                data-canvas-control="true"
                data-template-node-id={domain.id}
                data-parent-node-id="root"
                aria-pressed={active}
                title={domain.title || '未命名分类'}
                onClick={() => {
                  setActiveDomainId(domain.id);
                  setSelection({ kind: 'domain', domainId: domain.id });
                }}
                className={`min-h-10 min-w-0 rounded-md border px-2 py-2 text-sm font-bold leading-5 ${
                  active
                    ? 'border-[#078FAE] bg-white text-[#078FAB] shadow-[0_0_0_1px_#078FAE]'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-[#9DDFEA]'
                }`}
              >
                <span className="block break-words">{domain.title || '未命名分类'}</span>
              </button>
            );
          })}
        </nav>

        <div className="relative min-h-0 flex-1 overflow-hidden">
          <div
          ref={canvasRef}
          data-testid="mind-map-canvas"
          onWheel={(event) => {
            const rect = event.currentTarget.getBoundingClientRect();
            const pointer = { x: event.clientX - rect.left, y: event.clientY - rect.top };
            const nextZoom = Math.min(1.6, Math.max(0.3, zoom - event.deltaY * 0.001));
            const ratio = nextZoom / zoom;
            setPan({
              x: pointer.x - (pointer.x - pan.x) * ratio,
              y: pointer.y - (pointer.y - pan.y) * ratio,
            });
            zoomRef.current = nextZoom;
            setZoom(nextZoom);
          }}
          onPointerDown={(event) => {
            const target = event.target as HTMLElement;
            if (target.closest('[data-canvas-control="true"]')) return;
            event.preventDefault();
            window.getSelection()?.removeAllRanges();
            event.currentTarget.setPointerCapture?.(event.pointerId);
            dragStart.current = { x: event.clientX, y: event.clientY };
            panStart.current = pan;
            dragMovedRef.current = false;
            setDragging(true);
          }}
          onPointerMove={(event) => {
            if (!dragging) return;
            if (Math.abs(event.clientX - dragStart.current.x) > 3
              || Math.abs(event.clientY - dragStart.current.y) > 3) {
              dragMovedRef.current = true;
            }
            setPan({
              x: panStart.current.x + event.clientX - dragStart.current.x,
              y: panStart.current.y + event.clientY - dragStart.current.y,
            });
          }}
          onPointerUp={() => setDragging(false)}
          onPointerCancel={() => setDragging(false)}
          onClick={(event) => {
            if (!dragMovedRef.current
              && !(event.target as HTMLElement).closest('[data-canvas-control="true"]')) {
              setSelection({ kind: 'root' });
            }
          }}
          className={`h-full min-h-[560px] touch-none select-none overflow-hidden ${dragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        >
          <div
            ref={contentRef}
            className="relative flex min-h-max min-w-max justify-center px-14 py-10"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'top left',
            }}
          >
            <div
              className="flex min-w-max items-start justify-center gap-8"
              data-testid="template-domain-groups"
              data-template-layout="horizontal-groups"
            >
              {renderActiveDomain()}
            </div>
          </div>
          </div>

          <button
            type="button"
            data-canvas-control="true"
            title="恢复画布大小和位置"
            onClick={() => {
              setPan({ x: 0, y: 0 });
              zoomRef.current = 1;
              setZoom(1);
            }}
            className="absolute bottom-4 right-4 h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-bold text-slate-500 shadow-sm"
          >
            {Math.round(zoom * 100)}%
          </button>
        </div>
      </div>

      <StandardModeTemplateNodeWorkbench
        structure={structure}
        selection={selection}
        onRename={renameSelectedNode}
        onAddSibling={addSiblingNode}
        onAddChild={addChildNode}
        onDelete={requestSelectedDelete}
      />

      <ConfirmDialog
        isOpen={pendingDelete !== null}
        title="删除设定节点？"
        description={pendingDelete ? `删除“${pendingDelete.title}”时，它下面的内容也会一起删除。` : ''}
        confirmText="确认删除"
        cancelText="取消"
        confirmVariant="danger"
        onClose={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
