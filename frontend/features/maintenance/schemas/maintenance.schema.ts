import { z } from 'zod';

export const createMaintenanceSchema = z.object({
  vehicleId: z.string().min(1, 'يرجى تحديد المركبة'),
  category: z.enum(['Faults', 'Periodic Maintenance'], {
    required_error: 'يرجى تحديد تصنيف الصيانة',
  }),
  priority: z.enum(['High', 'low'], {
    required_error: 'يرجى تحديد درجة الأولوية',
  }),
  cost: z
    .preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number({ required_error: 'التكلفة التقديرية مطلوبة', invalid_type_error: 'التكلفة يجب أن تكون رقماً صحيحاً أو عشرياً' })
        .min(0, 'التكلفة لا يمكن أن تكون بالسالب')
    ),
  odoMeter: z
    .preprocess(
      (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
      z.number({ required_error: 'قراءة العداد مطلوبة', invalid_type_error: 'قراءة العداد يجب أن تكون رقماً' })
        .min(0, 'قراءة العداد لا يمكن أن تكون سالبة')
    ),
  description: z
    .string()
    .trim()
    .min(1, 'وصف الصيانة مطلوب')
    .min(5, 'يجب أن يكون وصف الصيانة أو المشكلة 5 أحرف على الأقل'),
});

export type CreateMaintenanceFormValues = z.infer<typeof createMaintenanceSchema>;

export const verifyMaintenanceSchema = z
  .object({
    status: z.enum(['approved', 'declined'], {
      required_error: 'يرجى تحديد حالة الاعتماد أو الرفض',
    }),
    cost: z
      .preprocess(
        (val) => (val === '' || val === null || val === undefined ? undefined : Number(val)),
        z.number({ invalid_type_error: 'التكلفة يجب أن تكون رقماً' }).min(0, 'التكلفة يجب أن تكون 0 فأكثر').optional()
      ),
    isDriverFault: z.boolean().optional(),
    declineReason: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.status === 'declined') {
        return Boolean(data.declineReason && data.declineReason.length >= 3);
      }
      return true;
    },
    {
      message: 'سبب الرفض إلزامي عند رفض السجل (3 أحرف على الأقل)',
      path: ['declineReason'],
    }
  );

export type VerifyMaintenanceFormValues = z.infer<typeof verifyMaintenanceSchema>;
