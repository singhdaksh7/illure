import { z } from 'zod';

export const customerRegisterSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters.'),
  email: z.string().email('Invalid email address.').transform((val) => val.trim().toLowerCase()),
  phone: z
    .string()
    .min(10, 'Phone number must be at least 10 digits.')
    .refine((val) => {
      const clean = val.replace(/\D/g, '');
      const numStr = clean.length === 12 && clean.startsWith('91') ? clean.slice(2) : clean;
      return /^[6-9]\d{9}$/.test(numStr);
    }, 'Invalid Indian mobile number format.'),
  password: z.string().min(6, 'Password must be at least 6 characters.'),
});

export const customerLoginSchema = z.object({
  emailOrPhone: z.string().min(1, 'Email or phone is required.'),
  password: z.string().min(1, 'Password is required.'),
});
