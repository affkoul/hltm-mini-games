(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[13] = [
        [i, i, i, i, i, i, i, i],
        [b, e, k, h, f, c, i, _],
        [h, f, c, b, e, 0, 0, k],
        [b, e, h, 0, 0, 0, c, _],
        [h, f, c, 0, 0, 0, e, k],
        [b, 0, 0, 0, 0, f, c, _],
        [h, 0, 0, 0, c, b, e, k],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
