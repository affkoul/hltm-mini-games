(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[36] = [
        [0, 0, 0, h, f, 0, 0, 0],
        [0, 0, b, i, h, 0, 0, _],
        [0, 0, f, h, b, i, 0, 0],
        [0, b, i, f, h, b, 0, _],
        [0, f, h, b, i, f, h, 0],
        [b, i, f, l, b, i, f, _],
        [f, h, b, i, f, h, b, i],
        [i, f, h, b, i, f, h, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
