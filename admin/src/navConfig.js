/** Admin sidebar + dashboard sıra kaynağı (tek yerden yönetilir). */
export const ADMIN_BASE = '/admin';

export const ADMIN_NAV = [
  {
    title: null,
    items: [{ to: ADMIN_BASE, label: 'Dashboard', icon: 'fas fa-gauge-high', end: true }],
  },
  {
    title: 'Yönetim',
    items: [
      { to: `${ADMIN_BASE}/personeller`, label: 'Personeller', icon: 'fas fa-users', countKey: 'personeller' },
      { to: `${ADMIN_BASE}/yoneticiler`, label: 'Yöneticiler', icon: 'fas fa-user-shield', countKey: 'yoneticiler' },
    ],
  },
  {
    title: 'Videolar',
    items: [
      { to: `${ADMIN_BASE}/videolar`, label: 'Videolar', icon: 'fas fa-video', countKey: 'videolar' },
    ],
  },
  {
    title: 'Etkinlikler',
    items: [
      {
        to: `${ADMIN_BASE}/sizden-gelenler`,
        label: 'Sizden Gelenler',
        icon: 'fas fa-comments',
        countKey: 'sizden_gelenler',
      },
      {
        to: `${ADMIN_BASE}/etkinlikler`,
        label: 'Etkinlikler',
        icon: 'fas fa-calendar-check',
        countKey: 'etkinlikler',
      },
      { to: `${ADMIN_BASE}/duyurular`, label: 'Duyurular', icon: 'fas fa-bullhorn', countKey: 'duyurular' },
    ],
  },
  {
    title: 'Kaynaklar',
    items: [
      {
        to: `${ADMIN_BASE}/protokoller`,
        label: 'Protokoller',
        icon: 'fas fa-file-signature',
        countKey: 'protokoller',
      },
      {
        to: `${ADMIN_BASE}/dokumanlar`,
        label: 'Dokümanlar',
        icon: 'fas fa-file-alt',
        countKey: 'dokumanlar',
      },
      {
        to: `${ADMIN_BASE}/mevzuatlar`,
        label: 'Mevzuatlar',
        icon: 'fas fa-balance-scale',
        countKey: 'mevzuatlar',
      },
      {
        to: `${ADMIN_BASE}/egitimler`,
        label: 'Eğitimler',
        icon: 'fas fa-graduation-cap',
        countKey: 'egitimler',
      },
    ],
  },
  {
    title: 'Diğer',
    items: [
      { to: `${ADMIN_BASE}/anketler`, label: 'Anketler', icon: 'fas fa-poll', countKey: 'anketler' },
      {
        to: `${ADMIN_BASE}/yardimci-linkler`,
        label: 'Yardımcı Linkler',
        icon: 'fas fa-link',
        countKey: 'yardimci_linkler',
      },
      { to: `${ADMIN_BASE}/vefat`, label: 'Vefat Eden Bilgisi', icon: 'fas fa-ribbon', countKey: 'vefat_bilgileri' },
      {
        to: `${ADMIN_BASE}/dogum-gunu`,
        label: 'Doğum Günü Bilgisi',
        icon: 'fas fa-birthday-cake',
        countKey: 'dogum_gunu',
      },
    ],
  },
  {
    title: 'Sistem',
    items: [
      { to: '/', label: 'Personel Portal', icon: 'fas fa-home' },
      { to: '/test', label: 'Test', icon: 'fas fa-stethoscope' },
    ],
  },
];

/** Dashboard stat kartları = sidebar içerik linkleri (Dashboard + Sistem hariç), aynı sıra. */
export const ADMIN_STATS = ADMIN_NAV.filter((s) => s.title && s.title !== 'Sistem').flatMap((s) =>
  s.items.map((item) => ({
    key: item.countKey,
    to: item.to,
    label: item.label,
    icon: item.icon,
  })),
);

/** Hızlı işlemler = aynı sıra; tıklanınca ilgili ekleme sayfasına gider. */
export const ADMIN_QUICK_ACTIONS = ADMIN_STATS.map((stat) => ({
  key: stat.key,
  to: `${stat.to}/ekle`,
  label: stat.label,
  desc: 'Yeni kayıt ekle',
  icon: stat.icon,
}));
