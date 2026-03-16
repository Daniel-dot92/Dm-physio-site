const crypto = require('crypto');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GA4_URL = 'https://analyticsdata.googleapis.com/v1beta';

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function signJwt(serviceEmail, privateKey) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceEmail,
    sub: serviceEmail,
    aud: TOKEN_URL,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    iat: now,
    exp: now + 3600
  };

  const encodedHeader = base64url(JSON.stringify(header));
  const encodedPayload = base64url(JSON.stringify(payload));
  const toSign = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createSign('RSA-SHA256')
    .update(toSign)
    .end()
    .sign(privateKey);

  return `${toSign}.${base64url(signature)}`;
}

async function getAccessToken(serviceEmail, privateKey) {
  const jwt = signJwt(serviceEmail, privateKey);
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt
  });

  const resp = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`OAuth token failed (${resp.status}): ${msg}`);
  }

  const data = await resp.json();
  return data.access_token;
}

function normalizePath(path) {
  if (!path || typeof path !== 'string') return '/';
  const clean = path.trim() || '/';
  return clean.endsWith('/') && clean !== '/' ? clean.slice(0, -1) : clean;
}

async function fetchGa4PageStats(propertyId, accessToken) {
  const body = {
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    dimensions: [{ name: 'pagePath' }],
    metrics: [{ name: 'screenPageViews' }, { name: 'userEngagementDuration' }],
    orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
    limit: 10000
  };

  const resp = await fetch(`${GA4_URL}/properties/${propertyId}:runReport`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!resp.ok) {
    const msg = await resp.text();
    throw new Error(`GA4 report failed (${resp.status}): ${msg}`);
  }

  const data = await resp.json();
  const rows = Array.isArray(data.rows) ? data.rows : [];
  const pages = {};

  rows.forEach((row) => {
    const pagePath = normalizePath(row?.dimensionValues?.[0]?.value || '/');
    const views = Number(row?.metricValues?.[0]?.value || 0);
    const engagementSeconds = Number(row?.metricValues?.[1]?.value || 0);

    if (!pages[pagePath]) {
      pages[pagePath] = { views: 0, engagement_seconds: 0 };
    }
    pages[pagePath].views += views;
    pages[pagePath].engagement_seconds += Math.round(engagementSeconds);
  });

  return pages;
}

module.exports = async (req, res) => {
  try {
    const propertyId = process.env.GA4_PROPERTY_ID || '';
    const serviceEmail = process.env.GA4_CLIENT_EMAIL || '';
    const privateKeyRaw = process.env.GA4_PRIVATE_KEY || '';

    if (!propertyId || !serviceEmail || !privateKeyRaw) {
      return res.status(200).json({
        generated_at: new Date().toISOString(),
        source: 'ga4-live',
        warning: 'Missing GA4 env vars. Set GA4_PROPERTY_ID, GA4_CLIENT_EMAIL, GA4_PRIVATE_KEY.',
        pages: {}
      });
    }

    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');
    const token = await getAccessToken(serviceEmail, privateKey);
    const pages = await fetchGa4PageStats(propertyId, token);

    res.setHeader('Cache-Control', 's-maxage=900, stale-while-revalidate=3600');
    return res.status(200).json({
      generated_at: new Date().toISOString(),
      source: 'ga4-live',
      window_days: 30,
      pages
    });
  } catch (err) {
    return res.status(500).json({
      generated_at: new Date().toISOString(),
      source: 'ga4-live',
      error: String(err && err.message ? err.message : err),
      pages: {}
    });
  }
};
