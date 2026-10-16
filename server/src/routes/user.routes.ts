import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  changePassword,
} from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  updateProfileValidation,
  changePasswordValidation,
} from '../validations/user.validation';
import { uploadAvatar as uploadAvatarMiddleware } from '../middlewares/upload.middleware';

const router = Router();

router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', validateBody(updateProfileValidation), updateProfile);
router.post('/avatar', uploadAvatarMiddleware.single('avatar'), uploadAvatar);
router.put(
  '/change-password',
  validateBody(changePasswordValidation),
  changePassword
);

export default router;
