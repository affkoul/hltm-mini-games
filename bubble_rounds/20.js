(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[20] = [
        [m, m, m, 0, i, g, 0, m, m, m, 0, c, f, 0, m, m, m],
        [m, m, 0, b, 0, c, 0, m, m, 0, g, 0, h, 0, m, m, _],
        [m, m, m, 0, e, 0, f, h, m, b, i, 0, k, 0, m, m, m],
        [m, m, 0, k, 0, 0, 0, k, e, 0, 0, 0, e, 0, m, m, _],
        [m, m, m, h, 0, 0, 0, 0, 0, 0, 0, 0, 0, b, m, m, m],
        [m, m, f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, i, m, m, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
