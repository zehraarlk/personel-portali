import { useEffect, useState } from 'react';
import { loadSiteIcons, resolveSiteIcon } from '../icons/siteIcons';

/**
 * site_ikonlari tablosundan ikon haritası.
 * Tüm ana sitede tek önbellek paylaşılır.
 */
export default function useSiteIcons() {
  const [icons, setIcons] = useState({});
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadSiteIcons().then((map) => {
      if (!cancelled) {
        setIcons(map);
        setReady(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const icon = (anahtar, fallback) => resolveSiteIcon(icons, anahtar, fallback);

  return { icons, ready, icon };
}
