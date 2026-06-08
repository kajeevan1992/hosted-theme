import React, { useEffect, useMemo, useState } from 'react';
import { getStorefrontSeo } from './seo/storefrontSeo';

const BRAND = {
  bg: '#F7F8FC',
  panel: '#FFFFFF',
  soft: '#FBFCFE',
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  accent: '#7B3FE4',
  green: '#0F7A3B',
  amber: '#8A5A0A',
};

function isPublicSeoPage(meta) {
  if (!meta || !meta.title) return false;
  const status = String(meta.status || 'published');
  if (!['published', 'fallback'].includes(status) && !meta.staticRendered && !meta.fromStaticHtml) return false;
  if (meta.noIndex || String(meta.robots || '').toLowerCase().includes('noindex')) return false;
  return true;
}

function splitIntro(copy) {
  return String(copy || '').split(/\n{2,}|\r\n{2,}/).map((item) => item.trim()).filter(Boolean);
}

function metadataNote(meta) {
  const metadata = meta?.metadata || {};
  return metadata.locationTruthRule || metadata.collectionTruth || metadata.collectionNote || '';
}

function safeLinks(meta) {
  const links = Array.isArray(meta?.internalLinks) ? meta.internalLinks.filter((link) => link?.label && link?.href) : [];
  if (links.length) return links;
  const product = meta?.productName ? [{ label: `Order ${meta.productName}`, href: productOrderPath(meta) }] : [];
  return [
    ...product,
    { label: 'All products', href: '/all-products' },
    { label: 'Upload artwork', href: '/artwork-upload' },
    { label: 'Request a quote', href: '/bespoke-quote' },
    { label: 'Collection options', href: '/locations' },
  ];
}

function productOrderPath(meta) {
  const metadata = meta?.metadata || {};
  if (metadata.sourceProductPath) return metadata.sourceProductPath;
  const product = String(meta?.productName || '').toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  if (product.includes('business-card')) return '/standard-business-cards';
  if (product.includes('flyer') || product.includes('leaflet')) return '/flyers';
  if (product.includes('poster')) return '/posters-large-format-prints';
  if (product.includes('booklet') || product.includes('brochure')) return '/booklets';
  if (product.includes('banner')) return '/banners';
  return '/all-products';
}

function pageTypeLabel(meta) {
  const type = String(meta?.pageType || 'seo-page');
  if (type === 'product-location') return 'Product + local area';
  if (type === 'collection-point') return 'Collection point';
  if (type === 'service-area') return 'Service area';
  if (type === 'location') return 'Holo Print location';
  if (type === 'guide') return 'Print guide';
  if (type === 'product') return 'Print product';
  return type.replace(/-/g, ' ');
}

function pageIntroTitle(meta) {
  const type = String(meta?.pageType || '');
  if (type === 'product-location') return `Ordering ${meta.productName || 'print'} for ${meta.locationName || 'your area'}`;
  if (type === 'collection-point') return `Collection information for ${meta.locationName || 'this area'}`;
  if (type === 'service-area') return `How Holo Print supports ${meta.locationName || 'this area'}`;
  if (type === 'guide') return 'Helpful print guide';
  return 'About this service';
}

function buildSteps(meta) {
  const type = String(meta?.pageType || '');
  if (type === 'guide') {
    return [
      ['Read the guide', 'Check artwork, file setup and production guidance before ordering.'],
      ['Choose the right product', 'Move from the guide to the matching print product or quote form.'],
      ['Upload or send artwork', 'Upload files during checkout or send them after placing the order.'],
      ['Approve and print', 'We confirm artwork, price and production route before printing.'],
    ];
  }
  if (type === 'collection-point') {
    return [
      ['Order online', 'Choose your print product and upload artwork or request design help.'],
      ['Select collection', `Use ${meta.locationName || 'the collection point'} if it is active for your order.`],
      ['Wait for ready confirmation', 'Only travel after the order is marked ready for collection.'],
      ['Collect with confirmation', 'Bring your order confirmation, email, PIN or QR code when collecting.'],
    ];
  }
  if (type === 'service-area') {
    return [
      ['Choose product or quote', 'Order standard products online or request a custom quote.'],
      ['Upload artwork', 'Send print-ready artwork or ask for help preparing files.'],
      ['Confirm delivery/collection', 'Checkout shows available delivery or future collection options.'],
      ['Production starts', 'We print after payment, artwork approval and production checks.'],
    ];
  }
  return [
    ['Choose your product', `Start with ${meta.productName || 'your print item'} and select the right options.`],
    ['Upload artwork', 'Upload print-ready PDFs or choose to send artwork later.'],
    ['Pick collection/delivery', `Choose delivery or local collection where available${meta.locationName ? ` for ${meta.locationName}` : ''}.`],
    ['Approve and pay', 'For custom jobs we confirm the quote before payment and production.'],
  ];
}

function buildHighlights(meta) {
  const type = String(meta?.pageType || '');
  const note = metadataNote(meta);
  const base = [
    ['Artwork support', 'Upload files during checkout or ask Holo Print to help prepare artwork.'],
    ['Clear VAT and pricing', 'The order flow keeps product, service and VAT details visible before submission.'],
    ['Quote-safe custom work', 'Manual review is available for bespoke sizes, signs, finishing and unusual jobs.'],
  ];
  if (type === 'collection-point') return [['Honest collection wording', note || 'Partner collection points are not shown as fake Holo Print branches.'], ['Ready confirmation first', 'Collection details are confirmed when the order is ready.'], ...base.slice(0, 2)];
  if (type === 'service-area') return [['Service area wording', note || 'This page describes support for the area, not a physical branch.'], ['Delivery and future collection', 'Available fulfilment options are shown during checkout.'], ...base.slice(0, 2)];
  if (type === 'location') return [['Real location page', note || 'This page is for a genuine Holo Print location.'], ['Collection available when ready', 'Orders can be collected when production confirms readiness.'], ...base.slice(0, 2)];
  if (type === 'guide') return [['Practical artwork advice', 'Use the guide to avoid delays and common print setup problems.'], ['Connects to order flow', 'Move from advice to product selection or custom quote.'], ...base.slice(0, 2)];
  return base;
}

function trustTone(meta) {
  const type = String(meta?.pageType || '');
  const note = metadataNote(meta);
  if (!note && !['collection-point', 'service-area', 'location'].includes(type)) return null;
  const real = type === 'location' || String(meta?.metadata?.googleBusinessEligible || '').toLowerCase() === 'true';
  return { real, text: note || (real ? 'This is a genuine Holo Print location.' : 'This is not presented as a Holo Print branch.') };
}

function navigateTo(navigate, href) {
  if (!href) return;
  if (href.startsWith('http')) window.location.href = href;
  else navigate(href);
}

function Shell({ children, narrow = false, style = {} }) {
  return <div style={{ maxWidth: narrow ? 980 : 1180, margin: '0 auto', padding: '0 20px', ...style }}>{children}</div>;
}

function Button({ children, onClick, variant = 'primary' }) {
  const primary = variant === 'primary';
  return <button onClick={onClick} style={{ border: primary ? 0 : `1px solid ${BRAND.line}`, background: primary ? BRAND.primary : '#fff', color: primary ? '#fff' : BRAND.ink, borderRadius: 999, padding: '13px 18px', fontSize: 13, fontWeight: 900, cursor: 'pointer', boxShadow: primary ? '0 14px 30px rgba(24,167,208,0.22)' : 'none' }}>{children}</button>;
}

function Card({ children, style = {} }) {
  return <article style={{ border: `1px solid ${BRAND.line}`, borderRadius: 24, background: BRAND.panel, padding: 24, boxShadow: '0 14px 34px rgba(15, 23, 42, 0.045)', ...style }}>{children}</article>;
}

function MiniCard({ title, body }) {
  return <div style={{ border: `1px solid ${BRAND.line}`, borderRadius: 18, background: BRAND.soft, padding: 16 }}><h3 style={{ margin: 0, fontSize: 15, color: BRAND.ink }}>{title}</h3><p style={{ margin: '8px 0 0', color: BRAND.muted, fontSize: 13, lineHeight: 1.7 }}>{body}</p></div>;
}

function ProductCta({ meta, navigate }) {
  const href = productOrderPath(meta);
  const label = meta.productName ? `Order ${meta.productName}` : 'Start an order';
  return <Button onClick={() => navigateTo(navigate, href)}>{label}</Button>;
}

function Hero({ meta, navigate }) {
  return <section style={{ padding: '34px 0 18px' }}><Shell><div style={{ display: 'grid', gap: 22, gridTemplateColumns: 'minmax(0,1.08fr) minmax(280px,0.52fr)', alignItems: 'stretch' }}>
    <Card style={{ borderRadius: 30, padding: 30 }}>
      <div style={{ color: BRAND.primary, fontSize: 11, fontWeight: 900, letterSpacing: '0.18em', textTransform: 'uppercase' }}>{pageTypeLabel(meta)}</div>
      <h1 style={{ margin: '10px 0 0', maxWidth: 820, fontSize: 44, lineHeight: 1.04, letterSpacing: '-0.055em', fontWeight: 900, color: BRAND.ink }}>{meta.h1 || meta.title}</h1>
      <p style={{ marginTop: 16, maxWidth: 780, color: BRAND.muted, fontSize: 15, lineHeight: 1.8 }}>{meta.metaDescription}</p>
      <div style={{ marginTop: 24, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <ProductCta meta={meta} navigate={navigate} />
        <Button variant="secondary" onClick={() => navigate('/bespoke-quote')}>Request a quote</Button>
        <Button variant="secondary" onClick={() => navigate('/artwork-upload')}>Upload artwork</Button>
      </div>
    </Card>
    <Card style={{ borderRadius: 28 }}>
      <div style={{ color: BRAND.accent, fontSize: 11, fontWeight: 900, letterSpacing: '0.16em', textTransform: 'uppercase' }}>Page focus</div>
      <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
        {meta.productName ? <Fact label="Product" value={meta.productName} /> : null}
        {meta.locationName ? <Fact label="Area" value={meta.locationName} /> : null}
        {meta.targetKeyword ? <Fact label="Keyword" value={meta.targetKeyword} /> : null}
        <Fact label="Page type" value={pageTypeLabel(meta)} />
      </div>
      {trustTone(meta) ? <TruthBox tone={trustTone(meta)} /> : null}
    </Card>
  </div></Shell></section>;
}

function Fact({ label, value }) {
  return <div style={{ border: `1px solid ${BRAND.line}`, borderRadius: 14, background: BRAND.soft, padding: '11px 12px' }}><div style={{ color: BRAND.muted, fontSize: 10, fontWeight: 900, letterSpacing: '0.14em', textTransform: 'uppercase' }}>{label}</div><div style={{ marginTop: 3, color: BRAND.ink, fontSize: 13, fontWeight: 800 }}>{value}</div></div>;
}

function TruthBox({ tone }) {
  if (!tone) return null;
  return <div style={{ marginTop: 14, border: `1px solid ${tone.real ? '#B7E8BF' : '#F2D79B'}`, borderRadius: 16, background: tone.real ? '#F0FFF3' : '#FFF8E8', color: tone.real ? BRAND.green : BRAND.amber, padding: 14, fontSize: 12, lineHeight: 1.7, fontWeight: 700 }}>{tone.text}</div>;
}

function IntroSection({ meta }) {
  const intro = splitIntro(meta.introCopy || meta.metaDescription);
  return <Shell style={{ paddingTop: 10 }}><div style={{ display: 'grid', gap: 18, gridTemplateColumns: 'minmax(0,1fr) minmax(280px,0.52fr)' }}>
    <Card>
      <h2 style={{ margin: 0, fontSize: 25, letterSpacing: '-0.035em', color: BRAND.ink }}>{pageIntroTitle(meta)}</h2>
      {(intro.length ? intro : [meta.metaDescription]).map((paragraph, index) => <p key={`${paragraph}-${index}`} style={{ color: BRAND.muted, fontSize: 14, lineHeight: 1.85 }}>{paragraph}</p>)}
    </Card>
    <Card>
      <h2 style={{ margin: 0, fontSize: 22, letterSpacing: '-0.03em', color: BRAND.ink }}>Why this helps</h2>
      <div style={{ marginTop: 16, display: 'grid', gap: 10 }}>{buildHighlights(meta).map(([title, body]) => <MiniCard key={title} title={title} body={body} />)}</div>
    </Card>
  </div></Shell>;
}

function StepsSection({ meta }) {
  const steps = buildSteps(meta);
  return <Shell style={{ paddingTop: 18 }}><Card><h2 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.035em', color: BRAND.ink }}>How it works</h2><div style={{ marginTop: 16, display: 'grid', gap: 12, gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))' }}>{steps.map(([title, body], index) => <div key={title} style={{ border: `1px solid ${BRAND.line}`, borderRadius: 18, background: BRAND.soft, padding: 16 }}><div style={{ width: 28, height: 28, borderRadius: 999, background: BRAND.primary, color: '#fff', display: 'grid', placeItems: 'center', fontSize: 12, fontWeight: 900 }}>{index + 1}</div><h3 style={{ margin: '12px 0 0', fontSize: 15, color: BRAND.ink }}>{title}</h3><p style={{ margin: '8px 0 0', color: BRAND.muted, fontSize: 13, lineHeight: 1.7 }}>{body}</p></div>)}</div></Card></Shell>;
}

function FaqSection({ faqs }) {
  if (!faqs.length) return null;
  return <Shell style={{ paddingTop: 18 }}><Card><h2 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.035em', color: BRAND.ink }}>Frequently asked questions</h2><div style={{ marginTop: 16, display: 'grid', gap: 12 }}>{faqs.map((item, index) => <div key={`${item.question}-${index}`} style={{ border: `1px solid ${BRAND.line}`, borderRadius: 16, background: BRAND.soft, padding: 16 }}><h3 style={{ margin: 0, fontSize: 15, color: BRAND.ink }}>{item.question}</h3><p style={{ margin: '8px 0 0', color: BRAND.muted, fontSize: 13, lineHeight: 1.7 }}>{item.answer}</p></div>)}</div></Card></Shell>;
}

function LinksSection({ meta, navigate }) {
  const links = safeLinks(meta).slice(0, 10);
  return <Shell style={{ paddingTop: 18, paddingBottom: 44 }}><Card><div style={{ display: 'flex', justifyContent: 'space-between', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}><div><h2 style={{ margin: 0, fontSize: 24, letterSpacing: '-0.035em', color: BRAND.ink }}>Continue from here</h2><p style={{ margin: '8px 0 0', color: BRAND.muted, fontSize: 13 }}>Use these links to move between related products, guides, locations and quote actions.</p></div><Button onClick={() => navigate('/all-products')}>Browse products</Button></div><div style={{ marginTop: 16, display: 'flex', flexWrap: 'wrap', gap: 10 }}>{links.map((link) => <button key={`${link.label}-${link.href}`} onClick={() => navigateTo(navigate, link.href || '/')} style={{ border: `1px solid ${BRAND.line}`, background: '#fff', borderRadius: 999, padding: '10px 14px', color: BRAND.ink, fontSize: 13, fontWeight: 800, cursor: 'pointer' }}>{link.label}</button>)}</div></Card></Shell>;
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

  const meta = state.meta;
  const faqs = useMemo(() => Array.isArray(meta?.faqItems) ? meta.faqItems : [], [meta]);

  if (state.loading) return fallback;
  if (!isPublicSeoPage(meta)) return fallback;

  return (
    <main style={{ backgroundColor: BRAND.bg, color: BRAND.ink, minHeight: '100vh' }}>
      <header style={{ borderBottom: `1px solid ${BRAND.line}`, background: '#fff', position: 'sticky', top: 0, zIndex: 20 }}>
        <Shell><div style={{ padding: '18px 0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{ border: 0, background: 'transparent', padding: 0, cursor: 'pointer', fontWeight: 900, fontSize: 30, letterSpacing: '-0.055em' }}>
            <span style={{ color: BRAND.primary }}>HOLO</span><span style={{ color: BRAND.ink }}>PRINT</span>
          </button>
          <nav style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {[['All Products', '/all-products'], ['Business Cards', '/standard-business-cards'], ['Flyers', '/flyers'], ['Locations', '/locations'], ['Quote', '/bespoke-quote']].map(([label, href]) => <button key={href} onClick={() => navigate(href)} style={{ border: `1px solid ${BRAND.line}`, background: '#fff', borderRadius: 999, padding: '9px 13px', fontSize: 12, fontWeight: 700, color: BRAND.ink, cursor: 'pointer' }}>{label}</button>)}
          </nav>
        </div></Shell>
      </header>
      {state.error ? <Shell style={{ paddingTop: 14 }}><div style={{ border: `1px solid ${BRAND.line}`, borderRadius: 14, background: '#fff', padding: 12, color: BRAND.muted, fontSize: 12 }}>Using available SEO content because live SEO lookup returned: {state.error}</div></Shell> : null}
      <Hero meta={meta} navigate={navigate} />
      <IntroSection meta={meta} />
      <StepsSection meta={meta} />
      <FaqSection faqs={faqs} />
      <LinksSection meta={meta} navigate={navigate} />
    </main>
  );
}
