import cloudinary from '../config/cloudinary.js'; // or '../utils/cloudinary.js'
import fs from 'fs/promises';

export async function uploadToCloudinary(filePath, folder) {
  try {
    console.log('☁️ Starting Cloudinary upload:', filePath, 'to folder:', folder);
    console.log('🔑 Cloudinary config check:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME ? 'SET' : 'NOT SET',
      api_key: process.env.CLOUDINARY_API_KEY ? 'SET' : 'NOT SET',
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'SET' : 'NOT SET'
    });
    
    const url = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload(
        filePath,
        { folder },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary upload error:', error);
            reject(error);
          } else {
            console.log('✅ Cloudinary upload success:', result.secure_url);
            resolve(result.secure_url);
          }
        }
      );
    });
    
    // Clean up temp file after successful upload
    try {
      await fs.unlink(filePath);
      console.log('🗑️ Temp file cleaned up:', filePath);
    } catch (unlinkError) {
      console.warn(`Failed to delete temp file ${filePath}:`, unlinkError.message);
    }
    
    return url;
  } catch (error) {
    console.error('❌ Cloudinary upload failed:', error);
    // Clean up temp file even if upload fails
    try {
      await fs.unlink(filePath);
      console.log('🗑️ Temp file cleaned up after error:', filePath);
    } catch (unlinkError) {
      console.warn(`Failed to delete temp file ${filePath}:`, unlinkError.message);
    }
    throw error;
  }
}

export function deleteFromCloudinary(publicId) {
  return cloudinary.uploader.destroy(publicId);
}