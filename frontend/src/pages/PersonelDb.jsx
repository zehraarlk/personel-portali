import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/test.css";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(
  /\/api\/?$/,
  ""
);

const CHECKS = [
  { id: "root", label: "API kökü", path: "/api/", desc: "Uç nokta listesi" },
  { id: "home", label: "Anasayfa", path: "/api/home/", desc: "Haber, duyuru, OMIS, doğum günü" },
  { id: "icons", label: "İkonlar", path: "/api/icons/", desc: "site_ikonlari" },
  { id: "health", label: "Health", path: "/api/health/", desc: "Canlılık" },
  { id: "status", label: "Sistem durumu", path: "/api/system-status/", desc: "DB bağlantısı" },
  { id: "admin", label: "Django Admin", path: "/admin/", desc: "Yönetim paneli (HTML)", html: true },
];

export default function PersonelDb() {
  const [results, setResults] = useState({});
  const [busy, setBusy] = useState(null);

  const checkOne = async (item) => {
    setBusy(item.id);
    const url = `${API_ORIGIN}${item.path}`;
    try {
      const res = await fetch(url, { credentials: "include" });
      let preview = "";
      const text = await res.text();
      if (item.html) {
        preview = res.ok ? "HTML yanıtı alındı" : text.slice(0, 120);
      } else {
        try {
          preview = JSON.stringify(JSON.parse(text), null, 0).slice(0, 180);
        } catch {
          preview = text.slice(0, 180);
        }
      }
      setResults((prev) => ({
        ...prev,
        [item.id]: {
          ok: res.ok,
          status: res.status,
          preview,
          at: new Date().toLocaleTimeString("tr-TR"),
        },
      }));
    } catch (err) {
      setResults((prev) => ({
        ...prev,
        [item.id]: {
          ok: false,
          status: 0,
          preview: err.message || "Bağlantı hatası",
          at: new Date().toLocaleTimeString("tr-TR"),
        },
      }));
    } finally {
      setBusy(null);
    }
  };

  const checkAll = async () => {
    for (const item of CHECKS) {
      await checkOne(item);
    }
  };

  return (
    <div className="test-page">
      <div className="test-bg" aria-hidden="true">
        <div className="test-bg__orb test-bg__orb--1" />
        <div className="test-bg__orb test-bg__orb--2" />
        <div className="test-bg__grid" />
      </div>

      <div className="test-wrap">
        <header className="test-hero">
          <div className="test-hero__badge">personel_db</div>
          <h1 className="test-hero__title">
            personel_db
            <span> API kontrolü</span>
          </h1>
          <p className="test-hero__lead">
            Uç noktaları tek tek veya toplu olarak kontrol edin.
          </p>
          <div className="test-hero__actions">
            <Link to="/test" className="btn-run-test" style={{ textDecoration: "none" }}>
              ← Test sayfası
            </Link>
            <button type="button" className="btn-run-test" onClick={checkAll} disabled={!!busy}>
              Tümünü kontrol et
            </button>
          </div>
        </header>

        <section className="test-section">
          <ul className="endpoint-list">
            {CHECKS.map((item) => {
              const r = results[item.id];
              return (
                <li key={item.id} className="endpoint-item endpoint-item--check">
                  <span className="endpoint-item__method">GET</span>
                  <div className="endpoint-item__body">
                    <div className="endpoint-item__row">
                      <strong>{item.label}</strong>
                      <a href={`${API_ORIGIN}${item.path}`} target="_blank" rel="noreferrer">
                        <code>{item.path}</code>
                      </a>
                    </div>
                    <p>{item.desc}</p>
                    {r && (
                      <p
                        className={
                          r.ok ? "endpoint-item__result is-ok" : "endpoint-item__result is-err"
                        }
                      >
                        {r.ok ? "OK" : "HATA"} · HTTP {r.status || "—"} · {r.at}
                        {r.preview ? ` · ${r.preview}` : ""}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    className="btn-check-ep"
                    onClick={() => checkOne(item)}
                    disabled={busy === item.id}
                  >
                    {busy === item.id ? "…" : "Kontrol et"}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>
    </div>
  );
}
