(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[9] = [
        [b, b, b, 0, 0, 0, k, k],
        [i, i, 0, k, 0, k, k, _],
        [f, f, 0, k, 0, c, k, k],
        [b, 0, k, k, c, 0, b, _],
        [i, 0, k, k, c, k, 0, i],
        [0, k, c, c, k, k, 0, _],
        [0, k, c, c, k, k, k, 0],
        [0, b, 0, i, 0, f, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
