(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[41] = [
        [i, 0, 0, l, l, 0, 0, i],
        [f, f, 0, l, 0, f, f, _],
        [e, h, k, i, i, k, h, e],
        [b, k, b, g, b, k, b, _],
        [f, g, e, f, f, e, g, f],
        [h, i, k, g, k, i, h, _],
        [g, 0, b, 0, 0, b, 0, g],
        [i, 0, k, 0, k, 0, i, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
