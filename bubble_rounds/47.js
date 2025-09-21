(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[47] = [
        [h, 0, 0, 0, 0, m, m, h, h, h, m, m, 0, 0, 0, 0, h],
        [f, i, b, e, 0, m, h, h, h, h, m, 0, e, b, i, f, _],
        [0, 0, 0, 0, k, 0, h, 0, 0, 0, h, 0, k, 0, 0, 0, 0],
        [0, i, f, h, 0, f, i, b, e, k, h, 0, h, f, i, 0, _],
        [0, b, 0, 0, 0, i, 0, 0, 0, 0, 0, f, 0, 0, 0, b, 0],
        [0, e, k, h, f, 0, 0, 0, 0, 0, 0, k, h, k, e, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x, x]
    ];
})();
