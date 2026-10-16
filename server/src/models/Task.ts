import mongoose, { Document, Schema, Types } from 'mongoose';
import { TaskPriority } from '../types';

export interface ITask extends Document {
  title: string;
  description: string;
  boardId: Types.ObjectId;
  columnId: string;
  priority: TaskPriority;
  dueDate?: Date | null;
  order: number;
  creator: Types.ObjectId;
  assignedTo?: Types.ObjectId | null;
  isCompleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 1,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
      trim: true,
      maxlength: 2000,
    },
    boardId: {
      type: Schema.Types.ObjectId,
      ref: 'Board',
      required: true,
      index: true,
    },
    columnId: {
      type: String,
      required: true,
      default: 'todo',
      index: true,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
      index: true,
    },
    dueDate: {
      type: Date,
      default: null,
      index: true,
    },
    order: {
      type: Number,
      default: 0,
    },
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    isCompleted: {
      type: Boolean,
      default: false,
      index: true,
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

TaskSchema.index({ boardId: 1, columnId: 1, order: 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
