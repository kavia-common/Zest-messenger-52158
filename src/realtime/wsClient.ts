import { ENABLE_REALTIME, REALTIME_CHANNEL_NAME } from './config';
import type { Handler, RealtimeEventMap, RealtimeEventName, RealtimeEnvelope } from './events';

/**
 * A lightweight WebSocket-like client that uses BroadcastChannel under the hood.
 *
 * Why BroadcastChannel:
 * - Works in the browser without external services
 * - Allows multiple tabs to simulate multiple clients
 *
 * This module intentionally exposes a small API similar to many WS client libs:
 * - connect()
 * - subscribe(event, handler)
 * - unsubscribe(event, handler)
 * - emit(event, payload)
 *
 * If realtime is disabled (VITE_ENABLE_REALTIME != 'true'), all methods become safe no-ops.
 */

type ConnectionState = 'disconnected' | 'connecting' | 'connected';

type SubscriptionMap = Map<RealtimeEventName, Set<Function>>;

let state: ConnectionState = 'disconnected';
let channel: BroadcastChannel | null = null;
const subscriptions: SubscriptionMap = new Map();

const clientId = `client-${Math.random().toString(16).slice(2)}-${Date.now()}`;
let reconnectAttempt = 0;
let reconnectTimer: number | null = null;

function ensureSet<T>(map: Map<any, Set<any>>, key: any): Set<T> {
  let set = map.get(key);
  if (!set) {
    set = new Set();
    map.set(key, set);
  }
  return set;
}

function nextBackoffMs(attempt: number) {
  // Exponential backoff with jitter; capped.
  const base = Math.min(10_000, 250 * Math.pow(2, Math.min(6, attempt)));
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

function scheduleReconnect() {
  if (!ENABLE_REALTIME) return;
  if (reconnectTimer != null) return;

  const delay = nextBackoffMs(reconnectAttempt++);
  reconnectTimer = window.setTimeout(() => {
    reconnectTimer = null;
    connect().catch(() => {
      // connect() will reschedule if it fails
    });
  }, delay);
}

function closeChannel() {
  if (channel) {
    try {
      channel.close();
    } catch {
      // ignore
    }
  }
  channel = null;
  state = 'disconnected';
}

/**
 * Dispatch messages to local subscribers.
 * This is the core of the pub/sub.
 */
function deliver<TName extends RealtimeEventName>(event: TName, payload: RealtimeEventMap[TName]) {
  const set = subscriptions.get(event);
  if (!set || set.size === 0) return;

  // Copy to avoid mutation during iteration
  [...set].forEach((handler) => {
    try {
      (handler as Handler<TName>)(payload);
    } catch (err) {
      // Avoid breaking the hub due to consumer exceptions
      console.error(`[realtime] handler error for ${event}:`, err);
    }
  });
}

// PUBLIC_INTERFACE
export async function connect(): Promise<void> {
  /**
   * Connect to the mock realtime transport.
   * No-op when realtime is disabled.
   */
  if (!ENABLE_REALTIME) return;
  if (state === 'connected') return;
  if (state === 'connecting') return;

  state = 'connecting';

  try {
    channel = new BroadcastChannel(REALTIME_CHANNEL_NAME);

    channel.onmessage = (evt: MessageEvent) => {
      const data = evt.data as RealtimeEnvelope<any, any> | undefined;
      if (!data || typeof data !== 'object') return;
      if (!data.event) return;

      // Optional: ignore messages we emitted ourselves to avoid double-updates in same tab
      // (Services already do local updates optimistically; pages listen for remote updates.)
      if (data.senderId && data.senderId === clientId) return;

      deliver(data.event as RealtimeEventName, data.payload);
    };

    // If the underlying channel errors (rare), close and try reconnecting
    channel.onmessageerror = () => {
      console.warn('[realtime] BroadcastChannel message error; reconnecting...');
      closeChannel();
      scheduleReconnect();
    };

    state = 'connected';
    reconnectAttempt = 0;
  } catch (err) {
    console.warn('[realtime] connect failed; will retry.', err);
    closeChannel();
    scheduleReconnect();
  }
}

// PUBLIC_INTERFACE
export function disconnect(): void {
  /** Disconnects realtime (mostly used for cleanup in future work). */
  if (!ENABLE_REALTIME) return;
  if (reconnectTimer != null) {
    window.clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }
  closeChannel();
}

// PUBLIC_INTERFACE
export function subscribe<TName extends RealtimeEventName>(event: TName, handler: Handler<TName>): void {
  /** Subscribe to a typed realtime event. Safe no-op if disabled. */
  if (!ENABLE_REALTIME) return;

  ensureSet(subscriptions, event).add(handler as any);

  // Lazily connect on first subscription
  void connect();
}

// PUBLIC_INTERFACE
export function unsubscribe<TName extends RealtimeEventName>(event: TName, handler: Handler<TName>): void {
  /** Unsubscribe from a typed realtime event. Safe no-op if disabled. */
  if (!ENABLE_REALTIME) return;

  const set = subscriptions.get(event);
  if (!set) return;
  set.delete(handler as any);
}

// PUBLIC_INTERFACE
export function emit<TName extends RealtimeEventName>(event: TName, payload: RealtimeEventMap[TName]): void {
  /**
   * Emit an event to all listeners (other tabs + this tab).
   * Safe no-op if disabled or not connected.
   */
  if (!ENABLE_REALTIME) return;

  // If not connected yet, try to connect but still allow local delivery
  if (state !== 'connected') {
    void connect();
  }

  const envelope: RealtimeEnvelope<TName, RealtimeEventMap[TName]> = {
    event,
    payload,
    id: `evt-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    ts: Date.now(),
    senderId: clientId,
  };

  try {
    channel?.postMessage(envelope);
  } catch (err) {
    console.warn('[realtime] emit failed; reconnecting...', err);
    closeChannel();
    scheduleReconnect();
  }

  // Deliver locally too so same-tab subscribers can react immediately if desired.
  deliver(event, payload);
}
