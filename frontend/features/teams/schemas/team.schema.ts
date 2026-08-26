import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'اسم الفريق يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم الفريق لا يجب أن يتجاوز 50 حرفاً'),
});

export const updateTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'اسم الفريق يجب أن يكون حرفين على الأقل')
    .max(50, 'اسم الفريق لا يجب أن يتجاوز 50 حرفاً'),
});

export type CreateTeamFormValues = z.infer<typeof createTeamSchema>;
export type UpdateTeamFormValues = z.infer<typeof updateTeamSchema>;
