import { useEffect, useState } from "react";
import { fetchHealth, fetchSystemStatus } from "../api/client.js";
import "../styles/test.css";

const STACK = [
  {
    id: "react",
    name: "React",
    role: "Frontend",
    version: "19 + Vite",
    icon: "fa-brands fa-react",
    accent: "#344e75",
    glow: "rgba(52, 78, 117, 0.2)",
  },
  {
    id: "django",
    name: "Django",
    role: "Backend API",
    version: "REST Framework",
    icon: "fa-solid fa-code",
    accent: "#022842",
    glow: "rgba(2, 40, 66, 0.2)",
  },
  {
    id: "postgres",
    name: "PostgreSQL",
    role: "Veritabanı",
    version: "personel_portali / SQLite",
    icon: "fa-solid fa-database",
    accent: "#1e4a6b",
    glow: "rgba(30, 74, 107, 0.2)",
  },
  {
    id: "dbeaver",
    name: "DBeaver",
    role: "DB Yönetimi",
    version: "Görsel araç",
    icon: "fa-solid fa-table-columns",
    accent: "#336791",
    glow: "rgba(51, 103, 145, 0.2)",
  },
];

const ENDPOINTS = [
  { method: "GET", path: "/api/health/", desc: "API canlılık kontrolü" },
  { method: "GET", path: "/api/system-status/", desc: "Veritabanı ve sistem durumu" },
  { method: "GET", path: "/api/employees/", desc: "Personel listesi" },
];

const DB_CONFIG = [
  { label: "Host", value: "127.0.0.1" },
  { label: "Port", value: "5432" },
  { label: "Veritabanı", value: "personel_portali" },
  { label: "Kullanıcı", value: "postgres" },
  { label: "Şifre", value: "backend/.env → POSTGRES_PASSWORD" },
];

function StatusDot({ state }) {
  return <span className={`status-dot status-dot--${state}`} aria-hidden="true" />;
}

function ServiceCard({ title, subtitle, icon, state, detail, error }) {
  const labels = {
    loading: "Kontrol ediliyor",
    ok: "Çalışıyor",
    error: "Hata",
    idle: "Bekliyor",
  };

  return (
    <article className={`service-card service-card--${state}`}>
      <div className="service-card__top">
        <div className="service-card__icon">
          <i className={icon} />
        </div>
        <StatusDot state={state} />
      </div>
      <h3 className="service-card__title">{title}</h3>
      <p className="service-card__subtitle">{subtitle}</p>
      <div className="service-card__footer">
        <span className={`service-card__badge service-card__badge--${state}`}>
          {labels[state]}
        </span>
        {detail && <p className="service-card__detail">{detail}</p>}
        {error && <p className="service-card__error">{error}</p>}
      </div>
    </article>
  );
}

export default function Test() {
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(false);
  const [systemData, setSystemData] = useState(null);
  const [lastCheck, setLastCheck] = useState(null);

  const runChecks = async () => {
    setLoading(true);
    let healthOk = false;
    let status = null;

    try {
      const health = await fetchHealth();
      healthOk = health?.status === "ok";
    } catch {
      healthOk = false;
    }

    try {
      status = await fetchSystemStatus();
    } catch {
      status = null;
    }

    setApiOk(healthOk);
    setSystemData(status);
    setLastCheck(new Date());
    setLoading(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const dbOk = systemData?.database?.connected === true;
  const allOk = !loading && apiOk && dbOk;
  const passedCount = [apiOk, dbOk, true].filter(Boolean).length;
  const dbLabel = systemData?.database?.name || systemData?.stack?.database || "Veritabanı";

  const cardState = (ok) => (loading ? "loading" : ok ? "ok" : "error");

  return (
    <div className="test-page">
      <div className="test-bg" aria-hidden="true">
        <div className="test-bg__orb test-bg__orb--1" />
        <div className="test-bg__orb test-bg__orb--2" />
        <div className="test-bg__grid" />
      </div>

      <div className="test-wrap">
        <header className="test-hero">
          <div className="test-hero__badge">
            <StatusDot state={loading ? "loading" : allOk ? "ok" : "error"} />
            Sistem Test Paneli
          </div>
          <h1 className="test-hero__title">
            Personel Portalı
            <span> altyapı kontrolü</span>
          </h1>
          <p className="test-hero__lead">
            React frontend, Django API ve veritabanının birlikte çalışıp
            çalışmadığını bu sayfadan doğrulayabilirsiniz.
          </p>

          <div className="test-hero__actions">
            <button
              type="button"
              className="btn-run-test"
              onClick={runChecks}
              disabled={loading}
            >
              <i className={`fa-solid fa-bolt ${loading ? "is-spinning" : ""}`} />
              {loading ? "Test çalışıyor…" : "Testi Yenile"}
            </button>
            {lastCheck && (
              <time className="test-hero__time" dateTime={lastCheck.toISOString()}>
                Son kontrol: {lastCheck.toLocaleString("tr-TR")}
              </time>
            )}
          </div>

          <div className="test-score">
            <div className="test-score__ring" style={{ "--progress": `${(passedCount / 3) * 100}%` }}>
              <span className="test-score__value">{passedCount}/3</span>
            </div>
            <div>
              <p className="test-score__label">Geçen testler</p>
              <p className="test-score__hint">
                {allOk
                  ? "Tüm servisler hazır — geliştirmeye başlayabilirsiniz."
                  : loading
                    ? "Servisler kontrol ediliyor…"
                    : "Bazı servisler yanıt vermiyor — .\\baslat.ps1 ile sunucuları açın."}
              </p>
            </div>
          </div>
        </header>

        <section className="test-section">
          <h2 className="test-section__title">Bağlantı Akışı</h2>
          <div className="pipeline">
            {[
              { icon: "fa-solid fa-window-maximize", label: "Tarayıcı", sub: "localhost:5173", ok: true },
              { icon: "fa-brands fa-react", label: "React", sub: "Vite dev server", ok: true },
              { icon: "fa-solid fa-server", label: "Django", sub: ":8000/api", ok: apiOk },
              { icon: "fa-solid fa-database", label: "Database", sub: String(dbLabel), ok: dbOk },
            ].map((node, i, arr) => (
              <div key={node.label} className="pipeline__group">
                <div className={`pipeline__node ${node.ok && !loading ? "is-active" : loading ? "is-pending" : "is-down"}`}>
                  <i className={node.icon} />
                  <strong>{node.label}</strong>
                  <span>{node.sub}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`pipeline__line ${node.ok && !loading ? "is-active" : ""}`}>
                    <i className="fa-solid fa-chevron-right" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        <section className="test-section">
          <h2 className="test-section__title">Servis Durumu</h2>
          <div className="service-grid">
            <ServiceCard
              title="Django API"
              subtitle="REST endpoint sağlık kontrolü"
              icon="fa-solid fa-plug-circle-check"
              state={cardState(apiOk)}
              detail={apiOk ? "GET /api/health/ → 200 OK" : undefined}
              error={!loading && !apiOk ? "Backend çalışmıyor. .\\baslat.ps1 ile Django'yu başlatın." : undefined}
            />
            <ServiceCard
              title="Veritabanı"
              subtitle={systemData?.stack?.database || "PostgreSQL / SQLite bağlantısı"}
              icon="fa-solid fa-database"
              state={cardState(dbOk)}
              detail={dbOk ? systemData?.database?.version : undefined}
              error={
                !loading && !dbOk
                  ? systemData?.database?.error || "Veritabanına bağlanılamadı."
                  : undefined
              }
            />
            <ServiceCard
              title="React Frontend"
              subtitle="Vite geliştirme sunucusu"
              icon="fa-brands fa-react"
              state={loading ? "loading" : "ok"}
              detail="Bu sayfa başarıyla yüklendi."
            />
          </div>
        </section>

        <div className="test-columns">
          <section className="test-section">
            <h2 className="test-section__title">Teknoloji Yığını</h2>
            <div className="stack-list">
              {STACK.map((item) => (
                <div key={item.id} className="stack-item" style={{ "--accent": item.accent, "--glow": item.glow }}>
                  <div className="stack-item__icon">
                    <i className={item.icon} />
                  </div>
                  <div className="stack-item__body">
                    <div className="stack-item__row">
                      <strong>{item.name}</strong>
                      <span>{item.role}</span>
                    </div>
                    <p>{item.version}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="test-section">
            <h2 className="test-section__title">API Uç Noktaları</h2>
            <ul className="endpoint-list">
              {ENDPOINTS.map((ep) => (
                <li key={ep.path} className="endpoint-item">
                  <span className="endpoint-item__method">{ep.method}</span>
                  <div>
                    <code>{ep.path}</code>
                    <p>{ep.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section className="test-section">
          <h2 className="test-section__title">
            <i className="fa-solid fa-table-columns" /> DBeaver Bağlantısı
          </h2>
          <div className="config-panel">
            <p className="config-panel__intro">
              PostgreSQL kullanıyorsanız DBeaver&apos;da yeni bir bağlantı oluşturun.
              Yerelde <code>USE_SQLITE=True</code> ise SQLite dosyası{" "}
              <code>backend/db.sqlite3</code> kullanılır.
            </p>
            <dl className="config-grid">
              {DB_CONFIG.map((row) => (
                <div key={row.label} className="config-row">
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>

        <footer className="test-footer">
          <p>Personel Portalı — geliştirme ortamı test sayfası</p>
          <p className="test-footer__url">
            Ana sayfa: <code>127.0.0.1:5173</code> &nbsp;·&nbsp; Personel:{' '}
            <code>/personel</code> &nbsp;·&nbsp; Test: <code>/test</code>
          </p>
        </footer>
      </div>
    </div>
  );
}
