import { z } from 'zod';

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .min(6, 'رمز التحقق يتكون من 6 أرقام')
    .max(6, 'رمز التحقق يتكون من 6 أرقام')
    .regex(/^[0-9]{6}$/, 'رمز التحقق يحتوي على أرقام فقط'),
});

export type VerifyCodeFormValues = z.infer<typeof verifyCodeSchema>;
