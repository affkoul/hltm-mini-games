(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[25] = [
        [f, l, h, l, k, l, e, 0],
        [i, j, c, 0, h, j, k, _],
        [b, 0, g, l, c, 0, h, 0],
        [e, j, f, 0, g, j, c, _],
        [k, 0, i, l, f, 0, g, 0],
        [h, j, b, 0, i, j, f, _],
        [c, 0, e, l, b, 0, i, 0],
        [g, 0, k, 0, e, 0, b, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
