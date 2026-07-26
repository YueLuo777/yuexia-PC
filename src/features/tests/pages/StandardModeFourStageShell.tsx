import type { ReactNode } from 'react';

import {
  STANDARD_STAGES,
  type CreationView,
  type PreparationView,
  type StandardStageId,
  type StandardTestBook,
} from './standardModeFourStageTestModel';

interface StandardModeFourStageShellProps {
  book: StandardTestBook;
  stage: StandardStageId;
  preparationView: PreparationView;
  creationView: CreationView;
  children: ReactNode;
  onChangeStage: (stage: StandardStageId) => void;
  onChangePreparationView: (view: PreparationView) => void;
  onChangeCreationView: (view: CreationView) => void;
  onCreateAnotherBook: () => void;
}

function ContextNavigation({
  stage,
  preparationView,
  creationView,
  onChangePreparationView,
  onChangeCreationView,
}: Pick<
  StandardModeFourStageShellProps,
  'stage' | 'preparationView' | 'creationView' | 'onChangePreparationView' | 'onChangeCreationView'
>) {
  if (stage === 'prepare') {
    return (
      <div className="flex items-center gap-2" aria-label="准备阶段功能">
        {([
          ['generate', '生成脑洞'],
          ['library', '脑洞库'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={preparationView === id}
            onClick={() => onChangePreparationView(id)}
            className={[
              'h-8 rounded-md border bg-white px-4 text-sm font-semibold',
              preparationView === id
                ? 'border-[#08AACE] text-[#078FAB]'
                : 'border-[#dce1e8] text-[#657180] hover:border-[#9fdce8]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  if (stage === 'creation') {
    return (
      <div className="flex items-center gap-2" aria-label="创作阶段功能">
        {([
          ['outline', '章纲'],
          ['writing', '正文'],
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            aria-pressed={creationView === id}
            onClick={() => onChangeCreationView(id)}
            className={[
              'h-8 rounded-md border bg-white px-4 text-sm font-semibold',
              creationView === id
                ? 'border-[#08AACE] text-[#078FAB]'
                : 'border-[#dce1e8] text-[#657180] hover:border-[#9fdce8]',
            ].join(' ')}
          >
            {label}
          </button>
        ))}
      </div>
    );
  }

  return (
    <span className="h-8 rounded-md border border-[#08AACE] bg-white px-4 text-sm font-semibold leading-8 text-[#078FAB]">
      {stage === 'settings' ? '设定生成' : '剧情审核'}
    </span>
  );
}

export function StandardModeFourStageShell({
  book,
  stage,
  preparationView,
  creationView,
  children,
  onChangeStage,
  onChangePreparationView,
  onChangeCreationView,
  onCreateAnotherBook,
}: StandardModeFourStageShellProps) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-[#f5f5f7]" data-testid="standard-four-stage-workbench">
      <header className="shrink-0 border-b border-[#dce1e8] bg-white" data-testid="standard-four-stage-navigation">
        <div className="flex h-14 min-w-0 items-center gap-5 border-b border-[#edf0f3] px-4">
          <div className="w-[180px] shrink-0">
            <div className="truncate text-sm font-semibold text-[#1f2933]" title={book.title}>{book.title}</div>
            <div className="mt-0.5 truncate text-xs text-[#8a95a2]">{book.genre}</div>
          </div>

          <nav aria-label="标准模式四阶段" className="flex min-w-0 flex-1 items-center justify-center gap-2">
            {STANDARD_STAGES.map((item) => {
              const active = stage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-label={`第${item.number}步 ${item.title}`}
                  aria-current={active ? 'step' : undefined}
                  onClick={() => onChangeStage(item.id)}
                  className={[
                    'flex h-9 min-w-[126px] items-center justify-center gap-2 rounded-md border px-4 text-sm font-semibold',
                    active
                      ? 'border-[#08AACE] bg-white text-[#078FAB]'
                      : 'border-transparent bg-white text-[#657180] hover:border-[#b9e6ef] hover:text-[#078FAB]',
                  ].join(' ')}
                >
                  <span className="text-xs font-bold">{item.number}</span>
                  <span>{item.title}</span>
                </button>
              );
            })}
          </nav>

          <div className="flex w-[180px] shrink-0 justify-end">
            <button
              type="button"
              onClick={onCreateAnotherBook}
              className="h-8 rounded-md border border-[#dce1e8] bg-white px-3 text-xs font-medium text-[#657180] hover:border-[#08AACE] hover:text-[#078FAB]"
            >
              新建书籍
            </button>
          </div>
        </div>

        <div className="flex h-11 items-center justify-center px-4">
          <ContextNavigation
            stage={stage}
            preparationView={preparationView}
            creationView={creationView}
            onChangePreparationView={onChangePreparationView}
            onChangeCreationView={onChangeCreationView}
          />
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
