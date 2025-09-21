(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[30] = [
        [g, g, 0, 0, 0, 0, 0, 0],
        [c, b, 0, 0, 0, 0, 0, _],
        [h, g, c, g, 0, 0, 0, 0],
        [c, g, b, g, c, 0, 0, _],
        [0, h, k, c, b, g, h, g],
        [0, 0, g, g, b, g, c, _],
        [0, 0, 0, 0, 0, c, h, k],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
