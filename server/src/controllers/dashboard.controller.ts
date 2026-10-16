import { Response, NextFunction } from 'express';
import { Board } from '../models/Board';
import { Task } from '../models/Task';
import { AuthRequest } from '../types';

export const getDashboardSummary = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const accessibleBoards = await Board.find({
      $or: [
        { owner: userId },
        { 'members.user': userId },
        { 'members.email': userEmail },
      ],
    }).select('_id title color owner');

    const boardIds = accessibleBoards.map((b) => b._id);

    const now = new Date();

    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      lowPriority,
      mediumPriority,
      highPriority,
      urgentPriority,
      upcomingTasks,
    ] = await Promise.all([
      Task.countDocuments({ boardId: { $in: boardIds } }),
      Task.countDocuments({ boardId: { $in: boardIds }, isCompleted: true }),
      Task.countDocuments({
        boardId: { $in: boardIds },
        isCompleted: false,
        dueDate: { $lt: now, $ne: null },
      }),
      Task.countDocuments({ boardId: { $in: boardIds }, priority: 'low' }),
      Task.countDocuments({ boardId: { $in: boardIds }, priority: 'medium' }),
      Task.countDocuments({ boardId: { $in: boardIds }, priority: 'high' }),
      Task.countDocuments({ boardId: { $in: boardIds }, priority: 'urgent' }),
      Task.find({
        boardId: { $in: boardIds },
        isCompleted: false,
        dueDate: { $gte: now },
      })
        .populate('boardId', 'title color')
        .sort({ dueDate: 1 })
        .limit(5),
    ]);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBoards: accessibleBoards.length,
          totalTasks,
          completedTasks,
          overdueTasks,
          pendingTasks: totalTasks - completedTasks,
          completionRate:
            totalTasks > 0
              ? Math.round((completedTasks / totalTasks) * 100)
              : 0,
        },
        priorityBreakdown: {
          low: lowPriority,
          medium: mediumPriority,
          high: highPriority,
          urgent: urgentPriority,
        },
        upcomingTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};
