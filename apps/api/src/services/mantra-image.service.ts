import { getCloudinary } from '../config/cloudinary.ts';
import { AppError } from '../utils/app-error.ts';
import { randomUUID } from 'node:crypto';
import sharp from 'sharp';

export const MAX_MANTRA_IMAGE_BYTES = 5 * 1024 * 1024;
export const MANTRA_IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

export async function compressMantraImage(buffer: Buffer, mime: string) {
  if (!MANTRA_IMAGE_MIME_TYPES.has(mime) || !buffer.length || buffer.length > MAX_MANTRA_IMAGE_BYTES)
    throw new AppError(400, 'INVALID_IMAGE', 'Use a JPEG, PNG or WebP image up to 5 MB.');
  try {
    const image = sharp(buffer, { limitInputPixels: 16_000_000, failOn: 'warning' });
    const metadata = await image.metadata();
    const expected = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' }[mime];
    if (metadata.format !== expected || (metadata.pages ?? 1) > 1) throw new Error('Invalid format');
    return await image.rotate()
      .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 82, effort: 4 }).timeout({ seconds: 10 })
      .toBuffer({ resolveWithObject: true });
  } catch {
    throw new AppError(400, 'INVALID_IMAGE', 'Image content is invalid, animated or exceeds the 16 megapixel limit.');
  }
}

export async function uploadMantraImage(buffer: Buffer, mime: string) {
  const compressed = await compressMantraImage(buffer, mime);
  const publicId = `devsangam/mantras/${randomUUID()}`;
  try {
    const result = await new Promise<{ secure_url: string; public_id: string }>((resolve, reject) => {
      const stream = getCloudinary().uploader.upload_stream({ resource_type: 'image', public_id: publicId, format: 'webp', overwrite: false, timeout: 15000 }, (error, result) => {
        if (error || !result) reject(error ?? new Error('Image storage failed'));
        else resolve(result);
      });
      stream.end(compressed.data);
    });
    if (!result.secure_url.startsWith('https://')) throw new Error('Invalid image delivery URL');
    return {
      url: result.secure_url, publicId: result.public_id,
      bytes: compressed.data.length, width: compressed.info.width, height: compressed.info.height,
    };
  } catch {
    throw new AppError(503, 'IMAGE_STORAGE_UNAVAILABLE', 'Image storage is unavailable. Check Cloudinary configuration and retry.');
  }
}

export async function deleteMantraImage(publicId: string) {
  if (!/^devsangam\/mantras\/[a-f\d-]{36}$/.test(publicId)) return;
  try { await getCloudinary().uploader.destroy(publicId, { resource_type: 'image', invalidate: true }); }
  catch { console.warn('Mantra image cleanup deferred: provider unavailable.'); }
}
