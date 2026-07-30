import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { fetchAnketDetail, submitAnket } from '../api/client';
import { getPersonelId, isPersonelLoggedIn } from '../auth/session';
import useSiteIcons from '../hooks/useSiteIcons';
import '../styles/anketler.css';

function isAnswered(soru, answers) {
  const val = answers[soru.id];
  if (soru.soru_tipi === 'coktan_secmeli') return Boolean(val);
  return Boolean(String(val || '').trim());
}

export default function AnketDetay() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { icon } = useSiteIcons();
  const formTopRef = useRef(null);
  const [anket, setAnket] = useState(null);
  const [sorular, setSorular] = useState([]);
  const [participated, setParticipated] = useState(false);
  const [answers, setAnswers] = useState({});
  const [missing, setMissing] = useState(() => new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [okMsg, setOkMsg] = useState('');
  const personelOk = isPersonelLoggedIn();

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError('');
    fetchAnketDetail(id)
      .then((data) => {
        if (cancelled) return;
        setAnket(data.anket || null);
        const list = Array.isArray(data.sorular) ? data.sorular : [];
        setSorular(list);
        setParticipated(Boolean(data.participated || data.katildi_mi));
        const initial = {};
        list.forEach((s) => {
          if (s.soru_tipi === 'coktan_secmeli') {
            if (s.cevap_secenek_id) initial[s.id] = String(s.cevap_secenek_id);
          } else if (s.cevap_metni) {
            initial[s.id] = s.cevap_metni;
          }
        });
        setAnswers(initial);
        setMissing(new Set());
      })
      .catch((ex) => {
        if (!cancelled) setError(ex.message || 'Anket yüklenemedi.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  const answeredCount = useMemo(
    () => sorular.reduce((n, s) => n + (isAnswered(s, answers) ? 1 : 0), 0),
    [sorular, answers],
  );

  const progressPct =
    sorular.length > 0 ? Math.round((answeredCount / sorular.length) * 100) : 0;

  const allDone = sorular.length > 0 && answeredCount === sorular.length;

  const toggleChoice = (soruId, secenekId) => {
    if (participated) return;
    setAnswers((prev) => {
      const next = { ...prev };
      if (String(prev[soruId] || '') === String(secenekId)) {
        delete next[soruId];
      } else {
        next[soruId] = String(secenekId);
      }
      return next;
    });
    setMissing((prev) => {
      if (!prev.has(soruId)) return prev;
      const next = new Set(prev);
      next.delete(soruId);
      return next;
    });
    setError('');
  };

  const onTextChange = (soruId, value) => {
    setAnswers((prev) => ({ ...prev, [soruId]: value }));
    if (String(value || '').trim()) {
      setMissing((prev) => {
        if (!prev.has(soruId)) return prev;
        const next = new Set(prev);
        next.delete(soruId);
        return next;
      });
    }
    setError('');
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (participated || busy) return;
    setOkMsg('');

    if (!personelOk || !getPersonelId()) {
      setError('Ankete katılmak için personel hesabıyla giriş yapmalısınız.');
      formTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    const eksik = new Set(sorular.filter((s) => !isAnswered(s, answers)).map((s) => s.id));
    if (eksik.size > 0) {
      setMissing(eksik);
      setError(
        `Lütfen tüm soruları yanıtlayın. Eksik soru: ${eksik.size} / ${sorular.length}`,
      );
      const first = document.getElementById(`ak-q-block-${[...eksik][0]}`);
      first?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setError('');
    setMissing(new Set());
    setBusy(true);
    try {
      const payload = {};
      sorular.forEach((s) => {
        const val = answers[s.id];
        if (s.soru_tipi === 'coktan_secmeli') {
          payload[s.id] = Number(val || 0);
        } else {
          payload[s.id] = String(val || '').trim();
        }
      });
      const res = await submitAnket(id, payload);
      setOkMsg(res.message || 'Katılımınız kaydedildi.');
      setParticipated(true);
      setTimeout(() => navigate('/anketler'), 1200);
    } catch (ex) {
      setError(ex.message || 'Katılım kaydedilemedi.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Layout>
      <div className="anketler-page ak-join" ref={formTopRef}>
        <Link to="/anketler" className="ak-join__back">
          <i className="fas fa-arrow-left" aria-hidden="true" />
          Anketlere dön
        </Link>

        {loading && <div className="ak-state">Yükleniyor…</div>}

        {!loading && error && !anket && <div className="ak-state is-error">{error}</div>}

        {!loading && anket && (
          <>
            {!personelOk && !participated && (
              <p className="ak-join__error" role="alert">
                <i className="fas fa-user-lock" aria-hidden="true" />
                Ankete katılmak için personel hesabıyla giriş yapın. Yönetici oturumu yeterli
                değildir.
              </p>
            )}
            {participated && (
              <p className="ak-join__alert" role="status">
                <i className={icon('anketler')} aria-hidden="true" />
                Bu ankete daha önce katıldınız. Yanıtlarınız salt okunur görüntüleniyor.
              </p>
            )}
            {error && (
              <p className="ak-join__error" role="alert">
                <i className="fas fa-exclamation-triangle" aria-hidden="true" />
                {error}
              </p>
            )}
            {okMsg && (
              <p className="ak-join__ok" role="status">
                <i className="fas fa-check-circle" aria-hidden="true" />
                {okMsg}
              </p>
            )}

            <header className="ak-join__hero">
              <span className="ak-join__hero-icon" aria-hidden="true">
                <i className={icon('anketler')} />
              </span>
              <div className="ak-join__hero-copy">
                <p className="ak-join__kicker">
                  {participated ? 'Cevaplarınız' : 'Ankete Katıl'}
                </p>
                <h1>{anket.baslik}</h1>
                {anket.aciklama && <p>{anket.aciklama}</p>}
              </div>
              {sorular.length > 0 && (
                <div className="ak-join__stat" aria-label="Soru sayısı">
                  <strong>{sorular.length}</strong>
                  <span>soru</span>
                </div>
              )}
            </header>

            {sorular.length === 0 ? (
              <div className="ak-state">
                <i className={icon('anketler')} aria-hidden="true" />
                <div>
                  <p>
                    <strong>Soru bulunamadı</strong>
                  </p>
                  <p>Bu ankete henüz soru eklenmemiş.</p>
                </div>
              </div>
            ) : (
              <form
                className={`ak-join-form${participated ? ' is-readonly' : ''}`}
                onSubmit={onSubmit}
                noValidate
              >
                {!participated && (
                  <div className="ak-join__progress">
                    <span>İlerleme</span>
                    <div className="ak-join__progress-track">
                      <div
                        className="ak-join__progress-bar"
                        style={{ width: `${progressPct}%` }}
                      />
                    </div>
                    <span>
                      {answeredCount} / {sorular.length}
                    </span>
                  </div>
                )}

                {!participated && !allDone && (
                  <p className="ak-join__hint" role="status">
                    Göndermek için tüm soruları yanıtlayın. Seçili bir şıkka tekrar tıklayarak
                    seçimi kaldırabilirsiniz.
                  </p>
                )}

                {sorular.map((soru, index) => {
                  const tip = soru.soru_tipi || 'coktan_secmeli';
                  const tipLabel = tip === 'acik_uclu' ? 'Açık uçlu' : 'Çoktan seçmeli';
                  const isMissing = missing.has(soru.id);
                  return (
                    <section
                      key={soru.id}
                      id={`ak-q-block-${soru.id}`}
                      className={`ak-question${isMissing ? ' is-missing' : ''}`}
                      role="group"
                      aria-labelledby={`ak-q-${soru.id}`}
                    >
                      <div className="ak-question__head">
                        <span className="ak-question__num">
                          {index + 1} / {sorular.length}
                        </span>
                        <span className="ak-question__type">{tipLabel}</span>
                      </div>
                      <h2 className="ak-question__title" id={`ak-q-${soru.id}`}>
                        {soru.soru_metni}
                      </h2>
                      {isMissing && (
                        <p className="ak-question__warn">Bu soruyu yanıtlamanız gerekiyor.</p>
                      )}

                      {tip === 'coktan_secmeli' ? (
                        <div
                          className="ak-choice-list"
                          role="group"
                          aria-labelledby={`ak-q-${soru.id}`}
                        >
                          {(soru.secenekler || []).map((sec) => {
                            const checked = String(answers[soru.id] || '') === String(sec.id);
                            return (
                              <button
                                key={sec.id}
                                type="button"
                                className={`ak-choice${checked ? ' is-checked' : ''}`}
                                disabled={participated}
                                aria-pressed={checked}
                                onClick={() => toggleChoice(soru.id, sec.id)}
                              >
                                <span className="ak-choice__mark" aria-hidden="true">
                                  <i className={checked ? 'fas fa-check-circle' : 'far fa-circle'} />
                                </span>
                                <span className="ak-choice__text">{sec.secenek_metni}</span>
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        <textarea
                          value={answers[soru.id] || ''}
                          disabled={participated}
                          rows={4}
                          placeholder="Cevabınızı yazın…"
                          onChange={(e) => onTextChange(soru.id, e.target.value)}
                        />
                      )}
                    </section>
                  );
                })}

                <div className="ak-join__actions">
                  {!participated && (
                    <button
                      type="submit"
                      className="ak-join__submit"
                      disabled={busy || !personelOk}
                      title={
                        !allDone
                          ? 'Tüm soruları yanıtlamadan gönderemezsiniz'
                          : undefined
                      }
                    >
                      <i className="fas fa-check" aria-hidden="true" />
                      {busy ? 'Kaydediliyor…' : 'Katılımı Gönder'}
                    </button>
                  )}
                  <Link to="/anketler" className="ak-join__cancel">
                    {participated ? 'Listeye dön' : 'İptal'}
                  </Link>
                </div>
              </form>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
