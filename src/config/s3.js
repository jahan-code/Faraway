import { S3Client } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';

dotenv.config();

// S3 Configuration
const s3Config = {
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
};

// Create S3 client
const s3Client = new S3Client(s3Config);

// S3 bucket name
const BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME;

// S3 bucket region
const BUCKET_REGION = process.env.AWS_REGION || 'us-east-1';

export { s3Client, BUCKET_NAME, BUCKET_REGION };
export default s3Client;
