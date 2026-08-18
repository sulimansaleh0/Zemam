import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().min(6, 'الاسم يجب أن يكون 6 أحرف على الأقل (حسب طلب الخادم)'),
    companyName: z.string().min(2, 'اسم الشركة يجب أن لا يقل عن حرفين'),
    email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد الإلكتروني غير صحيحة'),
    password: z.string().min(6, 'كلمة المرور يجب أن لا تقل عن 6 أحرف'),
    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;
