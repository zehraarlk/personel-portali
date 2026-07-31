import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import Footer from '../components/Footer';
import { fetchDuyurular } from '../api/client';

const DATE_FORMATTER = new Intl.DateTimeFormat('tr-TR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
});

function formatDate(value) {
  if (!value) return '';

  const [year, month, day] = String(value).split('-').map(Number);
  const date = new Date(year, month - 1, day);

  return Number.isNaN(date.getTime()) ? value : DATE_FORMATTER.format(date);
}

function getDuyuruMetni(duyuru) {
  return duyuru?.icerik || duyuru?.detay || duyuru?.aciklama || '';
}

export default function DuyuruDetay() {
  const { id } = useParams();
  const location = useLocation();

  const stateDuyuru = location.state?.duyuru;

  const stateDuyuruUygun =
    stateDuyuru && String(stateDuyuru.id) === String(id)
      ? stateDuyuru
      : null;

  const [duyuru, setDuyuru] = useState(stateDuyuruUygun);
  const [loading, setLoading] = useState(!stateDuyuruUygun);
  const [error, setError] = useState('');
  const [reloadToken, setReloadToken] = useState(0);

  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'auto',
    });
  }, [id]);

  useEffect(() => {
    if (stateDuyuruUygun) {
      setDuyuru(stateDuyuruUygun);
      setLoading(false);
      setError('');

      return undefined;
    }

    let cancelled = false;

    async function loadDuyuru() {
      setLoading(true);
      setError('');

      try {
        const result = await fetchDuyurular();

        const duyurular = Array.isArray(result.duyurular)
          ? result.duyurular
          : [];

        const bulunanDuyuru = duyurular.find(
          (item) => String(item.id) === String(id),
        );

        if (!cancelled) {
          if (bulunanDuyuru) {
            setDuyuru(bulunanDuyuru);
          } else {
            setDuyuru(null);
            setError('Aradığınız duyuru bulunamadı.');
          }
        }
      } catch (requestError) {
        if (!cancelled) {
          setDuyuru(null);
          setError(
            requestError.message || 'Duyuru bilgileri yüklenemedi.',
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadDuyuru();

    return () => {
      cancelled = true;
    };
  }, [id, reloadToken, stateDuyuruUygun]);

  const duyuruMetni = useMemo(
    () => getDuyuruMetni(duyuru),
    [duyuru],
  );

  return (
    <Layout videoPage>
      <div className="min-h-full w-full bg-[#f7fafc]">
        <main className="mx-auto w-full max-w-[920px] px-3 pb-6 pt-3 sm:px-5 sm:pb-8 sm:pt-5 lg:px-6">
          <Link
            to="/duyurular"
            className="mb-3 inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-xs font-bold text-[#022842] transition hover:bg-[#eaf2f8] focus:outline-none focus-visible:ring-4 focus-visible:ring-[#022842]/15 sm:text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">
              arrow_back
            </span>

            Duyurulara Dön
          </Link>

          {loading && (
            <div className="rounded-[18px] border border-[#dde5eb] bg-white p-5 shadow-[0_10px_26px_rgba(2,40,66,0.08)] sm:p-6">
              <div className="flex items-center gap-3 text-[#4f6474]">
                <span className="material-symbols-outlined animate-spin text-[#022842]">
                  progress_activity
                </span>

                Duyuru bilgileri yükleniyor…
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-[18px] border border-[#b42318]/20 bg-white p-5 shadow-[0_10px_26px_rgba(2,40,66,0.08)] sm:p-6">
              <div className="flex items-start gap-3">
                <span className="material-symbols-outlined text-[#b42318]">
                  error
                </span>

                <div className="flex-1">
                  <h1 className="text-xl font-black text-[#0b1c30]">
                    Duyuru görüntülenemedi
                  </h1>

                  <p className="mt-2 text-sm leading-6 text-[#61717d]">
                    {error}
                  </p>

                  <button
                    type="button"
                    onClick={() =>
                      setReloadToken((value) => value + 1)
                    }
                    className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-[#022842] px-4 text-sm font-bold text-white transition hover:bg-[#0a3a5c]"
                  >
                    <span className="material-symbols-outlined text-[19px]">
                      refresh
                    </span>

                    Yeniden dene
                  </button>
                </div>
              </div>
            </div>
          )}

          {!loading && !error && duyuru && (
            <article className="overflow-hidden rounded-[18px] border border-[#dbe4eb] bg-white shadow-[0_12px_32px_rgba(2,40,66,0.09)]">
              {duyuru.resim && (
                <div className="px-[14px] pb-1 pt-[14px] sm:px-[16px] sm:pb-1 sm:pt-[16px]">
                  <div className="flex h-[30vh] min-h-[200px] items-center justify-center sm:h-[34vh] sm:min-h-[230px] lg:h-[300px]">
                    <img
                      src={duyuru.resim}
                      alt={duyuru.baslik}
                      loading="eager"
                      decoding="async"
                      className="block max-h-full max-w-full object-contain"
                    />
                  </div>
                </div>
              )}

              <div
                className={`px-4 pb-5 sm:px-6 sm:pb-6 md:px-7 md:pb-8 ${
                  duyuru.resim
                    ? 'pt-2 sm:pt-3 md:pt-3'
                    : 'pt-5 sm:pt-6 md:pt-8'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2.5">
                  {duyuru.kategori && (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[#022842] px-3 py-1.5 text-xs font-bold text-white shadow-[0_6px_14px_rgba(2,40,66,0.16)]">
                      <span className="material-symbols-outlined text-[16px]">
                        campaign
                      </span>

                      {duyuru.kategori}
                    </span>
                  )}

                  {duyuru.tarih && (
                    <time
                      dateTime={duyuru.tarih}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#667784] sm:text-sm"
                    >
                      <span className="material-symbols-outlined text-[17px]">
                        calendar_month
                      </span>

                      {formatDate(duyuru.tarih)}
                    </time>
                  )}
                </div>

                <h1 className="mt-3 max-w-4xl text-[1.4rem] font-black leading-[1.18] tracking-tight text-[#022842] sm:text-[1.7rem] md:text-[1.9rem]">
                  {duyuru.baslik}
                </h1>

                <div
                  aria-hidden="true"
                  className="mt-3 h-0.5 w-12 rounded-full bg-[#022842]"
                />

                {duyuruMetni ? (
                  <div className="mt-4 whitespace-pre-line text-[14px] leading-6 text-[#445563] sm:text-[15px] sm:leading-7">
                    {duyuruMetni}
                  </div>
                ) : (
                  <p className="mt-4 rounded-xl bg-[#f3f7fa] px-4 py-3 text-[14px] leading-6 text-[#71808c]">
                    Bu duyuru için ayrıntılı açıklama bulunmuyor.
                  </p>
                )}
              </div>
            </article>
          )}
        </main>

        <Footer />
      </div>
    </Layout>
  );
}