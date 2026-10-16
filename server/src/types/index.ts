import { Request } from 'express';

export interface IUserPayload {
  id: string;
  email: string;
  name: string;
}

export interface AuthRequest extends Request {
  user?: IUserPayload;
}

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type BoardMemberRole = 'viewer' | 'editor';

export interface IBoardColumn {
  id: string;
  name: string;
  order: number;
}
