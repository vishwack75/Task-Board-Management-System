export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type BoardMemberRole = 'viewer' | 'editor';

export interface IUser {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface IBoardMember {
  user?: IUser | string;
  email: string;
  role: BoardMemberRole;
}

export interface IBoardColumn {
  id: string;
  name: string;
  order: number;
}

export interface IBoard {
  _id: string;
  title: string;
  description?: string;
  color: string;
  owner: IUser;
  members: IBoardMember[];
  columns: IBoardColumn[];
  isOwner?: boolean;
  userRole?: 'owner' | 'editor' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

export interface ITask {
  _id: string;
  title: string;
  description?: string;
  boardId: string;
  columnId: string;
  priority: TaskPriority;
  dueDate?: string | null;
  order: number;
  creator: IUser;
  assignedTo?: IUser | null;
  isCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IDashboardSummary {
  summary: {
    totalBoards: number;
    totalTasks: number;
    completedTasks: number;
    overdueTasks: number;
    pendingTasks: number;
    completionRate: number;
  };
  priorityBreakdown: {
    low: number;
    medium: number;
    high: number;
    urgent: number;
  };
  upcomingTasks: Array<ITask & { boardId: { _id: string; title: string; color: string } }>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Array<{ field: string; message: string }>;
}
