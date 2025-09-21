(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[44] = [
        [0, 0, 0, 0, 0, 0, e, e],
        [0, 0, 0, 0, 0, k, k, _],
        [0, 0, 0, 0, 0, g, c, h],
        [0, 0, 0, 0, h, e, k, _],
        [0, 0, 0, e, k, g, c, h],
        [0, 0, g, c, h, e, k, _],
        [g, c, h, e, k, g, c, h],
        [k, g, c, g, c, h, e, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
