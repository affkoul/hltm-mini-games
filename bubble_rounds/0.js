// bubble_rounds/0.js
(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[0] = [
        [0, 0, 0, g, g, 0, 0, 0],
        [0, 0, 0, f, g, 0, 0, _],
        [0, 0, 0, f, 0, 0, 0, 0],
        [0, 0, 0, h, 0, 0, 0, _],
        [0, 0, 0, 0, h, 0, 0, 0],
        [0, 0, 0, k, 0, 0, 0, _],
        [0, 0, 0, k, 0, 0, 0, 0],
        [0, 0, 0, e, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
