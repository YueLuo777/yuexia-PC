import { readFileSync, writeFileSync } from 'node:fs';

const path = 'E:/0yuexia/0,月下PC/src/shared/shortcuts/ShortcutSettingsModal.tsx';
let content = readFileSync(path, 'utf8');

// Check line endings
console.log('Has CRLF:', content.includes('\r\n'));
console.log('Has LF only:', content.includes('\n') && !content.includes('\r\n'));

// The actual content uses LF, not CRLF
const oldDialog = <div
        className="flex max-h-[84vh] w-[900px] max-w-[96vw] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >;

const newDialog = <div
        data-draggable-managed="true"
        data-modal-id="dashboard-shortcut-settings"
        className="relative flex max-h-[calc(100vh-32px)] max-w-[calc(100vw-32px)] w-[900px] max-w-[96vw] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
        style={{
          ...draggable.style,
          maxWidth: 'calc((100vw - 32px) / var(--xinyuexia-effective-scale, 1))',
          maxHeight: 'calc((100vh - 112px) / var(--xinyuexia-effective-scale, 1))',
        } as React.CSSProperties}
        onClick={(event) => event.stopPropagation()}
      >;

if (content.includes(oldDialog)) {
  content = content.replace(oldDialog, newDialog);
  console.log('ShortcutSettingsModal dialog replaced');
} else {
  console.log('ERROR: Could not find ShortcutSettingsModal dialog');
  // Debug: show what's around the area
  const idx = content.indexOf('max-h-[84vh]');
  console.log('Context:', JSON.stringify(content.substring(idx - 120, idx + 200)));
}

// Add ModalResizeHandles if not present
if (!content.includes('<ModalResizeHandles')) {
  // Find the last </div> before the overlay closing
  const pattern = '      </div>\n    </div>\n  );';
  const lastIdx = content.lastIndexOf(pattern);
  if (lastIdx >= 0) {
    content = content.substring(0, lastIdx) + '        <ModalResizeHandles draggable={draggable} />\n' + content.substring(lastIdx);
    console.log('ModalResizeHandles added');
  }
} else {
  console.log('ModalResizeHandles already present');
}

writeFileSync(path, content, 'utf8');
console.log('Saved');