import { useState } from 'react';
import { Camera } from 'lucide-react';

/**
 * Shows an authorised hospital photograph when `src` is provided.
 * Otherwise (or if the image fails to load) shows a tasteful, clearly
 * labelled placeholder so the layout never has broken images.
 */
export default function Photo({ src, alt = '', label, ratio = '4 / 3', className = '', eager = false, sizes }) {
  const [failed, setFailed] = useState(false);
  const style = { aspectRatio: ratio };

  if (src && !failed) {
    return (
      <div className={`photo ${className}`} style={style}>
        <img
          src={src}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          sizes={sizes}
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div className={`photo photo--placeholder ${className}`} style={style} role="img" aria-label={`Photo placeholder: ${label || alt || 'hospital photograph'}`}>
      <div className="photo__pattern" aria-hidden="true" />
      <div className="photo__caption" aria-hidden="true">
        <Camera size={22} strokeWidth={1.6} />
        <span className="photo__label">{label || alt || 'Hospital photograph'}</span>
        <span className="photo__hint">Replace with an authorised photo</span>
      </div>
    </div>
  );
}
