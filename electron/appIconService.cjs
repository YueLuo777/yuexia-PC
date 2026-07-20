const fs = require('node:fs');
const path = require('node:path');

const CUSTOM_APP_ICON_FILE_NAME = 'custom-app-icon.png';
const CUSTOM_APP_ICON_SOURCE_FILE_NAME = 'custom-app-icon-source.json';
const DEFAULT_APP_ICON_FILE_NAME = 'default-app-icon.png';
const PROJECT_APP_ICON_FILE_NAMES = ['fengmian.png', 'fengmian.jpg', 'fengmian.jpeg', 'fengmian.webp', 'fengmian.ico'];
const PROJECT_APP_ICON_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.ico']);

function createAppIconService({ app, dialog, nativeImage, appIcon, projectRoot, getMainWindow }) {
  const projectAppIconDir = path.join(projectRoot, 'ruanjianfengmian');

  const getCustomAppIconPath = () => path.join(app.getPath('userData'), CUSTOM_APP_ICON_FILE_NAME);
  const getDefaultAppIconPath = () => path.join(app.getPath('userData'), DEFAULT_APP_ICON_FILE_NAME);
  const getCustomAppIconSourcePath = () => path.join(app.getPath('userData'), CUSTOM_APP_ICON_SOURCE_FILE_NAME);

  function readSelectedProjectIconFileName() {
    try {
      const sourcePath = getCustomAppIconSourcePath();
      if (!fs.existsSync(sourcePath)) return '';
      const parsed = JSON.parse(fs.readFileSync(sourcePath, 'utf8'));
      return typeof parsed?.fileName === 'string' ? parsed.fileName : '';
    } catch {
      return '';
    }
  }

  function saveSelectedProjectIconFileName(fileName) {
    fs.mkdirSync(path.dirname(getCustomAppIconSourcePath()), { recursive: true });
    fs.writeFileSync(getCustomAppIconSourcePath(), JSON.stringify({ fileName }, null, 2), 'utf8');
  }

  function clearSelectedProjectIconFileName() {
    const sourcePath = getCustomAppIconSourcePath();
    if (fs.existsSync(sourcePath)) fs.unlinkSync(sourcePath);
  }

  function getProjectAppIconPath() {
    return (
      PROJECT_APP_ICON_FILE_NAMES.map((fileName) => path.join(projectAppIconDir, fileName)).find((filePath) =>
        fs.existsSync(filePath),
      ) ?? null
    );
  }

  function readProjectAppIcons() {
    if (!fs.existsSync(projectAppIconDir)) return [];
    const selectedFileName = readSelectedProjectIconFileName();
    return fs
      .readdirSync(projectAppIconDir, { withFileTypes: true })
      .filter((entry) => entry.isFile() && PROJECT_APP_ICON_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
      .map((entry) => {
        const filePath = path.join(projectAppIconDir, entry.name);
        const image = nativeImage.createFromPath(filePath);
        if (image.isEmpty()) return null;
        return {
          fileName: entry.name,
          filePath,
          dataUrl: image.resize({ width: 128, height: 128, quality: 'best' }).toDataURL(),
          isSelected: entry.name === selectedFileName,
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.fileName.localeCompare(b.fileName, 'zh-CN'));
  }

  function getRoundedRectCoverage(x, y, width, height, radius) {
    const samples = 3;
    let covered = 0;
    for (let sy = 0; sy < samples; sy += 1) {
      for (let sx = 0; sx < samples; sx += 1) {
        const cx = x + (sx + 0.5) / samples;
        const cy = y + (sy + 0.5) / samples;
        const innerX = Math.max(radius, Math.min(cx, width - radius));
        const innerY = Math.max(radius, Math.min(cy, height - radius));
        const dx = cx - innerX;
        const dy = cy - innerY;
        if (dx * dx + dy * dy <= radius * radius) covered += 1;
      }
    }
    return covered / (samples * samples);
  }

  function roundAppIconImage(sourceImage) {
    if (!sourceImage || sourceImage.isEmpty()) return sourceImage;
    const image = sourceImage.resize({ width: 256, height: 256, quality: 'best' });
    const size = image.getSize();
    if (!size.width || !size.height) return image;
    const bitmap = image.toBitmap();
    const radius = Math.round(Math.min(size.width, size.height) * 0.22);

    for (let y = 0; y < size.height; y += 1) {
      for (let x = 0; x < size.width; x += 1) {
        const offset = (y * size.width + x) * 4;
        bitmap[offset + 3] = Math.round(
          bitmap[offset + 3] * getRoundedRectCoverage(x, y, size.width, size.height, radius),
        );
      }
    }
    return nativeImage.createFromBitmap(bitmap, size);
  }

  function saveIconImage(targetPath, sourceImage) {
    if (!sourceImage || sourceImage.isEmpty()) {
      return { ok: false, message: '无法读取这个图片，请换一张 PNG、JPG、WEBP 或 ICO。' };
    }
    fs.mkdirSync(path.dirname(targetPath), { recursive: true });
    fs.writeFileSync(targetPath, roundAppIconImage(sourceImage).toPNG());
    return { ok: true };
  }

  function saveCustomAppIconFromPath(sourcePath, sourceFileName = '') {
    const saved = saveIconImage(getCustomAppIconPath(), nativeImage.createFromPath(sourcePath));
    if (!saved.ok) return saved;
    if (sourceFileName) saveSelectedProjectIconFileName(sourceFileName);
    else clearSelectedProjectIconFileName();
    return { ok: true };
  }

  function saveCustomAppIconFromDataUrl(dataUrl, sourceFileName = '') {
    if (typeof dataUrl !== 'string' || !dataUrl.startsWith('data:image/')) {
      return { ok: false, message: '没有读取到可用的首页图标。' };
    }
    const saved = saveIconImage(getCustomAppIconPath(), nativeImage.createFromDataURL(dataUrl));
    if (!saved.ok) return saved;
    if (sourceFileName) saveSelectedProjectIconFileName(sourceFileName);
    else clearSelectedProjectIconFileName();
    return { ok: true };
  }

  function getCurrentAppIconPath() {
    const customIcon = getCustomAppIconPath();
    const defaultIcon = getDefaultAppIconPath();
    const projectIcon = getProjectAppIconPath();
    if (fs.existsSync(customIcon)) return customIcon;
    if (fs.existsSync(defaultIcon)) return defaultIcon;
    if (projectIcon) return projectIcon;
    return appIcon;
  }

  function readCurrentAppIcon() {
    const iconPath = getCurrentAppIconPath();
    const image = nativeImage.createFromPath(iconPath);
    const defaultIconPath = getDefaultAppIconPath();
    return {
      ok: !image.isEmpty(),
      isCustom: iconPath !== appIcon && iconPath !== defaultIconPath,
      isDefaultOverride: iconPath === defaultIconPath,
      projectIconDir: projectAppIconDir,
      acceptedFileNames: PROJECT_APP_ICON_FILE_NAMES,
      selectedProjectIconFileName: readSelectedProjectIconFileName(),
      projectIcons: readProjectAppIcons(),
      defaultIconPath,
      iconPath,
      dataUrl: image.isEmpty() ? '' : image.toDataURL(),
    };
  }

  function applyWindowIcon(targetWindow = getMainWindow()) {
    if (!targetWindow || targetWindow.isDestroyed()) return readCurrentAppIcon();
    const icon = nativeImage.createFromPath(getCurrentAppIconPath());
    if (!icon.isEmpty()) targetWindow.setIcon(icon);
    return readCurrentAppIcon();
  }

  function registerIpcHandlers(registerTrustedIpcHandler) {
    registerTrustedIpcHandler('app-icon:read', async () => readCurrentAppIcon());
    registerTrustedIpcHandler('app-icon:select', async () => {
      const mainWindow = getMainWindow();
      if (!mainWindow || mainWindow.isDestroyed()) return { ok: false, message: '窗口未就绪。' };
      const result = await dialog.showOpenDialog(mainWindow, {
        title: '选择软件图标图片',
        properties: ['openFile'],
        filters: [
          { name: '图片文件', extensions: ['png', 'jpg', 'jpeg', 'webp', 'ico'] },
          { name: '所有文件', extensions: ['*'] },
        ],
      });
      if (result.canceled || result.filePaths.length === 0) return { ok: false, canceled: true };
      try {
        const saved = saveCustomAppIconFromPath(result.filePaths[0]);
        if (!saved.ok) return saved;
        return { ...applyWindowIcon(mainWindow), ok: true, message: '图标已更新。' };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '保存图标失败。' };
      }
    });

    registerTrustedIpcHandler('app-icon:use-project-icon', async (_event, fileName) => {
      if (typeof fileName !== 'string' || path.basename(fileName) !== fileName) {
        return { ...readCurrentAppIcon(), ok: false, message: '图标文件名无效。' };
      }
      if (!PROJECT_APP_ICON_EXTENSIONS.has(path.extname(fileName).toLowerCase())) {
        return { ...readCurrentAppIcon(), ok: false, message: '只能选择 PNG、JPG、WEBP 或 ICO 图片。' };
      }
      const sourcePath = path.join(projectAppIconDir, fileName);
      if (!fs.existsSync(sourcePath)) {
        return { ...readCurrentAppIcon(), ok: false, message: '没有找到这张图标图片。' };
      }
      try {
        const saved = saveCustomAppIconFromPath(sourcePath, fileName);
        if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
        return { ...applyWindowIcon(), ok: true, message: '软件图标已切换。' };
      } catch (error) {
        return {
          ...readCurrentAppIcon(),
          ok: false,
          message: error instanceof Error ? error.message : '切换图标失败。',
        };
      }
    });

    registerTrustedIpcHandler('app-icon:use-data-url', async (_event, dataUrl, sourceFileName = 'home-icon.png') => {
      try {
        const saved = saveCustomAppIconFromDataUrl(dataUrl, sourceFileName);
        if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
        return { ...applyWindowIcon(), ok: true, message: '软件图标已切换为首页图标。' };
      } catch (error) {
        return {
          ...readCurrentAppIcon(),
          ok: false,
          message: error instanceof Error ? error.message : '切换首页图标失败。',
        };
      }
    });

    registerTrustedIpcHandler('app-icon:make-default', async () => {
      try {
        const saved = saveIconImage(getDefaultAppIconPath(), nativeImage.createFromPath(getCurrentAppIconPath()));
        if (!saved.ok) return { ...readCurrentAppIcon(), ...saved };
        return { ...applyWindowIcon(), ok: true, message: '已将当前图标设为默认图标。' };
      } catch (error) {
        return {
          ...readCurrentAppIcon(),
          ok: false,
          message: error instanceof Error ? error.message : '设置默认图标失败。',
        };
      }
    });

    registerTrustedIpcHandler('app-icon:reset', async () => {
      try {
        const customIcon = getCustomAppIconPath();
        if (fs.existsSync(customIcon)) fs.unlinkSync(customIcon);
        clearSelectedProjectIconFileName();
        return { ...applyWindowIcon(), ok: true, message: '已恢复默认图标。' };
      } catch (error) {
        return { ok: false, message: error instanceof Error ? error.message : '恢复默认图标失败。' };
      }
    });
  }

  return { getCurrentAppIconPath, registerIpcHandlers };
}

module.exports = { createAppIconService };
