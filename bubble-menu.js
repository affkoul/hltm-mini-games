
// === i18n singletons for Menu (safe to include in multiple files) ===
(function () {
    if (!window.__LANG) {
        var KEY = 'portal.lang';
        var m = (location.search.match(/[?&]lang=(en|fr|zh)\b/) || [])[1];
        var saved = null;
        try { saved = localStorage.getItem(KEY); } catch (e) { }
        var lang = m || saved || (document.documentElement && document.documentElement.getAttribute('lang')) || 'en';
        window.__LANG = (lang === 'fr' || lang === 'zh') ? lang : 'en';
        try { localStorage.setItem(KEY, window.__LANG); } catch (e) { }
    }

    if (!window.__STR_MENU) {
        window.__STR_MENU = {
            en: {
                title1: 'BUBBLE',
                title2: 'SHOOTER',
                CONTINUE: 'CONTINUE',
                NEW_GAME: 'NEW GAME',
                TUTORIAL: 'TUTORIAL',
                hint: 'Use arrow keys to move and press ENTER to select'
            },
            fr: {
                title1: 'TIREUR',
                title2: 'DE BULLES',
                CONTINUE: 'CONTINUER',
                NEW_GAME: 'NOUVELLE PARTIE',
                TUTORIAL: 'TUTORIEL',
                hint: 'Utilisez les flèches pour déplacer et appuyez sur ENTRÉE pour valider'
            },
            zh: {
                // NOTE: bitmap font likely lacks CJK; see step 4 for fallback.
                title1: '泡泡',
                title2: '龙',
                CONTINUE: '继续',
                NEW_GAME: '新游戏',
                TUTORIAL: '教程',
                hint: '使用方向键移动，按回车确认'
            }
        };
    }
})();

function useBitmapFonts() { return window.__LANG !== 'zh'; }

var adjustSize = setSize(MIN_HEIGHT, CANVAS_HEIGHT);

window.Menu = class Menu extends Phaser.State {
    init(prevState) {
        if (prevState === 'play') {
            this.game.data.audio.theme0.play(null, 0, 1, true);
        }
    }

    create() {
        // TODO: https://stackoverflow.com/questions/39152877/consider-marking-event-handler-as-passive-to-make-the-page-more-responsive
        this.createTiles();
        this.createLogo();
        this.createNavigation();

        // event listeners
        this.game.keyEnter.onDown.add(this.changeState, this);
        this.game.keyDown.onDown.add(this.changeCurrentNavigation, this);
        this.game.keyUp.onDown.add(this.changeCurrentNavigation, this);
        // After creating navigation, show the menu controls
        this.enableMenuControls();
    }

    enableMenuControls() {
        const wrap = document.getElementById('bs-controls');
        const play = document.getElementById('bs-play-controls');
        const menu = document.getElementById('bs-menu-controls');
        if (!wrap || !play) return;

        wrap.style.display = 'grid';
        play.style.display = 'grid';
        if (menu) menu.style.display = 'none';

        const kbd = this.game && this.game.input && this.game.input.keyboard;
        if (!kbd) return;

        const fakeEvent = (keyCode) => ({
            keyCode,
            which: keyCode,               // Phaser checks these in some paths
            keyIdentifier: '',
            preventDefault() { },
            stopPropagation() { },
        });

        const bindHold = (id, keyCode) => {
            const el = document.getElementById(id);
            if (!el) return;

            const down = (e) => { e.preventDefault(); e.stopPropagation(); kbd.processKeyDown(fakeEvent(keyCode)); };
            const up = (e) => { e.preventDefault(); e.stopPropagation(); kbd.processKeyUp(fakeEvent(keyCode)); };

            // Touch
            el.addEventListener('touchstart', down, { passive: false });
            el.addEventListener('touchend', up, { passive: false });
            el.addEventListener('touchcancel', up, { passive: false });

            // Mouse
            el.addEventListener('mousedown', down);
            el.addEventListener('mouseup', up);
            el.addEventListener('mouseleave', up);
        };

        // Map your buttons → keys
        bindHold('bs-left', Phaser.Keyboard.LEFT);
        bindHold('bs-right', Phaser.Keyboard.RIGHT);
        bindHold('bs-up', Phaser.Keyboard.UP);     // if present
        bindHold('bs-down', Phaser.Keyboard.DOWN);   // if present
        bindHold('bs-enter', Phaser.Keyboard.ENTER);  // if present
        bindHold('bs-fire', Phaser.Keyboard.SPACEBAR);
    }

    disableMenuControls() {
        var wrap = document.getElementById('bs-controls');
        if (wrap) wrap.style.display = 'none';
    }

    createTiles() {
        let tiles = this.add.group();
        tiles.createMultiple(ROWS * COLUMNS, 'tile-1', null, true);
        tiles.setAll('width', TILE_SIZE);
        tiles.setAll('height', TILE_SIZE);
        // rows and columns are opposites for this method
        tiles.align(COLUMNS, ROWS, TILE_SIZE, TILE_SIZE);
    }

    createLogo() {
        let logo = this.add.group();
        let cloud = logo.create(CENTER_X, CENTER_Y - adjustSize(10), 'cloud-1');
        cloud.width = adjustSize(510);
        cloud.height = adjustSize(450);
        // x, y, font, text, size, group
        // large: 130, medium: 100, small: 72
        const SM = (window.__STR_MENU && window.__STR_MENU[window.__LANG]) || window.__STR_MENU.en;
        if (useBitmapFonts()) {
            this.add.bitmapText(CENTER_X - adjustSize(50), CENTER_Y - adjustSize(45), 'happy-hell', SM.title1, TITLE_FONT_SIZE, logo);
            this.add.bitmapText(CENTER_X + adjustSize(30), CENTER_Y + adjustSize(40), 'happy-hell', SM.title2, TITLE_FONT_SIZE, logo);
        } else {
            this.add.text(
                CENTER_X - adjustSize(50), CENTER_Y - adjustSize(45), SM.title1,
                { font: TITLE_FONT_SIZE + 'px "Noto Sans SC","Microsoft YaHei",Arial,sans-serif', fill: '#fff', stroke: '#000', strokeThickness: 4 },
                logo
            );
            this.add.text(
                CENTER_X + adjustSize(30), CENTER_Y + adjustSize(40), SM.title2,
                { font: TITLE_FONT_SIZE + 'px "Noto Sans SC","Microsoft YaHei",Arial,sans-serif', fill: '#fff', stroke: '#000', strokeThickness: 4 },
                logo
            );
        }
        logo.setAll('anchor.x', 0.5);
        logo.setAll('anchor.y', 0.5);
    }

    createNavigation() {
        const SM = (window.__STR_MENU && window.__STR_MENU[window.__LANG]) || window.__STR_MENU.en;
        // If your bitmap font lacks CJK, we’ll pick a safe font in step 4.
        // For now, decide which font name to pass to Navigation:
        const navFont = (window.__LANG !== 'zh') ? 'upheaval' : undefined; // undefined => “no bitmap font”
        // adding logo text
        if (this.game.data.player) {
            this.navigation = new Navigation(this.game, [
                { name: SM.CONTINUE, stateName: 'continue', font: navFont, fontSize: NAV_FONT_SIZE },
                { name: SM.NEW_GAME, stateName: 'newGame', font: navFont, fontSize: NAV_FONT_SIZE },
                { name: SM.TUTORIAL, stateName: 'tutorial', font: navFont, fontSize: NAV_FONT_SIZE },
            ], CENTER_X, CENTER_Y + adjustSize(110), adjustSize(40));
        } else {
            this.navigation = new Navigation(this.game, [
                { name: SM.NEW_GAME, stateName: 'newGame', font: navFont, fontSize: NAV_FONT_SIZE },
                { name: SM.TUTORIAL, stateName: 'tutorial', font: navFont, fontSize: NAV_FONT_SIZE },
            ], CENTER_X, CENTER_Y + adjustSize(110), adjustSize(40));
        }

        this.navigation.createPolnareff(CENTER_X - adjustSize(105), CENTER_Y + adjustSize(113), adjustSize(38));
        this.navigation.polnareff.width = adjustSize(36);
        this.navigation.polnareff.height = adjustSize(36);

        // adding instruction text
        let instructions = this.add.text(
            ANCHOR_OFFSET - adjustSize(3), CANVAS_HEIGHT - ANCHOR_OFFSET,
            SM.hint,
            { font: DESC_FONT_SIZE + "px monospace", fill: "white", align: "left", stroke: 'black', strokeThickness: 3 },
        );

        instructions.anchor.set(0, 0.35);
        instructions.alpha = 0;

        // Yoyo the text
        let instructionsTween = this.add.tween(instructions).
            to({ alpha: 1 }, 500, "Linear", true, 0, -1);

        instructionsTween.yoyo(true, 300);
    }

    changeCurrentNavigation(e) {
        if (e.keyCode === this.game.keyDown.keyCode) {
            this.navigation.changeCurrentNavigation(1);
        }

        if (e.keyCode === this.game.keyUp.keyCode) {
            this.navigation.changeCurrentNavigation(-1);
        }

        this.game.data.audio.switchNavigation.play();
    }

    changeState(e) {
        let state = this.navigation.children[this.navigation.currentIndex].stateName;

        if (state === 'newGame') {
            Player.clear();
            this.game.data.player = new Player();
            state = 'play';
        } else if (state === 'continue') {
            state = 'play';
        }

        this.navigation.tweenNavigation(this.navigation.currentIndex, () => {
            this.state.start(state);

            if (state !== 'tutorial') {
                this.game.data.audio.theme0.stop();
            }

        });

        this.game.data.audio.selectNavigation.play();
    }

    shutdown() {
        this.game.keyEnter.onDown.remove(this.changeState, this);
        this.game.keyDown.onDown.remove(this.changeCurrentNavigation, this);
        this.game.keyUp.onDown.remove(this.changeCurrentNavigation, this);
        // existing removals...
        this.disableMenuControls && this.disableMenuControls();
    }
};