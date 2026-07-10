import { FileCode2, FileText, FolderTree, Search } from 'lucide-react';
import { useMemo, useState } from 'react';

import cleanPunctuationScript from '../../../../提示词/clean_punctuation.py?raw';
import fixWorkflowScript from '../../../../提示词/fix_workflow.py?raw';
import humanizeTextPrompt from '../../../../提示词/humanize-text.md?raw';
import skillPrompt from '../../../../提示词/SKILL.md?raw';
import aiDraftPrompt from '../../../../提示词/一键AI续写章节_v4.0.md?raw';
import summaryInitPrompt from '../../../../提示词/一键初始化摘要系统.md?raw';
import deAiPrompt from '../../../../提示词/一键去AI化.md?raw';
import wordCountPrompt from '../../../../提示词/一键字数统计.md?raw';
import importNovelPrompt from '../../../../提示词/一键导入已有小说.md?raw';
import poisonCheckPrompt from '../../../../提示词/一键毒点检测修改.md?raw';
import outlinePrompt from '../../../../提示词/一键生成细纲.md?raw';
import publishPrompt from '../../../../提示词/一键章节发布.md?raw';
import characterTemplatePrompt from '../../../../提示词/人物档案模板.md?raw';
import foreshadowTemplatePrompt from '../../../../提示词/伏笔库模板.md?raw';
import globalRulesPrompt from '../../../../提示词/全局创作规范.md?raw';
import styleGuideTemplatePrompt from '../../../../提示词/写作风格指南模板.md?raw';
import whitepaperTemplatePrompt from '../../../../提示词/创意白皮书模板.md?raw';
import factionTemplatePrompt from '../../../../提示词/势力档案模板.md?raw';
import auditPatchPrompt from '../../../../提示词/升级补丁_自动审核系统v2.0.md?raw';
import locationTemplatePrompt from '../../../../提示词/地点档案模板.md?raw';
import multiModelPatchPrompt from '../../../../提示词/多模型防漏修复补丁v3.0.md?raw';
import summaryTemplatePrompt from '../../../../提示词/摘要系统模板.md?raw';
import outlineTemplatePrompt from '../../../../提示词/整书大纲模板.md?raw';
import itemTemplatePrompt from '../../../../提示词/物品档案模板.md?raw';
import whitepaperExamplePrompt from '../../../../提示词/白皮书示例.md?raw';
import antiFreezePatchPrompt from '../../../../提示词/防卡死补丁_文件写入规范v1.0.md?raw';

type PromptFile = {
  id: string;
  phase: string;
  fileName: string;
  role: string;
  content: string;
  kind?: 'prompt' | 'template' | 'script' | 'patch';
};

const promptDirectory: PromptFile[] = [
  {
    id: 'whitepaper-example',
    phase: '辅助模板',
    fileName: '白皮书示例.md',
    role: '参考一份完整白皮书应该长什么样。',
    content: whitepaperExamplePrompt,
    kind: 'template',
  },
  {
    id: 'whitepaper-template',
    phase: '辅助模板',
    fileName: '创意白皮书模板.md',
    role: '开新书前填写题材、主角、世界观、爽点和红线。',
    content: whitepaperTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'style-guide-template',
    phase: '辅助模板',
    fileName: '写作风格指南模板.md',
    role: '整理行文风格、对话风格和参考作品。',
    content: styleGuideTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'book-outline-template',
    phase: '辅助模板',
    fileName: '整书大纲模板.md',
    role: '整理整书主线、分卷规划和关键节点。',
    content: outlineTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'project-init',
    phase: '新书流程',
    fileName: 'SKILL.md',
    role: '主初始化提示词：根据白皮书创建项目目录、工作流和首批档案。',
    content: skillPrompt,
  },
  {
    id: 'global-rules',
    phase: '新书流程',
    fileName: '全局创作规范.md',
    role: '项目通用写作规范，约束正文风格、格式和去AI化要求。',
    content: globalRulesPrompt,
  },
  {
    id: 'anti-freeze',
    phase: '可选补丁',
    fileName: '防卡死补丁_文件写入规范v1.0.md',
    role: '给大段中文写入加防卡死规范。',
    content: antiFreezePatchPrompt,
    kind: 'patch',
  },
  {
    id: 'audit-patch',
    phase: '可选补丁',
    fileName: '升级补丁_自动审核系统v2.0.md',
    role: '给细纲和正文流程注入自动审核与修复。',
    content: auditPatchPrompt,
    kind: 'patch',
  },
  {
    id: 'multi-model-patch',
    phase: '可选补丁',
    fileName: '多模型防漏修复补丁v3.0.md',
    role: '强制模型真实读取设定文件，防止切换模型后漏设定。',
    content: multiModelPatchPrompt,
    kind: 'patch',
  },
  {
    id: 'summary-init',
    phase: '新书流程',
    fileName: '一键初始化摘要系统.md',
    role: '初始化剧情摘要库和全书剧情主线。',
    content: summaryInitPrompt,
  },
  {
    id: 'import-novel',
    phase: '已有小说导入流程',
    fileName: '一键导入已有小说.md',
    role: '从已有正文提取人物、势力、地点、物品、伏笔和细纲。',
    content: importNovelPrompt,
  },
  {
    id: 'outline',
    phase: '写作循环',
    fileName: '一键生成细纲.md',
    role: '读取设定和摘要，一次生成后续5章细纲。',
    content: outlinePrompt,
  },
  {
    id: 'draft',
    phase: '写作循环',
    fileName: '一键AI续写章节_v4.0.md',
    role: '读取细纲、摘要、设定和前章正文，生成新章节。',
    content: aiDraftPrompt,
  },
  {
    id: 'poison-check',
    phase: '写作循环',
    fileName: '一键毒点检测修改.md',
    role: '检测读者流失点，并在副本中修改。',
    content: poisonCheckPrompt,
  },
  {
    id: 'de-ai',
    phase: '写作循环',
    fileName: '一键去AI化.md',
    role: '把AI生成章节改得更接地气、更像网文。',
    content: deAiPrompt,
  },
  {
    id: 'humanize',
    phase: '写作循环',
    fileName: 'humanize-text.md',
    role: '另一套去AI痕迹和人类化改写流程。',
    content: humanizeTextPrompt,
  },
  {
    id: 'word-count',
    phase: '写作循环',
    fileName: '一键字数统计.md',
    role: '统计章节字数并生成报告。',
    content: wordCountPrompt,
  },
  {
    id: 'publish',
    phase: '写作循环',
    fileName: '一键章节发布.md',
    role: '章节确认后更新设定库、时间线、伏笔和剧情摘要。',
    content: publishPrompt,
  },
  {
    id: 'character-template',
    phase: '辅助模板',
    fileName: '人物档案模板.md',
    role: '人物档案的字段模板。',
    content: characterTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'faction-template',
    phase: '辅助模板',
    fileName: '势力档案模板.md',
    role: '势力档案的字段模板。',
    content: factionTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'location-template',
    phase: '辅助模板',
    fileName: '地点档案模板.md',
    role: '地点档案的字段模板。',
    content: locationTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'item-template',
    phase: '辅助模板',
    fileName: '物品档案模板.md',
    role: '物品档案的字段模板。',
    content: itemTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'foreshadow-template',
    phase: '辅助模板',
    fileName: '伏笔库模板.md',
    role: '已埋、已收和伏笔总表的模板。',
    content: foreshadowTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'summary-template',
    phase: '辅助模板',
    fileName: '摘要系统模板.md',
    role: '全书主线、分段摘要和卷摘要模板。',
    content: summaryTemplatePrompt,
    kind: 'template',
  },
  {
    id: 'clean-punctuation',
    phase: '辅助脚本',
    fileName: 'clean_punctuation.py',
    role: '清理标点和格式的脚本。',
    content: cleanPunctuationScript,
    kind: 'script',
  },
  {
    id: 'fix-workflow',
    phase: '辅助脚本',
    fileName: 'fix_workflow.py',
    role: '修复工作流文件的脚本。',
    content: fixWorkflowScript,
    kind: 'script',
  },
];

const phaseOrder = ['辅助模板', '新书流程', '可选补丁', '已有小说导入流程', '写作循环', '辅助脚本'];

function getPromptLineCount(content: string) {
  return content.split(/\r?\n/).length;
}

function getPromptKindLabel(kind: PromptFile['kind']) {
  if (kind === 'script') return '脚本';
  if (kind === 'template') return '模板';
  if (kind === 'patch') return '补丁';
  return '提示词';
}

export function PromptWorkflowPreviewTestPage() {
  const [activePromptId, setActivePromptId] = useState(promptDirectory[0].id);
  const [keyword, setKeyword] = useState('');
  const activePrompt = promptDirectory.find((prompt) => prompt.id === activePromptId) ?? promptDirectory[0];

  const filteredDirectory = useMemo(() => {
    const search = keyword.trim().toLowerCase();
    if (!search) return promptDirectory;
    return promptDirectory.filter(
      (prompt) =>
        prompt.fileName.toLowerCase().includes(search) ||
        prompt.phase.toLowerCase().includes(search) ||
        prompt.role.toLowerCase().includes(search) ||
        prompt.content.toLowerCase().includes(search),
    );
  }, [keyword]);

  const groupedDirectory = useMemo(
    () =>
      phaseOrder
        .map((phase) => ({
          phase,
          prompts: filteredDirectory.filter((prompt) => prompt.phase === phase),
        }))
        .filter((group) => group.prompts.length > 0),
    [filteredDirectory],
  );

  return (
    <div className="flex h-full min-h-0 flex-col bg-[#F6F8FB] text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
              <FolderTree className="h-4 w-4" />
              左侧提示词目录
            </div>
            <h1 className="text-2xl font-black tracking-normal text-slate-950">提示词目录预览测试</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              左边按实际工作流程排列 `提示词` 文件夹，右侧提示词预览会显示选中文件的原文内容。
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xl font-black text-slate-900">{promptDirectory.length}</div>
              <div className="text-xs font-bold text-slate-400">文件</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xl font-black text-slate-900">{phaseOrder.length}</div>
              <div className="text-xs font-bold text-slate-400">阶段</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="text-xl font-black text-slate-900">{getPromptLineCount(activePrompt.content)}</div>
              <div className="text-xs font-bold text-slate-400">当前行数</div>
            </div>
          </div>
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-[360px_minmax(0,1fr)] gap-4 p-4">
        <aside className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 border-b border-slate-100 p-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
              <input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜索提示词目录"
                className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm font-bold outline-none transition-colors focus:border-cyan-400 focus:bg-white"
              />
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-3">
            <div className="space-y-4">
              {groupedDirectory.map((group) => (
                <section key={group.phase}>
                  <div className="mb-2 flex items-center justify-between px-1">
                    <h2 className="text-xs font-black text-slate-500">{group.phase}</h2>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-black text-slate-400">
                      {group.prompts.length}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.prompts.map((prompt) => {
                      const active = prompt.id === activePrompt.id;
                      const Icon = prompt.kind === 'script' ? FileCode2 : FileText;
                      return (
                        <button
                          key={prompt.id}
                          type="button"
                          onClick={() => setActivePromptId(prompt.id)}
                          className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                            active
                              ? 'border-cyan-300 bg-cyan-50 shadow-sm'
                              : 'border-slate-100 bg-white hover:border-cyan-200 hover:bg-cyan-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border ${
                                active
                                  ? 'border-cyan-200 bg-white text-cyan-700'
                                  : 'border-slate-200 bg-slate-50 text-slate-400'
                              }`}
                            >
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-black text-slate-900">
                                {prompt.fileName}
                              </span>
                              <span className="mt-0.5 block line-clamp-2 text-xs leading-4 text-slate-500">
                                {prompt.role}
                              </span>
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
              {groupedDirectory.length === 0 && (
                <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm font-bold text-slate-400">
                  没有找到匹配的提示词
                </div>
              )}
            </div>
          </div>
        </aside>

        <section className="flex min-h-0 flex-col rounded-lg border border-slate-200 bg-white shadow-sm">
          <div className="shrink-0 border-b border-slate-100 px-5 py-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-cyan-50 px-3 py-1 text-xs font-black text-cyan-700">
                    {activePrompt.phase}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                    {getPromptKindLabel(activePrompt.kind)}
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-black text-slate-500">
                    {getPromptLineCount(activePrompt.content)} 行
                  </span>
                </div>
                <h2 className="truncate text-xl font-black tracking-normal text-slate-950">{activePrompt.fileName}</h2>
                <p className="mt-1 text-sm leading-6 text-slate-500">{activePrompt.role}</p>
              </div>
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto bg-[#FBFCFE] p-5">
            <div className="mb-3 text-xs font-black text-slate-400">右侧提示词预览</div>
            <pre className="min-h-full whitespace-pre-wrap break-words rounded-lg border border-slate-200 bg-white p-5 font-mono text-sm leading-7 text-slate-800 shadow-sm">
              {activePrompt.content}
            </pre>
          </div>
        </section>
      </main>
    </div>
  );
}
