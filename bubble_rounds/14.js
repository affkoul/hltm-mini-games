(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[14] = [
        [k, e, b, 0, 0, 0, 0, 0],
        [h, k, e, b, 0, 0, 0, _],
        [0, f, h, k, e, 0, 0, 0],
        [b, i, f, h, 0, 0, 0, _],
        [k, e, b, i, f, 0, 0, 0],
        [h, k, e, b, 0, 0, 0, _],
        [i, f, h, k, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
