import express from 'express';
import yachtController from '../controllers/yachtController.js';
import upload from '../middleware/upload.middleware.js';
import { verifyToken } from '../middleware/Auth.middleware.js';
import { deleteYacht } from '../controllers/yachtController.js';
const router = express.Router();
router.post('/add-yacht',verifyToken,
    upload.fields([
    { name: 'primaryImage', maxCount: 1 },
    { name: 'galleryImages', maxCount: 10 },
    { name: 'galleryImages[]', maxCount: 10 }
  ])
  , yachtController.addYacht);
router.get('/all-yachts',yachtController.getAllYachts);
router.get('/', yachtController.getYachtById);
router.delete('/delete-yacht', verifyToken, deleteYacht);


export default router;
