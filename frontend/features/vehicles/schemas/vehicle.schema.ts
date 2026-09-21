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

  plateNumber: z
    .string()
    .trim()
    .min(1, 'رقم اللوحة مطلوب'),

  vehicleType: z.enum(['normal', 'van', 'truck']).default('normal'),
  tankCapacity: z.coerce
    .number({ invalid_type_error: 'سعة الخزان يجب أن تكون رقماً' })
    .min(1, 'سعة الخزان يجب أن تكون أكبر من 0')
    .max(2000, 'سعة الخزان لا تتجاوز 2000 لتر')
    .optional(),
  fuelType: z.string().optional(),
  currentOdometer: z.coerce
    .number({ invalid_type_error: 'قراءة العداد يجب أن تكون رقماً' })
    .min(0, 'قراءة العداد لا يمكن أن تكون سالبة')
    .default(0),
  expectedFuelEfficiency: z.coerce
    .number({ invalid_type_error: 'كفاءة الوقود يجب أن تكون رقماً' })
    .min(0.1, 'كفاءة الوقود يجب أن تكون أكبر من 0.1')
    .default(10),
  licenseNumber: z.string().trim().optional(),
  licenseExpiry: z.string().optional(),
  insuranceCompany: z.string().trim().optional(),
  insuranceNumber: z.string().trim().optional(),
  insuranceType: z.enum(['comprehensive', 'third_party']).optional(),
  insuranceExpiry: z.string().optional(),
  driverId: z.string().optional(),
  teamId: z.string().optional(),
});

export type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export const assignDriverSchema = z.object({
  driverId: z.string().min(1, 'يرجى اختيار السائق'),
});

export type AssignDriverFormValues = z.infer<typeof assignDriverSchema>;
