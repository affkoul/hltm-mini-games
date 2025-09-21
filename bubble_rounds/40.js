(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[40] = [
        [m, k, k, k, k, k, k, k, m, k, k, k, k, k, k, k, m],
        [k, f, f, e, e, b, b, k, k, b, b, e, e, f, f, k, _],
        [k, f, f, e, e, b, b, 0, k, 0, b, b, e, e, f, f, k],
        [k, b, b, f, f, e, e, 0, 0, e, e, f, f, b, b, k, _],
        [k, b, b, f, f, e, e, e, 0, e, e, e, f, f, b, b, k],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
