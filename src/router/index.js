import express from 'express'; // ✅ Import express first
import auth from './auth.js';
import yachtRouter from './yacht.js';
const router = express.Router(); // ✅ Use express.Router()
router.use('/auth', auth);
router.use('/yacht', yachtRouter);

export default router;
