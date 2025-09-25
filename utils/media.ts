import * as fs from 'fs';
import * as path from 'path';

// Упростим тип
type PhotoInput =
  | string // file_id | http(s) URL | локальный путь
  | Buffer
  | { source: Buffer | NodeJS.ReadableStream; filename?: string };

function filenameFromUrl(u: string) {
  try {
    const { pathname } = new URL(u);
    const name = path.basename(pathname);
    return name && name !== '/' ? name : 'photo.jpg';
  } catch {
    return 'photo.jpg';
  }
}

function isProbablyLocalPath(s: string) {
  // относительный или абсолютный путь без схемы http/https
  return !/^https?:\/\//i.test(s);
}

export async function resolvePhotoOnce(photo: PhotoInput): Promise<PhotoInput> {
  // Buffer или объект { source } — уже ОК
  if (Buffer.isBuffer(photo)) return { source: photo, filename: 'photo.jpg' };
  if (typeof photo === 'object' && (photo as any).source) return photo as any;

  if (typeof photo === 'string') {
    // Локальный путь?
    if (isProbablyLocalPath(photo) && fs.existsSync(photo)) {
      return { source: fs.createReadStream(photo), filename: path.basename(photo) };
    }

    // HTTP(S) URL: скачиваем и шлём как upload
    if (/^https?:\/\//i.test(photo)) {
      const res = await fetch(photo);
      if (!res.ok) {
        throw new Error(`Photo URL not reachable: ${res.status} ${res.statusText}`);
      }
      const ab = await res.arrayBuffer();
      const buf = Buffer.from(ab);
      return { source: buf, filename: filenameFromUrl(photo) };
    }

    // Иначе считаем, что это file_id
    return photo; // ВАЖНО: этот file_id должен быть из ЭТОГО бота
  }

  throw new Error('Unsupported photo input type');
}