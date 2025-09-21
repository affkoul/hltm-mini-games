(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[8] = [
        [0, 0, 0, k, f, 0, 0, 0],
        [0, b, e, j, i, f, 0, _],
        [j, e, k, 0, 0, b, i, j],
        [b, j, h, 0, e, j, b, _],
        [j, 0, 0, f, k, 0, 0, j],
        [0, 0, i, j, h, 0, 0, _],
        [j, i, b, 0, 0, k, h, j],
        [f, j, e, 0, e, j, f, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
