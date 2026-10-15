// Public routes. Also used to generate sitemap.xml at build time,
// so keep this file free of browser-only code.
export const routes = [
  { path: '/', label: 'Home', nav: true, priority: '1.0' },
  { path: '/about', label: 'About', nav: true, priority: '0.8' },
  { path: '/services', label: 'Services', nav: true, priority: '0.9' },
  { path: '/doctors', label: 'Our team', nav: true, priority: '0.7' },
  { path: '/gallery', label: 'Gallery', nav: true, priority: '0.5' },
  { path: '/faq', label: 'FAQ', nav: true, priority: '0.6' },
  { path: '/contact', label: 'Contact', nav: true, priority: '0.9' },
  { path: '/appointments', label: 'Request appointment', nav: false, priority: '0.9' },
  { path: '/privacy', label: 'Privacy policy', nav: false, priority: '0.3' },
];

export const navRoutes = routes.filter((r) => r.nav);
