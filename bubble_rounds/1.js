(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[1] = [
        [m, 0, m, m, m, m, m, m, b, m, m, m, m, m, m, 0, m],
        [m, m, 0, 0, 0, 0, 0, b, b, 0, 0, 0, 0, 0, m, m, _],
        [0, m, 0, f, f, f, b, b, k, b, b, e, e, e, 0, m, 0],
        [m, 0, f, k, 0, e, e, k, k, f, f, 0, k, e, 0, m, _],
        [m, 0, 0, f, k, 0, e, 0, b, 0, f, 0, k, e, 0, 0, m],
        [0, 0, 0, b, k, k, 0, b, b, 0, k, k, b, 0, 0, 0, _],
        [0, 0, 0, b, b, 0, f, f, 0, e, e, 0, b, b, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
