import express from 'express'; // ✅ Import express first
import auth from './auth.js';
import yachtRouter from './yacht.js';
import userYachtRouter from './userYacht.js';
const router = express.Router(); // ✅ Use express.Router()
router.use('/auth', auth);
router.use('/yacht', yachtRouter);
router.use('/yacht/user', userYachtRouter);

export default router;
