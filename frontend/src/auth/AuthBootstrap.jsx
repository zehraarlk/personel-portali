import { useEffect, useState } from 'react';
import { initAuthSync } from '../auth/sessionSync';
import { startSessionLifecycle } from '../auth/sessionLifecycle';

/**
 * Yeni sekmede kardeş oturum gelene kadar (kısa) bekler;
 * canlı sekme kaydı + son sekme kapanışında DB oturum kapatma.
 */
export default function AuthBootstrap({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stopLifecycle = () => {};

    initAuthSync()
      .finally(() => {
        if (!cancelled) {
          stopLifecycle = startSessionLifecycle();
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
      stopLifecycle();
    };
  }, []);

  if (!ready) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          fontFamily: 'Inter, system-ui, sans-serif',
          color: '#5b6b76',
          background: '#f3f6f8',
          fontSize: '0.9rem',
          fontWeight: 600,
        }}
      >
        Oturum kontrol ediliyor…
      </div>
    );
  }

  return children;
}
