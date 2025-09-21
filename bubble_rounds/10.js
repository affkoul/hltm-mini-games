(function () {
    var A = window.AlphabetizedMap;
    if (!A) { console.error('AlphabetizedMap not found'); return; }
    var _ = A._, x = A.x, b = A.b, c = A.c, d = A.d, e = A.e, f = A.f, g = A.g,
        h = A.h, i = A.i, j = A.j, k = A.k, l = A.l, m = A.m;

    window.ROUNDS = window.ROUNDS || {};
    window.ROUNDS[10] = [
        [k, k, e, e, b, b, f, f],
        [j, 0, j, 0, j, 0, j, _],
        [k, k, e, e, b, b, f, f],
        [j, 0, j, 0, j, 0, j, _],
        [k, k, e, e, b, b, f, f],
        [j, 0, j, 0, j, 0, j, _],
        [k, k, e, e, b, b, f, f],
        [j, 0, j, 0, j, 0, j, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, _],
        [x, x, x, x, x, x, x, x]
    ];
})();
