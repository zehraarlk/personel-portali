import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { canAccessAdmin, canAccessPortal } from './session';
import Home from '../pages/Home';

/**
 * / — personel veya yönetici oturumu varsa ana sayfa;
 * yoksa personel girişine yönlendir.
 */
export function RootEntry() {
  if (canAccessPortal()) {
    return <Home />;
  }
  return <Navigate to="/giris" replace />;
}

/**
 * Portal sayfaları: personel VEYA yönetici.
 * Yönetici admin şifresiyle girdikten sonra siteyi de kullanabilir.
 */
export function RequirePortal() {
  const location = useLocation();
  if (!canAccessPortal()) {
    return <Navigate to="/giris" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}

/** @deprecated RequirePortal kullanın */
export const RequirePersonel = RequirePortal;

/** Yönetim paneli: yalnızca yönetici */
export function RequireYonetici() {
  const location = useLocation();
  if (!canAccessAdmin()) {
    return <Navigate to="/admin/giris" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
