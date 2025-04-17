
import * as z from "zod";

export const managerFormSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }).optional(),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }).optional(),
  fullName: z.string().min(2, { message: "Full name is required" }).optional(),
  beach_id: z.string().optional(),
});

export type ManagerFormValues = z.infer<typeof managerFormSchema>;
