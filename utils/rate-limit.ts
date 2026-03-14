type Bucket = {
  count: number;
  resetAt: number;
};

type RateLimitResult = {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
};

const buckets = new Map<string, Bucket>();

function cleanupExpired(now: number) {
  if (buckets.size < 5000) return;

  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
}

export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  cleanupExpired(now);

  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return {
      allowed: true,
      remaining: Math.max(0, limit - 1),
      retryAfterSeconds: Math.ceil(windowMs / 1000),
    };
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
    };
  }

  existing.count += 1;
  buckets.set(key, existing);

  return {
    allowed: true,
    remaining: Math.max(0, limit - existing.count),
    retryAfterSeconds: Math.ceil((existing.resetAt - now) / 1000),
  };
}

type SupabaseLike = {
  rpc: (fn: string, params?: Record<string, unknown>) => PromiseLike<{
    data: unknown;
    error: { message?: string } | null;
  }>;
};

export async function checkRateLimitDistributed(
  supabase: SupabaseLike,
  key: string,
  limit: number,
  windowMs: number
): Promise<RateLimitResult> {
  const windowSeconds = Math.max(1, Math.ceil(windowMs / 1000));

  try {
    const { data, error } = await supabase.rpc("check_rate_limit", {
      p_key: key,
      p_limit: limit,
      p_window_seconds: windowSeconds,
    });

    if (error) {
      throw new Error(error.message || "Rate limit RPC error");
    }

    const row = Array.isArray(data) ? data[0] : null;
    if (!row || typeof row !== "object") {
      throw new Error("Rate limit RPC returned invalid data");
    }

    const allowed = Boolean((row as { allowed?: boolean }).allowed);
    const remaining = Number((row as { remaining?: number }).remaining ?? 0);
    const retryAfterSeconds = Number((row as { retry_after_seconds?: number }).retry_after_seconds ?? windowSeconds);

    return {
      allowed,
      remaining: Number.isFinite(remaining) ? Math.max(0, remaining) : 0,
      retryAfterSeconds: Number.isFinite(retryAfterSeconds)
        ? Math.max(1, Math.ceil(retryAfterSeconds))
        : windowSeconds,
    };
  } catch {
    // Fallback keeps protection active if RPC is unavailable.
    return checkRateLimit(key, limit, windowMs);
  }
}
