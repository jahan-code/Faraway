import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';

const tempRoot = path.join(os.tmpdir(), 'uploads', 'Faraway', 'yachts');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📁 Upload middleware - processing file:', file.fieldname, file.originalname);
    let subfolder = '';
    if (file.fieldname === 'primaryImage') {
      subfolder = 'primaryImage';
    } else if (file.fieldname === 'galleryImages[]') {
      subfolder = 'galleryImages';
    } else {
      console.log('❌ Unexpected field name:', file.fieldname);
      return cb(new Error('Unexpected upload field: ' + file.fieldname), null);
    }
    const dest = path.join(tempRoot, subfolder);
    console.log('📂 Creating directory:', dest);
    fs.mkdirSync(dest, { recursive: true }); // Ensure the folder exists
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const finalName = Date.now() + '-' + file.fieldname + ext;
    console.log('📝 Generated filename:', finalName);
    cb(null, finalName);
  },
});

const fileFilter = (req, file, cb) => {
  const field = file.fieldname;
  console.log('🔍 File filter - checking field:', field, 'mimetype:', file.mimetype);

  if (field === 'primaryImage' || field === 'galleryImages[]') {
    // Accept any file type for images
    console.log('✅ File accepted:', field);
    cb(null, true);
  } else {
    console.log('❌ File rejected - unexpected field:', field);
    cb(new Error(`Unexpected upload field: ${field}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export default upload;