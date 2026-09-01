import { z } from 'zod';

export const createManagerSchema = z.object({
  name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .trim()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة'),
  teamId: z.string().optional(),
});

export type CreateManagerFormValues = z.infer<typeof createManagerSchema>;
