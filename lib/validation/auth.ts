import { z } from "zod";

import { isSafeRelativePath } from "@/lib/auth/redirects";

const callsignPattern = /^[A-Za-z0-9_-]{3,24}$/;

const emailSchema = z
  .string()
  .trim()
  .email("Enter a valid email address.")
  .transform((value) => value.toLowerCase());

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long.");

const nonEmptyStringSchema = z.string().trim().min(1);

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
  password: z.string().min(1, "Password is required."),
  next: z
    .string()
    .trim()
    .refine(isSafeRelativePath, "Invalid redirect path.")
    .optional()
});

export const resetPasswordRequestSchema = z.object({
  email: emailSchema
});

export const resetPasswordConfirmSchema = z
  .object({
    newPassword: passwordSchema,
    confirmPassword: nonEmptyStringSchema
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    message: "Passwords must match.",
    path: ["confirmPassword"]
  });

export const resendVerificationSchema = z.object({
  email: emailSchema
});

export const accountDeletionRequestSchema = z.object({
  confirmationText: z.literal("DELETE", {
    errorMap: () => ({
      message: 'Type "DELETE" to confirm account deletion request.'
    })
  }),
  reason: z.string().trim().max(500, "Reason must be 500 characters or less.").optional()
});

// Legacy alias retained for existing request handlers/components.
export const resetPasswordSchema = resetPasswordRequestSchema;

export type ApplyInput = z.infer<typeof applySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>;
export type ResetPasswordConfirmInput = z.infer<typeof resetPasswordConfirmSchema>;
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;
export type AccountDeletionRequestInput = z.infer<typeof accountDeletionRequestSchema>;
export type ResetPasswordInput = ResetPasswordRequestInput;
