/*
 * Medya yardımcıları — React MediaFrame.jsx ve YoutubeThumb.jsx birebir karşılıkları.
 * HTML string yerine DOM öğesi döndürürler (hata zinciri için event gerekir).
 */
(function () {
  'use strict';

  /**
   * Görselleri çerçeveye sığdırır (object-fit: cover).
   * forceContain: blur kenarlı tam görünsün; forceCover: kırparak doldur.
   * options: { src, alt, className, dark, cover, forceCover, forceContain, imgClassName, eager }
   */
  function mediaFrame(options) {
    options = options || {};
    var src = options.src;
    if (!src) return null;

    var className = options.className || '';
    var dark = Boolean(options.dark);
    var cover = true;
    if (options.forceContain || options.cover === false) cover = false;
    else if (options.forceCover || options.cover === true) cover = true;

    var loading = options.eager ? 'eager' : 'lazy';
    var isAbsolute = /\babsolute\b/.test(className);

    var frame = document.createElement('div');
    frame.className = ['media-frame', dark ? 'media-frame--dark' : '', className]
      .filter(Boolean)
      .join(' ');

    if (isAbsolute) {
      frame.style.position = 'absolute';
      frame.style.inset = '0';
    } else {
      frame.style.position = 'relative';
    }
    frame.style.width = '100%';
    frame.style.height = '100%';

    function baseImgStyle(img) {
      img.style.position = 'absolute';
      img.style.inset = '0';
      img.style.display = 'block';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.maxWidth = 'none';
      img.style.maxHeight = 'none';
      img.style.margin = '0';
      img.style.padding = '0';
      img.style.border = '0';
      img.style.objectFit = cover ? 'cover' : 'contain';
      img.style.objectPosition = 'center center';
      img.style.imageRendering = 'auto';
    }

    if (!cover) {
      var blur = document.createElement('img');
      blur.src = src;
      blur.alt = '';
      blur.setAttribute('aria-hidden', 'true');
      blur.className = 'media-blur';
      blur.loading = loading;
      blur.decoding = 'async';
      baseImgStyle(blur);
      blur.style.objectFit = 'cover';
      blur.style.transform = 'scale(1.15)';
      blur.style.filter = dark
        ? 'blur(18px) brightness(0.55) saturate(1.05)'
        : 'blur(18px) brightness(0.92) saturate(1.05)';
      blur.style.zIndex = '0';
      blur.style.pointerEvents = 'none';
      blur.style.userSelect = 'none';
      frame.appendChild(blur);
    }

    var img = document.createElement('img');
    img.src = src;
    img.alt = options.alt || '';
    img.className = ('media-img ' + (cover ? 'media-img--cover' : '') + ' ' + (options.imgClassName || '')).trim();
    img.loading = loading;
    img.decoding = 'async';
    baseImgStyle(img);
    img.style.zIndex = '1';
    frame.appendChild(img);

    return frame;
  }

  /**
   * YouTube kapak görseli — maxres → sd → hq zinciri.
   * hq/sd 4:3 ve siyah şeritli olduğu için hafif scale ile kırpılır.
   * options: { youtubeId, thumbnail, alt, className, imgClassName }
   */
  function youtubeThumb(options) {
    options = options || {};
    var id = String(options.youtubeId || '').trim();
    var className = options.className || '';
    var imgClassName = options.imgClassName || '';

    var sources = [];
    if (id) {
      sources.push(
        'https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg',
        'https://i.ytimg.com/vi/' + id + '/sddefault.jpg',
        'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg'
      );
    }
    if (options.thumbnail && sources.indexOf(options.thumbnail) === -1) {
      sources.push(options.thumbnail);
    }

    if (!sources.length) {
      var empty = document.createElement('div');
      empty.className = ('flex items-center justify-center bg-[#dce6ed] text-[#022842]/35 ' + className).trim();
      empty.setAttribute('aria-hidden', 'true');
      empty.innerHTML = '<span class="material-symbols-outlined text-4xl">smart_display</span>';
      return empty;
    }

    var wrap = document.createElement('div');
    wrap.className = ('youtube-thumb ' + className).trim();
    if (/\babsolute\b/.test(className)) {
      wrap.style.position = 'absolute';
      wrap.style.inset = '0';
      wrap.style.width = '100%';
      wrap.style.height = '100%';
    }

    var index = 0;

    function setImage() {
      var src = sources[index];
      var isLetterboxed =
        src.indexOf('/hqdefault.') !== -1 ||
        src.indexOf('/sddefault.') !== -1 ||
        src.indexOf('/default.') !== -1;

      var img = document.createElement('img');
      img.src = src;
      img.alt = options.alt || '';
      img.loading = 'lazy';
      img.decoding = 'async';
      img.className = (
        'youtube-thumb__img ' +
        (isLetterboxed ? 'youtube-thumb__img--letterbox' : '') +
        ' ' +
        imgClassName
      ).trim();

      var advance = function () {
        if (index + 1 < sources.length) {
          index += 1;
          wrap.innerHTML = '';
          setImage();
        }
      };

      img.addEventListener('error', advance);
      img.addEventListener('load', function () {
        // maxres yoksa YouTube çoğu zaman 120x90 placeholder döner (HTTP 200).
        if (img.naturalWidth > 0 && img.naturalWidth <= 120) {
          advance();
        }
      });

      wrap.appendChild(img);
    }

    setImage();
    return wrap;
  }

  window.Media = {
    frame: mediaFrame,
    youtubeThumb: youtubeThumb,
  };
})();
