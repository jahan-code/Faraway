import cloudinary from '../config/cloudinary.js'; // or '../utils/cloudinary.js'
import fs from 'fs/promises';

export async function uploadToCloudinary(filePath, folder) {
  const url = await new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      filePath,
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
  });
  await fs.unlink(filePath); // Clean up temp file
  return url;
}

export function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}