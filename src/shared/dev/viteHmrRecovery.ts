const FULL_RELOAD_DELAY_MS = 50;

export function installViteHmrRecovery() {
  const hot = import.meta.hot;
  if (!hot) return;

  let reloadTimer: number | null = null;
  const requestFullReload = () => {
    if (reloadTimer !== null) return;
    reloadTimer = window.setTimeout(() => window.location.reload(), FULL_RELOAD_DELAY_MS);
  };

  hot.on('vite:invalidate', requestFullReload);
  hot.on('vite:beforePrune', requestFullReload);
  hot.dispose(() => {
    if (reloadTimer !== null) window.clearTimeout(reloadTimer);
  });
}
