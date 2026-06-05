import React, { useEffect, useState } from 'react';
import { Copy, PackageCheck, QrCode, ShieldCheck } from 'lucide-react';
import { LaunchPageLayout } from './LaunchPages';

const BRAND = { line: '#E3E8F0', ink: '#161A22', muted: '#667487', primary: '#18A7D0', accent: '#7B3FE4' };
const API_BASE = import.meta.env.VITE_INTERNAL_STOREFRONT_BASE_URL || import.meta.env.VITE_ADMIN_BASE_URL || import.meta.env.VITE_INTERNAL_API_BASE || import.meta.env.VITE_API_URL || '';

function apiUrl(path, params = {}) { const base = API_BASE.replace(/\/$/, ''); const url = new URL(`${base}${path}`, window.location.origin); Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, String(v)); }); return url.toString(); }
function currentToken() { if (typeof window === 'undefined') return ''; return new URLSearchParams(window.location.search).get('token') || ''; }
function copy(value) { try { navigator.clipboard?.writeText(String(value || '')); } catch {} }
function qrImageUrl(pass) { return pass?.qrUrl ? `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=12&data=${encodeURIComponent(pass.qrUrl)}` : ''; }

async function verifyToken(token) {
  const response = await fetch(apiUrl('/api/internal/collection/verify', { token }), { credentials: 'include' });
  const payload = await response.json().catch(() => null);
  if (!response.ok || payload?.ok === false) throw new Error(payload?.error || 'Collection pass could not be verified.');
  return payload?.data?.pass || payload?.data || null;
}

function PassPanel({ pass }) {
  const ready = pass?.status === 'ready' || pass?.status === 'collected';
  return <div className="mx-auto max-w-[980px] px-4 sm:px-6 lg:px-8"><div className="rounded-[28px] border bg-white p-6 shadow-[0_18px_50px_rgba(0,0,0,0.05)] md:p-8" style={{ borderColor: BRAND.line }}><div className="grid gap-6 md:grid-cols-[260px_1fr]"><div className="rounded-[22px] border bg-[#FBFCFF] p-4 text-center" style={{ borderColor: BRAND.line }}>{qrImageUrl(pass) ? <img src={qrImageUrl(pass)} alt="Collection QR" className="mx-auto h-[220px] w-[220px] rounded-xl bg-white" /> : <QrCode className="mx-auto h-24 w-24" style={{ color: BRAND.primary }} />}<div className="mt-3 text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.muted }}>QR collection link</div></div><div><div className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: ready ? '#059669' : '#B45309' }}>{ready ? 'Verified collection pass' : 'Pass found — not ready yet'}</div><h1 className="mt-2 text-[34px] font-black tracking-[-0.04em]" style={{ color: BRAND.ink }}>Order #{pass.orderNumber}</h1><p className="mt-2 text-[13px] leading-7" style={{ color: BRAND.muted }}>Show this page or the PIN below at the collection counter. Staff can verify and mark the order as collected in the admin handover screen.</p><div className="mt-5 rounded-[20px] border bg-white p-5 text-center" style={{ borderColor: BRAND.line }}><div className="text-[11px] font-black uppercase tracking-[0.18em]" style={{ color: BRAND.muted }}>Collection PIN</div><div className="mt-2 text-[42px] font-black tracking-[0.18em]" style={{ color: BRAND.ink }}>{pass.pin}</div><button onClick={() => copy(pass.pin)} className="mt-3 rounded-full border px-4 py-2 text-[11px] font-black uppercase tracking-[0.08em]" style={{ borderColor: BRAND.line }}><Copy className="mr-1 inline h-3.5 w-3.5" /> Copy PIN</button></div><div className="mt-5 grid gap-2 text-[12px] leading-6" style={{ color: BRAND.muted }}><div><b style={{ color: BRAND.ink }}>Customer:</b> {pass.customerName}</div><div><b style={{ color: BRAND.ink }}>Location:</b> {pass.locationLabel || 'Collection point'}</div>{pass.locationAddress ? <div><b style={{ color: BRAND.ink }}>Address:</b> {pass.locationAddress}</div> : null}<div><b style={{ color: BRAND.ink }}>Instructions:</b> {pass.pickupInstructions}</div>{pass.collectionTruth ? <div className="rounded-[16px] border p-3" style={{ borderColor: '#FDE68A', background: '#FFFBEB', color: '#854D0E' }}><ShieldCheck className="mr-1 inline h-4 w-4" />{pass.collectionTruth}</div> : null}</div></div></div></div></div>;
}

export default function CollectionPassPage({ navigate }) {
  const [state, setState] = useState({ loading: true, pass: null, error: '' });
  useEffect(() => { let cancelled = false; const token = currentToken(); if (!token) { setState({ loading: false, pass: null, error: 'Missing collection token.' }); return undefined; } verifyToken(token).then((pass) => { if (!cancelled) setState({ loading: false, pass, error: '' }); }).catch((error) => { if (!cancelled) setState({ loading: false, pass: null, error: error instanceof Error ? error.message : 'Collection pass unavailable.' }); }); return () => { cancelled = true; }; }, []);
  return <LaunchPageLayout navigate={navigate} pathname="/collection-pass"><section className="py-8">{state.loading ? <div className="mx-auto max-w-[900px] px-4"><div className="rounded-[24px] border bg-white p-6" style={{ borderColor: BRAND.line }}>Loading collection pass...</div></div> : state.pass ? <PassPanel pass={state.pass} /> : <div className="mx-auto max-w-[900px] px-4"><div className="rounded-[24px] border bg-white p-6" style={{ borderColor: BRAND.line }}><PackageCheck className="mb-3 h-8 w-8" style={{ color: BRAND.primary }} /><h1 className="text-[28px] font-black" style={{ color: BRAND.ink }}>Collection pass unavailable</h1><p className="mt-2 text-[13px]" style={{ color: BRAND.muted }}>{state.error}</p><button onClick={() => navigate('/account')} className="mt-4 rounded-full bg-black px-5 py-3 text-[12px] font-black uppercase tracking-[0.08em] text-white">Go to account</button></div></div>}</section></LaunchPageLayout>;
}

export function isCollectionPassRoute(pathname) { return String(pathname || '') === '/collection-pass'; }
