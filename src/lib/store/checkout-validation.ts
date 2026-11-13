import { z } from "zod";

export function normalizeIndianPhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "");
  let local = digits;

  if (digits.length === 12 && digits.startsWith("91")) {
    local = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    local = digits.slice(1);
  }

  return /^[6-9]\d{9}$/.test(local) ? local : null;
}

export const checkoutFormSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(2, "Full name must be at least 2 characters.")
    .max(80, "Full name must be 80 characters or fewer.")
    .regex(
      /^[A-Za-z][A-Za-z\s.'-]*$/,
      "Enter a valid name using letters only.",
    ),
  email: z.string().trim().email("Enter a valid email address."),
  address: z
    .string()
    .trim()
    .min(6, "Enter your complete street / house address.")
    .max(200, "Address must be 200 characters or fewer."),
  stateCode: z.string().trim().min(1, "Please select a state."),
  stateName: z.string().trim().min(1, "Please select a state."),
  city: z.string().trim().min(1, "Please select a city."),
  pinCode: z
    .string()
    .trim()
    .regex(/^[1-9][0-9]{5}$/, "Enter a valid 6-digit Indian PIN code."),
  phone: z
    .string()
    .trim()
    .refine(
      (value) => normalizeIndianPhone(value) !== null,
      "Enter a valid 10-digit Indian mobile number (starts with 6–9).",
    ),
});

export type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;
export type CheckoutFieldName = keyof CheckoutFormValues;
export type CheckoutFieldErrors = Partial<Record<CheckoutFieldName, string>>;

