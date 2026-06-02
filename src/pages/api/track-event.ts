import type { APIRoute } from 'astro';

// Force this route to be server-rendered (Astro defaults to static).
export const prerender = false;

const PIXEL_ID = '1555645725915857';
const GRAPH_VERSION = 'v22.0';

const ACCESS_TOKEN = import.meta.env.META_CAPI_ACCESS_TOKEN as string | undefined;
const TEST_EVENT_CODE = import.meta.env.META_CAPI_TEST_EVENT_CODE as string | undefined;

type IncomingPayload = {
  event_name?: string;
  event_id?: string;
  event_source_url?: string;
  user_data?: { email?: string };
  custom_data?: Record<string, unknown>;
};

async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input.trim().toLowerCase());
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function clientIp(req: Request): string | undefined {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') ?? undefined;
}

export const POST: APIRoute = async ({ request }) => {
  if (!ACCESS_TOKEN) {
    // CAPI not yet configured. Silently accept so the client doesn't see errors.
    return new Response(null, { status: 204 });
  }

  let body: IncomingPayload;
  try {
    body = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const eventName = body.event_name;
  const eventId = body.event_id;
  if (!eventName || !eventId) {
    return new Response('Missing event_name or event_id', { status: 400 });
  }

  const userAgent = request.headers.get('user-agent') ?? undefined;
  const ip = clientIp(request);
  const emailHash = body.user_data?.email
    ? await sha256Hex(body.user_data.email)
    : undefined;

  const event = {
    event_name: eventName,
    event_time: Math.floor(Date.now() / 1000),
    event_id: eventId,
    event_source_url: body.event_source_url,
    action_source: 'website' as const,
    user_data: {
      ...(emailHash ? { em: [emailHash] } : {}),
      ...(ip ? { client_ip_address: ip } : {}),
      ...(userAgent ? { client_user_agent: userAgent } : {}),
    },
    custom_data: body.custom_data ?? {},
  };

  const payload: Record<string, unknown> = {
    data: [event],
    access_token: ACCESS_TOKEN,
  };
  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      // Log to server console; the client doesn't need the detail.
      console.error('Meta CAPI error', res.status, txt);
      return new Response('Upstream error', { status: 502 });
    }
  } catch (err) {
    console.error('Meta CAPI fetch threw', err);
    return new Response('Upstream error', { status: 502 });
  }

  return new Response(null, { status: 204 });
};
