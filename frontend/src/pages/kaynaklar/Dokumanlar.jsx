import KaynaklarShell from '../../components/KaynaklarShell';
import { KAYNAK_PAGES } from './config';

const page = KAYNAK_PAGES.dokumanlar;

export default function Dokumanlar() {
  return (
    <KaynaklarShell
      title={page.title}
      description={page.description}
      searchPlaceholder={page.searchPlaceholder}
      searchId={page.searchId}
      statCount={0}
      statLabel={page.statLabel}
    >
      {/* Veri alanı — tasarım sonra eklenecek */}
    </KaynaklarShell>
  );
}
