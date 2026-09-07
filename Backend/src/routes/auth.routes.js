import { Router } from "express";
import { validateLoginUser, validateRegisterUser } from "../validator/auth.validator";

const router = Router();

router.post('/register', validateRegisterUser, register)

router.post('/login', validateLoginUser, login)

 

export default router;