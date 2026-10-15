import { useEffect, useMemo, useRef, useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import Seo from '../components/Seo.jsx';
import PageHeader from '../components/PageHeader.jsx';
import Section from '../components/Section.jsx';
import Photo from '../components/Photo.jsx';
import Alert from '../components/Alert.jsx';
import { hospital, displayName } from '../config/hospital.js';

// Shown only until authorised photographs are added to the config.
const PLACEHOLDER_SLOTS = [
  { label: 'Hospital exterior', category: 'Facility' },
  { label: 'Main reception', category: 'Reception' },
  { label: 'Waiting area', category: 'Reception' },
  { label: 'Laboratory', category: 'Medical facilities' },
  { label: 'Ward', category: 'Medical facilities' },
  { label: 'Medical equipment', category: 'Equipment' },
  { label: 'Pharmacy', category: 'Medical facilities' },
  { label: 'Grounds and parking', category: 'Facility' },
];

function Lightbox({ items, index, onClose, onMove }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
    const onKey = (e) => {
      if (e.key === 'ArrowRight') onMove(1);
      if (e.key === 'ArrowLeft') onMove(-1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onMove]);
  const item = items[index];
  return (
    <dialog ref={ref} className="lightbox" onClose={onClose} onClick={(e) => e.target === ref.current && ref.current.close()} aria-label={item.alt}>
      <figure>
        <img src={item.src} alt={item.alt} />
        <figcaption>{item.alt} <span className="muted">({index + 1} of {items.length})</span></figcaption>
      </figure>
      <button type="button" className="lightbox__close" onClick={() => ref.current.close()} aria-label="Close">
        <X size={22} aria-hidden="true" />
      </button>
      {items.length > 1 && (
        <>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={() => onMove(-1)} aria-label="Previous photo">
            <ChevronLeft size={26} aria-hidden="true" />
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={() => onMove(1)} aria-label="Next photo">
            <ChevronRight size={26} aria-hidden="true" />
          </button>
        </>
      )}
    </dialog>
  );
}

export default function Gallery() {
  const real = hospital.gallery;
  const usingPlaceholders = real.length === 0;
  const items = usingPlaceholders ? PLACEHOLDER_SLOTS : real;
  const categories = useMemo(() => ['All', ...new Set(items.map((i) => i.category).filter(Boolean))], [items]);
  const [cat, setCat] = useState('All');
  const [open, setOpen] = useState(null);
  const shown = cat === 'All' ? items : items.filter((i) => i.category === cat);

  return (
    <>
      <Seo title="Gallery" description={`Photos of ${displayName}: our facilities, reception and waiting areas.`} />
      <PageHeader title="Gallery" intro="A look at our facilities, reception and care areas." />
      <Section id="photos">
        {usingPlaceholders && (
          <Alert tone="info" title={hospital.draftMode ? 'Photo placeholders' : 'Photos coming soon'}>
            {hospital.draftMode ? (
              <>
                These tiles show where authorised hospital photographs will go. Add images to <code>public/images/gallery/</code> and list
                them under <code>gallery</code> in <code>src/config/hospital.js</code>. Do not include identifiable patients without consent.
              </>
            ) : (
              'Photographs of our facilities will be added here soon.'
            )}
          </Alert>
        )}
        {categories.length > 2 && (
          <div className="filter-chips" role="group" aria-label="Filter photos">
            {categories.map((c) => (
              <button key={c} type="button" className={`chip${c === cat ? ' is-active' : ''}`} aria-pressed={c === cat} onClick={() => setCat(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        <ul className="gallery-grid">
          {shown.map((item, i) => (
            <li key={item.src || item.label} data-reveal>
              {usingPlaceholders ? (
                <Photo label={item.label} ratio="4 / 3" />
              ) : (
                <button type="button" className="gallery-item" onClick={() => setOpen(i)} aria-label={`Open photo: ${item.alt}`}>
                  <Photo src={item.src} alt={item.alt} ratio="4 / 3" />
                </button>
              )}
            </li>
          ))}
        </ul>
      </Section>
      {open !== null && !usingPlaceholders && (
        <Lightbox
          items={shown}
          index={open}
          onClose={() => setOpen(null)}
          onMove={(d) => setOpen((i) => (i + d + shown.length) % shown.length)}
        />
      )}
    </>
  );
}
