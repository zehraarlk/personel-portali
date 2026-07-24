export const KAYNAK_QUICK_LINKS = [
  { to: '/protokoller', label: 'Protokoller', icon: 'fas fa-file-signature' },
  { to: '/dokumanlar', label: 'Dökümanlar', icon: 'fas fa-file-alt' },
  { to: '/mevzuatlar', label: 'Mevzuatlar', icon: 'fas fa-balance-scale' },
  { to: '/egitimler', label: 'Eğitimler', icon: 'fas fa-graduation-cap' },
];

export const KAYNAK_PAGES = {
  protokoller: {
    title: 'Protokoller',
    description:
      'Personel ve kurumsal indirim anlaşmalarını inceleyin; ilgili belgeye tek tıkla ulaşın.',
    searchPlaceholder: 'Kurum veya protokol adı ara…',
    searchId: 'protokol-ara',
    statLabel: 'aktif protokol',
  },
  dokumanlar: {
    title: 'Dökümanlar',
    description:
      'Kurumsal formlar, belgeler ve personel dokümanlarına buradan ulaşın.',
    searchPlaceholder: 'Döküman adı ara…',
    searchId: 'dokuman-ara',
    statLabel: 'aktif döküman',
  },
  mevzuatlar: {
    title: 'Mevzuatlar',
    description:
      'Yönetmelik, yönerge ve ilgili mevzuat metinlerini inceleyin.',
    searchPlaceholder: 'Mevzuat adı ara…',
    searchId: 'mevzuat-ara',
    statLabel: 'aktif mevzuat',
  },
  egitimler: {
    title: 'Eğitimler',
    description:
      'Personel eğitim materyallerine ve ilgili kaynaklara buradan erişin.',
    searchPlaceholder: 'Eğitim adı ara…',
    searchId: 'egitim-ara',
    statLabel: 'aktif eğitim',
  },
};
