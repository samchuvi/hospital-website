import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import Seo from '../components/Seo.jsx';

export default function NotFound() {
  return (
    <>
      <Seo title="Page not found" description="The page you are looking for could not be found." noindex />
      <section className="not-found">
        <div className="container not-found__inner">
          <span className="not-found__icon"><Compass size={40} aria-hidden="true" /></span>
          <p className="eyebrow">Error 404</p>
          <h1>We couldn’t find that page</h1>
          <p>The page may have moved, or the link may be incorrect. These pages might help:</p>
          <div className="not-found__links">
            <Link to="/" className="btn btn--primary">Go to the home page</Link>
            <Link to="/services" className="btn btn--outline">Our services</Link>
            <Link to="/contact" className="btn btn--outline">Contact us</Link>
          </div>
        </div>
      </section>
    </>
  );
}
