import { z } from "zod";

export function validateData<T>(data: any[], schema: z.ZodSchema<T>): T[] {
  return data
    .map((item) => {
      try {
        return schema.parse(item);
      } catch (error) {
        console.error("Validation error:", error);
        return null;
      }
    })
    .filter((item): item is T => item !== null);
}

export function validateSingleData<T>(
  data: any,
  schema: z.ZodSchema<T>,
): T | null {
  try {
    return schema.parse(data);
  } catch (error) {
    console.error("Validation error:", error);
    return null;
  }
}
