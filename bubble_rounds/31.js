(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[31] = [
        [f, 0, 0, 0, 0, 0, 0, l],
        [f, k, e, b, h, i, 0, _],
        [f, e, b, h, i, 0, 0, 0],
        [b, h, i, k, e, b, h, _],
        [h, i, k, e, b, 0, 0, k],
        [k, e, b, 0, 0, 0, 0, _],
        [e, b, h, i, k, e, b, k],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
