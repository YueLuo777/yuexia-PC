import type { WorkbenchPlotPointCandidate } from '@/features/workbench/model/workbenchPlotChain';

import { stripAiThinkingBlock } from './workbenchLibraryAiText';

export function parseGeneratedPlotPointCandidates(text: string): WorkbenchPlotPointCandidate[] {
  const clean = stripAiThinkingBlock(text).trim();
  if (!clean) return [];
  return clean
    .split(/\n(?=\s*(?:[-*]|\d+[.、）)]|剧情点\s*\d+|【?剧情点[^】\n]*】?[：:])\s*)/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)
    .filter((block) => !/^#+\s*/.test(block))
    .slice(0, 30)
    .map((block, index) => {
      const lines = block
        .split(/\r?\n/)
        .map((line) => line
          .trim()
          .replace(/^[-*]\s*/, '')
          .replace(/^\d+[.、）)]\s*/, '')
          .replace(/^剧情点\s*\d+[.、）)]?\s*[：:]?\s*/, '')
          .trim())
        .filter(Boolean);
      const isMetaLine = (line: string) => /^(变量替换|变量替换说明|替换说明|修改说明|改写说明|AI评价|评价|原剧情点|原型)[：:]/.test(line);
      const contentLines = lines.filter((line) => !isMetaLine(line));
      const mainLine = contentLines[0] ?? lines[0] ?? '';
      const variableLine = lines.find((line) => /^(变量替换|变量替换说明|替换说明)[：:]/.test(line));
      const reviewLine = lines.find((line) => /^(AI评价|评价)[：:]/.test(line));
      const normalizedMainLine = mainLine.replace(/^剧情点[：:]\s*/, '').trim();
      const labelOnlyMatch = normalizedMainLine.match(/^(标题|剧情点)[：:]\s*(.+)$/);
      const shortTitleMatch = labelOnlyMatch ? null : normalizedMainLine.match(/^([^：:]{1,22})[：:]\s*(.+)$/);
      const titleFromLine = shortTitleMatch?.[1]?.trim() ?? '';
      const firstContent = labelOnlyMatch
        ? labelOnlyMatch[2].trim()
        : shortTitleMatch
          ? shortTitleMatch[2].trim().replace(new RegExp(`^${titleFromLine.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[，,、。；;：:\\s]*`), '').trim()
          : normalizedMainLine;
      const adapted = [firstContent, ...contentLines.slice(1)].filter(Boolean).join('\n').trim();
      const derivedTitle = firstContent.split(/[，。！？；,.!?;]/)[0]?.trim() || `AI剧情点 ${index + 1}`;
      const title = shortTitleMatch
        ? titleFromLine
        : derivedTitle.slice(0, 22);
      return {
        id: `ai:${index}:${adapted.slice(0, 18)}`,
        title,
        source: 'AI生成' as const,
        originalGenre: 'AI生成',
        original: block,
        adapted,
        variable: variableLine?.replace(/^(变量替换|变量替换说明|替换说明)[：:]\s*/, '').trim() || '由当前设定、用户要求和上下文生成',
        review: reviewLine?.replace(/^(AI评价|评价)[：:]\s*/, '').trim(),
      };
    })
    .filter((item) => item.adapted.length >= 6);
}
