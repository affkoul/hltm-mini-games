(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[15] = [
        [m, m, m, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, m, m, m],
        [m, m, 0, 0, k, e, b, i, f, h, c, g, 0, 0, m, m, _],
        [m, m, m, k, e, 0, 0, 0, f, h, 0, 0, c, g, m, m, m],
        [m, m, 0, 0, k, e, b, i, f, h, c, g, 0, 0, m, m, _],
        [m, m, m, k, e, 0, 0, 0, f, h, 0, 0, c, g, m, m, m],
        [m, m, 0, 0, k, e, b, i, f, h, c, g, 0, 0, m, m, _],
        [m, m, m, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, m, m, m],
        [m, m, l, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, l, m, m, _],
        [m, m, m, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, m, m, m],
        [m, m, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, m, m, _],
        [m, m, m, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, m, m, m],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
