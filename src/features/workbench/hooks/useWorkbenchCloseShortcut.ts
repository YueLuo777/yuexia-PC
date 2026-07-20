import { useEffect } from 'react';
import { SHORTCUT_ACTION_EVENT } from '@/shared/shortcuts/shortcutConfig';

export function useWorkbenchCloseShortcut(options: {
  layers: Array<{ open: boolean; close: () => void }>;
  onExit: () => void;
}) {
  const { layers, onExit } = options;
  useEffect(() => {
    const handle = (event: Event) => {
      const action = event as CustomEvent<{ id?: string }>;
      if (action.detail?.id !== 'close_floating') return;
      const layer = layers.find((item) => item.open);
      if (layer) layer.close();
      else onExit();
    };
    window.addEventListener(SHORTCUT_ACTION_EVENT, handle);
    return () => window.removeEventListener(SHORTCUT_ACTION_EVENT, handle);
  }, [layers, onExit]);
}
