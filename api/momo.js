// api/momo.js
import crypto from 'crypto';

// ===== ENV =====
const MOMO_ENV = process.env.MOMO_ENV || 'sandbox'; // sandbox now, later 'mtncameroon' (per portal)
const MOMO_BASE = process.env.MOMO_BASE || 'https://sandbox.momodeveloper.mtn.com';
const MOMO_SUB_KEY_COLLECTION = process.env.MOMO_SUB_KEY_COLLECTION || '';
const MOMO_API_USER_ID = process.env.MOMO_API_USER_ID || ''; // UUID from provisioning
const MOMO_API_KEY = process.env.MOMO_API_KEY || '';
const MOMO_CALLBACK_URL = process.env.MOMO_CALLBACK_URL || ''; // e.g. https://gamesdom.fun/api/payments/mtn/callback

function requireMomoEnv() {
    const missing = [];
    if (!MOMO_SUB_KEY_COLLECTION) missing.push('MOMO_SUB_KEY_COLLECTION');
    if (!MOMO_API_USER_ID) missing.push('MOMO_API_USER_ID');
    if (!MOMO_API_KEY) missing.push('MOMO_API_KEY');
    if (missing.length) throw new Error(`MoMo env missing: ${missing.join(', ')}`);
}

// ===== Token cache =====
const tokenCache = { token: null, exp: 0 };

async function momoAccessToken() {
    requireMomoEnv();
    const now = Date.now();
    if (tokenCache.token && now < tokenCache.exp - 30_000) return tokenCache.token;

    const basic = Buffer.from(`${MOMO_API_USER_ID}:${MOMO_API_KEY}`).toString('base64');
    const r = await fetch(`${MOMO_BASE}/collection/token/`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Ocp-Apim-Subscription-Key': MOMO_SUB_KEY_COLLECTION,
            'Content-Length': '0', // avoids 411 on APIM
        },
    });
    if (!r.ok) {
        throw new Error(`MoMo token failed: ${r.status} ${await r.text()}`);
    }
    const j = await r.json();
    tokenCache.token = j.access_token;
    tokenCache.exp = now + ((j.expires_in || 3600) * 1000);
    return tokenCache.token;
}

function momoAuthHeaders(token) {
    return {
        Authorization: `Bearer ${token}`,
        'Ocp-Apim-Subscription-Key': MOMO_SUB_KEY_COLLECTION,
        'X-Target-Environment': MOMO_ENV,
    };
}

/** RequestToPay (push prompt to payer’s phone) */
export async function momoRequestToPay({ amount, currency = 'XAF', msisdn, externalId, payerMessage = '', payeeNote = '' }) {
    const token = await momoAccessToken();
    const referenceId = crypto.randomUUID();
    const payload = {
        amount: String(amount),
        currency: String(currency),
        externalId: String(externalId || referenceId),
        payer: { partyIdType: 'MSISDN', partyId: String(msisdn) },
        payerMessage, payeeNote,
    };
    const r = await fetch(`${MOMO_BASE}/collection/v1_0/requesttopay`, {
        method: 'POST',
        headers: {
            ...momoAuthHeaders(token),
            'Content-Type': 'application/json',
            'X-Reference-Id': referenceId,
            ...(MOMO_CALLBACK_URL ? { 'X-Callback-Url': MOMO_CALLBACK_URL } : {}),
        },
        body: JSON.stringify(payload),
    });
    if (r.status !== 202) {
        throw new Error(`MoMo requestToPay failed: ${r.status} ${await r.text()}`);
    }
    return { referenceId };
}

/** Get status for RequestToPay */
export async function momoGetRtpStatus(referenceId) {
    const token = await momoAccessToken();
    const r = await fetch(`${MOMO_BASE}/collection/v1_0/requesttopay/${referenceId}`, {
        headers: momoAuthHeaders(token),
    });
    if (!r.ok) {
        throw new Error(`MoMo RTP status failed: ${r.status} ${await r.text()}`);
    }
    return r.json(); // { status, financialTransactionId, reason?, ... }
}

/** Create Invoice (payer completes with app/USSD using paymentReference) */
export async function momoCreateInvoice({ amount, currency = 'XAF', msisdn, externalId, description = '', validityDurationSec }) {
    const token = await momoAccessToken();
    const referenceId = crypto.randomUUID();
    const body = {
        externalId: String(externalId || referenceId),
        amount: String(amount),
        currency: String(currency),
        ...(msisdn ? { intendedPayer: { partyIdType: 'MSISDN', partyId: String(msisdn) } } : {}),
        ...(description ? { description } : {}),
        ...(validityDurationSec ? { validityDuration: String(validityDurationSec) } : {}),
    };
    const r = await fetch(`${MOMO_BASE}/collection/v2_0/invoice`, {
        method: 'POST',
        headers: {
            ...momoAuthHeaders(token),
            'Content-Type': 'application/json',
            'X-Reference-Id': referenceId,
            ...(MOMO_CALLBACK_URL ? { 'X-Callback-Url': MOMO_CALLBACK_URL } : {}),
        },
        body: JSON.stringify(body),
    });
    if (r.status !== 202) {
        throw new Error(`MoMo invoice create failed: ${r.status} ${await r.text()}`);
    }
    return { referenceId };
}

/** Get Invoice status/details (includes paymentReference when ready) */
export async function momoGetInvoice(referenceId) {
    const token = await momoAccessToken();
    const r = await fetch(`${MOMO_BASE}/collection/v2_0/invoice/${referenceId}`, {
        headers: momoAuthHeaders(token),
    });
    if (!r.ok) {
        throw new Error(`MoMo get invoice failed: ${r.status} ${await r.text()}`);
    }
    return r.json(); // { status, paymentReference, ... }
}
