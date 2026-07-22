const path = require('node:path');

const STARTUP_WINDOW_WIDTH = 440;
const STARTUP_WINDOW_HEIGHT = 272;
const STARTUP_REVEAL_TIMEOUT_MS = 12_000;

function getStartupWindowBounds(screen, savedState) {
  const hasSavedPosition = Number.isFinite(savedState?.x) && Number.isFinite(savedState?.y);
  const display = hasSavedPosition
    ? screen.getDisplayMatching({
        x: Math.round(savedState.x),
        y: Math.round(savedState.y),
        width: Math.max(1, Math.round(savedState.width ?? 1)),
        height: Math.max(1, Math.round(savedState.height ?? 1)),
      })
    : screen.getPrimaryDisplay();
  const { workArea } = display;

  return {
    width: STARTUP_WINDOW_WIDTH,
    height: STARTUP_WINDOW_HEIGHT,
    x: workArea.x + Math.floor((workArea.width - STARTUP_WINDOW_WIDTH) / 2),
    y: workArea.y + Math.floor((workArea.height - STARTUP_WINDOW_HEIGHT) / 2),
  };
}

function createStartupExperience({ BrowserWindow, screen, icon, isHeadless, log, revealMainWindow }) {
  let splashWindow = null;
  let revealTimer = null;
  let hasRevealedMainWindow = false;

  function closeSplash() {
    if (revealTimer) {
      clearTimeout(revealTimer);
      revealTimer = null;
    }
    if (!splashWindow || splashWindow.isDestroyed()) {
      splashWindow = null;
      return;
    }
    splashWindow.destroy();
    splashWindow = null;
  }

  function reveal(reason) {
    if (hasRevealedMainWindow) {
      log(`main window reveal ignored reason=${reason}`);
      return false;
    }
    hasRevealedMainWindow = true;
    log(`main window reveal reason=${reason}`);
    closeSplash();
    revealMainWindow();
    return true;
  }

  function begin(mainWindow, savedState) {
    closeSplash();
    hasRevealedMainWindow = false;
    mainWindow.once('ready-to-show', () => log('main window first paint ready'));
    mainWindow.webContents.once('did-finish-load', () => log('main window document loaded'));

    if (!isHeadless) {
      splashWindow = new BrowserWindow({
        ...getStartupWindowBounds(screen, savedState),
        title: '月下写作',
        icon,
        frame: false,
        show: false,
        resizable: false,
        minimizable: false,
        maximizable: false,
        fullscreenable: false,
        skipTaskbar: true,
        alwaysOnTop: true,
        backgroundColor: '#f9fafb',
        webPreferences: {
          contextIsolation: true,
          nodeIntegration: false,
          sandbox: true,
        },
      });
      splashWindow.setMenuBarVisibility(false);
      splashWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));
      splashWindow.webContents.on('will-navigate', (event) => event.preventDefault());
      splashWindow.once('ready-to-show', () => {
        if (!splashWindow || splashWindow.isDestroyed()) return;
        splashWindow.show();
        log('startup window shown');
      });
      void splashWindow.loadFile(path.join(__dirname, 'startup.html'));
    }

    revealTimer = setTimeout(() => reveal('startup-timeout'), STARTUP_REVEAL_TIMEOUT_MS);
  }

  function focusSplash() {
    if (!splashWindow || splashWindow.isDestroyed()) return false;
    splashWindow.show();
    splashWindow.focus();
    return true;
  }

  return { begin, close: closeSplash, focusSplash, reveal };
}

module.exports = { createStartupExperience, getStartupWindowBounds };
