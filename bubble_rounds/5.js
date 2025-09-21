(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[5] = [
        [f, f, b, b, e, e, k, k],
        [k, 0, k, 0, k, 0, k, _],
        [h, 0, e, 0, e, 0, b, 0],
        [h, e, b, k, b, f, 0, _],
        [0, h, 0, b, 0, e, 0, 0],
        [f, e, k, k, e, f, 0, _],
        [b, 0, j, 0, j, 0, k, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
