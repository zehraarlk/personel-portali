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

// Left / right split around the centered logo.
// Left: Anasayfa, Videolar, Etkinlikler — Right: Kaynaklar, Diğer, Personel (profile)
const LEFT_SECTIONS = NAV_SECTIONS.slice(0, 2); // Anasayfa/Videolar, Etkinlikler
const RIGHT_SECTIONS = NAV_SECTIONS.slice(2); // Kaynaklar, Diğer

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
  const [openMenu, setOpenMenu] = useState(null); // key of open desktop dropdown / 'profile'
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileSection, setMobileSection] = useState(null); // key of expanded accordion on mobile
  const navRef = useRef(null);

  useEffect(() => {
    setOpenMenu(null);
    setMobileOpen(false);
    setMobileSection(null);
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

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
    setMobileOpen(false);
    const admin = isYoneticiLoggedIn();
    try {
      if (admin) {
        await logoutAdmin();
      } else {
        await logoutPersonel();
      }
    } catch {
      /* local clear yine de */
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

  const renderDesktopSection = (section) => {
    const key = sectionKey(section);

    // Untitled or single-item sections render as plain links, no dropdown.
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
        <nav className="navbar-side navbar-side--left">
          {LEFT_SECTIONS.map(renderDesktopSection)}
        </nav>

        <Link to="/" className="navbar-logo" aria-label="Ana Sayfa">
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
                {loggedIn ? (
                  <>
                    {profileMenu.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        role="menuitem"
                        className="navbar-dropdown-link"
                        onClick={() => setOpenMenu(null)}
                      >
                        <i className={`${iconClass(item.iconKey)} navbar-dropdown-icon`} aria-hidden="true" />
                        {item.label}
                      </Link>
                    ))}
                    <button
                      type="button"
                      role="menuitem"
                      className="navbar-dropdown-link"
                      onClick={handleLogout}
                    >
                      <i className={`${iconClass('cikis')} navbar-dropdown-icon`} aria-hidden="true" />
                      Çıkış Yap
                    </button>
                  </>
                ) : (
                  <Link
                    to="/giris"
                    role="menuitem"
                    className="navbar-dropdown-link"
                    onClick={() => setOpenMenu(null)}
                  >
                    <i className={`${iconClass('giris')} navbar-dropdown-icon`} aria-hidden="true" />
                    Giriş Yap
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>

        <button
          type="button"
          className="navbar-burger"
          onClick={() => setMobileOpen((v) => !v)}
          aria-label={mobileOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          aria-expanded={mobileOpen}
        >
          <i className={`fas ${mobileOpen ? 'fa-times' : 'fa-bars'}`} aria-hidden="true" />
        </button>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="navbar-scrim"
            aria-label="Menüyü kapat"
            onClick={() => setMobileOpen(false)}
          />
          <div className="navbar-mobile">
            <div className="navbar-mobile-profile">
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
            </div>

            {NAV_SECTIONS.map((section) => {
              const key = sectionKey(section);
              const accordion = section.title && section.items.length > 1;

              if (!accordion) {
                return (
                  <div className="navbar-mobile-group" key={key}>
                    {section.items.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`navbar-mobile-link${isActive(item) ? ' is-active' : ''}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <i className={`${iconClass(item.iconKey)} navbar-dropdown-icon`} aria-hidden="true" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                );
              }

              const expanded = mobileSection === key;
              return (
                <div className="navbar-mobile-group" key={key}>
                  <button
                    type="button"
                    className={`navbar-mobile-link navbar-mobile-link--trigger${
                      sectionHasActive(section) ? ' is-active' : ''
                    }`}
                    onClick={() => setMobileSection((cur) => (cur === key ? null : key))}
                    aria-expanded={expanded}
                  >
                    <span>{section.title}</span>
                    <i
                      className={`fas fa-chevron-down navbar-caret${expanded ? ' is-open' : ''}`}
                      aria-hidden="true"
                    />
                  </button>
                  {expanded && (
                    <div className="navbar-mobile-submenu">
                      {section.items.map((item) => (
                        <Link
                          key={item.to}
                          to={item.to}
                          className={`navbar-mobile-link navbar-mobile-link--sub${
                            isActive(item) ? ' is-active' : ''
                          }`}
                          onClick={() => setMobileOpen(false)}
                        >
                          <i className={`${iconClass(item.iconKey)} navbar-dropdown-icon`} aria-hidden="true" />
                          {item.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            <div className="navbar-mobile-group">
              <p className="navbar-mobile-caption">Hesap</p>
              {loggedIn ? (
                <>
                  {profileMenu.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      className="navbar-mobile-link"
                      onClick={() => setMobileOpen(false)}
                    >
                      <i className={`${iconClass(item.iconKey)} navbar-dropdown-icon`} aria-hidden="true" />
                      {item.label}
                    </Link>
                  ))}
                  <button type="button" className="navbar-mobile-link" onClick={handleLogout}>
                    <i className={`${iconClass('cikis')} navbar-dropdown-icon`} aria-hidden="true" />
                    Çıkış Yap
                  </button>
                </>
              ) : (
                <Link
                  to="/giris"
                  className="navbar-mobile-link"
                  onClick={() => setMobileOpen(false)}
                >
                  <i className={`${iconClass('giris')} navbar-dropdown-icon`} aria-hidden="true" />
                  Giriş Yap
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </header>
  );
}

export { FALLBACK_ICONS };