(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[26] = [
        [g, c, 0, l, 0, 0, c, g],
        [h, k, 0, j, 0, k, h, _],
        [c, g, 0, j, 0, 0, g, c],
        [k, h, 0, j, 0, h, k, _],
        [g, c, 0, j, 0, 0, c, g],
        [0, 0, 0, j, 0, 0, 0, _],
        [0, 0, 0, j, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
