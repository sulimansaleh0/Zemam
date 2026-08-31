import { z } from 'zod';

// ============================================================
//  Vehicle Schemas — Zod validation matching backend rules
// ============================================================

export const vehicleFormSchema = z.object({
  model: z
    .string()
    .trim()
    .min(1, 'اسم وموديل المركبة مطلوب')
    .max(100, 'الاسم لا يتجاوز 100 حرف'),

  year: z.coerce
    .number({ invalid_type_error: 'سنة الصنع يجب أن تكون رقماً' })
    .int('سنة الصنع غير صحيحة')
    .min(1900, 'سنة الصنع يجب أن تكون بعد عام 1900')
    .max(new Date().getFullYear() + 1, 'سنة الصنع لا تتجاوز العام القادم'),

  plateNumber: z.coerce
    .number({ invalid_type_error: 'رقم اللوحة يجب أن يكون رقماً' })
    .int('رقم اللوحة يجب أن يكون عدداً صحيحاً')
    .positive('رقم اللوحة يجب أن يكون أكبر من صفر'),

  driverId: z.string().optional(),
  teamId: z.string().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export const assignDriverSchema = z.object({
  driverId: z.string().min(1, 'يرجى اختيار السائق'),
});

export type AssignDriverFormValues = z.infer<typeof assignDriverSchema>;
