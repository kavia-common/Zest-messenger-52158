/**
 * Realtime configuration.
 *
 * Uses Vite env variables (VITE_*). This is intentionally non-secret config.
 */

export const ENABLE_REALTIME: boolean =
  String(import.meta.env.VITE_ENABLE_REALTIME ?? '').toLowerCase() === 'true';

/**
 * Channel name used by the BroadcastChannel-based mock WebSocket hub.
 * Keep stable across reloads so multiple tabs can communicate.
 */
export const REALTIME_CHANNEL_NAME = 'zest-messenger-realtime-v1';
