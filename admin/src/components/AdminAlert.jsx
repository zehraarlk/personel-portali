import { useEffect, useRef } from 'react';

/**
 * İşlem sonucu bildirimi — görünür animasyon + scroll.
 * type: 'success' | 'danger'
 */
export default function AdminAlert({ type = 'success', children, onClose }) {
  const ref = useRef(null);
  const text = typeof children === 'string' ? children : null;

  useEffect(() => {
    if (!children) return undefined;
    const el = ref.current;
    if (!el) return undefined;

    const reveal = () => {
      const topbar =
        parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--admin-topbar-h')) ||
        64;
      const gap = 16;
      const y = el.getBoundingClientRect().top + window.scrollY - topbar - gap;
      window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
      el.focus({ preventScroll: true });
    };

    // Layout/animasyon sonrası kesin görünsün
    const t1 = window.requestAnimationFrame(reveal);
    const t2 = window.setTimeout(reveal, 80);

    if (type === 'success' && onClose) {
      const t = window.setTimeout(() => onClose(), 4500);
      return () => {
        window.cancelAnimationFrame(t1);
        window.clearTimeout(t2);
        window.clearTimeout(t);
      };
    }
    return () => {
      window.cancelAnimationFrame(t1);
      window.clearTimeout(t2);
    };
    // onClose bilinçli olarak bağımlılığa alınmadı (inline setter her render’da yenilenmesin)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [children, type]);

  if (!children) return null;

  const icon = type === 'success' ? 'fas fa-circle-check' : 'fas fa-circle-exclamation';
  const title = type === 'success' ? 'Başarılı' : 'Hata';

  return (
    <div
      ref={ref}
      className={`admin-alert admin-alert-${type} admin-alert--flash`}
      role="alert"
      tabIndex={-1}
    >
      <span className="admin-alert__icon" aria-hidden="true">
        <i className={icon} />
      </span>
      <div className="admin-alert__body">
        <strong className="admin-alert__title">{title}</strong>
        <p className="admin-alert__text">{text || children}</p>
      </div>
      {onClose ? (
        <button
          type="button"
          className="admin-alert__close"
          aria-label="Kapat"
          onClick={onClose}
        >
          <i className="fas fa-times" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
