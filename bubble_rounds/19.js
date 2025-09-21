(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[19] = [
        [0, g, h, 0, 0, i, e, 0],
        [k, 0, g, k, h, 0, f, _],
        [0, e, k, 0, 0, g, h, 0],
        [b, 0, e, b, k, 0, g, _],
        [0, i, b, h, g, e, k, 0],
        [f, 0, i, f, b, 0, e, _],
        [0, h, f, 0, 0, i, b, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
