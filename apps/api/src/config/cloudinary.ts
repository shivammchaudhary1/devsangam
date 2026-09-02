import { v2 as cloudinary } from 'cloudinary';

let configured = false;

function getRequiredEnv(name: string) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

export function getCloudinary() {
  if (configured) {
    return cloudinary;
  }

  cloudinary.config({
    cloud_name: getRequiredEnv('CLOUDINARY_CLOUD_NAME'),

    api_key: getRequiredEnv('CLOUDINARY_API_KEY'),

    api_secret: getRequiredEnv('CLOUDINARY_API_SECRET'),

    secure: true,
  });

  configured = true;

  return cloudinary;
}
