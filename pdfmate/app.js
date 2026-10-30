// PDF Mate by Tango Juliet Dev. Offline PDF fill, sign, mark up and page editing.
import * as pdfjsLib from './vendor/pdf.min.mjs';

const VERSION = '1.2.0';
const PL = window.PDFLib;
const base = new URL('./vendor/', import.meta.url).href;
pdfjsLib.GlobalWorkerOptions.workerSrc = base + 'pdf.worker.min.mjs';
const PDFJS_OPTS = { cMapUrl: base + 'cmaps/', cMapPacked: true, standardFontDataUrl: base + 'standard_fonts/', wasmUrl: base + 'wasm/', iccUrl: base + 'iccs/', isEvalSupported: false };

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const SVGNS = 'http://www.w3.org/2000/svg';
let uidN = 0;
const uid = (p = 'x') => p + Date.now().toString(36) + (uidN++).toString(36);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } };
const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Icons (SF-style strokes) ---------- */
const IC = {
  sidebar: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M9.5 4v16"/><path d="M5.5 8h2M5.5 11h2"/>',
  undo: '<path d="M9 14 4 9l5-5"/><path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11"/>',
  redo: '<path d="m15 14 5-5-5-5"/><path d="M20 9H9.5a5.5 5.5 0 0 0 0 11H13"/>',
  open: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 11v7M8.5 14.5h7"/>',
  more: '<circle cx="12" cy="12" r="9"/><path d="M8 12h.01M12 12h.01M16 12h.01" stroke-width="2.6"/>',
  share: '<path d="M12 3v12"/><path d="m7.5 7.5 4.5-4.5 4.5 4.5"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/>',
  zin: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M11 8v6M8 11h6"/>',
  zout: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5M8 11h6"/>',
  select: '<path d="M5 3.5 18.5 10l-6 1.8-2.3 6.2z"/><path d="m13 12 5 5"/>',
  text: '<path d="M5 7V5h14v2"/><path d="M12 5v14"/><path d="M9 19h6"/>',
  white: '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M7 10h6M7 14h10" stroke-dasharray="2 2.2"/>',
  hl: '<path d="m9 11-6 6v3h9l3-3"/><path d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4"/>',
  rect: '<rect x="4" y="5" width="16" height="14" rx="1.5"/>',
  line: '<path d="M5 19 19 5"/>',
  arrow: '<path d="M5 19 19 5"/><path d="M10 5h9v9"/>',
  pen: '<path d="M3 20c3.5 0 4.5-3 6.5-7S14 5 16.5 5 19 8 17 11s-3 4-1 6 4 1 5 0"/>',
  tick: '<path d="m4.5 12.5 5 5L20 7"/>',
  cross: '<path d="M6 6l12 12M18 6 6 18"/>',
  sign: '<path d="M3 16c2.5-.5 3.5-8 6-8s1 8 3.5 8 2.5-4 4-4 1.5 3 4.5 2.5"/><path d="M3 20.5h18"/>',
  rotl: '<path d="M4 12a8 8 0 1 0 2.4-5.7"/><path d="M4 3.5v4.8h4.8"/>',
  rotr: '<path d="M20 12a8 8 0 1 1-2.4-5.7"/><path d="M20 3.5v4.8h-4.8"/>',
  up: '<path d="m6 15 6-6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  blank: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/>',
  trash: '<path d="M4 7h16"/><path d="M9.5 7V4.5h5V7"/><path d="m6 7 1 13h10l1-13"/><path d="M10 11v5.5M14 11v5.5"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  close: '<path d="M6 6l12 12M18 6 6 18"/>',
  form: '<rect x="4" y="3" width="16" height="18" rx="2.5"/><path d="M8 8h8M8 12h8M8 16h4.5"/>',
  photo: '<rect x="3" y="5" width="18" height="14" rx="2.5"/><circle cx="8.5" cy="10" r="1.6"/><path d="m21 16-5-5-8.5 8"/>',
  lock: '<rect x="5" y="11" width="14" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  offline: '<path d="M2 8.8a15 15 0 0 1 4.2-2.7M22 8.8A15 15 0 0 0 10.7 5M5 12.6a10 10 0 0 1 5.2-2.6M19 12.6a10 10 0 0 0-1.9-1.4M8.5 16.4a5 5 0 0 1 7 0M12 20h.01M3 3l18 18"/>',
  dup: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  fit: '<path d="M4 9V5a1 1 0 0 1 1-1h4M20 9V5a1 1 0 0 0-1-1h-4M4 15v4a1 1 0 0 0 1 1h4M20 15v4a1 1 0 0 1-1 1h-4"/>',
  theme: '<circle cx="12" cy="12" r="8.5"/><path d="M12 3.5a8.5 8.5 0 0 0 0 17z" fill="currentColor"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5.5M12 7.5h.01"/>',
  merge: '<path d="M8 3v4a4 4 0 0 0 4 4 4 4 0 0 1 4 4v6"/><path d="M16 3v4a4 4 0 0 1-4 4"/><path d="m13 18 3 3 3-3"/>',
  edit: '<path d="M4 20h4L19 9a2.1 2.1 0 0 0-3-3L5 17z"/><path d="m14 7 3 3"/>',
  download: '<path d="M12 3v12"/><path d="m7.5 10.5 4.5 4.5 4.5-4.5"/><path d="M5 20h14"/>',
  extract: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M12 17v-6M9.5 13.5 12 11l2.5 2.5"/>',
  stamp: '<path d="M9 12.5V9.8a3 3 0 1 1 6 0v2.7"/><path d="M4.5 15.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2V18h-15z"/><path d="M5 21h14"/>',
  install: '<rect x="4" y="4" width="16" height="16" rx="4.5"/><path d="M12 8v8M8.5 12.5 12 16l3.5-3.5"/>',
  print: '<path d="M7 9V3.5h10V9"/><rect x="3" y="9" width="18" height="8" rx="2.5"/><path d="M7 14h10v6.5H7z"/><path d="M17.5 12h.01"/>',
  longedge: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 3v18" stroke-width="3"/><path d="M9 8h6M9 12h6"/>',
  shortedge: '<rect x="5" y="3" width="14" height="18" rx="1.5"/><path d="M5 3h14" stroke-width="3"/><path d="M9 9h6M9 13h6"/>',
  xmark: '<circle cx="12" cy="12" r="9"/><path d="m9 9 6 6m0-6-6 6"/>'
};
const icon = (n, extra = '') => `<svg class="i" viewBox="0 0 24 24" aria-hidden="true" ${extra}>${IC[n] || ''}</svg>`;

/* ---------- State ---------- */
const S = {
  docs: new Map(),      // id -> {id,name,bytes,pdf,fields,values,encrypted,widgets}
  imgs: new Map(),      // id -> {src,w,h,el}
  pages: [],            // {id,kind,docId,index,view,baseRot,rot,imgId,annots}
  tool: 'select',
  pendingImg: null,     // lib item for placing
  sel: null,            // {pageId, annId}
  selPages: new Set(),
  selecting: false,
  current: 0,
  zoom: 1,
  fit: true,
  dirty: false,
  hist: [], fut: [], last: '[]',
  style: lsGet('pdfmate.style', { ink: '#000000', hl: '#ffd60a', size: 12, width: 1.5 })
};
const INKS = [['Black', '#000000'], ['Blue', '#0040dd'], ['Red', '#d70015'], ['Green', '#1a7f37'], ['Orange', '#c93400']];
const HLS = [['Yellow', '#ffd60a'], ['Green', '#8be28b'], ['Pink', '#ff9ecf'], ['Blue', '#7cc7ff']];
const TOOLS = [
  ['select', 'Select and move', 'select'], ['sep'],
  ['text', 'Text', 'text'], ['white', 'Whiteout', 'white'], ['hl', 'Highlight', 'hl'], ['sep'],
  ['rect', 'Rectangle', 'rect'], ['line', 'Line', 'line'], ['arrow', 'Arrow', 'arrow'], ['pen', 'Pen', 'pen'], ['sep'],
  ['tick', 'Tick', 'tick'], ['cross', 'Cross', 'cross'], ['sign', 'Signature or stamp', 'sign']
];
const DRAW_TOOLS = new Set(['text', 'white', 'hl', 'rect', 'line', 'arrow', 'pen', 'tick', 'cross', 'image']);

/* ---------- Geometry ---------- */
function vpTransform(view, rot, scale = 1) {
  const [x0, y0, x1, y1] = view; const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  rot = ((rot % 360) + 360) % 360;
  let A, B, C, D;
  switch (rot) { case 180: A = -1; B = 0; C = 0; D = 1; break; case 90: A = 0; B = 1; C = 1; D = 0; break; case 270: A = 0; B = -1; C = -1; D = 0; break; default: A = 1; B = 0; C = 0; D = -1; }
  let ox, oy, w, h;
  if (A === 0) { ox = Math.abs(cy - y0) * scale; oy = Math.abs(cx - x0) * scale; w = (y1 - y0) * scale; h = (x1 - x0) * scale; }
  else { ox = Math.abs(cx - x0) * scale; oy = Math.abs(cy - y0) * scale; w = (x1 - x0) * scale; h = (y1 - y0) * scale; }
  const t = [A * scale, B * scale, C * scale, D * scale, ox - A * scale * cx - C * scale * cy, oy - B * scale * cx - D * scale * cy];
  return { t, w, h };
}
const ap = (t, x, y) => [x * t[0] + y * t[2] + t[4], x * t[1] + y * t[3] + t[5]];
function inv(t) { const d = t[0] * t[3] - t[1] * t[2]; return [t[3] / d, -t[1] / d, -t[2] / d, t[0] / d, (t[2] * t[5] - t[3] * t[4]) / d, (t[1] * t[4] - t[0] * t[5]) / d]; }
const tr = (p) => (((p.baseRot || 0) + (p.rot || 0)) % 360 + 360) % 360;
function geo(p) { const g = vpTransform(p.view, tr(p), 1); g.i = inv(g.t); return g; }
const UV = (r) => { r = ((r % 360) + 360) % 360; const c = [1, 0, -1, 0][r / 90], s = [0, 1, 0, -1][r / 90]; return { U: [c, s], V: [-s, c] }; };

/* ---------- Text metrics (Helvetica, same as export) ---------- */
let HELV = null; const encOK = new Map();
async function initFont() { const d = await PL.PDFDocument.create(); HELV = await d.embedFont(PL.StandardFonts.Helvetica); }
function sanitize(str) {
  let out = '';
  for (const ch of String(str)) {
    if (ch === '\n') { out += ch; continue; }
    let ok = encOK.get(ch);
    if (ok === undefined) { try { HELV.encodeText(ch); HELV.widthOfTextAtSize(ch, 10); ok = true; } catch (e) { ok = false; } encOK.set(ch, ok); }
    out += ok ? ch : (ch === '\u2014' || ch === '\u2013' ? '-' : '?');
  }
  return out;
}
const LH = 1.2, BASE = 0.9;
function textBox(a) {
  const lines = String(a.text || '').split('\n');
  let w = 0; for (const l of lines) w = Math.max(w, HELV ? HELV.widthOfTextAtSize(l, a.size) : l.length * a.size * 0.5);
  return { w: Math.max(w, a.size * 0.6), h: lines.length * LH * a.size, lines };
}
function setText(a, text, size) {
  const { U, V } = UV(a.r); const topX = a.ax + a.h * V[0], topY = a.ay + a.h * V[1];
  if (text != null) a.text = sanitize(text);
  if (size != null) a.size = size;
  const b = textBox(a); a.w = b.w; a.h = b.h;
  a.ax = topX - a.h * V[0]; a.ay = topY - a.h * V[1];
}

/* ---------- Annotation geometry ---------- */
const ORIENTED = new Set(['text', 'image', 'tick', 'cross']);
const BOXES = new Set(['white', 'hl', 'rect']);
function corners(a) {
  if (BOXES.has(a.t)) return [[a.x, a.y], [a.x + a.w, a.y + a.h]];
  if (a.pts) return a.pts;
  const { U, V } = UV(a.r);
  return [[a.ax, a.ay], [a.ax + a.w * U[0], a.ay + a.w * U[1]], [a.ax + a.h * V[0], a.ay + a.h * V[1]], [a.ax + a.w * U[0] + a.h * V[0], a.ay + a.w * U[1] + a.h * V[1]]];
}
function dispBox(a, g) {
  let L = Infinity, T = Infinity, R = -Infinity, B = -Infinity;
  for (const [x, y] of corners(a)) { const [dx, dy] = ap(g.t, x, y); L = Math.min(L, dx); T = Math.min(T, dy); R = Math.max(R, dx); B = Math.max(B, dy); }
  const pad = a.pts ? (a.width || 1) / 2 : 0;
  return { L: L - pad, T: T - pad, R: R + pad, B: B + pad };
}
function pdfAffineFromDisplay(g, fn) {
  const m = (x, y) => { const [dx, dy] = ap(g.t, x, y); const [ex, ey] = fn(dx, dy); return ap(g.i, ex, ey); };
  const o = m(0, 0), px = m(1, 0), py = m(0, 1);
  return { kx: px[0] - o[0], ky: py[1] - o[1], tx: o[0], ty: o[1] };
}
function applyT(a, T, uniform) {
  const f = (x, y) => [T.kx * x + T.tx, T.ky * y + T.ty];
  if (BOXES.has(a.t)) { const [x, y] = f(a.x, a.y); a.x = x; a.y = y; a.w *= T.kx; a.h *= T.ky; return; }
  if (a.pts) { a.pts = a.pts.map(([x, y]) => f(x, y)); return; }
  const { U } = UV(a.r); const alongX = U[0] !== 0;
  let su = alongX ? T.kx : T.ky, sv = alongX ? T.ky : T.kx;
  if (uniform) { const s = Math.abs(su - 1) > Math.abs(sv - 1) ? su : sv; su = sv = s; }
  // anchor: keep the corner that maps to the same relative position
  const [ax, ay] = f(a.ax, a.ay); a.ax = ax; a.ay = ay;
  if (a.t === 'text') { a.size = clamp(a.size * sv, 4, 200); const b = textBox(a); a.w = b.w; a.h = b.h; }
  else { a.w = Math.max(2, a.w * su); a.h = Math.max(2, a.h * sv); }
}
function arrowHead(a) {
  const [p0, p1] = a.pts; const dx = p1[0] - p0[0], dy = p1[1] - p0[1], len = Math.hypot(dx, dy) || 1;
  const ux = dx / len, uy = dy / len, hl = Math.max(7, (a.width || 1.5) * 4.5), ang = 0.5;
  const c = Math.cos(ang), s = Math.sin(ang);
  const l = [p1[0] - hl * (ux * c - uy * s), p1[1] - hl * (uy * c + ux * s)];
  const r = [p1[0] - hl * (ux * c + uy * s), p1[1] - hl * (uy * c - ux * s)];
  return [[l, p1], [r, p1]];
}
const TICK = [[0.08, 0.55], [0.38, 0.86], [0.94, 0.12]];
const CROSS = [[[0.14, 0.14], [0.86, 0.86]], [[0.86, 0.14], [0.14, 0.86]]];
function orientPt(a, p, q) { const { U, V } = UV(a.r); const u = p * a.w, v = (1 - q) * a.h; return [a.ax + u * U[0] + v * V[0], a.ay + u * U[1] + v * V[1]]; }
function markSegments(a) {
  if (a.t === 'tick') { const pts = TICK.map(([p, q]) => orientPt(a, p, q)); return [[pts[0], pts[1]], [pts[1], pts[2]]]; }
  return CROSS.map((s) => s.map(([p, q]) => orientPt(a, p, q)));
}

/* ---------- History ---------- */
const snap = () => JSON.stringify({ pages: S.pages, vals: [...S.docs.values()].map((d) => [d.id, d.values]) });
function restore(str) {
  const o = JSON.parse(str); S.pages = o.pages;
  for (const [id, v] of o.vals) { const d = S.docs.get(id); if (d) d.values = v; }
  S.sel = null; S.selPages.clear(); renderAll();
}
function commit() {
  const s = snap(); if (s === S.last) return;
  S.hist.push(S.last); if (S.hist.length > 80) S.hist.shift(); S.fut = []; S.last = s; setDirty(true); updateChrome();
}
function undo() { if (!S.hist.length) return; closeEditor(true); S.fut.push(S.last); S.last = S.hist.pop(); restore(S.last); setDirty(true); updateChrome(); }
function redo() { if (!S.fut.length) return; closeEditor(true); S.hist.push(S.last); S.last = S.fut.pop(); restore(S.last); setDirty(true); updateChrome(); }
function resetHistory() { S.hist = []; S.fut = []; S.last = snap(); }
function setDirty(v) { S.dirty = v; updateMeta(); }

/* ---------- UI helpers ---------- */
let toastT;
function toast(msg, opts = {}) {
  const old = $('.toast'); if (old) old.remove(); clearTimeout(toastT);
  const t = document.createElement('div'); t.className = 'toast' + (opts.err ? ' err' : ''); t.setAttribute('role', 'status'); t.setAttribute('aria-live', 'polite');
  t.innerHTML = (opts.spin ? '<span class="spin"></span>' : '') + `<span>${esc(msg)}</span>`;
  document.body.appendChild(t);
  if (!opts.sticky) toastT = setTimeout(() => t.remove(), opts.ms || 2600);
  return t;
}
function closeSheet() { const s = $('#layer .scrim'); if (s) { s.remove(); } document.removeEventListener('keydown', sheetKey); }
function sheetKey(e) { if (e.key === 'Escape') closeSheet(); }
function sheet(html, { wide = false, onMount } = {}) {
  closeSheet(); closeMenu();
  const sc = document.createElement('div'); sc.className = 'scrim';
  sc.innerHTML = `<div class="sheet${wide ? ' wide' : ''}" role="dialog" aria-modal="true">${html}</div>`;
  sc.addEventListener('pointerdown', (e) => { if (e.target === sc) closeSheet(); });
  $('#layer').appendChild(sc); document.addEventListener('keydown', sheetKey);
  const sh = sc.firstElementChild; if (onMount) onMount(sh);
  const f = sh.querySelector('[autofocus]') || sh.querySelector('button.primary,button'); if (f) setTimeout(() => f.focus(), 30);
  return sh;
}
function confirmSheet(title, text, okLabel, onOk, danger = true) {
  const sh = sheet(`<h2>${esc(title)}</h2><p class="sub">${esc(text)}</p><div class="acts"><button class="btn" data-x>Cancel</button><button class="btn ${danger ? 'danger' : 'primary'}" data-ok>${esc(okLabel)}</button></div>`);
  sh.querySelector('[data-x]').onclick = closeSheet;
  sh.querySelector('[data-ok]').onclick = () => { closeSheet(); onOk(); };
}
let menuEl = null;
function closeMenu() { if (menuEl) { menuEl.remove(); menuEl = null; document.removeEventListener('pointerdown', menuOutside, true); document.removeEventListener('keydown', menuKey); } }
function menuOutside(e) { if (menuEl && !menuEl.contains(e.target) && !e.target.closest('#btnMore')) closeMenu(); }
function menuKey(e) {
  if (!menuEl) return; const items = $$('button', menuEl); const i = items.indexOf(document.activeElement);
  if (e.key === 'Escape') { closeMenu(); $('#btnMore').focus(); }
  else if (e.key === 'ArrowDown') { e.preventDefault(); items[(i + 1) % items.length].focus(); }
  else if (e.key === 'ArrowUp') { e.preventDefault(); items[(i - 1 + items.length) % items.length].focus(); }
}
function openMenu(anchor, items) {
  closeMenu();
  const m = document.createElement('div'); m.className = 'menu'; m.setAttribute('role', 'menu');
  m.innerHTML = items.map((it, i) => it === '-' ? '<hr>' : it.h ? `<div class="mh">${esc(it.h)}</div>` : `<button role="menuitem" data-i="${i}" ${it.disabled ? 'disabled style="opacity:.4;pointer-events:none"' : ''}>${icon(it.icon || 'info')}<span>${esc(it.label)}</span>${it.kbd ? `<kbd>${esc(it.kbd)}</kbd>` : ''}</button>`).join('');
  m.addEventListener('click', (e) => { const b = e.target.closest('button[data-i]'); if (!b) return; const it = items[+b.dataset.i]; closeMenu(); it.run(); });
  document.body.appendChild(m); menuEl = m;
  const r = anchor.getBoundingClientRect(), mw = m.offsetWidth, mh = m.offsetHeight;
  m.style.left = clamp(r.right - mw, 8, innerWidth - mw - 8) + 'px';
  m.style.top = clamp(r.bottom + 6, 8, innerHeight - mh - 8) + 'px';
  setTimeout(() => { document.addEventListener('pointerdown', menuOutside, true); document.addEventListener('keydown', menuKey); const f = m.querySelector('button'); if (f) f.focus(); }, 0);
}

/* ---------- Loading files ---------- */
const isPdf = (f) => f.type === 'application/pdf' || /\.pdf$/i.test(f.name);
const isImg = (f) => /^image\//.test(f.type) || /\.(jpe?g|png|webp|gif|bmp|heic|heif)$/i.test(f.name);
function loadImageEl(src) { return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('Could not read this image.')); im.src = src; }); }
const readAsDataURL = (f) => new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result); r.onerror = () => rej(r.error); r.readAsDataURL(f); });
async function normImage(src, maxSide = 2400, keepAlpha = false) {
  const im = await loadImageEl(src); let w = im.naturalWidth, h = im.naturalHeight; const k = Math.min(1, maxSide / Math.max(w, h));
  w = Math.round(w * k); h = Math.round(h * k);
  const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d');
  if (!keepAlpha) { x.fillStyle = '#fff'; x.fillRect(0, 0, w, h); }
  x.drawImage(im, 0, 0, w, h);
  const out = keepAlpha ? c.toDataURL('image/png') : c.toDataURL('image/jpeg', 0.86);
  const el = await loadImageEl(out);
  return { src: out, w, h, el };
}
function askPassword(name, wrong) {
  return new Promise((res) => {
    const sh = sheet(`<h2>Password required</h2><p class="sub">${esc(name)} is protected${wrong ? '. That password did not work, try again.' : '. Enter its password to open it.'}</p>
      <div class="field"><label for="pw">Password</label><input id="pw" class="inp" type="password" autocomplete="off" autofocus></div>
      <div class="acts"><button class="btn" data-x>Skip file</button><button class="btn primary" data-ok>Open</button></div>`);
    const go = () => { const v = sh.querySelector('#pw').value; closeSheet(); res(v); };
    sh.querySelector('[data-x]').onclick = () => { closeSheet(); res(null); };
    sh.querySelector('[data-ok]').onclick = go;
    sh.querySelector('#pw').addEventListener('keydown', (e) => { if (e.key === 'Enter') go(); });
  });
}
async function readFields(doc) {
  doc.fields = []; doc.values = {}; doc.widgets = new Map();
  try {
    const ld = await PL.PDFDocument.load(doc.bytes, { ignoreEncryption: true, updateMetadata: false });
    doc.encrypted = !!ld.isEncrypted;
    if (doc.encrypted) return;
    const pageOf = new Map();
    ld.getPages().forEach((pg, i) => { const an = pg.node.Annots(); if (an) an.asArray().forEach((r) => pageOf.set(String(r), i)); });
    const form = ld.getForm();
    for (const f of form.getFields()) {
      let type = null, value = '', options = null;
      if (f instanceof PL.PDFTextField) { type = 'text'; value = f.getText() || ''; }
      else if (f instanceof PL.PDFCheckBox) { type = 'check'; value = f.isChecked(); }
      else if (f instanceof PL.PDFDropdown) { type = 'drop'; options = f.getOptions(); value = f.getSelected()[0] || ''; }
      else if (f instanceof PL.PDFOptionList) { type = 'drop'; options = f.getOptions(); value = f.getSelected()[0] || ''; }
      else if (f instanceof PL.PDFRadioGroup) { type = 'radio'; options = f.getOptions(); value = f.getSelected() || ''; }
      if (!type) continue;
      const name = f.getName();
      let multiline = false; try { multiline = type === 'text' && f.isMultiline(); } catch (e) {}
      const widgets = f.acroField.getWidgets().map((w, wi) => {
        const ref = ld.context.getObjectRef(w.dict); const r = w.getRectangle();
        return { page: ref ? pageOf.get(String(ref)) : undefined, x: r.x, y: r.y, w: r.width, h: r.height, opt: options ? options[wi] : null };
      }).filter((w) => w.page !== undefined && w.w > 0 && w.h > 0);
      const fld = { name, type, value, options, readOnly: f.isReadOnly(), multiline, widgets };
      doc.fields.push(fld);
      for (const w of widgets) { if (!doc.widgets.has(w.page)) doc.widgets.set(w.page, []); doc.widgets.get(w.page).push({ ...w, field: fld }); }
    }
  } catch (e) { /* not fatal: no form support for this file */ }
}
async function addFiles(files, at = S.pages.length) {
  files = [...files]; if (!files.length) return;
  const t = toast(files.length > 1 ? `Opening ${files.length} files` : `Opening ${files[0].name}`, { spin: true, sticky: true });
  const newPages = []; let firstName = null, formCount = 0;
  for (const f of files) {
    try {
      if (isPdf(f)) {
        const bytes = new Uint8Array(await f.arrayBuffer());
        let pdf = null, pw = undefined, wrong = false;
        for (;;) {
          try { pdf = await pdfjsLib.getDocument({ ...PDFJS_OPTS, data: bytes.slice(), password: pw }).promise; break; }
          catch (e) {
            if (e && e.name === 'PasswordException') { t.remove(); pw = await askPassword(f.name, wrong); wrong = true; if (pw == null) break; continue; }
            throw e;
          }
        }
        if (!pdf) continue;
        const doc = { id: uid('d'), name: f.name, bytes, pdf, password: pw, fields: [], values: {}, widgets: new Map() };
        await readFields(doc); if (pw) doc.encrypted = true;
        formCount += doc.fields.length;
        S.docs.set(doc.id, doc);
        for (let i = 0; i < pdf.numPages; i++) {
          const pg = await pdf.getPage(i + 1);
          newPages.push({ id: uid('p'), kind: 'pdf', docId: doc.id, index: i, view: pg.view.slice(), baseRot: pg.rotate || 0, rot: 0, annots: [] });
        }
        firstName = firstName || f.name.replace(/\.pdf$/i, '');
      } else if (isImg(f)) {
        const im = await normImage(await readAsDataURL(f));
        const id = uid('i'); S.imgs.set(id, im);
        const L = 842, k = L / Math.max(im.w, im.h);
        newPages.push({ id: uid('p'), kind: 'img', imgId: id, view: [0, 0, Math.round(im.w * k * 100) / 100, Math.round(im.h * k * 100) / 100], baseRot: 0, rot: 0, annots: [] });
        firstName = firstName || f.name.replace(/\.[^.]+$/, '');
      } else { toast(`${f.name} is not a PDF or image`, { err: true }); }
    } catch (e) { console.error(e); toast(`Could not open ${f.name}. The file may be damaged.`, { err: true, ms: 4000 }); }
  }
  t.remove();
  if (!newPages.length) return;
  const wasEmpty = !S.pages.length;
  S.pages.splice(at, 0, ...newPages);
  if (wasEmpty) { $('#docName').value = firstName || 'Untitled'; if (innerWidth > 760) setSidebar(true); }
  renderAll(); commit();
  if (wasEmpty) { setDirty(false); resetHistory(); updateChrome(); }
  else { toast(`Added ${newPages.length} page${newPages.length > 1 ? 's' : ''}`); scrollToPage(at); }
  if (formCount) toast(`This PDF has ${formCount} form field${formCount > 1 ? 's' : ''}. Tap a field to fill it.`, { ms: 4200 });
}
function newBlank(at = S.pages.length, like) {
  const view = like ? (tr(like) % 180 ? [0, 0, like.view[3] - like.view[1], like.view[2] - like.view[0]] : [0, 0, like.view[2] - like.view[0], like.view[3] - like.view[1]]) : [0, 0, 595.28, 841.89];
  S.pages.splice(at, 0, { id: uid('p'), kind: 'blank', view, baseRot: 0, rot: 0, annots: [] });
  if (S.pages.length === 1) { $('#docName').value = 'Untitled'; if (innerWidth > 760) setSidebar(true); }
  renderAll(); commit(); scrollToPage(at);
}
function closeDoc() {
  for (const d of S.docs.values()) { try { d.pdf.loadingTask.destroy(); } catch (e) {} }
  S.docs.clear(); S.imgs.clear(); S.pages = []; S.sel = null; S.selPages.clear(); thumbCache.clear();
  $('#docName').value = 'Untitled'; setTool('select'); renderAll(); resetHistory(); setDirty(false); updateChrome(); setSidebar(false);
}

/* ---------- Rendering: pages ---------- */
const pagesEl = $('#pages'), viewer = $('#viewer');
let io = null;
function fitZoom() {
  if (!S.pages.length) return 1;
  const avail = Math.max(200, viewer.clientWidth - (innerWidth <= 760 ? 24 : 64));
  const ws = S.pages.map((p) => geo(p).w).sort((a, b) => a - b);
  const target = ws[ws.length - 1];
  return clamp(avail / target, 0.25, innerWidth <= 760 ? 3 : 1.6);
}
function renderAll() {
  closeEditor(true);
  if (S.fit) S.zoom = fitZoom();
  pagesEl.innerHTML = '';
  if (io) io.disconnect();
  io = new IntersectionObserver((ents) => { for (const e of ents) { const el = e.target; el._vis = e.isIntersecting; if (e.isIntersecting) paintCanvas(el); else freeCanvas(el); } }, { root: viewer, rootMargin: '900px 0px' });
  S.pages.forEach((p, i) => {
    const g = geo(p);
    const el = document.createElement('div'); el.className = 'page'; el.dataset.id = p.id;
    el.style.width = g.w * S.zoom + 'px'; el.style.height = g.h * S.zoom + 'px';
    el.innerHTML = `<canvas></canvas><div class="formlayer"></div><svg class="ov" viewBox="0 0 ${g.w} ${g.h}" xmlns="${SVGNS}" aria-label="Page ${i + 1}"></svg><span class="pnum">${i + 1}</span>`;
    pagesEl.appendChild(el); io.observe(el);
    drawOverlay(p, el); drawForm(p, el);
  });
  $('#empty').hidden = S.pages.length > 0;
  $('#pageInd').hidden = S.pages.length === 0;
  renderThumbs(); updateChrome(); updateZoomLbl(); onScroll();
}
function pageEl(id) { return pagesEl.querySelector(`.page[data-id="${id}"]`); }
const pageById = (id) => S.pages.find((p) => p.id === id);
function freeCanvas(el) { const c = el.querySelector('canvas'); if (el._task) { try { el._task.cancel(); } catch (e) {} el._task = null; } c.width = 0; c.height = 0; el._key = null; }
async function paintCanvas(el) {
  const p = pageById(el.dataset.id); if (!p) return;
  const key = S.zoom.toFixed(3) + '|' + tr(p);
  if (el._key === key) return; el._key = key;
  const g = geo(p); const c = el.querySelector('canvas');
  let dpr = Math.min(window.devicePixelRatio || 1, 2.5); const W = g.w * S.zoom, H = g.h * S.zoom;
  while (W * H * dpr * dpr > 14e6 && dpr > 0.6) dpr -= 0.25;
  if (el._task) { try { el._task.cancel(); } catch (e) {} el._task = null; }
  const off = document.createElement('canvas'); off.width = Math.round(W * dpr); off.height = Math.round(H * dpr);
  const ctx = off.getContext('2d');
  try {
    if (p.kind === 'pdf') {
      const doc = S.docs.get(p.docId); const pg = await doc.pdf.getPage(p.index + 1);
      if (el._key !== key) return;
      const vp = pg.getViewport({ scale: S.zoom * dpr, rotation: tr(p) });
      off.width = Math.round(vp.width); off.height = Math.round(vp.height);
      const task = pg.render({ canvasContext: off.getContext('2d'), viewport: vp, annotationMode: doc.fields.length ? pdfjsLib.AnnotationMode.ENABLE_FORMS : pdfjsLib.AnnotationMode.ENABLE });
      el._task = task; await task.promise; el._task = null;
    } else {
      ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, off.width, off.height);
      if (p.kind === 'img') {
        const im = S.imgs.get(p.imgId); const s = S.zoom * dpr; const t = g.t;
        ctx.setTransform(t[0] * s, t[1] * s, t[2] * s, t[3] * s, t[4] * s, t[5] * s);
        const [x0, y0, x1, y1] = p.view; ctx.transform(x1 - x0, 0, 0, -(y1 - y0), x0, y1);
        ctx.drawImage(im.el, 0, 0, 1, 1);
      }
    }
    if (el._key !== key) return;
    c.width = off.width; c.height = off.height; c.getContext('2d').drawImage(off, 0, 0);
  } catch (e) { if (e && e.name !== 'RenderingCancelledException') console.error(e); el._key = null; }
}
function rerenderVisible() { for (const el of $$('.page', pagesEl)) { el._key = null; if (el._vis) paintCanvas(el); } }

/* ---------- Overlay SVG ---------- */
const sv = (tag, attrs) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); return e; };
function annNode(a) {
  const g = sv('g', { 'data-id': a.id });
  const w = a.width || 1.5;
  if (a.t === 'white') g.appendChild(sv('rect', { x: a.x, y: a.y, width: a.w, height: a.h, fill: '#ffffff' }));
  else if (a.t === 'hl') g.appendChild(sv('rect', { x: a.x, y: a.y, width: a.w, height: a.h, fill: a.color, 'fill-opacity': 0.4, style: 'mix-blend-mode:multiply' }));
  else if (a.t === 'rect') g.appendChild(sv('rect', { x: a.x + w / 2, y: a.y + w / 2, width: Math.max(0, a.w - w), height: Math.max(0, a.h - w), fill: 'none', stroke: a.color, 'stroke-width': w }));
  else if (a.t === 'line' || a.t === 'arrow') {
    const [p0, p1] = a.pts; g.appendChild(sv('line', { x1: p0[0], y1: p0[1], x2: p1[0], y2: p1[1], stroke: a.color, 'stroke-width': w, 'stroke-linecap': 'round' }));
    if (a.t === 'arrow') for (const [s, e] of arrowHead(a)) g.appendChild(sv('line', { x1: s[0], y1: s[1], x2: e[0], y2: e[1], stroke: a.color, 'stroke-width': w, 'stroke-linecap': 'round' }));
  } else if (a.t === 'pen') g.appendChild(sv('polyline', { points: a.pts.map((p) => p.join(',')).join(' '), fill: 'none', stroke: a.color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
  else if (ORIENTED.has(a.t)) {
    const { U, V } = UV(a.r);
    const fr = sv('g', { transform: `matrix(${U[0]} ${U[1]} ${-V[0]} ${-V[1]} ${a.ax + a.h * V[0]} ${a.ay + a.h * V[1]})` });
    if (a.t === 'image') { const im = S.imgs.get(a.imgId); if (im) fr.appendChild(sv('image', { href: im.src, x: 0, y: 0, width: a.w, height: a.h, preserveAspectRatio: 'none' })); }
    else if (a.t === 'text') {
      const lines = String(a.text || '').split('\n');
      lines.forEach((l, i) => { const t = sv('text', { x: 0, y: BASE * a.size + i * LH * a.size, 'font-family': 'Helvetica, Arial, "Liberation Sans", sans-serif', 'font-size': a.size, fill: a.color, 'xml:space': 'preserve' }); t.textContent = l; fr.appendChild(t); });
    } else {
      const segs = a.t === 'tick' ? [TICK] : CROSS;
      for (const s of segs) fr.appendChild(sv('polyline', { points: s.map(([p, q]) => `${p * a.w},${q * a.h}`).join(' '), fill: 'none', stroke: a.color, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
    }
    g.appendChild(fr);
  }
  return g;
}
function drawOverlay(p, el = pageEl(p.id)) {
  if (!el) return;
  const svg = el.querySelector('svg.ov'); const g = geo(p);
  svg.setAttribute('viewBox', `0 0 ${g.w} ${g.h}`);
  svg.innerHTML = '';
  const content = sv('g', { transform: `matrix(${g.t.join(' ')})` });
  const ui = sv('g', { class: 'ui' });
  for (const a of p.annots) {
    if (S.editing && S.editing.annId === a.id) continue;
    content.appendChild(annNode(a));
    const b = dispBox(a, g), pad = 6 / S.zoom;
    ui.appendChild(sv('rect', { class: 'ann hit', 'data-id': a.id, x: b.L - pad, y: b.T - pad, width: b.R - b.L + 2 * pad, height: b.B - b.T + 2 * pad, fill: 'transparent' }));
  }
  if (S.sel && S.sel.pageId === p.id) {
    const a = p.annots.find((z) => z.id === S.sel.annId);
    if (a && !(S.editing && S.editing.annId === a.id)) {
      const b = dispBox(a, g), pad = 4 / S.zoom, r = 7 / S.zoom;
      ui.appendChild(sv('rect', { class: 'selbox', x: b.L - pad, y: b.T - pad, width: b.R - b.L + 2 * pad, height: b.B - b.T + 2 * pad }));
      ui.appendChild(sv('circle', { class: 'handle-hit', 'data-h': 'se', cx: b.R + pad, cy: b.B + pad, r: r * 2.4 }));
      ui.appendChild(sv('circle', { class: 'handle', 'data-h': 'se', cx: b.R + pad, cy: b.B + pad, r }));
    }
  }
  svg.appendChild(content); svg.appendChild(ui);
  scheduleThumb(p.id);
}

/* ---------- Inline form fields ---------- */
function fieldValue(doc, f) { return Object.prototype.hasOwnProperty.call(doc.values, f.name) ? doc.values[f.name] : f.value; }
function drawForm(p, el = pageEl(p.id)) {
  if (!el) return; const lay = el.querySelector('.formlayer'); lay.innerHTML = '';
  if (p.kind !== 'pdf') return;
  const doc = S.docs.get(p.docId); const ws = doc && doc.widgets.get(p.index); if (!ws || !ws.length) return;
  const g = geo(p); const Z = S.zoom;
  lay.style.cssText = 'position:absolute;inset:0;z-index:2;pointer-events:none';
  for (const w of ws) {
    const f = w.field; const pts = [ap(g.t, w.x, w.y), ap(g.t, w.x + w.w, w.y + w.h)];
    const L = Math.min(pts[0][0], pts[1][0]) * Z, T = Math.min(pts[0][1], pts[1][1]) * Z, W = Math.abs(pts[0][0] - pts[1][0]) * Z, H = Math.abs(pts[0][1] - pts[1][1]) * Z;
    let node;
    const val = fieldValue(doc, f);
    if (f.type === 'text') {
      node = document.createElement(f.multiline ? 'textarea' : 'input'); node.value = val || '';
      node.addEventListener('input', () => { doc.values[f.name] = node.value; syncField(doc, f, node); });
      node.addEventListener('change', commit);
      node.style.fontSize = Math.max(8, Math.min(H * 0.62, 12 * Z)) + 'px';
    } else if (f.type === 'check' || f.type === 'radio') {
      node = document.createElement('button'); node.type = 'button';
      const on = f.type === 'check' ? !!val : val === w.opt;
      node.setAttribute('aria-pressed', on); node.setAttribute('role', f.type === 'check' ? 'checkbox' : 'radio'); node.setAttribute('aria-checked', on);
      node.innerHTML = on ? icon(f.type === 'check' ? 'check' : 'check') : '';
      node.addEventListener('click', () => {
        if (f.readOnly) return;
        doc.values[f.name] = f.type === 'check' ? !fieldValue(doc, f) : (fieldValue(doc, f) === w.opt ? '' : w.opt);
        refreshForms(doc); commit();
      });
    } else if (f.type === 'drop') {
      node = document.createElement('select');
      node.innerHTML = '<option value=""></option>' + (f.options || []).map((o) => `<option${o === val ? ' selected' : ''}>${esc(o)}</option>`).join('');
      node.addEventListener('change', () => { doc.values[f.name] = node.value; refreshForms(doc); commit(); });
      node.style.fontSize = Math.max(8, Math.min(H * 0.6, 12 * Z)) + 'px';
    }
    if (!node) continue;
    node.className = 'ff ff-' + f.type; node.dataset.field = f.name; node.title = f.name; node.setAttribute('aria-label', f.name);
    if (f.readOnly) node.disabled = true;
    Object.assign(node.style, { position: 'absolute', left: L + 'px', top: T + 'px', width: W + 'px', height: H + 'px', pointerEvents: 'auto' });
    lay.appendChild(node);
  }
}
function syncField(doc, f, src) { for (const n of $$(`.ff[data-field="${CSS.escape(f.name)}"]`)) if (n !== src && n.tagName !== 'BUTTON') n.value = doc.values[f.name]; }
function refreshForms(doc) { for (const p of S.pages) if (p.docId === doc.id) drawForm(p); }

/* ---------- Thumbnails ---------- */
const sbList = $('#sbList');
const thumbCache = new Map();
let thumbQ = new Set(), thumbBusy = false;
function renderThumbs() {
  sbList.innerHTML = '';
  S.pages.forEach((p, i) => {
    const b = document.createElement('button'); b.className = 'thumb'; b.dataset.id = p.id; b.draggable = true;
    b.setAttribute('aria-label', `Page ${i + 1}`);
    b.innerHTML = `<div class="tw"><canvas width="1" height="1"></canvas></div><span class="tn">${i + 1}</span><span class="chk">${icon('check', 'style="width:13px;height:13px;stroke-width:2.6"')}</span>`;
    sbList.appendChild(b); scheduleThumb(p.id);
  });
  markThumbs();
  $('#sbTitle').textContent = S.pages.length ? `${S.pages.length} page${S.pages.length > 1 ? 's' : ''}` : 'Pages';
}
function markThumbs() {
  $$('.thumb', sbList).forEach((b, i) => { b.classList.toggle('current', i === S.current); b.classList.toggle('sel', S.selPages.has(b.dataset.id)); });
}
function scheduleThumb(id) { thumbQ.add(id); if (!thumbBusy) setTimeout(runThumbs, 60); }
async function runThumbs() {
  if (thumbBusy) return; thumbBusy = true;
  while (thumbQ.size) {
    const id = thumbQ.values().next().value; thumbQ.delete(id);
    const p = pageById(id); const b = sbList.querySelector(`.thumb[data-id="${id}"]`); if (!p || !b) continue;
    try { await paintThumb(p, b.querySelector('canvas')); } catch (e) { console.error(e); }
  }
  thumbBusy = false;
}
async function basePageBitmap(p, s) {
  const key = p.id + '|' + tr(p);
  if (thumbCache.has(key)) return thumbCache.get(key);
  const g = geo(p); const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(g.w * s)); c.height = Math.max(1, Math.round(g.h * s));
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  if (p.kind === 'pdf') { const pg = await S.docs.get(p.docId).pdf.getPage(p.index + 1); await pg.render({ canvasContext: x, viewport: pg.getViewport({ scale: s, rotation: tr(p) }) }).promise; }
  else if (p.kind === 'img') { const t = g.t; x.setTransform(t[0] * s, t[1] * s, t[2] * s, t[3] * s, t[4] * s, t[5] * s); const [x0, y0, x1, y1] = p.view; x.transform(x1 - x0, 0, 0, -(y1 - y0), x0, y1); x.drawImage(S.imgs.get(p.imgId).el, 0, 0, 1, 1); }
  thumbCache.set(key, c); return c;
}
async function paintThumb(p, cv) {
  const g = geo(p); const dpr = Math.min(devicePixelRatio || 1, 2); const s = Math.min(150 / g.w, 196 / g.h) * dpr;
  const basec = await basePageBitmap(p, s);
  cv.width = basec.width; cv.height = basec.height; cv.style.width = basec.width / dpr + 'px'; cv.style.height = basec.height / dpr + 'px';
  const x = cv.getContext('2d'); x.drawImage(basec, 0, 0);
  if (p.annots.length) {
    const svg = sv('svg', { xmlns: SVGNS, viewBox: `0 0 ${g.w} ${g.h}`, width: basec.width, height: basec.height });
    const content = sv('g', { transform: `matrix(${g.t.join(' ')})` }); p.annots.forEach((a) => content.appendChild(annNode(a))); svg.appendChild(content);
    const url = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svg));
    try { const im = await loadImageEl(url); x.drawImage(im, 0, 0); } catch (e) {}
  }
}

/* ---------- Scroll, zoom ---------- */
let scrollRaf = 0;
function onScroll() {
  if (scrollRaf) return;
  scrollRaf = requestAnimationFrame(() => {
    scrollRaf = 0; if (!S.pages.length) return;
    const mid = viewer.scrollTop + viewer.clientHeight * 0.35; let cur = 0;
    $$('.page', pagesEl).forEach((el, i) => { if (el.offsetTop <= mid) cur = i; });
    if (cur !== S.current) { S.current = cur; markThumbs(); const tb = sbList.children[cur]; if (tb && !sbList.matches(':hover')) tb.scrollIntoView({ block: 'nearest' }); }
    $('#pageInd').textContent = `${S.current + 1} / ${S.pages.length}`;
  });
}
viewer.addEventListener('scroll', onScroll, { passive: true });
function scrollToPage(i, smooth = true) { const el = $$('.page', pagesEl)[i]; if (el) viewer.scrollTo({ top: el.offsetTop - 18, behavior: smooth ? 'smooth' : 'auto' }); }
function setZoom(z, fit = false) {
  if (!S.pages.length) return;
  const ratio = viewer.scrollTop / Math.max(1, viewer.scrollHeight);
  S.fit = fit; S.zoom = fit ? fitZoom() : clamp(z, 0.25, 5);
  closeEditor(false);
  S.pages.forEach((p) => { const el = pageEl(p.id); const g = geo(p); el.style.width = g.w * S.zoom + 'px'; el.style.height = g.h * S.zoom + 'px'; drawOverlay(p, el); drawForm(p, el); });
  viewer.scrollTop = ratio * viewer.scrollHeight; rerenderVisible(); updateZoomLbl();
}
function updateZoomLbl() { $('#zoomLbl').textContent = Math.round(S.zoom * 75) + '%'; }
let resizeT; addEventListener('resize', () => { clearTimeout(resizeT); resizeT = setTimeout(() => { if (S.fit && S.pages.length) setZoom(0, true); }, 150); });
viewer.addEventListener('wheel', (e) => { if (!(e.ctrlKey || e.metaKey) || !S.pages.length) return; e.preventDefault(); setZoom(S.zoom * Math.exp(-e.deltaY * 0.0025)); }, { passive: false });

/* ---------- Pointer interaction ---------- */
function ptFromEvent(e, el) { const r = el.getBoundingClientRect(); return [(e.clientX - r.left) / S.zoom, (e.clientY - r.top) / S.zoom]; }
let drag = null, lastTap = { t: 0, id: null };
pagesEl.addEventListener('pointerdown', (e) => {
  const el = e.target.closest('.page'); if (!el || e.button > 0) return;
  if (e.target.closest('.ff')) return;
  const p = pageById(el.dataset.id); const g = geo(p); const pt = ptFromEvent(e, el);
  const pdfPt = ap(g.i, pt[0], pt[1]);
  closeMenu();
  if (S.editing) { closeEditor(false); if (S.tool === 'text') { return; } }
  const tool = S.tool;
  if (tool === 'select') {
    const h = e.target.closest('.handle, .handle-hit');
    const hit = e.target.closest('.ann');
    if (h && S.sel && S.sel.pageId === p.id) {
      const a = p.annots.find((z) => z.id === S.sel.annId); if (!a) return;
      drag = { mode: 'resize', p, el, g, a, orig: JSON.parse(JSON.stringify(a)), box: dispBox(a, g), start: pt, id: e.pointerId };
    } else if (hit) {
      const a = p.annots.find((z) => z.id === hit.dataset.id); if (!a) return;
      const now = Date.now();
      if (a.t === 'text' && lastTap.id === a.id && now - lastTap.t < 380) { lastTap = { t: 0, id: null }; e.preventDefault(); openEditor(p, a); return; }
      lastTap = { t: now, id: a.id };
      select(p.id, a.id);
      drag = { mode: 'move', p, el, g, a, orig: JSON.parse(JSON.stringify(a)), start: pt, id: e.pointerId };
    } else { if (S.sel) { select(null); } return; }
    e.preventDefault(); el.querySelector('svg.ov').setPointerCapture(e.pointerId); return;
  }
  e.preventDefault();
  const c = (k) => (k === 'hl' ? S.style.hl : S.style.ink);
  if (tool === 'text') {
    const hitText = [...p.annots].reverse().find((a) => a.t === 'text' && (() => { const b = dispBox(a, g); return pt[0] >= b.L && pt[0] <= b.R && pt[1] >= b.T && pt[1] <= b.B; })());
    if (hitText) { openEditor(p, hitText); return; }
    const size = S.style.size; const r = tr(p);
    const topLeftDisp = [pt[0], pt[1] - size * 0.6];
    const a = { id: uid('a'), t: 'text', r, text: '', size, color: S.style.ink, w: 1, h: LH * size, ax: 0, ay: 0 };
    const [ax, ay] = ap(g.i, topLeftDisp[0], topLeftDisp[1] + a.h); a.ax = ax; a.ay = ay;
    p.annots.push(a); openEditor(p, a, true); return;
  }
  if (tool === 'tick' || tool === 'cross' || tool === 'image') {
    let w, h, imgId;
    if (tool === 'image') { const it = S.pendingImg; if (!it) return; imgId = ensureLibImg(it); w = it.w >= it.h ? 150 : 150 * it.w / it.h; h = w * it.h / it.w; if (h > 90 && it.h > it.w) { h = 90; w = h * it.w / it.h; } }
    else { w = h = Math.max(8, S.style.size * 1.2); }
    const r = tr(p); const [ax, ay] = ap(g.i, pt[0] - w / 2, pt[1] + h / 2);
    const a = { id: uid('a'), t: tool, r, w, h, ax, ay, color: S.style.ink, width: Math.max(1.2, S.style.width * 1.2), imgId };
    p.annots.push(a); drawOverlay(p, el); commit();
    if (tool === 'image') { setTool('select'); select(p.id, a.id); toast('Placed. Drag to move, use the corner to resize.'); }
    return;
  }
  // drag-to-create tools
  let a;
  if (BOXES.has(tool)) a = { id: uid('a'), t: tool, x: pdfPt[0], y: pdfPt[1], w: 0, h: 0, color: c(tool), width: S.style.width };
  else if (tool === 'line' || tool === 'arrow') a = { id: uid('a'), t: tool, pts: [pdfPt, pdfPt.slice()], color: S.style.ink, width: S.style.width };
  else if (tool === 'pen') a = { id: uid('a'), t: 'pen', pts: [pdfPt], color: S.style.ink, width: S.style.width };
  if (!a) return;
  p.annots.push(a);
  drag = { mode: 'create', p, el, g, a, start: pt, startPdf: pdfPt, id: e.pointerId };
  el.querySelector('svg.ov').setPointerCapture(e.pointerId);
});
pagesEl.addEventListener('pointermove', (e) => {
  if (!drag || e.pointerId !== drag.id) return;
  const { p, el, g, a } = drag; const pt = ptFromEvent(e, el); const pdfPt = ap(g.i, pt[0], pt[1]);
  if (drag.mode === 'create') {
    if (BOXES.has(a.t)) { const [x0, y0] = drag.startPdf; a.x = Math.min(x0, pdfPt[0]); a.y = Math.min(y0, pdfPt[1]); a.w = Math.abs(pdfPt[0] - x0); a.h = Math.abs(pdfPt[1] - y0); }
    else if (a.t === 'pen') { const lp = a.pts[a.pts.length - 1]; if (Math.hypot(lp[0] - pdfPt[0], lp[1] - pdfPt[1]) > 0.6 / S.zoom + 0.3) a.pts.push(pdfPt); }
    else { let q = pdfPt; if (e.shiftKey) { const [x0, y0] = a.pts[0]; const dx = q[0] - x0, dy = q[1] - y0, an = Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) * Math.PI / 4, L = Math.hypot(dx, dy); q = [x0 + L * Math.cos(an), y0 + L * Math.sin(an)]; } a.pts[1] = q; }
    drawOverlay(p, el); return;
  }
  const dx = pt[0] - drag.start[0], dy = pt[1] - drag.start[1];
  if (!drag.moved && Math.hypot(dx, dy) * S.zoom < 3) return;
  drag.moved = true;
  const fresh = JSON.parse(JSON.stringify(drag.orig)); const idx = p.annots.findIndex((z) => z.id === a.id);
  if (drag.mode === 'move') applyT(fresh, pdfAffineFromDisplay(g, (x, y) => [x + dx, y + dy]));
  else {
    const b = drag.box; const W0 = Math.max(1e-3, b.R - b.L), H0 = Math.max(1e-3, b.B - b.T);
    let sx = Math.max(0.05, (W0 + dx) / W0), sy = Math.max(0.05, (H0 + dy) / H0);
    const uniform = ORIENTED.has(a.t) || e.shiftKey; if (uniform && !ORIENTED.has(a.t)) { const s = Math.max(sx, sy); sx = sy = s; }
    applyT(fresh, pdfAffineFromDisplay(g, (x, y) => [b.L + (x - b.L) * sx, b.T + (y - b.T) * sy]), uniform);
    if (ORIENTED.has(a.t)) { const nb = dispBox(fresh, g); applyT(fresh, pdfAffineFromDisplay(g, (x, y) => [x + b.L - nb.L, y + b.T - nb.T])); }
  }
  p.annots[idx] = fresh; drag.a = fresh; drawOverlay(p, el);
});
function endDrag(e) {
  if (!drag || e.pointerId !== drag.id) return;
  const { p, el, a, mode } = drag; drag = null;
  if (mode === 'create') {
    let keep = true; const g = geo(p); const b = dispBox(a, g); const big = Math.max(b.R - b.L, b.B - b.T) * S.zoom;
    if (BOXES.has(a.t) && big < 6) {
      if (a.t === 'white' || a.t === 'hl') { const [ax, ay] = ap(g.i, b.L - 50, b.T + 8); const [bx, by] = ap(g.i, b.L + 50, b.T - 8); a.x = Math.min(ax, bx); a.y = Math.min(ay, by); a.w = Math.abs(bx - ax); a.h = Math.abs(by - ay); }
      else keep = false;
    } else if ((a.t === 'line' || a.t === 'arrow') && big < 6) keep = false;
    else if (a.t === 'pen' && a.pts.length < 2) { a.pts.push([a.pts[0][0] + 0.01, a.pts[0][1]]); }
    if (!keep) p.annots = p.annots.filter((z) => z.id !== a.id);
    drawOverlay(p, el); commit(); return;
  }
  drawOverlay(p, el); commit(); refreshFormatBar();
}
pagesEl.addEventListener('pointerup', endDrag);
pagesEl.addEventListener('pointercancel', endDrag);
pagesEl.addEventListener('dblclick', (e) => {
  const hit = e.target.closest('.ann'); const el = e.target.closest('.page'); if (!hit || !el) return;
  const p = pageById(el.dataset.id); const a = p.annots.find((z) => z.id === hit.dataset.id); if (a && a.t === 'text') openEditor(p, a);
});

function select(pageId, annId) {
  const prev = S.sel; S.sel = pageId ? { pageId, annId } : null;
  if (prev && prev.pageId !== pageId) { const pp = pageById(prev.pageId); if (pp) drawOverlay(pp); }
  if (pageId) drawOverlay(pageById(pageId));
  refreshFormatBar();
}
function selectedAnn() { if (!S.sel) return null; const p = pageById(S.sel.pageId); const a = p && p.annots.find((z) => z.id === S.sel.annId); return a ? { p, a } : null; }
function deleteSelected() { const s = selectedAnn(); if (!s) return; s.p.annots = s.p.annots.filter((z) => z !== s.a); S.sel = null; drawOverlay(s.p); commit(); refreshFormatBar(); }
function duplicateSelected() {
  const s = selectedAnn(); if (!s) return; const g = geo(s.p); const c = JSON.parse(JSON.stringify(s.a)); c.id = uid('a');
  applyT(c, pdfAffineFromDisplay(g, (x, y) => [x + 12, y + 12])); s.p.annots.push(c); select(s.p.id, c.id); commit();
}

/* ---------- Text editor ---------- */
function openEditor(p, a, isNew = false) {
  closeEditor(false); setTool(S.tool);
  const el = pageEl(p.id); const g = geo(p); S.editing = { pageId: p.id, annId: a.id, isNew }; S.sel = { pageId: p.id, annId: a.id };
  drawOverlay(p, el);
  const b = dispBox(a, g); const ta = document.createElement('textarea'); ta.className = 'textedit'; ta.id = 'textEditor';
  ta.value = a.text || ''; ta.spellcheck = true; ta.setAttribute('aria-label', 'Text');
  const fs = a.size * S.zoom;
  Object.assign(ta.style, { left: el.offsetLeft + b.L * S.zoom + 'px', top: el.offsetTop + b.T * S.zoom + 'px', fontSize: fs + 'px', color: a.color, minWidth: Math.max(40, fs * 2) + 'px' });
  const fitTa = () => { ta.style.width = '0px'; ta.style.height = '0px'; ta.style.width = Math.max(fs * 2, ta.scrollWidth + fs * 0.6) + 'px'; ta.style.height = ta.scrollHeight + 'px'; };
  ta.addEventListener('input', fitTa);
  ta.addEventListener('keydown', (e) => { if (e.key === 'Escape' || (e.key === 'Enter' && (e.metaKey || e.ctrlKey))) { e.preventDefault(); closeEditor(false); } e.stopPropagation(); });
  ta.addEventListener('blur', () => setTimeout(() => { if (S.editing && document.activeElement !== ta) closeEditor(false); }, 120));
  pagesEl.appendChild(ta); fitTa(); ta.focus({ preventScroll: true }); try { ta.setSelectionRange(ta.value.length, ta.value.length); } catch (e) {}
  refreshFormatBar();
}
function closeEditor(silent) {
  const ta = $('#textEditor'); const ed = S.editing; if (!ed) { if (ta) ta.remove(); return; }
  S.editing = null; const p = pageById(ed.pageId); const a = p && p.annots.find((z) => z.id === ed.annId);
  if (ta) ta.remove();
  if (!p || !a) return;
  const txt = ta ? ta.value.replace(/\s+$/, '') : a.text;
  if (!txt.trim()) { p.annots = p.annots.filter((z) => z !== a); S.sel = null; }
  else { const before = a.text; setText(a, txt); if (sanitize(txt) !== txt && before !== a.text) toast('Some characters are not supported by the PDF font and were replaced.'); }
  drawOverlay(p); if (!silent) commit(); refreshFormatBar();
}

/* ---------- Tools and format bar ---------- */
function buildTools() {
  $('#tools').innerHTML = TOOLS.map(([k, label, ic]) => k === 'sep' ? '<span class="tsep" aria-hidden="true"></span>' : `<button class="tool" data-tool="${k}" aria-pressed="${k === S.tool}" aria-label="${label}" title="${label}">${icon(ic)}</button>`).join('');
}
function setTool(t) {
  if (t !== 'image') S.pendingImg = t === 'image' ? S.pendingImg : null;
  S.tool = t; viewer.classList.toggle('drawing', DRAW_TOOLS.has(t)); viewer.dataset.tool = t;
  $$('#tools .tool').forEach((b) => b.setAttribute('aria-pressed', b.dataset.tool === t || (t === 'image' && b.dataset.tool === 'sign')));
  if (t !== 'select' && S.sel && !S.editing) select(null);
  refreshFormatBar();
}
$('#tools').addEventListener('click', (e) => {
  const b = e.target.closest('.tool'); if (!b) return;
  if (!S.pages.length) { toast('Open a PDF first'); return; }
  closeEditor(false);
  if (b.dataset.tool === 'sign') { openLibrary(); return; }
  setTool(b.dataset.tool);
});
function saveStyle() { lsSet('pdfmate.style', S.style); }
let styleCommitT;
function applyStyleToSel(fn) { const s = selectedAnn(); if (!s) return; fn(s.a); drawOverlay(s.p); clearTimeout(styleCommitT); styleCommitT = setTimeout(commit, 350); if (S.editing) { const ta = $('#textEditor'); if (ta) { ta.style.color = s.a.color; ta.style.fontSize = s.a.size * S.zoom + 'px'; ta.dispatchEvent(new Event('input')); } } }
function refreshFormatBar() {
  const fb = $('#formatBar'); const s = selectedAnn();
  const kind = s ? s.a.t : S.tool;
  if (!S.pages.length || (kind === 'select')) { fb.hidden = true; fb.innerHTML = ''; return; }
  const parts = [];
  const isHl = kind === 'hl';
  const cur = s ? s.a.color : (isHl ? S.style.hl : S.style.ink);
  const label = { text: 'Text', white: 'Whiteout', hl: 'Highlight', rect: 'Rectangle', line: 'Line', arrow: 'Arrow', pen: 'Pen', tick: 'Tick', cross: 'Cross', image: s ? 'Signature' : 'Place signature' }[kind] || '';
  parts.push(`<span class="fb-label">${label}</span>`);
  if (kind !== 'white' && kind !== 'image') {
    parts.push(`<div class="swatches" role="group" aria-label="Colour">${(isHl ? HLS : INKS).map(([n, c]) => `<button class="sw" data-color="${c}" style="background:${c}" aria-label="${n}" title="${n}" aria-pressed="${c.toLowerCase() === String(cur).toLowerCase()}"></button>`).join('')}</div>`);
  }
  if (kind === 'text') { const v = s ? s.a.size : S.style.size; parts.push(`<div class="stepper" role="group" aria-label="Font size"><button data-step="size" data-d="-1" aria-label="Smaller">−</button><output>${Math.round(v * 10) / 10} pt</output><button data-step="size" data-d="1" aria-label="Larger">+</button></div>`); }
  if (['rect', 'line', 'arrow', 'pen', 'tick', 'cross'].includes(kind)) { const v = s ? s.a.width : S.style.width; parts.push(`<div class="stepper" role="group" aria-label="Line width"><button data-step="width" data-d="-1" aria-label="Thinner">−</button><output>${Math.round(v * 10) / 10} pt</output><button data-step="width" data-d="1" aria-label="Thicker">+</button></div>`); }
  const hints = { white: 'Drag over text to cover it, then add new text on top.', hl: 'Drag over the text to highlight.', text: 'Click to type. Double-click text to edit.', image: 'Tap the page where the signature goes.', pen: 'Draw freehand.', line: 'Drag to draw. Hold Shift to snap.', arrow: 'Drag to draw. Hold Shift to snap.', rect: 'Drag to draw a box.', tick: 'Tap to place.', cross: 'Tap to place.' };
  parts.push('<span class="fb-spacer"></span>');
  if (s && !S.editing) {
    if (s.a.t === 'text') parts.push(`<button class="tbtn" data-act="edit">${icon('edit')}<span class="tb-hide-m">Edit</span></button>`);
    parts.push(`<button class="tbtn" data-act="dup" aria-label="Duplicate">${icon('dup')}<span class="tb-hide-m">Duplicate</span></button><button class="tbtn" data-act="del" style="color:var(--danger)" aria-label="Delete">${icon('trash')}<span class="tb-hide-m">Delete</span></button>`);
  } else if (hints[kind]) parts.push(`<span class="fb-hint">${hints[kind]}</span>`);
  if (!s && kind !== 'select') parts.push(`<button class="tbtn" data-act="done">Done</button>`);
  fb.innerHTML = parts.join(''); fb.hidden = false;
}
$('#formatBar').addEventListener('pointerdown', (e) => { if (S.editing && e.target.closest('button')) e.preventDefault(); });
$('#formatBar').addEventListener('click', (e) => {
  const sw = e.target.closest('.sw'); const st = e.target.closest('[data-step]'); const act = e.target.closest('[data-act]');
  const s = selectedAnn();
  if (sw) {
    const c = sw.dataset.color; const isHl = (s ? s.a.t : S.tool) === 'hl';
    if (isHl) S.style.hl = c; else S.style.ink = c; saveStyle();
    if (s) applyStyleToSel((a) => { a.color = c; });
    refreshFormatBar();
  } else if (st) {
    const d = +st.dataset.d;
    if (st.dataset.step === 'size') { const steps = [6, 7, 8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72]; const v = s ? s.a.size : S.style.size; const i = steps.findIndex((x) => x >= v - 0.01); const ni = clamp((i < 0 ? steps.length - 1 : i) + d, 0, steps.length - 1); const nv = steps[ni]; if (!s) { S.style.size = nv; saveStyle(); } else applyStyleToSel((a) => setText(a, null, nv)); }
    else { const steps = [0.5, 0.75, 1, 1.5, 2, 3, 4, 6, 8, 12]; const v = s ? s.a.width : S.style.width; const i = steps.findIndex((x) => x >= v - 0.01); const nv = steps[clamp((i < 0 ? steps.length - 1 : i) + d, 0, steps.length - 1)]; S.style.width = nv; saveStyle(); if (s) applyStyleToSel((a) => { a.width = nv; }); }
    refreshFormatBar();
  } else if (act) {
    const k = act.dataset.act;
    if (k === 'del') deleteSelected(); else if (k === 'dup') duplicateSelected(); else if (k === 'edit' && s) openEditor(s.p, s.a);
    else if (k === 'done') { closeEditor(false); setTool('select'); }
  }
});

/* ---------- Signatures and stamps ---------- */
function libItems() { return lsGet('pdfmate.lib', []); }
function ensureLibImg(it) { if (!S.imgs.has(it.id)) loadImageEl(it.src).then((el) => { const o = S.imgs.get(it.id); if (o) o.el = el; }); if (!S.imgs.has(it.id)) S.imgs.set(it.id, { src: it.src, w: it.w, h: it.h, el: null }); return it.id; }
function openLibrary() {
  const items = libItems();
  const sh = sheet(`<h2>Signatures and stamps</h2><p class="sub">Choose one to place on the page. They are saved on this device only.</p>
    ${items.length ? `<div class="lib">${items.map((it) => `<div class="libitem" role="button" tabindex="0" data-id="${it.id}" aria-label="Place ${esc(it.kind || 'item')}"><img src="${it.src}" alt=""><button class="del" data-del="${it.id}" aria-label="Delete">${icon('close')}</button></div>`).join('')}</div>` : '<div class="empty-lib">Nothing saved yet. Draw your signature or import a ship\'s stamp.</div>'}
    <div class="acts" style="justify-content:space-between"><button class="btn" data-x>Close</button><span style="display:flex;gap:10px;flex-wrap:wrap"><button class="btn" data-stamp>${icon('stamp')} Import stamp</button><button class="btn primary" data-new>${icon('sign')} New signature</button></span></div>`, { wide: true });
  sh.querySelector('[data-x]').onclick = closeSheet;
  sh.querySelector('[data-new]').onclick = openSigPad;
  sh.querySelector('[data-stamp]').onclick = () => $('#fileStamp').click();
  sh.addEventListener('click', (e) => {
    const d = e.target.closest('[data-del]'); if (d) { e.stopPropagation(); lsSet('pdfmate.lib', libItems().filter((x) => x.id !== d.dataset.del)); openLibrary(); return; }
    const it = e.target.closest('.libitem'); if (it) pickLib(it.dataset.id);
  });
  sh.addEventListener('keydown', (e) => { const it = e.target.closest('.libitem'); if (it && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); pickLib(it.dataset.id); } });
}
function pickLib(id) { const it = libItems().find((x) => x.id === id); if (!it) return; closeSheet(); S.pendingImg = it; ensureLibImg(it); setTool('image'); toast('Tap the page where it should go'); }
function trimCanvas(c) {
  const x = c.getContext('2d'); const { width: w, height: h } = c; const d = x.getImageData(0, 0, w, h).data;
  let L = w, T = h, R = -1, B = -1;
  for (let y = 0; y < h; y++) for (let i = 0; i < w; i++) if (d[(y * w + i) * 4 + 3] > 8) { if (i < L) L = i; if (i > R) R = i; if (y < T) T = y; if (y > B) B = y; }
  if (R < 0) return null; const pad = 6; L = Math.max(0, L - pad); T = Math.max(0, T - pad); R = Math.min(w - 1, R + pad); B = Math.min(h - 1, B + pad);
  const o = document.createElement('canvas'); o.width = R - L + 1; o.height = B - T + 1; o.getContext('2d').drawImage(c, L, T, o.width, o.height, 0, 0, o.width, o.height); return o;
}
function addToLib(c, kind) {
  const it = { id: uid('s'), kind, src: c.toDataURL('image/png'), w: c.width, h: c.height };
  const list = libItems(); list.unshift(it);
  if (!lsSet('pdfmate.lib', list.slice(0, 24))) { toast('Storage is full. Delete an old signature or stamp first.', { err: true }); return null; }
  return it;
}
function openSigPad() {
  let color = '#0b1a3a';
  const sh = sheet(`<h2>New signature</h2><p class="sub">Sign with your finger, stylus or mouse.</p>
    <div class="seg tabs2" role="group" aria-label="Ink"><button aria-pressed="true" data-ink="#0b1a3a">Dark blue</button><button aria-pressed="false" data-ink="#000000">Black</button><button aria-pressed="false" data-ink="#0040dd">Blue</button></div>
    <div class="sigpad"><span class="ph">Sign here</span><span class="x">×</span><span class="line"></span><canvas></canvas></div>
    <div class="acts" style="justify-content:space-between"><button class="btn" data-clear>Clear</button><span style="display:flex;gap:10px"><button class="btn" data-x>Cancel</button><button class="btn primary" data-save>Save and place</button></span></div>`, { wide: true });
  const cv = sh.querySelector('canvas'); const pad = sh.querySelector('.sigpad'); const ph = sh.querySelector('.ph');
  const size = () => { const r = pad.getBoundingClientRect(); const d = Math.min(devicePixelRatio || 1, 3); cv.width = Math.round(r.width * d * 1.5); cv.height = Math.round(r.height * d * 1.5); };
  requestAnimationFrame(size);
  const ctx = () => cv.getContext('2d'); let drawing = false, last = null, lastW = 0, inked = false;
  const pt = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * cv.width / r.width, (e.clientY - r.top) * cv.height / r.height, e.timeStamp]; };
  cv.addEventListener('pointerdown', (e) => { e.preventDefault(); cv.setPointerCapture(e.pointerId); drawing = true; last = pt(e); lastW = cv.width / 160; ph.hidden = true; inked = true; const x = ctx(); x.fillStyle = color; x.beginPath(); x.arc(last[0], last[1], lastW / 2, 0, 7); x.fill(); });
  cv.addEventListener('pointermove', (e) => {
    if (!drawing) return; const evs = e.getCoalescedEvents ? e.getCoalescedEvents() : [e];
    const x = ctx(); x.strokeStyle = color; x.lineCap = 'round'; x.lineJoin = 'round';
    for (const ev of evs) { const p = pt(ev); const dist = Math.hypot(p[0] - last[0], p[1] - last[1]); const dt = Math.max(1, p[2] - last[2]); const v = dist / dt; const base = cv.width / 150; const w = clamp(base * (1.6 - Math.min(1.2, v * 0.35)) * (ev.pressure && ev.pointerType === 'pen' ? 0.5 + ev.pressure : 1), base * 0.45, base * 1.8); const nw = lastW * 0.6 + w * 0.4; x.lineWidth = nw; x.beginPath(); x.moveTo(last[0], last[1]); x.lineTo(p[0], p[1]); x.stroke(); last = p; lastW = nw; }
  });
  const up = () => { drawing = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  sh.querySelector('[data-clear]').onclick = () => { ctx().clearRect(0, 0, cv.width, cv.height); ph.hidden = false; inked = false; };
  sh.querySelector('[data-x]').onclick = closeSheet;
  sh.querySelectorAll('[data-ink]').forEach((b) => b.onclick = () => { color = b.dataset.ink; sh.querySelectorAll('[data-ink]').forEach((z) => z.setAttribute('aria-pressed', z === b)); });
  sh.querySelector('[data-save]').onclick = () => {
    if (!inked) { toast('Draw your signature first'); return; }
    const t = trimCanvas(cv); if (!t) { toast('Draw your signature first'); return; }
    let o = t; const mx = 900; if (t.width > mx) { o = document.createElement('canvas'); o.width = mx; o.height = Math.round(t.height * mx / t.width); o.getContext('2d').drawImage(t, 0, 0, o.width, o.height); }
    const it = addToLib(o, 'signature'); if (!it) return; pickLib(it.id);
  };
}
$('#fileStamp').addEventListener('change', async (e) => {
  const f = e.target.files[0]; e.target.value = ''; if (!f) return;
  try {
    const src = await readAsDataURL(f); const im = await loadImageEl(src);
    const k = Math.min(1, 900 / Math.max(im.naturalWidth, im.naturalHeight)); const c = document.createElement('canvas'); c.width = Math.round(im.naturalWidth * k); c.height = Math.round(im.naturalHeight * k);
    c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
    const orig = c.getContext('2d').getImageData(0, 0, c.width, c.height);
    const sh = sheet(`<h2>Import stamp</h2><p class="sub">Use a clear photo or scan of the stamp on white paper.</p>
      <div style="background:repeating-conic-gradient(#e5e5ea 0 25%,#fff 0 50%) 0 0/16px 16px;border-radius:12px;padding:12px;display:flex;justify-content:center;margin-bottom:10px"><canvas id="stPrev" style="max-width:100%;max-height:220px"></canvas></div>
      <label class="chkrow"><input type="checkbox" id="stWhite" checked> Remove white background</label>
      <div class="acts"><button class="btn" data-x>Cancel</button><button class="btn primary" data-save>Save and place</button></div>`, { wide: true });
    const pv = sh.querySelector('#stPrev'); pv.width = c.width; pv.height = c.height;
    const paint = () => {
      const d = new ImageData(new Uint8ClampedArray(orig.data), c.width, c.height);
      if (sh.querySelector('#stWhite').checked) for (let i = 0; i < d.data.length; i += 4) { const m = Math.min(d.data[i], d.data[i + 1], d.data[i + 2]); if (m > 225) d.data[i + 3] = 0; else if (m > 175) d.data[i + 3] = Math.round(d.data[i + 3] * (225 - m) / 50); }
      pv.getContext('2d').putImageData(d, 0, 0);
    };
    paint(); sh.querySelector('#stWhite').onchange = paint;
    sh.querySelector('[data-x]').onclick = closeSheet;
    sh.querySelector('[data-save]').onclick = () => { const t = trimCanvas(pv) || pv; const it = addToLib(t, 'stamp'); if (it) pickLib(it.id); };
  } catch (err) { toast('Could not read that image', { err: true }); }
});

/* ---------- Pages actions ---------- */
function targetPages() { if (S.selPages.size) return S.pages.filter((p) => S.selPages.has(p.id)); return S.pages[S.current] ? [S.pages[S.current]] : []; }
function pageAction(k) {
  if (!S.pages.length) return;
  const tps = targetPages(); if (!tps.length && k !== 'blank') return;
  if (k === 'rotl' || k === 'rotr') {
    const d = k === 'rotl' ? -90 : 90;
    for (const p of tps) { p.rot = (((p.rot || 0) + d) % 360 + 360) % 360; }
    S.sel = null; renderAll(); commit(); scrollToPage(S.pages.indexOf(tps[0]), false);
  } else if (k === 'del') {
    const n = tps.length;
    const go = () => { const ids = new Set(tps.map((p) => p.id)); S.pages = S.pages.filter((p) => !ids.has(p.id)); S.selPages.clear(); S.current = Math.min(S.current, Math.max(0, S.pages.length - 1)); renderAll(); commit(); toast(`Deleted ${n} page${n > 1 ? 's' : ''}. Undo is available.`); };
    if (n >= S.pages.length) { confirmSheet('Delete every page?', 'This leaves an empty document.', 'Delete all', go); } else go();
  } else if (k === 'up' || k === 'down') {
    const ids = new Set(tps.map((p) => p.id)); const arr = S.pages.slice();
    if (k === 'up') { for (let i = 1; i < arr.length; i++) if (ids.has(arr[i].id) && !ids.has(arr[i - 1].id)) [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]]; }
    else { for (let i = arr.length - 2; i >= 0; i--) if (ids.has(arr[i].id) && !ids.has(arr[i + 1].id)) [arr[i + 1], arr[i]] = [arr[i], arr[i + 1]]; }
    S.pages = arr; S.current = S.pages.indexOf(tps[0]); renderAll(); commit(); scrollToPage(S.current, false);
  } else if (k === 'blank') { const at = (tps.length ? S.pages.indexOf(tps[tps.length - 1]) : S.current) + 1; newBlank(at, S.pages[at - 1]); }
}
$('#sbFoot').addEventListener('click', (e) => { const b = e.target.closest('[data-pa]'); if (b) pageAction(b.dataset.pa); });
$('#btnSelPages').addEventListener('click', () => { S.selecting = !S.selecting; if (!S.selecting) S.selPages.clear(); $('#sidebar').classList.toggle('selecting', S.selecting); $('#btnSelPages').textContent = S.selecting ? 'Done' : 'Select'; markThumbs(); updateChrome(); });
let lastThumbIdx = 0;
sbList.addEventListener('click', (e) => {
  const b = e.target.closest('.thumb'); if (!b) return; const i = $$('.thumb', sbList).indexOf(b);
  if (S.selecting || e.metaKey || e.ctrlKey) { S.selPages.has(b.dataset.id) ? S.selPages.delete(b.dataset.id) : S.selPages.add(b.dataset.id); }
  else if (e.shiftKey) { const [a, z] = [Math.min(lastThumbIdx, i), Math.max(lastThumbIdx, i)]; for (let k = a; k <= z; k++) S.selPages.add(S.pages[k].id); }
  else { S.selPages.clear(); S.current = i; scrollToPage(i); if (innerWidth <= 760) setSidebar(false); }
  lastThumbIdx = i; markThumbs(); updateChrome();
});
let dragThumb = null;
sbList.addEventListener('dragstart', (e) => { const b = e.target.closest('.thumb'); if (!b) return; dragThumb = b.dataset.id; e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', dragThumb); });
sbList.addEventListener('dragover', (e) => {
  if (!dragThumb) return; e.preventDefault(); $$('.thumb', sbList).forEach((t) => t.classList.remove('drop-before'));
  const b = e.target.closest('.thumb'); if (b) { const r = b.getBoundingClientRect(); const target = e.clientY > r.top + r.height / 2 ? b.nextElementSibling : b; if (target) target.classList.add('drop-before'); }
});
sbList.addEventListener('drop', (e) => {
  if (!dragThumb) return; e.preventDefault(); e.stopPropagation();
  const before = sbList.querySelector('.drop-before'); const moving = S.selPages.has(dragThumb) ? S.pages.filter((p) => S.selPages.has(p.id)) : [pageById(dragThumb)];
  const ids = new Set(moving.map((p) => p.id)); const rest = S.pages.filter((p) => !ids.has(p.id));
  let at = before ? rest.findIndex((p) => p.id === before.dataset.id) : rest.length; if (at < 0) at = rest.length;
  rest.splice(at, 0, ...moving); S.pages = rest; dragThumb = null; renderAll(); commit();
});
sbList.addEventListener('dragend', () => { dragThumb = null; $$('.thumb', sbList).forEach((t) => t.classList.remove('drop-before')); });
function setSidebar(open) { $('#app').classList.toggle('no-sidebar', !open); $('#btnSidebar').setAttribute('aria-pressed', open); setTimeout(() => { if (S.fit && S.pages.length) setZoom(0, true); }, 260); }

/* ---------- Export ---------- */
const hexRgb = (h) => { const n = parseInt(String(h || '#000').slice(1), 16); return PL.rgb(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255); };
const dataUrlBytes = (u) => { const b = atob(u.split(',')[1]); const a = new Uint8Array(b.length); for (let i = 0; i < b.length; i++) a[i] = b.charCodeAt(i); return a; };
async function rasterPage(doc, index, view) {
  const pg = await doc.pdf.getPage(index + 1); const vp = pg.getViewport({ scale: 2.2, rotation: 0 });
  const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
  const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
  await pg.render({ canvasContext: x, viewport: vp }).promise;
  return dataUrlBytes(c.toDataURL('image/jpeg', 0.9));
}
function fillForm(ld, doc) {
  const form = ld.getForm();
  try { form.deleteXFA(); } catch (e) {}
  for (const f of doc.fields) {
    if (!Object.prototype.hasOwnProperty.call(doc.values, f.name)) continue; const v = doc.values[f.name];
    try {
      const fs = Math.max(6, Math.min(11, Math.min(...(f.widgets.length ? f.widgets : [{ h: 18 }]).map((w) => w.h)) * 0.62));
      if (f.type === 'text') { const t = form.getTextField(f.name); if (!f.multiline) t.setFontSize(fs); else t.setFontSize(Math.min(fs, 10)); t.setText(sanitize(v || '')); }
      else if (f.type === 'check') { const c = form.getCheckBox(f.name); v ? c.check() : c.uncheck(); }
      else if (f.type === 'drop') { try { const d = form.getDropdown(f.name); try { d.setFontSize(fs); } catch (e) {} v ? d.select(v) : d.clear(); } catch (e) { const d = form.getOptionList(f.name); v ? d.select(v) : d.clear(); } }
      else if (f.type === 'radio') { const r = form.getRadioGroup(f.name); v ? r.select(v) : r.clear(); }
    } catch (e) { console.warn('field', f.name, e); }
  }
  form.flatten({ updateFieldAppearances: true });
}
async function buildPdf(list, onProgress, opts = {}) {
  const out = await PL.PDFDocument.create();
  out.setProducer('PDF Mate by Tango Juliet Dev'); out.setCreator('PDF Mate');
  const font = await out.embedFont(PL.StandardFonts.Helvetica);
  const libs = new Map(); const imgCache = new Map();
  const libFor = async (doc) => {
    if (libs.has(doc.id)) return libs.get(doc.id); let ld = null;
    if (!doc.encrypted) {
      try { ld = await PL.PDFDocument.load(doc.bytes, { updateMetadata: false }); }
      catch (e) { ld = null; }
      if (ld && doc.fields.length) {
        try { fillForm(ld, doc); }
        catch (e) { console.warn('flatten failed', e); try { ld = await PL.PDFDocument.load(doc.bytes, { updateMetadata: false }); } catch (e2) { ld = null; } doc._flatFail = true; }
      }
    }
    libs.set(doc.id, ld); return ld;
  };
  const embedImg = async (id) => {
    if (imgCache.has(id)) return imgCache.get(id); const im = S.imgs.get(id); const bytes = dataUrlBytes(im.src);
    const e = im.src.startsWith('data:image/png') ? await out.embedPng(bytes) : await out.embedJpg(bytes); imgCache.set(id, e); return e;
  };
  const isolate = (page) => { const ctx = out.context; const s = ctx.register(ctx.contentStream([PL.pushGraphicsState()])); const e = ctx.register(ctx.contentStream([PL.popGraphicsState()])); page.node.normalize(); page.node.wrapContentStreams(s, e); };
  for (let i = 0; i < list.length; i++) {
    const p = list[i]; let page = null;
    if (p.kind === 'pdf') {
      const doc = S.docs.get(p.docId); const ld = await libFor(doc);
      if (ld) { try { [page] = await out.copyPages(ld, [p.index]); out.addPage(page); isolate(page); } catch (e) { console.warn(e); page = null; } }
      if (!page) {
        const jpg = await out.embedJpg(await rasterPage(doc, p.index)); const [x0, y0, x1, y1] = p.view;
        page = out.addPage([x1 - x0, y1 - y0]); page.setMediaBox(x0, y0, x1 - x0, y1 - y0);
        page.drawImage(jpg, { x: x0, y: y0, width: x1 - x0, height: y1 - y0 });
      }
      page.setRotation(PL.degrees(tr(p)));
    } else {
      const [x0, y0, x1, y1] = p.view; page = out.addPage([x1 - x0, y1 - y0]);
      if (p.kind === 'img') page.drawImage(await embedImg(p.imgId), { x: 0, y: 0, width: x1 - x0, height: y1 - y0 });
      page.setRotation(PL.degrees(tr(p)));
    }
    for (const a of p.annots) await drawAnn(page, a, font, embedImg);
    if (onProgress) onProgress((i + 1) / list.length);
  }
  if (opts.duplex) {
    try { const vp = out.catalog.getOrCreateViewerPreferences(); vp.setDuplex(PL.Duplex[{ simplex: 'Simplex', long: 'DuplexFlipLongEdge', short: 'DuplexFlipShortEdge' }[opts.duplex]]); } catch (e) { console.warn(e); }
  }
  return out.save({ useObjectStreams: true });
}
async function drawAnn(page, a, font, embedImg) {
  const col = hexRgb(a.color); const w = a.width || 1.5; const RC = PL.LineCapStyle.Round;
  const seg = (s, e) => page.drawLine({ start: { x: s[0], y: s[1] }, end: { x: e[0], y: e[1] }, thickness: w, color: col, lineCap: RC });
  if (a.t === 'white') page.drawRectangle({ x: a.x, y: a.y, width: a.w, height: a.h, color: PL.rgb(1, 1, 1) });
  else if (a.t === 'hl') page.drawRectangle({ x: a.x, y: a.y, width: a.w, height: a.h, color: col, opacity: 0.4, blendMode: PL.BlendMode.Multiply });
  else if (a.t === 'rect') page.drawRectangle({ x: a.x + w / 2, y: a.y + w / 2, width: Math.max(0, a.w - w), height: Math.max(0, a.h - w), borderColor: col, borderWidth: w });
  else if (a.t === 'line' || a.t === 'arrow') { seg(a.pts[0], a.pts[1]); if (a.t === 'arrow') for (const [s, e] of arrowHead(a)) seg(s, e); }
  else if (a.t === 'pen') { if (a.pts.length === 1) seg(a.pts[0], a.pts[0]); for (let i = 1; i < a.pts.length; i++) seg(a.pts[i - 1], a.pts[i]); }
  else if (a.t === 'tick' || a.t === 'cross') { for (const [s, e] of markSegments(a)) seg(s, e); }
  else if (a.t === 'image') { const im = S.imgs.get(a.imgId); if (!im) return; page.drawImage(await embedImg(a.imgId), { x: a.ax, y: a.ay, width: a.w, height: a.h, rotate: PL.degrees(a.r) }); }
  else if (a.t === 'text') {
    const { V } = UV(a.r); const lines = String(a.text || '').split('\n');
    lines.forEach((l, i) => { if (!l) return; const v = a.h - (BASE * a.size + i * LH * a.size); page.drawText(l, { x: a.ax + v * V[0], y: a.ay + v * V[1], size: a.size, font, color: col, rotate: PL.degrees(a.r) }); });
  }
}
function fileName() { let n = ($('#docName').value || 'Untitled').trim().replace(/[\\/:*?"<>|]+/g, '-'); if (!/\.pdf$/i.test(n)) n += '.pdf'; return n; }
function openSave() {
  if (!S.pages.length) return; closeEditor(false);
  const nSel = S.selPages.size; const canShare = !!(navigator.canShare && window.File);
  let scope = 'all';
  const sh = sheet(`<h2>Save PDF</h2><p class="sub">${S.pages.length} page${S.pages.length > 1 ? 's' : ''}. Markup, signatures and form entries are written into the file.</p>
    <div class="field"><label for="saveName">File name</label><input id="saveName" class="inp" value="${esc(fileName())}" autocomplete="off"></div>
    ${nSel ? `<div class="field"><span class="flabel">Pages</span><div class="seg" role="group"><button aria-pressed="true" data-sc="all">All ${S.pages.length}</button><button aria-pressed="false" data-sc="sel">Selected ${nSel}</button></div></div>` : ''}
    <div class="progress" hidden><i></i></div>
    <div class="acts"><button class="btn" data-print>${icon('print')} Print</button>${canShare ? `<button class="btn" data-share>${icon('share')} Share</button>` : ''}<button class="btn primary" data-dl>${icon('download')} Download</button></div>`);
  sh.querySelectorAll('[data-sc]').forEach((b) => b.onclick = () => { scope = b.dataset.sc; sh.querySelectorAll('[data-sc]').forEach((z) => z.setAttribute('aria-pressed', z === b)); });
  const run = async (mode) => {
    const name = (() => { let n = sh.querySelector('#saveName').value.trim() || 'Untitled'; n = n.replace(/[\\/:*?"<>|]+/g, '-'); return /\.pdf$/i.test(n) ? n : n + '.pdf'; })();
    $('#docName').value = name.replace(/\.pdf$/i, '');
    const btns = sh.querySelectorAll('.acts .btn'); btns.forEach((b) => b.disabled = true);
    const pr = sh.querySelector('.progress'); pr.hidden = false; const bar = pr.querySelector('i');
    try {
      const list = scope === 'sel' ? S.pages.filter((p) => S.selPages.has(p.id)) : S.pages;
      const bytes = await buildPdf(list, (f) => { bar.style.width = Math.round(f * 100) + '%'; });
      const blob = new Blob([bytes], { type: 'application/pdf' });
      if (mode === 'share') {
        const file = new File([blob], name, { type: 'application/pdf' });
        if (navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], title: name }); } catch (e) { if (e.name !== 'AbortError') throw e; } }
        else { downloadBlob(blob, name); }
      } else downloadBlob(blob, name);
      closeSheet(); if (scope === 'all') setDirty(false);
      const flat = [...S.docs.values()].some((d) => d._flatFail);
      const sz = bytes.length >= 1048576 ? (bytes.length / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(bytes.length / 1024)) + ' KB';
      toast(flat ? 'Saved. Some form fields could not be flattened.' : `Saved ${name} (${sz})`);
    } catch (e) { console.error(e); btns.forEach((b) => b.disabled = false); pr.hidden = true; toast('Could not save. ' + (e && e.message ? e.message : ''), { err: true, ms: 5000 }); }
  };
  sh.querySelector('[data-dl]').onclick = () => run('dl');
  sh.querySelector('[data-print]').onclick = () => { closeSheet(); openPrint(); };
  const s2 = sh.querySelector('[data-share]'); if (s2) s2.onclick = () => run('share');
}
function downloadBlob(blob, name) { const u = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(u), 30000); }

/* ---------- Print ---------- */
function parseRange(str, n) {
  const out = []; const seen = new Set();
  for (const part of String(str).split(/[,;\s]+/).filter(Boolean)) {
    const m = /^(\d*)\s*-\s*(\d*)$/.exec(part); let a, b;
    if (m) { a = m[1] ? +m[1] : 1; b = m[2] ? +m[2] : n; } else if (/^\d+$/.test(part)) { a = b = +part; } else return null;
    if (a < 1 || b > n || a > b) return null;
    for (let i = a; i <= b; i++) if (!seen.has(i)) { seen.add(i); out.push(i - 1); }
  }
  return out.length ? out : null;
}
const flip = (p) => ({ ...p, rot: ((p.rot || 0) + 180) % 360 });
const blankLike = (p) => { const g = geo(p); return { id: uid('p'), kind: 'blank', view: [0, 0, g.w, g.h], baseRot: 0, rot: 0, annots: [] }; };
function manualSides(list, binding) {
  // Fronts: pages 1,3,5... Backs: pages 2,4,6... printed in reverse so the flipped stack lines up.
  const fronts = [], backs = [];
  for (let i = 0; i < list.length; i += 2) { fronts.push(list[i]); backs.push(list[i + 1] || blankLike(list[i])); }
  let b = backs.reverse();
  if (binding === 'short') b = b.map(flip);
  return { fronts, backs: b };
}
const canIframePrint = () => navigator.pdfViewerEnabled === true && !/android|iphone|ipad|ipod/i.test(navigator.userAgent) && !(navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
async function printBytes(bytes) {
  const blob = new Blob([bytes], { type: 'application/pdf' });
  if (canIframePrint()) {
    const old = $('#printFrame'); if (old) old.remove();
    const f = document.createElement('iframe'); f.id = 'printFrame'; f.title = 'Print';
    Object.assign(f.style, { position: 'fixed', right: '0', bottom: '0', width: '2px', height: '2px', border: '0', opacity: '0', pointerEvents: 'none' });
    const url = URL.createObjectURL(blob); f.src = url; document.body.appendChild(f);
    await new Promise((res) => { f.onload = res; setTimeout(res, 4000); });
    await new Promise((r) => setTimeout(r, 450));
    try { f.contentWindow.focus(); f.contentWindow.print(); return; }
    catch (e) { console.warn('iframe print failed, using page print', e); }
  }
  await printRaster(bytes);
}
async function printRaster(bytes) {
  const t = toast('Preparing pages for printing', { spin: true, sticky: true });
  const root = $('#printRoot') || Object.assign(document.createElement('div'), { id: 'printRoot' }); root.innerHTML = ''; document.body.appendChild(root);
  const urls = [];
  try {
    const pdf = await pdfjsLib.getDocument({ ...PDFJS_OPTS, data: bytes.slice() }).promise;
    for (let i = 1; i <= pdf.numPages; i++) {
      const pg = await pdf.getPage(i); const v1 = pg.getViewport({ scale: 1 }); const land = v1.width > v1.height;
      const scale = Math.min(200 / 72, 3600 / Math.max(v1.width, v1.height));
      const vp = pg.getViewport({ scale }); const c = document.createElement('canvas'); c.width = Math.round(vp.width); c.height = Math.round(vp.height);
      const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height);
      await pg.render({ canvasContext: x, viewport: vp }).promise;
      const blob = await new Promise((r) => c.toBlob(r, 'image/jpeg', 0.92)); const u = URL.createObjectURL(blob); urls.push(u);
      const d = document.createElement('div'); d.className = 'pp ' + (land ? 'pl' : 'pt'); d.innerHTML = `<img src="${u}" alt="">`; root.appendChild(d);
    }
    await Promise.all([...root.querySelectorAll('img')].map((im) => im.decode().catch(() => {})));
    try { pdf.loadingTask.destroy(); } catch (e) {}
  } catch (e) { console.error('print raster', e); t.remove(); toast('Could not prepare the pages for printing', { err: true }); return; }
  t.remove();
  const clean = () => { root.innerHTML = ''; urls.forEach((u) => URL.revokeObjectURL(u)); removeEventListener('afterprint', clean); };
  addEventListener('afterprint', clean);
  window.print();
}
function openPrint() {
  if (!S.pages.length) return; closeEditor(false);
  const nSel = S.selPages.size; const st = lsGet('pdfmate.print', { sides: 'one', bind: 'long' });
  let scope = nSel ? 'sel' : 'all', sides = st.sides, bind = st.bind;
  const desk = canIframePrint();
  const sh = sheet(`<h2>Print</h2><p class="sub">${S.pages.length} page${S.pages.length > 1 ? 's' : ''}. Markup, signatures and form entries print as shown.</p>
    <div class="field"><span class="flabel">Pages</span><div class="seg" role="group" aria-label="Pages"><button data-sc="all">All</button>${nSel ? `<button data-sc="sel">Selected ${nSel}</button>` : ''}<button data-sc="range">Range</button></div>
      <input id="prRange" class="inp" style="margin-top:8px" placeholder="For example 1-3, 6" inputmode="numeric" autocomplete="off" hidden></div>
    <div class="field"><span class="flabel">Sides</span><div class="seg" role="group" aria-label="Sides"><button data-sd="one">One-sided</button><button data-sd="two">Two-sided</button><button data-sd="manual">Manual two-sided</button></div></div>
    <div class="field" id="prBindF"><span class="flabel">Binding</span><div class="seg" role="group" aria-label="Binding" style="height:auto">
      <button data-bd="long" style="height:auto;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:4px">${icon('longedge', 'style="width:26px;height:26px"')}<span>Long edge</span><small style="color:var(--label-3);font-weight:400">Book style</small></button>
      <button data-bd="short" style="height:auto;padding:8px 6px;display:flex;flex-direction:column;align-items:center;gap:4px">${icon('shortedge', 'style="width:26px;height:26px"')}<span>Short edge</span><small style="color:var(--label-3);font-weight:400">Flip up, calendar style</small></button></div></div>
    <p class="sub" id="prNote" style="margin:4px 0 0"></p>
    <div class="progress" hidden><i></i></div>
    <div class="acts" id="prActs"></div>`);
  const range = sh.querySelector('#prRange');
  const pick = () => {
    if (scope === 'all') return S.pages;
    if (scope === 'sel') return S.pages.filter((p) => S.selPages.has(p.id));
    const idx = parseRange(range.value, S.pages.length); return idx ? idx.map((i) => S.pages[i]) : null;
  };
  const paint = () => {
    sh.querySelectorAll('[data-sc]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.sc === scope));
    sh.querySelectorAll('[data-sd]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.sd === sides));
    sh.querySelectorAll('[data-bd]').forEach((b) => b.setAttribute('aria-pressed', b.dataset.bd === bind));
    range.hidden = scope !== 'range'; sh.querySelector('#prBindF').hidden = sides === 'one';
    const edge = bind === 'long' ? 'long edge' : 'short edge';
    sh.querySelector('#prNote').innerHTML = sides === 'one' ? 'Prints on one side of each sheet.'
      : sides === 'two' ? (desk ? `The print dialog opens with two-sided printing set to flip on the ${edge}. If it is not ticked, open <b>More settings</b> and tick <b>Print on both sides</b>.` : `In the print screen choose <b>Two-sided</b> and <b>${bind === 'long' ? 'Long edge' : 'Short edge'}</b>.`)
      : `For printers that cannot print both sides. Print the fronts, put the printed stack back in the paper tray so the blank sides will be printed, then print the backs. Try it with two sheets first, because trays differ between printers.`;
    const acts = sh.querySelector('#prActs');
    acts.innerHTML = sides === 'manual'
      ? `<button class="btn" data-x>Cancel</button><button class="btn" data-go="fronts">1. Print fronts</button><button class="btn primary" data-go="backs">2. Print backs</button>`
      : `<button class="btn" data-x>Cancel</button><button class="btn primary" data-go="all">${icon('print')} Print</button>`;
    acts.querySelector('[data-x]').onclick = closeSheet;
    acts.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => run(b.dataset.go, b));
  };
  const run = async (what, btn) => {
    lsSet('pdfmate.print', { sides, bind });
    const list = pick(); if (!list || !list.length) { toast('Enter a page range such as 1-3, 6', { err: true }); range.focus(); return; }
    let pages = list, duplex = 'simplex';
    if (sides === 'two') duplex = bind;
    if (sides === 'manual') { const m = manualSides(list, bind); pages = what === 'fronts' ? m.fronts : m.backs; }
    const btns = sh.querySelectorAll('.acts .btn'); btns.forEach((b) => b.disabled = true);
    const pr = sh.querySelector('.progress'); pr.hidden = false; const bar = pr.querySelector('i'); bar.style.width = '0';
    try {
      const bytes = await buildPdf(pages, (f) => { bar.style.width = Math.round(f * 100) + '%'; }, { duplex });
      await printBytes(bytes);
      if (sides === 'manual' && what === 'fronts') { toast('Fronts sent. Turn the stack over, put it back in the tray, then tap Print backs.', { ms: 6000 }); btns.forEach((b) => b.disabled = false); pr.hidden = true; }
      else closeSheet();
    } catch (e) { console.error(e); btns.forEach((b) => b.disabled = false); pr.hidden = true; toast('Could not print. ' + (e && e.message ? e.message : ''), { err: true, ms: 5000 }); }
  };
  sh.addEventListener('click', (e) => {
    const sc = e.target.closest('[data-sc]'), sd = e.target.closest('[data-sd]'), bd = e.target.closest('[data-bd]');
    if (sc) { scope = sc.dataset.sc; paint(); if (scope === 'range') range.focus(); }
    if (sd) { sides = sd.dataset.sd; paint(); }
    if (bd) { bind = bd.dataset.bd; paint(); }
  });
  paint();
}

/* ---------- Form list sheet ---------- */
function openFormList() {
  const docs = [...S.docs.values()].filter((d) => d.fields.length && S.pages.some((p) => p.docId === d.id));
  if (!docs.length) { toast('No fillable form fields in this document'); return; }
  const rows = docs.map((d) => `<div class="mh" style="padding:10px 0 4px;font-size:12px;font-weight:700;color:var(--label-3)">${esc(d.name)}</div>` + d.fields.map((f, i) => {
    const v = fieldValue(d, f); const id = `f_${d.id}_${i}`;
    let inp;
    if (f.type === 'text') inp = `<input class="inp" id="${id}" value="${esc(v)}" ${f.readOnly ? 'disabled' : ''}>`;
    else if (f.type === 'check') inp = `<label class="chkrow"><input type="checkbox" id="${id}" ${v ? 'checked' : ''} ${f.readOnly ? 'disabled' : ''}> Checked</label>`;
    else inp = `<select class="inp" id="${id}" ${f.readOnly ? 'disabled' : ''}><option value=""></option>${(f.options || []).map((o) => `<option ${o === v ? 'selected' : ''}>${esc(o)}</option>`).join('')}</select>`;
    return `<div class="frow"><label for="${id}">${esc(f.name)}</label>${inp}</div>`;
  }).join('')).join('');
  const sh = sheet(`<h2>Form fields</h2><p class="sub">You can also tap the fields directly on the page.</p><div class="formlist">${rows}</div><div class="acts"><button class="btn primary" data-x>Done</button></div>`, { wide: true });
  sh.querySelector('[data-x]').onclick = () => { closeSheet(); docs.forEach(refreshForms); commit(); };
  sh.addEventListener('input', (e) => {
    const m = /^f_(.+)_(\d+)$/.exec(e.target.id); if (!m) return; const d = S.docs.get(m[1]); const f = d.fields[+m[2]];
    d.values[f.name] = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  });
}

/* ---------- Chrome ---------- */
function updateMeta() {
  const n = S.pages.length;
  $('#docMeta').textContent = n ? `${n} page${n > 1 ? 's' : ''}${S.dirty ? ' · Edited' : ''}` : 'No document';
  document.title = n ? `${$('#docName').value || 'Untitled'}${S.dirty ? ' (edited)' : ''} · PDF Mate` : 'PDF Mate';
}
function updateChrome() {
  const has = S.pages.length > 0;
  $('#btnSave').disabled = !has; $('#btnPrint').disabled = !has; $('#tools').hidden = !has; $('#btnUndo').disabled = !S.hist.length; $('#btnRedo').disabled = !S.fut.length;
  $('#zoomIn').disabled = $('#zoomOut').disabled = $('#zoomLbl').disabled = !has;
  $$('#sbFoot .tbtn').forEach((b) => b.disabled = !has);
  updateMeta();
}
$('#btnSidebar').addEventListener('click', () => setSidebar($('#app').classList.contains('no-sidebar')));
$('#btnUndo').addEventListener('click', undo); $('#btnRedo').addEventListener('click', redo);
$('#zoomIn').addEventListener('click', () => setZoom(S.zoom * 1.2)); $('#zoomOut').addEventListener('click', () => setZoom(S.zoom / 1.2));
$('#zoomLbl').addEventListener('click', () => setZoom(0, true));
$('#btnOpen').addEventListener('click', () => $('#fileOpen').click());
$('#btnSave').addEventListener('click', openSave);
$('#btnPrint').addEventListener('click', openPrint);
$('#eOpen').addEventListener('click', () => $('#fileOpen').click());
$('#ePhotos').addEventListener('click', () => $('#fileImg').click());
$('#eBlank').addEventListener('click', () => newBlank());
$('#fileOpen').addEventListener('change', (e) => { const f = [...e.target.files]; e.target.value = ''; addFiles(f); });
$('#fileImg').addEventListener('change', (e) => { const f = [...e.target.files]; e.target.value = ''; addFiles(f, S.pages.length ? S.current + 1 : 0); });
$('#docName').addEventListener('input', updateMeta);
$('#docName').addEventListener('keydown', (e) => { if (e.key === 'Enter') e.target.blur(); });
function themeLabel() { const t = lsGet('pdfmate.theme', 'system'); return t === 'light' ? 'Light' : t === 'dark' ? 'Dark' : 'System'; }
function cycleTheme() { const order = ['system', 'light', 'dark']; const t = lsGet('pdfmate.theme', 'system'); const n = order[(order.indexOf(t) + 1) % 3]; lsSet('pdfmate.theme', n); if (n === 'system') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', n); toast(`Appearance: ${themeLabel()}`); }
$('#btnMore').addEventListener('click', (e) => {
  if (menuEl) { closeMenu(); return; }
  const has = S.pages.length > 0; const forms = [...S.docs.values()].reduce((n, d) => n + d.fields.length, 0);
  openMenu(e.currentTarget, [
    { label: 'Open or add PDF…', icon: 'open', kbd: 'Ctrl O', run: () => $('#fileOpen').click() },
    { label: 'Add photos as pages…', icon: 'photo', run: () => $('#fileImg').click() },
    { label: 'Insert blank page', icon: 'blank', run: () => pageAction('blank'), disabled: !has },
    { label: 'Print…', icon: 'print', kbd: 'Ctrl P', run: openPrint, disabled: !has },
    { label: forms ? `Fill form fields (${forms})` : 'Fill form fields', icon: 'form', run: openFormList, disabled: !forms },
    { label: 'Signatures and stamps…', icon: 'sign', run: () => { if (!has) { toast('Open a PDF first'); return; } openLibrary(); } },
    '-',
    { label: 'Zoom in', icon: 'zin', run: () => setZoom(S.zoom * 1.2), disabled: !has },
    { label: 'Zoom out', icon: 'zout', run: () => setZoom(S.zoom / 1.2), disabled: !has },
    { label: 'Fit to width', icon: 'fit', run: () => setZoom(0, true), disabled: !has },
    { label: 'Redo', icon: 'redo', kbd: 'Ctrl ⇧ Z', run: redo, disabled: !S.fut.length },
    '-',
    ...(isStandalone() ? [] : [{ label: 'Install app', icon: 'install', run: doInstall }]),
    { label: `Appearance: ${themeLabel()}`, icon: 'theme', run: cycleTheme },
    { label: 'About PDF Mate', icon: 'info', run: about },
    { label: 'Close document', icon: 'xmark', run: () => { if (S.dirty) confirmSheet('Close without saving?', 'Your changes to this document will be lost.', 'Close', closeDoc); else closeDoc(); }, disabled: !has }
  ]);
});
function about() {
  sheet(`<h2>PDF Mate</h2><p class="sub">Version ${VERSION} · by Tango Juliet Dev</p>
    <p style="margin:0 0 10px;color:var(--label-2)">Fill, sign, stamp and mark up PDFs, then merge, reorder, rotate or delete pages. Works fully offline once opened or installed. Files are processed on this device and are never uploaded.</p>
    <p style="margin:0;color:var(--label-3);font-size:12px">Editing the original text of a PDF is not supported. Use Whiteout to cover text, then type over it. Built with pdf.js (Apache 2.0) and pdf-lib (MIT).</p>
    <div class="acts"><button class="btn primary" data-x>Done</button></div>`).querySelector('[data-x]').onclick = closeSheet;
}

/* ---------- Keyboard ---------- */
document.addEventListener('keydown', (e) => {
  const inField = e.target.closest('input,textarea,select,[contenteditable]');
  const mod = e.metaKey || e.ctrlKey;
  if (mod && e.key.toLowerCase() === 'z' && !inField) { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
  if (mod && e.key.toLowerCase() === 'y' && !inField) { e.preventDefault(); redo(); return; }
  if (mod && e.key.toLowerCase() === 's') { e.preventDefault(); openSave(); return; }
  if (mod && e.key.toLowerCase() === 'p') { e.preventDefault(); openPrint(); return; }
  if (mod && e.key.toLowerCase() === 'o') { e.preventDefault(); $('#fileOpen').click(); return; }
  if (mod && (e.key === '=' || e.key === '+')) { e.preventDefault(); setZoom(S.zoom * 1.2); return; }
  if (mod && e.key === '-') { e.preventDefault(); setZoom(S.zoom / 1.2); return; }
  if (mod && e.key === '0') { e.preventDefault(); setZoom(0, true); return; }
  if (inField || $('#layer .scrim')) return;
  if ((e.key === 'Delete' || e.key === 'Backspace') && S.sel) { e.preventDefault(); deleteSelected(); return; }
  if (e.key === 'Escape') { if (S.sel) select(null); else if (S.tool !== 'select') setTool('select'); return; }
  if (S.sel && e.key.startsWith('Arrow')) {
    e.preventDefault(); const s = selectedAnn(); const st = e.shiftKey ? 10 : 1; const d = { ArrowLeft: [-st, 0], ArrowRight: [st, 0], ArrowUp: [0, -st], ArrowDown: [0, st] }[e.key];
    applyT(s.a, pdfAffineFromDisplay(geo(s.p), (x, y) => [x + d[0], y + d[1]])); drawOverlay(s.p); clearTimeout(styleCommitT); styleCommitT = setTimeout(commit, 400); return;
  }
  if (!mod && S.pages.length) { const map = { v: 'select', t: 'text', w: 'white', h: 'highlight', r: 'rect', l: 'line', a: 'arrow', p: 'pen' }; const k = map[e.key.toLowerCase()]; if (k) setTool(k === 'highlight' ? 'hl' : k); }
});

/* ---------- Drag and drop files ---------- */
let dragDepth = 0, mask = null;
const hasFiles = (e) => e.dataTransfer && [...(e.dataTransfer.types || [])].includes('Files');
addEventListener('dragenter', (e) => { if (!hasFiles(e)) return; e.preventDefault(); dragDepth++; if (!mask) { mask = document.createElement('div'); mask.className = 'dropmask'; mask.textContent = S.pages.length ? 'Drop to add pages' : 'Drop to open'; document.body.appendChild(mask); } });
addEventListener('dragleave', (e) => { if (!hasFiles(e)) return; dragDepth--; if (dragDepth <= 0 && mask) { mask.remove(); mask = null; dragDepth = 0; } });
addEventListener('dragover', (e) => { if (hasFiles(e)) e.preventDefault(); });
addEventListener('drop', (e) => { if (!hasFiles(e)) return; e.preventDefault(); dragDepth = 0; if (mask) { mask.remove(); mask = null; } addFiles([...e.dataTransfer.files]); });
addEventListener('beforeunload', (e) => { if (S.dirty) { e.preventDefault(); e.returnValue = ''; } });

/* ---------- Boot ---------- */
function boot() {
  $('#btnSidebar').innerHTML = icon('sidebar'); $('#btnUndo').innerHTML = icon('undo'); $('#btnRedo').innerHTML = icon('redo');
  $('#btnOpen').innerHTML = icon('open'); $('#btnInstall').innerHTML = icon('install'); $('#btnPrint').innerHTML = icon('print'); $('#btnMore').innerHTML = icon('more'); $('#saveIc').outerHTML = icon('share');
  $('#zoomIn').innerHTML = icon('zin'); $('#zoomOut').innerHTML = icon('zout');
  const fi = { rotl: 'rotl', rotr: 'rotr', up: 'up', down: 'down', blank: 'blank', del: 'trash' };
  $$('#sbFoot [data-pa]').forEach((b) => b.innerHTML = icon(fi[b.dataset.pa]));
  $('#emptyIc').innerHTML = `<svg viewBox="0 0 76 92" width="76" height="92" aria-hidden="true"><defs><linearGradient id="eg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#eef0f5"/></linearGradient></defs><path d="M10 2h40l24 24v58a6 6 0 0 1-6 6H10a6 6 0 0 1-6-6V8a6 6 0 0 1 6-6z" fill="url(#eg)" stroke="rgba(0,0,0,.14)"/><path d="M50 2v18a6 6 0 0 0 6 6h18" fill="#e3e6ee" stroke="rgba(0,0,0,.14)"/><rect x="14" y="40" width="40" height="4" rx="2" fill="#d1d5df"/><rect x="14" y="50" width="48" height="4" rx="2" fill="#d1d5df"/><rect x="14" y="60" width="30" height="4" rx="2" fill="#d1d5df"/><path d="M16 78c5 0 7-10 11-10s2 10 7 10 4-5 7-5 3 4 8 3" fill="none" stroke="#007aff" stroke-width="2.4" stroke-linecap="round"/><rect x="4" y="10" width="26" height="14" rx="4" fill="#ff3b30"/><text x="17" y="20.5" text-anchor="middle" font-size="9" font-weight="700" fill="#fff" font-family="-apple-system,Inter,sans-serif">PDF</text></svg>`;
  $('#feat').innerHTML = `<span>${icon('lock')} Stays on device</span><span>${icon('offline')} Works offline</span><span>${icon('sign')} Sign and stamp</span><span>${icon('merge')} Merge and reorder</span>`;
  buildTools(); setTool('select'); renderAll(); resetHistory(); updateChrome();
  const mq = matchMedia('(max-width: 760px)');
  const placeTools = () => { const t = $('#tools'); if (mq.matches) { if (t.parentElement !== document.body) document.body.appendChild(t); } else if (t.parentElement !== $('.toolbar')) $('.toolbar').insertBefore(t, $('.tb-right')); };
  placeTools(); mq.addEventListener('change', placeTools);
}
let readyRes; const ready = new Promise((r) => { readyRes = r; });
initFont().then(boot).catch((e) => { console.error(e); boot(); }).then(() => readyRes());

/* ---------- PWA: offline, install, open from OS ---------- */
const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
let installEvt = null;
function showInstall(on) { $('#btnInstall').hidden = !on; $('#eInstall').hidden = !on; }
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); installEvt = e; showInstall(true); });
addEventListener('appinstalled', () => { installEvt = null; showInstall(false); toast('PDF Mate installed. It works offline.'); });
async function doInstall() {
  if (installEvt) { installEvt.prompt(); try { await installEvt.userChoice; } catch (e) {} installEvt = null; showInstall(false); return; }
  if (isIOS) {
    sheet(`<h2>Install on iPhone or iPad</h2><p class="sub">Safari installs web apps from the Share menu.</p>
      <ol style="margin:0 0 4px;padding-left:20px;line-height:1.9;color:var(--label-2)"><li>Tap the Share button ${icon('share', 'style="vertical-align:-3px"')} in Safari</li><li>Choose <b>Add to Home Screen</b></li><li>Tap <b>Add</b></li></ol>
      <div class="acts"><button class="btn primary" data-x>Done</button></div>`).querySelector('[data-x]').onclick = closeSheet;
    return;
  }
  const edge = /Edg\//.test(navigator.userAgent), android = /android/i.test(navigator.userAgent);
  const steps = android ? '<li>Tap the <b>⋮</b> menu in Chrome</li><li>Tap <b>Add to Home screen</b>, then <b>Install</b></li>'
    : edge ? '<li>Click the <b>…</b> menu in Edge</li><li>Choose <b>Apps</b>, then <b>Install this site as an app</b></li>'
    : '<li>Click the <b>⋮</b> menu in Chrome</li><li>Choose <b>Cast, save, and share</b>, then <b>Install page as app</b></li>';
  sheet(`<h2>Install PDF Mate</h2><p class="sub">Your browser did not offer the install button. You can install from its menu instead.</p>
    <ol style="margin:0 0 10px;padding-left:20px;line-height:1.9;color:var(--label-2)">${steps}</ol>
    <p class="sub" style="margin:0">If the menu says <b>Open in Tools for Mate</b> or another app, that app is claiming this address. Uninstall it, reload this page, then install both again.</p>
    <div class="acts"><button class="btn primary" data-x>Done</button></div>`).querySelector('[data-x]').onclick = closeSheet;
}
$('#btnInstall').addEventListener('click', doInstall);
$('#eInstall').addEventListener('click', doInstall);
if (!isStandalone()) showInstall(true);
addEventListener('offline', () => toast('You are offline. PDF Mate keeps working.'));

if ('serviceWorker' in navigator && window.isSecureContext) {
  const firstInstall = !navigator.serviceWorker.controller;
  navigator.serviceWorker.register('sw.js').then((reg) => {
    if (firstInstall) navigator.serviceWorker.ready.then(() => { toast('Ready to work offline'); });
    reg.addEventListener('updatefound', () => { const w = reg.installing; if (w && !firstInstall) w.addEventListener('statechange', () => { if (w.state === 'activated') toast('PDF Mate updated. Reopen to use the new version.', { ms: 4500 }); }); });
  }).catch((e) => console.warn('SW', e));
}
// Files opened from the OS (installed desktop app: Open with PDF Mate)
if ('launchQueue' in window) {
  window.launchQueue.setConsumer(async (params) => {
    if (!params.files || !params.files.length) return;
    const files = []; for (const h of params.files) { try { files.push(await h.getFile()); } catch (e) {} }
    if (files.length) { await ready; addFiles(files); }
  });
}
// Files shared to PDF Mate from other apps (Android share sheet)
async function takeShared() {
  if (!/[?&]share=1/.test(location.search) || !('caches' in window)) return;
  history.replaceState(null, '', location.pathname);
  try {
    const c = await caches.open('pdfmate-share'); const keys = await c.keys(); const files = [];
    for (const k of keys) { const r = await c.match(k); const b = await r.blob(); files.push(new File([b], decodeURIComponent(r.headers.get('x-name') || 'shared.pdf'), { type: b.type })); await c.delete(k); }
    if (files.length) { await ready; addFiles(files); } else toast('Nothing was received from the share', { err: true });
  } catch (e) { toast('Could not read the shared file', { err: true }); }
}
takeShared();
if (/[?&]source=pwa/.test(location.search)) history.replaceState(null, '', location.pathname);
window.__pdfmate = { S, buildPdf, geo, vpTransform, addFiles };
