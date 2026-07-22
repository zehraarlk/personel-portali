import { useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';

/** Topbar başlığını sayfa mount’unda ayarlar. */
export default function usePageTitle(title) {
  const ctx = useOutletContext() || {};
  const setPageTitle = ctx.setPageTitle;
  useEffect(() => {
    if (typeof setPageTitle === 'function') setPageTitle(title);
  }, [title, setPageTitle]);
}
