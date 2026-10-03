import { AppError } from '../utils/app-error.ts';
import { BlobServiceClient } from '@azure/storage-blob';
import { randomUUID } from 'node:crypto';
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const MAX_PDF_BYTES = 20 * 1024 * 1024;
function directory() {
  return path.resolve(process.env.PRIVATE_ASSET_DIR || '.private-assets');
}
async function container() {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.PRIVATE_DOWNLOADS_ENABLED !== 'true'
  ) {
    throw new AppError(
      503,
      'ASSET_UNAVAILABLE',
      'File storage is unavailable.'
    );
  }
  const connection = process.env.AZURE_STORAGE_CONNECTION_STRING;
  if (!connection) {
    if (process.env.NODE_ENV === 'production')
      throw new AppError(
        503,
        'ASSET_UNAVAILABLE',
        'File storage is unavailable.'
      );
    return null;
  }
  const client = BlobServiceClient.fromConnectionString(
    connection
  ).getContainerClient(
    process.env.AZURE_PRIVATE_CONTAINER || 'devsangam-private'
  );
  const properties = await client.getProperties();
  if (properties.blobPublicAccess)
    throw new AppError(
      503,
      'ASSET_UNAVAILABLE',
      'File storage is unavailable.'
    );
  return client;
}
export async function assertPrivatePdfAvailable(
  key: string | null | undefined
) {
  if (!key || !/^[a-f\d-]{36}\.pdf$/i.test(key))
    throw new AppError(404, 'FILE_UNAVAILABLE', 'File is unavailable.');
  try {
    const client = await container();
    const size = client
      ? (await client.getBlobClient(key).getProperties()).contentLength
      : (await stat(path.join(directory(), key))).size;
    if (!size || size > MAX_PDF_BYTES) throw new Error('Invalid size');
  } catch {
    throw new AppError(
      503,
      'ASSET_UNAVAILABLE',
      'File is temporarily unavailable. Please try again later.'
    );
  }
}
export async function storePrivatePdf(buffer: Buffer) {
  if (
    buffer.length > MAX_PDF_BYTES ||
    buffer.subarray(0, 5).toString() !== '%PDF-'
  ) {
    throw new AppError(
      400,
      'INVALID_PDF',
      'Upload a PDF no larger than 20 MB.'
    );
  }
  const key = `${randomUUID()}.pdf`;
  try {
    const client = await container();
    if (client)
      await client.getBlockBlobClient(key).uploadData(buffer, {
        blobHTTPHeaders: {
          blobContentType: 'application/pdf',
          blobCacheControl: 'no-store',
        },
      });
    else {
      await mkdir(directory(), { recursive: true });
      await writeFile(path.join(directory(), key), buffer, { flag: 'wx' });
    }
    return key;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      503,
      'ASSET_UNAVAILABLE',
      'File storage is unavailable.'
    );
  }
}
export async function readPrivatePdf(key: string | null | undefined) {
  if (!key || !/^[a-f\d-]{36}\.pdf$/i.test(key))
    throw new AppError(404, 'FILE_UNAVAILABLE', 'File is unavailable.');
  try {
    const client = await container();
    if (client) {
      const blob = client.getBlobClient(key);
      const properties = await blob.getProperties();
      if (!properties.contentLength || properties.contentLength > MAX_PDF_BYTES)
        throw new Error('Invalid size');
      return await blob.downloadToBuffer();
    }
    const filename = path.join(directory(), key);
    const details = await stat(filename);
    if (!details.isFile() || details.size > MAX_PDF_BYTES)
      throw new Error('Invalid size');
    return await readFile(filename);
  } catch {
    throw new AppError(
      503,
      'FILE_UNAVAILABLE',
      'File is temporarily unavailable. Please try again later.'
    );
  }
}
