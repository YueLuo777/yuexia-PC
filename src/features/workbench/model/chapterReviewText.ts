export type ReviewAnnotation = {
  id: string;
  severity: string;
  type: string;
  paragraphIndex: number;
  originalText: string;
  problem: string;
  suggestion: string;
  action: string;
};

export type ReviewTextDiffSegment = {
  text: string;
  changed?: boolean;
};

export type ReviewTextDiff = {
  original: ReviewTextDiffSegment[];
  revised: ReviewTextDiffSegment[];
  hasChanges: boolean;
};

export type ReviewModificationNote = {
  paragraphIndex: number;
  category: string;
  note: string;
};

export type TextAuditParagraphChange = {
  paragraphIndex: number;
  revisedText: string;
  reason: string;
};

export type TextAuditResultSummary = {
  status: 'passed' | 'failed';
  label: string;
  description: string;
};

const REVIEW_TEXT_DIFF_MAX_CELLS = 320_000;

export function stripReviewThinkingBlock(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

export function extractReviewRevisedText(output: string) {
  const clean = stripReviewThinkingBlock(output);
  const marked = clean.match(
    /【修改后全文】[^\S\r\n]*(?:\r?\n)?([\s\S]*?)(?=\n?【(?:审核|点评|修改说明|问题|建议|原文|说明)[^】]*】|$)/,
  );
  if (marked?.[1]?.trim()) return marked[1].trimEnd();
  const fenced = clean.match(/```(?:text|txt|markdown|md)?[^\S\r\n]*(?:\r?\n)?([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) return fenced[1].trimEnd();
  return '';
}

export function splitReviewParagraphs(text: string) {
  return text.replace(/\r\n/g, '\n').split('\n');
}

export function getTextAuditResultSummary(output: string): TextAuditResultSummary | null {
  const clean = stripReviewThinkingBlock(output);
  const section = clean.match(
    /【文本审核结果】([\s\S]*?)(?=\n?【(?:修改段落|修改后全文|修改说明)】|$)/,
  )?.[1];
  if (!section) return null;
  const label = section.match(/【结果】\s*([^\n\r]+)/)?.[1]?.trim() ?? '';
  if (!label) return null;
  const description = section.match(/【说明】\s*([\s\S]*?)(?=\n?【[^】]+】|$)/)?.[1]?.trim() ?? '';
  return {
    status: /不通过|未通过|失败/.test(label) ? 'failed' : 'passed',
    label,
    description,
  };
}

export function preserveReviewParagraphIndentation(originalParagraphs: string[], revisedParagraphs: string[]) {
  return revisedParagraphs.map((paragraph, index) => {
    if (!paragraph.trim()) return '';
    const originalIndent = originalParagraphs[index]?.match(/^[\t \u3000]*/)?.[0] ?? '';
    return `${originalIndent}${paragraph.replace(/^[\t \u3000]*/, '')}`;
  });
}

export function extractTextAuditParagraphChanges(output: string): TextAuditParagraphChange[] {
  const clean = stripReviewThinkingBlock(output);
  const changes: TextAuditParagraphChange[] = [];
  const pattern =
    /【修改段落】\s*【段落序号】[^\S\r\n]*第?\s*(\d+)\s*段?[^\S\r\n]*(?:\r?\n)?【修改后段落】[^\S\r\n]*(?:\r?\n)?([\s\S]*?)\r?\n【修改原因】[^\S\r\n]*([\s\S]*?)(?=\r?\n【修改段落】|$)/g;
  for (const match of clean.matchAll(pattern)) {
    const paragraphNumber = Number(match[1]);
    const revisedText = match[2]?.trimEnd() ?? '';
    const reason = match[3]?.trim() ?? '';
    if (!Number.isInteger(paragraphNumber) || paragraphNumber < 1 || !revisedText || !reason) continue;
    changes.push({ paragraphIndex: paragraphNumber - 1, revisedText, reason });
  }
  return changes;
}

export function buildTextAuditRevisedText(output: string, originalText: string) {
  const changes = extractTextAuditParagraphChanges(output);
  if (changes.length === 0) return '';
  const originalParagraphs = splitReviewParagraphs(originalText);
  const revisedParagraphs = [...originalParagraphs];
  changes.forEach((change) => {
    if (change.paragraphIndex < 0 || change.paragraphIndex >= originalParagraphs.length) return;
    revisedParagraphs[change.paragraphIndex] = preserveReviewParagraphIndentation(
      [originalParagraphs[change.paragraphIndex]],
      [change.revisedText],
    )[0];
  });
  return revisedParagraphs.join('\n');
}

function inferReviewModificationCategory(note: string) {
  if (/重复|反复|赘余|啰嗦/.test(note)) return '重复表达';
  if (/精简|冗长|副词|句式|节奏/.test(note)) return '句式精简';
  if (/错别字|标点|病句|语法/.test(note)) return '文字修正';
  return '表达优化';
}

export function extractReviewModificationNotes(output: string): ReviewModificationNote[] {
  const paragraphChanges = extractTextAuditParagraphChanges(output);
  if (paragraphChanges.length > 0) {
    return paragraphChanges.map((change) => ({
      paragraphIndex: change.paragraphIndex,
      category: inferReviewModificationCategory(change.reason),
      note: change.reason,
    }));
  }
  const clean = stripReviewThinkingBlock(output);
  const section = clean.match(/【修改说明】\s*([\s\S]*?)(?=\n?【[^】]+】|$)/)?.[1]?.trim() ?? '';
  if (!section) return [];
  const notes: ReviewModificationNote[] = [];
  const pattern = /^第\s*(\d+)\s*段(?:\s*[｜|]\s*([^：:\n]+))?\s*[：:]\s*(.+)$/gm;
  for (const match of section.matchAll(pattern)) {
    const paragraphNumber = Number(match[1]);
    const note = match[3]?.trim() ?? '';
    if (!Number.isInteger(paragraphNumber) || paragraphNumber < 1 || !note) continue;
    notes.push({
      paragraphIndex: paragraphNumber - 1,
      category: match[2]?.trim() || inferReviewModificationCategory(note),
      note,
    });
  }
  return notes;
}

function normalizeReviewAnnotation(value: unknown, index: number): ReviewAnnotation | null {
  if (!value || typeof value !== 'object') return null;
  const raw = value as Record<string, unknown>;
  const paragraphIndex = Number(raw.paragraphIndex);
  const originalText = typeof raw.originalText === 'string' ? raw.originalText.trim() : '';
  if (!Number.isFinite(paragraphIndex) || !originalText) return null;
  return {
    id: typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `A${String(index + 1).padStart(3, '0')}`,
    severity: typeof raw.severity === 'string' && raw.severity.trim() ? raw.severity.trim() : '提醒',
    type: typeof raw.type === 'string' && raw.type.trim() ? raw.type.trim() : '问题标注',
    paragraphIndex,
    originalText,
    problem: typeof raw.problem === 'string' ? raw.problem.trim() : '',
    suggestion: typeof raw.suggestion === 'string' ? raw.suggestion.trim() : '',
    action: typeof raw.action === 'string' && raw.action.trim() ? raw.action.trim() : '建议处理',
  };
}

export function extractReviewAnnotations(output: string): ReviewAnnotation[] {
  const clean = stripReviewThinkingBlock(output);
  const candidates = [
    clean.match(/#\s*原文标注[\s\S]*?```(?:json)?\s*(\[[\s\S]*?\])\s*```/i)?.[1],
    clean.match(/原文标注[\s\S]*?```(?:json)?\s*(\[[\s\S]*?\])\s*```/i)?.[1],
    clean.match(/```json\s*(\[[\s\S]*?\])\s*```/i)?.[1],
  ].filter((item): item is string => Boolean(item?.trim()));

  for (const candidate of candidates) {
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (!Array.isArray(parsed)) continue;
      return parsed
        .map((item, index) => normalizeReviewAnnotation(item, index))
        .filter((item): item is ReviewAnnotation => Boolean(item));
    } catch {
      // Ignore malformed AI annotation blocks and keep the review page usable.
    }
  }
  return [];
}

export function getReviewAnnotationParagraphIndex(annotation: ReviewAnnotation, paragraphCount: number) {
  if (annotation.paragraphIndex >= 1 && annotation.paragraphIndex <= paragraphCount) {
    return annotation.paragraphIndex - 1;
  }
  if (annotation.paragraphIndex >= 0 && annotation.paragraphIndex < paragraphCount) {
    return annotation.paragraphIndex;
  }
  return -1;
}

function pushReviewTextDiffSegment(segments: ReviewTextDiffSegment[], text: string, changed: boolean) {
  if (!text) return;
  const previous = segments[segments.length - 1];
  if (previous && Boolean(previous.changed) === changed) {
    previous.text += text;
    return;
  }
  segments.push(changed ? { text, changed: true } : { text });
}

function reverseReviewTextDiffSegments(segments: ReviewTextDiffSegment[]) {
  return segments
    .reverse()
    .map((segment) => ({ ...segment, text: Array.from(segment.text).reverse().join('') }))
    .filter((segment) => segment.text);
}

function buildFallbackReviewTextDiff(originalText: string, revisedText: string): ReviewTextDiff {
  let prefixLength = 0;
  const maxPrefix = Math.min(originalText.length, revisedText.length);
  while (prefixLength < maxPrefix && originalText[prefixLength] === revisedText[prefixLength]) {
    prefixLength += 1;
  }

  let suffixLength = 0;
  const maxSuffix = Math.min(originalText.length - prefixLength, revisedText.length - prefixLength);
  while (
    suffixLength < maxSuffix &&
    originalText[originalText.length - 1 - suffixLength] === revisedText[revisedText.length - 1 - suffixLength]
  ) {
    suffixLength += 1;
  }

  const original: ReviewTextDiffSegment[] = [];
  const revised: ReviewTextDiffSegment[] = [];
  pushReviewTextDiffSegment(original, originalText.slice(0, prefixLength), false);
  pushReviewTextDiffSegment(revised, revisedText.slice(0, prefixLength), false);
  pushReviewTextDiffSegment(
    original,
    originalText.slice(prefixLength, suffixLength ? originalText.length - suffixLength : originalText.length),
    true,
  );
  pushReviewTextDiffSegment(
    revised,
    revisedText.slice(prefixLength, suffixLength ? revisedText.length - suffixLength : revisedText.length),
    true,
  );
  if (suffixLength > 0) {
    pushReviewTextDiffSegment(original, originalText.slice(originalText.length - suffixLength), false);
    pushReviewTextDiffSegment(revised, revisedText.slice(revisedText.length - suffixLength), false);
  }
  return { original, revised, hasChanges: originalText !== revisedText };
}

export function buildReviewTextDiff(originalText: string, revisedText: string): ReviewTextDiff {
  if (originalText === revisedText) {
    return {
      original: originalText ? [{ text: originalText }] : [],
      revised: revisedText ? [{ text: revisedText }] : [],
      hasChanges: false,
    };
  }

  const originalChars = Array.from(originalText);
  const revisedChars = Array.from(revisedText);
  const rowSize = revisedChars.length + 1;
  const cellCount = (originalChars.length + 1) * rowSize;
  if (cellCount > REVIEW_TEXT_DIFF_MAX_CELLS) {
    return buildFallbackReviewTextDiff(originalText, revisedText);
  }

  const table = new Uint32Array(cellCount);
  for (let i = 1; i <= originalChars.length; i += 1) {
    const previousRow = (i - 1) * rowSize;
    const currentRow = i * rowSize;
    for (let j = 1; j <= revisedChars.length; j += 1) {
      table[currentRow + j] =
        originalChars[i - 1] === revisedChars[j - 1]
          ? table[previousRow + j - 1] + 1
          : Math.max(table[previousRow + j], table[currentRow + j - 1]);
    }
  }

  const original: ReviewTextDiffSegment[] = [];
  const revised: ReviewTextDiffSegment[] = [];
  let i = originalChars.length;
  let j = revisedChars.length;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && originalChars[i - 1] === revisedChars[j - 1]) {
      pushReviewTextDiffSegment(original, originalChars[i - 1], false);
      pushReviewTextDiffSegment(revised, revisedChars[j - 1], false);
      i -= 1;
      j -= 1;
    } else if (j > 0 && (i === 0 || table[i * rowSize + j - 1] >= table[(i - 1) * rowSize + j])) {
      pushReviewTextDiffSegment(revised, revisedChars[j - 1], true);
      j -= 1;
    } else if (i > 0) {
      pushReviewTextDiffSegment(original, originalChars[i - 1], true);
      i -= 1;
    }
  }

  return {
    original: reverseReviewTextDiffSegments(original),
    revised: reverseReviewTextDiffSegments(revised),
    hasChanges: true,
  };
}
