import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BRAND_IMG, SITE_LOGO_WHITE } from '../constants';
import { fetchSiteIcons, fetchProfile } from '../api/client';

const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { to: '/', label: 'Anasayfa', iconKey: 'anasayfa', end: true },
      { to: '/videolar', label: 'Videolar', iconKey: 'videolar' },
    ],
  },
  {
    title: 'Etkinlikler',
    items: [
      { to: '/sizden-gelenler', label: 'Sizden Gelenler', iconKey: 'sizden_gelenler' },
      { to: '/etkinlikler', label: 'Etkinlikler', iconKey: 'etkinlik_takvimi' },
      { to: '/duyurular', label: 'Duyurular', iconKey: 'duyurular' },
    ],
  },
  {
    title: 'Kaynaklar',
    items: [
      { to: '/protokoller', label: 'Protokoller', iconKey: 'protokoller' },
      { to: '/dokumanlar', label: 'Dokümanlar', iconKey: 'dokumanlar' },
      { to: '/mevzuatlar', label: 'Mevzuatlar', iconKey: 'mevzuatlar' },
      { to: '/egitimler', label: 'Eğitimler', iconKey: 'egitimler' },
    ],
  },
  {
    title: 'Diğer',
    items: [
      { to: '/anketler', label: 'Anketler', iconKey: 'anketler' },
      { to: '/yardimci-linkler', label: 'Yardımcı Linkler', iconKey: 'yardimci_linkler' },
      { to: '/vefat', label: 'Vefat Eden Bilgisi', iconKey: 'vefat_bilgisi' },
      { to: '/dogum-gunu', label: 'Doğum Günü Bilgisi', iconKey: 'dogum_gunu' },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { to: '/test', label: 'Sistem Testi', iconKey: 'yonetim_paneli' },
    ],
  },
];

const PROFILE_MENU = [
  { to: '/profil/sifre-degistir', label: 'Şifre Değiştir', iconKey: 'sifre_degistir' },
  { to: '/profil/eposta-degistir', label: 'E-posta Değiştir', iconKey: 'email_degistir' },
  { to: '/profil/oturum-kayitlari', label: 'Oturum Kayıtları', iconKey: 'oturum_bilgileri' },
];

const FALLBACK_ICONS = {
  anasayfa: 'fas fa-home',
  videolar: 'fas fa-video',
  sizden_gelenler: 'fas fa-comments',
  etkinlik_takvimi: 'fas fa-calendar-check',
  duyurular: 'fas fa-bullhorn',
  protokoller: 'fas fa-file-signature',
  dokumanlar: 'fas fa-file-alt',
  mevzuatlar: 'fas fa-balance-scale',
  egitimler: 'fas fa-graduation-cap',
  anketler: 'fas fa-poll',
  yardimci_linkler: 'fas fa-link',
  vefat_bilgisi: 'fas fa-ribbon',
  dogum_gunu: 'fas fa-birthday-cake',
  yonetim_paneli: 'fas fa-cog',
  menu_ac: 'fas fa-bars',
  sifre_degistir: 'fas fa-key',
  email_degistir: 'fas fa-envelope',
  oturum_bilgileri: 'fas fa-history',
};

export default function SideNav({ open, onClose }) {
  const location = useLocation();
  const [icons, setIcons] = useState(FALLBACK_ICONS);
  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    onClose();
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;
    fetchSiteIcons()
      .then((data) => {
        if (!cancelled && data?.icons) {
          setIcons({ ...FALLBACK_ICONS, ...data.icons });
        }
      })
      .catch(() => {});
    fetchProfile()
      .then((data) => {
        if (!cancelled) setProfile(data);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onDoc = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);

  const isActive = (item) => {
    if (item.end) return location.pathname === '/';
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  };

  const iconClass = (key) => icons[key] || FALLBACK_ICONS[key] || 'fas fa-circle';
  const foto = profile?.foto || BRAND_IMG;
  const adSoyad = profile?.ad_soyad || 'Personel';
  const rol = profile?.rol || 'Personel';

  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-[60] bg-black/45 lg:hidden"
          aria-label="Menüyü kapat"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed z-[70] inset-y-0 left-0 flex w-[min(18rem,88vw)] flex-col bg-white shadow-xl transition-transform duration-300 ease-out lg:w-64 lg:translate-x-0 lg:shadow-none lg:border-r lg:border-outline-variant/25 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="shrink-0 bg-[#022842] px-3 py-4">
          <div className="flex items-center gap-4">
            <div className="hidden w-9 shrink-0 lg:block" aria-hidden="true" />
            <Link
              to="/"
              onClick={onClose}
              className="flex min-w-0 flex-1 items-center justify-center"
              aria-label="Ana Sayfa"
            >
              <img
                src={SITE_LOGO_WHITE}
                alt="Gebze Belediyesi"
                className="h-12 w-auto max-w-[160px] object-contain object-center mix-blend-lighten"
              />
            </Link>
            <button
              type="button"
              className="grid h-9 w-9 shrink-0 place-items-center rounded-full text-white/80 hover:bg-white/10 lg:invisible lg:pointer-events-none"
              onClick={onClose}
              aria-label="Menüyü kapat"
            >
              <i className="fas fa-times text-[18px]" aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className="relative shrink-0 border-b border-outline-variant/20 px-3 py-3" ref={menuRef}>
          <button
            type="button"
            className="flex w-full items-center gap-3 rounded-xl bg-surface-container-low px-3 py-2.5 text-left transition hover:bg-surface-container"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <img
              src={foto}
              alt=""
              className="h-10 w-10 shrink-0 rounded-full object-cover border border-outline-variant/40 bg-white"
              onError={(e) => {
                e.currentTarget.src = BRAND_IMG;
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-on-surface">{adSoyad}</p>
              <p className="truncate text-xs text-on-surface-variant">{rol}</p>
            </div>
            <i
              className={`fas fa-chevron-${menuOpen ? 'up' : 'down'} text-[11px] text-on-surface-variant`}
              aria-hidden="true"
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute left-3 right-3 top-[calc(100%-0.35rem)] z-20 overflow-hidden rounded-xl border border-outline-variant/25 bg-white py-1 shadow-lg"
            >
              {PROFILE_MENU.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    onClose();
                  }}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface"
                >
                  <i className={`${iconClass(item.iconKey)} w-4 text-center text-[14px]`} aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>

        <nav className="flex flex-1 flex-col gap-3 overflow-y-auto p-3">
          {NAV_SECTIONS.map((section) => (
            <div key={section.title ?? 'main'}>
              {section.title && (
                <p className="mb-1 px-3 text-[11px] font-bold uppercase tracking-wider text-on-surface-variant/70">
                  {section.title}
                </p>
              )}
              <div className="flex flex-col gap-0.5">
                {section.items.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.to}
                      to={item.to}
                      onClick={onClose}
                      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                        active
                          ? 'bg-primary-container text-white'
                          : 'text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      <i
                        className={`${iconClass(item.iconKey)} shrink-0 w-5 text-center text-[16px]`}
                        aria-hidden="true"
                      />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}

export { FALLBACK_ICONS };
