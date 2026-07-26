import { useEffect, useMemo, useState } from 'react';

import { StandardModeAuditStageTest } from './StandardModeAuditStageTest';
import { StandardModeBookSetupTest } from './StandardModeBookSetupTest';
import { StandardModeCreationStageTest } from './StandardModeCreationStageTest';
import { StandardModeFourStageShell } from './StandardModeFourStageShell';
import { StandardModePreparationStageTest } from './StandardModePreparationStageTest';
import { StandardModeSettingStageTest } from './StandardModeSettingStageTest';
import {
  DEFAULT_BRAINSTORMS,
  STANDARD_FOUR_STAGE_STORAGE_KEY,
  STANDARD_SETTING_FIELDS,
  buildBrainstorm,
  buildChapterBody,
  buildChapterOutlines,
  createInitialChapters,
  type CreationView,
  type PreparationView,
  type SettingGenerationStatus,
  type StandardStageId,
  type StandardTestBook,
  type StandardTestBrainstorm,
  type StandardTestChapter,
} from './standardModeFourStageTestModel';

interface PersistedFourStageState {
  book: StandardTestBook;
  brainstorms: StandardTestBrainstorm[];
  linkedBrainstormId: string;
  settingValues: Record<string, string>;
  settingCursor: number;
  chapters: StandardTestChapter[];
}

function loadPersistedState(): PersistedFourStageState | null {
  try {
    const raw = window.localStorage.getItem(STANDARD_FOUR_STAGE_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PersistedFourStageState>;
    if (!parsed.book?.title || !parsed.book.genre) return null;
    return {
      book: parsed.book,
      brainstorms: parsed.brainstorms?.length ? parsed.brainstorms : DEFAULT_BRAINSTORMS,
      linkedBrainstormId: parsed.linkedBrainstormId ?? '',
      settingValues: parsed.settingValues ?? {},
      settingCursor: parsed.settingCursor ?? 0,
      chapters: parsed.chapters?.length ? parsed.chapters : createInitialChapters(),
    };
  } catch {
    return null;
  }
}

export function StandardModeFourStageWorkbenchTestPage() {
  const persisted = useMemo(loadPersistedState, []);
  const [book, setBook] = useState<StandardTestBook | null>(persisted?.book ?? null);
  const [stage, setStage] = useState<StandardStageId>('prepare');
  const [preparationView, setPreparationView] = useState<PreparationView>('generate');
  const [creationView, setCreationView] = useState<CreationView>('outline');
  const [brainstorms, setBrainstorms] = useState<StandardTestBrainstorm[]>(persisted?.brainstorms ?? DEFAULT_BRAINSTORMS);
  const [selectedBrainstormId, setSelectedBrainstormId] = useState(persisted?.brainstorms?.[0]?.id ?? DEFAULT_BRAINSTORMS[0].id);
  const [linkedBrainstormId, setLinkedBrainstormId] = useState(persisted?.linkedBrainstormId ?? '');
  const [settingValues, setSettingValues] = useState<Record<string, string>>(persisted?.settingValues ?? {});
  const [settingCursor, setSettingCursor] = useState(persisted?.settingCursor ?? 0);
  const [activeSettingFieldId, setActiveSettingFieldId] = useState(STANDARD_SETTING_FIELDS[0].id);
  const [generationStatus, setGenerationStatus] = useState<SettingGenerationStatus>(
    persisted && persisted.settingCursor > 0 && persisted.settingCursor < STANDARD_SETTING_FIELDS.length ? 'paused' : 'idle',
  );
  const [settingCheckMessage, setSettingCheckMessage] = useState('');
  const [chapters, setChapters] = useState<StandardTestChapter[]>(persisted?.chapters ?? createInitialChapters());
  const [selectedChapterNumber, setSelectedChapterNumber] = useState(1);

  const linkedBrainstorm = brainstorms.find((item) => item.id === linkedBrainstormId);

  useEffect(() => {
    if (!book) return;
    const snapshot: PersistedFourStageState = {
      book,
      brainstorms,
      linkedBrainstormId,
      settingValues,
      settingCursor,
      chapters,
    };
    window.localStorage.setItem(STANDARD_FOUR_STAGE_STORAGE_KEY, JSON.stringify(snapshot));
  }, [book, brainstorms, chapters, linkedBrainstormId, settingCursor, settingValues]);

  useEffect(() => {
    if (generationStatus !== 'running') return;
    if (settingCursor >= STANDARD_SETTING_FIELDS.length) {
      setGenerationStatus('complete');
      setSettingCheckMessage('设定已经全部生成，可以执行一键检查。');
      return;
    }

    const field = STANDARD_SETTING_FIELDS[settingCursor];
    const target = field.generated;
    const current = settingValues[field.id] ?? '';
    setActiveSettingFieldId(field.id);

    if (current && !target.startsWith(current)) {
      setSettingCursor((value) => value + 1);
      return;
    }
    if (current.length >= target.length) {
      setSettingCursor((value) => value + 1);
      return;
    }

    const timer = window.setTimeout(() => {
      setSettingValues((values) => ({
        ...values,
        [field.id]: target.slice(0, Math.min(target.length, current.length + 4)),
      }));
    }, 35);
    return () => window.clearTimeout(timer);
  }, [generationStatus, settingCursor, settingValues]);

  const changeStage = (nextStage: StandardStageId) => {
    if (stage === 'settings' && nextStage !== 'settings' && generationStatus === 'running') {
      setGenerationStatus('paused');
    }
    setStage(nextStage);
    if (nextStage === 'creation') setCreationView('outline');
  };

  const createBook = (nextBook: StandardTestBook) => {
    setBook(nextBook);
    setStage('prepare');
    setPreparationView('generate');
  };

  const resetBook = () => {
    window.localStorage.removeItem(STANDARD_FOUR_STAGE_STORAGE_KEY);
    setBook(null);
    setStage('prepare');
    setPreparationView('generate');
    setCreationView('outline');
    setBrainstorms(DEFAULT_BRAINSTORMS);
    setSelectedBrainstormId(DEFAULT_BRAINSTORMS[0].id);
    setLinkedBrainstormId('');
    setSettingValues({});
    setSettingCursor(0);
    setGenerationStatus('idle');
    setSettingCheckMessage('');
    setChapters(createInitialChapters());
    setSelectedChapterNumber(1);
  };

  if (!book) return <StandardModeBookSetupTest onCreate={createBook} />;

  return (
    <StandardModeFourStageShell
      book={book}
      stage={stage}
      preparationView={preparationView}
      creationView={creationView}
      onChangeStage={changeStage}
      onChangePreparationView={setPreparationView}
      onChangeCreationView={setCreationView}
      onCreateAnotherBook={resetBook}
    >
      {stage === 'prepare' ? (
        <StandardModePreparationStageTest
          book={book}
          view={preparationView}
          brainstorms={brainstorms}
          selectedBrainstormId={selectedBrainstormId}
          onSelectBrainstorm={setSelectedBrainstormId}
          onGenerate={(request) => {
            const brainstorm = buildBrainstorm(book, request);
            setBrainstorms((current) => [brainstorm, ...current]);
            setSelectedBrainstormId(brainstorm.id);
            setPreparationView('library');
          }}
          onRevise={(id, request) => {
            setBrainstorms((current) =>
              current.map((item) =>
                item.id === id
                  ? { ...item, content: `${item.content}\n\n根据修改要求补充：${request.trim()}` }
                  : item,
              ),
            );
          }}
          onGenerateSettings={(id) => {
            setLinkedBrainstormId(id);
            setStage('settings');
            setActiveSettingFieldId(STANDARD_SETTING_FIELDS[0].id);
          }}
        />
      ) : null}

      {stage === 'settings' ? (
        <StandardModeSettingStageTest
          linkedBrainstorm={linkedBrainstorm}
          values={settingValues}
          activeFieldId={activeSettingFieldId}
          generationStatus={generationStatus}
          checkMessage={settingCheckMessage}
          onChangeField={(id, value) => setSettingValues((current) => ({ ...current, [id]: value }))}
          onSelectField={setActiveSettingFieldId}
          onStartOrContinue={() => {
            const firstMissing = STANDARD_SETTING_FIELDS.findIndex((field) => !settingValues[field.id]?.trim());
            setSettingCursor(firstMissing < 0 ? STANDARD_SETTING_FIELDS.length : firstMissing);
            setGenerationStatus(firstMissing < 0 ? 'complete' : 'running');
            setSettingCheckMessage('');
          }}
          onPause={() => setGenerationStatus('paused')}
          onClear={() => {
            setSettingValues({});
            setSettingCursor(0);
            setActiveSettingFieldId(STANDARD_SETTING_FIELDS[0].id);
            setGenerationStatus('idle');
            setSettingCheckMessage('已清空全部设定，可以重新生成。');
          }}
          onCheck={() => {
            const missing = STANDARD_SETTING_FIELDS.filter((field) => !settingValues[field.id]?.trim());
            if (missing.length > 0) {
              setActiveSettingFieldId(missing[0].id);
              setSettingCheckMessage(`还有${missing.length}项设定为空，已定位到第一项：${missing[0].label}。`);
            } else {
              setSettingCheckMessage('全部设定都已填写，可以进入创作阶段。');
            }
          }}
          onEnterCreation={() => {
            setStage('creation');
            setCreationView('outline');
          }}
        />
      ) : null}

      {stage === 'creation' ? (
        <StandardModeCreationStageTest
          view={creationView}
          chapters={chapters}
          selectedChapterNumber={selectedChapterNumber}
          onSelectChapter={setSelectedChapterNumber}
          onChangeView={setCreationView}
          onGenerateOutlines={(start, count, versions, requirement) => {
            setChapters((current) =>
              current.map((chapter) =>
                chapter.number >= start && chapter.number < start + count
                  ? { ...chapter, outlines: buildChapterOutlines(chapter.number, versions, requirement), selectedVersion: 0 }
                  : chapter,
              ),
            );
          }}
          onSelectVersion={(number, version) =>
            setChapters((current) => current.map((chapter) => chapter.number === number ? { ...chapter, selectedVersion: version } : chapter))
          }
          onGenerateBody={(number) =>
            setChapters((current) => current.map((chapter) => chapter.number === number ? { ...chapter, body: buildChapterBody(chapter) } : chapter))
          }
          onChangeBody={(number, body) =>
            setChapters((current) => current.map((chapter) => chapter.number === number ? { ...chapter, body } : chapter))
          }
          onReviseBody={(number, requirement) =>
            setChapters((current) =>
              current.map((chapter) => chapter.number === number ? { ...chapter, body: `${chapter.body}\n\n[按要求修改：${requirement.trim()}]` } : chapter),
            )
          }
          onEnterAudit={() => setStage('audit')}
        />
      ) : null}

      {stage === 'audit' ? (
        <StandardModeAuditStageTest
          chapters={chapters}
          selectedChapterNumber={selectedChapterNumber}
          onSelectChapter={setSelectedChapterNumber}
          onRunAudit={(number, requirement) =>
            setChapters((current) =>
              current.map((chapter) =>
                chapter.number === number
                  ? {
                      ...chapter,
                      auditResult: `审核要求：${requirement}\n\n1. 正文主线与当前章纲一致。\n2. 主角使用能力的方式符合已确认设定。\n3. 章末钩子能够承接下一章。\n\n建议：补充一处配角对主角异常表现的反应。`,
                    }
                  : chapter,
              ),
            )
          }
        />
      ) : null}
    </StandardModeFourStageShell>
  );
}

export default StandardModeFourStageWorkbenchTestPage;
