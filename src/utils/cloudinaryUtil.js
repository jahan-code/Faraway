import cloudinary from '../config/cloudinary.js'; // or '../utils/cloudinary.js'
import fs from 'fs/promises';

export async function uploadToCloudinary(filePath, folder) {
  try {
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
    
    // Clean up temp file after successful upload
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.warn(`Failed to delete temp file ${filePath}:`, unlinkError.message);
    }
    
    return url;
  } catch (error) {
    // Clean up temp file even if upload fails
    try {
      await fs.unlink(filePath);
    } catch (unlinkError) {
      console.warn(`Failed to delete temp file ${filePath}:`, unlinkError.message);
    }
    throw error;
  }
}

export function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}