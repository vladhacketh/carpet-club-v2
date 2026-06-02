/**
 * Client-side Meta Pixel + Conversions API bridge.
 *
 * Each event gets a fresh UUID `eventId`. The same id is sent to the
 * Pixel (browser path) and to the server `/api/track-event` endpoint
 * (CAPI path) so Meta deduplicates them in Events Manager.
 *
 * The Pixel snippet itself is inlined in BaseLayout.astro and fires
 * PageView automatically. This module adds:
 *   - Outbound click tracking for shotgun.live and ra.co links
 *   - A window.cc.trackLead(email) helper for the newsletter form
 */

type TrackPayload = {
  event_name: string;
  event_id: string;
  event_source_url: string;
  user_data?: { email?: string };
  custom_data?: Record<string, unknown>;
};

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
    cc?: {
      trackLead: (email?: string) => void;
    };
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

function send(payload: TrackPayload): void {
  const body = JSON.stringify(payload);
  // sendBeacon survives page-unload (e.g. when navigating away on an outbound click).
  if (typeof navigator !== 'undefined' && 'sendBeacon' in navigator) {
    try {
      navigator.sendBeacon('/api/track-event', new Blob([body], { type: 'application/json' }));
      return;
    } catch {
      /* fall through */
    }
  }
  fetch('/api/track-event', {
    method: 'POST',
    body,
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
  }).catch(() => {});
}

function fire(
  pixelEventName: string,
  capiEventName: string,
  customData: Record<string, unknown> = {},
  userData: { email?: string } = {},
  pixelMethod: 'track' | 'trackCustom' = 'track',
) {
  const eventId = uuid();
  if (typeof window.fbq === 'function') {
    window.fbq(pixelMethod, pixelEventName, customData, { eventID: eventId });
  }
  send({
    event_name: capiEventName,
    event_id: eventId,
    event_source_url: window.location.href,
    user_data: userData,
    custom_data: customData,
  });
}

function isOutbound(host: string, target: 'shotgun' | 'ra'): boolean {
  if (target === 'shotgun') return host.endsWith('shotgun.live');
  return host === 'ra.co' || host.endsWith('.ra.co');
}

function classify(url: URL): 'shotgun' | 'ra' | null {
  if (isOutbound(url.hostname, 'shotgun')) return 'shotgun';
  if (isOutbound(url.hostname, 'ra')) return 'ra';
  return null;
}

document.addEventListener(
  'click',
  (e) => {
    const target = e.target as HTMLElement | null;
    const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
    if (!anchor) return;
    let url: URL;
    try {
      url = new URL(anchor.href, window.location.href);
    } catch {
      return;
    }
    const kind = classify(url);
    if (!kind) return;

    if (kind === 'shotgun') {
      fire(
        'OutboundShotgun',
        'OutboundShotgun',
        { destination_url: url.href, link_label: anchor.textContent?.trim() || '' },
        {},
        'trackCustom',
      );
    } else {
      fire(
        'OutboundResidentAdvisor',
        'OutboundResidentAdvisor',
        { destination_url: url.href, link_label: anchor.textContent?.trim() || '' },
        {},
        'trackCustom',
      );
    }
  },
  { capture: true },
);

window.cc = {
  trackLead(email?: string) {
    fire(
      'Lead',
      'Lead',
      { content_name: 'Newsletter signup' },
      email ? { email } : {},
      'track',
    );
  },
};

export {};
