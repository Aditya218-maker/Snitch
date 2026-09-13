import express from 'express'
import { authenticateSeller } from '../middlewares/auth.middleware.js';


const router = express.Router();


router.post("/", authenticateSeller)


export default router;