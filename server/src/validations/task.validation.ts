import { z } from 'zod';

export const createTaskValidation = z.object({
  title: z
    .string({ required_error: 'Task title is required' })
    .trim()
    .min(1, 'Task title cannot be empty')
    .max(200, 'Task title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional()
    .default(''),
  boardId: z
    .string({ required_error: 'Board ID is required' })
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid board ID format'),
  columnId: z.string().default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().datetime().nullable().optional(),
  order: z.number().int().nonnegative().optional(),
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    .nullable()
    .optional(),
});

export const updateTaskValidation = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title cannot be empty')
    .max(200, 'Task title cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  boardId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid board ID format')
    .optional(),
  columnId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  dueDate: z.string().datetime().nullable().optional(),
  order: z.number().int().nonnegative().optional(),
  isCompleted: z.boolean().optional(),
  assignedTo: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid user ID format')
    .nullable()
    .optional(),
});

export const reorderTaskItemValidation = z.object({
  taskId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid task ID format'),
  boardId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid board ID format').optional(),
  columnId: z.string().min(1),
  order: z.number().int().nonnegative(),
});

export const reorderTasksValidation = z.object({
  boardId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid board ID format'),
  items: z.array(reorderTaskItemValidation).min(1, 'At least one task item is required'),
});

export const taskQueryValidation = z.object({
  boardId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid board ID format'),
  search: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  columnId: z.string().optional(),
  dueDate: z.enum(['today', 'this_week', 'overdue', 'has_due_date']).optional(),
  isCompleted: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
});

export type CreateTaskInput = z.infer<typeof createTaskValidation>;
export type UpdateTaskInput = z.infer<typeof updateTaskValidation>;
export type ReorderTasksInput = z.infer<typeof reorderTasksValidation>;
export type TaskQueryInput = z.infer<typeof taskQueryValidation>;
