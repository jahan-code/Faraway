import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Fix for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Resolve the path to src/uploads
const uploadDir = path.resolve(__dirname, '../uploads');

// ✅ Create the uploads folder if it doesn't exist
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
  console.log('📁 Created uploads folder at:', uploadDir);
}

// 📦 Multer storage setup
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('📁 Saving to:', uploadDir);
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const finalName = Date.now() + '-' + file.fieldname + ext;
    console.log(`📝 Filename set: ${finalName}`);
    cb(null, finalName);
  },
});

// ✅ Custom file filter for primaryImage
const fileFilter = (req, file, cb) => {
  const field = file.fieldname;
  const imageTypes = ['image/jpeg', 'image/png'];
  const pdfTypes = ['application/pdf'];

  if (field === 'primaryImage') {
    if ([...imageTypes, ...pdfTypes].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or PDF files are allowed for primary image'), false);
    }
  } else {
    cb(new Error(`Unexpected upload field: ${field}`), false);
  }
};

// 🚀 Final multer upload instance
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export default upload;