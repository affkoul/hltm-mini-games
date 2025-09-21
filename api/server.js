// server.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import twilio from 'twilio';
import {
  momoRequestToPay,
  momoGetRtpStatus,
  momoCreateInvoice,
  momoGetInvoice,
} from './momo.js';

// ===== Config (env overrides strongly recommended in prod) =====
// const MONGO = process.env.MONGO || '';
const MONGO = process.env.MONGO || 'mongodb://AdminBrainykids:69AdminBrainykids37@101.200.196.5:27017/brainykids';
const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';
const PORT = process.env.PORT || 5362;
const ORIGIN = process.env.CORS_ORIGIN || '*'; // e.g. "https://your.site"

// OTP config
const OTP_LEN = parseInt(process.env.OTP_LEN || '6', 10);
const OTP_TTL_MIN = parseInt(process.env.OTP_TTL_MIN || '10', 10);
const OTP_MAX_ATTEMPTS = parseInt(process.env.OTP_MAX_ATTEMPTS || '6', 10);
const OTP_RESEND_WINDOW_SEC = parseInt(process.env.OTP_RESEND_WINDOW_SEC || '40', 10);
const OTP_HASH_PEPPER = process.env.OTP_HASH_PEPPER || 'devpepper';

// Twilio config
const TWILIO_ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID || '';
const TWILIO_AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN || '';
const TWILIO_FROM = process.env.TWILIO_FROM || '';
const twilioClient = (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN)
  ? twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN)
  : null;

// Cameroon default country code helper (used for local 9-digit MSISDNs like 6XXXXXXXX)
const DEFAULT_CC = process.env.DEFAULT_CC || '+237';

// ===== DB connect =====
await mongoose.connect(MONGO);

// ===== App =====
const app = express();
app.set('trust proxy', 1);
app.use(['/api/payments/mtn/callback', '/api/payments/mtn/callback/:referenceId'],
  express.raw({ type: '*/*', limit: '256kb' })
);
app.use(helmet());
app.use(cors({ origin: ORIGIN, credentials: false }));
app.use(express.json({ limit: '1mb' }));

// Simple IP-based rate limits (tune per need)
const rlAuth = rateLimit({ windowMs: 10 * 60 * 1000, max: 60 });
const rlSync = rateLimit({ windowMs: 60 * 1000, max: 120 });
const rlDefault = rateLimit({ windowMs: 60 * 1000, max: 300 });
app.use(rlDefault);

// ===== Schemas =====
const UserSchema = new mongoose.Schema({
  phone: { type: String, index: true, sparse: true },
  guestId: { type: String, index: true, sparse: true },
  points: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  streak: { type: Number, default: 0 },
  lastSeen: { type: Date, index: true }
}, { timestamps: true });

const EventSchema = new mongoose.Schema({
  userId: { type: String, index: true },   // may be guestId or Mongo _id (string)
  payload: Object,
  createdAt: { type: Date, default: Date.now, index: true }
}, { versionKey: false });

const TicketSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  partnerId: String,
  label: String,
  code: { type: String, unique: true, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  used: { type: Boolean, default: false, index: true }
}, { versionKey: false });

const PaymentSchema = new mongoose.Schema({
  userId: { type: String, index: true },
  provider: String,
  msisdn: String,
  amount: Number,
  status: { type: String, default: 'pending', index: true }, // pending|success|failed
  ref: { type: String, unique: true, index: true },
  instructions: String,
  createdAt: { type: Date, default: Date.now, index: true },
  raw: Object,
  webhooks: { type: [Object], default: [] }
}, { versionKey: false });

const OtpSchema = new mongoose.Schema({
  phone: { type: String, index: true },
  codeHash: String,
  purpose: { type: String, default: 'login' },
  attempts: { type: Number, default: 0 },
  used: { type: Boolean, default: false },
  sentAt: { type: Date, default: Date.now, index: true },
  expiresAt: { type: Date }
}, { versionKey: false });
OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-clean

const User = mongoose.model('User', UserSchema);
const Event = mongoose.model('Event', EventSchema);
const Ticket = mongoose.model('Ticket', TicketSchema);
const Payment = mongoose.model('Payment', PaymentSchema);
const Otp = mongoose.model('Otp', OtpSchema);

// ===== Helpers =====
const sha256 = (s) => crypto.createHash('sha256').update(String(s)).digest('hex');
const sign = (user) => jwt.sign({ id: user._id.toString(), phone: user.phone || null }, JWT_SECRET, { expiresIn: '30d' });

function auth(req, _res, next) {
  const a = req.headers.authorization || '';
  const tok = a.startsWith('Bearer ') ? a.slice(7) : null;
  if (tok) {
    try { req.auth = jwt.verify(tok, JWT_SECRET); } catch { /* ignore */ }
  }
  next();
}
app.use(auth);

function requireAuth(req, res, next) {
  if (!req.auth?.id) return res.status(401).json({ ok: false, error: 'unauthorized' });
  next();
}

// Basic phone normalizer.
// Accepts: +E.164, 2376XXXXXXXX, or local 9-digit 6XXXXXXXX (Cameroon).
function sanitizePhone(p) {
  const raw = (p ?? '').toString().trim();
  if (!raw) return null;
  let s = raw.replace(/[^\d+]/g, '');

  // already E.164
  if (s.startsWith('+')) return s;

  // e.g. 2376XXXXXXXX -> +2376XXXXXXXX
  if (/^2376\d{8}$/.test(s)) return '+' + s;

  // local Cameroon 9-digit starting with 6 -> +2376XXXXXXXX
  if (/^6\d{8}$/.test(s)) return (DEFAULT_CC || '+237') + s;

  // plain digits: best effort with DEFAULT_CC (avoid double-adding 237)
  if (/^\d{5,15}$/.test(s)) {
    if (DEFAULT_CC && !s.startsWith(DEFAULT_CC.replace('+', ''))) return (DEFAULT_CC + s);
    return '+' + s;
  }
  return null;
}

function nextLevelNeed(level) { return 200 * level; }
function recalcLevel(points) {
  let lvl = 1;
  while (points >= nextLevelNeed(lvl)) lvl++;
  return lvl;
}

// ===== OTP (Twilio SMS) =====
function randomOtp(len = OTP_LEN) {
  const min = 10 ** (len - 1);
  const max = 10 ** len - 1;
  return String(Math.floor(min + Math.random() * (max - min)));
}

async function sendOtpSMS(phone, code) {
  if (!twilioClient || !TWILIO_FROM) throw new Error('sms-not-configured');
  const body = `Your verification code is ${code}. It expires in ${OTP_TTL_MIN} min.`;
  // Twilio requires E.164; sanitizePhone already aims for it.
  const msg = await twilioClient.messages.create({ body, from: TWILIO_FROM, to: phone });
  return !!msg?.sid;
}

// request-otp
app.post('/api/login/request-otp', rlAuth, async (req, res) => {
  try {
    const phone = sanitizePhone(req.body?.phone);
    if (!phone) return res.status(400).json({ ok: false, error: 'bad-phone' });

    // Throttle resend per phone
    const recent = await Otp.findOne({ phone, used: false }).sort({ sentAt: -1 });
    if (recent && (Date.now() - recent.sentAt.getTime()) < OTP_RESEND_WINDOW_SEC * 1000) {
      const cooldown = OTP_RESEND_WINDOW_SEC - Math.floor((Date.now() - recent.sentAt.getTime()) / 1000);
      return res.json({ ok: true, cooldown });
    }

    const code = randomOtp();
    const codeHash = sha256(`${code}:${phone}:${OTP_HASH_PEPPER}`);
    const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

    await Otp.create({ phone, codeHash, expiresAt, sentAt: new Date() });
    await sendOtpSMS(phone, code);

    // For debugging only (never log codes in prod)
    if (process.env.LOG_OTP === '1') console.log(`[OTP] sent to ${phone}: ${code}`);

    res.json({ ok: true, ttlMin: OTP_TTL_MIN });
  } catch (e) {
    console.error('request-otp error', e?.message || e);
    // Common Twilio trial gotchas: geo permission, unverified recipient, etc.
    res.status(500).json({ ok: false, error: 'otp-send-failed' });
  }
});

// verify-otp
app.post('/api/login/verify-otp', rlAuth, async (req, res) => {
  try {
    const phone = sanitizePhone(req.body?.phone);
    const otp = String(req.body?.otp || '');
    const guestId = req.body?.guestId || null;
    if (!phone || !/^\d{4,}$/.test(otp)) return res.status(400).json({ ok: false, error: 'bad-otp' });

    const row = await Otp.findOne({ phone, used: false }).sort({ sentAt: -1 });
    if (!row) return res.status(400).json({ ok: false, error: 'no-otp' });
    if (row.expiresAt < new Date()) return res.status(400).json({ ok: false, error: 'expired' });
    if (row.attempts >= OTP_MAX_ATTEMPTS) return res.status(429).json({ ok: false, error: 'too-many-attempts' });

    const ok = (row.codeHash === sha256(`${otp}:${phone}:${OTP_HASH_PEPPER}`));
    row.attempts += 1;
    if (ok) row.used = true;
    await row.save();

    if (!ok) return res.status(400).json({ ok: false, error: 'bad-otp' });

    // Upsert user
    let user = await User.findOne({ phone });
    if (!user) user = await User.create({ phone, lastSeen: new Date() });

    // Optional: migrate guest events to this user
    if (guestId) {
      await Event.updateMany({ userId: guestId }, { $set: { userId: user._id.toString() } });
      await User.updateMany({ guestId }, { $unset: { guestId: 1 } });
    }
    const token = sign(user);
    res.json({ ok: true, user: { id: user._id.toString(), phone: user.phone, token } });
  } catch (e) {
    console.error('verify-otp error', e);
    res.status(500).json({ ok: false });
  }
});

// ===== Sync endpoint (ingest queued offline events) =====
app.post('/api/sync', rlSync, async (req, res) => {
  const { user, events } = req.body || {};
  try {
    let dbUser = null;

    // Resolve user preference: token > phone > guestId
    if (user?.token) {
      try {
        const { id } = jwt.verify(user.token, JWT_SECRET);
        dbUser = await User.findById(id);
      } catch (_) { /* ignore bad token */ }
    }
    if (!dbUser && user?.phone) dbUser = await User.findOne({ phone: sanitizePhone(user.phone) });
    if (!dbUser && user?.id?.startsWith('guest-')) {
      dbUser = await User.findOne({ guestId: user.id }) || await User.create({ guestId: user.id, lastSeen: new Date() });
    }
    if (!dbUser) dbUser = await User.create({ guestId: user?.id || ('guest-' + Date.now()), lastSeen: new Date() });

    let deltaPoints = 0;
    let maxStreak = dbUser.streak || 0;

    for (const e of (events || [])) {
      await Event.create({ userId: dbUser._id.toString(), payload: e });

      if (e.type === 'points' && typeof e.delta === 'number') {
        deltaPoints += e.delta;
      }
      if (e.type === 'streak' && typeof e.value === 'number') {
        maxStreak = Math.max(maxStreak, e.value);
      }
      if (e.type === 'ticket-issue' && e.ticket?.code) {
        // idempotent ticket write
        const t = e.ticket;
        await Ticket.updateOne(
          { code: t.code },
          { $setOnInsert: { userId: dbUser._id.toString(), partnerId: t.partnerId, label: t.label, code: t.code, createdAt: new Date(), used: false } },
          { upsert: true }
        );
      }
      if (e.type === 'pay' && e.intent) {
        const { provider, msisdn, amount, id, at } = e.intent;
        const ref = 'PAY-' + (id || Date.now());
        await Payment.updateOne(
          { ref },
          { $setOnInsert: { userId: dbUser._id.toString(), provider, msisdn, amount, status: 'pending', ref, createdAt: new Date(at || Date.now()) } },
          { upsert: true }
        );
      }
    }

    if (deltaPoints !== 0) {
      dbUser.points = Math.max(0, (dbUser.points || 0) + deltaPoints);
      dbUser.level = recalcLevel(dbUser.points);
    }
    dbUser.streak = maxStreak;
    dbUser.lastSeen = new Date();
    await dbUser.save();

    res.json({ ok: true, points: dbUser.points, level: dbUser.level, streak: dbUser.streak });
  } catch (err) {
    console.error('sync error', err);
    res.status(500).json({ ok: false });
  }
});

// ===== Server-side roulette (optional) =====
const ROULETTE_BAG = [
  { t: 'points', v: 1, w: 30 },
  { t: 'points', v: 1, w: 20 },
  { t: 'points', v: 1, w: 8 },
  { t: 'ticket', partner: 'MOVIE', name: 'Movie Ticket', w: 5 },
  { t: 'ticket', partner: 'SUPER', name: 'Supermarket Voucher', w: 5 },
  { t: 'points', v: 1, w: 3 },
  { t: 'nothing', w: 29 }
];

function pickWeighted(bag) {
  const total = bag.reduce((a, b) => a + b.w, 0);
  let r = Math.random() * total;
  for (const it of bag) { r -= it.w; if (r <= 0) return it; }
  return bag[bag.length - 1];
}
function dayKey(d = new Date()) { return d.toISOString().slice(0, 10); }

app.post('/api/roulette/spin', requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.id);
    if (!user) return res.status(401).json({ ok: false, error: 'unauthorized' });

    const already = await Event.findOne({ userId: user._id.toString(), 'payload.type': 'roulette', 'payload.day': dayKey() });
    if (already) return res.json({ ok: false, error: 'already-spun' });

    const picked = pickWeighted(ROULETTE_BAG);
    let prizeStr = 'Try again tomorrow!';

    if (picked.t === 'points') {
      user.points = Math.max(0, (user.points || 0) + picked.v);
      user.level = recalcLevel(user.points);
      prizeStr = `+${picked.v} pts`;
      await user.save();
    } else if (picked.t === 'ticket') {
      const code = `TKT-${picked.partner}-${Date.now().toString(36)}-${crypto.randomBytes(2).toString('hex')}`.toUpperCase();
      await Ticket.create({ userId: user._id.toString(), partnerId: picked.partner, label: picked.name, code });
      prizeStr = `🎟 ${picked.name}`;
    }

    await Event.create({ userId: user._id.toString(), payload: { type: 'roulette', day: dayKey(), prize: prizeStr }, createdAt: new Date() });
    res.json({ ok: true, prize: prizeStr });
  } catch (e) {
    console.error('roulette error', e);
    res.status(500).json({ ok: false });
  }
});

// ===== Mobile Money =====
app.post('/api/payments/mtn/initiate', rlAuth, async (req, res) => {
  try {
    let { provider, msisdn, amount, currency = process.env.MOMO_CURRENCY || 'XAF', description } = req.body || {};
    provider = provider || 'MTN_MOMO';

    const ref = 'PAY-' + Date.now();
    const userId = req.auth?.id || null;

    if (provider === 'MTN_MOMO') {
      // Option A: push to phone via RequestToPay (recommended “confirm to pay” UX)
      const { referenceId } = await momoRequestToPay({
        amount, currency, msisdn, externalId: ref,
        payerMessage: description || `Payment ${amount} ${currency}`,
        payeeNote: 'GamesDom',
      });

      await Payment.create({
        userId, provider, msisdn, amount, status: 'pending', ref,
        instructions: 'Check your phone and approve the MTN MoMo request.',
        raw: { referenceId, flow: 'rtp' },
      });

      return res.json({
        ok: true, status: 'pending', ref, referenceId,
        instructions: 'Approve the MoMo prompt on your phone.',
      });
    }

    // (Optional) If you want to allow “pay later” via Invoice instead, switch to:
    // const { referenceId } = await momoCreateInvoice({ amount, currency, msisdn, externalId: ref, description });
    // await Payment.create({ ... , raw: { referenceId, flow: 'invoice' } });
    // const inv = await momoGetInvoice(referenceId).catch(()=>null);
    // return res.json({ ok: true, status: 'pending', ref, referenceId, paymentReference: inv?.paymentReference ?? null });

    // Fallback
    await Payment.create({ userId, provider, msisdn, amount, status: 'pending', ref, instructions: 'Follow the payment prompt.' });
    return res.json({ ok: true, status: 'pending', ref });

  } catch (e) {
    console.error('initiate payment error', e);
    res.status(500).json({ ok: false, error: 'init-failed' });
  }
});

// (Optional) Poll RTP status from frontend
app.get('/api/payments/mtn/rtp/:referenceId', async (req, res) => {
  try {
    const data = await momoGetRtpStatus(req.params.referenceId);
    res.json({ ok: true, status: data?.status, detail: data });
  } catch (e) {
    console.error('rtp status error', e);
    res.status(500).json({ ok: false, error: 'momo-query-failed' });
  }
});

// (Optional) Poll Invoice details from frontend
app.get('/api/payments/mtn/invoice/:referenceId', async (req, res) => {
  try {
    const data = await momoGetInvoice(req.params.referenceId);
    res.json({ ok: true, invoice: data });
  } catch (e) {
    console.error('get invoice error', e);
    res.status(500).json({ ok: false, error: 'momo-query-failed' });
  }
});

const momoCallback = async (req, res) => {
  try {
    const cbRefId = req.params.referenceId || null;

    let payload = null;
    if (Buffer.isBuffer(req.body)) {
      const txt = req.body.toString('utf8').trim();
      try { payload = JSON.parse(txt); } catch { payload = txt || null; }
    } else {
      payload = req.body ?? null;
    }

    console.log('MoMo callback hit:', { cbRefId, headers: req.headers, payload });

    // OPTIONAL: update your Payment here if you can map it.
    // Preferred ways to map:
    // 1) payload.externalId  === your Payment.ref (we set externalId=ref when initiating)
    // 2) payload.referenceId === MoMo reference; also stored in Payment.raw.referenceId
    // 3) URL cbRefId         === MoMo reference; sometimes appended by MTN

    // Example mapper (best-effort; adjust shape to your payload):
    const ref = payload?.externalId || null;          // your app ref
    const rtpId = payload?.referenceId || cbRefId || null; // MoMo referenceId
    const status = (payload?.status || '').toLowerCase();

    if (ref) {
      const newStatus = /success/.test(status) || status === 'successful' ? 'success'
        : /fail|reject|cancel/.test(status) || status === 'failed' ? 'failed'
          : 'pending';

      const doc = await Payment.findOneAndUpdate(
        { ref },
        { $set: { status: newStatus }, $push: { webhooks: { at: new Date(), payload, cbRefId: rtpId } } },
        { new: true }
      );

      // Optional reward logic (same as your webhook)
      if (doc && newStatus === 'success' && doc.userId) {
        const u = await User.findById(doc.userId);
        if (u) {
          const add = Math.max(0, Math.floor(doc.amount || 0));
          u.points += add;
          u.level = recalcLevel(u.points);
          await u.save();
          await Event.create({ userId: u._id.toString(), payload: { type: 'points', delta: add, reason: 'payment' } });
        }
      }
    }

    // MoMo is happy with 200 (or 204)
    res.sendStatus(200);
  } catch (e) {
    console.error('momo callback error', e);
    res.sendStatus(500);
  }
};

app.put('/api/payments/mtn/callback', momoCallback);
app.post('/api/payments/mtn/callback', momoCallback);
app.put('/api/payments/mtn/callback/:referenceId', momoCallback);
app.post('/api/payments/mtn/callback/:referenceId', momoCallback);

// ===== Me, tickets, leaderboard =====
app.get('/api/me', requireAuth, async (req, res) => {
  const u = await User.findById(req.auth.id).lean();
  if (!u) return res.status(401).json({ ok: false, error: 'unauthorized' });
  res.json({
    ok: true,
    user: { id: u._id.toString(), phone: u.phone, points: u.points, level: u.level, streak: u.streak, lastSeen: u.lastSeen }
  });
});

app.get('/api/tickets', requireAuth, async (req, res) => {
  const rows = await Ticket.find({ userId: req.auth.id }).sort({ createdAt: -1 }).lean();
  res.json({ ok: true, tickets: rows });
});

app.get('/api/leaderboard', async (_req, res) => {
  const limit = 20;
  const rows = await User.find({ phone: { $ne: null } })
    .sort({ points: -1, updatedAt: -1 })
    .limit(limit)
    .select({ phone: 1, points: 1, level: 1 })
    .lean();
  res.json({ ok: true, top: rows.map(r => ({ phone: r.phone, points: r.points, level: r.level })) });
});

app.get('/api/payments', requireAuth, async (req, res) => {
  try {
    const rows = await Payment.find({ userId: req.auth.id })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({
      ok: true,
      payments: rows.map(r => ({
        provider: r.provider,
        amount: r.amount,
        status: r.status,
        ref: r.ref,
        at: r.createdAt
      }))
    });
  } catch (e) {
    console.error('list payments error', e);
    res.status(500).json({ ok: false });
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, now: new Date().toISOString() }));

// ===== Start =====
app.listen(PORT, () => console.log(`API listening on :${PORT}`));
