(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[12] = [
        [k, k, 0, f, f, 0, b, b],
        [h, 0, 0, e, 0, 0, i, _],
        [0, k, e, b, i, f, h, 0],
        [i, 0, 0, e, 0, 0, k, _],
        [0, k, e, b, i, f, h, 0],
        [f, 0, h, 0, b, h, i, _],
        [k, e, b, i, f, h, 0, l],
        [0, 0, 0, 0, 0, 0, f, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
