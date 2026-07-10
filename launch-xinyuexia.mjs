import { execFileSync, spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { createWriteStream, existsSync, openSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { rotateLogFile } from './scripts/logRotation.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const mode = process.argv[2] ?? 'desktop';
const port = 18328;
const baseUrl = `http://127.0.0.1:${port}/`;
const startupUrl = `${baseUrl}#/novels`;
const launcherLogFile = path.join(root, 'launcher.log');
const viteLogFile = path.join(root, 'dev-server.log');
const electronLogFile = path.join(root, 'electron-dev.log');
const pidFile = path.join(root, 'dev-server.pid');
const devServerFingerprintFile = path.join(root, '.dev-server-fingerprint');
const viteEntry = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');
const electronExe = path.join(root, 'node_modules', 'electron', 'dist', 'electron.exe');
const electronInstaller = path.join(root, 'node_modules', 'electron', 'install.js');
const electronMain = path.join(root, 'electron', 'main.cjs');
const nodeDir = path.dirname(process.execPath);

rotateLogFile(launcherLogFile);
const logStream = createWriteStream(launcherLogFile, { flags: 'a' });
const log = (message) => {
  const line = `[${new Date().toISOString()}] ${message}\n`;
  logStream.write(line);
};

process.on('exit', () => {
  try {
    logStream.end();
  } catch {
    // ignore
  }
});

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

function ensureFileExists(filePath, label) {
  if (!existsSync(filePath)) {
    throw new Error(`${label} 不存在: ${filePath}`);
  }
}

function findExecutableInPath(fileName) {
  const pathValue = process.env.PATH || '';
  const parts = pathValue.split(path.delimiter).filter(Boolean);
  return parts.map((entry) => path.join(entry, fileName)).find((candidate) => existsSync(candidate)) ?? null;
}

function resolveNpmCommand() {
  if (process.platform !== 'win32') {
    return { command: 'npm', args: [] };
  }

  const candidates = [
    path.join(root, 'runtime', 'node', 'npm.cmd'),
    path.join(root, 'npm.cmd'),
    path.join(nodeDir, 'npm.cmd'),
    path.join(
      process.env.USERPROFILE || '',
      '.cache',
      'codex-runtimes',
      'codex-primary-runtime',
      'dependencies',
      'node',
      'bin',
      'npm.cmd',
    ),
    'C:\\Program Files\\nodejs\\npm.cmd',
    'C:\\Program Files (x86)\\nodejs\\npm.cmd',
    findExecutableInPath('npm.cmd'),
  ].filter(Boolean);

  const npmCmd = candidates.find((candidate) => existsSync(candidate));
  if (npmCmd) return { command: npmCmd, args: [] };

  const npmCli = [
    path.join(root, 'runtime', 'node', 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(root, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(nodeDir, 'node_modules', 'npm', 'bin', 'npm-cli.js'),
    path.join(
      process.env.USERPROFILE || '',
      '.cache',
      'codex-runtimes',
      'codex-primary-runtime',
      'dependencies',
      'node',
      'bin',
      'node_modules',
      'npm',
      'bin',
      'npm-cli.js',
    ),
  ].find((candidate) => existsSync(candidate));

  if (npmCli) return { command: process.execPath, args: [npmCli] };

  throw new Error(
    'npm was not found. Install Node.js with npm, or place a portable Node runtime at runtime\\node before starting Yuexia.',
  );
}

function removeIfExists(targetPath) {
  if (!existsSync(targetPath)) return;
  try {
    rmSync(targetPath, { recursive: true, force: true });
    log(`removed stale dependency path ${targetPath}`);
  } catch (error) {
    log(
      `could not remove stale dependency path ${targetPath}: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

function getProcessCommandLine(pid) {
  try {
    return execFileSync(
      'powershell.exe',
      ['-NoProfile', '-Command', `(Get-CimInstance Win32_Process -Filter "ProcessId=${pid}").CommandLine`],
      { encoding: 'utf8', windowsHide: true },
    ).trim();
  } catch {
    return '';
  }
}

function isViteDevServerProcess(pid) {
  if (!Number.isFinite(pid) || !isProcessAlive(pid)) return false;
  const commandLine = getProcessCommandLine(pid).toLowerCase();
  return commandLine.includes('vite') && commandLine.includes(String(port)) && commandLine.includes(root.toLowerCase());
}

function ensureDependencies() {
  if (existsSync(viteEntry) && existsSync(electronExe)) return;

  if (!existsSync(viteEntry) || !existsSync(electronInstaller)) {
    log('dependencies missing; running npm install');
    removeIfExists(path.join(root, 'node_modules', '.vite-temp'));
    const npmCommand = resolveNpmCommand();
    log(`npm command=${npmCommand.command} args=${npmCommand.args.join(' ')}`);
    const result = spawnSync(npmCommand.command, [...npmCommand.args, 'install'], {
      cwd: root,
      encoding: 'utf8',
      windowsHide: true,
    });

    if (result.stdout) log(`npm install stdout:\n${result.stdout}`);
    if (result.stderr) log(`npm install stderr:\n${result.stderr}`);

    if (result.status !== 0) {
      throw new Error(
        `npm install failed with exit code ${result.status}. Close any running Electron or Yuexia windows and try again.`,
      );
    }
  }

  if (!existsSync(electronExe)) {
    ensureFileExists(electronInstaller, 'Electron 运行时安装器');
    const electronMirror =
      process.env.ELECTRON_MIRROR || process.env.XINYUEXIA_ELECTRON_MIRROR || 'https://npmmirror.com/mirrors/electron/';
    log(`Electron runtime missing; running installer mirror=${electronMirror}`);
    const installResult = spawnSync(process.execPath, [electronInstaller], {
      cwd: root,
      encoding: 'utf8',
      windowsHide: true,
      timeout: 5 * 60 * 1000,
      env: { ...process.env, ELECTRON_MIRROR: electronMirror },
    });
    if (installResult.stdout) log(`Electron install stdout:\n${installResult.stdout}`);
    if (installResult.stderr) log(`Electron install stderr:\n${installResult.stderr}`);
    if (installResult.status !== 0 || !existsSync(electronExe)) {
      throw new Error(`Electron runtime install failed with exit code ${installResult.status ?? 'timeout'}.`);
    }
  }

  ensureFileExists(viteEntry, 'Vite 入口文件');
  ensureFileExists(electronExe, 'Electron 可执行文件');
}

function cleanupPidFile() {
  try {
    if (existsSync(pidFile)) {
      const pid = Number.parseInt(readFileSync(pidFile, 'utf8').trim(), 10);
      if (!isViteDevServerProcess(pid)) {
        writeFileSync(pidFile, '');
        log(`stale pid file cleared pid=${pid}`);
      }
    }
  } catch (error) {
    log(`pid file cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function getDevServerFingerprint() {
  const fingerprintFiles = ['package.json', 'package-lock.json', 'vite.config.ts'];
  const hash = createHash('sha256');
  fingerprintFiles.forEach((fileName) => {
    const filePath = path.join(root, fileName);
    hash.update(fileName);
    hash.update(existsSync(filePath) ? readFileSync(filePath) : 'missing');
  });
  return hash.digest('hex');
}

function isDevServerFingerprintCurrent() {
  try {
    return readFileSync(devServerFingerprintFile, 'utf8').trim() === getDevServerFingerprint();
  } catch {
    return false;
  }
}

function writeDevServerFingerprint() {
  writeFileSync(devServerFingerprintFile, getDevServerFingerprint());
}

async function isReady(url) {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 800);
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return response.status >= 200 && response.status < 500;
  } catch {
    return false;
  }
}

async function wait(ms) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForStableDevServer() {
  for (let i = 0; i < 8; i += 1) {
    if (await isReady(startupUrl)) {
      await wait(300);
      return;
    }
    await wait(250);
  }
  await wait(800);
}

function cleanupElectronMainProcesses() {
  try {
    const escapedElectronMain = electronMain.replace(/'/g, "''");
    execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'electron.exe' -and $_.CommandLine -like '*${escapedElectronMain}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`,
      ],
      { stdio: 'ignore' },
    );
    log('stale electron main processes cleaned');
  } catch {
    // ignore when there is nothing to stop
  }
}

function cleanupProjectViteProcesses() {
  if (process.platform !== 'win32') {
    try {
      const pid = Number.parseInt(readFileSync(pidFile, 'utf8').trim(), 10);
      if (isViteDevServerProcess(pid)) process.kill(pid, 'SIGTERM');
    } catch {
      // ignore when there is nothing to stop
    }
    return;
  }

  try {
    const escapedViteEntry = viteEntry.replace(/'/g, "''");
    execFileSync(
      'powershell.exe',
      [
        '-NoProfile',
        '-Command',
        `Get-CimInstance Win32_Process | Where-Object { $_.Name -eq 'node.exe' -and $_.CommandLine -like '*${escapedViteEntry}*' -and $_.CommandLine -like '*--port ${port}*' } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force }`,
      ],
      { stdio: 'ignore' },
    );
    log('stale project vite processes cleaned');
  } catch {
    // ignore when there is nothing to stop
  }
}

function startVite() {
  ensureFileExists(viteEntry, 'Vite 启动文件');
  rotateLogFile(viteLogFile);
  const outFd = openSync(viteLogFile, 'a');
  const child = spawn(process.execPath, [viteEntry, '--host', '127.0.0.1', '--port', String(port)], {
    cwd: root,
    detached: true,
    stdio: ['ignore', outFd, outFd],
    windowsHide: true,
  });
  writeFileSync(pidFile, String(child.pid));
  writeDevServerFingerprint();
  child.unref();
  log(`vite started pid=${child.pid}`);
}

function startElectron(loadDist = false, startHash = '', disableAdjustmentMode = false) {
  ensureFileExists(electronExe, 'Electron 可执行文件');
  ensureFileExists(electronMain, 'Electron 主进程文件');
  cleanupElectronMainProcesses();
  rotateLogFile(electronLogFile);
  const outFd = openSync(electronLogFile, 'a');
  const child = spawn(electronExe, [electronMain], {
    cwd: root,
    detached: true,
    stdio: ['ignore', outFd, outFd],
    windowsHide: true,
    env: {
      ...process.env,
      ...(loadDist ? { XINYUEXIA_LOAD_DIST: '1' } : {}),
      ...(startHash ? { XINYUEXIA_START_HASH: startHash } : {}),
      ...(disableAdjustmentMode ? { XINYUEXIA_DISABLE_ADJUSTMENT_MODE: '1' } : {}),
    },
  });
  child.unref();
  log(`electron started pid=${child.pid} loadDist=${loadDist ? '1' : '0'}`);
}

async function ensureDevServer() {
  cleanupPidFile();

  if (await isReady(baseUrl)) {
    if (isDevServerFingerprintCurrent()) {
      log('dev server already ready');
      return;
    }
    log('dev server dependency fingerprint changed; restarting');
    cleanupProjectViteProcesses();
    for (let attempt = 0; attempt < 30 && (await isReady(baseUrl)); attempt += 1) {
      await wait(100);
    }
    startVite();
  }

  try {
    if (existsSync(pidFile)) {
      const pid = Number.parseInt(readFileSync(pidFile, 'utf8').trim(), 10);
      if (Number.isFinite(pid) && isProcessAlive(pid)) {
        log(`vite process already running pid=${pid}`);
      } else {
        log(`vite pid file stale pid=${pid}`);
        startVite();
      }
    } else {
      startVite();
    }
  } catch (error) {
    log(`failed to start vite: ${error instanceof Error ? error.message : String(error)}`);
    throw error;
  }

  for (let i = 0; i < 160; i += 1) {
    if (await isReady(baseUrl)) {
      log('dev server ready');
      await waitForStableDevServer();
      log('dev server stabilized');
      return;
    }
    await wait(250);
  }

  throw new Error('dev server timeout');
}

async function ensureElectronWindow(loadDist = false, startHash = '', disableAdjustmentMode = false) {
  startElectron(loadDist, startHash, disableAdjustmentMode);
  await wait(loadDist ? 1000 : 1800);
}

async function main() {
  log(`launcher mode=${mode} root=${root} port=${port} node=${process.version}`);
  ensureDependencies();

  if (mode === 'dist') {
    await ensureElectronWindow(true);
    return;
  }

  await ensureDevServer();

  if (mode === 'adjustment') {
    await ensureElectronWindow(false, '#/adjustment-mode');
    return;
  }

  if (mode === 'desktop') {
    await ensureElectronWindow(false, '#/novels', true);
    return;
  }

  if (mode === 'web') {
    spawn('rundll32.exe', ['url.dll,FileProtocolHandler', startupUrl], {
      detached: true,
      windowsHide: true,
      stdio: 'ignore',
    }).unref();
    log(`browser opened ${startupUrl}`);
    return;
  }

  throw new Error(`unknown mode: ${mode}`);
}

main().catch((error) => {
  log(`launcher error: ${error instanceof Error ? (error.stack ?? error.message) : String(error)}`);
  process.exitCode = 1;
});
