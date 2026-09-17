# Cravat Cases — Website

iPhone & Google Pixel cover shop. Customers order on WhatsApp (cash on delivery), every order is saved in the admin panel.
Pure Node.js — **no `npm install` needed**.

## Run on your computer (Windows)
    cd F:\cover\cravat
    node server.js
- Computer: http://localhost:3000
- Phone on the same Wi-Fi: the `192.168.x.x:3000` address printed in the terminal

## Admin
- Sign in at **/login** → email **cravatcases@gmail.com**, password **cravat@2026** → opens **/admin**
- Change the password first (Admin → Login & password). The dashboard shows a "Getting started" checklist.

---

## Go live on cPanel (step by step)
1. **Zip** the `cravat` folder (it must contain `app.js`, `server.js`, `package.json`, `data/`, `public/`).
2. cPanel → **File Manager** → create a folder e.g. `cravat` in your home directory (NOT inside `public_html`) → **Upload** the zip → **Extract**.
3. cPanel → **Setup Node.js App** → **Create Application**
   - Node.js version: **18 or newer** (20 recommended)
   - Application mode: **Production**
   - Application root: `cravat`
   - Application URL: your domain (e.g. `cravatcases.com`)
   - Application startup file: `app.js`
   - Click **Create**. (No "Run NPM Install" needed — there are no packages.)
4. Click **Start / Restart**. Open your domain — the website is live.
5. cPanel → **SSL/TLS Status** → run **AutoSSL** so the site opens with **https://**.
6. Log in to /admin and change the password.

**Updating later:** stop/restart is done from *Setup Node.js App*. When you upload new files, **do not overwrite `data/db.json` and `public/uploads/`** — they contain your products, orders, customers and photos.

**Backup:** download `data/db.json` and the `public/uploads/` folder regularly (e.g. weekly).

### VPS instead of cPanel
    npm i -g pm2 && pm2 start app.js --name cravat && pm2 save
Put Nginx in front (proxy to port 3000) and enable HTTPS with Let's Encrypt.

## What's included
**Store:** home banners · all products · phone model pages (/phone/…) · designs · offers · search · filters (model, design, colour, price, stock) · product page with colour/stock · cart & coupons · WhatsApp order with optional delivery details · order confirmation · order tracking (/track) · customer accounts · policy pages (delivery, return, FAQ, privacy, terms) · 404 page · sitemap.xml & robots.txt · mobile-friendly, installable (Add to Home Screen), gzip compressed.

**Admin:** dashboard + getting-started checklist · new manual order → A4 invoice PDF / WhatsApp · orders (status, stock auto-update) · customers · products (quick price & stock edit, colours, photos, models, discount) · phones & models (with photos) · designs · coupons · home banners (photo or brand-card style) · website menu editor · pages & policies editor · site settings (logo, contact, delivery, about, offer banner) · login & password.
