const fs = require('node:fs');
const path = require('node:path');

function createWindowStateStore({ app, sharedStateDirName, minWidth, minHeight }) {
  const stateFile = path.join(app.getPath('appData'), sharedStateDirName, 'window-state.json');
  const settingsFile = path.join(app.getPath('appData'), sharedStateDirName, 'window-settings.json');
  const legacyStateFiles = [
    path.join(app.getPath('userData'), 'window-state.json'),
    path.join(app.getPath('appData'), 'xinyuexia-desktop-dev', 'window-state.json'),
  ];
  const defaultSettings = { rememberSize: true };

  function parseState(filePath) {
    try {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (!parsed || typeof parsed !== 'object') return null;
      const width = Number(parsed.width);
      const height = Number(parsed.height);
      const x = Number(parsed.x);
      const y = Number(parsed.y);
      if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
      return {
        width: Math.max(minWidth, Math.round(width)),
        height: Math.max(minHeight, Math.round(height)),
        x: Number.isFinite(x) ? Math.round(x) : undefined,
        y: Number.isFinite(y) ? Math.round(y) : undefined,
        isMaximized: parsed.isMaximized === true,
      };
    } catch {
      return null;
    }
  }

  function normalizeSettings(input) {
    const settings = input && typeof input === 'object' ? input : {};
    return { rememberSize: settings.rememberSize !== false };
  }

  function readSettings() {
    try {
      if (!fs.existsSync(settingsFile)) return { ...defaultSettings };
      return normalizeSettings(JSON.parse(fs.readFileSync(settingsFile, 'utf8')));
    } catch {
      return { ...defaultSettings };
    }
  }

  function persistSettings(settings) {
    const normalized = normalizeSettings(settings);
    try {
      fs.mkdirSync(path.dirname(settingsFile), { recursive: true });
      fs.writeFileSync(settingsFile, JSON.stringify(normalized, null, 2), 'utf8');
    } catch (error) {
      console.warn('Failed to persist window settings:', error);
    }
    return normalized;
  }

  function persistState(state) {
    try {
      fs.mkdirSync(path.dirname(stateFile), { recursive: true });
      fs.writeFileSync(stateFile, JSON.stringify(state, null, 2), 'utf8');
    } catch (error) {
      console.warn('Failed to persist window state:', error);
    }
  }

  function readState() {
    if (!readSettings().rememberSize) return null;
    for (const filePath of [stateFile, ...legacyStateFiles]) {
      const state = parseState(filePath);
      if (!state) continue;
      if (filePath !== stateFile) persistState(state);
      return state;
    }
    return null;
  }

  function clearState() {
    try {
      if (fs.existsSync(stateFile)) fs.unlinkSync(stateFile);
    } catch (error) {
      console.warn('Failed to reset window state:', error);
    }
  }

  return {
    clearState,
    normalizeSettings,
    persistSettings,
    persistState,
    readSettings,
    readState,
  };
}

module.exports = { createWindowStateStore };
