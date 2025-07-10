import express from 'express';
import yachtController from '../controllers/yachtController.js';
import upload from '../middleware/upload.middleware.js';
import { verifyToken } from '../middleware/Auth.middleware.js';
const router = express.Router();
router.post('/add-yacht',verifyToken, upload.array('primaryImage', 11), yachtController.addYacht);
router.get('/all-yachts', verifyToken,yachtController.getAllYachts);
router.get('/',verifyToken, yachtController.getYachtById);
export default router;
