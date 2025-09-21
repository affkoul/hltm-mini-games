(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[16] = [
        [g, g, h, h, i, i, e, e],
        [k, 0, g, e, h, 0, f, _],
        [0, e, h, k, f, g, i, h],
        [b, 0, e, 0, k, 0, g, _],
        [0, i, k, b, 0, e, 0, k],
        [f, c, i, k, b, h, e, _],
        [0, h, b, e, c, i, k, b],
        [g, k, h, 0, f, b, i, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
