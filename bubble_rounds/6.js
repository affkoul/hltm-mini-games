(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[6] = [
        [0, 0, 0, c, 0, 0, 0, c, c, c, 0, 0, 0, c, 0, 0, 0],
        [0, 0, c, c, 0, 0, c, b, b, c, 0, 0, c, c, 0, 0, _],
        [0, c, c, b, c, c, c, b, f, b, c, c, c, b, c, c, 0],
        [c, b, b, b, b, j, b, f, f, b, j, b, b, b, b, c, _],
        [0, f, b, j, b, b, j, b, f, b, j, b, b, j, b, f, 0],
        [0, i, b, j, j, j, j, b, b, j, j, j, j, b, i, 0, _],
        [0, 0, b, b, b, j, b, b, j, b, b, j, b, b, b, 0, 0],
        [0, 0, h, f, i, b, h, f, f, h, b, i, f, h, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
