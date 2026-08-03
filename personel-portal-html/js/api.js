/*
 * API istemcisi — React frontend/src/api/client.js birebir karşılığı (fetch tabanlı).
 */
(function () {
  'use strict';

  var API_BASE = Portal.API_BASE;

  function jsonHeaders(extra) {
    return Session.authHeaders(
      Object.assign({ 'Content-Type': 'application/json' }, extra || {})
    );
  }

  async function fetchHealth() {
    var response = await fetch(API_BASE + '/health/');
    if (!response.ok) {
      throw new Error('API yanıt vermedi');
    }
    return response.json();
  }

  async function fetchSystemStatus() {
    var response = await fetch(API_BASE + '/system-status/');
    if (!response.ok) {
      throw new Error('Sistem durumu alınamadı');
    }
    return response.json();
  }

  async function fetchHomeDashboard() {
    var response = await fetch(API_BASE + '/home/');
    if (!response.ok) {
      throw new Error('Ana sayfa verileri alınamadı');
    }
    return response.json();
  }

  async function fetchVideos(kategori) {
    var query = kategori ? '?kategori=' + encodeURIComponent(kategori) : '';
    var response = await fetch(API_BASE + '/videos/' + query);
    if (!response.ok) {
      var errorData = await response.json().catch(function () { return {}; });
      throw new Error(errorData.detail || 'Videolar alınamadı (' + response.status + ')');
    }
    return response.json();
  }

  /**
   * site_ikonlari
   * { icons: { anahtar: 'fas fa-...' }, items: [...] }
   */
  async function fetchSiteIcons(kategori) {
    var qs = kategori ? '?kategori=' + encodeURIComponent(kategori) : '';
    var response = await fetch(API_BASE + '/icons/' + qs);
    if (!response.ok) {
      throw new Error('İkonlar alınamadı');
    }
    return response.json();
  }

  async function loginPersonel(payload) {
    var response = await fetch(API_BASE + '/auth/login/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || data.detail || 'Giriş başarısız');
    }
    return data;
  }

  async function loginAdmin(payload) {
    var response = await fetch(API_BASE + '/auth/admin-login/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || data.detail || 'Giriş başarısız');
    }
    return data;
  }

  async function forgotPassword(payload) {
    var response = await fetch(API_BASE + '/auth/forgot-password/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || data.detail || 'İşlem başarısız');
    }
    return data;
  }

  async function logoutPersonel(options) {
    options = options || {};
    var kapanisTipi = options.kapanis_tipi || 'manuel';
    var payload = {
      kapanis_tipi: kapanisTipi,
      oturum_id: Session.getOturumId() || undefined,
      personel_id: Session.getPersonelId() || undefined,
    };
    var response = await fetch(API_BASE + '/auth/logout/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      var data = await response.json().catch(function () { return {}; });
      throw new Error(data.message || data.detail || 'Çıkış yapılamadı');
    }
    return response.json().catch(function () { return { status: 'ok' }; });
  }

  async function logoutAdmin(options) {
    options = options || {};
    var kapanisTipi = options.kapanis_tipi || 'manuel';
    var payload = {
      kapanis_tipi: kapanisTipi,
      oturum_id: Session.getYoneticiOturumId() || undefined,
      yonetici_id: Session.getYoneticiId() || undefined,
    };
    var response = await fetch(API_BASE + '/auth/admin-logout/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      var data = await response.json().catch(function () { return {}; });
      throw new Error(data.message || data.detail || 'Çıkış yapılamadı');
    }
    return response.json().catch(function () { return { status: 'ok' }; });
  }

  /** DB'de oturum hâlâ açık mı? */
  async function checkAuthSession() {
    var response = await fetch(API_BASE + '/auth/session-check/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        personel_id: Session.getPersonelId() || undefined,
        oturum_id: Session.getOturumId() || undefined,
        yonetici_id: Session.getYoneticiId() || undefined,
        yonetici_oturum_id: Session.getYoneticiOturumId() || undefined,
      }),
    });
    if (!response.ok) {
      throw new Error('Oturum doğrulanamadı');
    }
    return response.json();
  }

  /** Sayfa yenilemede kısa süreli oturum yeniden açma */
  async function resumeAuthSession() {
    var response = await fetch(API_BASE + '/auth/session-resume/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        personel_id: Session.getPersonelId() || undefined,
        yonetici_id: Session.getYoneticiId() || undefined,
      }),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || data.detail || 'Oturum yenilenemedi');
    }
    return data;
  }

  async function fetchProfile() {
    var response = await fetch(API_BASE + '/profile/', {
      headers: Session.authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Profil alınamadı');
    }
    return response.json();
  }

  async function fetchAdminProfile() {
    var response = await fetch(API_BASE + '/admin/profile/', {
      headers: Session.authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Yönetici profili alınamadı');
    }
    return response.json();
  }

  async function fetchProfileSessions() {
    var response = await fetch(API_BASE + '/profile/sessions/', {
      headers: Session.authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Oturum kayıtları alınamadı');
    }
    return response.json();
  }

  async function changeEmail(payload) {
    var response = await fetch(API_BASE + '/profile/change-email/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(data.detail || 'E-posta güncellenemedi');
    }
    return data;
  }

  async function changePassword(payload) {
    var response = await fetch(API_BASE + '/profile/change-password/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify(payload),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      throw new Error(data.detail || 'Şifre güncellenemedi');
    }
    return data;
  }

  async function fetchSizdenGelenler(kategori) {
    var qs = kategori ? '?kategori=' + encodeURIComponent(kategori) : '';
    var response = await fetch(API_BASE + '/sizden-gelenler/' + qs);
    if (!response.ok) {
      throw new Error('Sizden gelenler alınamadı!');
    }
    return response.json();
  }

  async function goruntulenmeArttir(id) {
    var response = await fetch(API_BASE + '/sizden-gelenler/' + id + '/goruntule/', {
      method: 'POST',
    });
    if (!response.ok) {
      throw new Error('Görüntülenme sayısı güncellenemedi');
    }
    return response.json();
  }

  /**
   * Etkinlikler
   * { durumlar: [...], etkinlikler: [...] }
   */
  async function fetchEtkinlikler(durum) {
    var qs = durum ? '?durum=' + encodeURIComponent(durum) : '';
    var response = await fetch(API_BASE + '/etkinlikler/' + qs);
    if (!response.ok) {
      throw new Error('Etkinlikler alınamadı');
    }
    return response.json();
  }

  /**
   * Etkinlikler > Duyurular
   * { kategoriler: [...], duyurular: [...] }
   */
  async function fetchDuyurular(kategori) {
    var qs = kategori ? '?kategori=' + encodeURIComponent(kategori) : '';
    var response = await fetch(API_BASE + '/duyurular/' + qs);
    if (!response.ok) {
      var errorData = await response.json().catch(function () { return {}; });
      throw new Error(errorData.detail || 'Duyurular alınamadı (' + response.status + ')');
    }
    return response.json();
  }

  /**
   * Protokoller
   * { protokoller: [...], toplam }
   */
  async function fetchProtokoller(q) {
    var qs = q ? '?q=' + encodeURIComponent(q) : '';
    var response = await fetch(API_BASE + '/protokoller/' + qs);
    if (!response.ok) {
      throw new Error('Protokoller alınamadı');
    }
    return response.json();
  }

  /**
   * Eğitimler
   * { egitimler: [...], toplam }
   */
  async function fetchEgitimler(q) {
    var qs = q ? '?q=' + encodeURIComponent(q) : '';
    var response = await fetch(API_BASE + '/egitimler/' + qs);
    if (!response.ok) {
      throw new Error('Eğitimler alınamadı');
    }
    return response.json();
  }

  /**
   * Dokümanlar
   * { dokumanlar: [...], toplam }
   */
  async function fetchDokumanlar(q) {
    var qs = q ? '?q=' + encodeURIComponent(q) : '';
    var response = await fetch(API_BASE + '/dokumanlar/' + qs);
    if (!response.ok) {
      var errorData = await response.json().catch(function () { return {}; });
      throw new Error(errorData.detail || 'Dokümanlar alınamadı (' + response.status + ')');
    }
    return response.json();
  }

  /**
   * Mevzuatlar
   * { mevzuatlar: [...], toplam, alt_kategoriler: [...] }
   */
  async function fetchMevzuatlar(q, altKategori) {
    var params = new URLSearchParams();
    if (q) params.set('q', q);
    if (altKategori) params.set('alt_kategori', altKategori);
    var queryString = params.toString();
    var qs = queryString ? '?' + queryString : '';
    var response = await fetch(API_BASE + '/mevzuatlar/' + qs);
    if (!response.ok) {
      throw new Error('Mevzuatlar alınamadı');
    }
    return response.json();
  }

  /**
   * Yardımcı Linkler
   * { linkler: [...], toplam }
   */
  async function fetchYardimciLinkler(kategori) {
    var qs = kategori ? '?kategori=' + encodeURIComponent(kategori) : '';
    var response = await fetch(API_BASE + '/yardimci-linkler/' + qs);
    if (!response.ok) {
      throw new Error('Yardımcı linkler alınamadı');
    }
    return response.json();
  }

  /** vefat — { vefatlar: [...], toplam } */
  async function fetchVefat(q) {
    var qs = q ? '?q=' + encodeURIComponent(q) : '';
    var response = await fetch(API_BASE + '/vefat/' + qs);
    if (!response.ok) {
      throw new Error('Vefat bilgileri alınamadı');
    }
    return response.json();
  }

  /**
   * Doğum Günleri
   * { kayitlar: [...], toplam, tarih }
   */
  async function fetchDogumGunleri(scope, q) {
    scope = scope === undefined ? 'month' : scope;
    var params = new URLSearchParams();
    if (scope) params.set('scope', scope);
    if (q) params.set('q', q);
    var queryString = params.toString();
    var qs = queryString ? '?' + queryString : '';
    var response = await fetch(API_BASE + '/dogum-gunu/' + qs);
    if (!response.ok) {
      throw new Error('Doğum günü bilgileri alınamadı');
    }
    return response.json();
  }

  /**
   * Anketler
   * { anketler: [...] }
   */
  async function fetchAnketler() {
    var response = await fetch(API_BASE + '/anketler/');
    if (!response.ok) {
      throw new Error('Anketler yüklenemedi');
    }
    return response.json();
  }

  /**
   * Anket Detay
   * { anket: {...}, sorular: [...], participated / katildi_mi }
   */
  async function fetchAnketDetail(id) {
    var response = await fetch(API_BASE + '/anketler/' + id + '/', {
      headers: Session.authHeaders(),
    });
    if (!response.ok) {
      throw new Error('Anket yüklenemedi');
    }
    return response.json();
  }

  /**
   * Ankete katılım gönderme
   * cevaplar: { [soru_id]: secenek_id | metin }
   */
  async function submitAnket(id, cevaplar) {
    var response = await fetch(API_BASE + '/anketler/' + id + '/katil/', {
      method: 'POST',
      headers: jsonHeaders(),
      body: JSON.stringify({
        personel_id: Session.getPersonelId() || undefined,
        cevaplar: cevaplar,
      }),
    });
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok || data.status === 'error') {
      throw new Error(data.message || data.detail || 'Katılım kaydedilemedi');
    }
    return data;
  }

  window.Api = {
    API_BASE: API_BASE,
    jsonHeaders: jsonHeaders,
    fetchHealth: fetchHealth,
    fetchSystemStatus: fetchSystemStatus,
    fetchHomeDashboard: fetchHomeDashboard,
    fetchVideos: fetchVideos,
    fetchSiteIcons: fetchSiteIcons,
    loginPersonel: loginPersonel,
    loginAdmin: loginAdmin,
    forgotPassword: forgotPassword,
    logoutPersonel: logoutPersonel,
    logoutAdmin: logoutAdmin,
    checkAuthSession: checkAuthSession,
    resumeAuthSession: resumeAuthSession,
    fetchProfile: fetchProfile,
    fetchAdminProfile: fetchAdminProfile,
    fetchProfileSessions: fetchProfileSessions,
    changeEmail: changeEmail,
    changePassword: changePassword,
    fetchSizdenGelenler: fetchSizdenGelenler,
    goruntulenmeArttir: goruntulenmeArttir,
    fetchEtkinlikler: fetchEtkinlikler,
    fetchDuyurular: fetchDuyurular,
    fetchProtokoller: fetchProtokoller,
    fetchEgitimler: fetchEgitimler,
    fetchDokumanlar: fetchDokumanlar,
    fetchMevzuatlar: fetchMevzuatlar,
    fetchYardimciLinkler: fetchYardimciLinkler,
    fetchVefat: fetchVefat,
    fetchDogumGunleri: fetchDogumGunleri,
    fetchAnketler: fetchAnketler,
    fetchAnketDetail: fetchAnketDetail,
    submitAnket: submitAnket,
  };
})();
