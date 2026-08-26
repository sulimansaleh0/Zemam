import { z } from 'zod';

export const createManagerSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة'),
  teamId: z.string().min(1, 'يرجى اختيار الفريق المسؤول عنه'),
});

export type CreateManagerFormValues = z.infer<typeof createManagerSchema>;
