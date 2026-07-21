export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <p className="footer-brand">Personel Portalı</p>
        <p className="footer-copy">
          &copy; {year} — Kurumsal personel bilgi sistemi
        </p>
      </div>
    </footer>
  );
}
