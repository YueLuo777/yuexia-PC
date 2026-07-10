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

const REVIEW_TEXT_DIFF_MAX_CELLS = 320_000;

export function stripReviewThinkingBlock(content: string) {
  return content
    .replace(/\[\[THINKING seconds=\d+ status=(?:thinking|done)\]\]\n[\s\S]*?\n\[\[\/THINKING\]\]\n?/g, '')
    .trim();
}

export function extractReviewRevisedText(output: string) {
  const clean = stripReviewThinkingBlock(output);
  const marked = clean.match(
    /【修改后全文】\s*([\s\S]*?)(?=\n?【(?:审核|点评|修改说明|问题|建议|原文|说明)[^】]*】|$)/,
  );
  if (marked?.[1]?.trim()) return marked[1].trim();
  const fenced = clean.match(/```(?:text|txt|markdown|md)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]?.trim()) return fenced[1].trim();
  return '';
}

export function splitReviewParagraphs(text: string) {
  return text.replace(/\r\n/g, '\n').split('\n');
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
