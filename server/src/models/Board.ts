import mongoose, { Document, Schema, Types } from 'mongoose';
import { BoardMemberRole, IBoardColumn } from '../types';

export interface IBoardMember {
  user?: Types.ObjectId;
  email: string;
  role: BoardMemberRole;
}

export interface IBoard extends Document {
  title: string;
  description: string;
  color: string;
  owner: Types.ObjectId;
  members: IBoardMember[];
  columns: IBoardColumn[];
  createdAt: Date;
  updatedAt: Date;
}

const BoardMemberSchema = new Schema<IBoardMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ['viewer', 'editor'],
      default: 'viewer',
    },
  },
  { _id: false }
);

const BoardColumnSchema = new Schema<IBoardColumn>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    order: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const defaultColumns: IBoardColumn[] = [
  { id: 'todo', name: 'To Do', order: 0 },
  { id: 'in-progress', name: 'In Progress', order: 1 },
  { id: 'done', name: 'Done', order: 2 },
];

const BoardSchema = new Schema<IBoard>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 500,
    },
    color: {
      type: String,
      default: '#6366f1',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    members: {
      type: [BoardMemberSchema],
      default: [],
    },
    columns: {
      type: [BoardColumnSchema],
      default: defaultColumns,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret: Record<string, any>) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

export const Board = mongoose.model<IBoard>('Board', BoardSchema);
