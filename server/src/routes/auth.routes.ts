import { Router } from 'express';
import {
  signup,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';
import { validateBody } from '../middlewares/validate.middleware';
import {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../validations/auth.validation';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.post('/signup', validateBody(signupValidation), signup);
router.post('/login', validateBody(loginValidation), login);
router.post('/forgot-password', validateBody(forgotPasswordValidation), forgotPassword);
router.post('/reset-password', validateBody(resetPasswordValidation), resetPassword);
router.post('/logout', logout);
router.get('/me', authenticate, getMe);

export default router;
