import { z } from "zod";

// List of disposable email domains to block
const DISPOSABLE_DOMAINS = [
  "tempmail.com",
  "throwaway.email",
  "guerrillamail.com",
  "mailinator.com",
  "10minutemail.com",
  "yopmail.com",
  "temp-mail.org",
  "fakeinbox.com",
  "trashmail.com",
  "maildrop.cc",
];

export const emailSchema = z
  .string()
  .min(1, "L'adresse email est requise")
  .email("Hmm, vérifie ton adresse email.")
  .refine(
    (email) => {
      const domain = email.split("@")[1]?.toLowerCase();
      return !DISPOSABLE_DOMAINS.includes(domain);
    },
    { message: "Les adresses email temporaires ne sont pas acceptées." }
  )
  .transform((email) => email.toLowerCase().trim());

export const waitlistSchema = z.object({
  email: emailSchema,
  consent: z
    .boolean()
    .refine((val) => val === true, {
      message: "Tu dois accepter pour t'inscrire.",
    }),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;
