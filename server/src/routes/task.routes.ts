import { Router } from 'express';
import {
  createTask,
  getTasks,
  getTaskById,
  updateTask,
  deleteTask,
  reorderTasks,
} from '../controllers/task.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody, validateQuery } from '../middlewares/validate.middleware';
import {
  createTaskValidation,
  updateTaskValidation,
  reorderTasksValidation,
  taskQueryValidation,
} from '../validations/task.validation';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(createTaskValidation), createTask);
router.get('/', validateQuery(taskQueryValidation), getTasks);
router.patch('/reorder', validateBody(reorderTasksValidation), reorderTasks);
router.get('/:id', getTaskById);
router.put('/:id', validateBody(updateTaskValidation), updateTask);
router.delete('/:id', deleteTask);

export default router;
