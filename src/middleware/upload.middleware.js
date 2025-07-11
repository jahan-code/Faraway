import multer from 'multer';
import path from 'path';
import os from 'os';
import fs from 'fs';

const tempRoot = path.join(os.tmpdir(), 'uploads', 'Faraway', 'yachts');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let subfolder = '';
    if (file.fieldname === 'primaryImage') {
      subfolder = 'primaryImage';
    } else if (file.fieldname === 'galleryImages') {
      subfolder = 'galleryImages';
    } else {
      return cb(new Error('Unexpected upload field: ' + file.fieldname), null);
    }
    const dest = path.join(tempRoot, subfolder);
    fs.mkdirSync(dest, { recursive: true }); // Ensure the folder exists
    cb(null, dest);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const finalName = Date.now() + '-' + file.fieldname + ext;
    cb(null, finalName);
  },
});

const fileFilter = (req, file, cb) => {
  const field = file.fieldname;
  const imageTypes = ['image/jpeg', 'image/png'];
  const pdfTypes = ['application/pdf'];

  if (field === 'primaryImage' || field === 'galleryImages') {
    if ([...imageTypes, ...pdfTypes].includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, or PDF files are allowed'), false);
    }
  } else {
    cb(new Error(`Unexpected upload field: ${field}`), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
});

export default upload;