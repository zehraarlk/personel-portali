import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchSizdenGelenler, goruntulenmeArttir } from '../api/client';

export default function SizdenGelenlerDetay() {
  const { id } = useParams();
  const [tumIcerikler, setTumIcerikler] = useState([]);
  const [icerik, setIcerik] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const seritRef = useRef(null);
  const gonderilenIdler = useRef(new Set());

  useEffect(() => {
    setLoading(true);
    fetchSizdenGelenler()
      .then((data) => {
        const liste = data.icerikler ?? [];
        setTumIcerikler(liste);
        const bulunan = liste.find((i) => String(i.id) === id);
        setIcerik(bulunan || null);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (gonderilenIdler.current.has(id)) return;
    gonderilenIdler.current.add(id);
    goruntulenmeArttir(id).catch(() => {});
  }, [id]);

  const digerIcerikler = useMemo(
    () => tumIcerikler.filter((i) => String(i.id) !== id),
    [tumIcerikler, id]
  );

  function seritKaydir(yon) {
    seritRef.current?.scrollBy({ left: yon * 280, behavior: 'smooth' });
  }

  return (
    <Layout>
      {loading && (
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#022842]/10 bg-white p-8 text-[#536575] shadow-sm">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined animate-spin text-[#022842]">
              progress_activity
            </span>
            Yükleniyor…
          </div>
        </div>
      )}

      {error && (
        <div className="mx-auto max-w-6xl rounded-2xl border border-error/20 bg-error-container p-6 text-on-error-container">
          Veriler alınamadı: {error}
        </div>
      )}

      {!loading && !error && !icerik && (
        <div className="mx-auto max-w-6xl rounded-2xl border border-[#022842]/10 bg-white p-10 text-center shadow-sm">
          <span className="material-symbols-outlined mb-3 text-5xl text-[#c3ccd3]">
            search_off
          </span>
          <h3 className="text-lg font-semibold text-[#0b1c30]">İçerik bulunamadı</h3>
          <p className="mt-2 text-sm text-[#61717d]">Bu içerik kaldırılmış olabilir.</p>
        </div>
      )}

      {!loading && !error && icerik && (
        <div className="mx-auto max-w-6xl">
          <Link
            to="/sizden-gelenler"
            className="group mb-5 inline-flex items-center gap-2 rounded-full border border-[#022842]/10 bg-white px-4 py-2 text-sm font-bold text-[#022842] shadow-sm transition hover:-translate-x-0.5 hover:bg-[#eef1f3] hover:border-[#022842]/20"
          >
            <span className="material-symbols-outlined text-[18px] transition group-hover:-translate-x-0.5">
              arrow_back
            </span>
            Sizden Gelenler'e Dön
          </Link>

          {/* Ana kart - tam genişlik */}
          <article className="overflow-hidden rounded-2xl border border-[#022842]/10 bg-white shadow-sm transition hover:shadow-md">
            <div className="flex flex-col sm:flex-row">
              <div className="relative h-56 w-full sm:h-auto sm:w-72 shrink-0 overflow-hidden bg-[#dce6ed]">
                <img
                  src={icerik.resim}
                  alt={icerik.kategori}
                  className="h-full w-full object-cover"
                />
              </div>

              <div className="flex flex-1 flex-col p-6 sm:p-8">
                <span className="text-[11px] font-bold uppercase tracking-wide text-[#a16207]">
                  {icerik.kategori}
                </span>

                <h1 className="mt-2 text-xl sm:text-2xl font-extrabold tracking-tight text-[#0b1c30]">
                  {icerik.baslik}
                </h1>
                <p className="mt-4 text-sm leading-7 text-[#536575]">{icerik.ozet}</p>

                <div className="mt-auto flex items-center gap-5 border-t border-[#022842]/10 pt-4 text-sm text-[#61717d]">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                    {icerik.tarih}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    {icerik.goruntulenme ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </article>

          {/* Diğer içerikler: yatay kaydırmalı şerit */}
          {digerIcerikler.length > 0 && (
            <div className="mt-10">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold tracking-tight text-[#0b1c30]">
                  Diğer İçerikler
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => seritKaydir(-1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#022842]/10 bg-white shadow-sm transition hover:border-[#022842]/30"
                    aria-label="Sola kaydır"
                  >
                    <span className="material-symbols-outlined text-[16px] leading-none">
                      chevron_left
                    </span>
                  </button>
                  <button
                    onClick={() => seritKaydir(1)}
                    className="flex h-8 w-8 items-center justify-center rounded-full border border-[#022842]/10 bg-white shadow-sm transition hover:border-[#022842]/30"
                    aria-label="Sağa kaydır"
                  >
                    <span className="material-symbols-outlined text-[16px] leading-none">
                      chevron_right
                    </span>
                  </button>
                </div>
              </div>

              <div
                ref={seritRef}
                className="flex gap-4 overflow-x-auto pb-2 scroll-smooth"
                style={{ scrollbarWidth: 'none' }}
              >
                {digerIcerikler.map((item) => (
                  <Link
                    key={item.id}
                    to={`/sizden-gelenler/detay/${item.id}`}
                    className="group w-60 shrink-0 overflow-hidden rounded-2xl border border-[#022842]/10 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className="h-32 overflow-hidden bg-[#dce6ed]">
                      <img
                        src={item.resim}
                        alt={item.kategori}
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    </div>
                    <div className="p-3">
                      <span className="text-[11px] font-bold uppercase tracking-wide text-[#a16207]">
                        {item.kategori}
                      </span>
                      <p className="mt-1 line-clamp-2 text-sm font-bold leading-snug text-[#0b1c30]">
                        {item.baslik}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Layout>
  );
}