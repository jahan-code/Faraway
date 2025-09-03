import multer from 'multer';
import multerS3 from 'multer-s3';
import { s3Client, BUCKET_NAME } from '../config/s3.js';
import path from 'path';

// S3 storage configuration
const s3Storage = multerS3({
  s3: s3Client,
  bucket: BUCKET_NAME,
  // Removed ACL setting since bucket has ACLs disabled
  contentType: multerS3.AUTO_CONTENT_TYPE,
  key: function (req, file, cb) {
    let subfolder = '';
    
    // Handle yacht images
    if (file.fieldname === 'primaryImage') {
      subfolder = 'yachts/primaryImage';
    } else if (file.fieldname === 'galleryImages' || file.fieldname === 'galleryImages[]') {
      subfolder = 'yachts/galleryImages';
    } 
    // Handle blog images
    else if (file.fieldname === 'image') {
      subfolder = 'blogs/images';
    } else {
      return cb(new Error('Unexpected upload field: ' + file.fieldname), null);
    }
    
    // Generate unique filename
    const ext = path.extname(file.originalname);
    const cleanFieldName = file.fieldname.replace(/[\[\]]/g, '');
    const uniqueId = Math.random().toString(36).substring(2, 15);
    const finalName = Date.now() + '-' + cleanFieldName + '-' + uniqueId + ext;
    
    const s3Key = `${subfolder}/${finalName}`;
    cb(null, s3Key);
  }
});

const fileFilter = (req, file, cb) => {
  const field = file.fieldname;

  // Accept yacht image fields
  if (field === 'primaryImage' || field === 'galleryImages' || field === 'galleryImages[]') {
    cb(null, true);
  } 
  // Accept blog image field
  else if (field === 'image') {
    cb(null, true);
  } else {
    cb(new Error(`Unexpected upload field: ${field}`), false);
  }
};

const upload = multer({
  storage: s3Storage,
  fileFilter,
  limits: { fileSize: 12 * 1024 * 1024 }, // 12MB max
});

export default upload;