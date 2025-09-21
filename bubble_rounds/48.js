(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[48] = [
        [f, k, k, k, k, k, k, f],
        [f, h, h, h, h, h, f, _],
        [k, f, h, h, h, h, f, k],
        [h, f, h, h, h, f, b, _],
        [k, h, f, h, h, f, i, h],
        [e, b, f, h, f, h, k, _],
        [e, k, i, f, f, i, k, e],
        [h, i, k, b, e, b, e, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
