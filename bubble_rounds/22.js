(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[22] = [
        [f, 0, 0, 0, 0, 0, 0, g],
        [f, e, k, 0, 0, g, i, _],
        [f, b, 0, 0, g, i, 0, g],
        [0, 0, g, i, 0, g, i, _],
        [0, g, i, 0, g, i, 0, g],
        [i, 0, g, i, 0, g, i, _],
        [0, g, i, 0, g, i, 0, g],
        [0, 0, g, i, 0, g, i, _],
        [0, g, i, 0, g, i, 0, g],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
