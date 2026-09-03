import { z } from 'zod';

export const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(1, 'كلمة المرور الجديدة مطلوبة')
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .max(100, 'كلمة المرور طويلة جداً')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل (A-Z)')
      .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير واحد على الأقل (a-z)')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل (0-9)')
      .regex(/[^A-Za-z0-9]/, 'يجب أن تحتوي على رمز خاص واحد على الأقل (!@#$%^&*...)'),

    confirmNewPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmNewPassword'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
