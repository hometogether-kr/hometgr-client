import { z } from "zod";

export const operatorPasswordSchema = z
  .string()
  .min(4)
  .max(128)
  .refine((value) => value.trim().length >= 4);
