(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[24] = [
        [f, f, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, k, k],
        [j, i, i, j, j, j, j, j, j, j, j, j, j, e, e, j, _],
        [0, 0, c, b, b, c, c, c, c, c, c, c, b, b, c, 0, 0],
        [0, 0, 0, j, e, e, j, j, j, j, i, i, j, 0, 0, 0, _],
        [0, 0, 0, 0, 0, c, k, k, c, f, f, c, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, j, h, h, j, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, c, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
