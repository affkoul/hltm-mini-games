(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[3] = [
        [0, 0, 0, f, f, f, f, 0],
        [0, i, i, i, 0, f, 0, _],
        [0, i, 0, b, b, b, b, 0],
        [0, e, e, e, e, 0, b, _],
        [0, e, 0, k, k, k, k, 0],
        [0, h, h, h, h, 0, k, _],
        [0, f, i, b, e, k, h, 0],
        [0, 0, 0, e, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
