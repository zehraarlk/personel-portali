export const KAYNAK_QUICK_LINKS = [
  {
    to: '/protokoller',
    label: 'Protokoller',
    iconKey: 'protokoller',
  },
  {
    to: '/dokumanlar',
    label: 'Dokümanlar',
    iconKey: 'dokumanlar',
  },
  {
    to: '/mevzuatlar',
    label: 'Mevzuatlar',
    iconKey: 'mevzuatlar',
  },
  {
    to: '/egitimler',
    label: 'Eğitimler',
    iconKey: 'egitimler',
  },
];

export const KAYNAK_PAGES = {
  protokoller: {
    title: 'Protokoller',
    description:
      'Kurumsal indirim ve personel anlaşmalarını inceleyin; belgeye tek tıkla ulaşın.',
    searchPlaceholder: 'Protokol veya kurum adı ara…',
    searchId: 'protokol-ara',
    statLabel: 'protokol',
    iconKey: 'protokoller',
  },

  dokumanlar: {
    title: 'Dokümanlar',
    description:
      'Kurumsal formlar, belgeler ve personel dokümanlarına buradan ulaşın.',
    searchPlaceholder: 'Doküman adı ara…',
    searchId: 'dokuman-ara',
    statLabel: 'aktif doküman',
    iconKey: 'dokumanlar',
  },

  mevzuatlar: {
    title: 'Mevzuatlar',
    description:
      'Yönetmelik, yönerge ve ilgili mevzuat metinlerini inceleyin.',
    searchPlaceholder: 'Mevzuat adı ara…',
    searchId: 'mevzuat-ara',
    statLabel: 'aktif mevzuat',
    iconKey: 'mevzuatlar',
  },

  egitimler: {
    title: 'Eğitimler',
    description:
      'Personel eğitim materyallerine ve ilgili kaynaklara buradan erişin.',
    searchPlaceholder: 'Eğitim adı ara…',
    searchId: 'egitim-ara',
    statLabel: 'aktif eğitim',
    iconKey: 'egitimler',
  },
};
