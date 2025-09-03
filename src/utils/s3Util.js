import { PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client, BUCKET_NAME } from '../config/s3.js';
import fs from 'fs/promises';

/**
 * Upload a file to S3
 * @param {string} filePath - Local path to the file
 * @param {string} key - S3 key (folder path + filename)
 * @param {string} contentType - MIME type of the file
 * @returns {Promise<string>} - S3 URL of the uploaded file
 */
export async function uploadToS3(filePath, key, contentType = 'image/jpeg') {
  try {
    // Read file from local path
    const fileBuffer = await fs.readFile(filePath);
    
    // Create upload command
    const uploadCommand = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      // Removed ACL setting since bucket has ACLs disabled
    });

    // Upload to S3
    await s3Client.send(uploadCommand);
    
    // Generate S3 URL
    const s3Url = `https://${BUCKET_NAME}.s3.amazonaws.com/${key}`;
    
    console.log(`✅ File uploaded to S3: ${s3Url}`);
    return s3Url;
    
  } catch (error) {
    console.error('❌ S3 upload failed:', error);
    throw new Error(`Failed to upload file to S3: ${error.message}`);
  }
}

/**
 * Delete a file from S3
 * @param {string} key - S3 key of the file to delete
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteFromS3(key) {
  try {
    const deleteCommand = new DeleteObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    await s3Client.send(deleteCommand);
    console.log(`✅ File deleted from S3: ${key}`);
    return true;
    
  } catch (error) {
    console.error('❌ S3 delete failed:', error);
    throw new Error(`Failed to delete file from S3: ${error.message}`);
  }
}

/**
 * Generate a pre-signed URL for direct upload to S3
 * @param {string} key - S3 key where file will be uploaded
 * @param {string} contentType - MIME type of the file
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<string>} - Pre-signed upload URL
 */
export async function generatePresignedUploadUrl(key, contentType, expiresIn = 3600) {
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`✅ Pre-signed upload URL generated: ${key}`);
    return presignedUrl;
    
  } catch (error) {
    console.error('❌ Failed to generate pre-signed URL:', error);
    throw new Error(`Failed to generate pre-signed URL: ${error.message}`);
  }
}

/**
 * Generate a pre-signed URL for downloading from S3
 * @param {string} key - S3 key of the file
 * @param {number} expiresIn - URL expiration time in seconds (default: 3600)
 * @returns {Promise<string>} - Pre-signed download URL
 */
export async function generatePresignedDownloadUrl(key, expiresIn = 3600) {
  try {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: key,
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    console.log(`✅ Pre-signed download URL generated: ${key}`);
    return presignedUrl;
    
  } catch (error) {
    console.error('❌ Failed to generate pre-signed download URL:', error);
    throw new Error(`Failed to generate pre-signed download URL: ${error.message}`);
  }
}

/**
 * Extract S3 key from S3 URL
 * @param {string} s3Url - Full S3 URL
 * @returns {string} - S3 key
 */
export function extractS3KeyFromUrl(s3Url) {
  try {
    const url = new URL(s3Url);
    const pathParts = url.pathname.split('/');
    // Remove the first empty element and join the rest
    return pathParts.slice(1).join('/');
  } catch (error) {
    console.error('❌ Failed to extract S3 key from URL:', error);
    throw new Error('Invalid S3 URL format');
  }
}
