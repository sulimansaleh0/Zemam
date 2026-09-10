import { z } from 'zod';

export const createFuelSchema = z.object({
  vehicleId: z.string().min(1, 'يرجى تحديد المركبة المستهدفة'),
  cost: z
    .preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({ required_error: 'تكلفة الوقود مطلوبة', invalid_type_error: 'التكلفة يجب أن تكون رقماً' })
        .gt(0, 'التكلفة يجب أن تكون أكبر من 0')
    ),
  qty: z
    .preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({ required_error: 'كمية الوقود (باللتر) مطلوبة', invalid_type_error: 'الكمية يجب أن تكون رقماً' })
        .gt(0, 'كمية الوقود يجب أن تكون أكبر من صفر')
    ),
  odometer: z
    .preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z
        .number({ required_error: 'قراءة العداد الحالية مطلوبة', invalid_type_error: 'قراءة العداد يجب أن تكون رقماً' })
        .min(0, 'قراءة العداد لا يمكن أن تكون بالسالب')
    ),
  isFullTank: z.boolean({ required_error: 'يرجى تحديد هل تمت تعبئة الخزان بالكامل' }),
});

export type CreateFuelFormValues = z.infer<typeof createFuelSchema>;

export const verifyFuelSchema = z.object({
  status: z.enum(['approved', 'declined'], {
    required_error: 'يرجى تحديد حالة الاعتماد أو الرفض',
  }),
});

export type VerifyFuelFormValues = z.infer<typeof verifyFuelSchema>;
