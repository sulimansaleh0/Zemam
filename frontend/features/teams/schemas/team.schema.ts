import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z
    .string()
    .trim()
    .min(6, 'اسم الفريق يجب أن يكون 6 أحرف على الأقل')
    .max(50, 'اسم الفريق لا يجب أن يتجاوز 50 حرفاً'),
  managerId: z.string().optional(),
  driversIds: z.array(z.string()).optional(),
  vehiclesIds: z.array(z.string()).optional(),
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
