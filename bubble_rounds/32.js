(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[32] = [
        [c, c, c, c, c, c, c, c],
        [f, k, e, b, h, i, 0, _],
        [c, c, c, c, c, c, c, c],
        [f, k, e, b, h, 0, i, _],
        [c, c, c, c, c, c, c, c],
        [f, k, e, b, 0, h, i, _],
        [c, c, c, c, c, c, c, c],
        [f, k, e, 0, b, h, i, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
