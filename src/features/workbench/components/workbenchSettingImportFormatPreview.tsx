export function getSettingImportFormatLineClassName(line: string, lineIndex: number) {
  const trimmed = line.trim();
  if (/^<\/?[^<>]+>$/.test(trimmed)) {
    return lineIndex === 0 ? 'text-amber-600' : 'text-purple-700';
  }
  if (/^\*[^*]+\*[:：]$/.test(trimmed)) return 'text-sky-700';
  return 'text-slate-800';
}

export function SettingImportFormatPreviewText({ content }: { content: string }) {
  return (
    <>
      {content.split('\n').map((line, index) => (
        <span
          key={`${index}-${line}`}
          className={`block min-h-[1.75em] ${getSettingImportFormatLineClassName(line, index)}`}
        >
          {line || '\u00A0'}
        </span>
      ))}
    </>
  );
}
