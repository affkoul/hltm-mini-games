(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[33] = [
        [0, c, 0, c, k, 0, k, 0],
        [h, i, f, 0, h, i, f, _],
        [0, k, 0, k, c, 0, c, 0],
        [h, i, f, 0, h, i, f, _],
        [0, c, 0, c, k, 0, k, 0],
        [h, i, f, 0, h, i, f, _],
        [0, k, 0, k, c, 0, c, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
