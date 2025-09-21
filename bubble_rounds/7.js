(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[7] = [
        [h, h, h, h, h, h, h, h],
        [0, i, b, h, h, k, i, _],
        [0, 0, f, f, k, e, i, e],
        [0, 0, i, h, f, i, i, _],
        [0, 0, 0, h, i, b, k, k],
        [0, 0, 0, f, b, k, f, _],
        [0, 0, 0, 0, i, f, i, b],
        [0, 0, 0, f, k, i, k, _],
        [0, 0, 0, 0, i, i, f, e],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
