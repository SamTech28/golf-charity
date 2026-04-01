import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

const optionalNonEmpty = z.preprocess(
  (v) => (typeof v === "string" && v.trim() === "" ? undefined : v),
  z.string().min(1).optional(),
);

export const env = createEnv({
  server: {
    /** When true, POST /api/demo/activate-subscription can grant an active row (local / India demo without Stripe). */
    DEMO_SUBSCRIPTION_MODE: z
      .string()
      .optional()
      .transform((v) => v === "true"),
    SUPABASE_SERVICE_ROLE_KEY: optionalNonEmpty,
    STRIPE_SECRET_KEY: optionalNonEmpty,
    STRIPE_WEBHOOK_SECRET: optionalNonEmpty,
    STRIPE_PRICE_MONTHLY_ID: optionalNonEmpty,
    STRIPE_PRICE_YEARLY_ID: optionalNonEmpty,
    RESEND_API_KEY: optionalNonEmpty,
    EMAIL_FROM: optionalNonEmpty,
  },
  client: {
    NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
    NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalNonEmpty,
    NEXT_PUBLIC_APP_URL: z.string().url(),
    NEXT_PUBLIC_DEMO_SUBSCRIPTION: z
      .string()
      .optional()
      .transform((v) => v === "true"),
  },
  runtimeEnv: {
    DEMO_SUBSCRIPTION_MODE: process.env.DEMO_SUBSCRIPTION_MODE,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PRICE_MONTHLY_ID: process.env.STRIPE_PRICE_MONTHLY_ID,
    STRIPE_PRICE_YEARLY_ID: process.env.STRIPE_PRICE_YEARLY_ID,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    EMAIL_FROM: process.env.EMAIL_FROM,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NEXT_PUBLIC_DEMO_SUBSCRIPTION: process.env.NEXT_PUBLIC_DEMO_SUBSCRIPTION,
  },
});

