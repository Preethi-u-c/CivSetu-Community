import { NextRequest, NextResponse } from "next/server";
import { subscribeRealtimeEvents, RealtimeCivicEvent } from "@/lib/services/realtimeEvents";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * GET /api/realtime/complaints
 * Server-Sent Events (SSE) streaming endpoint for live updates.
 * Broadcasts:
 * - complaint_created (new complaint lodged)
 * - complaint_updated (status progression, assignment, escalation)
 * - complaint_resolved (remedial action complete)
 * - notice_published (emergency broadcast or gazette circular)
 */
export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();

  // Create stream
  const stream = new ReadableStream({
    start(controller) {
      // 1. Initial Handshake Message
      const handshake = `event: connected\ndata: ${JSON.stringify({
        status: "connected",
        message: "Lakshmeshwar TMC Realtime Civic Event Stream Active",
        timestamp: new Date().toISOString(),
      })}\n\n`;
      controller.enqueue(encoder.encode(handshake));

      // 2. Event Listener callback
      const unsubscribe = subscribeRealtimeEvents((event: RealtimeCivicEvent) => {
        try {
          const sseChunk = `event: ${event.type}\ndata: ${JSON.stringify(event.data)}\nid: ${event.id}\n\n`;
          controller.enqueue(encoder.encode(sseChunk));
        } catch (err) {
          console.error("Error enqueueing SSE event:", err);
        }
      });

      // 3. Keepalive Heartbeat Interval (every 15 seconds)
      const heartbeatInterval = setInterval(() => {
        try {
          const ping = `: heartbeat\n\n`;
          controller.enqueue(encoder.encode(ping));
        } catch {
          clearInterval(heartbeatInterval);
        }
      }, 15000);

      // 4. Cleanup on disconnect
      const cleanup = () => {
        clearInterval(heartbeatInterval);
        unsubscribe();
        try {
          controller.close();
        } catch {
          // stream already closed
        }
      };

      req.signal.addEventListener("abort", cleanup);
    },
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform, must-revalidate",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
