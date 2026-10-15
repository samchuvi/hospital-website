export default function Section({ id, eyebrow, title, intro, tone, align, children, className = '', headingLevel = 2 }) {
  const H = `h${headingLevel}`;
  return (
    <section id={id} className={`section${tone ? ` section--${tone}` : ''} ${className}`} aria-labelledby={id ? `${id}-title` : undefined}>
      <div className="container">
        {(title || eyebrow) && (
          <header className={`section__head${align === 'center' ? ' section__head--center' : ''}`} data-reveal>
            {eyebrow && <p className="eyebrow">{eyebrow}</p>}
            {title && <H id={id ? `${id}-title` : undefined} className="section__title">{title}</H>}
            {intro && <p className="section__intro">{intro}</p>}
          </header>
        )}
        {children}
      </div>
    </section>
  );
}
