(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[29] = [
        [0, 0, f, f, 0, h, h, 0, k, k, 0, e, e, 0, b, b, 0],
        [0, f, i, f, h, f, h, k, h, k, e, k, e, b, e, b, _],
        [0, 0, 0, f, j, 0, h, j, 0, k, j, 0, e, j, 0, b, 0],
        [h, h, j, c, c, j, g, g, j, f, f, j, i, i, 0, 0, _],
        [h, c, h, c, g, c, g, k, g, f, i, f, i, b, i, 0, 0],
        [h, 0, 0, c, 0, 0, g, 0, 0, f, 0, 0, i, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
