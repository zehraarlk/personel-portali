import {
  AUTH_CHANNEL,
  applyAuthFromPeer,
  getOturumId,
  getPersonelId,
  getYoneticiId,
  getYoneticiOturumId,
} from './session';

const REQUEST_TIMEOUT_MS = 250;

/**
 * Sekmeler arası oturum paylaşımı (BroadcastChannel).
 */
export function initAuthSync() {
  if (typeof window === 'undefined') {
    return Promise.resolve();
  }

  const hasChannel = typeof BroadcastChannel !== 'undefined';
  const channel = hasChannel ? new BroadcastChannel(AUTH_CHANNEL) : null;

  if (channel) {
    channel.onmessage = (event) => {
      const msg = event.data;
      if (!msg || typeof msg !== 'object') return;

      if (msg.type === 'AUTH_REQUEST') {
        channel.postMessage({
          type: 'AUTH_RESPONSE',
          personelId: getPersonelId(),
          yoneticiId: getYoneticiId(),
          oturumId: getOturumId(),
          yoneticiOturumId: getYoneticiOturumId(),
        });
        return;
      }

      if (msg.type === 'AUTH_SET') {
        applyAuthFromPeer(msg);
        return;
      }

      if (msg.type === 'AUTH_CLEAR') {
        applyAuthFromPeer({});
      }
    };
  }

  if (getPersonelId() || getYoneticiId()) {
    return Promise.resolve();
  }

  if (!channel) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      channel.removeEventListener('message', onMessage);
      clearTimeout(timer);
      resolve();
    };

    const onMessage = (event) => {
      const msg = event.data;
      if (msg?.type !== 'AUTH_RESPONSE') return;
      const hasAuth = Boolean(msg.personelId || msg.yoneticiId);
      if (hasAuth) {
        applyAuthFromPeer(msg);
      }
      finish();
    };

    channel.addEventListener('message', onMessage);
    try {
      channel.postMessage({ type: 'AUTH_REQUEST' });
    } catch {
      finish();
      return;
    }

    const timer = setTimeout(finish, REQUEST_TIMEOUT_MS);
  });
}
