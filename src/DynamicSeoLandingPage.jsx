import React, { useEffect, useState } from 'react';
import { getStorefrontSeo } from './seo/storefrontSeo';

const BRAND = {
  bg: '#F7F8FC',
  panel: '#FFFFFF',
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  accent: '#7B3FE4',
};

function isPublicSeoPage(meta) {
  if (!meta || !meta.found) return false;
  if (meta.status && !['published', 'fallback'].includes(String(meta.status))) return false;
  if (meta.noIndex || String(meta.robots || '').includes('noindex')) return false;
  return true;
}

function splitIntro(copy) {
  return String(copy || '').split(/\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

export default function DynamicSeoLandingPage({ pathname, navigate, fallback = null }) {
  const [state, setState] = useState({ loading: true, meta: null, error: '' });

  useEffect(() => {
    let active = true;
    setState({ loading: true, meta: null, error: '' });
    getStorefrontSeo(pathname)
      .then((meta) => { if (active) setState({ loading: false, meta, error: '' }); })
      .catch((error) => { if (active) setState({ loading: false, meta: null, error: error?.message || 'SEO page failed to load.' }); });
    return () => { active = false; };
  }, [pathname]);

  if (state.loading) return fallback;
  if (!isPublicSeoPage(state.meta)) return fallback;

  const meta = state.meta;
  const intro = splitIntro(meta.introCopy || meta.metaDescription);
  const faqs = Array.isArray(meta.faqItems) ? meta.faqItems : [];
  const links = Array.isArray(meta.internalLinks) ? meta.internalLinks : [];
  const pageType = String(meta.pageType || 'seo page').replace(/-/g, ' ');

  return (
    <main style={{ backgroundColor: BRAND.bg, color: BRAND.ink, minHeight: '100vh' }}>
      <header style={{ borderBottom: `1px solid ${BRAND.line}`, background: '#fff' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '18px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', fontWeight: 900, fontSize: 30, letterSpacing: '-0.055em' }}>
            <span style={{ color: BRAND.primary }}>HOLO</span><span style={{ color: BRAND.ink }}>PRINT</span>
          </button>
          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['All Products', '/all-products'], ['Business Cards', '/standard-business-cards'], ['Flyers', '/flyers'], ['Quote', '/bespoke-quote']].map(([label, href]) => (
              <button key={href} onClick={() => navigate(href)} style={{ border: `1px solid ${BRAND.line}`, background: '#fff', borderRadius: 999, padding: '9px 13px', fontSize: 12, fontWeight: 700, color: BRAND.ink, cursor: 'pointer' }}>{label}</button>
            ))}
          </nav>
        </div>
      </header>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '34px 20px 18px' }}>
        <div style={{ display: 'grid', gap: 22, gridTemplateColumns: 'minmax(0,1.1fr) minmax(280px,0.55fr)', alignItems: 'start' }}>
          <article style={{ border: `1px solid ${BRAND.line}`, borderRadius: 28, background: BRAND.panel, padding: 28, boxShadow: '0 16px 40px rgba(15, 23, 42, 0.06)' }}>
            <div style={{ color: BRAND.primary, fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{pageType}</div>
            <h1 style={{ margin: '10px 0 0', maxWidth: 780, fontSize: 44, lineHeight: 1.04, letterSpacing: '-0.055em', fontWeight: 900 }}>{meta.h1 || meta.title}</h1>
            <p style={{ marginTop: 16, maxWidth: 760, color: BRAND.muted, fontSize: 15, lineHeight: 1.8 }}>{meta.metaDescription}</p>
            <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <button onClick={() => navigate('/all-products')} style={{ border: 0, background: BRAND.primary, color: '#fff', borderRadius: 999, padding: '13px 18px', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>Browse products</button>
              <button onClick={() => navigate('/bespoke-quote')} style={{ border: `1px solid ${BRAND.line}`, background: '#fff', color: BRAND.ink, borderRadius: 999, padding: '13px 18px', fontSize: 13, fontWeight: 900, cursor: 'pointer' }}>Request a quote</button>
            </div>
          </article>

          <aside style={{ border: `1px solid ${BRAND.line}`, borderRadius: 24, background: '#fff', padding: 22, boxShadow: '0 14px 34px rgba(15, 23, 42, 0.045)' }}>
            <div style={{ color: BRAND.accent, fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Useful links</div>
            <div style={{ marginTop: 14, display: 'grid', gap: 8 }}>
              {(links.length ? links : [{ label: 'All products', href: '/all-products' }, { label: 'Upload artwork', href: '/artwork-upload' }, { label: 'Custom quote', href: '/bespoke-quote' }]).slice(0, 6).map((link) => (
                <button key={`${link.label}-${link.href}`} onClick={() => navigate(link.href || '/')} style={{ textAlign: 'left', border: `1px solid ${BRAND.line}`, background: '#FBFCFE', borderRadius: 14, padding: '12px 13px', color: BRAND.ink, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>{link.label}</button>
              ))}
            </div>
            {meta.locationName ? <p style={{ marginTop: 16, color: BRAND.muted, fontSize: 12, lineHeight: 1.7 }}>Location focus: <strong style={{ color: BRAND.ink }}>{meta.locationName}</strong></p> : null}
            {meta.productName ? <p style={{ marginTop: 6, color: BRAND.muted, fontSize: 12, lineHeight: 1.7 }}>Product focus: <strong style={{ color: BRAND.ink }}>{meta.productName}</strong></p> : null}
          </aside>
        </div>
      </section>

      <section style={{ maxWidth: 1180, margin: '0 auto', padding: '10px 20px 34px' }}>
        <div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0,1fr) minmax(280px,0.55fr)' }}>
          <article style={{ border: `1px solid ${BRAND.line}`, borderRadius: 24, background: '#fff', padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.035em' }}>About this service</h2>
            {(intro.length ? intro : [meta.metaDescription]).map((paragraph) => (
              <p key={paragraph} style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.8 }}>{paragraph}</p>
            ))}
          </article>

          <article style={{ border: `1px solid ${BRAND.line}`, borderRadius: 24, background: '#fff', padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 22, letterSpacing: '-0.03em' }}>Quick actions</h2>
            <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>
              {[['Start an order', '/all-products'], ['Upload artwork', '/artwork-upload'], ['Get help with design', '/bespoke-quote']].map(([label, href]) => (
                <button key={href} onClick={() => navigate(href)} style={{ border: `1px solid ${BRAND.line}`, background: '#F8FBFC', borderRadius: 14, padding: '12px 13px', textAlign: 'left', fontWeight: 800, color: BRAND.ink, cursor: 'pointer' }}>{label}</button>
              ))}
            </div>
          </article>
        </div>
      </section>

      {faqs.length ? (
        <section style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px 44px' }}>
          <article style={{ border: `1px solid ${BRAND.line}`, borderRadius: 24, background: '#fff', padding: 24 }}>
            <h2 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.035em' }}>Frequently asked questions</h2>
            <div style={{ marginTop: 16, display: 'grid', gap: 12 }}>
              {faqs.map((item) => (
                <div key={item.question} style={{ border: `1px solid ${BRAND.line}`, borderRadius: 16, background: '#FBFCFE', padding: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 15 }}>{item.question}</h3>
                  <p style={{ margin: '8px 0 0', color: BRAND.muted, fontSize: 13, lineHeight: 1.7 }}>{item.answer}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      ) : null}
    </main>
  );
}
