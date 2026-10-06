import { EventEmitter } from "events";

export type RealtimeEventType =
  | "complaint_created"
  | "complaint_updated"
  | "complaint_resolved"
  | "notice_published"
  | "heartbeat";

export interface RealtimeCivicEvent<T = any> {
  id: string;
  type: RealtimeEventType;
  timestamp: string;
  data: T;
}

// Preserve EventEmitter across Hot Module Reloading in Next.js development
declare global {
  // eslint-disable-next-line no-var
  var __civsetuRealtimeEmitter: EventEmitter | undefined;
}

export function getRealtimeEmitter(): EventEmitter {
  if (!globalThis.__civsetuRealtimeEmitter) {
    globalThis.__civsetuRealtimeEmitter = new EventEmitter();
    // Allow large numbers of connected clients without node warning
    globalThis.__civsetuRealtimeEmitter.setMaxListeners(200);
  }
  return globalThis.__civsetuRealtimeEmitter;
}

/**
 * Broadcasts a civic event to all active real-time subscribers (SSE connections)
 */
export function broadcastRealtimeEvent<T = any>(type: RealtimeEventType, data: T): RealtimeCivicEvent<T> {
  const emitter = getRealtimeEmitter();
  const event: RealtimeCivicEvent<T> = {
    id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type,
    timestamp: new Date().toISOString(),
    data,
  };

  emitter.emit("civsetu_realtime", event);
  console.log(`[REALTIME BROADCAST] Event: ${type} | ID: ${event.id}`);
  return event;
}

/**
 * Subscribes a listener to live civic events. Returns unsubscribe cleanup callback.
 */
export function subscribeRealtimeEvents(
  listener: (event: RealtimeCivicEvent) => void
): () => void {
  const emitter = getRealtimeEmitter();
  emitter.on("civsetu_realtime", listener);

  return () => {
    emitter.off("civsetu_realtime", listener);
  };
}
