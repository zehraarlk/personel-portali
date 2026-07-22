import { useEffect, useState } from 'react';
import SideNav, { FALLBACK_ICONS } from './SideNav';
import Footer from './Footer';
import { fetchSiteIcons } from '../api/client';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuIcon, setMenuIcon] = useState(FALLBACK_ICONS.menu_ac);

  useEffect(() => {
    let cancelled = false;
    fetchSiteIcons()
      .then((data) => {
        if (!cancelled && data?.icons?.menu_ac) {
          setMenuIcon(data.icons.menu_ac);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {!menuOpen && (
        <button
          type="button"
          className="fixed left-4 top-4 z-[80] grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-lg lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Menüyü aç"
        >
          <i className={`${menuIcon} text-[20px]`} aria-hidden="true" />
        </button>
      )}

      <SideNav open={menuOpen} onClose={() => setMenuOpen(false)} />

      <div className="flex min-h-0 flex-1 flex-col lg:pl-64">
        <main className="w-full flex-1 px-4 pb-6 pt-20 md:px-8 md:pb-8 lg:pt-8">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
