import { getCloudinary } from '../config/cloudinary.ts';
import { AppError } from '../utils/app-error.ts';
import type { UploadApiResponse } from 'cloudinary';

const PROFILE_PHOTO_FOLDER = 'devsangam/profile-photos';

interface UploadProfileAvatarInput {
  userId: string;
  buffer: Buffer;
}

function isJpeg(buffer: Buffer) {
  return (
    buffer.length >= 3 &&
    buffer[0] === 0xff &&
    buffer[1] === 0xd8 &&
    buffer[2] === 0xff
  );
}

function isPng(buffer: Buffer) {
  return (
    buffer.length >= 8 &&
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  );
}

function isWebp(buffer: Buffer) {
  if (buffer.length < 12) {
    return false;
  }

  return (
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  );
}

function isSupportedImageBuffer(buffer: Buffer) {
  return isJpeg(buffer) || isPng(buffer) || isWebp(buffer);
}

function uploadBuffer(
  buffer: Buffer,
  userId: string
): Promise<UploadApiResponse> {
  const cloudinary = getCloudinary();

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: 'image',

        asset_folder: PROFILE_PHOTO_FOLDER,

        public_id: `devsangam-profile-${userId}`,

        overwrite: true,

        invalidate: true,

        format: 'webp',

        transformation: [
          {
            width: 512,

            height: 512,

            crop: 'fill',

            gravity: 'auto',
          },

          {
            quality: 'auto:good',

            flags: 'strip_profile',
          },
        ],
      },

      (error, result) => {
        if (error) {
          reject(error);

          return;
        }

        if (!result) {
          reject(new Error('Cloudinary returned no upload result.'));

          return;
        }

        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
}

export async function uploadProfileAvatar({
  userId,
  buffer,
}: UploadProfileAvatarInput) {
  /*
   * MIME headers are controlled by
   * the client, so verify the real
   * image signature as well.
   */
  if (!isSupportedImageBuffer(buffer)) {
    throw new AppError(
      400,
      'AVATAR_CONTENT_INVALID',
      'Profile photo content is not a supported image.'
    );
  }

  const uploadResult = await uploadBuffer(buffer, userId);

  /*
   * Cloudinary returns a versioned HTTPS
   * delivery URL after every upload.
   *
   * When the same public ID is overwritten,
   * the version changes. Saving this URL
   * avoids stale CDN/browser copies and
   * makes avatar replacement immediate.
   */
  const avatarUrl = uploadResult.secure_url;

  return {
    avatarUrl,

    publicId: uploadResult.public_id,
  };
}

export async function deleteProfileAvatar(publicId: string) {
  const cloudinary = getCloudinary();

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: 'image',

    invalidate: true,
  });

  if (result.result !== 'ok' && result.result !== 'not found') {
    throw new Error(`Unexpected Cloudinary delete result: ${result.result}`);
  }
}
