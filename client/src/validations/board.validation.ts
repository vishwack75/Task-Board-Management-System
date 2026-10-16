import { z } from 'zod';

export const boardSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Board title is required')
    .max(100, 'Board title cannot exceed 100 characters'),
  description: z
    .string()
    .trim()
    .max(500, 'Description cannot exceed 500 characters')
    .optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, 'Must be a valid hex color code'),
});

export const shareSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  role: z.enum(['viewer', 'editor']),
});

export type BoardFormValues = z.infer<typeof boardSchema>;
export type ShareFormValues = z.infer<typeof shareSchema>;
