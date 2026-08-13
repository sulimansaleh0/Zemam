import { z } from 'zod';

const nameRegex = /^[\u0600-\u06FFa-zA-Z\s'-]{2,}$/;
const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,8}$/;

export const addressSchema = z.object({
  country: z
    .string()
    .min(1, 'الدولة مطلوبة')
    .max(50, 'اسم الدولة لا يتجاوز 50 حرف'),

  city: z
    .string()
    .min(1, 'المدينة مطلوبة')
    .max(50, 'اسم المدينة لا يتجاوز 50 حرف'),

  streetDetails: z
    .string()
    .min(1, 'تفاصيل الشارع/العنوان مطلوبة')
    .min(5, 'تفاصيل العنوان يجب أن تكون 5 أحرف على الأقل')
    .max(200, 'تفاصيل العنوان لا تتجاوز 200 حرف'),
});

export const signupSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'الاسم الأول مطلوب')
      .regex(nameRegex, 'الاسم الأول يجب أن يحتوي على أحرف فقط')
      .max(50, 'الاسم الأول لا يتجاوز 50 حرف'),

    lastName: z
      .string()
      .min(1, 'الاسم الأخير مطلوب')
      .regex(nameRegex, 'الاسم الأخير يجب أن يحتوي على أحرف فقط')
      .max(50, 'الاسم الأخير لا يتجاوز 50 حرف'),

    email: z
      .string()
      .min(1, 'البريد الإلكتروني مطلوب')
      .email('صيغة البريد الإلكتروني غير صحيحة')
      .max(100, 'البريد الإلكتروني طويل جداً'),

    phone: z
      .string()
      .min(1, 'رقم الجوال مطلوب')
      .regex(phoneRegex, 'صيغة رقم الجوال غير صحيحة (مثال: +966501234567)'),

    companyName: z
      .string()
      .min(1, 'اسم الشركة مطلوب')
      .min(2, 'اسم الشركة يجب أن يكون حرفين على الأقل')
      .max(100, 'اسم الشركة لا يتجاوز 100 حرف'),

    address: addressSchema,

    password: z
      .string()
      .min(1, 'كلمة المرور مطلوبة')
      .min(8, 'كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      .max(100, 'كلمة المرور طويلة جداً')
      .regex(/[A-Z]/, 'يجب أن تحتوي على حرف كبير واحد على الأقل')
      .regex(/[a-z]/, 'يجب أن تحتوي على حرف صغير واحد على الأقل')
      .regex(/[0-9]/, 'يجب أن تحتوي على رقم واحد على الأقل'),

    confirmPassword: z.string().min(1, 'تأكيد كلمة المرور مطلوب'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'كلمتا المرور غير متطابقتين',
    path: ['confirmPassword'],
  });

export type AddressFormValues = z.infer<typeof addressSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
