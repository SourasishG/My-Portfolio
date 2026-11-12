import { z } from "zod";

export const contactSubmissionSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter at least 2 characters for your name.")
    .max(80, "Name must be 80 characters or fewer."),
  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address.")
    .max(120, "Email address must be 120 characters or fewer."),
  subject: z
    .string()
    .trim()
    .max(120, "Subject must be 120 characters or fewer.")
    .optional()
    .default(""),
  message: z
    .string()
    .trim()
    .min(10, "Please share at least 10 characters so I have context.")
    .max(2000, "Message must be 2,000 characters or fewer."),
  // Hidden honeypot trap — legitimate users leave this empty
  company: z.string().max(120).optional().default(""),
});

export type ContactFormValues = z.input<typeof contactSubmissionSchema>;
export type ParsedContactSubmission = z.output<typeof contactSubmissionSchema>;
