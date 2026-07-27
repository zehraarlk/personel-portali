/** Site geneli görsel sığdırma: contain (sığdır+blur) | cover (tam ekran) */

export const MEDIA_FIT_KEY = 'gebze-media-fit';
export const MEDIA_FIT_EVENT = 'gebze-media-fit-change';

export function getMediaFit() {
  try {
    const v = localStorage.getItem(MEDIA_FIT_KEY);
    if (v === 'cover' || v === 'contain') return v;
  } catch {
    /* ignore */
  }
  // Varsayılan: sığdır (alanı kapla)
  return 'cover';
}

export function setMediaFit(fit) {
  const next = fit === 'cover' ? 'cover' : 'contain';
  try {
    localStorage.setItem(MEDIA_FIT_KEY, next);
  } catch {
    /* ignore */
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(MEDIA_FIT_EVENT, { detail: next }));
  }
  return next;
}
