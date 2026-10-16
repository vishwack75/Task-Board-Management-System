import { Response, NextFunction } from 'express';
import { Task } from '../models/Task';
import { Board } from '../models/Board';
import { AuthRequest } from '../types';

const checkBoardAccess = async (
  boardId: string,
  userId?: string,
  userEmail?: string,
  requireEdit: boolean = false
) => {
  const board = await Board.findById(boardId);
  if (!board) {
    return { board: null, hasAccess: false, isEditor: false };
  }

  const isOwner = board.owner.toString() === userId;
  const member = board.members.find(
    (m) => (m.user && m.user.toString() === userId) || m.email === userEmail
  );

  const isEditor = isOwner || member?.role === 'editor';
  const hasAccess = isOwner || !!member;

  return {
    board,
    hasAccess: requireEdit ? isEditor : hasAccess,
    isEditor,
  };
};

export const createTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, boardId, columnId, priority, dueDate, order, assignedTo } =
      req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const { board, hasAccess } = await checkBoardAccess(
      boardId,
      userId,
      userEmail,
      true
    );

    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found',
      });
      return;
    }

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to add tasks to this board',
      });
      return;
    }

    let taskOrder = order;
    if (taskOrder === undefined) {
      const highestTask = await Task.findOne({
        boardId,
        columnId: columnId || 'todo',
      }).sort({ order: -1 });
      taskOrder = highestTask ? highestTask.order + 1 : 0;
    }

    const isCompleted = columnId === 'done';

    const task = await Task.create({
      title,
      description,
      boardId,
      columnId: columnId || 'todo',
      priority: priority || 'medium',
      dueDate: dueDate ? new Date(dueDate) : null,
      order: taskOrder,
      creator: userId,
      assignedTo: assignedTo || null,
      isCompleted,
    });

    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const getTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { boardId, search, priority, columnId, dueDate, isCompleted } =
      req.query as any;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const { board, hasAccess } = await checkBoardAccess(
      boardId,
      userId,
      userEmail,
      false
    );

    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found',
      });
      return;
    }

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view tasks on this board',
      });
      return;
    }

    const query: any = { boardId };

    if (search && typeof search === 'string') {
      query.title = { $regex: search.trim(), $options: 'i' };
    }

    if (priority) {
      query.priority = priority;
    }

    if (columnId) {
      query.columnId = columnId;
    }

    if (isCompleted !== undefined) {
      query.isCompleted = isCompleted === 'true' || isCompleted === true;
    }

    if (dueDate) {
      const now = new Date();
      if (dueDate === 'overdue') {
        query.dueDate = { $lt: now, $ne: null };
        query.isCompleted = false;
      } else if (dueDate === 'today') {
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const endOfDay = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          23,
          59,
          59,
          999
        );
        query.dueDate = { $gte: startOfDay, $lte: endOfDay };
      } else if (dueDate === 'this_week') {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        startOfWeek.setHours(0, 0, 0, 0);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(endOfWeek.getDate() + 7);
        query.dueDate = { $gte: startOfWeek, $lte: endOfWeek };
      } else if (dueDate === 'has_due_date') {
        query.dueDate = { $ne: null };
      }
    }

    const tasks = await Task.find(query)
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar')
      .sort({ order: 1, createdAt: 1 });

    res.status(200).json({
      success: true,
      data: tasks,
    });
  } catch (error) {
    next(error);
  }
};

export const getTaskById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const task = await Task.findById(id)
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const { hasAccess } = await checkBoardAccess(
      task.boardId.toString(),
      userId,
      userEmail,
      false
    );

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this task',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: task,
    });
  } catch (error) {
    next(error);
  }
};

export const updateTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const { hasAccess } = await checkBoardAccess(
      task.boardId.toString(),
      userId,
      userEmail,
      true
    );

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this task',
      });
      return;
    }

    if (updates.boardId && updates.boardId !== task.boardId.toString()) {
      const targetBoardAccess = await checkBoardAccess(
        updates.boardId,
        userId,
        userEmail,
        true
      );
      if (!targetBoardAccess.hasAccess) {
        res.status(403).json({
          success: false,
          message: 'You do not have permission to move tasks to the destination board',
        });
        return;
      }
      task.boardId = updates.boardId;
    }

    if (updates.title !== undefined) task.title = updates.title;
    if (updates.description !== undefined) task.description = updates.description;
    if (updates.priority !== undefined) task.priority = updates.priority;
    if (updates.order !== undefined) task.order = updates.order;
    if (updates.assignedTo !== undefined) task.assignedTo = updates.assignedTo || null;

    if (updates.dueDate !== undefined) {
      task.dueDate = updates.dueDate ? new Date(updates.dueDate) : null;
    }

    if (updates.columnId !== undefined) {
      task.columnId = updates.columnId;
      if (updates.columnId === 'done') {
        task.isCompleted = true;
      } else if (updates.isCompleted === undefined && task.columnId !== 'done') {
        task.isCompleted = false;
      }
    }

    if (updates.isCompleted !== undefined) {
      task.isCompleted = updates.isCompleted;
      if (updates.isCompleted && task.columnId !== 'done') {
        task.columnId = 'done';
      }
    }

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate('creator', 'name email avatar')
      .populate('assignedTo', 'name email avatar');

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: populatedTask,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteTask = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const task = await Task.findById(id);
    if (!task) {
      res.status(404).json({
        success: false,
        message: 'Task not found',
      });
      return;
    }

    const { hasAccess } = await checkBoardAccess(
      task.boardId.toString(),
      userId,
      userEmail,
      true
    );

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to delete this task',
      });
      return;
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const reorderTasks = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { boardId, items } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const { hasAccess } = await checkBoardAccess(
      boardId,
      userId,
      userEmail,
      true
    );

    if (!hasAccess) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to reorder tasks on this board',
      });
      return;
    }

    const bulkOps = items.map((item: any) => {
      const updateData: any = {
        columnId: item.columnId,
        order: item.order,
      };

      if (item.boardId) {
        updateData.boardId = item.boardId;
      }

      if (item.columnId === 'done') {
        updateData.isCompleted = true;
      }

      return {
        updateOne: {
          filter: { _id: item.taskId },
          update: { $set: updateData },
        },
      };
    });

    if (bulkOps.length > 0) {
      await Task.bulkWrite(bulkOps);
    }

    res.status(200).json({
      success: true,
      message: 'Tasks reordered successfully',
    });
  } catch (error) {
    next(error);
  }
};
