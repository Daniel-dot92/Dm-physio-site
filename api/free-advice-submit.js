const crypto = require('crypto');

const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const SHEETS_API_BASE = 'https://sheets.googleapis.com/v4/spreadsheets';
const SHEETS_SCOPE = 'https://www.googleapis.com/auth/spreadsheets';
const BG_TIMEZONE = 'Europe/Sofia';

const DEFAULT_SPREADSHEET_ID = '12BbJD7D1PCS5tcGSiihl22a8Nng8Hkvid2vcgRLnEA4';
const DEFAULT_SHEET_GID = 875094783;

const HEADER_ROW = [
  'submitted_at',
  'submitted_at_bg',
  'name',
  'phone',
  'email',
  'symptoms',
  'source_page',
  'ip',
  'user_agent'
];

function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function normalizePrivateKey(raw) {
  return String(raw || '').replace(/\\n/g, '\n').trim();
}

function signJwt(serviceEmail, privateKey, scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const payload = {
    iss: serviceEmail,
    sub: serviceEmail,
    aud: TOKEN_URL,
    scope,
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

async function getAccessToken(serviceEmail, privateKey, scope) {
  const jwt = signJwt(serviceEmail, privateKey, scope);
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

async function fetchJson(url, options, label) {
  const resp = await fetch(url, options);
  const text = await resp.text();
  let data = {};

  if (text) {
    try {
      data = JSON.parse(text);
    } catch (error) {
      data = { raw: text };
    }
  }

  if (!resp.ok) {
    throw new Error(`${label} failed (${resp.status}): ${typeof data === 'object' ? JSON.stringify(data) : String(data)}`);
  }

  return data;
}

function formatBgDateTime(date) {
  const value = date instanceof Date ? date : new Date(date);
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: BG_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).format(value).replace(',', '');
}

function quoteSheetName(sheetName) {
  return `'${String(sheetName || '').replace(/'/g, "''")}'`;
}

async function resolveSheetName(spreadsheetId, targetGid, token) {
  const url = `${SHEETS_API_BASE}/${spreadsheetId}?fields=sheets(properties(sheetId,title))`;
  const data = await fetchJson(url, { headers: { Authorization: `Bearer ${token}` } }, 'Read spreadsheet metadata');
  const sheets = Array.isArray(data.sheets) ? data.sheets : [];

  if (!sheets.length) {
    throw new Error('No sheets found in the target spreadsheet.');
  }

  const byGid = sheets.find((item) => Number(item?.properties?.sheetId) === Number(targetGid));
  if (byGid?.properties?.title) {
    return byGid.properties.title;
  }

  return sheets[0].properties.title;
}

async function ensureHeaderRow(spreadsheetId, sheetName, token) {
  const quoted = quoteSheetName(sheetName);
  const getRange = encodeURIComponent(`${quoted}!1:1`);
  const getUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/${getRange}`;
  const current = await fetchJson(getUrl, { headers: { Authorization: `Bearer ${token}` } }, 'Read header row');

  const existing = Array.isArray(current.values?.[0]) ? current.values[0].map((value) => String(value || '').trim()) : [];
  const hasAnyHeaderCell = existing.some(Boolean);
  if (hasAnyHeaderCell) {
    return;
  }

  const updateRange = encodeURIComponent(`${quoted}!A1:${String.fromCharCode(64 + HEADER_ROW.length)}1`);
  const updateUrl = `${SHEETS_API_BASE}/${spreadsheetId}/values/${updateRange}?valueInputOption=RAW`;

  await fetchJson(
    updateUrl,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ values: [HEADER_ROW] })
    },
    'Write header row'
  );
}

async function appendRow(spreadsheetId, sheetName, token, rowValues) {
  const quoted = quoteSheetName(sheetName);
  const range = encodeURIComponent(`${quoted}!A1`);
  const url = `${SHEETS_API_BASE}/${spreadsheetId}/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;

  return fetchJson(
    url,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        majorDimension: 'ROWS',
        values: [rowValues]
      })
    },
    'Append row'
  );
}

function readBody(req) {
  if (!req) return {};
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string' && req.body.trim()) {
    try {
      return JSON.parse(req.body);
    } catch (error) {
      return {};
    }
  }
  return {};
}

function normalizeString(value, max = 4000) {
  return String(value || '').trim().slice(0, max);
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

function getClientIp(req) {
  const forwarded = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  if (forwarded) return forwarded;
  return String(req.headers['x-real-ip'] || req.socket?.remoteAddress || '').trim();
}

module.exports = async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      ok: true,
      message: 'Free advice endpoint is active. Use POST JSON to submit.'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method not allowed.' });
  }

  try {
    const payload = readBody(req);

    const name = normalizeString(payload.name, 120);
    const phone = normalizeString(payload.phone, 40);
    const email = normalizeString(payload.email, 180);
    const symptoms = normalizeString(payload.symptoms, 5000);
    const website = normalizeString(payload.website, 255);
    const company = normalizeString(payload.company, 255);
    const sourcePage = normalizeString(payload.source_page || req.headers.referer || '', 1000);
    const submittedAt = normalizeString(payload.submitted_at, 40) || new Date().toISOString();

    if (website || company) {
      return res.status(200).json({ ok: true, skipped: true, reason: 'honeypot' });
    }

    if (!name || !phone || !email || !symptoms) {
      return res.status(400).json({ ok: false, error: 'Моля, попълнете име, телефон, имейл и описание.' });
    }

    if (!/^[+0-9\s()-]{7,20}$/.test(phone)) {
      return res.status(400).json({ ok: false, error: 'Невалиден телефонен номер.' });
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ ok: false, error: 'Невалиден имейл адрес.' });
    }

    const hasLink = /(https?:\/\/|www\.)/i.test(symptoms);
    if (hasLink) {
      return res.status(400).json({ ok: false, error: 'Моля, премахнете линковете от описанието.' });
    }

    const spreadsheetId = process.env.FREE_ADVICE_SPREADSHEET_ID || DEFAULT_SPREADSHEET_ID;
    const targetSheetGid = Number(process.env.FREE_ADVICE_SHEET_GID || DEFAULT_SHEET_GID);
    const serviceEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || process.env.GA4_CLIENT_EMAIL || '';
    const privateKey = normalizePrivateKey(process.env.GOOGLE_SHEETS_PRIVATE_KEY || process.env.GA4_PRIVATE_KEY || '');

    if (!serviceEmail || !privateKey) {
      return res.status(500).json({
        ok: false,
        error: 'Missing Google credentials. This endpoint checks GOOGLE_SHEETS_CLIENT_EMAIL/GOOGLE_SHEETS_PRIVATE_KEY first, then GA4_CLIENT_EMAIL/GA4_PRIVATE_KEY.'
      });
    }

    const token = await getAccessToken(serviceEmail, privateKey, SHEETS_SCOPE);
    const sheetName = await resolveSheetName(spreadsheetId, targetSheetGid, token);
    await ensureHeaderRow(spreadsheetId, sheetName, token);

    const now = new Date(submittedAt || new Date().toISOString());
    const row = [
      submittedAt || now.toISOString(),
      formatBgDateTime(now),
      name,
      phone,
      email,
      symptoms,
      sourcePage,
      getClientIp(req),
      normalizeString(req.headers['user-agent'] || '', 1000)
    ];

    const appendResult = await appendRow(spreadsheetId, sheetName, token, row);

    return res.status(200).json({
      ok: true,
      spreadsheet_id: spreadsheetId,
      sheet_name: sheetName,
      updated_range: appendResult?.updates?.updatedRange || ''
    });
  } catch (error) {
    const message = String(error && error.message ? error.message : error);
    const serviceEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL || process.env.GA4_CLIENT_EMAIL || '';
    const permissionHint = message.includes('PERMISSION_DENIED')
      ? ` Share the spreadsheet with service account: ${serviceEmail}`
      : '';

    return res.status(500).json({
      ok: false,
      error: `${message}${permissionHint}`
    });
  }
};
