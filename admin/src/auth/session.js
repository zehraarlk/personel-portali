/**
 * Admin oturum yardımcıları — portal sessionStorage + BroadcastChannel ile aynı kaynak.
 */
export {
  getYoneticiId,
  setYoneticiId,
  getYoneticiOturumId,
  setYoneticiOturumId,
  clearYoneticiAuth,
  clearAuth as clearAdminSession,
  isYoneticiLoggedIn,
  authHeaders as adminAuthHeaders,
  canAccessAdmin,
} from '../../../frontend/src/auth/session.js';
