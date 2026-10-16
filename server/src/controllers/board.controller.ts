import { Response, NextFunction } from 'express';
import { Board } from '../models/Board';
import { Task } from '../models/Task';
import { User } from '../models/User';
import { AuthRequest } from '../types';

export const createBoard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { title, description, color } = req.body;

    const board = await Board.create({
      title,
      description,
      color,
      owner: req.user?.id,
      members: [],
    });

    res.status(201).json({
      success: true,
      message: 'Board created successfully',
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

export const getBoards = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const boards = await Board.find({
      $or: [
        { owner: userId },
        { 'members.user': userId },
        { 'members.email': userEmail },
      ],
    })
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar')
      .sort({ updatedAt: -1 });

    const formattedBoards = boards.map((board) => {
      const isOwner = board.owner._id.toString() === userId;
      let userRole = 'viewer';

      if (isOwner) {
        userRole = 'owner';
      } else {
        const member = board.members.find(
          (m) =>
            (m.user && m.user.toString() === userId) || m.email === userEmail
        );
        if (member) {
          userRole = member.role;
        }
      }

      return {
        ...board.toObject(),
        isOwner,
        userRole,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedBoards,
    });
  } catch (error) {
    next(error);
  }
};

export const getBoardById = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const board = await Board.findById(id)
      .populate('owner', 'name email avatar')
      .populate('members.user', 'name email avatar');

    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found',
      });
      return;
    }

    const isOwner = board.owner._id.toString() === userId;
    const member = board.members.find(
      (m) => (m.user && m.user.toString() === userId) || m.email === userEmail
    );

    if (!isOwner && !member) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to view this board',
      });
      return;
    }

    const userRole = isOwner ? 'owner' : member?.role || 'viewer';

    res.status(200).json({
      success: true,
      data: {
        ...board.toObject(),
        isOwner,
        userRole,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const updateBoard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, color, columns } = req.body;
    const userId = req.user?.id;
    const userEmail = req.user?.email;

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found',
      });
      return;
    }

    const isOwner = board.owner.toString() === userId;
    const member = board.members.find(
      (m) => (m.user && m.user.toString() === userId) || m.email === userEmail
    );

    if (!isOwner && (!member || member.role !== 'editor')) {
      res.status(403).json({
        success: false,
        message: 'You do not have permission to edit this board',
      });
      return;
    }

    if (title !== undefined) board.title = title;
    if (description !== undefined) board.description = description;
    if (color !== undefined) board.color = color;
    if (columns !== undefined) board.columns = columns;

    await board.save();

    res.status(200).json({
      success: true,
      message: 'Board updated successfully',
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteBoard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found',
      });
      return;
    }

    if (board.owner.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the board owner can delete this board',
      });
      return;
    }

    await Task.deleteMany({ boardId: board._id });
    await board.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Board and all associated tasks deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const shareBoard = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, role } = req.body;
    const userId = req.user?.id;

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found',
      });
      return;
    }

    if (board.owner.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the board owner can share this board',
      });
      return;
    }

    if (email === req.user?.email) {
      res.status(400).json({
        success: false,
        message: 'You cannot share a board with yourself',
      });
      return;
    }

    const existingMember = board.members.find((m) => m.email === email);
    if (existingMember) {
      existingMember.role = role || 'viewer';
      await board.save();
      res.status(200).json({
        success: true,
        message: `Member role updated to ${existingMember.role}`,
        data: board,
      });
      return;
    }

    const registeredUser = await User.findOne({ email });

    board.members.push({
      email,
      role: role || 'viewer',
      ...(registeredUser && { user: registeredUser._id }),
    });

    await board.save();

    res.status(200).json({
      success: true,
      message: `Board shared with ${email} (${role || 'viewer'})`,
      data: board,
    });
  } catch (error) {
    next(error);
  }
};

export const removeMember = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id, email } = req.params;
    const userId = req.user?.id;

    const board = await Board.findById(id);
    if (!board) {
      res.status(404).json({
        success: false,
        message: 'Board not found',
      });
      return;
    }

    if (board.owner.toString() !== userId) {
      res.status(403).json({
        success: false,
        message: 'Only the board owner can remove members',
      });
      return;
    }

    board.members = board.members.filter((m) => m.email !== decodeURIComponent(email));
    await board.save();

    res.status(200).json({
      success: true,
      message: 'Member removed from board successfully',
      data: board,
    });
  } catch (error) {
    next(error);
  }
};
