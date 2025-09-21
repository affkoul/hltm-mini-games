
// ====== Gamesdom Platform SDK (local-first, sync-later) ======
(function (global) {
    // const API_BASE = 'http://localhost:PORT/api' || 'https://domain.YY/api';
    const API_BASE = 'https://gamesdom.fun/api';
    const LS = {
        user: 'gd.user',
        points: 'gd.points',
        level: 'gd.level',
        streak: 'gd.streak',
        streakDate: 'gd.streak.date',
        queue: 'gd.syncQueue',
        tickets: 'gd.tickets',
        payments: 'gd.payments'
    };

    // ---------- tiny utils ----------
    function uuid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8); return v.toString(16);
        });
    }
    function todayKey() {
        const d = new Date(); return d.toISOString().slice(0, 10);
    }
    function load(k, def) { try { return JSON.parse(localStorage.getItem(k)) ?? def; } catch { return def; } }
    function save(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
    function online() { return navigator.onLine; }

    // ---------- local-first state ----------
    const state = {
        user: load(LS.user, { id: 'guest-' + uuid(), phone: null, token: null }),
        points: load(LS.points, 0),
        level: load(LS.level, 1),
        streak: load(LS.streak, 0),
        streakDate: load(LS.streakDate, null),
        queue: load(LS.queue, []),
        tickets: load(LS.tickets, []),
        payments: load(LS.payments, []),
        activeSession: null // { gameId, startTs }
    };

    function persistAll() {
        save(LS.user, state.user);
        save(LS.points, state.points);
        save(LS.level, state.level);
        save(LS.streak, state.streak);
        save(LS.streakDate, state.streakDate);
        save(LS.queue, state.queue);
        save(LS.tickets, state.tickets);
        save(LS.payments, state.payments);
    }

    function authHeader() {
        return state.user?.token ? { Authorization: 'Bearer ' + state.user.token } : {};
    }
    async function get(url) {
        const r = await fetch(API_BASE + url, { headers: authHeader() });
        const ct = r.headers.get('content-type') || '';
        return ct.includes('application/json') ? r.json() : r.text();
    }

    // ---------- Levels & points ----------
    // Simple curve: next level at 200 * level points.
    function addPoints(n, reason = '') {
        state.points = Math.max(0, state.points + n);
        while (state.points >= needForNext(state.level)) state.level++;
        enqueue({ type: 'points', delta: n, reason, at: Date.now() });
        persistAll();
        emit('gd:points', { points: state.points, level: state.level, delta: n, reason });
    }
    function needForNext(level) { return 200 * level; }

    // ---------- Daily login streak ----------
    function bumpDailyLogin() {
        const t = todayKey();
        if (state.streakDate === t) return; // already counted today
        const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
        state.streak = (state.streakDate === yesterday) ? state.streak + 1 : 1;
        state.streakDate = t;
        // daily bonus (small)
        addPoints(1, 'daily-login');
        enqueue({ type: 'streak', value: state.streak, at: Date.now() });
        persistAll();
        emit('gd:streak', { streak: state.streak });
    }

    // ---------- Game playtime ----------
    function startGame(gameId) {
        endGame(); // close previous if any
        state.activeSession = { gameId, startTs: Date.now() };
        emit('gd:game-start', { gameId });
    }
    function endGame() {
        const s = state.activeSession;
        if (!s) return;
        const ms = Date.now() - s.startTs;
        state.activeSession = null;
        // Reward ~1 point / 15s (tuned for slow phones)
        const pts = Math.floor(ms / 15000);
        if (pts > 0) addPoints(pts, `playtime:${s.gameId}`);
        enqueue({ type: 'playtime', gameId: s.gameId, ms, at: Date.now() });
        persistAll();
        emit('gd:game-end', { gameId: s.gameId, ms, pts });
    }
    window.addEventListener('beforeunload', endGame);

    // If we already have a token, hydrate from server on load
    (async function bootHydrate() {
        if (!state.user?.token || !online()) return;
        try {
            const me = await get('/me');
            if (me?.ok && me.user) {
                state.points = me.user.points ?? state.points;
                state.level = me.user.level ?? state.level;
                state.streak = me.user.streak ?? state.streak;
                persistAll();
                emit('gd:points', { points: state.points, level: state.level });
                emit('gd:streak', { streak: state.streak });
            }
        } catch { }
        refreshTickets().catch(() => { });
        refreshPayments().catch(() => { });
    })();

    async function refreshTickets() {
        if (!online() || !state.user?.token) return state.tickets;
        try {
            const r = await get('/tickets');
            if (r?.ok && Array.isArray(r.tickets)) {
                state.tickets = r.tickets;
                persistAll();
                emit('gd:tickets', { tickets: state.tickets });
            }
        } catch { }
        return state.tickets;
    }

    async function refreshPayments() {
        if (!online() || !state.user?.token) return state.payments;
        try {
            const r = await get('/payments');
            if (r?.ok && Array.isArray(r.payments)) {
                state.payments = r.payments;
                persistAll();
                emit('gd:payments', { payments: state.payments });
            }
        } catch { }
        return state.payments;
    }

    // ---------- Roulette (1 free spin / day) ----------
    const rouletteKey = 'gd.roulette.'; // + today
    function canSpinToday() { return !localStorage.getItem(rouletteKey + todayKey()); }
    async function spinRoulette() {
        // If logged-in and online, use server (enforces once/day)
        if (online() && state.user?.token) {
            try {
                const res = await post('/roulette/spin', {}); // Authorization header is added by post()
                if (res?.ok) {
                    localStorage.setItem(rouletteKey + todayKey(), '1');

                    // refresh points/level (and possible ticket)
                    try {
                        const me = await get('/me');
                        if (me?.ok && me.user) {
                            state.points = me.user.points ?? state.points;
                            state.level = me.user.level ?? state.level;
                            state.streak = me.user.streak ?? state.streak;
                            persistAll();
                            emit('gd:points', { points: state.points, level: state.level });
                        }
                    } catch { }
                    refreshTickets().catch(() => { });

                    return { ok: true, prize: res.prize };
                }
                if (res?.error === 'already-spun') {
                    localStorage.setItem(rouletteKey + todayKey(), '1');
                    return { ok: false, reason: 'already-spun' };
                }
            } catch (_) { }
        }
        if (!canSpinToday()) return { ok: false, reason: 'already-spun' };
        // weights: small prize, points, sometimes ticket
        const bag = [
            { t: 'points', v: 1, w: 30 },
            { t: 'points', v: 1, w: 20 },
            { t: 'points', v: 1, w: 8 },
            { t: 'ticket', partner: 'MOVIE', name: 'Movie Ticket', w: 5 },
            { t: 'ticket', partner: 'SUPER', name: 'Supermarket Voucher', w: 5 },
            { t: 'points', v: 1, w: 3 },
            { t: 'nothing', w: 29 }
        ];
        const total = bag.reduce((a, b) => a + b.w, 0);
        let r = Math.random() * total, picked = bag[bag.length - 1];
        for (const it of bag) { r -= it.w; if (r <= 0) { picked = it; break; } }
        localStorage.setItem(rouletteKey + todayKey(), '1');

        if (picked.t === 'points') {
            addPoints(picked.v, 'roulette');
            return { ok: true, prize: `+${picked.v} pts` };
        } else if (picked.t === 'ticket') {
            const t = issueTicket(picked.partner, picked.name);
            return { ok: true, prize: `🎟 ${picked.name}`, ticket: t };
        } else {
            return { ok: true, prize: 'Try again tomorrow!' };
        }
    }

    // ---------- Tickets (Code 39 barcode canvas) ----------
    function issueTicket(partnerId, label) {
        const code = (`TKT-${partnerId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`).toUpperCase();
        const t = { id: uuid(), partnerId, label, code, createdAt: Date.now(), used: false };
        state.tickets.unshift(t);
        enqueue({ type: 'ticket-issue', ticket: t, at: Date.now() });
        persistAll();
        emit('gd:tickets', { tickets: state.tickets });
        return t;
    }

    // Code39 patterns (A–Z 0–9 - . space $ / + %)
    const CODE39 = {
        '0': 'nnnwwnwnw', '1': 'wnnwnnnnw', '2': 'nnwwnnnnw', '3': 'wnwwnnnnn', '4': 'nnnwwnnnw',
        '5': 'wnnwwnnnn', '6': 'nnwwwnnnn', '7': 'nnnwnnwnw', '8': 'wnnwnnwnn', '9': 'nnwwnnwnn',
        'A': 'wnnnnwnnw', 'B': 'nnwnnwnnw', 'C': 'wnwnnwnnn', 'D': 'nnnnwwnnw', 'E': 'wnnnwwnnn',
        'F': 'nnwnwwnnn', 'G': 'nnnnnwwnw', 'H': 'wnnnnwwnn', 'I': 'nnwnnwwnn', 'J': 'nnnnwwwnn',
        'K': 'wnnnnnnww', 'L': 'nnwnnnnww', 'M': 'wnwnnnnwn', 'N': 'nnnnwnnww', 'O': 'wnnnwnnwn',
        'P': 'nnwnwnnwn', 'Q': 'nnnnnnwww', 'R': 'wnnnnnwwn', 'S': 'nnwnnnwwn', 'T': 'nnnnwnwwn',
        'U': 'wwnnnnnnw', 'V': 'nwwnnnnnw', 'W': 'wwwnnnnnn', 'X': 'nwnnwnnnw', 'Y': 'wwnnwnnnn',
        'Z': 'nwwnwnnnn', '-': 'nwnnnnwnw', '.': 'wwnnnnwnn', ' ': 'nwwnnnwnn', '$': 'nwnwnwnnn',
        '/': 'nwnwnnnwn', '+': 'nwnnnwnwn', '%': 'nnnwnwnwn', '*': 'nwnnwnwnn' // start/stop
    };
    function renderCode39(text, canvas, opts = {}) {
        // Prepare
        const ctx = canvas.getContext('2d');
        const s = ('*' + String(text).toUpperCase().replace(/[^0-9A-Z\-\.\ \$\/\+\%]/g, '') + '*');
        const narrow = opts.narrow || 2, wide = opts.wide || 4, height = opts.height || 80, quiet = opts.quiet || 10;

        // compute width
        let w = quiet * 2;
        for (let i = 0; i < s.length; i++) {
            const pat = CODE39[s[i]]; if (!pat) continue;
            for (let j = 0; j < pat.length; j++) w += (pat[j] === 'n' ? narrow : wide);
            // inter-char narrow space
            if (i < s.length - 1) w += narrow;
        }
        canvas.width = Math.max(200, w);
        canvas.height = height + 24;

        // draw
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#000';
        let x = quiet;
        for (let i = 0; i < s.length; i++) {
            const pat = CODE39[s[i]]; if (!pat) continue;
            for (let j = 0; j < 9; j++) {
                const ww = (pat[j] === 'n' ? narrow : wide);
                if (j % 2 === 0) ctx.fillRect(x, 6, ww, height); // bars only (even positions)
                x += ww;
            }
            x += narrow; // inter-char space
        }
        // label
        ctx.fillStyle = '#111'; ctx.font = '14px system-ui, Arial';
        ctx.textAlign = 'center'; ctx.fillText(text, canvas.width / 2, height + 20);
    }

    // ---------- Phone login (OTP) ----------
    async function requestOtp(phone) {
        // queue for offline, but try live
        enqueue({ type: 'request-otp', phone, at: Date.now() });
        if (online()) {
            try {
                return await post('/login/request-otp', { phone });
            } catch (_) { /* offline fallback below */ }
        }
        return { ok: true }; // optimistic
    }
    async function verifyOtp(phone, otp) {
        enqueue({ type: 'verify-otp', phone, otp, at: Date.now() });
        if (online()) {
            try {
                const body = { phone, otp };
                // send guestId so server migrates queued events on future sync
                if (state.user?.id?.startsWith('guest-')) body.guestId = state.user.id;

                const res = await post('/login/verify-otp', body);
                if (res?.ok && res.user?.token) {
                    // store server identity
                    state.user = { id: res.user.id, phone: res.user.phone, token: res.user.token };
                    persistAll();

                    // hydrate stats from server
                    try {
                        const me = await get('/me');
                        if (me?.ok && me.user) {
                            state.points = me.user.points ?? state.points;
                            state.level = me.user.level ?? state.level;
                            state.streak = me.user.streak ?? state.streak;
                            persistAll();
                            emit('gd:points', { points: state.points, level: state.level });
                            emit('gd:streak', { streak: state.streak });
                        }
                    } catch { }

                    // pull tickets & payments
                    await Promise.allSettled([refreshTickets(), refreshPayments()]);

                    emit('gd:login', { user: state.user });
                    // flush any queued events now that we’re authenticated
                    flush();
                    return { ok: true };
                }
                return { ok: false, error: res?.error || 'verify-failed' };
            } catch (_) { }
        }
        // offline optimistic bind (no token yet)
        state.user.phone = phone; state.user.token = null; persistAll();
        emit('gd:login', { user: state.user, offline: true });
        return { ok: true, offline: true };
    }

    // ---------- Mobile Money (pay intent, MTN payment initiate + light RTP polling) ----------
    async function pay(amount, provider, msisdn) {
        const intent = { id: uuid(), amount, provider, msisdn, status: 'pending', at: Date.now() };
        state.payments.unshift(intent);
        enqueue({ type: 'pay', intent, at: Date.now() });
        persistAll();
        emit('gd:payment', { intent });

        // Only MTN has a live endpoint right now; others will sync via /api/sync
        const prov = (provider === 'MTN' ? 'MTN_MOMO' : provider);
        if (online() && prov === 'MTN_MOMO') {
            try {
                const r = await post('/payments/mtn/initiate', {
                    provider: 'MTN_MOMO', msisdn, amount: String(amount), currency: 'XAF', description: 'Gamesdom top-up'
                });
                // Update local row
                intent.status = r?.status || 'pending';
                intent.ref = r?.ref;
                intent.instructions = r?.instructions || 'Approve the MTN MoMo prompt on your phone.';
                persistAll();
                emit('gd:payment', { intent });

                // Optional: poll RTP status briefly, then refresh server-side list
                if (r?.referenceId) {
                    const start = Date.now();
                    const poll = async () => {
                        if (!online() || Date.now() - start > 120000) return; // 2 min max
                        try { await get(`/payments/mtn/rtp/${r.referenceId}`); } catch { }
                        try { await refreshPayments(); } catch { }
                        const row = getPayments().find(p => p.ref === r.ref);
                        if (!row || row.status === 'pending') setTimeout(poll, 4000);
                    };
                    setTimeout(poll, 4000);
                }
            } catch (_) { /* leave as pending */ }
        }
        return intent;
    }

    // ---------- Sync queue ----------
    function enqueue(evt) { state.queue.push(evt); save(LS.queue, state.queue); }
    async function flush() {
        if (!online() || !state.queue.length) return;
        const payload = { events: state.queue, user: state.user };
        try {
            const res = await post('/api/sync', payload);
            if (res?.ok) { state.queue = []; save(LS.queue, state.queue); }
        } catch { }
    }
    setInterval(flush, 15000);
    window.addEventListener('online', flush);

    // ---------- HTTP helper ----------
    async function post(url, body) {
        const r = await fetch(API_BASE + url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', ...authHeader() },
            body: JSON.stringify(body)
        });
        return r.json();
    }

    // ---------- tiny event bus ----------
    function emit(name, detail) { document.dispatchEvent(new CustomEvent(name, { detail })); }

    // ---------- expose ----------
    const API = {
        // identity
        getUser: () => state.user,
        requestOtp, verifyOtp,
        // economy
        addPoints, needForNext, bumpDailyLogin,
        // playtime
        startGame, endGame,
        // roulette & tickets
        canSpinToday, spinRoulette, issueTicket, renderCode39,
        // payments
        pay, refreshTickets, refreshPayments,
        // sync
        flush,
        // state
        getPoints: () => state.points,
        getLevel: () => state.level,
        getStreak: () => state.streak,
        getTickets: () => state.tickets,
        getPayments: () => state.payments,
    };
    global.PlatformSDK = API;

    // boot daily streak on page open
    bumpDailyLogin();
})(window);
