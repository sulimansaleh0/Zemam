import { z } from 'zod';

export const vehicleFormSchema = z.object({
  model: z
    .string()
    .min(1, 'اسم وموديل المركبة مطلوب')
    .max(100, 'الاسم لا يتجاوز 100 حرف'),
  year: z.coerce
    .number({ invalid_type_error: 'سنة الصنع يجب أن تكون رقماً' })
    .int('سنة الصنع غير صحيحة')
    .min(1990, 'سنة الصنع يجب أن تكون بعد 1990')
    .max(new Date().getFullYear() + 1, 'سنة الصنع لا يمكن أن تتجاوز العام القادم'),
  plateNumber: z.coerce
    .number({ invalid_type_error: 'رقم اللوحة يجب أن يكون رقماً' })
    .int('رقم اللوحة يجب أن يكون عدداً صحيحاً')
    .positive('رقم اللوحة يجب أن يكون أكبر من صفر'),
  gpsDeviceId: z
    .string()
    .min(1, 'معرف جهاز الـ GPS مطلوب')
    .max(50, 'معرف الجهاز لا يتجاوز 50 حرف'),
  gpsUniqueId: z
    .string()
    .min(1, 'المعرف الفريد (IMEI / Unique ID) مطلوب')
    .max(50, 'المعرف الفريد لا يتجاوز 50 حرف'),
  teamId: z
    .string()
    .min(1, 'يرجى اختيار الفريق المسؤول'),
  companyId: z
    .string()
    .min(1, 'يرجى اختيار الشركة التابعة'),
  driverId: z
    .string()
    .min(1, 'يرجى تعيين السائق المسؤول'),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;
