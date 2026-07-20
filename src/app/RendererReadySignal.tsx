import { useEffect } from 'react';

export function RendererReadySignal() {
  useEffect(() => {
    void window.xinyuexiaWindow?.signalRendererReady?.();
  }, []);

  return null;
}
