import { z } from 'zod';

// ============================================================
//  Driver Schemas — Zod validation aligned with backend rules
// ============================================================

/**
 * Schema لفورم إضافة سائق جديد.
 * الباك اند يقبل email فقط عند الإنشاء.
 */
export const createDriverSchema = z.object({
  name: z.string().trim().optional(),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  teamId: z.string().optional(),
});

export type CreateDriverFormValues = z.infer<typeof createDriverSchema>;
