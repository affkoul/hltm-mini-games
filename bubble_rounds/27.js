(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[27] = [
        [f, 0, 0, f, 0, 0, f, 0],
        [i, 0, 0, i, 0, 0, i, _],
        [0, k, f, 0, k, i, 0, k],
        [h, 0, 0, h, 0, 0, h, _],
        [b, 0, k, b, 0, h, b, 0],
        [c, 0, 0, c, 0, 0, c, _],
        [f, g, i, f, g, i, f, g],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
