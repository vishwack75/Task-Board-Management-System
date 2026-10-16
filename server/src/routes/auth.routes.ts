import { Router } from 'express';
import { signup, login, logout, getMe } from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import { signupValidation, loginValidation } from '../validations/auth.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/signup', validateBody(signupValidation), signup);
router.post('/login', validateBody(loginValidation), login);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
