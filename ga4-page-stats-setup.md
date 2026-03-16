# GA4 Stats Setup (Relevant + Popular Recommendations)

`/api/page-stats` reads GA4 data and feeds sidebar recommendations.

## 1) Create Service Account
- In Google Cloud: create a Service Account.
- Create a JSON key for it.

## 2) Grant GA4 Access
- In GA4 Admin → Property Access Management:
- Add the service account email as `Viewer` (or `Analyst`).

## 3) Add Vercel Environment Variables
- `GA4_PROPERTY_ID` = your GA4 property id (numbers only)
- `GA4_CLIENT_EMAIL` = service account client email
- `GA4_PRIVATE_KEY` = private key from JSON (with `\n` newlines escaped)

## 4) Redeploy
- Redeploy your Vercel project after adding env vars.

## 5) Verify
- Open `/api/page-stats` on your domain.
- You should see JSON with `pages` and values like:
  - `views`
  - `engagement_seconds`

If API is unavailable, frontend automatically falls back to `/data/page-stats.json`.
