import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchHealth, fetchSystemStatus, fetchSiteIcons } from "../api/client.js";
import "../styles/test.css";

const API_ORIGIN = (import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api").replace(
  /\/api\/?$/,
  ""
);
const FE_ORIGIN = "http://127.0.0.1:5173";

/** site_ikonlari anahtarları + yoksa yedek FA sınıfı */
const ICON_KEYS = {
  yenile: "test_yenile",
  tarayici: "test_tarayici",
  react: "test_react",
  django: "test_django",
  veritabani: "test_veritabani",
  api: "test_api",
  admin: "test_admin",
  health: "test_health",
  sistem: "test_sistem",
  personel: "test_personel",
  haber: "test_haber",
  pgadmin: "test_pgadmin",
  kod: "test_kod",
  baglanti: "test_baglanti",
  anasayfa: "anasayfa",
  sonraki: "sonraki",
};

const FALLBACK = {
  test_yenile: "fas fa-bolt",
  test_tarayici: "fas fa-window-maximize",
  test_react: "fab fa-react",
  test_django: "fas fa-server",
  test_veritabani: "fas fa-database",
  test_api: "fas fa-plug",
  test_admin: "fas fa-shield-halved",
  test_health: "fas fa-heart-pulse",
  test_sistem: "fas fa-stethoscope",
  test_personel: "fas fa-users",
  test_haber: "fas fa-newspaper",
  test_pgadmin: "fas fa-table-columns",
  test_kod: "fas fa-code",
  test_baglanti: "fas fa-plug-circle-check",
  anasayfa: "fas fa-home",
  sonraki: "fas fa-chevron-right",
};

const STACK = [
  { id: "react", name: "React", role: "Frontend", version: "19 + Vite", iconKey: "react" },
  { id: "django", name: "Django", role: "Backend API + Admin", version: "REST Framework", iconKey: "django" },
  { id: "postgres", name: "PostgreSQL", role: "Veritabanı", version: "personel_db", iconKey: "veritabani" },
  { id: "pgadmin", name: "pgAdmin", role: "DB Yönetimi", version: "Tablo düzenleme", iconKey: "pgadmin" },
];

const QUICK_LINKS = [
  {
    title: "Personel Portal",
    href: "/",
    external: false,
    iconKey: "anasayfa",
    desc: "Ana sayfa",
  },
  {
    title: "Django Admin",
    href: `${API_ORIGIN}/admin/`,
    external: true,
    iconKey: "admin",
    desc: "Haber, duyuru, OMIS, personel yönetimi",
  },
  {
    title: "personel_db",
    href: "/test/personel-db",
    external: false,
    iconKey: "veritabani",
    desc: "API uç noktalarını tek tek kontrol edin",
  },
];

const DB_CONFIG = [
  { label: "Host", value: "127.0.0.1" },
  { label: "Port", value: "5432" },
  { label: "Veritabanı", value: "personel_db" },
  { label: "Kullanıcı", value: "postgres" },
  { label: "Şifre", value: "backend/.env → POSTGRES_PASSWORD" },
];

function StatusDot({ state }) {
  return <span className={`status-dot status-dot--${state}`} aria-hidden="true" />;
}

function FaIcon({ name, icons, className = "" }) {
  const key = ICON_KEYS[name] || name;
  const cls = icons[key] || FALLBACK[key] || "fas fa-circle";
  return <i className={`${cls} ${className}`.trim()} aria-hidden="true" />;
}

function ServiceCard({ title, subtitle, iconName, icons, state, detail, error }) {
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
          <FaIcon name={iconName} icons={icons} />
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

function QuickLinkCard({ item, icons }) {
  const body = (
    <>
      <div className="link-card__icon">
        <FaIcon name={item.iconKey} icons={icons} />
      </div>
      <div>
        <strong>{item.title}</strong>
        <code>{item.href.startsWith("http") ? item.href : `${FE_ORIGIN}${item.href}`}</code>
        <p>{item.desc}</p>
      </div>
    </>
  );

  if (item.external) {
    return (
      <a className="link-card" href={item.href} target="_blank" rel="noreferrer">
        {body}
      </a>
    );
  }

  return (
    <Link className="link-card" to={item.href}>
      {body}
    </Link>
  );
}

export default function Test() {
  const [loading, setLoading] = useState(true);
  const [apiOk, setApiOk] = useState(false);
  const [systemData, setSystemData] = useState(null);
  const [icons, setIcons] = useState(FALLBACK);
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

    try {
      const iconData = await fetchSiteIcons();
      if (iconData?.icons) {
        setIcons({ ...FALLBACK, ...iconData.icons });
      }
    } catch {
      /* FALLBACK kullanılır */
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
            React arayüz, Django API/Admin ve PostgreSQL bağlantısını buradan kontrol edin.
          </p>

          <div className="test-hero__actions">
            <button
              type="button"
              className="btn-run-test"
              onClick={runChecks}
              disabled={loading}
            >
              <FaIcon name="yenile" icons={icons} className={loading ? "is-spinning" : ""} />
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
          <h2 className="test-section__title">
            <FaIcon name="admin" icons={icons} /> Django Admin
          </h2>
          <div className="info-box">
            <p>
              Backend açıkken{" "}
              <a href={`${API_ORIGIN}/admin/`} target="_blank" rel="noreferrer">
                {API_ORIGIN}/admin/
              </a>{" "}
              adresine gidin. İlk giriş için:
            </p>
            <p style={{ marginTop: "0.75rem" }}>
              <code>
                cd backend; .\venv\Scripts\python.exe manage.py createsuperuser
              </code>
            </p>
          </div>
        </section>

        <section className="test-section">
          <h2 className="test-section__title">Tüm linkler</h2>
          <div className="link-grid">
            {QUICK_LINKS.map((item) => (
              <QuickLinkCard key={item.href + item.title} item={item} icons={icons} />
            ))}
          </div>
        </section>

        <section className="test-section">
          <h2 className="test-section__title">Bağlantı Akışı</h2>
          <div className="pipeline">
            {[
              { iconKey: "tarayici", label: "Tarayıcı", sub: "localhost:5173", ok: true },
              { iconKey: "react", label: "React", sub: "Vite dev server", ok: true },
              { iconKey: "django", label: "Django", sub: ":8000/api", ok: apiOk },
              { iconKey: "veritabani", label: "Database", sub: String(dbLabel), ok: dbOk },
            ].map((node, i, arr) => (
              <div key={node.label} className="pipeline__group">
                <div
                  className={`pipeline__node ${
                    node.ok && !loading ? "is-active" : loading ? "is-pending" : "is-down"
                  }`}
                >
                  <FaIcon name={node.iconKey} icons={icons} />
                  <strong>{node.label}</strong>
                  <span>{node.sub}</span>
                </div>
                {i < arr.length - 1 && (
                  <div className={`pipeline__line ${node.ok && !loading ? "is-active" : ""}`}>
                    <FaIcon name="sonraki" icons={icons} />
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
              iconName="baglanti"
              icons={icons}
              state={cardState(apiOk)}
              detail={apiOk ? "GET /api/health/ → 200 OK" : undefined}
              error={
                !loading && !apiOk
                  ? "Backend çalışmıyor. .\\baslat.ps1 ile Django'yu başlatın."
                  : undefined
              }
            />
            <ServiceCard
              title="Veritabanı"
              subtitle={systemData?.stack?.database || "PostgreSQL bağlantısı"}
              iconName="veritabani"
              icons={icons}
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
              iconName="react"
              icons={icons}
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
                <div key={item.id} className="stack-item">
                  <div className="stack-item__icon">
                    <FaIcon name={item.iconKey} icons={icons} />
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
            <h2 className="test-section__title">
              <FaIcon name="veritabani" icons={icons} /> PostgreSQL
            </h2>
            <div className="config-panel">
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
        </div>

        <footer className="test-footer">
          <p>Personel Portalı — geliştirme ortamı test sayfası</p>
          <p className="test-footer__url">
            <Link to="/">Portal</Link>
            {" · "}
            <a href={`${API_ORIGIN}/admin/`} target="_blank" rel="noreferrer">
              Admin
            </a>
            {" · "}
            <Link to="/test/personel-db">personel_db</Link>
            {" · "}
            <Link to="/test">Test</Link>
          </p>
        </footer>
      </div>
    </div>
  );
}
