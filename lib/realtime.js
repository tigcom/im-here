import { Client } from '@stomp/stompjs';

export function getRealtimeUrl() {
  if (process.env.NEXT_PUBLIC_WS_URL) return process.env.NEXT_PUBLIC_WS_URL;
  if (typeof window === 'undefined') return null;

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (apiUrl && /^https?:\/\//i.test(apiUrl)) {
    const base = new URL(apiUrl);
    const protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${base.host}/api/ws`;
  }

  const { protocol, hostname, port } = window.location;
  const backendPort = ['localhost', '127.0.0.1', '::1'].includes(hostname) && (!port || port === '3000')
    ? ':8080'
    : port ? `:${port}` : '';
  return `${protocol === 'https:' ? 'wss:' : 'ws:'}//${hostname}${backendPort}/api/ws`;
}

export function createRealtimeClient(token, onConnect, onDisconnect) {
  const brokerURL = getRealtimeUrl();
  if (!brokerURL || !token) return null;
  const handleDisconnect = typeof onDisconnect === 'function' ? onDisconnect : () => {};

  const client = new Client({
    brokerURL,
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
    debug: () => {},
    onConnect,
    onWebSocketClose: handleDisconnect,
    onStompError: handleDisconnect,
  });
  return client;
}
