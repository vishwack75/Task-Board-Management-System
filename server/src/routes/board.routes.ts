import { Router } from 'express';
import {
  createBoard,
  getBoards,
  getBoardById,
  updateBoard,
  deleteBoard,
  shareBoard,
  removeMember,
} from '../controllers/board.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { validateBody } from '../middlewares/validate.middleware';
import {
  createBoardValidation,
  updateBoardValidation,
  shareBoardValidation,
} from '../validations/board.validation';

const router = Router();

router.use(authenticate);

router.post('/', validateBody(createBoardValidation), createBoard);
router.get('/', getBoards);
router.get('/:id', getBoardById);
router.put('/:id', validateBody(updateBoardValidation), updateBoard);
router.delete('/:id', deleteBoard);
router.post('/:id/share', validateBody(shareBoardValidation), shareBoard);
router.delete('/:id/members/:email', removeMember);

export default router;
