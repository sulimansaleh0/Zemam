import { z } from 'zod';

export const onboardingSchema = z.object({
  companyName: z
    .string()
    .min(1, 'اسم الشركة أو المؤسسة مطلوب')
    .min(6, 'اسم الشركة يجب أن لا يقل عن 6 أحرف')
    .max(100, 'اسم الشركة طويل جداً'),
});

export type OnboardingFormValues = z.infer<typeof onboardingSchema>;
