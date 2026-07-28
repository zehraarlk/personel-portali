import useSiteIcons from '../hooks/useSiteIcons';

/** site_ikonlari anahtarıyla Font Awesome ikon */
export default function SiteIcon({ name, className = '', title, fallback }) {
  const { icon } = useSiteIcons();
  const cls = [icon(name, fallback), className].filter(Boolean).join(' ');
  return <i className={cls} title={title} aria-hidden="true" />;
}
