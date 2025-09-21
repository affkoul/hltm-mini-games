/* 
    Class for adding, deleting, and updating player stats
    Stored in the game.data object to be access throughout all phaser states
*/
(function () {
    if (!window.__LANG) {
        var KEY = 'portal.lang';
        var m = (location.search.match(/[?&]lang=(en|fr|zh)\b/) || [])[1];
        var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) { }
        var lang = m || saved || (document.documentElement && document.documentElement.getAttribute('lang')) || 'en';
        window.__LANG = (lang === 'fr' || lang === 'zh') ? lang : 'en';
        try { localStorage.setItem(KEY, window.__LANG); } catch (e) { }
    }
    if (!window.__STR_PLAYER) {
        window.__STR_PLAYER = {
            en: { GUEST: 'GUEST' },
            fr: { GUEST: 'INVITÉ' },
            zh: { GUEST: '游客' }
        };
    }
})();

window.Player = class Player {
    constructor(name = (window.__STR_PLAYER && window.__STR_PLAYER[window.__LANG] || window.__STR_PLAYER.en).GUEST,
        credits = 6, totalScore = 0, highScore = 0, currentRound = 1, gameCompleted = false) {
        this.name = name;
        this.credits = credits;
        this.totalScore = totalScore;
        this.highScore = highScore;
        this.currentRound = currentRound;
        this.gameCompleted = gameCompleted;

        // if (completedRound) {
        //     this.completedRound = completedRound;
        // }else {
        //     this.completedRound = {
        //         round: currentRound,
        //         time: null,
        //         bonus: null,
        //         score: null,
        //         totalScore: null
        //     };
        // }
    }

    static getExistingPlayer() {
        return JSON.parse(localStorage.getItem('bubble-shooter'));
    }

    static clear() {
        localStorage.removeItem('bubble-shooter');
    }

    save() {
        localStorage.setItem('bubble-shooter', JSON.stringify(this));
    }
};