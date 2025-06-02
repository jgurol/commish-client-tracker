
import { z } from "zod";

export const formSchema = z.object({
  full_name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email address"),
  role: z.enum(["admin", "agent", "owner"], {
    required_error: "Please select a role",
  }),
  associated_agent_id: z.string().nullable().optional(),
});

export type FormValues = z.infer<typeof formSchema>;
