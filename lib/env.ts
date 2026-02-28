const REQUIRED_SUPABASE_ENV_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY"
] as const;

type SupabaseEnvVar = (typeof REQUIRED_SUPABASE_ENV_VARS)[number];

type EnvSource = Record<string, string | undefined>;

export type SupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
};

function findMissingVars(source: EnvSource): SupabaseEnvVar[] {
  return REQUIRED_SUPABASE_ENV_VARS.filter((key) => !source[key]?.trim());
}

function formatMissingMessage(missing: SupabaseEnvVar[]): string {
  return `Missing required Supabase environment variables: ${missing.join(", ")}.`;
}

export function getSupabaseEnv(source: EnvSource = process.env): SupabaseEnv {
  const missing = findMissingVars(source);
  if (missing.length > 0) {
    throw new Error(formatMissingMessage(missing));
  }

  const supabaseUrl = source.NEXT_PUBLIC_SUPABASE_URL as string;
  try {
    // Validate URL shape early so startup failure is explicit.
    new URL(supabaseUrl);
  } catch {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_URL. Expected a valid absolute URL."
    );
  }

  return {
    NEXT_PUBLIC_SUPABASE_URL: supabaseUrl,
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      source.NEXT_PUBLIC_SUPABASE_ANON_KEY as string
  };
}

