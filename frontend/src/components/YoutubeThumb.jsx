import { useMemo, useState } from 'react';

/**
 * YouTube kapak görseli — maxres → sd → hq zinciri.
 * hq/sd 4:3 ve siyah şeritli olduğu için hafif scale ile kırpılır.
 */
export default function YoutubeThumb({
  youtubeId,
  thumbnail,
  alt = '',
  className = '',
  imgClassName = '',
}) {
  const sources = useMemo(() => {
    const id = (youtubeId || '').trim();
    const list = [];

    if (id) {
      list.push(
        `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
        `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
        `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      );
    }

    if (thumbnail && !list.includes(thumbnail)) {
      list.push(thumbnail);
    }

    return list;
  }, [youtubeId, thumbnail]);

  const [index, setIndex] = useState(0);
  const src = sources[index] || '';

  if (!src) {
    return (
      <div
        className={`flex items-center justify-center bg-[#dce6ed] text-[#022842]/35 ${className}`.trim()}
        aria-hidden="true"
      >
        <span className="material-symbols-outlined text-4xl">smart_display</span>
      </div>
    );
  }

  const isLetterboxed =
    src.includes('/hqdefault.') ||
    src.includes('/sddefault.') ||
    src.includes('/default.');

  const advance = () => {
    setIndex((prev) => (prev + 1 < sources.length ? prev + 1 : prev));
  };

  return (
    <div
      className={`youtube-thumb ${className}`.trim()}
      style={
        /\babsolute\b/.test(className)
          ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
          : undefined
      }
    >
      <img
        key={src}
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`youtube-thumb__img ${isLetterboxed ? 'youtube-thumb__img--letterbox' : ''} ${imgClassName}`.trim()}
        onError={advance}
        onLoad={(event) => {
          // maxres yoksa YouTube çoğu zaman 120x90 placeholder döner (HTTP 200).
          if (event.currentTarget.naturalWidth > 0 && event.currentTarget.naturalWidth <= 120) {
            advance();
          }
        }}
      />
    </div>
  );
}
