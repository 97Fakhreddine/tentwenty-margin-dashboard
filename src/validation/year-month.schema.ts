import { z } from "zod";

export const monthNumberSchema = z.union([
  z.literal(1),
  z.literal(2),
  z.literal(3),
  z.literal(4),
  z.literal(5),
  z.literal(6),
  z.literal(7),
  z.literal(8),
  z.literal(9),
  z.literal(10),
  z.literal(11),
  z.literal(12),
]);

export const yearMonthSchema = z.object({
  year: z.number().int().positive(),
  month: monthNumberSchema,
});
