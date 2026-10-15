import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export default function PageHeader({ title, intro, crumb, children }) {
  return (
    <section className="page-header">
      <div className="container">
        <nav aria-label="Breadcrumb" className="breadcrumb">
          <ol>
            <li>
              <Link to="/">Home</Link>
              <ChevronRight size={14} aria-hidden="true" />
            </li>
            <li aria-current="page">{crumb || title}</li>
          </ol>
        </nav>
        <h1>{title}</h1>
        {intro && <p className="page-header__intro">{intro}</p>}
        {children}
      </div>
    </section>
  );
}
