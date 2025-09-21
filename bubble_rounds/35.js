(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[35] = [
        [k, 0, 0, 0, 0, 0, 0, c],
        [b, 0, 0, b, 0, 0, k, _],
        [0, c, 0, k, c, 0, b, 0],
        [0, k, c, b, k, c, 0, _],
        [k, c, b, k, c, b, k, c],
        [0, k, c, b, k, c, 0, _],
        [0, k, c, b, k, c, b, 0],
        [b, k, c, b, k, c, b, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
