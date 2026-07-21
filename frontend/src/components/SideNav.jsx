import { Link, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { BRAND_IMG } from '../constants';

const NAV_SECTIONS = [
  {
    title: null,
    items: [
      { to: '/', label: 'Anasayfa', icon: 'home', end: true },
      { to: '/videolar', label: 'Videolar', icon: 'videocam' },
    ],
  },
  {
    title: 'Etkinlikler',
    items: [
      { to: '/sizden-gelenler', label: 'Sizden Gelenler', icon: 'forum' },
      { to: '/etkinlikler', label: 'Etkinlikler', icon: 'event_available' },
      { to: '/duyurular', label: 'Duyurular', icon: 'campaign' },
    ],
  },
  {
    title: 'Kaynaklar',
    items: [
      { to: '/protokoller', label: 'Protokoller', icon: 'contract_edit' },
      { to: '/dokumanlar', label: 'Dokümanlar', icon: 'description' },
      { to: '/mevzuatlar', label: 'Mevzuatlar', icon: 'gavel' },
      { to: '/egitimler', label: 'Eğitimler', icon: 'school' },
    ],
  },
  {
    title: 'Diğer',
    items: [
      { to: '/anketler', label: 'Anketler', icon: 'poll' },
      { to: '/yardimci-linkler', label: 'Yardımcı Linkler', icon: 'link' },
      { to: '/vefat', label: 'Vefat Eden Bilgisi', icon: 'brightness_alert' },
      { to: '/dogum-gunu', label: 'Doğum Günü Bilgisi', icon: 'cake' },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { to: '/personel', label: 'Personel', icon: 'badge' },
      { to: '/test', label: 'Sistem Testi', icon: 'settings' },
    ],
  },
];

export default function SideNav({ open, onClose }) {
  const location = useLocation();

  useEffect(() => {
    onClose();
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const isActive = (item) => {
    if (item.end) return location.pathname === '/';
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  };

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
        {/* Marka — logo görseli yok, tipografi */}
        <div className="relative shrink-0 border-b border-outline-variant/20 px-4 pb-4 pt-5">
          <button
            type="button"
            className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full text-on-surface-variant hover:bg-surface-container-low lg:hidden"
            onClick={onClose}
            aria-label="Menüyü kapat"
          >
            <span className="material-symbols-outlined text-[22px]">close</span>
          </button>

          <Link to="/" onClick={onClose} className="block pr-8 lg:pr-0" aria-label="Ana Sayfa">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary/70">
              Gebze Belediyesi
            </p>
            <p className="mt-0.5 text-lg font-bold leading-tight tracking-tight text-[#022842]">
              Personel Portalı
            </p>
          </Link>
        </div>

        {/* Profil */}
        <div className="shrink-0 border-b border-outline-variant/20 px-3 py-3">
          <div className="flex items-center gap-3 rounded-xl bg-surface-container-low px-3 py-2.5">
            <img
              src={BRAND_IMG}
              alt="Profil"
              className="h-10 w-10 shrink-0 rounded-full object-cover border border-outline-variant/40 bg-white"
            />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-on-surface">Personel</p>
              <p className="truncate text-xs text-on-surface-variant">Gebze Belediyesi</p>
            </div>
          </div>
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
                      <span
                        className={`material-symbols-outlined shrink-0 text-[20px] ${active ? 'icon-filled' : ''}`}
                      >
                        {item.icon}
                      </span>
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
