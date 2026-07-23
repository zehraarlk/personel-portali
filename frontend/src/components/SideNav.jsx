import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BRAND_IMG, SITE_LOGO_WHITE } from '../constants';
import {
  fetchSiteIcons,
  fetchProfile,
  fetchAdminProfile,
  logoutPersonel,
  logoutAdmin,
} from '../api/client';
import {
  canAccessPortal,
  clearAuth,
  clearPersonelAuth,
  getPersonelId,
  isYoneticiLoggedIn,
} from '../auth/session';
import '../styles/navbar.css';

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
];

const LEFT_SECTIONS = NAV_SECTIONS.slice(0, 2);
const RIGHT_SECTIONS = NAV_SECTIONS.slice(2);

const PROFILE_MENU_PERSONEL = [
  { to: '/profil/sifre-degistir', label: 'Şifre Değiştir', iconKey: 'sifre_degistir' },
  { to: '/profil/eposta-degistir', label: 'E-posta Değiştir', iconKey: 'email_degistir' },
  { to: '/profil/oturum-kayitlari', label: 'Oturum Kayıtları', iconKey: 'oturum_bilgileri' },
];

const PROFILE_MENU_ADMIN = [
  { to: '/admin', label: 'Yönetim Paneli', iconKey: 'yonetim_paneli' },
  { to: '/admin/profil/sifre-degistir', label: 'Şifre Değiştir', iconKey: 'sifre_degistir' },
  { to: '/admin/profil/oturum-kayitlari', label: 'Oturum Kayıtları', iconKey: 'oturum_bilgileri' },
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
  menu_ac: 'fas fa-bars',
  sifre_degistir: 'fas fa-key',
  email_degistir: 'fas fa-envelope',
  oturum_bilgileri: 'fas fa-history',
  giris: 'fas fa-sign-in-alt',
  cikis: 'fas fa-sign-out-alt',
  yonetim_paneli: 'fas fa-tachometer-alt',
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [icons, setIcons] = useState(FALLBACK_ICONS);
  const [profile, setProfile] = useState(null);
  const [loggedIn, setLoggedIn] = useState(() => canAccessPortal());
  const [isAdmin, setIsAdmin] = useState(() => isYoneticiLoggedIn());
  const [openMenu, setOpenMenu] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const navRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    setOpenMenu(null);
    setSidebarOpen(false);
    setProfileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!sidebarOpen) return undefined;
    setProfileOpen(false);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sidebarOpen]);

  useEffect(() => {
    if (!profileOpen) return undefined;
    const onDoc = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [profileOpen]);

  useEffect(() => {
    let cancelled = false;
    const admin = isYoneticiLoggedIn();
    setLoggedIn(canAccessPortal());
    setIsAdmin(admin);
    fetchSiteIcons()
      .then((data) => {
        if (!cancelled && data?.icons) {
          setIcons({ ...FALLBACK_ICONS, ...data.icons });
        }
      })
      .catch(() => {});

    if (getPersonelId()) {
      fetchProfile()
        .then((data) => {
          if (!cancelled) setProfile(data);
        })
        .catch(() => {
          if (!cancelled) setProfile(null);
        });
    } else if (admin) {
      fetchAdminProfile()
        .then((data) => {
          if (!cancelled) setProfile(data);
        })
        .catch(() => {
          if (!cancelled) setProfile(null);
        });
    } else {
      setProfile(null);
    }
    return () => {
      cancelled = true;
    };
  }, [location.pathname]);

  useEffect(() => {
    if (!openMenu) return undefined;
    const onDoc = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [openMenu]);

  const handleLogout = async () => {
    setOpenMenu(null);
    setSidebarOpen(false);
    setProfileOpen(false);
    const admin = isYoneticiLoggedIn();
    try {
      if (admin) {
        await logoutAdmin();
      } else {
        await logoutPersonel();
      }
    } catch {
      /* local clear */
    }
    if (admin) {
      clearAuth();
      setLoggedIn(false);
      setIsAdmin(false);
      setProfile(null);
      navigate('/admin/giris');
      return;
    }
    clearPersonelAuth();
    setLoggedIn(false);
    setProfile(null);
    navigate('/giris');
  };

  const profileMenu = isAdmin ? PROFILE_MENU_ADMIN : PROFILE_MENU_PERSONEL;

  const isActive = (item) => {
    if (item.end) return location.pathname === '/';
    return location.pathname === item.to || location.pathname.startsWith(`${item.to}/`);
  };

  const sectionKey = (section) => section.title ?? 'main';
  const sectionHasActive = (section) => section.items.some(isActive);
  const iconClass = (key) => icons[key] || FALLBACK_ICONS[key] || 'fas fa-circle';
  const foto = profile?.foto || BRAND_IMG;
  const adSoyad = loggedIn
    ? profile?.ad_soyad || profile?.kullanici_adi || (isAdmin ? 'Yönetici' : 'Personel')
    : 'Misafir';
  const rol = loggedIn
    ? profile?.yetki || profile?.rol || (isAdmin ? 'Yönetici' : 'Personel')
    : 'Giriş yapın';

  const toggleMenu = (key) => setOpenMenu((cur) => (cur === key ? null : key));

  const renderProfileItems = (onClose, linkClass, withDropdownIcon = false) => {
    const ico = (key) => `${iconClass(key)}${withDropdownIcon ? ' navbar-dropdown-icon' : ''}`;
    if (!loggedIn) {
      return (
        <Link to="/giris" role="menuitem" className={linkClass} onClick={onClose}>
          <i className={ico('giris')} aria-hidden="true" />
          Giriş Yap
        </Link>
      );
    }
    return (
      <>
        {profileMenu.map((item) => (
          <Link key={item.to} to={item.to} role="menuitem" className={linkClass} onClick={onClose}>
            <i className={ico(item.iconKey)} aria-hidden="true" />
            {item.label}
          </Link>
        ))}
        <button type="button" role="menuitem" className={linkClass} onClick={handleLogout}>
          <i className={ico('cikis')} aria-hidden="true" />
          Çıkış Yap
        </button>
      </>
    );
  };

  const renderDesktopSection = (section) => {
    const key = sectionKey(section);

    if (!section.title || section.items.length === 1) {
      return section.items.map((item) => (
        <Link
          key={item.to}
          to={item.to}
          className={`navbar-link${isActive(item) ? ' is-active' : ''}`}
        >
          <span>{item.label}</span>
        </Link>
      ));
    }

    const active = sectionHasActive(section);
    const expanded = openMenu === key;

    return (
      <div className="navbar-item" key={key}>
        <button
          type="button"
          className={`navbar-link navbar-link--trigger${active ? ' is-active' : ''}`}
          aria-expanded={expanded}
          aria-haspopup="menu"
          onClick={() => toggleMenu(key)}
        >
          <span>{section.title}</span>
          <i className={`fas fa-chevron-down navbar-caret${expanded ? ' is-open' : ''}`} aria-hidden="true" />
        </button>

        {expanded && (
          <div role="menu" className="navbar-dropdown">
            {section.items.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                role="menuitem"
                className={`navbar-dropdown-link${isActive(item) ? ' is-active' : ''}`}
                onClick={() => setOpenMenu(null)}
              >
                <i className={`${iconClass(item.iconKey)} navbar-dropdown-icon`} aria-hidden="true" />
                {item.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <header className="navbar">
      <div className="navbar-inner" ref={navRef}>
        {/* Mobil topbar: hamburger + logo (admin sol blok) */}
        <div className="navbar-mobile-left">
          <button
            type="button"
            className="navbar-burger"
            onClick={() => {
              setProfileOpen(false);
              setSidebarOpen(true);
            }}
            aria-label="Menüyü aç"
            aria-expanded={sidebarOpen}
          >
            <i className="fas fa-bars" aria-hidden="true" />
          </button>
          <Link to="/" className="navbar-logo navbar-logo--mobile" aria-label="Ana Sayfa">
            <img src={SITE_LOGO_WHITE} alt="Gebze Belediyesi" />
          </Link>
        </div>

        <nav className="navbar-side navbar-side--left">{LEFT_SECTIONS.map(renderDesktopSection)}</nav>

        <Link to="/" className="navbar-logo navbar-logo--desktop" aria-label="Ana Sayfa">
          <img src={SITE_LOGO_WHITE} alt="Gebze Belediyesi" />
        </Link>

        <nav className="navbar-side navbar-side--right">
          {RIGHT_SECTIONS.map(renderDesktopSection)}

          <div className="navbar-item navbar-profile">
            <button
              type="button"
              className="navbar-profile-trigger"
              onClick={() => toggleMenu('profile')}
              aria-expanded={openMenu === 'profile'}
              aria-haspopup="menu"
            >
              <img
                src={foto}
                alt=""
                className="navbar-profile-avatar"
                onError={(e) => {
                  e.currentTarget.src = BRAND_IMG;
                }}
              />
              <span className="navbar-profile-text">
                <span className="navbar-profile-name">{adSoyad}</span>
                <span className="navbar-profile-role">{rol}</span>
              </span>
              <i
                className={`fas fa-chevron-down navbar-caret${openMenu === 'profile' ? ' is-open' : ''}`}
                aria-hidden="true"
              />
            </button>

            {openMenu === 'profile' && (
              <div role="menu" className="navbar-dropdown navbar-dropdown--right">
                {renderProfileItems(() => setOpenMenu(null), 'navbar-dropdown-link', true)}
              </div>
            )}
          </div>
        </nav>

        {/* Mobil topbar: profil rozeti (admin sağ blok) */}
        <div className="navbar-mobile-user" ref={profileRef}>
          <button
            type="button"
            className="navbar-mobile-badge"
            onClick={() => {
              setSidebarOpen(false);
              setProfileOpen((v) => !v);
            }}
            aria-expanded={profileOpen}
            aria-haspopup="menu"
          >
            <img
              src={foto}
              alt=""
              onError={(e) => {
                e.currentTarget.src = BRAND_IMG;
              }}
            />
            <span className="navbar-mobile-badge-text">
              <strong>{adSoyad}</strong>
              <small>{rol}</small>
            </span>
            <i className={`fas fa-chevron-${profileOpen ? 'up' : 'down'}`} aria-hidden="true" />
          </button>

          {profileOpen && (
            <div className="navbar-mobile-dropdown" role="menu">
              {renderProfileItems(() => setProfileOpen(false), 'navbar-mobile-dropdown-item')}
            </div>
          )}
        </div>
      </div>

      {/* Mobil sidebar — admin sidebar gibi */}
      <aside className={`navbar-sidebar${sidebarOpen ? ' is-open' : ''}`} aria-hidden={!sidebarOpen}>
        <div className="navbar-sidebar__brand">
          <span className="navbar-sidebar__brand-mark" aria-hidden="true">
            <img
              src={foto}
              alt=""
              onError={(e) => {
                e.currentTarget.src = BRAND_IMG;
              }}
            />
          </span>
          <div>
            <strong>{adSoyad}</strong>
            <span>{rol}</span>
          </div>
          <button
            type="button"
            className="navbar-sidebar__close"
            onClick={() => setSidebarOpen(false)}
            aria-label="Kapat"
          >
            <i className="fas fa-times" aria-hidden="true" />
          </button>
        </div>

        <nav className="navbar-sidebar__nav">
          {NAV_SECTIONS.map((section, idx) => (
            <div key={sectionKey(section) || `sec-${idx}`}>
              {section.title && <p className="navbar-nav-section">{section.title}</p>}
              {section.items.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`navbar-nav-link${isActive(item) ? ' is-active' : ''}`}
                >
                  <i className={iconClass(item.iconKey)} aria-hidden="true" />
                  {item.label}
                </Link>
              ))}
            </div>
          ))}
        </nav>
      </aside>

      {sidebarOpen && (
        <button
          type="button"
          className="navbar-sidebar-backdrop is-open"
          aria-label="Menüyü kapat"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </header>
  );
}

export { FALLBACK_ICONS };
