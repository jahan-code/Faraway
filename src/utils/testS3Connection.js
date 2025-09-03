import { s3Client, BUCKET_NAME } from '../config/s3.js';
import { ListBucketsCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

/**
 * Test S3 connection and bucket access
 */
export async function testS3Connection() {
  try {
    console.log('🔍 Testing S3 connection...');
    console.log('testy')
    // Test 1: List buckets (basic connection test)
    console.log('📋 Testing bucket listing...');
    const listBucketsCommand = new ListBucketsCommand({});
    const bucketsResponse = await s3Client.send(listBucketsCommand);
    console.log('✅ Successfully connected to AWS S3');
    console.log('📦 Available buckets:', bucketsResponse.Buckets?.map(b => b.Name) || []);
    
    // Test 2: Check if our target bucket exists
    if (!BUCKET_NAME) {
      console.error('❌ AWS_S3_BUCKET_NAME environment variable is not set');
      return false;
    }
    
    const targetBucket = bucketsResponse.Buckets?.find(b => b.Name === BUCKET_NAME);
    if (!targetBucket) {
      console.error(`❌ Target bucket '${BUCKET_NAME}' not found`);
      console.log('💡 Available buckets:', bucketsResponse.Buckets?.map(b => b.Name) || []);
      return false;
    }
    
    console.log(`✅ Target bucket '${BUCKET_NAME}' found`);
    
    // Test 3: List objects in bucket (permissions test)
    console.log('🔍 Testing bucket access...');
    const listObjectsCommand = new ListObjectsV2Command({
      Bucket: BUCKET_NAME,
      MaxKeys: 5 // Limit to 5 objects for testing
    });
    
    const objectsResponse = await s3Client.send(listObjectsCommand);
    console.log(`✅ Successfully accessed bucket '${BUCKET_NAME}'`);
    console.log(`📁 Bucket contains ${objectsResponse.KeyCount || 0} objects`);
    
    if (objectsResponse.Contents && objectsResponse.Contents.length > 0) {
      console.log('📄 Sample objects:');
      objectsResponse.Contents.slice(0, 3).forEach(obj => {
        console.log(`   - ${obj.Key} (${obj.Size} bytes, last modified: ${obj.LastModified})`);
      });
    }
    
    console.log('🎉 S3 connection test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ S3 connection test failed:', error.message);
    
    if (error.name === 'UnauthorizedOperation') {
      console.error('💡 Check your AWS credentials and IAM permissions');
    } else if (error.name === 'NoSuchBucket') {
      console.error('💡 Check your bucket name and region');
    } else if (error.name === 'AccessDenied') {
      console.error('💡 Check your bucket policy and IAM permissions');
    }
    
    return false;
  }
}

// Run test if this file is executed directly
if (process.argv[1] === import.meta.url || process.argv[1].endsWith('testS3Connection.js')) {
  testS3Connection()
    .then(success => {
      if (success) {
        console.log('✅ S3 is ready to use!');
        process.exit(0);
      } else {
        console.log('❌ S3 setup needs attention');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('💥 Unexpected error:', error);
      process.exit(1);
    });
}
