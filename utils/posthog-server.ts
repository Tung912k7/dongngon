/**
 * Server-side PostHog utility for capturing events from Next.js Server Actions.
 * Uses posthog-node which sends events directly to the PostHog ingest endpoint,
 * bypassing the browser-side /api/event proxy.
 *
 * Events are fire-and-forget: analytics failures NEVER block the main action flow.
 */
import { PostHog } from 'posthog-node';

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!apiKey) return null;

  if (!_client) {
    _client = new PostHog(apiKey, {
      host: 'https://us.i.posthog.com',
      // Flush immediately — serverless functions can terminate before a batched flush
      flushAt: 1,
      flushInterval: 0,
    });
  }
  return _client;
}

/**
 * Capture a server-side PostHog event tied to an authenticated user.
 * @param distinctId  The Supabase user.id (used as PostHog distinct_id)
 * @param event       Event name, e.g. 'work_created'
 * @param properties  Optional key-value properties sent alongside the event
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, unknown>
): Promise<void> {
  const client = getClient();
  if (!client) return;

  try {
    client.capture({ distinctId, event, properties });
    // Flush synchronously so the event is delivered before the serverless
    // function exits. posthog-node's flush() returns a Promise.
    await client.flush();
  } catch {
    // Intentionally silent — analytics must never break core functionality
  }
}
