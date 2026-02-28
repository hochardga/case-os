import { z } from "zod";

const callsignPattern = /^[A-Za-z0-9_-]{3,24}$/;

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.");

const callsignSchema = z
  .string()
  .trim()
  .regex(
    callsignPattern,
    "Callsign must be 3-24 characters using letters, numbers, _ or -."
  );

export const applySchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  callsign: callsignSchema
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required.")
});

export const resetPasswordSchema = z.object({
  email: emailSchema
});

export type ApplyInput = z.infer<typeof applySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

