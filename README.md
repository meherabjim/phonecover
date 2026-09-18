# Cravat Cases — Website

iPhone & Google Pixel cover shop. Customers order on WhatsApp (cash on delivery), every order is saved in the admin panel.
Pure Node.js — **no `npm install` needed**.

## Run on your computer (Windows)
    cd F:\cover\cravat
    node server.js
- Computer: http://localhost:3000
- Phone on the same Wi-Fi: the `192.168.x.x:3000` address printed in the terminal

## Admin password — set it before the site goes live

**Easiest way (recommended on cPanel).** cPanel → *Setup Node.js App* → open the app → **Environment variables** → **Add Variable**:

      Name:  ADMIN_PASSWORD
      Value: your own password (8+ characters)

Click **Save**, then **Restart**. Sign in at **/login** with `cravatcases@gmail.com` and that password — the panel is fully usable straight away. You can delete the variable afterwards; the password stays.

**Other way.** Start the app without that variable and it prints a one-time password in the terminal (on your own computer) or in the cPanel app log:

      ADMIN LOGIN → cravatcases@gmail.com / XXXXXXXX

Sign in with it, then Admin → **Account** → set your own password. Until you do, the panel is **read-only** and a yellow bar reminds you. Saving a new password signs out every other device.

**Forgot it?** File Manager → open `data/db.json` → delete the `"admin": { ... }` block → save → Restart, then use either way above.

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
6. Set the admin password — see **Admin password** above.
7. Once https works, add `FORCE_HTTPS=1` in *Setup Node.js App → Environment variables* and restart.

### Security settings (Setup Node.js App → Environment variables — all optional)
| Variable | Default | What it does |
|---|---|---|
| `ADMIN_PASSWORD` | random | Your own admin password (8+ chars) — see the Admin section above |
| `FORCE_HTTPS` | off | Redirects http → https |
| `SESSION_DAYS` | `7` | How long a login lasts |
| `TRUST_PROXY` | auto | `1` behind Nginx/Apache, `0` if the app faces the internet directly |
| `SITE_URL` | — | e.g. `https://cravatcases.com` — used for sitemap and WhatsApp link previews |

Built in already: login limited per device *and* per account, security headers (CSP, nosniff, clickjacking, HSTS), prices recalculated on the server, uploaded photos checked to be real images, admin password change requires the current password.

## Git

`data/db.json` is in `.gitignore` and **must stay out of git** — it holds the admin password hash, your customers' names, phones and addresses, and every order. Once something is committed it stays in the history forever, even if the file is deleted later.

What is committed instead is `data/db.seed.json` — the starter catalogue with no password, no orders, no customers. On a machine where `data/db.json` does not exist yet, the server copies the seed into place on first start.

So on the live server the admin password comes from the **`ADMIN_PASSWORD`** environment variable (see above), not from git.

If `data/db.json` was committed before, stop tracking it:

    git rm --cached data/db.json
    git commit -m "Stop tracking live data"

Changed the product list and want it in the repo? Refresh the seed (strips password, orders and customers):

    node -e "const f=require('fs'),d=JSON.parse(f.readFileSync('data/db.json','utf8'));delete d.admin;delete d.counters;d.orders=[];d.users=[];d.sessions={};f.writeFileSync('data/db.seed.json',JSON.stringify(d,null,2))"

**Updating later:** stop/restart is done from *Setup Node.js App*. When you upload new files, **do not overwrite `data/db.json` and `public/uploads/`** — they contain your products, orders, customers and photos.

**Backup:** download `data/db.json` and the `public/uploads/` folder regularly (e.g. weekly).

### VPS instead of cPanel
    npm i -g pm2 && pm2 start app.js --name cravat && pm2 save
Put Nginx in front (proxy to port 3000) and enable HTTPS with Let's Encrypt.

## What's included
**Store:** home banners · all products · phone model pages (/phone/…) · designs · offers · search · filters (model, design, colour, price, stock) · product page with colour/stock · cart & coupons · WhatsApp order with optional delivery details · order confirmation · order tracking (/track) · customer accounts · policy pages (delivery, return, FAQ, privacy, terms) · 404 page · sitemap.xml & robots.txt · mobile-friendly, installable (Add to Home Screen), gzip compressed.

**Admin:** dashboard + getting-started checklist · new manual order → A4 invoice PDF / WhatsApp · orders (status, stock auto-update) · customers · products (quick price & stock edit, colours, photos, models, discount) · phones & models (with photos) · designs · coupons · home banners (photo or brand-card style) · website menu editor · pages & policies editor · site settings (logo, contact, delivery, about, offer banner) · login & password.
