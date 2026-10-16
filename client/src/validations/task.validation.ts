import { z } from 'zod';

export const taskSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Task title is required')
    .max(200, 'Task title cannot exceed 200 characters'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  columnId: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  dueDate: z.string().optional().nullable(),
});

export type TaskFormValues = z.infer<typeof taskSchema>;
