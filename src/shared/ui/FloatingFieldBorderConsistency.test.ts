import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

import { describe, expect, it } from 'vitest';

describe('floating field border consistency', () => {
  it('uses the same black line for empty, filled, preview, and AI output frames', () => {
    const styles = readFileSync(resolve(process.cwd(), 'src/shared/styles/parts/part-09.css'), 'utf8');
    const baseField = styles.slice(
      styles.indexOf('.xy-floating-field input,'),
      styles.indexOf('.xy-floating-field label'),
    );
    const previewFields = styles.slice(
      styles.indexOf('.xy-floating-field.xy-floating-outline-preview textarea'),
      styles.indexOf('.xy-floating-field.xy-outline-ai-output-frame label'),
    );

    expect(baseField).toContainSource('border: 1.5px solid #111827;');
    expect(previewFields).toContainSource('border-color: #111827;');
    expect(previewFields).toContainSource('border: 2px solid #111827;');
    expect(previewFields).not.toContainSource('#d9e2ea');
  });

  it('keeps every fixed outline label stationary and does not highlight focused or selected frames', () => {
    const baseStyles = readFileSync(resolve(process.cwd(), 'src/shared/styles/parts/part-09.css'), 'utf8');
    const interactionStyles = readFileSync(resolve(process.cwd(), 'src/shared/styles/parts/part-10.css'), 'utf8');
    const outlineView = readFileSync(
      resolve(process.cwd(), 'src/features/workbench/components/OutlineWorkspaceView.tsx'),
      'utf8',
    );
    const outlinePreviewPane = readFileSync(
      resolve(process.cwd(), 'src/features/workbench/components/workbenchOutlinePreviewPane.tsx'),
      'utf8',
    );
    const fixedLabelStyles = baseStyles.slice(
      baseStyles.indexOf('.xy-floating-field.xy-floating-outline-fixed label,'),
      baseStyles.indexOf('.xy-floating-field.xy-floating-outline-compact input'),
    );

    expect(fixedLabelStyles).toContainSource('top: 0;');
    expect(fixedLabelStyles).toContainSource('left: 22px;');
    expect(fixedLabelStyles).toContainSource('transform: translateY(-50%) scale(1);');
    expect(fixedLabelStyles).toContainSource('transition: none;');
    expect(interactionStyles).not.toContainSource('xy-floating-outline-preview:focus-within textarea');
    expect(interactionStyles).not.toContainSource('xy-outline-selected');
    expect(outlineView).not.toContainSource('xy-outline-selected');
    expect(outlinePreviewPane).not.toContainSource('xy-outline-selected');
  });

  it('uses the output-frame black line for every shared AI requirement input state', () => {
    const baseStyles = readFileSync(resolve(process.cwd(), 'src/shared/styles/parts/part-11.css'), 'utf8');
    const themeStyles = readFileSync(resolve(process.cwd(), 'src/shared/styles/parts/part-12.css'), 'utf8');
    const baseInputStyles = baseStyles.slice(
      baseStyles.indexOf('.xy-floating-field.xy-floating-with-inline-actions textarea'),
      baseStyles.indexOf('.xy-floating-field.xy-floating-with-inline-actions label'),
    );
    const themedInputStyles = themeStyles.slice(
      themeStyles.indexOf('.writer-assistant-theme .xy-floating-field.xy-floating-with-inline-actions textarea'),
      themeStyles.indexOf('.writer-assistant-theme .xy-floating-field.xy-ai-inline-neutral .xy-ai-inline-send'),
    );

    expect(baseInputStyles).toContainSource('border: 2px solid #111827;');
    expect(themedInputStyles.match(/border-color: #111827;/g)).toHaveLength(4);
    expect(themedInputStyles).not.toContainSource('border-color: var(--xy-wa-blue);');
    expect(themedInputStyles).not.toContainSource('border-color: #94a3b8;');
  });
});
