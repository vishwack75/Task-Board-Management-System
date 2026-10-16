import { Router } from 'express';
import authRoutes from './auth.routes';
import userRoutes from './user.routes';
import boardRoutes from './board.routes';
import taskRoutes from './task.routes';
import dashboardRoutes from './dashboard.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/user', userRoutes);
router.use('/boards', boardRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);

export default router;
