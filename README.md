# ParkAtEase
Find and reserve parking across India. Attendants standing at vacant spots update availability; drivers reserve online for a small fee and earn ParkPoints.

**Assignment starter:** runs with zero setup. Data lives in the browser (localStorage), payment is mocked.

## Run
    npm install
    npm run dev

## Demo accounts (password `demo123`)
- `driver@demo` - find spots, reserve, see ParkPoints
- `attendant@demo` - update popup, verify booking code, mark completed (+15 points to driver, 10% commission logged)

Tip: open two tabs (one per role). Changes sync between tabs.

## Deploy to GitHub Pages
Push to `main`, then in the repo go to Settings > Pages > Source: **GitHub Actions**. The workflow in `.github/workflows/deploy.yml` builds and publishes.

## Future scope
Supabase backend and real auth, Razorpay, Leaflet map, admin panel, Hindi/Marathi, referral tracking, QR scanning.
