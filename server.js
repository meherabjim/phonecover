// Cravat Cases — zero-dependency Node.js server
// JSON storage · customer accounts · admin API · image uploads · WhatsApp order log
const http = require('http');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;
const PUB = path.join(ROOT, 'public');
const DB_FILE = path.join(ROOT, 'data', 'db.json');
const UPLOADS = path.join(PUB, 'uploads');
fs.mkdirSync(UPLOADS, { recursive: true });

// ---------- JSON database ----------
let db = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
let saveTimer = null;
function save() { // debounced atomic write
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => { const tmp = DB_FILE + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(db, null, 2)); fs.renameSync(tmp, DB_FILE); }, 60);
}
const slugify = s => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const uid = () => crypto.randomBytes(6).toString('hex');
const hashPw = (pw, salt) => crypto.scryptSync(String(pw), salt, 64).toString('hex');
const sha = s => crypto.createHash('sha256').update(s).digest('hex');
const str = (v, n = 300) => String(v ?? '').trim().slice(0, n);
const normPhone = p => { let d = String(p || '').replace(/\D/g, ''); if (d.startsWith('880')) d = d.slice(2); if (d.length === 10 && d[0] === '1') d = '0' + d; return d; };

// defaults / migrations
db.users = db.users || []; db.orders = db.orders || []; db.sessions = db.sessions || {};
db.banners = db.banners || []; db.coupons = db.coupons || [];
db.settings.logo = db.settings.logo || '/img/logo.png';
if (db.settings.showWordmark === undefined) db.settings.showWordmark = true;
db.products.forEach(p => p.variants.forEach(v => { if (v.qty === undefined) v.qty = v.stock === false ? 0 : 10; v.stock = v.qty > 0; }));
db.brands.forEach(b => { b.models = (b.models || []).map(m => typeof m === 'string' ? { name: m, image: '', active: true } : m); });
if (!db.admin) {
  const salt = crypto.randomBytes(16).toString('hex');
  db.admin = { email: (process.env.ADMIN_EMAIL || db.settings.adminEmail || 'admin@example.com').toLowerCase(), salt, hash: hashPw(process.env.ADMIN_PASSWORD || 'cravat@2026', salt) };
}
save();

// ---------- sessions (persisted, token hashed) ----------
const DAY = 864e5;
function newSession(role, userId) {
  const token = crypto.randomBytes(32).toString('hex');
  db.sessions[sha(token)] = { role, userId: userId || null, exp: Date.now() + 30 * DAY };
  for (const [k, s] of Object.entries(db.sessions)) if (s.exp < Date.now()) delete db.sessions[k];
  save(); return token;
}
function session(req) {
  const t = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!t) return null;
  const s = db.sessions[sha(t)];
  if (!s || s.exp < Date.now()) return null;
  if (s.role === 'user' && !db.users.some(u => u.id === s.userId)) return null;
  return { ...s, key: sha(t) };
}
function admin(req, res, next) { const s = session(req); if (s?.role !== 'admin') return res.status(401).json({ error: 'Please log in as admin' }); next(); }
function member(req, res, next) { const s = session(req); if (s?.role !== 'user') return res.status(401).json({ error: 'Please log in' }); req.user = db.users.find(u => u.id === s.userId); next(); }
const publicUser = u => u && ({ id: u.id, name: u.name, phone: u.phone, email: u.email, address: u.address || '', area: u.area || 'inside', createdAt: u.createdAt });

// login throttling
const fails = new Map();
function throttled(req) { const t = fails.get(req.ip); return t && t.n >= 8 && Date.now() - t.t < 15 * 60 * 1000; }
function fail(req) { const t = fails.get(req.ip) || { n: 0 }; fails.set(req.ip, { n: t.n + 1, t: Date.now() }); }

// ---------- router ----------
const routes = [];
const on = (method, pattern, ...handlers) => {
  const keys = []; const re = new RegExp('^' + pattern.replace(/:(\w+)/g, (_, k) => (keys.push(k), '([^/]+)')) + '$');
  routes.push({ method, re, keys, handlers });
};
const live = endsAt => !endsAt || new Date(endsAt + 'T23:59:59') >= new Date();
const origin = req => `${String(req.headers['x-forwarded-proto'] || 'http').split(',')[0]}://${req.headers['x-forwarded-host'] || req.headers.host}`;
const finalPrice = p => { const d = p.discount || {}; if (!d.value || !live(d.endsAt)) return p.price; return Math.max(0, Math.round(d.type === 'percent' ? p.price * (1 - d.value / 100) : p.price - d.value)); };

// ---------- public API ----------
on('GET', '/api/site', (req, res) => res.json({
  settings: db.settings,
  brands: db.brands.map(b => ({ ...b, models: b.models.filter(m => m.active !== false) })),
  categories: db.categories.filter(c => c.active !== false),
  banners: db.banners.filter(b => b.active !== false),
  hasCoupons: db.coupons.some(c => c.active !== false && live(c.endsAt))
}));
const trackHits = new Map();
on('GET', '/api/track', (req, res) => {
  const t = trackHits.get(req.ip) || { n: 0, t: Date.now() }; if (Date.now() - t.t > 600000) { t.n = 0; t.t = Date.now(); } t.n++; trackHits.set(req.ip, t);
  if (t.n > 30) return res.status(429).json({ error: 'Too many requests, try again later' });
  const u = new URL(req.url, 'http://x'), no = str(u.searchParams.get('no'), 20).toUpperCase(), phone = normPhone(u.searchParams.get('phone'));
  const o = db.orders.find(x => x.no.toUpperCase() === no && phone.length === 11 && normPhone(x.customer?.phone) === phone);
  if (!o) return res.status(404).json({ error: 'Order not found' });
  res.json({ no: o.no, status: o.status, createdAt: o.createdAt, delivery: o.delivery, total: o.total, items: o.items.map(({ name, model, color, qty, image }) => ({ name, model, color, qty, image })) });
});
on('GET', '/robots.txt', (req, res) => { res.setHeader('Content-Type', 'text/plain'); res.end(`User-agent: *\nDisallow: /admin\nDisallow: /account\nDisallow: /invoice\nDisallow: /api/\nSitemap: ${origin(req)}/sitemap.xml\n`); });
on('GET', '/sitemap.xml', (req, res) => {
  const o = origin(req), urls = ['/', '/shop', '/about', '/contact', '/track', ...db.categories.filter(c => c.active !== false).map(c => '/category/' + c.id), ...db.brands.flatMap(b => b.models.filter(m => m.active !== false).map(m => '/phone/' + slugify(m.name))), ...db.products.filter(p => p.active !== false).map(p => '/product/' + p.slug), ...Object.keys(db.settings.pages || {}).map(k => '/page/' + k)];
  res.setHeader('Content-Type', 'application/xml'); res.end(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.map(u => `<url><loc>${o}${u}</loc></url>`).join('')}</urlset>`);
});
on('GET', '/api/products', (req, res) => res.json(db.products.filter(p => p.active !== false)));
on('GET', '/api/products/:slug', (req, res) => {
  const p = db.products.find(x => x.slug === req.params.slug && x.active !== false);
  p ? res.json(p) : res.status(404).json({ error: 'Not found' });
});
on('POST', '/api/coupon', (req, res) => {
  const code = str(req.body?.code, 40).toUpperCase(), subtotal = Number(req.body?.subtotal) || 0;
  const c = db.coupons.find(x => x.code.toUpperCase() === code && x.active !== false && live(x.endsAt));
  if (!c) return res.status(404).json({ error: 'Invalid or expired coupon' });
  if (subtotal < (Number(c.minOrder) || 0)) return res.status(400).json({ error: `Minimum order ৳${c.minOrder} for this coupon` });
  const amount = Math.round(c.type === 'percent' ? subtotal * c.value / 100 : Math.min(subtotal, c.value));
  res.json({ code: c.code, amount, label: c.type === 'percent' ? `${c.value}% off` : `৳${c.value} off` });
});

// ---------- accounts (one login for customers and admin) ----------
on('POST', '/api/auth/register', (req, res) => {
  const b = req.body || {};
  const name = str(b.name, 80), phone = normPhone(b.phone), email = str(b.email, 120).toLowerCase(), password = String(b.password || '');
  if (!name) return res.status(400).json({ error: 'Please enter your name' });
  if (!/^01\d{9}$/.test(phone)) return res.status(400).json({ error: 'Enter a valid 11-digit mobile number (01XXXXXXXXX)' });
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return res.status(400).json({ error: 'Enter a valid email or leave it empty' });
  if (password.length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  if (db.users.some(u => u.phone === phone)) return res.status(409).json({ error: 'An account with this phone already exists — please sign in' });
  if (email && (db.users.some(u => u.email === email) || email === db.admin.email)) return res.status(409).json({ error: 'This email is already registered' });
  const salt = crypto.randomBytes(16).toString('hex');
  const u = { id: uid(), name, phone, email, salt, hash: hashPw(password, salt), address: '', area: 'inside', createdAt: Date.now() };
  db.users.unshift(u);
  res.json({ token: newSession('user', u.id), role: 'user', user: publicUser(u) });
});
on('POST', '/api/auth/login', (req, res) => {
  if (throttled(req)) return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  const id = str(req.body?.id, 120).toLowerCase(), password = String(req.body?.password || '');
  const eq = (a, b) => a.length === b.length && crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
  if (id === db.admin.email && eq(hashPw(password, db.admin.salt), db.admin.hash)) {
    fails.delete(req.ip); return res.json({ token: newSession('admin'), role: 'admin' });
  }
  const phone = normPhone(id);
  const u = db.users.find(x => (x.email && x.email === id) || (phone.length === 11 && x.phone === phone));
  if (u && eq(hashPw(password, u.salt), u.hash)) { fails.delete(req.ip); return res.json({ token: newSession('user', u.id), role: 'user', user: publicUser(u) }); }
  fail(req); res.status(401).json({ error: 'Wrong phone/email or password' });
});
on('GET', '/api/auth/me', (req, res) => {
  const s = session(req); if (!s) return res.json({ role: null });
  res.json(s.role === 'admin' ? { role: 'admin', email: db.admin.email } : { role: 'user', user: publicUser(db.users.find(u => u.id === s.userId)) });
});
on('POST', '/api/auth/logout', (req, res) => { const s = session(req); if (s) { delete db.sessions[s.key]; save(); } res.json({ ok: true }); });
on('PUT', '/api/account', member, (req, res) => {
  const b = req.body || {}, u = req.user;
  if (b.name !== undefined) { if (!str(b.name)) return res.status(400).json({ error: 'Name cannot be empty' }); u.name = str(b.name, 80); }
  if (b.phone !== undefined) { const p = normPhone(b.phone); if (!/^01\d{9}$/.test(p)) return res.status(400).json({ error: 'Enter a valid mobile number' }); if (db.users.some(x => x.phone === p && x.id !== u.id)) return res.status(409).json({ error: 'Phone already used by another account' }); u.phone = p; }
  if (b.email !== undefined) { const e = str(b.email, 120).toLowerCase(); if (e && !/^\S+@\S+\.\S+$/.test(e)) return res.status(400).json({ error: 'Enter a valid email' }); if (e && db.users.some(x => x.email === e && x.id !== u.id)) return res.status(409).json({ error: 'Email already used' }); u.email = e; }
  if (b.address !== undefined) u.address = str(b.address, 400);
  if (b.area !== undefined) u.area = b.area === 'outside' ? 'outside' : 'inside';
  if (b.newPassword) {
    if (!b.currentPassword || hashPw(b.currentPassword, u.salt) !== u.hash) return res.status(400).json({ error: 'Current password is wrong' });
    if (String(b.newPassword).length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' });
    u.salt = crypto.randomBytes(16).toString('hex'); u.hash = hashPw(b.newPassword, u.salt);
  }
  save(); res.json({ user: publicUser(u) });
});
on('GET', '/api/account/orders', member, (req, res) => res.json(db.orders.filter(o => o.userId === req.user.id)));

// ---------- orders (logged when a customer taps "Order on WhatsApp") ----------
const lastOrder = new Map();
on('POST', '/api/orders', (req, res) => {
  const b = req.body || {}, s = session(req);
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 30).map(i => ({ slug: str(i.slug, 120), name: str(i.name, 150), model: str(i.model, 60), color: str(i.color, 60), image: str(i.image, 200), qty: Math.max(1, Math.min(99, parseInt(i.qty) || 1)), price: Number(i.price) || 0 }));
  if (!items.length) return res.status(400).json({ error: 'No items' });
  if (!/^01[3-9]\d{8}$/.test(normPhone(b.phone))) return res.status(400).json({ error: 'Please enter a valid 11-digit mobile number' });
  b.phone = normPhone(b.phone);
  if (Date.now() - (lastOrder.get(req.ip) || 0) < 4000) return res.status(429).json({ error: 'Please wait a few seconds and try again' });
  lastOrder.set(req.ip, Date.now());
  const no = 'CC' + (1001 + db.orders.length);
  db.orders.unshift({ id: uid(), no, createdAt: Date.now(), status: 'new', userId: s?.role === 'user' ? s.userId : null,
    customer: { name: str(b.name, 80), phone: str(b.phone, 30), address: str(b.address, 400), area: b.area === 'outside' ? 'outside' : 'inside', note: str(b.note) },
    items, coupon: str(b.coupon, 30), discount: Number(b.discount) || 0, delivery: Number(b.delivery) || 0, total: Number(b.total) || 0 });
  if (db.orders.length > 5000) db.orders.length = 5000;
  save(); res.json({ ok: true, no });
});

// ---------- admin API ----------
on('GET', '/api/admin/site', admin, (req, res) => { const { admin: a, products, orders, users, sessions, ...rest } = db; res.json({ ...rest, admin: { email: a.email } }); });
on('GET', '/api/admin/products', admin, (req, res) => res.json(db.products));
on('POST', '/api/admin/products', admin, (req, res) => { const p = normalizeProduct(req.body, { id: uid(), createdAt: Date.now() }); db.products.unshift(p); save(); res.json(p); });
on('PUT', '/api/admin/products/:id', admin, (req, res) => {
  const i = db.products.findIndex(x => x.id === req.params.id); if (i < 0) return res.status(404).json({ error: 'Not found' });
  db.products[i] = normalizeProduct(req.body, db.products[i]); save(); res.json(db.products[i]);
});
on('DELETE', '/api/admin/products/:id', admin, (req, res) => { db.products = db.products.filter(x => x.id !== req.params.id); save(); res.json({ ok: true }); });
on('PUT', '/api/admin/settings', admin, (req, res) => {
  const { settings, brands, categories, banners, coupons } = req.body || {};
  if (settings) db.settings = { ...db.settings, ...settings };
  if (Array.isArray(brands)) db.brands = brands.map(b => ({ ...b, id: slugify(b.id) || uid(), models: (b.models || []).filter(m => str(m.name)).map(m => ({ name: str(m.name, 60), image: str(m.image, 200), active: m.active !== false })) }));
  if (Array.isArray(categories)) db.categories = categories.map(c => ({ ...c, id: c.id || slugify(c.name) || uid() }));
  if (Array.isArray(banners)) db.banners = banners.map(b => ({ ...b, id: b.id || uid() }));
  if (Array.isArray(coupons)) db.coupons = coupons.filter(c => c.code).map(c => ({ ...c, code: str(c.code, 40).toUpperCase(), value: Number(c.value) || 0, minOrder: Number(c.minOrder) || 0 }));
  save(); res.json({ ok: true });
});
on('POST', '/api/admin/password', admin, (req, res) => {
  const { email, password } = req.body || {};
  const e = str(email || db.admin.email, 120).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(e)) return res.status(400).json({ error: 'Enter a valid email' });
  if (db.users.some(u => u.email === e)) return res.status(409).json({ error: 'A customer already uses this email' });
  if (password && String(password).length < 6) return res.status(400).json({ error: 'Password must be at least 6 characters' });
  db.admin.email = e;
  if (password) { db.admin.salt = crypto.randomBytes(16).toString('hex'); db.admin.hash = hashPw(password, db.admin.salt); }
  if (password) db.settings.passwordChanged = true;
  save(); res.json({ ok: true });
});
on('POST', '/api/admin/upload', admin, (req, res) => {
  const out = [];
  for (const d of (req.body?.images || []).slice(0, 20)) {
    const m = /^data:image\/(jpeg|png|webp|gif|avif);base64,(.+)$/.exec(d || ''); if (!m) continue;
    const name = Date.now() + '-' + uid() + '.' + (m[1] === 'jpeg' ? 'jpg' : m[1]);
    fs.writeFileSync(path.join(UPLOADS, name), Buffer.from(m[2], 'base64')); out.push('/uploads/' + name);
  }
  res.json(out);
});
on('GET', '/api/admin/orders', admin, (req, res) => res.json(db.orders));
on('GET', '/api/admin/orders/:id', admin, (req, res) => { const o = db.orders.find(x => x.id === req.params.id); o ? res.json(o) : res.status(404).json({ error: 'Not found' }); });
const applyStock = (o, want) => {
  if (want === !!o.stockApplied) return;
  for (const i of o.items) { const v = db.products.find(p => p.slug === i.slug)?.variants.find(x => x.name === i.color); if (v) { v.qty = Math.max(0, (v.qty || 0) + (want ? -i.qty : i.qty)); v.stock = v.qty > 0; } }
  o.stockApplied = want;
};
// manual order entered by admin (phone / shop / Facebook orders) → invoice PDF
on('POST', '/api/admin/orders', admin, (req, res) => {
  const b = req.body || {};
  const items = (Array.isArray(b.items) ? b.items : []).slice(0, 50).map(i => {
    const p = db.products.find(x => x.slug === i.slug), v = p?.variants.find(x => x.name === i.color);
    return { slug: str(i.slug, 120), name: str(i.name || p?.name, 150), model: str(i.model, 60), color: str(i.color, 60), image: v?.images?.[0] || '', qty: Math.max(1, Math.min(999, parseInt(i.qty) || 1)), price: Math.max(0, Number(i.price) || 0) };
  }).filter(i => i.name);
  if (!items.length) return res.status(400).json({ error: 'Add at least one product' });
  const subtotal = items.reduce((a, i) => a + i.price * i.qty, 0), discount = Math.min(subtotal, Math.max(0, Number(b.discount) || 0)), delivery = Math.max(0, Number(b.delivery) || 0);
  const status = ['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(b.status) ? b.status : 'confirmed';
  const c = b.customer || {};
  const o = { id: uid(), no: 'CC' + (1001 + db.orders.length), createdAt: Date.now(), status, source: 'manual', userId: null,
    customer: { name: str(c.name, 80), phone: str(c.phone, 30), area: c.area === 'outside' ? 'outside' : 'inside', district: str(c.district, 60), thana: str(c.thana, 60), address: str(c.address, 400), note: str(c.note) },
    items, coupon: '', discount, delivery, total: subtotal - discount + delivery, payment: str(b.payment || 'Cash on delivery', 40), paid: Math.max(0, Number(b.paid) || 0) };
  db.orders.unshift(o);
  applyStock(o, ['confirmed', 'shipped', 'delivered'].includes(status));
  save(); res.json(o);
});
on('PUT', '/api/admin/orders/:id', admin, (req, res) => {
  const o = db.orders.find(x => x.id === req.params.id); if (!o) return res.status(404).json({ error: 'Not found' });
  const st = req.body?.status;
  if (['new', 'confirmed', 'shipped', 'delivered', 'cancelled'].includes(st)) {
    // stock is taken when an order is confirmed (or later) and given back if it is cancelled / reset to new
    applyStock(o, ['confirmed', 'shipped', 'delivered'].includes(st));
    o.status = st;
  }
  save(); res.json(o);
});
on('DELETE', '/api/admin/orders/:id', admin, (req, res) => { db.orders = db.orders.filter(x => x.id !== req.params.id); save(); res.json({ ok: true }); });
on('GET', '/api/admin/customers', admin, (req, res) => res.json(db.users.map(u => ({ ...publicUser(u), orders: db.orders.filter(o => o.userId === u.id).length }))));
on('DELETE', '/api/admin/customers/:id', admin, (req, res) => {
  db.users = db.users.filter(u => u.id !== req.params.id);
  for (const [k, s] of Object.entries(db.sessions)) if (s.userId === req.params.id) delete db.sessions[k];
  save(); res.json({ ok: true });
});

function normalizeProduct(b, base) {
  const name = str(b.name || base.name || 'Untitled', 150);
  let slug = slugify(b.slug || name) || uid();
  if (db.products.some(x => x.slug === slug && x.id !== base.id)) slug += '-' + uid().slice(0, 4);
  return {
    ...base, name, slug,
    brand: b.brand || db.brands[0]?.id,
    categories: Array.isArray(b.categories) ? b.categories.filter(Boolean) : [],
    price: Math.max(0, Number(b.price) || 0),
    discount: { type: b.discount?.type === 'flat' ? 'flat' : 'percent', value: Math.max(0, Number(b.discount?.value) || 0), endsAt: str(b.discount?.endsAt, 10) },
    description: String(b.description || ''),
    features: Array.isArray(b.features) ? b.features.map(f => str(f, 200)).filter(Boolean) : [],
    models: Array.isArray(b.models) ? b.models.map(m => str(m, 60)) : [],
    variants: (Array.isArray(b.variants) ? b.variants : []).map(v => { const qty = Math.max(0, Math.min(99999, parseInt(v.qty) || 0)); return { name: str(v.name || 'Default', 60), hex: /^#[0-9a-f]{6}$/i.test(v.hex) ? v.hex : '#cccccc', images: Array.isArray(v.images) ? v.images : [], qty, stock: qty > 0 }; }),
    featured: !!b.featured, isNew: !!b.isNew, active: b.active !== false, badge: str(b.badge, 30),
    updatedAt: Date.now()
  };
}

// ---------- pages ----------
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'application/javascript; charset=utf-8', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.avif': 'image/avif', '.webmanifest': 'application/manifest+json' };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const page = f => path.join(PUB, f);
on('GET', '/product/:slug', (req, res) => {
  let html = fs.readFileSync(page('product.html'), 'utf8');
  const p = db.products.find(x => x.slug === req.params.slug);
  if (p) { // Open Graph tags → rich preview when the link is shared on WhatsApp / Facebook
    const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers['x-forwarded-host'] || req.headers.host}`;
    const img = p.variants?.[0]?.images?.[0] || db.settings.logo;
    html = html.replace(/<title>.*?<\/title>/, `<title>${esc(p.name)} | ${esc(db.settings.siteName)}</title>
<meta name="description" content="${esc(p.description.slice(0, 160))}"><meta property="og:title" content="${esc(p.name)} — ৳${finalPrice(p)}">
<meta property="og:description" content="${esc(p.description.slice(0, 160))}"><meta property="og:image" content="${origin}${img}"><meta property="og:type" content="product">`);
  }
  res.html(html);
});
on('GET', '/category/:id', (req, res) => res.file(page('shop.html')));
on('GET', '/phone/:slug', (req, res) => res.file(page('shop.html')));
on('GET', '/page/:slug', (req, res) => res.file(page('page.html')));
for (const n of ['shop', 'cart', 'contact', 'admin', 'about', 'login', 'account', 'invoice', 'track']) on('GET', '/' + n, (req, res) => res.file(page(n + '.html')));

function sendFile(res, file, status = 200) {
  fs.stat(file, (err, st) => {
    if (err || !st.isFile()) return status === 404 ? res.status(404).end('Not found') : sendFile(res, page('404.html'), 404);
    const ext = path.extname(file).toLowerCase();
    const headers = { 'Content-Type': MIME[ext] || 'application/octet-stream', 'Cache-Control': file.includes(`${path.sep}uploads${path.sep}`) ? 'public, max-age=604800' : ext === '.html' ? 'no-cache' : 'public, max-age=600', 'Vary': 'Accept-Encoding' };
    // gzip text files → much faster loading on mobile data
    if (/\.(html|css|js|json|svg|webmanifest)$/.test(ext) && /\bgzip\b/.test(res.req.headers['accept-encoding'] || '')) {
      res.writeHead(status, { ...headers, 'Content-Encoding': 'gzip' });
      return fs.createReadStream(file).pipe(require('zlib').createGzip()).pipe(res);
    }
    res.writeHead(status, { ...headers, 'Content-Length': st.size });
    fs.createReadStream(file).pipe(res);
  });
}

const server = http.createServer((req, res) => {
  res.status = c => (res.statusCode = c, res);
  res.req = req;
  res.json = o => { const body = JSON.stringify(o); res.setHeader('Content-Type', 'application/json'); if (body.length > 2048 && /\bgzip\b/.test(req.headers['accept-encoding'] || '')) { res.setHeader('Content-Encoding', 'gzip'); return res.end(require('zlib').gzipSync(body)); } res.end(body); };
  res.html = h => { res.setHeader('Content-Type', 'text/html; charset=utf-8'); res.setHeader('Cache-Control', 'no-cache'); res.end(h); };
  res.file = f => sendFile(res, f);
  req.ip = String(req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
  let pathname; try { pathname = decodeURIComponent(new URL(req.url, 'http://x').pathname); } catch { return res.status(400).end(); }
  const route = routes.find(r => r.method === req.method && r.re.test(pathname));
  if (!route) {
    if (req.method !== 'GET' && req.method !== 'HEAD') return res.status(404).json({ error: 'Not found' });
    if (pathname.startsWith('/api/') || pathname.startsWith('/data')) return res.status(404).json({ error: 'Not found' });
    const file = path.normalize(path.join(PUB, pathname === '/' ? 'index.html' : pathname));
    if (!file.startsWith(PUB)) return res.status(403).end();
    return sendFile(res, file);
  }
  const m = route.re.exec(pathname); req.params = {}; route.keys.forEach((k, i) => req.params[k] = m[i + 1]);
  const chunks = []; let size = 0;
  req.on('data', c => { size += c.length; if (size > 30 * 1024 * 1024) req.destroy(); else chunks.push(c); });
  req.on('end', () => {
    try { req.body = chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}; } catch { return res.status(400).json({ error: 'Bad request' }); }
    let i = 0; const next = () => { const h = route.handlers[i++]; h && h(req, res, next); };
    try { next(); } catch (e) { console.error(e); res.status(500).json({ error: 'Server error' }); }
  });
});
const onReady = () => {
  let ips = []; try { ips = Object.values(require('os').networkInterfaces()).flat().filter(n => n && n.family === 'IPv4' && !n.internal).map(n => n.address); } catch {}
  console.log(`\n  Cravat Cases is running\n  • This computer:  http://localhost:${PORT}`);
  ips.forEach(ip => console.log(`  • Phone (same Wi-Fi): http://${ip}:${PORT}`));
  console.log('');
};
// cPanel (Passenger) gives PORT as a socket path — only bind 0.0.0.0 for normal numeric ports
if (/^\d+$/.test(String(PORT))) server.listen(+PORT, '0.0.0.0', onReady); else server.listen(PORT, onReady);
// flush pending writes on shutdown (Ctrl+C)
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => { clearTimeout(saveTimer); try { fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2)); } catch {} process.exit(0); });
