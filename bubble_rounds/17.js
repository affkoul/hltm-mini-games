(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[17] = [
        [g, g, g, g, g, g, g, g],
        [b, c, i, 0, k, b, c, _],
        [e, c, f, 0, 0, b, c, k],
        [f, b, h, 0, c, h, c, _],
        [f, k, h, 0, 0, c, c, c],
        [e, b, b, 0, k, i, b, _],
        [k, c, k, 0, 0, h, e, f],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
