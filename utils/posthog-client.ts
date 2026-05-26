/**
 * Client-side PostHog utility for capturing custom analytics events.
 * Safe to call from client components; analytics failures will never block user interactions.
 */
export async function captureClientEvent(
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return;

  try {
    const posthog = (await import("posthog-js")).default;
    posthog.capture(event, properties);
  } catch {
    // Intentionally silent - analytics must never break client functionality
  }
}
