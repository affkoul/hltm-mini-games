var adjustSize = setSize(MIN_HEIGHT, CANVAS_HEIGHT);

// === i18n singletons (no duplicate consts across files) ===
(function () {
    // Language (shared)
    if (!window.__LANG) {
        var KEY = 'portal.lang';
        var m = (location.search.match(/[?&]lang=(en|fr|zh)\b/) || [])[1];
        var saved = null;
        try { saved = localStorage.getItem(KEY); } catch (e) { }
        var lang = m || saved || (document.documentElement && document.documentElement.getAttribute('lang')) || 'en';
        window.__LANG = (lang === 'fr' || lang === 'zh') ? lang : 'en';
        try { localStorage.setItem(KEY, window.__LANG); } catch (e) { }
    }

    // Tutorial strings only (namespaced so it won't collide with Load strings)
    if (!window.__STR_TUTORIAL) {
        window.__STR_TUTORIAL = {
            en: {
                RULES: 'RULES',
                CONTROLS: 'CONTROLS',
                back: 'Press ENTER to go back',
                rules:
                    "• Clear all bubbles using the launcher to continue to the\n  next round.\n"
                    + "• Remove the bubbles by attaching to clusters of 3 or more with\n  the same color.\n"
                    + "• Bubbles with different colors can also be removed if they are\n  hanging from the cluster.\n"
                    + "• Each bubble removed is worth 10 points.\n"
                    + "• Each hanging bubble that is removed is worth\n  10^(total hanging bubbles) points per color.\n"
                    + "• There are a total of 50 rounds and 6 credits per game. Good Luck!",
                controls:
                    "• SPACE = Launch bubble\n"
                    + "• ARROW LEFT/RIGHT = Rotate launcher\n"
                    + "• ENTER = Select navigation\n"
                    + "• ARROW UP/DOWN = Switch navigation"
            },
            fr: {
                RULES: 'RÈGLES',
                CONTROLS: 'COMMANDES',
                back: 'Appuyez sur ENTRER pour revenir',
                rules:
                    "• Éliminez toutes les bulles avec le lanceur pour passer au\n  niveau suivant.\n"
                    + "• Retirez les bulles en les accrochant à des groupes de 3 ou plus\n  de la même couleur.\n"
                    + "• Des bulles d’autres couleurs peuvent aussi tomber si elles\n  pendent du groupe.\n"
                    + "• Chaque bulle retirée vaut 10 points.\n"
                    + "• Chaque bulle pendante retirée vaut\n  10^(nombre total de bulles pendantes) points par couleur.\n"
                    + "• Au total 50 manches et 6 crédits par partie. Bonne chance !",
                controls:
                    "• BARRE D’ESPACE = Tirer la bulle\n"
                    + "• FLÈCHE GAUCHE/DROITE = Pivoter le lanceur\n"
                    + "• ENTRER = Valider la navigation\n"
                    + "• FLÈCHE HAUT/BAS = Changer d’option"
            },
            zh: {
                RULES: '规则',
                CONTROLS: '操作',
                back: '按 回车 返回',
                rules:
                    "• 使用发射器清空所有泡泡即可进入\n  下一关。\n"
                    + "• 将泡泡连接到≥3个相同颜色的簇上即可消除。\n"
                    + "• 若不同颜色的泡泡悬挂在簇上，\n  也会一并掉落并被移除。\n"
                    + "• 每个被移除的泡泡记 10 分。\n"
                    + "• 每个被移除的“悬挂泡泡”每种颜色记\n  10^(悬挂泡泡总数) 分。\n"
                    + "• 共 50 关，每局有 6 次继续机会。祝你好运！",
                controls:
                    "• 空格 = 发射泡泡\n"
                    + "• 左/右方向键 = 旋转发射器\n"
                    + "• 回车 = 选择导航\n"
                    + "• 上/下方向键 = 切换导航"
            }
        };
    }
})();

window.Tutorial = class Tutorial extends Phaser.State {
    create() {
        // builder
        this.createTiles();
        this.createInstructions();
        this.theme = this.game.data.audio.theme0;

        // events
        this.game.keyEnter.onDown.add(this.changeState, this);
        // After creating navigation, show the menu controls
        this.enableMenuControls();
    }

    enableMenuControls() {
        const wrap = document.getElementById('bs-controls');
        const play = document.getElementById('bs-play-controls');
        const menu = document.getElementById('bs-menu-controls');
        if (!wrap || !menu) return;

        wrap.style.display = 'grid';
        menu.style.display = 'grid';
        if (play) play.style.display = 'none';

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
        bindHold('bs-left-m', Phaser.Keyboard.LEFT);
        bindHold('bs-right-m', Phaser.Keyboard.RIGHT);
        bindHold('bs-up-m', Phaser.Keyboard.UP);
        bindHold('bs-down-m', Phaser.Keyboard.DOWN);
        bindHold('bs-enter-m', Phaser.Keyboard.ENTER);
        bindHold('bs-fire-m', Phaser.Keyboard.SPACEBAR);
    }

    _addHeader(x, y, text) {
        var useBitmap = (window.__LANG === 'en'); // Upheaval is ASCII-only in most packs

        if (useBitmap) {
            return this.add.bitmapText(
                x, y,
                'upheaval',     // your loaded bitmap font
                text,
                HEADER_FONT_SIZE,
                this.instructions
            );
        }

        // Fallback for FR/ZH (handles accents + CJK)
        return this.add.text(
            x, y, text,
            {
                font: HEADER_FONT_SIZE + 'px "Noto Sans SC","Microsoft YaHei","Noto Sans","Segoe UI",Arial,sans-serif',
                fill: '#ffffff',
                align: 'left',
                stroke: '#000000',
                strokeThickness: 3
            },
            this.instructions
        );
    }

    createTiles() {
        this.tiles = this.add.group();
        this.tiles.createMultiple(ROWS * COLUMNS, 'tile-3', null, true);
        this.tiles.setAll('width', TILE_SIZE);
        this.tiles.setAll('height', TILE_SIZE);
        // rows and columns are opposites for this method
        this.tiles.align(COLUMNS, ROWS, TILE_SIZE, TILE_SIZE);
    }

    createInstructions() {
        this.instructions = this.add.group();

        const S = (window.__STR_TUTORIAL && window.__STR_TUTORIAL[window.__LANG]) || window.__STR_TUTORIAL.en;

        // RULES
        let rulesHeader = this._addHeader(TILE_SIZE, ANCHOR_OFFSET, S.RULES);
        let rulesDesc = this.add.text(
            TILE_SIZE, TILE_SIZE * 2,
            S.rules,
            { font: DESC_FONT_SIZE + "px monospace", fill: "white", align: "left", stroke: 'black', strokeThickness: 3 },
            this.instructions
        );

        // CONTROLS
        let controlHeader = this._addHeader(TILE_SIZE, CENTER_Y + TILE_SIZE, S.CONTROLS);
        let controlDesc = this.add.text(
            TILE_SIZE, CENTER_Y + (TILE_SIZE * 2) + ANCHOR_OFFSET,
            S.controls,
            { font: DESC_FONT_SIZE + "px monospace", fill: "white", align: "left", stroke: 'black', strokeThickness: 3 },
            this.instructions
        );

        // adding instruction text
        let instructions = this.add.text(
            ANCHOR_OFFSET - adjustSize(3), CANVAS_HEIGHT - ANCHOR_OFFSET,
            S.back,
            { font: DESC_FONT_SIZE + "px monospace", fill: "white", align: "left", stroke: 'black', strokeThickness: 3 },
        );

        instructions.anchor.set(0, 0.35);
        instructions.alpha = 0;

        // Yoyo the text
        let instructionsTween = this.add.tween(instructions).
            to({ alpha: 1 }, 500, "Linear", true, 0, -1);

        instructionsTween.yoyo(true, 300);
    }

    changeState(e) {
        this.state.start('menu');
    }

    shutdown() {
        this.game.keyEnter.onDown.remove(this.changeState, this);
    }
};