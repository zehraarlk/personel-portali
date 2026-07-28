import { useEffect, useState } from 'react';
import { initAuthSync } from '../auth/sessionSync';
import { recoverSessionIfNeeded, startSessionLifecycle } from '../auth/sessionLifecycle';
import {
  clearAuth,
  clearPendingSessionClose,
  consumePendingSessionClose,
  getOturumId,
  getPersonelId,
  getYoneticiId,
  getYoneticiOturumId,
  setOturumId,
  setProfileCache,
  setYoneticiOturumId,
} from '../auth/session';
import { checkAuthSession, resumeAuthSession } from '../api/client';

async function applyResume(data) {
  if (data?.type === 'personel' && data.oturum_id) {
    setOturumId(data.oturum_id);
    if (data.personel) setProfileCache(data.personel);
    return true;
  }
  if (data?.type === 'yonetici' && data.oturum_id) {
    setYoneticiOturumId(data.oturum_id);
    if (data.yonetici) setProfileCache(data.yonetici);
    return true;
  }
  return false;
}

/**
 * Sekme kapanışı / yenileme / kardeş sekme ayrımı.
 * Ağ hatasında (backend yeniden başlatma) oturumu SİLMEZ.
 */
async function reconcileSession() {
  const pending = consumePendingSessionClose();
  const hasAuth = Boolean(getPersonelId() || getYoneticiId());

  // Pending var ama bu sekmede (veya sync ile) oturum duruyor → kapanışı iptal et / resume
  if (pending && hasAuth) {
    try {
      const data = await resumeAuthSession();
      await applyResume(data);
    } catch {
      try {
        const result = await checkAuthSession();
        if (result?.valid === false) {
          // DB kapalı ve resume olmadı — bir kez daha dene; olmazsa lokal kalsın
          // (kardeş sekme recover edebilir). Ağ yoksa dokunma.
          try {
            const again = await resumeAuthSession();
            await applyResume(again);
          } catch {
            /* backend kalkana kadar lokal oturumu koru */
          }
        }
      } catch {
        /* API down — oturumu koru */
      }
    }
    return;
  }

  if (pending && !hasAuth) {
    // Tüm sekmeler kapanmıştı; yeni boş sekme → giriş ekranı
    clearPendingSessionClose();
    return;
  }

  if (!hasAuth) return;

  if (getPersonelId() && !getOturumId()) {
    try {
      const data = await resumeAuthSession();
      if (!(await applyResume(data))) clearAuth();
    } catch {
      /* backend yoksa id'yi koru; sonraki isteklerde toparlanır */
    }
    return;
  }
  if (getYoneticiId() && !getYoneticiOturumId()) {
    try {
      const data = await resumeAuthSession();
      if (!(await applyResume(data))) clearAuth();
    } catch {
      /* keep */
    }
    return;
  }

  try {
    const result = await checkAuthSession();
    if (result?.valid === false) {
      try {
        const data = await resumeAuthSession();
        await applyResume(data);
      } catch {
        // Geçersiz oturum + resume yok → çıkış
        clearAuth();
      }
    }
  } catch {
    // Yeniden başlatma / API kısa kesinti — oturumu düşürme
  }
}

/**
 * Yeni sekmede kardeş oturum gelene kadar bekler; sonra uzlaştırır.
 */
export default function AuthBootstrap({ children }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let stopLifecycle = () => {};

    initAuthSync()
      .then(() => reconcileSession())
      .then(() => {
        if (!cancelled) recoverSessionIfNeeded();
      })
      .catch(() => {
        // Sync/reconcile hatası oturumu silmesin
      })
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
