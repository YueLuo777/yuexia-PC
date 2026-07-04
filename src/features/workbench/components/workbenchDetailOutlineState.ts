export const DETAIL_OUTLINE_PREVIEW_HEIGHT = '42vh';

export function getDetailOutlinePreviewHeight() {
  return DETAIL_OUTLINE_PREVIEW_HEIGHT;
}

export const DETAIL_OUTLINE_STATE_MARKER = '【本章状态变化预期】';
export const DETAIL_OUTLINE_PUBLISHED_GROUP_NAME = 'detail_outline_published_chapters';

export function splitDetailOutlineStateExpectation(content: string) {
  const markerIndex = content.indexOf(DETAIL_OUTLINE_STATE_MARKER);
  if (markerIndex < 0) {
    return { outline: content, stateExpectation: '' };
  }
  return {
    outline: content.slice(0, markerIndex).trimEnd(),
    stateExpectation: content.slice(markerIndex + DETAIL_OUTLINE_STATE_MARKER.length).trimStart(),
  };
}

export function mergeDetailOutlineStateExpectation(outline: string, stateExpectation: string) {
  const cleanOutline = outline.trimEnd();
  const cleanStateExpectation = stateExpectation.trim();
  if (!cleanStateExpectation) return cleanOutline;
  return [cleanOutline, `${DETAIL_OUTLINE_STATE_MARKER}\n${cleanStateExpectation}`]
    .filter((part) => part.trim())
    .join('\n\n');
}

