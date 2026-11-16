/**
 * Keeps one WebSocket open to /api/sites/{id}/live while a dashboard is shown.
 *
 * The server sends {"type":"hello"} once, then {"type":"requests","data":[…]}
 * for every batch the agent ships. If the socket drops it reconnects after
 * RECONNECT_MS; `disconnectLiveFeed` (sign-out, leaving the dashboard) stops that.
 */

import type { Middleware } from '@reduxjs/toolkit';
import { connectLiveFeed, disconnectLiveFeed, feedConnectionChanged, receiveLiveRequests } from './slice';
import type { TrafficRequest } from '@/types';

const RECONNECT_MS = 10_000;

interface LiveMessage {
  type: 'hello' | 'requests';
  data?: TrafficRequest[];
}

function parseMessage(raw: string): LiveMessage | null {
  try {
    const message = JSON.parse(raw) as LiveMessage;
    return message && (message.type === 'hello' || message.type === 'requests') ? message : null;
  } catch {
    return null;
  }
}

export const websocketMiddleware: Middleware = (store) => {
  let socket: WebSocket | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let siteId: number | null = null;

  const close = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = null;
    if (socket) {
      socket.onclose = null;
      socket.close();
    }
    socket = null;
  };

  const open = () => {
    if (siteId === null) return;
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    socket = new WebSocket(`${protocol}//${window.location.host}/api/sites/${siteId}/live`);
    socket.onopen = () => store.dispatch(feedConnectionChanged(true));
    socket.onmessage = (event: MessageEvent<string>) => {
      const message = parseMessage(event.data);
      if (message?.type === 'requests' && Array.isArray(message.data)) {
        store.dispatch(receiveLiveRequests(message.data));
      }
    };
    socket.onclose = () => {
      store.dispatch(feedConnectionChanged(false));
      reconnectTimer = setTimeout(open, RECONNECT_MS);
    };
    socket.onerror = () => socket?.close();
  };

  return (next) => (action) => {
    const result = next(action);
    if (connectLiveFeed.match(action)) {
      close();
      siteId = action.payload;
      open();
    }
    if (disconnectLiveFeed.match(action)) {
      siteId = null;
      close();
      store.dispatch(feedConnectionChanged(false));
    }
    return result;
  };
};
