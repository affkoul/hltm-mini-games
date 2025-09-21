(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[37] = [
        [0, 0, b, 0, 0, i, 0, 0],
        [0, h, c, e, e, i, 0, _],
        [0, i, 0, f, g, 0, g, 0],
        [c, k, g, 0, c, i, c, _],
        [e, 0, k, c, g, e, 0, f],
        [e, i, g, e, h, h, g, _],
        [i, b, e, k, h, f, g, c],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
