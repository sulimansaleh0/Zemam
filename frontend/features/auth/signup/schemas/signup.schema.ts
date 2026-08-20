import { z } from 'zod';

export const signupSchema = z
  .object({
    name: z.string().min(6, 'الاسم يجب أن يكون 6 أحرف على الأقل'),
    companyName: z.string().min(6, 'اسم الشركة يجب أن لا يقل عن 6 أحرف'),
    email: z.string().min(1, 'البريد الإلكتروني مطلوب').email('صيغة البريد الإلكتروني غير صحيحة'),
    password: z.string().min(8, 'كلمة المرور يجب أن لا تقل عن 8 أحرف'),
    confirmPassword: z.string().min(8, 'تأكيد كلمة المرور يجب أن لا يقل عن 8 أحرف'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

