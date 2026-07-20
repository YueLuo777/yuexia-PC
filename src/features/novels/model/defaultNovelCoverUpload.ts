export const DEFAULT_COVER_UPLOAD_ACCEPT = 'image/png,image/jpeg,image/webp';
export const DEFAULT_COVER_UPLOAD_MAX_BYTES = 10 * 1024 * 1024;
export const DEFAULT_COVER_UPLOAD_MAX_EDGE = 8192;
export const DEFAULT_COVER_OUTPUT_WIDTH = 1200;
export const DEFAULT_COVER_OUTPUT_HEIGHT = 1400;

const SUPPORTED_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);

export function calculateDefaultCoverCrop(sourceWidth: number, sourceHeight: number) {
  const targetRatio = DEFAULT_COVER_OUTPUT_WIDTH / DEFAULT_COVER_OUTPUT_HEIGHT;
  const sourceRatio = sourceWidth / sourceHeight;

  if (sourceRatio > targetRatio) {
    const width = sourceHeight * targetRatio;
    return { sx: (sourceWidth - width) / 2, sy: 0, width, height: sourceHeight };
  }

  const height = sourceWidth / targetRatio;
  return { sx: 0, sy: (sourceHeight - height) / 2, width: sourceWidth, height };
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.onload = () => resolve(String(reader.result ?? ''));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onerror = () => reject(new Error('图片格式不受支持或文件已损坏'));
    image.onload = () => resolve(image);
    image.src = src;
  });
}

export async function prepareDefaultNovelCover(file: File) {
  if (!SUPPORTED_TYPES.has(file.type)) throw new Error('仅支持 JPG、PNG、WebP 图片');
  if (file.size > DEFAULT_COVER_UPLOAD_MAX_BYTES) throw new Error('图片不能超过 10 MB');

  const sourceUrl = await readFileAsDataUrl(file);
  const image = await loadImage(sourceUrl);
  if (image.width > DEFAULT_COVER_UPLOAD_MAX_EDGE || image.height > DEFAULT_COVER_UPLOAD_MAX_EDGE) {
    throw new Error('图片长宽不能超过 8192 像素');
  }

  const canvas = document.createElement('canvas');
  canvas.width = DEFAULT_COVER_OUTPUT_WIDTH;
  canvas.height = DEFAULT_COVER_OUTPUT_HEIGHT;
  const context = canvas.getContext('2d');
  if (!context) throw new Error('图片处理失败');

  const crop = calculateDefaultCoverCrop(image.width, image.height);
  context.drawImage(
    image,
    crop.sx,
    crop.sy,
    crop.width,
    crop.height,
    0,
    0,
    DEFAULT_COVER_OUTPUT_WIDTH,
    DEFAULT_COVER_OUTPUT_HEIGHT,
  );
  return canvas.toDataURL('image/webp', 0.88);
}
