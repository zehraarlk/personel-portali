import { createContext, useContext, useMemo, useState } from 'react';
import { Outlet, useOutletContext } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';
import AdminTopbar from './AdminTopbar';
import Footer from './Footer';
import '../styles/admin.css';

const AdminUiContext = createContext(null);

export function useAdminUi() {
  return useContext(AdminUiContext);
}

export function useAdminPage() {
  return useOutletContext();
}

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pageTitle, setPageTitle] = useState('Dashboard');

  const ui = useMemo(
    () => ({
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      pageTitle,
      setPageTitle,
    }),
    [sidebarOpen, pageTitle],
  );

  return (
    <AdminUiContext.Provider value={ui}>
      <div className="admin-layout admin-body">
        <AdminSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        {sidebarOpen && (
          <button
            type="button"
            className="admin-sidebar-backdrop is-open"
            aria-label="Menüyü kapat"
            onClick={() => setSidebarOpen(false)}
          />
        )}
        <div className="admin-main">
          <AdminTopbar title={pageTitle} onMenu={() => setSidebarOpen(true)} />
          <main className="admin-content">
            <Outlet context={{ setPageTitle }} />
          </main>
          <Footer />
        </div>
      </div>
    </AdminUiContext.Provider>
  );
}
