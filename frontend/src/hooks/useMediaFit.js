import { useEffect, useState } from 'react';
import { getMediaFit, MEDIA_FIT_EVENT, setMediaFit } from '../mediaFit';

/** Site geneli görsel fit tercihi — localStorage + canlı güncelleme */
export default function useMediaFit() {
  const [fit, setFit] = useState(() => getMediaFit());

  useEffect(() => {
    const sync = (value) => {
      const next = value === 'cover' || value === 'contain' ? value : getMediaFit();
      setFit(next);
    };

    const onCustom = (e) => sync(e.detail);
    const onStorage = (e) => {
      if (e.key === null || e.key === 'gebze-media-fit') sync(getMediaFit());
    };

    window.addEventListener(MEDIA_FIT_EVENT, onCustom);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener(MEDIA_FIT_EVENT, onCustom);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  return [fit, setMediaFit];
}
