import { useEffect } from 'react';

// Adds a gentle fade-up to elements marked with `data-reveal` as they scroll
// into view. Skipped entirely when the user prefers reduced motion.
export function useRevealOnScroll(key) {
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const els = () => document.querySelectorAll('[data-reveal]:not(.is-revealed)');
    if (reduce || !('IntersectionObserver' in window)) {
      els().forEach((el) => el.classList.add('is-revealed'));
      return undefined;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-revealed');
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    );
    const observeAll = () => els().forEach((el) => io.observe(el));
    observeAll();
    // Lazy-loaded pages render a moment later; observe new nodes too.
    const mo = new MutationObserver(observeAll);
    mo.observe(document.getElementById('main') || document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [key]);
}
