import { z } from 'zod';

const columnValidation = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(50),
  order: z.number().int().nonnegative(),
});

export const createBoardValidation = z.object({
  title: z
    .string({ required_error: 'Board title is required' })
    .trim()
    .min(1, 'Board title cannot be empty')
    .max(100, 'Board title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional()
    .default(''),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code')
    .optional()
    .default('#6366f1'),
});

export const updateBoardValidation = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Board title cannot be empty')
    .max(100, 'Board title cannot exceed 100 characters')
    .optional(),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code')
    .optional(),
  columns: z.array(columnValidation).optional(),
});

export const shareBoardValidation = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .toLowerCase()
    .email('Please provide a valid email address'),
  role: z.enum(['viewer', 'editor']).default('viewer'),
});

export type CreateBoardInput = z.infer<typeof createBoardValidation>;
export type UpdateBoardInput = z.infer<typeof updateBoardValidation>;
export type ShareBoardInput = z.infer<typeof shareBoardValidation>;
