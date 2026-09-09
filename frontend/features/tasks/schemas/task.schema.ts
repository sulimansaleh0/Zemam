import { z } from 'zod';

export const locationPointSchema = z.object({
  address: z.string().trim().min(1, 'العنوان مطلوب'),
  lat: z.string().trim().min(1, 'خط العرض مطلوب'),
  lng: z.string().trim().min(1, 'خط الطول مطلوب'),
});

export const createTaskSchema = z.object({
  title: z.string().trim().optional(),
  description: z
    .string()
    .trim()
    .min(1, 'وصف المهمة مطلوب')
    .min(15, 'يجب أن يكون وصف المهمة 15 حرفاً على الأقل'),
  vehicleId: z.string().min(1, 'يرجى اختيار المركبة'),
  driverId: z.string().optional().or(z.literal('')),
  startTime: z.string().min(1, 'يرجى تحديد موعد انطلاق المهمة'),
  pickupLocation: locationPointSchema,
  deliveryLocation: locationPointSchema,
});

export type CreateTaskFormValues = z.infer<typeof createTaskSchema>;
