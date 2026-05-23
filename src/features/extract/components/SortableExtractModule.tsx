import { Check, EyeOff, Layers, Lock, Unlock } from 'lucide-react';
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';

import type { ExtractModule } from '@/features/extract/model/extractTypes';

interface SortableExtractModuleProps {
  module: ExtractModule;
  isSelected: boolean;
  isDragOver: boolean;
  isDragging: boolean;
  onSelect: (id: string) => void;
  onToggleActive: (id: string) => void;
  onToggleZone: (id: string) => void;
  onTogglePreviewHidden: (id: string) => void;
  onDragStart: (id: string) => void;
  onDragEnd: () => void;
  onDragOver: (id: string) => void;
  onDrop: (id: string) => void;
}

export function SortableExtractModule({
  module,
  isSelected,
  isDragOver,
  isDragging,
  onSelect,
  onToggleActive,
  onToggleZone,
  onTogglePreviewHidden,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDrop,
}: SortableExtractModuleProps) {
  const [dragReady, setDragReady] = useState(false);
  const timerRef = useRef<number | null>(null);
  const startPointRef = useRef({ x: 0, y: 0 });
  const nativeDraggingRef = useRef(false);
  const enteredRef = useRef(false);

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current);
  }, []);

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const resetState = () => {
    clearTimer();
    nativeDraggingRef.current = false;
    enteredRef.current = false;
    setDragReady(false);
  };

  const handlePointerDown = (event: ReactPointerEvent) => {
    startPointRef.current = { x: event.clientX, y: event.clientY };
    clearTimer();
    timerRef.current = window.setTimeout(() => setDragReady(true), 160);
  };

  const handlePointerMove = (event: ReactPointerEvent) => {
    if (dragReady || nativeDraggingRef.current) return;
    const deltaX = Math.abs(event.clientX - startPointRef.current.x);
    const deltaY = Math.abs(event.clientY - startPointRef.current.y);
    if (deltaX > 8 || deltaY > 8) clearTimer();
  };

  const isSystem = module.zone === 'system';

  return (
    <div
      onDragOver={(event) => {
        event.preventDefault();
        onDragOver(module.id);
      }}
      onDrop={(event) => {
        event.preventDefault();
        enteredRef.current = false;
        onDrop(module.id);
      }}
      onDragEnter={(event) => {
        event.preventDefault();
        if (enteredRef.current) return;
        enteredRef.current = true;
        onDragOver(module.id);
      }}
      onDragLeave={() => {
        enteredRef.current = false;
      }}
      className={`cursor-pointer border-b border-gray-50 bg-white transition-all ${
        isDragOver ? 'shadow-inner ring-2 ring-brand/30' : ''
      }`}
    >
      <div
        className={`flex cursor-pointer items-center transition-all ${
          isSelected ? 'bg-brand-light/70' : 'hover:bg-gray-50'
        } ${
          isDragging ? 'scale-[1.02] rounded-lg bg-white opacity-70 shadow-lg ring-2 ring-brand/20' : ''
        }`}
      >
        <button
          onClick={() => onSelect(module.id)}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-1.5 px-2 py-2 text-left"
        >
          <span
            onClick={(event) => {
              event.stopPropagation();
              onToggleActive(module.id);
            }}
            className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded border transition-colors ${
              module.active ? 'border-brand bg-brand' : 'border-gray-300 hover:border-brand'
            }`}
          >
            {module.active && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
          </span>

          <Layers className={`h-3.5 w-3.5 shrink-0 ${isSystem ? 'text-amber-500' : module.active ? 'text-brand' : 'text-gray-400'}`} />

          <span
            draggable={dragReady}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={() => {
              if (!nativeDraggingRef.current) resetState();
            }}
            onPointerCancel={resetState}
            onDragStart={(event) => {
              event.stopPropagation();
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', module.id);
              nativeDraggingRef.current = true;
              onDragStart(module.id);
            }}
            onDragEnd={(event) => {
              event.stopPropagation();
              resetState();
              onDragEnd();
            }}
            className={`min-w-0 flex-1 truncate text-[14px] ${
              isSelected ? 'font-medium text-brand' : 'text-gray-700'
            } ${
              isDragging ? 'cursor-grabbing' : dragReady ? 'cursor-grab' : 'cursor-pointer'
            }`}
            title="长按模块名称后拖拽排序"
          >
            {module.label}
          </span>

          <span className={`rounded-full px-1.5 py-0.5 text-[12px] ${isSystem ? 'bg-amber-50 text-amber-600' : 'bg-sky-50 text-sky-600'}`}>
            {isSystem ? '系统' : '输出'}
          </span>

          <button
            onClick={(event) => {
              event.stopPropagation();
              onTogglePreviewHidden(module.id);
            }}
            className={`ml-1 rounded p-0.5 transition-colors ${
              module.hidePreview
                ? 'text-violet-600 hover:bg-violet-50'
                : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            title={module.hidePreview ? '已隐藏右侧预览' : '隐藏右侧预览'}
          >
            <EyeOff className="h-3 w-3" />
          </button>

          <button
            onClick={(event) => {
              event.stopPropagation();
              onToggleZone(module.id);
            }}
            className={`ml-1 rounded p-0.5 transition-colors ${
              isSystem ? 'text-amber-500 hover:bg-amber-50' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
            }`}
            title={isSystem ? '切换为输出模块' : '切换为系统指令'}
          >
            {isSystem ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
          </button>
        </button>
      </div>
    </div>
  );
}
