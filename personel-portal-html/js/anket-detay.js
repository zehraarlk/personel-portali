/*
 * Anket Detay — React frontend/src/pages/AnketDetay.jsx birebir portu.
 * Detay id'si URL'den (?id=) okunur: Portal.param('id').
 */
(function () {
  'use strict';

  var id = '';

  /* useState karşılıkları */
  var anket = null;
  var sorular = [];
  var participated = false;
  var answers = {};
  var missing = new Set();
  var loading = true;
  var busy = false;
  var error = '';
  var okMsg = '';
  var personelOk = false;

  /* DOM referansları (render sırasında doldurulur) */
  var pageEl = null;
  var backLink = null;
  var alertEls = [];
  var heroEl = null;
  var formEl = null;
  var progressEl = null;
  var progressBarEl = null;
  var progressCountEl = null;
  var hintEl = null;
  var submitBtn = null;
  var submitLabelNode = null;
  var qRefs = {};

  function isAnswered(soru, currentAnswers) {
    var val = currentAnswers[soru.id];
    if (soru.soru_tipi === 'coktan_secmeli') return Boolean(val);
    return Boolean(String(val || '').trim());
  }

  function answeredCount() {
    return sorular.reduce(function (n, s) {
      return n + (isAnswered(s, answers) ? 1 : 0);
    }, 0);
  }

  function isAllDone() {
    return sorular.length > 0 && answeredCount() === sorular.length;
  }

  /* —— Etkileşim (React handler portları) —— */

  function toggleChoice(soruId, secenekId) {
    if (participated) return;
    if (String(answers[soruId] || '') === String(secenekId)) {
      delete answers[soruId];
    } else {
      answers[soruId] = String(secenekId);
    }
    if (missing.has(soruId)) {
      missing.delete(soruId);
      updateQuestionMissing(soruId);
    }
    setError('');
    updateChoices(soruId);
    updateProgressUI();
  }

  function onTextChange(soruId, value) {
    answers[soruId] = value;
    if (String(value || '').trim()) {
      if (missing.has(soruId)) {
        missing.delete(soruId);
        updateQuestionMissing(soruId);
      }
    }
    setError('');
    updateProgressUI();
  }

  function setError(msg) {
    if (error === msg) return;
    error = msg;
    updateAlerts();
  }

  function setOkMsg(msg) {
    if (okMsg === msg) return;
    okMsg = msg;
    updateAlerts();
  }

  function onSubmit(e) {
    e.preventDefault();
    if (participated || busy) return;
    setOkMsg('');

    if (!personelOk || !Session.getPersonelId()) {
      setError('Ankete katılmak için personel hesabıyla giriş yapmalısınız.');
      pageEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    var eksik = sorular
      .filter(function (s) {
        return !isAnswered(s, answers);
      })
      .map(function (s) {
        return s.id;
      });
    if (eksik.length > 0) {
      missing = new Set(eksik);
      sorular.forEach(function (s) {
        updateQuestionMissing(s.id);
      });
      setError('Lütfen tüm soruları yanıtlayın. Eksik soru: ' + eksik.length + ' / ' + sorular.length);
      var first = document.getElementById('ak-q-block-' + eksik[0]);
      if (first) first.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setError('');
    missing = new Set();
    sorular.forEach(function (s) {
      updateQuestionMissing(s.id);
    });
    busy = true;
    updateSubmitButton();

    var payload = {};
    sorular.forEach(function (s) {
      var val = answers[s.id];
      if (s.soru_tipi === 'coktan_secmeli') {
        payload[s.id] = Number(val || 0);
      } else {
        payload[s.id] = String(val || '').trim();
      }
    });

    Api.submitAnket(id, payload)
      .then(function (res) {
        okMsg = (res && res.message) || 'Katılımınız kaydedildi.';
        participated = true;
        setTimeout(function () {
          Portal.goto('/anketler');
        }, 1200);
        busy = false;
        render();
      })
      .catch(function (ex) {
        error = (ex && ex.message) || 'Katılım kaydedilemedi.';
        busy = false;
        render();
      });
  }

  /* —— Hedefli DOM güncellemeleri (React yeniden boyamasının karşılığı) —— */

  function updateChoices(soruId) {
    var ref = qRefs[soruId];
    if (!ref) return;
    ref.choices.forEach(function (c) {
      var checked = String(answers[soruId] || '') === String(c.secenekId);
      c.btn.className = 'ak-choice' + (checked ? ' is-checked' : '');
      c.btn.setAttribute('aria-pressed', checked ? 'true' : 'false');
      c.iconEl.className = checked ? 'fas fa-check-circle' : 'far fa-circle';
    });
  }

  function updateQuestionMissing(soruId) {
    var ref = qRefs[soruId];
    if (!ref) return;
    var isMissing = missing.has(soruId);
    ref.section.className = 'ak-question' + (isMissing ? ' is-missing' : '');
    if (isMissing) {
      if (!ref.warnEl.parentNode) ref.section.insertBefore(ref.warnEl, ref.titleEl.nextSibling);
    } else if (ref.warnEl.parentNode) {
      ref.warnEl.parentNode.removeChild(ref.warnEl);
    }
  }

  function updateProgressUI() {
    if (participated || !formEl) return;
    var answered = answeredCount();
    var pct = sorular.length > 0 ? Math.round((answered / sorular.length) * 100) : 0;
    var allDone = isAllDone();
    if (progressBarEl) progressBarEl.style.width = pct + '%';
    if (progressCountEl) progressCountEl.textContent = answered + ' / ' + sorular.length;
    if (hintEl && progressEl) {
      if (!allDone) {
        if (!hintEl.parentNode) formEl.insertBefore(hintEl, progressEl.nextSibling);
      } else if (hintEl.parentNode) {
        hintEl.parentNode.removeChild(hintEl);
      }
    }
    updateSubmitButton();
  }

  function updateSubmitButton() {
    if (!submitBtn) return;
    submitBtn.disabled = busy || !personelOk;
    if (!isAllDone()) {
      submitBtn.title = 'Tüm soruları yanıtlamadan gönderemezsiniz';
    } else {
      submitBtn.removeAttribute('title');
    }
    if (submitLabelNode) {
      submitLabelNode.textContent = busy ? 'Kaydediliyor…' : 'Katılımı Gönder';
    }
  }

  function buildAlerts() {
    var esc = Portal.escapeHtml;
    var els = [];

    if (!personelOk && !participated) {
      var lockEl = document.createElement('p');
      lockEl.className = 'ak-join__error';
      lockEl.setAttribute('role', 'alert');
      lockEl.innerHTML =
        '<i class="fas fa-user-lock" aria-hidden="true"></i>' +
        'Ankete katılmak için personel hesabıyla giriş yapın. Yönetici oturumu yeterli değildir.';
      els.push(lockEl);
    }
    if (participated) {
      var doneEl = document.createElement('p');
      doneEl.className = 'ak-join__alert';
      doneEl.setAttribute('role', 'status');
      doneEl.innerHTML =
        '<i class="' + SiteIcons.icon('anketler') + '" aria-hidden="true"></i>' +
        'Bu ankete daha önce katıldınız. Yanıtlarınız salt okunur görüntüleniyor.';
      els.push(doneEl);
    }
    if (error) {
      var errEl = document.createElement('p');
      errEl.className = 'ak-join__error';
      errEl.setAttribute('role', 'alert');
      errEl.innerHTML =
        '<i class="fas fa-exclamation-triangle" aria-hidden="true"></i>' + esc(error);
      els.push(errEl);
    }
    if (okMsg) {
      var okEl = document.createElement('p');
      okEl.className = 'ak-join__ok';
      okEl.setAttribute('role', 'status');
      okEl.innerHTML = '<i class="fas fa-check-circle" aria-hidden="true"></i>' + esc(okMsg);
      els.push(okEl);
    }
    return els;
  }

  function updateAlerts() {
    if (!heroEl) return;
    alertEls.forEach(function (el) {
      if (el.parentNode) el.parentNode.removeChild(el);
    });
    alertEls = buildAlerts();
    alertEls.forEach(function (el) {
      pageEl.insertBefore(el, heroEl);
    });
  }

  /* —— Render —— */

  function buildHero() {
    var esc = Portal.escapeHtml;
    var hero = document.createElement('header');
    hero.className = 'ak-join__hero';
    var html =
      '<span class="ak-join__hero-icon" aria-hidden="true">' +
      '<i class="' + SiteIcons.icon('anketler') + '"></i>' +
      '</span>' +
      '<div class="ak-join__hero-copy">' +
      '<p class="ak-join__kicker">' + (participated ? 'Cevaplarınız' : 'Ankete Katıl') + '</p>' +
      '<h1>' + esc(anket.baslik) + '</h1>' +
      (anket.aciklama ? '<p>' + esc(anket.aciklama) + '</p>' : '') +
      '</div>';
    if (sorular.length > 0) {
      html +=
        '<div class="ak-join__stat" aria-label="Soru sayısı">' +
        '<strong>' + sorular.length + '</strong>' +
        '<span>soru</span>' +
        '</div>';
    }
    hero.innerHTML = html;
    return hero;
  }

  function buildNoQuestions() {
    var state = document.createElement('div');
    state.className = 'ak-state';
    state.innerHTML =
      '<i class="' + SiteIcons.icon('anketler') + '" aria-hidden="true"></i>' +
      '<div>' +
      '<p><strong>Soru bulunamadı</strong></p>' +
      '<p>Bu ankete henüz soru eklenmemiş.</p>' +
      '</div>';
    return state;
  }

  function buildQuestion(soru, index) {
    var esc = Portal.escapeHtml;
    var tip = soru.soru_tipi || 'coktan_secmeli';
    var tipLabel = tip === 'acik_uclu' ? 'Açık uçlu' : 'Çoktan seçmeli';
    var isMissing = missing.has(soru.id);

    var section = document.createElement('section');
    section.id = 'ak-q-block-' + soru.id;
    section.className = 'ak-question' + (isMissing ? ' is-missing' : '');
    section.setAttribute('role', 'group');
    section.setAttribute('aria-labelledby', 'ak-q-' + soru.id);

    var head = document.createElement('div');
    head.className = 'ak-question__head';
    head.innerHTML =
      '<span class="ak-question__num">' + (index + 1) + ' / ' + sorular.length + '</span>' +
      '<span class="ak-question__type">' + tipLabel + '</span>';
    section.appendChild(head);

    var title = document.createElement('h2');
    title.className = 'ak-question__title';
    title.id = 'ak-q-' + soru.id;
    title.textContent = soru.soru_metni == null ? '' : soru.soru_metni;
    section.appendChild(title);

    var warn = document.createElement('p');
    warn.className = 'ak-question__warn';
    warn.textContent = 'Bu soruyu yanıtlamanız gerekiyor.';
    if (isMissing) section.appendChild(warn);

    var ref = { section: section, titleEl: title, warnEl: warn, choices: [] };
    qRefs[soru.id] = ref;

    if (tip === 'coktan_secmeli') {
      var list = document.createElement('div');
      list.className = 'ak-choice-list';
      list.setAttribute('role', 'group');
      list.setAttribute('aria-labelledby', 'ak-q-' + soru.id);
      (soru.secenekler || []).forEach(function (sec) {
        var checked = String(answers[soru.id] || '') === String(sec.id);
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'ak-choice' + (checked ? ' is-checked' : '');
        btn.disabled = participated;
        btn.setAttribute('aria-pressed', checked ? 'true' : 'false');
        var mark = document.createElement('span');
        mark.className = 'ak-choice__mark';
        mark.setAttribute('aria-hidden', 'true');
        var iconEl = document.createElement('i');
        iconEl.className = checked ? 'fas fa-check-circle' : 'far fa-circle';
        mark.appendChild(iconEl);
        btn.appendChild(mark);
        var text = document.createElement('span');
        text.className = 'ak-choice__text';
        text.innerHTML = esc(sec.secenek_metni);
        btn.appendChild(text);
        btn.addEventListener('click', function () {
          toggleChoice(soru.id, sec.id);
        });
        list.appendChild(btn);
        ref.choices.push({ secenekId: sec.id, btn: btn, iconEl: iconEl });
      });
      section.appendChild(list);
    } else {
      var textarea = document.createElement('textarea');
      textarea.value = answers[soru.id] || '';
      textarea.disabled = participated;
      textarea.rows = 4;
      textarea.placeholder = 'Cevabınızı yazın…';
      textarea.addEventListener('input', function () {
        onTextChange(soru.id, textarea.value);
      });
      section.appendChild(textarea);
    }

    return section;
  }

  function buildForm() {
    var form = document.createElement('form');
    form.className = 'ak-join-form' + (participated ? ' is-readonly' : '');
    form.noValidate = true;
    form.addEventListener('submit', onSubmit);

    var answered = answeredCount();
    var pct = sorular.length > 0 ? Math.round((answered / sorular.length) * 100) : 0;
    var allDone = isAllDone();

    if (!participated) {
      progressEl = document.createElement('div');
      progressEl.className = 'ak-join__progress';
      var label = document.createElement('span');
      label.textContent = 'İlerleme';
      progressEl.appendChild(label);
      var track = document.createElement('div');
      track.className = 'ak-join__progress-track';
      progressBarEl = document.createElement('div');
      progressBarEl.className = 'ak-join__progress-bar';
      progressBarEl.style.width = pct + '%';
      track.appendChild(progressBarEl);
      progressEl.appendChild(track);
      progressCountEl = document.createElement('span');
      progressCountEl.textContent = answered + ' / ' + sorular.length;
      progressEl.appendChild(progressCountEl);
      form.appendChild(progressEl);

      hintEl = document.createElement('p');
      hintEl.className = 'ak-join__hint';
      hintEl.setAttribute('role', 'status');
      hintEl.textContent =
        'Göndermek için tüm soruları yanıtlayın. Seçili bir şıkka tekrar tıklayarak seçimi kaldırabilirsiniz.';
      if (!allDone) form.appendChild(hintEl);
    }

    sorular.forEach(function (soru, index) {
      form.appendChild(buildQuestion(soru, index));
    });

    var actions = document.createElement('div');
    actions.className = 'ak-join__actions';
    if (!participated) {
      submitBtn = document.createElement('button');
      submitBtn.type = 'submit';
      submitBtn.className = 'ak-join__submit';
      submitBtn.disabled = busy || !personelOk;
      if (!allDone) submitBtn.title = 'Tüm soruları yanıtlamadan gönderemezsiniz';
      var checkIcon = document.createElement('i');
      checkIcon.className = 'fas fa-check';
      checkIcon.setAttribute('aria-hidden', 'true');
      submitBtn.appendChild(checkIcon);
      submitLabelNode = document.createTextNode(busy ? 'Kaydediliyor…' : 'Katılımı Gönder');
      submitBtn.appendChild(submitLabelNode);
      actions.appendChild(submitBtn);
    }
    var cancel = document.createElement('a');
    cancel.href = Portal.href('/anketler');
    cancel.className = 'ak-join__cancel';
    cancel.textContent = participated ? 'Listeye dön' : 'İptal';
    actions.appendChild(cancel);
    form.appendChild(actions);

    return form;
  }

  function render() {
    while (backLink.nextSibling) {
      pageEl.removeChild(backLink.nextSibling);
    }
    alertEls = [];
    heroEl = null;
    formEl = null;
    progressEl = null;
    progressBarEl = null;
    progressCountEl = null;
    hintEl = null;
    submitBtn = null;
    submitLabelNode = null;
    qRefs = {};

    if (loading) {
      var loadingEl = document.createElement('div');
      loadingEl.className = 'ak-state';
      loadingEl.textContent = 'Yükleniyor…';
      pageEl.appendChild(loadingEl);
      return;
    }

    if (error && !anket) {
      var errState = document.createElement('div');
      errState.className = 'ak-state is-error';
      errState.textContent = error;
      pageEl.appendChild(errState);
      return;
    }

    if (!anket) return;

    personelOk = Session.isPersonelLoggedIn();
    heroEl = buildHero();
    alertEls = buildAlerts();
    alertEls.forEach(function (el) {
      pageEl.appendChild(el);
    });
    pageEl.appendChild(heroEl);

    if (sorular.length === 0) {
      pageEl.appendChild(buildNoQuestions());
    } else {
      formEl = buildForm();
      pageEl.appendChild(formEl);
    }
  }

  function init() {
    id = Portal.param('id');
    pageEl = document.querySelector('.anketler-page.ak-join');
    backLink = pageEl.querySelector('.ak-join__back');
    backLink.href = Portal.href('/anketler');
    personelOk = Session.isPersonelLoggedIn();

    SiteIcons.load().then(function () {
      render();
    });

    loading = true;
    error = '';
    Api.fetchAnketDetail(id)
      .then(function (data) {
        anket = (data && data.anket) || null;
        sorular = data && Array.isArray(data.sorular) ? data.sorular : [];
        participated = Boolean(data && (data.participated || data.katildi_mi));
        answers = {};
        sorular.forEach(function (s) {
          if (s.soru_tipi === 'coktan_secmeli') {
            if (s.cevap_secenek_id) answers[s.id] = String(s.cevap_secenek_id);
          } else if (s.cevap_metni) {
            answers[s.id] = s.cevap_metni;
          }
        });
        missing = new Set();
      })
      .catch(function (ex) {
        error = (ex && ex.message) || 'Anket yüklenemedi.';
      })
      .finally(function () {
        loading = false;
        render();
      });
  }

  Portal.onReady(init);
})();
