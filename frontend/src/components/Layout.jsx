import { useState } from 'react';
import SideNav from './SideNav';
import Footer from './Footer';

export default function Layout({ children }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-background text-on-background">
      {/* Mobil hamburger — menü açıkken gizlenir */}
      {!menuOpen && (
        <button
          type="button"
          className="fixed left-4 top-4 z-[80] grid h-11 w-11 place-items-center rounded-xl bg-primary text-white shadow-lg lg:hidden"
          onClick={() => setMenuOpen(true)}
          aria-label="Menüyü aç"
        >
          <span className="material-symbols-outlined text-[24px]">menu</span>
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
