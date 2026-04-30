import "server-only";
import { z } from "zod";

const schema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20),
  SUPABASE_STORAGE_BUCKET: z.string().default("certificates"),
  ADMIN_PASSWORD: z.string().min(6),
  SESSION_SECRET: z.string().min(32),
  PUBLIC_BASE_URL: z.string().url().default("http://localhost:3000"),
  ACADEMIC_YEAR: z
    .string()
    .regex(/^\d{4}$/)
    .optional(),
});

export type Env = z.infer<typeof schema>;

let cached: Env | null = null;

export function getEnv(): Env {
  if (cached) return cached;
  const parsed = schema.safeParse(process.env);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(
      `Invalid or missing environment variables:\n${issues}\n\n` +
        `Copy .env.example to .env.local and fill the values. ` +
        `In production, set these in your Vercel project settings.`,
    );
  }
  cached = parsed.data;
  return cached;
}
