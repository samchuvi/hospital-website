import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';
import Photo from './Photo.jsx';

// Shown until real photos are added to `carousel` in config/hospital.js.
const PLACEHOLDER_SLIDES = [
  { label: 'Hospital building', caption: 'Our hospital' },
  { label: 'Main reception', caption: 'Reception and waiting area' },
  { label: 'Laboratory', caption: 'Laboratory services' },
  { label: 'Patient ward', caption: 'Inpatient care' },
];

/**
 * Accessible, dependency-free image carousel.
 * - Auto-advances every `interval` ms; pauses on hover, keyboard focus,
 *   when the tab is hidden, and when the visitor presses Pause.
 * - No auto-play for visitors who prefer reduced motion.
 * - Swipe on touch screens, arrow keys when focused, dots to jump.
 */
export default function HeroCarousel({ slides, interval = 5000, ratio = '4 / 5', className = '' }) {
  const items = slides && slides.length ? slides : PLACEHOLDER_SLIDES;
  const count = items.length;
  const [index, setIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [hidden, setHidden] = useState(false);
  const touchX = useRef(null);

  const go = useCallback((i) => setIndex(((i % count) + count) % count), [count]);
  const next = useCallback(() => go(index + 1), [go, index]);
  const prev = useCallback(() => go(index - 1), [go, index]);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduceMotion(mq.matches);
    update();
    mq.addEventListener('change', update);
    const onVis = () => setHidden(document.hidden);
    document.addEventListener('visibilitychange', onVis);
    return () => {
      mq.removeEventListener('change', update);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, []);

  const autoplay = count > 1 && playing && !hovered && !focused && !reduceMotion && !hidden;

  useEffect(() => {
    if (!autoplay) return undefined;
    const t = setTimeout(next, interval);
    return () => clearTimeout(t);
  }, [autoplay, next, interval, index]);

  const onKeyDown = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev(); }
  };
  const onTouchStart = (e) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx < 0 ? next : prev)();
    touchX.current = null;
  };

  return (
    <section
      className={`carousel ${className}`}
      aria-roledescription="carousel"
      aria-label="Hospital photos"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocused(false)}
      onKeyDown={onKeyDown}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div className="carousel__viewport" style={{ aspectRatio: ratio }} aria-live={autoplay ? 'off' : 'polite'}>
        {items.map((s, i) => (
          <div
            key={s.src || s.label}
            className={`carousel__slide${i === index ? ' is-active' : ''}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`${i + 1} of ${count}${s.caption ? `: ${s.caption}` : ''}`}
            aria-hidden={i !== index}
          >
            <Photo src={s.src} alt={s.alt} label={s.label || s.caption} ratio={ratio} eager={i === 0} />
            {s.caption && <p className="carousel__caption">{s.caption}</p>}
          </div>
        ))}
      </div>

      {count > 1 && (
        <div className="carousel__controls">
          <button type="button" className="carousel__btn" onClick={prev} aria-label="Previous photo">
            <ChevronLeft size={18} aria-hidden="true" />
          </button>
          <div className="carousel__dots">
            {items.map((s, i) => (
              <button
                key={s.src || s.label}
                type="button"
                className={`carousel__dot${i === index ? ' is-active' : ''}`}
                onClick={() => go(i)}
                aria-label={`Show photo ${i + 1}`}
                aria-current={i === index ? 'true' : undefined}
              />
            ))}
          </div>
          <button type="button" className="carousel__btn" onClick={next} aria-label="Next photo">
            <ChevronRight size={18} aria-hidden="true" />
          </button>
          {!reduceMotion && (
            <button
              type="button"
              className="carousel__btn"
              onClick={() => setPlaying((p) => !p)}
              aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
            >
              {playing ? <Pause size={16} aria-hidden="true" /> : <Play size={16} aria-hidden="true" />}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
