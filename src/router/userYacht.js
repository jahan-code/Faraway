import express from 'express';
import yachtController from '../controllers/yachtController.js';

const router = express.Router();

router.get('/all-yachts', yachtController.getAllYachts);
router.get('/', yachtController.getYachtById);


export default router;
