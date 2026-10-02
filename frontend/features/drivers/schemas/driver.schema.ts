import { z } from 'zod';

// ============================================================
//  Driver Schemas — Zod validation aligned with backend rules
// ============================================================

/**
 * Schema لفورم إضافة سائق جديد.
 * الباك اند يقبل email فقط عند الإنشاء.
 */
export const createDriverSchema = z.object({
  name: z.string().trim().min(1, 'اسم السائق مطلوب'),
  phone: z.string().trim().optional(),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('يرجى إدخال بريد إلكتروني صحيح'),
  teamId: z.string().optional(),
  vehicleId: z.string().optional(),
  licenseNumber: z
    .string()
    .trim()
    .min(1, 'رقم رخصة القيادة مطلوب')
    .regex(/^[\p{L}\p{N}]+$/u, 'رقم الرخصة يجب أن يحتوي على أحرف أو أرقام فقط'),
  licenseTypes: z.array(z.enum(['normal', 'van', 'truck'])).default(['normal']),
  licenseExpiry: z.string().min(1, 'تاريخ انتهاء الرخصة مطلوب'),
});

export type CreateDriverFormValues = z.infer<typeof createDriverSchema>;
