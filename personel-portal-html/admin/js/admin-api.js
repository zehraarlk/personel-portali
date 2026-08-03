/*
 * Admin API istemcisi — React admin/src/api/client.js birebir karşılığı (fetch tabanlı).
 * adminAuthHeaders = Session.authHeaders (aynı sessionStorage kaynağı).
 */
(function () {
  'use strict';

  var API_BASE = Portal.API_BASE;

  function adminAuthHeaders(extra) {
    return Session.authHeaders(extra);
  }

  function jsonHeaders(extra) {
    return adminAuthHeaders(Object.assign({ 'Content-Type': 'application/json' }, extra || {}));
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

  /** site_ikonlari — { icons: { anahtar: 'fas fa-...' }, items: [...] } */
  async function fetchSiteIcons(kategori) {
    var qs = kategori ? '?kategori=' + encodeURIComponent(kategori) : '';
    var response = await fetch(API_BASE + '/icons/' + qs);
    if (!response.ok) {
      throw new Error('İkonlar alınamadı');
    }
    return response.json();
  }

  async function fetchAdminDashboard() {
    var response = await fetch(API_BASE + '/admin/dashboard/', {
      headers: adminAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Dashboard verileri alınamadı');
    }
    return response.json();
  }

  async function parseJson(response) {
    var data = await response.json().catch(function () { return {}; });
    if (!response.ok) {
      var detail = data.detail || data.message;
      if (!detail && data && typeof data === 'object') {
        var parts = [];
        Object.keys(data).forEach(function (key) {
          if (key === 'detail' || key === 'message') return;
          var val = data[key];
          var text = Array.isArray(val) ? val.join(' ') : String(val);
          if (text) parts.push(text);
        });
        detail = parts.join(' ') || null;
      }
      throw new Error(detail || 'İstek başarısız');
    }
    return data;
  }

  async function listEtkinlikler() {
    var response = await fetch(API_BASE + '/admin/etkinlikler/');
    return parseJson(response);
  }

  async function getEtkinlik(id) {
    var response = await fetch(API_BASE + '/admin/etkinlikler/' + id + '/');
    return parseJson(response);
  }

  async function createEtkinlik(payload) {
    var response = await fetch(API_BASE + '/admin/etkinlikler/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateEtkinlik(id, payload) {
    var response = await fetch(API_BASE + '/admin/etkinlikler/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteEtkinlik(id) {
    var response = await fetch(API_BASE + '/admin/etkinlikler/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  async function listDuyurular() {
    var response = await fetch(API_BASE + '/admin/duyurular/');
    return parseJson(response);
  }

  async function getDuyuru(id) {
    var response = await fetch(API_BASE + '/admin/duyurular/' + id + '/');
    return parseJson(response);
  }

  async function createDuyuru(payload) {
    var response = await fetch(API_BASE + '/admin/duyurular/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateDuyuru(id, payload) {
    var response = await fetch(API_BASE + '/admin/duyurular/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteDuyuru(id) {
    var response = await fetch(API_BASE + '/admin/duyurular/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  /** Görsel yükle → { path: '../images/uploads/...', url: '/images/uploads/...' } */
  async function uploadAdminImage(file) {
    var body = new FormData();
    body.append('file', file);
    var response = await fetch(API_BASE + '/admin/upload/', {
      method: 'POST',
      body: body,
    });
    return parseJson(response);
  }

  async function listPersoneller() {
    var response = await fetch(API_BASE + '/admin/personeller/');
    return parseJson(response);
  }

  async function getPersonel(id) {
    var response = await fetch(API_BASE + '/admin/personeller/' + id + '/');
    return parseJson(response);
  }

  async function createPersonel(payload) {
    var response = await fetch(API_BASE + '/admin/personeller/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updatePersonel(id, payload) {
    var response = await fetch(API_BASE + '/admin/personeller/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deletePersonel(id) {
    var response = await fetch(API_BASE + '/admin/personeller/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  async function listYoneticiler() {
    var response = await fetch(API_BASE + '/admin/yoneticiler/');
    return parseJson(response);
  }

  async function getYonetici(id) {
    var response = await fetch(API_BASE + '/admin/yoneticiler/' + id + '/');
    return parseJson(response);
  }

  async function createYonetici(payload) {
    var response = await fetch(API_BASE + '/admin/yoneticiler/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateYonetici(id, payload) {
    var response = await fetch(API_BASE + '/admin/yoneticiler/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteYonetici(id) {
    var response = await fetch(API_BASE + '/admin/yoneticiler/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  async function listVideolar() {
    var response = await fetch(API_BASE + '/admin/videolar/');
    return parseJson(response);
  }

  async function getVideo(id) {
    var response = await fetch(API_BASE + '/admin/videolar/' + id + '/');
    return parseJson(response);
  }

  async function createVideo(payload) {
    var response = await fetch(API_BASE + '/admin/videolar/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateVideo(id, payload) {
    var response = await fetch(API_BASE + '/admin/videolar/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteVideo(id) {
    var response = await fetch(API_BASE + '/admin/videolar/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  async function listVideoKategoriler() {
    var response = await fetch(API_BASE + '/admin/videolar-kategoriler/');
    return parseJson(response);
  }

  async function listSizdenGelenler() {
    var response = await fetch(API_BASE + '/admin/sizden-gelenler/');
    return parseJson(response);
  }

  async function getSizdenGelen(id) {
    var response = await fetch(API_BASE + '/admin/sizden-gelenler/' + id + '/');
    return parseJson(response);
  }

  async function createSizdenGelen(payload) {
    var response = await fetch(API_BASE + '/admin/sizden-gelenler/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateSizdenGelen(id, payload) {
    var response = await fetch(API_BASE + '/admin/sizden-gelenler/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteSizdenGelen(id) {
    var response = await fetch(API_BASE + '/admin/sizden-gelenler/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  async function listProtokoller() {
    var response = await fetch(API_BASE + '/admin/protokoller/');
    return parseJson(response);
  }

  async function getProtokol(id) {
    var response = await fetch(API_BASE + '/admin/protokoller/' + id + '/');
    return parseJson(response);
  }

  async function createProtokol(payload) {
    var response = await fetch(API_BASE + '/admin/protokoller/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateProtokol(id, payload) {
    var response = await fetch(API_BASE + '/admin/protokoller/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteProtokol(id) {
    var response = await fetch(API_BASE + '/admin/protokoller/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  /* ─── Genel Kaynaklar CRUD (Dökümanlar, Mevzuatlar, Eğitimler) ─── */

  function _kaynakApi(slug) {
    return {
      list: async function () {
        var response = await fetch(API_BASE + '/admin/' + slug + '/');
        return parseJson(response);
      },
      get: async function (id) {
        var response = await fetch(API_BASE + '/admin/' + slug + '/' + id + '/');
        return parseJson(response);
      },
      create: async function (payload) {
        var response = await fetch(API_BASE + '/admin/' + slug + '/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return parseJson(response);
      },
      update: async function (id, payload) {
        var response = await fetch(API_BASE + '/admin/' + slug + '/' + id + '/', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        return parseJson(response);
      },
      delete: async function (id) {
        var response = await fetch(API_BASE + '/admin/' + slug + '/' + id + '/', { method: 'DELETE' });
        if (!response.ok && response.status !== 204) {
          return parseJson(response);
        }
        return true;
      },
    };
  }

  var dokumanlarApi = _kaynakApi('dokumanlar');
  var mevzuatlarApi = _kaynakApi('mevzuatlar');
  var egitimlerApi = _kaynakApi('egitimler');

  async function listAnketler() {
    var response = await fetch(API_BASE + '/admin/anketler/');
    return parseJson(response);
  }

  async function getAnket(id) {
    var response = await fetch(API_BASE + '/admin/anketler/' + id + '/');
    return parseJson(response);
  }

  async function createAnket(payload) {
    var response = await fetch(API_BASE + '/admin/anketler/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateAnket(id, payload) {
    var response = await fetch(API_BASE + '/admin/anketler/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteAnket(id) {
    var response = await fetch(API_BASE + '/admin/anketler/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  async function listAnketKategoriler() {
    var response = await fetch(API_BASE + '/admin/anketler-kategoriler/');
    return parseJson(response);
  }

  async function listYardimciLinkler(kategoriId) {
    var qs = kategoriId ? '?kategori=' + encodeURIComponent(kategoriId) : '';
    var response = await fetch(API_BASE + '/admin/yardimci-linkler/' + qs);
    return parseJson(response);
  }

  async function getYardimciLink(id) {
    var response = await fetch(API_BASE + '/admin/yardimci-linkler/' + id + '/');
    return parseJson(response);
  }

  async function createYardimciLink(payload) {
    var response = await fetch(API_BASE + '/admin/yardimci-linkler/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateYardimciLink(id, payload) {
    var response = await fetch(API_BASE + '/admin/yardimci-linkler/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteYardimciLink(id) {
    var response = await fetch(API_BASE + '/admin/yardimci-linkler/' + id + '/', {
      method: 'DELETE',
    });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  async function listYardimciLinkKategoriler() {
    var response = await fetch(API_BASE + '/admin/yardimci-linkler-kategoriler/');
    return parseJson(response);
  }

  async function listVefat() {
    var response = await fetch(API_BASE + '/admin/vefat/');
    return parseJson(response);
  }

  async function getVefat(id) {
    var response = await fetch(API_BASE + '/admin/vefat/' + id + '/');
    return parseJson(response);
  }

  async function createVefat(payload) {
    var response = await fetch(API_BASE + '/admin/vefat/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function updateVefat(id, payload) {
    var response = await fetch(API_BASE + '/admin/vefat/' + id + '/', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return parseJson(response);
  }

  async function deleteVefat(id) {
    var response = await fetch(API_BASE + '/admin/vefat/' + id + '/', { method: 'DELETE' });
    if (!response.ok && response.status !== 204) {
      return parseJson(response);
    }
    return true;
  }

  /** scope: today | month | all */
  async function listDogumGunu(scope) {
    scope = scope === undefined ? 'today' : scope;
    var params = new URLSearchParams();
    if (scope) params.set('scope', scope);
    var qs = params.toString();
    var response = await fetch(API_BASE + '/admin/dogum-gunu/' + (qs ? '?' + qs : ''));
    return parseJson(response);
  }

  async function listSizdenGelenKategoriler() {
    var response = await fetch(API_BASE + '/admin/sizden-gelenler-kategoriler/');
    return parseJson(response);
  }

  async function fetchProfile() {
    var response = await fetch(API_BASE + '/admin/profile/', {
      headers: adminAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Yönetici profili alınamadı');
    }
    return response.json();
  }

  async function fetchProfileSessions() {
    var response = await fetch(API_BASE + '/admin/profile/sessions/', {
      headers: adminAuthHeaders(),
    });
    if (!response.ok) {
      throw new Error('Oturum kayıtları alınamadı');
    }
    return response.json();
  }

  async function changePassword(payload) {
    var response = await fetch(API_BASE + '/admin/profile/change-password/', {
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

  window.AdminApi = {
    API_BASE: API_BASE,
    adminAuthHeaders: adminAuthHeaders,
    jsonHeaders: jsonHeaders,
    fetchHealth: fetchHealth,
    fetchSystemStatus: fetchSystemStatus,
    fetchHomeDashboard: fetchHomeDashboard,
    fetchSiteIcons: fetchSiteIcons,
    fetchAdminDashboard: fetchAdminDashboard,
    listEtkinlikler: listEtkinlikler,
    getEtkinlik: getEtkinlik,
    createEtkinlik: createEtkinlik,
    updateEtkinlik: updateEtkinlik,
    deleteEtkinlik: deleteEtkinlik,
    listDuyurular: listDuyurular,
    getDuyuru: getDuyuru,
    createDuyuru: createDuyuru,
    updateDuyuru: updateDuyuru,
    deleteDuyuru: deleteDuyuru,
    uploadAdminImage: uploadAdminImage,
    listPersoneller: listPersoneller,
    getPersonel: getPersonel,
    createPersonel: createPersonel,
    updatePersonel: updatePersonel,
    deletePersonel: deletePersonel,
    listYoneticiler: listYoneticiler,
    getYonetici: getYonetici,
    createYonetici: createYonetici,
    updateYonetici: updateYonetici,
    deleteYonetici: deleteYonetici,
    listVideolar: listVideolar,
    getVideo: getVideo,
    createVideo: createVideo,
    updateVideo: updateVideo,
    deleteVideo: deleteVideo,
    listVideoKategoriler: listVideoKategoriler,
    listSizdenGelenler: listSizdenGelenler,
    getSizdenGelen: getSizdenGelen,
    createSizdenGelen: createSizdenGelen,
    updateSizdenGelen: updateSizdenGelen,
    deleteSizdenGelen: deleteSizdenGelen,
    listSizdenGelenKategoriler: listSizdenGelenKategoriler,
    listProtokoller: listProtokoller,
    getProtokol: getProtokol,
    createProtokol: createProtokol,
    updateProtokol: updateProtokol,
    deleteProtokol: deleteProtokol,
    dokumanlarApi: dokumanlarApi,
    mevzuatlarApi: mevzuatlarApi,
    egitimlerApi: egitimlerApi,
    listAnketler: listAnketler,
    getAnket: getAnket,
    createAnket: createAnket,
    updateAnket: updateAnket,
    deleteAnket: deleteAnket,
    listAnketKategoriler: listAnketKategoriler,
    listYardimciLinkler: listYardimciLinkler,
    getYardimciLink: getYardimciLink,
    createYardimciLink: createYardimciLink,
    updateYardimciLink: updateYardimciLink,
    deleteYardimciLink: deleteYardimciLink,
    listYardimciLinkKategoriler: listYardimciLinkKategoriler,
    listVefat: listVefat,
    getVefat: getVefat,
    createVefat: createVefat,
    updateVefat: updateVefat,
    deleteVefat: deleteVefat,
    listDogumGunu: listDogumGunu,
    fetchProfile: fetchProfile,
    fetchProfileSessions: fetchProfileSessions,
    changePassword: changePassword,
    logoutAdmin: logoutAdmin,
  };
})();
