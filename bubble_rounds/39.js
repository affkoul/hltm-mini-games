(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[39] = [
        [i, 0, 0, 0, 0, 0, 0, i],
        [f, f, 0, 0, 0, f, f, _],
        [e, h, k, e, e, k, h, e],
        [b, k, b, 0, b, k, b, _],
        [f, g, e, g, g, e, g, f],
        [h, i, 0, 0, 0, i, h, _],
        [g, k, b, h, h, b, k, g],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
