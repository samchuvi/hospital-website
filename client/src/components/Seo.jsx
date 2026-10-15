import { useLocation } from 'react-router-dom';
import { hospital, displayName } from '../config/hospital.js';

/**
 * Per-page metadata. React 19 hoists <title>, <meta> and <link> into <head>.
 * While the site is in draft mode we ask search engines not to index it,
 * so placeholder content never appears in search results.
 */
export default function Seo({ title, description, image = '/og-image.png', noindex = false }) {
  const { pathname } = useLocation();
  const fullTitle = title ? `${title} | ${displayName}` : displayName;
  const base = hospital.siteUrl ? hospital.siteUrl.replace(/\/$/, '') : null;
  const url = base ? `${base}${pathname === '/' ? '/' : pathname}` : null;
  const imageUrl = base ? `${base}${image}` : image;

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {(hospital.draftMode || noindex) && <meta name="robots" content={hospital.draftMode ? 'noindex, nofollow' : 'noindex'} />}
      {url && <link rel="canonical" href={url} />}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={displayName} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={imageUrl} />
      {url && <meta property="og:url" content={url} />}
      <meta property="og:locale" content="en_UG" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
    </>
  );
}
