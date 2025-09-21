(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[38] = [
        [m, f, f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, g, g, m],
        [m, f, k, b, e, h, i, c, c, g, f, k, b, e, g, m, _],
        [m, m, f, k, b, e, h, i, c, g, f, k, b, e, g, m, m],
        [m, m, 0, 0, f, k, b, e, h, i, c, g, 0, 0, m, m, _],
        [m, m, m, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, m, m, m],
        [m, m, m, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, m, m, m, _],
        [m, m, m, m, 0, 0, 0, 0, 0, 0, 0, 0, 0, m, m, m, m],
        [m, m, m, m, 0, 0, 0, 0, 0, 0, 0, 0, m, m, m, m, _],
        [m, m, m, m, m, 0, 0, 0, 0, 0, 0, 0, m, m, m, m, m],
        [m, m, m, m, m, 0, 0, 0, 0, 0, 0, m, m, m, m, m, _],
        [m, m, m, m, m, m, 0, 0, 0, 0, 0, m, m, m, m, m, m],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
