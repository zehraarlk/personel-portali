/**
 * Görselleri çerçeveye sığdırır (object-fit: cover).
 * forceContain: blur kenarlı tam görünsün; forceCover: kırparak doldur.
 */
export default function MediaFrame({
  src,
  alt = '',
  className = '',
  dark = false,
  cover: coverProp,
  forceCover = false,
  forceContain = false,
  imgClassName = '',
  eager = false,
}) {
  if (!src) return null;

  let cover = true;
  if (forceContain || coverProp === false) cover = false;
  else if (forceCover || coverProp === true) cover = true;

  const loading = eager ? 'eager' : 'lazy';
  const isAbsolute = /\babsolute\b/.test(className);
  const frameClass = ['media-frame', dark ? 'media-frame--dark' : '', className]
    .filter(Boolean)
    .join(' ');

  const frameStyle = isAbsolute
    ? { position: 'absolute', inset: 0, width: '100%', height: '100%' }
    : { position: 'relative', width: '100%', height: '100%' };

  const imgStyle = {
    position: 'absolute',
    inset: 0,
    display: 'block',
    width: '100%',
    height: '100%',
    maxWidth: 'none',
    maxHeight: 'none',
    margin: 0,
    padding: 0,
    border: 0,
    objectFit: cover ? 'cover' : 'contain',
    objectPosition: 'center center',
  };

  return (
    <div className={frameClass} style={frameStyle}>
      {!cover && (
        <img
          src={src}
          alt=""
          aria-hidden="true"
          className="media-blur"
          loading={loading}
          decoding="async"
          style={{
            ...imgStyle,
            objectFit: 'cover',
            transform: 'scale(1.15)',
            filter: dark
              ? 'blur(18px) brightness(0.55) saturate(1.05)'
              : 'blur(18px) brightness(0.92) saturate(1.05)',
            zIndex: 0,
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        />
      )}
      <img
        src={src}
        alt={alt}
        className={`media-img ${cover ? 'media-img--cover' : ''} ${imgClassName}`.trim()}
        loading={loading}
        decoding="async"
        style={{ ...imgStyle, zIndex: 1 }}
      />
    </div>
  );
}
