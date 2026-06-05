import React, { useEffect } from 'react';
import { Check, Mail, MapPin, Phone, ShieldCheck, Upload } from 'lucide-react';

const BRAND = {
  bg: '#F7F8FC',
  panel: '#FFFFFF',
  line: '#E3E8F0',
  ink: '#161A22',
  muted: '#667487',
  primary: '#18A7D0',
  accent: '#7B3FE4',
};

const CONTACT = {
  name: 'HOLO PRINT',
  email: 'sales@holoprint.co.uk',
  phone: '020 3336 0322',
  website: 'holoprint.co.uk',
  area: 'Sidcup High Street',
  hours: 'Monday to Saturday, 9:00–17:30',
};

const DEFAULT_ADMIN_BASE_URL = import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || import.meta.env.VITE_ADMIN_BASE_URL || import.meta.env.VITE_INTERNAL_API_BASE || import.meta.env.VITE_API_URL || '';

const pageMeta = {
  '/contact': {
    title: 'Contact Holo Print | Printing in Sidcup',
    description: 'Contact Holo Print for business cards, flyers, leaflets, banners, signage, stickers, booklets and artwork help in Sidcup.',
  },
  '/artwork-guide': {
    title: 'Artwork Guide | Holo Print',
    description: 'Artwork setup guide for Holo Print orders including PDF, bleed, CMYK, resolution, fonts and cut line guidance.',
  },
  '/terms': {
    title: 'Terms and Conditions | Holo Print',
    description: 'Holo Print order, quote, artwork, payment, production and collection terms for online and in-store print orders.',
  },
  '/privacy': {
    title: 'Privacy Policy | Holo Print',
    description: 'How Holo Print handles customer details, artwork files, order information, payments and email communication.',
  },
};

function buildUrl(path, params = {}) {
  const base = DEFAULT_ADMIN_BASE_URL.replace(/\/$/, '');
  const url = new URL(`${base}${path}`, window.location.origin);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  return url.toString();
}

function ensureMeta(name, attr = 'name') {
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  return tag;
}

function ensureLink(rel) {
  let tag = document.querySelector(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement('link');
    tag.setAttribute('rel', rel);
    document.head.appendChild(tag);
  }
  return tag;
}

function applySeoMeta(meta, pathname) {
  const fallback = pageMeta[pathname] || {
    title: 'Holo Print | Design, Print, Sign and Web in Sidcup',
    description: 'Holo Print offers business cards, flyers, leaflets, banners, stickers, booklets, design support and local print services in Sidcup.',
  };
  const title = meta?.title || fallback.title;
  const description = meta?.metaDescription || meta?.description || fallback.description;
  const canonical = meta?.canonicalUrl || `https://holoprint.co.uk${pathname === '/' ? '' : pathname}`;
  const robots = meta?.robots || `${meta?.noIndex ? 'noindex' : 'index'},${meta?.noFollow ? 'nofollow' : 'follow'}`;
  document.title = title;
  ensureMeta('description').setAttribute('content', description);
  ensureMeta('robots').setAttribute('content', robots);
  ensureMeta('og:title', 'property').setAttribute('content', title);
  ensureMeta('og:description', 'property').setAttribute('content', description);
  ensureMeta('og:url', 'property').setAttribute('content', canonical);
  ensureLink('canonical').setAttribute('href', canonical);
  return { title, description, canonical, robots };
}

async function resolveSaasSeo(pathname) {
  if (typeof window === 'undefined') return null;
  try {
    const response = await fetch(buildUrl('/api/internal/seo/resolve', { path: pathname }), { credentials: 'include' });
    const payload = await response.json().catch(() => null);
    if (!response.ok || payload?.ok === false) return null;
    return payload?.data || null;
  } catch {
    return null;
  }
}

export function LaunchSeo({ pathname }) {
  useEffect(() => {
    let cancelled = false;
    applySeoMeta(null, pathname);
    resolveSaasSeo(pathname).then((meta) => {
      if (!cancelled && meta) applySeoMeta(meta, pathname);
    });
    return () => { cancelled = true; };
  }, [pathname]);
  return null;
}

function Shell({ children, narrow = false }) {
  return <div className={`mx-auto w-full px-4 sm:px-6 lg:px-8 ${narrow ? 'max-w-[980px]' : 'max-w-[1180px]'}`}>{children}</div>;
}

function Header({ navigate }) {
  return (
    <header className="border-b bg-white/95 backdrop-blur" style={{ borderColor: BRAND.line }}>
      <Shell>
        <div className="flex flex-col gap-4 py-5 md:flex-row md:items-center md:justify-between">
          <button onClick={() => navigate('/')} className="flex items-center gap-1 text-left">
            <span className="text-[36px] font-black tracking-[-0.055em]" style={{ color: BRAND.primary }}>HOLO</span>
            <span className="text-[36px] font-black tracking-[-0.055em]" style={{ color: BRAND.ink }}>PRINT</span>
          </button>
          <nav className="flex flex-wrap gap-2 text-[12px] font-bold uppercase tracking-[0.08em]">
            {[
              ['Products', '/all-products'],
              ['Artwork Guide', '/artwork-guide'],
              ['Contact', '/contact'],
              ['Account', '/account'],
            ].map(([label, path]) => <button key={path} onClick={() => navigate(path)} className="rounded-full border bg-white px-4 py-2" style={{ borderColor: BRAND.line, color: BRAND.ink }}>{label}</button>)}
          </nav>
        </div>
      </Shell>
    </header>
  );
}

function Footer({ navigate }) {
  return (
    <footer className="mt-10 border-t bg-white" style={{ borderColor: BRAND.line }}>
      <Shell>
        <div className="grid gap-8 py-8 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <div className="text-[28px] font-black tracking-[-0.05em]"><span style={{ color: BRAND.primary }}>HOLO</span><span style={{ color: BRAND.ink }}> PRINT</span></div>
            <p className="mt-3 max-w-[420px] text-[12px] leading-7" style={{ color: BRAND.muted }}>A complete local solution for design, print, signage, websites and reliable delivery support.</p>
          </div>
          <FooterCol title="Products" links={[["Business Cards", "/standard-business-cards"], ["Flyers", "/flyers"], ["Posters", "/posters-large-format-prints"], ["Booklets", "/booklets"]]} navigate={navigate} />
          <FooterCol title="Support" links={[["Artwork Guide", "/artwork-guide"], ["Upload Artwork", "/artwork-upload"], ["Contact", "/contact"], ["Quote Request", "/bespoke-quote"]]} navigate={navigate} />
          <FooterCol title="Legal" links={[["Terms", "/terms"], ["Privacy", "/privacy"], ["Account", "/account"], ["Cart", "/cart"]]} navigate={navigate} />
        </div>
        <div className="border-t py-4 text-[11px]" style={{ borderColor: BRAND.line, color: BRAND.muted }}>© 2026 HOLO PRINT. Holo Print T/A TECH AND PRINT LTD.</div>
      </Shell>
    </footer>
  );
}

function FooterCol({ title, links, navigate }) {
  return <div><div className="mb-3 text-[12px] font-black uppercase tracking-[0.16em]" style={{ color: BRAND.ink }}>{title}</div><div className="grid gap-2">{links.map(([label, path]) => <button key={path} onClick={() => navigate(path)} className="text-left text-[12px]" style={{ color: BRAND.muted }}>{label}</button>)}</div></div>;
}

function Hero({ eyebrow, title, body, children }) {
  return (
    <section className="py-8">
      <Shell narrow>
        <div className="rounded-[28px] border bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8" style={{ borderColor: BRAND.line }}>
          <div className="text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: BRAND.primary }}>{eyebrow}</div>
          <h1 className="mt-3 text-[34px] font-black leading-[1.04] tracking-[-0.045em] md:text-[48px]" style={{ color: BRAND.ink }}>{title}</h1>
          <p className="mt-4 max-w-[760px] text-[13px] leading-7" style={{ color: BRAND.muted }}>{body}</p>
          {children ? <div className="mt-6">{children}</div> : null}
        </div>
      </Shell>
    </section>
  );
}

function PrimaryButton({ children, onClick }) {
  return <button onClick={onClick} className="rounded-full px-5 py-3 text-[12px] font-black uppercase tracking-[0.08em] text-white shadow-[0_14px_30px_rgba(24,167,208,0.22)]" style={{ backgroundColor: BRAND.primary }}>{children}</button>;
}

function SecondaryButton({ children, onClick }) {
  return <button onClick={onClick} className="rounded-full border bg-white px-5 py-3 text-[12px] font-black uppercase tracking-[0.08em]" style={{ borderColor: BRAND.line, color: BRAND.ink }}>{children}</button>;
}

function InfoGrid({ items }) {
  return <Shell narrow><div className="grid gap-4 md:grid-cols-2">{items.map(([title, text, icon], index) => <div key={title} className="rounded-[20px] border bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.035)]" style={{ borderColor: BRAND.line }}><div className="flex items-center gap-3"><div className="grid h-10 w-10 place-items-center rounded-full text-white" style={{ backgroundColor: index % 2 ? BRAND.accent : BRAND.primary }}>{icon || <Check className="h-5 w-5" />}</div><div className="text-[17px] font-black" style={{ color: BRAND.ink }}>{title}</div></div><p className="mt-3 text-[12px] leading-7" style={{ color: BRAND.muted }}>{text}</p></div>)}</div></Shell>;
}

export function ContactPage({ navigate }) {
  return (
    <LaunchPageLayout navigate={navigate} pathname="/contact">
      <Hero eyebrow="Contact Holo Print" title="Printing in Sidcup for local businesses, events and everyday customers." body="Speak to us about business cards, flyers, leaflets, posters, PVC banners, shop boards, stickers, labels, booklets, design support and website/print packages.">
        <div className="flex flex-wrap gap-3"><PrimaryButton onClick={() => navigate('/bespoke-quote')}>Request a quote</PrimaryButton><SecondaryButton onClick={() => navigate('/all-products')}>Browse products</SecondaryButton></div>
      </Hero>
      <InfoGrid items={[
        ['Email', CONTACT.email, <Mail className="h-5 w-5" />],
        ['Phone / WhatsApp', CONTACT.phone, <Phone className="h-5 w-5" />],
        ['Location', `${CONTACT.area}. Local collection and delivery options available.`, <MapPin className="h-5 w-5" />],
        ['Opening hours', CONTACT.hours, <ShieldCheck className="h-5 w-5" />],
      ]} />
      <Shell narrow><div className="mt-5 rounded-[24px] border bg-white p-6" style={{ borderColor: BRAND.line }}><h2 className="text-[24px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>Popular local print requests</h2><div className="mt-4 grid gap-2 text-[12px] md:grid-cols-2" style={{ color: BRAND.muted }}>{['Business cards in Sidcup', 'Flyers and leaflets', 'PVC banners and posters', 'Shop boards and signage', 'Stickers and labels', 'Design and artwork help'].map((item) => <div key={item} className="flex items-center gap-2"><Check className="h-4 w-4" style={{ color: BRAND.primary }} />{item}</div>)}</div></div></Shell>
    </LaunchPageLayout>
  );
}

export function ArtworkGuidePage({ navigate }) {
  return (
    <LaunchPageLayout navigate={navigate} pathname="/artwork-guide">
      <Hero eyebrow="Artwork guide" title="Prepare artwork correctly before printing." body="Use this guide before uploading files. Good artwork reduces delays, reprints and colour issues. If unsure, upload what you have and request artwork help.">
        <div className="flex flex-wrap gap-3"><PrimaryButton onClick={() => navigate('/artwork-upload')}>Upload artwork</PrimaryButton><SecondaryButton onClick={() => navigate('/bespoke-quote')}>Request artwork help</SecondaryButton></div>
      </Hero>
      <InfoGrid items={[
        ['PDF preferred', 'Send print-ready PDF where possible. JPG, PNG, AI and EPS may also be accepted depending on the job.', <Upload className="h-5 w-5" />],
        ['Bleed and safe area', 'Add 3mm bleed on flyers, cards, leaflets and most small format jobs. Keep text and logos away from trim edges.', null],
        ['CMYK colour', 'Use CMYK colour mode for print. RGB artwork can print differently from what you see on screen.', null],
        ['300dpi images', 'Use high-resolution images. Low-resolution images may look blurry or pixelated when printed.', null],
        ['Fonts and outlines', 'Embed fonts in PDFs or outline text in design files to avoid missing font issues.', null],
        ['Cut lines', 'For stickers, labels and shaped jobs, use a separate cut line layer such as CutContour where possible.', null],
      ]} />
    </LaunchPageLayout>
  );
}

export function TermsPage({ navigate }) {
  return (
    <LaunchPageLayout navigate={navigate} pathname="/terms">
      <Hero eyebrow="Terms" title="Holo Print order and quote terms." body="These launch terms explain how online orders, quote requests, artwork checks, payment links, production and collection work. They are written for launch readiness and can be reviewed by your solicitor/accountant later." />
      <InfoGrid items={[
        ['Quotes and approval', 'Custom jobs may require manual approval. We will confirm specification, price and turnaround before sending a payment link.', null],
        ['Payment', 'Fixed-price products may be paid online. Quote jobs are payable after approval using a secure payment link or agreed manual payment.', null],
        ['Artwork responsibility', 'Customers must supply suitable artwork or request design help. Production starts after artwork/payment approval.', null],
        ['Turnaround', 'Turnaround starts after payment, artwork approval and any required proof confirmation, not necessarily at the time of enquiry.', null],
        ['Collection and delivery', 'Orders can be collected locally or delivered where available. Delivery estimates are not guaranteed unless agreed in writing.', null],
        ['Cancellations and reprints', 'Once production has started, cancellation may not be possible. Reprint decisions depend on artwork, proof approval and production issue checks.', null],
      ]} />
    </LaunchPageLayout>
  );
}

export function PrivacyPage({ navigate }) {
  return (
    <LaunchPageLayout navigate={navigate} pathname="/privacy">
      <Hero eyebrow="Privacy" title="How Holo Print handles customer and artwork data." body="We only collect the information needed to quote, process, print, deliver and support your order. This page is a practical launch privacy notice and can be expanded with legal review later." />
      <InfoGrid items={[
        ['Customer details', 'We collect names, email addresses, phone numbers, company details and delivery/collection information needed for orders.', null],
        ['Artwork files', 'Uploaded files are used to check, quote and produce your print order. Files may be retained for support, reorders and audit unless deletion is requested.', null],
        ['Payments', 'Online payments are processed through secure payment providers such as Stripe. We do not store full card details.', null],
        ['Emails', 'We may email order confirmations, quote updates, artwork requests, payment links and production updates.', null],
        ['Suppliers', 'Where a job is outsourced or delivered by a supplier/courier, required order details may be shared to fulfil the job.', null],
        ['Contact', `For privacy questions contact ${CONTACT.email}.`, null],
      ]} />
    </LaunchPageLayout>
  );
}

export function LaunchPageLayout({ navigate, pathname, children }) {
  return <div style={{ backgroundColor: BRAND.bg, color: BRAND.ink }}><LaunchSeo pathname={pathname} /><Header navigate={navigate} />{children}<Footer navigate={navigate} /></div>;
}

export function LaunchPageRouter({ pathname, navigate }) {
  if (pathname === '/contact') return <ContactPage navigate={navigate} />;
  if (pathname === '/artwork-guide') return <ArtworkGuidePage navigate={navigate} />;
  if (pathname === '/terms') return <TermsPage navigate={navigate} />;
  if (pathname === '/privacy') return <PrivacyPage navigate={navigate} />;
  return null;
}

export const launchPagePaths = ['/contact', '/artwork-guide', '/terms', '/privacy'];
