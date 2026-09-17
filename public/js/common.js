// Cravat Cases — shared layout, data & helpers
const svg = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const ICON = {
  wa: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4zM12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4c-1-1.6-1.5-3.4-1.5-5.2C2.2 6.6 6.6 2.2 12 2.2S21.8 6.6 21.8 12 17.4 21.8 12 21.8zM12 0C5.4 0 0 5.4 0 12c0 2.1.6 4.2 1.6 6L0 24l6.2-1.6c1.8 1 3.8 1.5 5.8 1.5 6.6 0 12-5.4 12-12S18.6 0 12 0z"/></svg>',
  bag: svg('<path d="M5 8h14l-1 13H6L5 8z"/><path d="M9 8V6a3 3 0 016 0v2"/>'),
  search: svg('<circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/>'),
  menu: svg('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  x: svg('<path d="M6 6l12 12M18 6L6 18"/>'),
  chev: svg('<path d="M6 9l6 6 6-6"/>', 'class="chev"'),
  left: svg('<path d="M15 6l-6 6 6 6"/>'), right: svg('<path d="M9 6l6 6-6 6"/>'),
  arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  truck: svg('<path d="M3 7h11v9H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
  shield: svg('<path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3z"/><path d="M9 12l2 2 4-4"/>'),
  cash: svg('<rect x="2.5" y="6" width="19" height="12" rx="2"/><circle cx="12" cy="12" r="2.6"/>'),
  chat: svg('<path d="M21 12a8 8 0 01-11.6 7.1L4 20l1-4.6A8 8 0 1121 12z"/>'),
  star: svg('<path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>'),
  fit: svg('<rect x="7" y="2.5" width="10" height="19" rx="2.5"/><path d="M11 5.5h2"/>'),
  gem: svg('<path d="M6 3h12l3 6-9 12L3 9l3-6z"/><path d="M3 9h18"/>'),
  clock: svg('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  pin: svg('<path d="M12 21s7-6.2 7-11.5A7 7 0 005 9.5C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  user: svg('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0116 0"/>'),
  mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/>'),
  fb: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v7h4v-7h3l1-4h-4V8.5c0-.3.2-.5.5-.5z"/></svg>',
  ig: svg('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>'),
  tie: '<svg viewBox="0 0 48 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"><rect x="5" y="2" width="38" height="60" rx="7"/><path d="M15 2l9 11 9-11"/><path d="M20.5 13h7l-1.8 5h-3.4z"/><path d="M22.3 18l-3.3 22 5 6 5-6-3.3-22"/><path d="M21 55h6"/></svg>',
  filter: svg('<path d="M4 6h16M7 12h10M10 18h4"/>')
};
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let SITE = null, PRODUCTS = null;
const money = n => (SITE?.settings.currency || '৳') + Number(n || 0).toLocaleString('en-IN');
const brandName = id => SITE?.brands.find(b => b.id === id)?.name || id;
const catOf = id => SITE?.categories.find(c => c.id === id);
const store = { get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
const getProducts = async () => PRODUCTS || (PRODUCTS = await fetch('/api/products').then(r => r.json()));

// ---------- auth (one login for customers & admin) ----------
const Auth = {
  token: () => store.get('cc_token', ''),
  me: null,
  headers: (h = {}) => ({ 'Content-Type': 'application/json', ...(Auth.token() ? { Authorization: 'Bearer ' + Auth.token() } : {}), ...h }),
  async load() { if (!Auth.token()) return (Auth.me = { role: null }); try { Auth.me = await fetch('/api/auth/me', { headers: Auth.headers() }).then(r => r.json()); if (!Auth.me.role) store.set('cc_token', ''); } catch { Auth.me = { role: null }; } return Auth.me; },
  async logout(to = '/') { try { await fetch('/api/auth/logout', { method: 'POST', headers: Auth.headers() }); } catch {} store.set('cc_token', ''); location.href = to; }
};
// ---------- phone models ----------
const modelSlug = n => String(n).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const modelsOf = b => (b?.models || []).map(m => typeof m === 'string' ? { name: m, image: '' } : m);
const findModel = slug => { for (const b of SITE.brands) { const m = modelsOf(b).find(x => modelSlug(x.name) === slug); if (m) return { brand: b, model: m }; } return null; };
const modelCount = name => (PRODUCTS || []).filter(p => p.models.includes(name)).length;
// original line illustration of a phone back, drawn from the model name (admin can upload a real photo instead)
function phoneArt(name, brandId) {
  const n = String(name).toLowerCase(), pixel = brandId === 'pixel' || n.includes('pixel');
  const lens = (x, y, r = 7.5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="#1d2330" stroke="#6b7384" stroke-width="1.6"/><circle cx="${x}" cy="${y}" r="${r * .42}" fill="#3a4a66"/><circle cx="${x - r * .25}" cy="${y - r * .3}" r="${r * .16}" fill="#9fb3d9" opacity=".8"/>`;
  const flash = (x, y) => `<circle cx="${x}" cy="${y}" r="2.6" fill="#f3e6c4" stroke="#c9b27a" stroke-width=".8"/>`;
  const big = /max|plus|pro xl|xl/.test(n), mini = /mini/.test(n);
  const W = mini ? 62 : big ? 76 : 70, H = mini ? 124 : big ? 150 : 140, X = (100 - W) / 2, Y = (160 - H) / 2;
  const tone = pixel ? ['#eceae4', '#d9d5cb'] : /pro/.test(n) ? ['#d8d4cc', '#b9b3a8'] : ['#e6e1f0', '#cfc7de'];
  let cam = '';
  if (pixel) {
    const v = parseInt((n.match(/pixel\s*(\d+)/) || [])[1] || 9), a = /\d+a/.test(n);
    if (a) cam = `<rect x="${X + 8}" y="${Y + 14}" width="30" height="15" rx="7.5" fill="#cfcac0"/>${lens(X + 15.5, Y + 21.5, 5.5)}${lens(X + 30.5, Y + 21.5, 5.5)}`;
    else if (v <= 7) cam = `<rect x="${X}" y="${Y + 18}" width="${W}" height="20" fill="#bdb8ad"/><rect x="${X + 6}" y="${Y + 21}" width="${big ? 42 : 30}" height="14" rx="7" fill="#1d2330"/>${lens(X + 13, Y + 28, 5)}${lens(X + 25, Y + 28, 5)}${big ? lens(X + 38, Y + 28, 5) : ''}`;
    else if (v === 8) cam = `<rect x="${X}" y="${Y + 17}" width="${W}" height="22" rx="0" fill="#c8c3b8"/><rect x="${X + 6}" y="${Y + 20}" width="${W - 12}" height="16" rx="8" fill="#1d2330"/>${lens(X + 15, Y + 28, 5.5)}${lens(X + 29, Y + 28, 5.5)}${/pro/.test(n) ? flash(X + W - 16, Y + 28) : ''}`;
    else cam = `<rect x="${X + 7}" y="${Y + 15}" width="${W - 14}" height="24" rx="12" fill="#c9c4b9" stroke="#a9a497"/>${lens(X + 20, Y + 27, 6.5)}${lens(X + 35, Y + 27, 6.5)}${/pro|fold/.test(n) ? lens(X + 50, Y + 27, 5) : flash(X + 50, Y + 27)}`;
  } else {
    const v = parseInt((n.match(/iphone\s*(\d+)/) || [])[1] || 0), pro = /pro/.test(n), air = /air/.test(n), e = /\d+e/.test(n);
    if (air) cam = `<rect x="${X}" y="${Y + 8}" width="${W}" height="22" rx="11" fill="#bdb6a9"/>${lens(X + 14, Y + 19, 7)}${flash(X + 30, Y + 19)}`;
    else if (v >= 17 && pro) cam = `<rect x="${X}" y="${Y + 6}" width="${W}" height="44" rx="10" fill="${tone[1]}"/>${lens(X + 14, Y + 17, 8)}${lens(X + 14, Y + 38, 8)}${lens(X + 31, Y + 27.5, 8)}${flash(X + W - 12, Y + 17)}`;
    else if (e) cam = lens(X + 14, Y + 15, 8) + flash(X + 14, Y + 30);
    else if (pro) cam = `<rect x="${X + 5}" y="${Y + 5}" width="40" height="42" rx="11" fill="${tone[1]}" stroke="#a39c90" stroke-width=".8"/>${lens(X + 16, Y + 16)}${lens(X + 16, Y + 36)}${lens(X + 34, Y + 26)}${flash(X + 34, Y + 12)}`;
    else if (v >= 16) cam = `<rect x="${X + 6}" y="${Y + 6}" width="20" height="42" rx="10" fill="${tone[1]}"/>${lens(X + 16, Y + 16)}${lens(X + 16, Y + 38)}${flash(X + 32, Y + 16)}`;
    else cam = `<rect x="${X + 5}" y="${Y + 5}" width="38" height="40" rx="11" fill="${tone[1]}" stroke="#a39c90" stroke-width=".8"/>${lens(X + 16, Y + 16)}${lens(X + 32, Y + 33)}${flash(X + 33, Y + 14)}`;
  }
  const logo = pixel ? `<text x="50" y="${Y + H - 22}" text-anchor="middle" font-family="Arial" font-weight="700" font-size="11" fill="#b8b3a8">G</text>` : `<circle cx="50" cy="${Y + H / 2 + 6}" r="6" fill="none" stroke="${tone[1]}" stroke-width="1.6"/>`;
  return `<svg viewBox="0 0 100 160" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(name)}"><defs><linearGradient id="g${modelSlug(name)}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tone[0]}"/><stop offset="1" stop-color="${tone[1]}"/></linearGradient></defs>
    <rect x="${X + 3}" y="${Y + 5}" width="${W}" height="${H}" rx="${pixel ? 13 : 12}" fill="#000" opacity=".08"/><rect x="${X}" y="${Y}" width="${W}" height="${H}" rx="${pixel ? 13 : 12}" fill="url(#g${modelSlug(name)})" stroke="#a39c90" stroke-width="1"/>${cam}${logo}</svg>`;
}
const modelVisual = (m, brandId) => m.image ? `<img src="${esc(m.image)}" alt="${esc(m.name)}" loading="lazy">` : phoneArt(m.name, brandId);
const phoneTile = (m, b) => { const c = modelCount(m.name); return `<a class="pm ${c ? '' : 'none'}" href="/phone/${modelSlug(m.name)}"><div class="art">${modelVisual(m, b.id)}</div><b>${esc(m.name)}</b><small>${c ? c + ' cases' : 'Coming soon'}</small></a>`; };

// stock (per colour)
const qtyOf = v => v ? (v.qty ?? (v.stock === false ? 0 : 10)) : 0;
const totalStock = p => p.variants.reduce((a, v) => a + qtyOf(v), 0);
const stockLabel = n => `<span class="stock ${n <= 0 ? 'out' : n <= 5 ? 'low' : ''}">${n <= 0 ? 'Sold out' : n <= 5 ? `Only ${n} left` : `${n} in stock`}</span>`;
// discount-aware price
function priceInfo(p) {
  const d = p.discount || {}, regular = Number(p.price) || 0;
  const live = d.value > 0 && (!d.endsAt || new Date(d.endsAt + 'T23:59:59') >= new Date());
  const final = live ? Math.max(0, Math.round(d.type === 'percent' ? regular * (1 - d.value / 100) : regular - d.value)) : regular;
  return { final, regular, saved: regular - final, off: regular && final < regular ? Math.round((1 - final / regular) * 100) : 0, endsAt: live ? d.endsAt : '' };
}
// colour families (for "shop by colour")
const FAMILIES = [['Black', '#1b1b1d'], ['White', '#f4f4f2'], ['Grey', '#9a9a9c'], ['Blue', '#2f5d9a'], ['Purple', '#7a57b8'], ['Pink', '#e79ab5'], ['Red', '#b3243a'], ['Orange', '#e5793a'], ['Brown', '#7a5438'], ['Beige', '#d8c3a0'], ['Green', '#2f6b54'], ['Yellow', '#e7c34a']];
function family(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || ''); if (!m) return 'Grey';
  const n = parseInt(m[1], 16), r = (n >> 16) / 255, g = (n >> 8 & 255) / 255, b = (n & 255) / 255;
  const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2, dd = mx - mn;
  const s = dd ? dd / (1 - Math.abs(2 * l - 1)) : 0;
  let h = !dd ? 0 : mx === r ? 60 * (((g - b) / dd) % 6) : mx === g ? 60 * ((b - r) / dd + 2) : 60 * ((r - g) / dd + 4); if (h < 0) h += 360;
  if (l < .16) return 'Black'; if (l > .88 && s < .5) return 'White'; if (s < .12) return 'Grey';
  if (h >= 15 && h < 50 && l > .6 && s < .6) return 'Beige';
  if (h >= 8 && h < 45 && l < .42) return 'Brown';
  if (h < 12 || h >= 345) return l > .62 ? 'Pink' : 'Red';
  if (h < 42) return 'Orange'; if (h < 68) return 'Yellow'; if (h < 170) return 'Green'; if (h < 255) return 'Blue';
  if (h < 300) return 'Purple'; return 'Pink';
}
const famHex = f => (FAMILIES.find(x => x[0] === f) || [, '#999'])[1];

// cart
const Cart = {
  get: () => store.get('cc_cart', []),
  set(items) { store.set('cc_cart', items); updateCount(); },
  add(item) { const items = Cart.get(); const same = items.find(i => i.slug === item.slug && i.model === item.model && i.color === item.color); same ? (same.qty += item.qty) : items.push(item); Cart.set(items); }
};
function updateCount() { const n = Cart.get().reduce((a, i) => a + i.qty, 0); const el = $('#cartCount'); if (el) { el.textContent = n; el.style.display = n ? 'grid' : 'none'; } }
function toast(msg) {
  let t = $('.toast'); if (!t) { t = document.createElement('div'); t.className = 'toast'; document.body.appendChild(t); }
  t.textContent = msg; t.classList.add('show'); clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), 2400);
}
const waLink = text => `https://wa.me/${SITE.settings.whatsapp}?text=${encodeURIComponent(text)}`;

// ---------- product card ----------
function productCard(p) {
  const imgs = p.variants.flatMap(v => v.images); const img = imgs[0] || SITE.settings.logo, alt = p.variants[1]?.images[0] || imgs[1];
  const pi = priceInfo(p), stock = totalStock(p), out = !stock, url = `/product/${p.slug}`;
  return `<div class="card ${out ? 'is-out' : ''}">
    <a class="ph" href="${url}" aria-label="${esc(p.name)}"><img loading="lazy" src="${esc(img)}" alt="${esc(p.name)}">${alt ? `<img class="alt" loading="lazy" src="${esc(alt)}" alt="">` : ''}
      <span class="badges">${out ? '<span class="bd out">Sold out</span>' : ''}${pi.off ? `<span class="bd sale">${pi.off}% OFF</span>` : ''}${p.isNew ? '<span class="bd new">New</span>' : ''}</span></a>
    <div class="info">
      <a class="name" href="${url}">${esc(p.name)}</a>
      <div class="meta">${esc(brandName(p.brand))} · ${p.variants.length} colour${p.variants.length > 1 ? 's' : ''}</div>
      <div class="price ${pi.off ? 'sale' : ''}"><b>${money(pi.final)}</b>${pi.off ? `<s>${money(pi.regular)}</s>` : ''}</div>
      <div class="row"><span class="sw">${p.variants.slice(0, 6).map(v => `<i title="${esc(v.name)}" style="background:${esc(v.hex)}"></i>`).join('')}</span>${stockLabel(stock)}</div>
      <a class="btn ${out ? 'ghost' : ''} sm block" href="${url}">${out ? 'View details' : 'Order now'}</a>
    </div></div>`;
}

// ---------- order form (optional customer details) → saves order → WhatsApp ----------
function openOrder({ items, coupon = null, fromCart = false }) {
  const s = SITE.settings, u = Auth.me?.user, cached = store.get('cc_customer', {});
  const saved = { ...cached, ...(u ? { name: u.name, phone: u.phone, address: u.address || cached.address, area: u.area } : {}) };
  let m = $('#orderModal'); if (!m) { m = document.createElement('div'); m.id = 'orderModal'; m.className = 'modal'; document.body.appendChild(m); }
  const sub = items.reduce((a, i) => a + i.price * i.qty, 0), disc = coupon ? Math.min(sub, coupon.amount) : 0;
  const draw = () => {
    const area = $('input[name=area]:checked', m)?.value || saved.area || 'inside', del = +(area === 'inside' ? s.deliveryInside : s.deliveryOutside) || 0;
    $('.osum', m).innerHTML = items.map(i => `<div class="r"><span>${esc(i.name)} <small>${esc(i.model)} · ${esc(i.color)} × ${i.qty}</small></span><span>${money(i.price * i.qty)}</span></div>`).join('') +
      (disc ? `<div class="r" style="color:var(--ok)"><span>Coupon ${esc(coupon.code)}</span><span>−${money(disc)}</span></div>` : '') +
      `<div class="r"><span>Delivery charge</span><span>${money(del)}</span></div><div class="r t"><span>Total (cash on delivery)</span><span>${money(sub - disc + del)}</span></div>`;
    return { area, del };
  };
  const close = () => { m.classList.remove('open'); document.body.style.overflow = ''; };
  m.innerHTML = `<div class="shade" data-close></div><div class="box" role="dialog" aria-modal="true" aria-labelledby="oh">
    <button class="x" data-close aria-label="Close">✕</button>
    <h3 id="oh">Delivery details</h3>
    <p class="muted" style="font-size:14px;margin-top:2px">Mobile number is required so we can confirm your order.${u ? '' : ` <a href="/login?next=${encodeURIComponent(location.pathname)}" class="ul">Sign in</a> to save your details.`}</p>
    <form class="form" id="of">
      <div><label for="o-name">Name <small>(optional)</small></label><input class="input" id="o-name" name="name" autocomplete="name" value="${esc(saved.name || '')}"></div>
      <div><label for="o-phone">Mobile number <b style="color:var(--sale)">*</b></label><input class="input" id="o-phone" name="phone" type="tel" inputmode="numeric" autocomplete="tel" placeholder="01XXXXXXXXX" maxlength="14" required value="${esc(saved.phone || '')}"><small class="ferr" id="o-perr"></small></div>
      <div class="full"><label>Delivery area</label><div class="seg">
        <label><input type="radio" name="area" value="inside" ${(saved.area || 'inside') === 'inside' ? 'checked' : ''}> Inside Dhaka · ${money(s.deliveryInside)}</label>
        <label><input type="radio" name="area" value="outside" ${saved.area === 'outside' ? 'checked' : ''}> Outside Dhaka · ${money(s.deliveryOutside)}</label></div></div>
      <div class="full"><label for="o-addr">Full address <small>(optional)</small></label><textarea class="input" id="o-addr" name="address" rows="2" autocomplete="street-address" placeholder="House, road, area, district">${esc(saved.address || '')}</textarea></div>
      <div class="full"><label for="o-note">Note <small>(optional)</small></label><input class="input" id="o-note" name="note" placeholder="Anything we should know?"></div>
      <div class="full osum"></div>
      <div class="full"><button class="btn wa block lg" type="submit">${ICON.wa} Confirm order on WhatsApp</button>
</div>
    </form></div>`;
  draw(); m.classList.add('open'); document.body.style.overflow = 'hidden';
  m.onclick = e => { const t = e.target.closest('[data-close]'); if (t) { if (t.getAttribute('href') === '#') e.preventDefault(); close(); } };
  m.onchange = draw;
  const phoneOk = v => { let d = String(v || '').replace(/\D/g, ''); if (d.startsWith('880')) d = d.slice(2); return /^01[3-9]\d{8}$/.test(d) ? d : ''; };
  $('#o-phone', m).oninput = e => { if (phoneOk(e.target.value)) { $('#o-perr', m).textContent = ''; e.target.classList.remove('bad'); } };
  const send = async () => {
    const f = Object.fromEntries(new FormData($('#of', m))), { area, del } = draw();
    const phone = phoneOk(f.phone);
    if (!phone) { const inp = $('#o-phone', m); inp.classList.add('bad'); $('#o-perr', m).textContent = 'Please enter a valid 11-digit mobile number (01XXXXXXXXX)'; inp.focus(); inp.scrollIntoView({ block: 'center', behavior: 'smooth' }); return; }
    const c = { name: f.name.trim(), phone, address: f.address.trim(), note: f.note.trim(), area };
    store.set('cc_customer', { name: c.name, phone: c.phone, address: c.address, area });
    const total = sub - disc + del;
    const win = window.open('', '_blank'); // open now so mobile browsers don't block it
    let no = '';
    try { const ctl = new AbortController(); setTimeout(() => ctl.abort(), 4000); const r = await fetch('/api/orders', { method: 'POST', headers: Auth.headers(), signal: ctl.signal, body: JSON.stringify({ ...c, items, coupon: coupon?.code || '', discount: disc, delivery: del, total }) }); const j = await r.json(); if (r.status === 400) { win?.close(); return toast(j.error || 'Please check your details'); } no = j.no || ''; } catch {}
    const lines = items.map((i, n) => `${n + 1}. *${i.name}*\n   Model: ${i.model} | Colour: ${i.color} | Qty: ${i.qty}\n   Price: ${money(i.price * i.qty)}\n   ${location.origin}/product/${i.slug}`).join('\n\n');
    const who = [c.name && `Name: ${c.name}`, c.phone && `Phone: ${c.phone}`, c.address && `Address: ${c.address}`, c.note && `Note: ${c.note}`].filter(Boolean).join('\n');
    const msg = `Hello ${s.siteName}! I'd like to order${no ? ` (Order no: ${no})` : ''}:\n\n${lines}\n\nSubtotal: ${money(sub)}${disc ? `\nCoupon ${coupon.code}: −${money(disc)}` : ''}\nDelivery (${area === 'inside' ? 'Inside' : 'Outside'} Dhaka): ${money(del)}\n*Total: ${money(total)}* (Cash on delivery)${who ? `\n\n${who}` : ''}`;
    if (win) win.location.href = waLink(msg); else location.href = waLink(msg);
    if (fromCart) Cart.set([]);
    // confirmation screen
    $('.box', m).innerHTML = `<div class="done"><div class="tick">✓</div><h3>Order sent${no ? ` · ${no}` : ''}</h3>
      <p class="muted">WhatsApp has opened with your order. Please press <b>Send</b> there — we will confirm your order shortly.</p>
      <div class="cta"><a class="btn" href="${waLink(msg)}" target="_blank" rel="noopener">${ICON.wa} Open WhatsApp again</a>${no ? `<a class="btn ghost" href="/track?no=${no}${c.phone ? '&phone=' + encodeURIComponent(c.phone) : ''}">Track order</a>` : ''}</div>
      <a href="${fromCart ? '/shop' : '#'}" class="skip" ${fromCart ? '' : 'data-close'}>Continue shopping</a></div>`;
  };
  $('#of', m).setAttribute('novalidate', '');
  $('#of', m).onsubmit = e => { e.preventDefault(); send(); };
}

// ---------- website menu (editable in Admin → Website menu) ----------
const NAV_BUILTIN = { home: ['Home', '/'], all: ['All Products', '/shop'], designs: ['Designs', '/shop'], new: ['New Arrivals', '/shop?new=1'], sale: ['Offers', '/shop?sale=1'], track: ['Track Order', '/track'], about: ['About', '/about'], contact: ['Contact', '/contact'] };
function mergeNav(site) {
  const saved = Array.isArray(site.settings.nav) ? site.settings.nav : [];
  const defaults = [{ key: 'home' }, { key: 'all' }, ...site.brands.map(b => ({ key: 'brand:' + b.id })), { key: 'designs' }, { key: 'sale' }, { key: 'new', visible: false }, { key: 'track' }, { key: 'about' }, { key: 'contact' }];
  const list = saved.filter(i => i.key.startsWith('custom') || NAV_BUILTIN[i.key] || site.brands.some(b => 'brand:' + b.id === i.key));
  if (!list.length) list.push(...defaults);
  else defaults.forEach(d => { if (list.some(i => i.key === d.key)) return;
    if (d.key.startsWith('brand:')) { const at = list.findIndex(i => i.key === 'designs'); at >= 0 ? list.splice(at, 0, d) : list.push(d); } else list.push(d); });
  return list.map(i => { const b = i.key.startsWith('brand:') && site.brands.find(x => 'brand:' + x.id === i.key);
    return { ...i, label: i.label || (b ? b.name : NAV_BUILTIN[i.key]?.[0] || 'Link'), href: i.key.startsWith('custom') ? i.href || '/' : b ? `/shop?brand=${b.id}` : NAV_BUILTIN[i.key][1], brand: b || null, visible: i.visible !== false }; });
}

// ---------- layout ----------
async function boot(active) {
  [SITE] = await Promise.all([fetch('/api/site').then(r => r.json()), getProducts(), Auth.load()]);
  const s = SITE.settings, P = PRODUCTS, me = Auth.me || {};
  const cnt = id => P.filter(p => p.categories?.includes(id)).length;
  const ann = (s.announcement || '').split('•').map(x => x.trim()).filter(Boolean);
  const logo = `<a class="logo" href="/" aria-label="${esc(s.siteName)} home"><img src="${esc(s.logo)}" alt="${esc(s.siteName)} logo" width="46" height="46">${s.showWordmark !== false ? `<span class="wm"><b>${esc(s.siteName.toUpperCase())}</b><small>${esc(s.logoSubtitle || 'iPhone · Pixel')}</small></span>` : ''}</a>`;
  const acct = me.role === 'admin' ? ['/admin', 'Admin panel'] : me.role === 'user' ? ['/account', me.user.name.split(' ')[0]] : [`/login?next=${encodeURIComponent(location.pathname + location.search)}`, 'Sign in'];
  const nav = mergeNav(SITE).filter(i => i.visible);
  const isOn = i => (i.key === active) || (i.brand && i.brand.id === active) || (i.key === 'all' && active === 'shop') || (i.key === 'designs' && active === 'cat');
  const mega = i => {
    if (i.brand) { const b = i.brand, models = [...modelsOf(b)].reverse();
      return `<div class="mega"><div class="container"><div class="mega-head"><b>${esc(b.name)} covers — choose your model</b><a href="/shop?brand=${b.id}">View all ${esc(b.name)} covers →</a></div><div class="phones">${models.map(m => phoneTile(m, b)).join('')}</div></div></div>`; }
    if (i.key === 'designs') return `<div class="mega"><div class="container"><div class="mega-head"><b>Shop by design</b><a href="/shop">All products →</a></div><div class="mcats">${SITE.categories.map(c => `<a class="mcat" href="/category/${c.id}"><span class="ph"><img loading="lazy" src="${esc(c.image || s.logo)}" alt=""></span><b>${esc(c.name)}</b><small>${cnt(c.id)} items</small></a>`).join('')}</div></div></div>`;
    return '';
  };
  document.body.insertAdjacentHTML('afterbegin', `
  <div class="topbar"><div class="container">
    <span class="tb-l"><a href="tel:${esc(s.phone)}">${ICON.chat} ${esc(s.phone)}</a><a href="mailto:${esc(s.email)}" class="hide-m">${ICON.mail} ${esc(s.email)}</a></span>
    <span class="tb-c">${ann.map((x, i) => `${i ? '<i>|</i>' : ''}<span class="${i ? 'hide-m' : ''}">${esc(x)}</span>`).join('')}</span>
    <span class="tb-r hide-m"><a href="/track">Track order</a><a href="/page/faq">Help</a>${s.facebook ? `<a href="${esc(s.facebook)}" target="_blank" rel="noopener">Facebook</a>` : ''}</span>
  </div></div>
  <header class="site"><div class="container bar">
    <button class="ibtn burger" aria-label="Open menu" id="burger">${ICON.menu}</button>
    ${logo}
    <form class="search" action="/shop" role="search"><input name="q" id="sq" placeholder="Search by model, design or colour" autocomplete="off" aria-label="Search products"><button aria-label="Search">${ICON.search}</button><div class="sugg" id="sugg"></div></form>
    <div class="icons">
      <a class="hbtn" href="${acct[0]}">${ICON.user}<span><small>${me.role ? 'My account' : 'Account'}</small>${esc(acct[1])}</span></a>
      <a class="hbtn" href="/cart">${ICON.bag}<em class="count" id="cartCount">0</em><span><small>My cart</small>Cart</span></a>
    </div>
  </div>
  <nav class="nav" aria-label="Main menu"><div class="container">
    ${nav.map(i => { const mg = mega(i); return `<div class="item ${mg ? 'has' : ''}"><a href="${esc(i.href)}" class="${isOn(i) ? 'on' : ''} ${i.key === 'sale' ? 'hot' : ''}">${esc(i.label)}${mg ? ICON.chev : ''}</a>${mg}</div>`; }).join('')}
  </div></nav></header>
  <div class="drawer" id="drawer"><div class="shade" data-dc></div><aside aria-label="Menu">
    <div class="dh">${logo}<button class="ibtn" data-dc aria-label="Close menu">${ICON.x}</button></div>
    ${nav.map(i => i.brand ? `<details><summary>${esc(i.label)} ${ICON.chev}</summary><div class="sub"><a href="/shop?brand=${i.brand.id}"><b>All ${esc(i.brand.name)}</b></a>${[...modelsOf(i.brand)].reverse().map(m => `<a href="/phone/${modelSlug(m.name)}">${esc(m.name)}</a>`).join('')}</div></details>`
      : i.key === 'designs' ? `<details><summary>${esc(i.label)} ${ICON.chev}</summary><div class="sub">${SITE.categories.map(c => `<a href="/category/${c.id}">${esc(c.name)}</a>`).join('')}</div></details>`
      : `<a class="dl" href="${esc(i.href)}">${esc(i.label)}</a>`).join('')}
    <a class="dl" href="/cart">Cart</a>
    ${me.role ? `<a class="dl" href="${acct[0]}">${me.role === 'admin' ? 'Admin panel' : 'My account'}</a><a class="dl" href="#" data-logout>Log out</a>` : '<a class="dl" href="/login">Sign in / Register</a>'}
    <div class="dfoot"><a href="tel:${esc(s.phone)}">${esc(s.phone)}</a><br>${esc(s.email)}</div></aside></div>`);
  const pages = s.pages || {};
  document.body.insertAdjacentHTML('beforeend', `
  <section class="help-strip"><div class="container"><div><b>Not sure which cover fits your phone?</b><span>Send us your phone model on WhatsApp — we reply fast.</span></div><a class="btn wa" href="https://wa.me/${s.whatsapp}" target="_blank" rel="noopener">${ICON.wa} WhatsApp ${esc(s.phone)}</a></div></section>
  <footer class="site"><div class="container fcols">
    <div>${logo}${s.slogan ? `<p class="fabout slogan-f">${ICON.tie} ${esc(s.slogan)}</p>` : ''}<p class="fabout">${esc(s.footerNote || s.tagline || '')}</p>
      <p class="fabout">${ICON.pin} ${esc(s.address)}</p>
      <div class="social">${s.facebook ? `<a href="${esc(s.facebook)}" target="_blank" rel="noopener" aria-label="Facebook">${ICON.fb}</a>` : ''}${s.instagram ? `<a href="${esc(s.instagram)}" target="_blank" rel="noopener" aria-label="Instagram">${ICON.ig}</a>` : ''}<a href="https://wa.me/${s.whatsapp}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICON.wa}</a><a href="mailto:${esc(s.email)}" aria-label="Email">${ICON.mail}</a></div></div>
    <div><h5>Shop</h5><ul><li><a href="/shop">All products</a></li>${SITE.brands.map(b => `<li><a href="/shop?brand=${b.id}">${esc(b.name)} covers</a></li>`).join('')}<li><a href="/shop?sale=1">Offers</a></li><li><a href="/shop?new=1">New arrivals</a></li></ul></div>
    <div><h5>Customer care</h5><ul><li><a href="/track">Track your order</a></li>${[['delivery', 'Delivery information'], ['returns', 'Return & exchange'], ['faq', 'FAQ'], ['privacy', 'Privacy policy'], ['terms', 'Terms & conditions']].filter(([k]) => pages[k]?.enabled !== false).map(([k, l]) => `<li><a href="/page/${k}">${esc(pages[k]?.title || l)}</a></li>`).join('')}</ul></div>
    <div><h5>Contact</h5><ul><li><a href="tel:${esc(s.phone)}">${esc(s.phone)}</a></li><li><a href="https://wa.me/${s.whatsapp}" target="_blank" rel="noopener">WhatsApp</a></li><li><a href="mailto:${esc(s.email)}">${esc(s.email)}</a></li><li><a href="/about">About us</a></li><li><a href="${acct[0]}">${me.role === 'admin' ? 'Admin panel' : me.role === 'user' ? 'My account' : 'Sign in / Register'}</a></li></ul>
      <div class="pay"><span>Cash on delivery</span><span>bKash</span><span>Nagad</span></div></div>
  </div>
  <div class="fbottom"><div class="container"><span>© ${new Date().getFullYear()} ${esc(s.siteName)}. All rights reserved.</span><span>Delivery all over Bangladesh</span></div></div></footer>
  <a class="wa-float" href="https://wa.me/${s.whatsapp}?text=${encodeURIComponent('Hi ' + s.siteName + '! I need help choosing a cover.')}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp">${ICON.wa}</a>`);
  document.addEventListener('click', e => { if (e.target.closest('[data-logout]')) { e.preventDefault(); Auth.logout(); } });
  const dr = $('#drawer'); $('#burger').onclick = () => dr.classList.add('open');
  dr.onclick = e => { if (e.target.closest('[data-dc]')) dr.classList.remove('open'); };
  // close mega menu after click (touch screens)
  $$('.nav .item.has > a').forEach(a => a.addEventListener('click', e => { if (matchMedia('(hover:none)').matches && !a.parentElement.classList.contains('open')) { e.preventDefault(); $$('.nav .item.open').forEach(x => x.classList.remove('open')); a.parentElement.classList.add('open'); } }));
  document.addEventListener('click', e => { if (!e.target.closest('.nav')) $$('.nav .item.open').forEach(x => x.classList.remove('open')); });
  // live search
  const sq = $('#sq'), sg = $('#sugg');
  sq.value = new URLSearchParams(location.search).get('q') || '';
  sq.oninput = () => {
    const q = sq.value.trim().toLowerCase(); if (q.length < 2) return sg.classList.remove('open');
    const hits = P.filter(p => (p.name + ' ' + p.models.join(' ') + ' ' + p.variants.map(v => v.name).join(' ') + ' ' + brandName(p.brand)).toLowerCase().includes(q)).slice(0, 6);
    sg.innerHTML = hits.length ? hits.map(p => `<a href="/product/${p.slug}"><img src="${esc(p.variants[0]?.images[0] || s.logo)}" alt="">${esc(p.name)}<span>${money(priceInfo(p).final)}</span></a>`).join('') + `<a href="/shop?q=${encodeURIComponent(sq.value)}" class="all">See all results</a>` : '<a class="none">No matching products</a>';
    sg.classList.add('open');
  };
  document.addEventListener('click', e => { if (!e.target.closest('.search')) sg.classList.remove('open'); });
  updateCount();
  return SITE;
}
function reveal() { $$('.reveal').forEach(e => e.classList.add('in')); }
