
// --- Platform points helper (throttled for low-end phones) ---
var _bsPointsThrottle = 0;
function bsAddPoints(n, why) {
    if (!window.PlatformSDK) return;
    var now = Date.now();
    if (n <= 1 && now - _bsPointsThrottle < 350) return; // throttle small spammy events
    _bsPointsThrottle = now;
    PlatformSDK.addPoints(n, why);
}

// === i18n singletons for Play (safe to include in multiple files) ===
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

    if (!window.__STR_PLAY) {
        window.__STR_PLAY = {
            en: {
                READY: 'READY', GO: 'GO',
                YOU_WIN: 'YOU WIN', YOU_LOSE: 'YOU LOSE',
                CONGRATS: 'CONGRATULATIONS!', GAME_OVER: 'GAME OVER',
                CONTINUE: 'CONTINUE', QUIT: 'QUIT', MAIN_MENU: 'MAIN MENU',
                TOTAL: 'TOTAL', ROUND: 'ROUND', NEXT: 'NEXT', CREDITS: 'CREDITS'
            },
            fr: {
                READY: 'PRÊT', GO: 'GO',
                YOU_WIN: 'VOUS AVEZ GAGNÉ', YOU_LOSE: 'VOUS AVEZ PERDU',
                CONGRATS: 'FÉLICITATIONS !', GAME_OVER: 'FIN DE PARTIE',
                CONTINUE: 'CONTINUER', QUIT: 'QUITTER', MAIN_MENU: 'MENU PRINCIPAL',
                TOTAL: 'TOTAL', ROUND: 'NIVEAU', NEXT: 'SUIVANT', CREDITS: 'CRÉDITS'
            },
            zh: {
                READY: '准备', GO: '开始！',
                YOU_WIN: '你赢了', YOU_LOSE: '你输了',
                CONGRATS: '恭喜！', GAME_OVER: '游戏结束',
                CONTINUE: '继续', QUIT: '退出', MAIN_MENU: '主菜单',
                TOTAL: '总分', ROUND: '关卡', NEXT: '下一个', CREDITS: '次数'
            }
        };
    }
})();

function useBitmapFonts() { return window.__LANG !== 'zh'; }
function uiTextStyle(px) {
    return {
        font: (px || 28) + 'px "Noto Sans SC","Microsoft YaHei",Arial,sans-serif',
        fill: '#fff',
        align: 'center',
        stroke: '#000',
        strokeThickness: 4
    };
}

// convenient local pointer (safe to re-eval on reloads)
const S_PLAY = (window.__STR_PLAY && window.__STR_PLAY[window.__LANG]) || window.__STR_PLAY.en;

var adjustSize = setSize(MIN_HEIGHT, CANVAS_HEIGHT);

/* 
    Manage game play. Track score, update matrix, update player stats, collision
*/
window.Play = class Play extends Phaser.State {
    preload() {
        // button flags
        this.btnLeftHeld = false;
        this.btnRightHeld = false;
        // stats
        this.nowPlaying = false;
        this.scoreKeeper = new ScoreKeeper();
        this.launchCountdown = LAUNCH_COUNTDOWN;
        this.topBoundaryLaunchLimit = TOP_BOUNDARY_LAUNCH_LIMIT;
        this.round = new Round(this.game.data.player.currentRound, TILE_SIZE, ANCHOR_OFFSET);
        this.bubbleLaunched = false;

        if (this.game.data.player.currentRound % 2 === 0) {
            this.theme = this.game.data.audio.theme1;
        } else {
            this.theme = this.game.data.audio.theme2;
        }

        this.theme.restart(null, 0, 1, true);
    }

    // initialize round
    create() {
        if (window.PlatformSDK) { PlatformSDK.endGame(); }  // end previous session
        this.createTiles();
        this.createBlocks();
        this.createBoundaries();
        this.createLauncher();
        this.createStage();
        this.createScoreboard();

        let specialCollision = EntityMap.collision.rainbow.stages.includes(this.game.data.player.currentRound);
        if (specialCollision) {
            this.currentBubble = this.createBubble(CURRENT_BUBBLE_X, CURRENT_BUBBLE_Y, EntityMap.rainbow);
        } else {
            this.currentBubble = this.createRandomBubble(CURRENT_BUBBLE_X, CURRENT_BUBBLE_Y);
        }
        this.nextBubble = this.createRandomBubble(NEXT_BUBBLE_X, NEXT_BUBBLE_Y);

        // game logic
        this.status = new Status(this.game,
            { fill: 0x00000 },
            { x: CENTER_X, y: CENTER_Y, font: (useBitmapFonts() ? 'upheaval' : null), message: S_PLAY.READY, fontSize: NAV_FONT_SIZE }
        );
        this.pregame(this.startGame);

        // events
        this.game.keySpace.onDown.add(this.launchBubble, this);
        this.game.keyEnter.onDown.add(this.changeState, this);
        this.game.keyDown.onDown.add(this.changeCurrentNavigation, this);
        this.game.keyUp.onDown.add(this.changeCurrentNavigation, this);
        // onscreen buttons
        this.enablePlayControls();
        // when ready for the player to shoot:
        if (window.PlatformSDK) PlatformSDK.startGame('BUBBLESHOOTER');
    }

    enablePlayControls() {
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

    disableControls() {
        var wrap = document.getElementById('bs-controls');
        if (wrap) wrap.style.display = 'none';
        this.btnLeftHeld = this.btnRightHeld = false;
    }

    createTiles() {
        this.tiles = this.add.group();
        this.tiles.createMultiple(ROWS * COLUMNS, 'tile-2', null, true);
        this.tiles.setAll('width', TILE_SIZE);
        this.tiles.setAll('height', TILE_SIZE);
        // rows and columns are opposites for this method
        this.tiles.align(COLUMNS, ROWS, TILE_SIZE, TILE_SIZE);
    }

    createBlocks() {
        this.blocks = this.add.physicsGroup();

        // top / bottom blocks
        for (let i = 0; i < COLUMNS; i++) {
            this.blocks.create((i * TILE_SIZE) + ANCHOR_OFFSET, ANCHOR_OFFSET, 'block-1');
            this.blocks.create((i * TILE_SIZE) + ANCHOR_OFFSET, CANVAS_HEIGHT - ANCHOR_OFFSET, 'block-1');
        }

        let colLength = Math.floor((COLUMNS - this.round.cols) / 2);
        for (let i = 1; i < ROWS - 1; i++) {
            for (let j = 0; j < colLength; j++) {
                let left = this.blocks.create((j * TILE_SIZE) + ANCHOR_OFFSET, (i * TILE_SIZE) + ANCHOR_OFFSET, 'block-1');
                let right = this.blocks.create((CANVAS_WIDTH - ANCHOR_OFFSET) - (j * TILE_SIZE), (i * TILE_SIZE) + ANCHOR_OFFSET, 'block-1');

                left.body.checkCollision.up = false;
                left.body.checkCollision.down = false;
                left.body.checkCollision.left = false;
                right.body.checkCollision.up = false;
                right.body.checkCollision.down = false;
                right.body.checkCollision.right = false;
            }
        }

        this.blocks.setAll('width', TILE_SIZE);
        this.blocks.setAll('height', TILE_SIZE);

        // half blocks
        if (this.round.cols === ROUND_MODE_2) {
            this.createHalfBlocks(colLength);
        }

        this.blocks.setAll('anchor', { x: 0.5, y: 0.5 });
        this.blocks.setAll('body.immovable', true);
        this.blocks.setAll('body.allowGravity', false);
    }

    createHalfBlocks() {
        for (let i = 2; i < (ROWS - 1) * 2; i++) {
            // left
            let left = this.blocks.create(this.round.startX - (ANCHOR_OFFSET / 2), (i * (TILE_SIZE / 2)) + (ANCHOR_OFFSET / 2), 'block-1');
            left.width = TILE_SIZE / 2;
            left.height = TILE_SIZE / 2;
            left.body.checkCollision.up = false;
            left.body.checkCollision.down = false;
            left.body.checkCollision.left = false;

            // right
            let right = this.blocks.create(this.round.endX + (ANCHOR_OFFSET / 2), (i * (TILE_SIZE / 2)) + (ANCHOR_OFFSET / 2), 'block-1');
            right.width = TILE_SIZE / 2;
            right.height = TILE_SIZE / 2;
            right.body.checkCollision.up = false;
            right.body.checkCollision.down = false;
            right.body.checkCollision.right = false;
        }
    }

    createBoundaries() {
        this.topBoundary = new Boundary(this.game,
            { x1: this.round.startX, y1: this.round.startY },
            { x2: this.round.endX, y2: this.round.startY },
            Colors.skyBlue
        );

        this.bottomBoundary = new Boundary(this.game,
            { x1: this.round.startX, y1: this.round.endY },
            { x2: this.round.endX, y2: this.round.endY },
            Colors.skyBlue
        );

        this.physics.enable(this.topBoundary, Phaser.Physics.ARCADE);
        this.topBoundary.body.immovable = true;
        this.topBoundary.body.allowGravity = false;
        this.topBoundary.body.setSize(CANVAS_WIDTH, TILE_SIZE + 1);
    }

    createScoreboard() {
        // TOTAL (bitmap for EN/FR; system text for ZH)
        if (useBitmapFonts()) {
            this.totalScoreText = this.add.bitmapText(
                ANCHOR_OFFSET - adjustSize(3), ANCHOR_OFFSET - adjustSize(3),
                'upheaval', appendDigits(14, this.game.data.player.totalScore, S_PLAY.TOTAL.toUpperCase()),
                MID_FONT_SIZE
            );
        } else {
            this.totalScoreText = this.add.text(
                ANCHOR_OFFSET - adjustSize(3), ANCHOR_OFFSET - adjustSize(3),
                appendDigits(14, this.game.data.player.totalScore, S_PLAY.TOTAL),
                uiTextStyle(MID_FONT_SIZE)
            );
        }
        this.totalScoreText.anchor.set(0, 0.5);

        // ROUND (bitmap for EN/FR; system text for ZH)
        if (useBitmapFonts()) {
            this.roundText = this.add.bitmapText(
                CANVAS_WIDTH - ANCHOR_OFFSET + adjustSize(3), ANCHOR_OFFSET - adjustSize(3),
                'upheaval', appendDigits(3, this.game.data.player.currentRound, S_PLAY.ROUND.toUpperCase()),
                MID_FONT_SIZE
            );
        } else {
            this.roundText = this.add.text(
                CANVAS_WIDTH - ANCHOR_OFFSET + adjustSize(3), ANCHOR_OFFSET - adjustSize(3),
                appendDigits(3, this.game.data.player.currentRound, S_PLAY.ROUND),
                uiTextStyle(MID_FONT_SIZE)
            );
        }
        this.roundText.anchor.set(1, 0.5);

        // CREDITS (already system text => just localize the label)
        this.creditText = this.add.text(
            CANVAS_WIDTH - ANCHOR_OFFSET + adjustSize(3), CANVAS_HEIGHT - ANCHOR_OFFSET,
            `${S_PLAY.CREDITS} ${this.game.data.player.credits}`,
            { font: `${DESC_FONT_SIZE}px monospace`, fill: "white", align: "left", stroke: 'black', strokeThickness: 3 },
        );
        this.creditText.anchor.set(1, 0.35);
    }

    createLauncher() {
        // polnareff
        this.polnareff = this.add.sprite(CENTER_X - adjustSize(72), CANVAS_HEIGHT + adjustSize(6) - (2 * TILE_SIZE), 'polnareff-1', 0);
        this.polnareff.width = adjustSize(48);
        this.polnareff.height = adjustSize(48);
        this.polnareff.anchor.set(0.5, 0.5);
        this.polnareff.animations.add('bounce', [0, 1], 2, true);
        this.polnareff.animations.play('bounce');

        // launcher pieces
        this.arrow = this.add.sprite(CENTER_X, CANVAS_HEIGHT - LAUNCHER_HEIGHT + ANCHOR_OFFSET, 'arrow-1');
        this.arrow.anchor.set(0.5, 0.95);
        this.arrow.width = adjustSize(14);
        this.arrow.height = adjustSize(60);

        // wheel
        this.launcherWheel = this.add.sprite(CENTER_X - adjustSize(14), CANVAS_HEIGHT - (2 * TILE_SIZE), 'launcher-wheel-1');
        this.launcherWheel.anchor.set(0.5, 0.5);
        this.launcherWheel.width = adjustSize(57);
        this.launcherWheel.height = adjustSize(57);

        // platform
        this.launcherPlatform = this.add.sprite(CENTER_X - adjustSize(1), CANVAS_HEIGHT - (2 * TILE_SIZE), 'launcher-platform-1');
        this.launcherPlatform.anchor.set(0.26, 0.5);
        this.launcherPlatform.width = adjustSize(90);
        this.launcherPlatform.height = adjustSize(62);

        // next text
        if (useBitmapFonts()) {
            this.nextText = this.add.bitmapText(
                CENTER_X + adjustSize(91), CANVAS_HEIGHT - LAUNCHER_HEIGHT + TILE_SIZE + adjustSize(13),
                'upheaval', S_PLAY.NEXT.toUpperCase(), MID_FONT_SIZE
            );
        } else {
            this.nextText = this.add.text(
                CENTER_X + adjustSize(91), CANVAS_HEIGHT - LAUNCHER_HEIGHT + TILE_SIZE + adjustSize(13),
                S_PLAY.NEXT, uiTextStyle(MID_FONT_SIZE)
            );
        }
        this.nextText.anchor.set(0.5, 0.5);

        // speech bubble 
        this.speechBubble = this.add.sprite(CENTER_X - adjustSize(118), CANVAS_HEIGHT - LAUNCHER_HEIGHT + adjustSize(8), 'speech-bubble-1');
        this.speechBubble.width = adjustSize(42);
        this.speechBubble.height = adjustSize(42);
        this.speechBubble.alpha = 0;
        this.speechBubbleText = this.add.bitmapText(CENTER_X - adjustSize(97), CANVAS_HEIGHT - LAUNCHER_HEIGHT + adjustSize(23), 'upheaval', this.launchCountdown, MID_FONT_SIZE);
        this.speechBubbleText.alpha = 0;
        this.speechBubbleText.anchor.set(0.5, 0.5);
    }

    createStage() {
        this.bubbles = this.add.physicsGroup(Phaser.Physics.ARCADE, this.world, "bubbles");
        this.round.clearSelection();

        for (let i = 0; i < this.round.matrix.length; i++) {
            for (let j = 0; j < this.round.matrix[i].length; j++) {
                let colorCode = this.round.matrix[i][j];
                if (colorCode === EntityMap.zero ||
                    colorCode === EntityMap.empty ||
                    colorCode === EntityMap.outOfBounds) continue;

                let { x, y } = this.round.getCoordinates(i, j);
                this.createBubble(x, y, colorCode, this.bubbles);
                if (colorCode !== EntityMap.gold &&
                    colorCode !== EntityMap.white &&
                    colorCode !== EntityMap.rainbow) {
                    this.round.addSelection(colorCode);
                }
            }
        }

        this.bubbles.setAll('body.immovable', true);
        this.bubbles.setAll('body.allowGravity', false);
    }

    createBubble(x, y, colorCode, group) {
        let bubble = null;

        if (colorCode === EntityMap.rainbow) {
            bubble = new Bubble(this.game, TILE_SIZE, x, y, colorCode, group, EntityMap.collision.rainbow.name, 0);
            bubble.width = TILE_SIZE;
            bubble.height = TILE_SIZE;
        } else {
            bubble = new Bubble(this.game, TILE_SIZE, x, y, colorCode, group);
        }

        // physics
        this.physics.enable(bubble, Phaser.Physics.ARCADE);
        bubble.body.setSize(BUBBLE_PHYSICS_SIZE, BUBBLE_PHYSICS_SIZE);
        bubble.body.bounce.set(1);

        return bubble;
    }

    createRandomBubble(x, y, group) {
        let randomColorCode = getRandomInteger(this.round.selection);
        let rainbowChance = Math.floor(Math.random() * 100);
        if (rainbowChance === 10) {
            randomColorCode = EntityMap.rainbow;
        }
        return this.createBubble(x, y, randomColorCode, group);
    }

    // add 'ready go' text before starting the game.
    // calls the startGame function after 'ready go' text disappears
    pregame(cb) {
        // create a one-off timers that autodestroys itself
        let pregameTimer1 = this.time.create(true);
        pregameTimer1.add(Phaser.Timer.SECOND * 1.5, () => {
            let pregameTimer2 = this.time.create(true);
            pregameTimer2.add(Phaser.Timer.SECOND * 1.5, cb, this);
            pregameTimer2.start();
            this.status.header.setText(S_PLAY.GO);
        }, this);

        pregameTimer1.start();
    }

    // remove overlay, starts timer, setups stats, enable input
    startGame() {
        // close previous round & start a fresh one
        if (window.PlatformSDK) {
            PlatformSDK.endGame();
            PlatformSDK.startGame('BUBBLE_SHOOTER');
        }
        console.log('NOW PLAYING...');
        this.nowPlaying = true;
        this.status.removeAll(true);
        this.launchTimer = this.time.create(false);
        this.launchTimer.loop(Phaser.Timer.SECOND * 1, this.updateLaunchCountdown, this);
        this.launchTimer.start();

        this.gameTimer = this.time.create(false);
        this.gameTimer.loop(Phaser.Timer.SECOND * 1, () => { this.scoreKeeper.time++; }, this);
        this.gameTimer.start();
    }

    stopGame(result) {
        let win = result === 'WIN' || result === 'WINALL';
        this.nowPlaying = false;
        this.launchTimer.destroy();
        this.gameTimer.destroy();
        this.scoreKeeper.calculateFinalResult(win);
        let { score, time, bonus } = this.scoreKeeper;

        switch (result) {
            case 'WIN':
                this.win(score, time, bonus);
                break;
            case 'WINALL':
                this.winAll(score, time, bonus);
                break;
            case 'LOSE':
                this.lose(score, time, bonus);
                break;
            case 'GAMEOVER':
                this.gameover(score, time, bonus);
                this.game.data.player = null;
                break;
            default:
                this.win(score, time, bonus);
                break;
        }

        if (this.game.data.player) {
            this.updatePlayerStatus(score, time, bonus);
        }

        this.theme.stop();
        if (window.PlatformSDK) PlatformSDK.endGame();
    }

    win(score, time, bonus) {
        console.log('GAME OVER PLAYER WINS...');
        this.status = new Status(this.game,
            { fill: 0x00000 },
            { x: CENTER_X, y: CENTER_Y - adjustSize(100), font: (useBitmapFonts() ? 'upheaval' : null), message: S_PLAY.YOU_WIN, fontSize: HEADER_FONT_SIZE },
            {
                x: CENTER_X - adjustSize(92), y: CENTER_Y + adjustSize(5), font: (useBitmapFonts() ? 'upheaval' : null),
                fontSize: NAV_FONT_SIZE, distance: adjustSize(110), message: { score, time, bonus }
            }
        );

        const navFont = useBitmapFonts() ? 'upheaval' : undefined;
        this.navigation = new Navigation(this.game, [
            { name: S_PLAY.CONTINUE, stateName: 'play', font: navFont, fontSize: NAV_FONT_SIZE },
            { name: S_PLAY.QUIT, stateName: 'menu', font: navFont, fontSize: NAV_FONT_SIZE },
        ], CENTER_X, CENTER_Y + adjustSize(110), adjustSize(40));

        this.navigation.createPolnareff(CENTER_X - adjustSize(105), CENTER_Y + adjustSize(113), adjustSize(38));
        this.navigation.polnareff.width = adjustSize(36);
        this.navigation.polnareff.height = adjustSize(36);

        this.game.data.audio.gameWin.play();
        if (window.PlatformSDK) PlatformSDK.endGame();
        bsAddPoints(1, 'Bubble Shooter: group popped');
    }

    winAll(score, time, bonus) {
        console.log('GAME OVER PLAYER COMPLETED GAME...');
        this.status = new Status(this.game,
            { fill: 0x00000 },
            { x: CENTER_X, y: CENTER_Y - adjustSize(100), font: (useBitmapFonts() ? 'upheaval' : null), message: S_PLAY.CONGRATS, fontSize: HEADER_FONT_SIZE },
            {
                x: CENTER_X - adjustSize(92), y: CENTER_Y + adjustSize(5), font: (useBitmapFonts() ? 'upheaval' : null),
                fontSize: NAV_FONT_SIZE, distance: adjustSize(110), message: { score, time, bonus }
            }
        );

        const navFont = useBitmapFonts() ? 'upheaval' : undefined;
        this.navigation = new Navigation(this.game, [
            { name: S_PLAY.CONTINUE, stateName: 'menu', font: navFont, fontSize: NAV_FONT_SIZE }
        ], CENTER_X, CENTER_Y + adjustSize(110), adjustSize(40));

        this.navigation.createPolnareff(CENTER_X - adjustSize(105), CENTER_Y + adjustSize(113), adjustSize(38));
        this.navigation.polnareff.width = adjustSize(36);
        this.navigation.polnareff.height = adjustSize(36);

        this.game.data.audio.gameWin.play();
        bsAddPoints(1, 'Bubble Shooter: group popped');
    }

    lose(score, time, bonus) {
        console.log('GAME OVER PLAYER LOSES...');
        this.status = new Status(this.game,
            { fill: 0x00000 },
            { x: CENTER_X, y: CENTER_Y - adjustSize(100), font: (useBitmapFonts() ? 'upheaval' : null), message: S_PLAY.YOU_LOSE, fontSize: HEADER_FONT_SIZE },
            {
                x: CENTER_X - adjustSize(92), y: CENTER_Y + adjustSize(5), font: (useBitmapFonts() ? 'upheaval' : null),
                fontSize: NAV_FONT_SIZE, distance: adjustSize(110), message: { score, time, bonus }
            }
        );

        const navFont = useBitmapFonts() ? 'upheaval' : undefined;
        this.navigation = new Navigation(this.game, [
            { name: S_PLAY.CONTINUE, stateName: 'play', font: navFont, fontSize: NAV_FONT_SIZE },
            { name: S_PLAY.QUIT, stateName: 'menu', font: navFont, fontSize: NAV_FONT_SIZE },
        ], CENTER_X, CENTER_Y + adjustSize(110), adjustSize(40));

        this.navigation.createPolnareff(CENTER_X - adjustSize(105), CENTER_Y + adjustSize(113), adjustSize(38));
        this.navigation.polnareff.width = adjustSize(36);
        this.navigation.polnareff.height = adjustSize(36);

        this.game.data.audio.gameLose.play();
        if (window.PlatformSDK) PlatformSDK.endGame();
    }

    // no more credits
    gameover(score, time, bonus) {
        console.log('GAME OVER PLAYER LOSES NO MORE CREDITS...');
        this.status = new Status(this.game,
            { fill: 0x00000 },
            { x: CENTER_X, y: CENTER_Y - adjustSize(100), font: (useBitmapFonts() ? 'upheaval' : null), message: S_PLAY.GAME_OVER, fontSize: HEADER_FONT_SIZE },
            {
                x: CENTER_X - adjustSize(92), y: CENTER_Y + adjustSize(5), font: (useBitmapFonts() ? 'upheaval' : null),
                fontSize: NAV_FONT_SIZE, distance: adjustSize(110), message: { score, time, bonus }
            }
        );

        const navFont = useBitmapFonts() ? 'upheaval' : undefined;
        this.navigation = new Navigation(this.game, [
            { name: S_PLAY.MAIN_MENU, stateName: 'menu', font: navFont, fontSize: NAV_FONT_SIZE }
        ], CENTER_X, CENTER_Y + adjustSize(110), adjustSize(40));

        this.navigation.createPolnareff(CENTER_X - adjustSize(105), CENTER_Y + adjustSize(113), adjustSize(38));
        this.navigation.polnareff.width = adjustSize(36);
        this.navigation.polnareff.height = adjustSize(36);

        this.game.data.audio.gameLose.play();
        if (window.PlatformSDK) PlatformSDK.endGame();
    }

    updatePlayerStatus(score, time, bonus) {
        if (score > 0) {
            this.game.data.player.totalScore += bonus;

            if (this.game.data.player.totalScore >= MAX_SCORE) {
                this.game.data.player.totalScore = MAX_SCORE;
            }

            // TODO: only applicable if we are going to store results to db
            if (this.game.data.player.highScore < this.game.data.player.totalScore) {
                this.game.data.player.highScore = this.game.data.player.totalScore;
            }

            if (this.game.data.player.currentRound === TOTAL_ROUNDS) {
                if (!this.game.data.player.gameCompleted) {
                    this.game.data.player.gameCompleted = true;
                }

                this.game.data.player.currentRound = 1;
            } else {
                this.game.data.player.currentRound++;
            }
        } else {
            // this.game.data.player.totalScore = 0;
            this.game.data.player.credits--;
        }

        this.totalScoreText.setText(appendDigits(14, this.game.data.player.totalScore, S_PLAY.TOTAL));
        this.game.data.player.save();
        console.log('PLAYER STATUS UPDATE ', Player.getExistingPlayer());
    }

    changeCurrentNavigation(e) {
        if (!this.nowPlaying && this.navigation) {
            if (e.keyCode === this.game.keyDown.keyCode) {
                this.navigation.changeCurrentNavigation(1);
            }

            if (e.keyCode === this.game.keyUp.keyCode) {
                this.navigation.changeCurrentNavigation(-1);
            }
            this.game.data.audio.switchNavigation.play();
        }
    }

    changeState(e) {
        if (!this.nowPlaying && this.navigation) {
            let currentIndex = this.navigation.currentIndex;
            let state = this.navigation.children[currentIndex].stateName;
            this.navigation.tweenNavigation(currentIndex, () => this.state.start(state, true, false, 'play'));
            this.game.data.audio.selectNavigation.play();
        }
    }

    launchBubble() {
        if (this.nowPlaying && !this.bubbleLaunched) {
            console.log('LAUNCH BUBBLE... RESETTING COUNTDOWN ', this.launchCountdown);
            this.launchCountdown = LAUNCH_COUNTDOWN;
            this.physics.arcade.velocityFromAngle(
                // https://phaser.io/docs/2.4.4/Phaser.Physics.Arcade.html#velocityFromRotation
                // need to subtract 90 to get the coordinates adjusted
                this.arrow.angle - 90, adjustSize(400), this.currentBubble.body.velocity);

            this.game.data.audio.launchBubble.play();
            this.bubbleLaunched = true;
        }
    }

    // game loop
    update() {
        if (this.nowPlaying) {
            this.updateCursorInput();
            this.updateCollision();
        }
    }

    updateLaunchCountdown() {
        if (this.launchCountdown <= Math.floor(LAUNCH_COUNTDOWN / 4)) {
            this.speechBubble.alpha = 1;
            this.speechBubbleText.alpha = 1;
            this.speechBubbleText.setText(this.launchCountdown);

            // TODO: use another soundfx
            this.game.data.audio.switchNavigation.play();

            if (this.launchCountdown === 0) {
                this.launchBubble();
            }
        } else {
            this.speechBubble.alpha = 0;
            this.speechBubbleText.alpha = 0;
        }

        this.launchCountdown--;
    }

    // handles angle of arrow
    updateCursorInput() {
        const leftHeld = this.game.keyLeft.isDown || this.btnLeftHeld;
        const rightHeld = this.game.keyRight.isDown || this.btnRightHeld;

        if (leftHeld) {
            if (this.arrow.angle >= -MAX_ARROW_RANGE) {
                this.arrow.angle -= adjustSize(1.2);
                this.launcherWheel.angle -= adjustSize(1.2);
            } else {
                this.arrow.angle = -MAX_ARROW_RANGE;
                this.launcherWheel.angle = -MAX_ARROW_RANGE;
            }
        } else if (rightHeld) {
            if (this.arrow.angle <= MAX_ARROW_RANGE) {
                this.arrow.angle += adjustSize(1.2);
                this.launcherWheel.angle += adjustSize(1.2);
            } else {
                this.arrow.angle = MAX_ARROW_RANGE;
                this.launcherWheel.angle = MAX_ARROW_RANGE;
            }
        }
    }

    // handles three types of collision against launched bubble
    updateCollision() {
        let blockCollision = this.physics.arcade.collide(
            this.currentBubble, this.blocks, () => {
                console.log('BLOCK COLLISION');
            }, null, this);

        let topBoundaryCollsion = this.physics.arcade.collide(
            this.currentBubble, this.topBoundary, () => {
                console.log('TOP BOUNDARY COLLISION');
            }, null, this);

        // NOTE: will need to research further.
        // ideally want the snapToGrid and updateTopBoundary methods within
        // the collision callback since it is unsure whether the cb is async
        let bubbles = {};
        let bubbleCollision = this.physics.arcade.collide(
            this.currentBubble, this.bubbles, (currentBubble, collidingBubble) => {
                console.log('BUBBLE COLLISION');
                bubbles.currentBubble = currentBubble;
                bubbles.collidingBubble = collidingBubble;
            }, null, this);

        if (topBoundaryCollsion || bubbleCollision) {
            this.snapToGrid(bubbles.currentBubble, bubbles.collidingBubble);
            this.updateTopBoundary();
            this.bubbleLaunched = false;
        }
    }

    // TODO: refactor
    // Finds indices of collision area
    // Snaps current bubble to collision area and reinitializes current and next bubbles
    // Removes any matches or floaters
    // Updates matrix, redraws stage
    // Check win lose status
    snapToGrid(currentBubble, collidingBubble) {
        let curx = this.currentBubble.x;
        let cury = this.currentBubble.y;
        let { i, j } = this.round.getIndices(curx, cury);
        console.log('INDICES FOUND i: ' + i + ' j: ' + j);

        if (i < 0) {
            console.log('NEGATIVE INDEX: adjusting i sign');
            i = 0;
        }

        if (j < 0) {
            console.log('NEGATIVE INDEX: adjusting j sign');
            j = 0;
        }

        if (this.round.matrix[i][j] === EntityMap.outOfBounds) {
            this.checkLose();
        } else {
            // adjustments for empty spaces
            if (this.round.matrix[i][j] === EntityMap.empty) {
                console.log('MATRIX EMPTY: adjusting j position');
                j -= 1;

                if (this.round.matrix[i][j] !== EntityMap.zero) {
                    console.log('MATRIX FILLED: adjusting i and j position');
                    i += 1;
                    j += 1;
                }
            }

            if (this.round.matrix[i][j] === EntityMap.zero) {
                let { x, y } = this.round.getCoordinates(i, j);
                console.log('SNAPING TO x: ' + x + ' y: ' + y + ' i: ' + i + ' j: ' + j);

                let currentColor = this.currentBubble.data.colorCode;
                let newBubble = this.createBubble(x, y, currentColor, this.bubbles);
                this.round.matrix[i][j] = currentColor;
                newBubble.body.immovable = true;
                newBubble.body.allowGravity = false;

                this.currentBubble.body.velocity.x = 0;
                this.currentBubble.body.velocity.y = 0;
                this.currentBubble.destroy();

                this.currentBubble = this.nextBubble;
                this.currentBubble.x = CURRENT_BUBBLE_X;
                this.currentBubble.y = CURRENT_BUBBLE_Y;
                this.nextBubble = this.createRandomBubble(NEXT_BUBBLE_X, NEXT_BUBBLE_Y);

                if (this.removeMatchingBubbles(i, j, currentBubble, collidingBubble)) {
                    this.bubbles.destroy();
                    this.createStage();
                    this.updateScore(currentColor);

                    console.log('REMAINING BUBBLES...', this.bubbles);
                    this.checkWin();
                }
            }
        }
    }

    // remove bubbles connected to target
    // identify floating bubbles
    // partition by colorCode
    removeMatchingBubbles(i, j, currentBubble, collidingBubble) {
        if ((currentBubble || collidingBubble) && (currentBubble.key || collidingBubble.key)) {
            return this.handleSpecialCollision(i, j, currentBubble, collidingBubble);
        } else {
            return this.handleDefaultCollision(i, j);
        }
    }

    handleSpecialCollision(curI, curJ, currentBubble, collidingBubble) {
        // TODO: refactor if other special collision are to be included
        // will only add the rainbow collision for now
        if (currentBubble.key === EntityMap.collision.rainbow.name || collidingBubble.key === EntityMap.collision.rainbow.name) {
            // set the targetColor and rainbow at x,y to 0
            // remove floaters
            let targetColor = null;
            let collidingBubbleIndices = this.round.getIndices(collidingBubble.x, collidingBubble.y);
            let collidingBubbleI = collidingBubbleIndices.i;
            let collidingBubbleJ = collidingBubbleIndices.j;

            if (currentBubble.key) {
                targetColor = this.round.matrix[collidingBubbleI][collidingBubbleJ];
                this.scoreKeeper.add(this.round.matrix[curI][curJ], curI, curJ);
                this.round.matrix[curI][curJ] = EntityMap.zero;
            } else {
                targetColor = this.round.matrix[curI][curJ];
                this.scoreKeeper.add(this.round.matrix[collidingBubbleI][collidingBubbleJ], collidingBubbleI, collidingBubbleJ);
                this.round.matrix[collidingBubbleI][collidingBubbleJ] = EntityMap.zero;
            }

            for (let i = 0; i < this.round.matrix.length; i++) {
                for (let j = 0; j < this.round.matrix[i].length; j++) {
                    if (this.round.matrix[i][j] === targetColor) {
                        this.scoreKeeper.add(this.round.matrix[i][j], i, j);
                        this.round.matrix[i][j] = EntityMap.zero;
                    }
                }
            }

            this.removeFloatingBubbles();
            return true;
        } else {
            return false;
        }
    }

    handleDefaultCollision(i, j) {
        // start from the currentBubble indices
        let targetColor = this.round.matrix[i][j];
        let target = this.round.getBubbleHash(i, j);
        let matches = new Set();
        let queue = [target];

        while (queue.length) {
            let current = queue.shift();
            matches.add(current);
            let { indices } = this.round.fromBubbleHash(current);
            let neighbors = this.getNeighbors(indices.i, indices.j);

            neighbors.forEach(hash => {
                let { colorCode } = this.round.fromBubbleHash(hash);
                if (colorCode === targetColor && !matches.has(hash)) {
                    queue.push(hash);
                }
            });
        }

        if (matches.size > 2) {
            console.log('MATCH DETECTED REMOVING BUBBLES...');

            matches.forEach(hash => {
                let { indices, colorCode } = this.round.fromBubbleHash(hash);
                let { i, j } = indices;
                this.scoreKeeper.add(colorCode, i, j);
                this.round.matrix[i][j] = EntityMap.zero;
            });

            this.removeFloatingBubbles();
            return true;
        } else {
            return false;
        }
    }

    // Identifies all clusters attached to the top row of matrix
    // Otherwise they are removed from the matrix
    removeFloatingBubbles() {
        let topRow = this.round.matrix[this.round.topRow];
        let memo = new Set();
        let hasFloats = false;

        topRow.forEach((el, j) => {
            if (this.round.isBubble(this.round.topRow, j)) {
                this.floodFill(this.round.topRow, j, memo);
            }
        });

        console.log('REMOVING POTENTIAL FLOATING BUBBLES... ', memo);

        for (let i = 0; i < this.round.matrix.length; i++) {
            for (let j = 0; j < this.round.matrix[i].length; j++) {
                let hash = this.round.getBubbleHash(i, j);
                if (this.round.isBubble(i, j) && !memo.has(hash)) {
                    this.scoreKeeper.add(this.round.matrix[i][j], i, j);
                    this.round.matrix[i][j] = EntityMap.zero;
                    hasFloats = true;
                }
            }
        }

        if (hasFloats) {
            this.game.data.audio.nonTargetBubble.play();
        } else {
            this.game.data.audio.targetBubble.play();
        }
    }

    // recursively checks each neighbor
    // if neighbors exists they are added to the cluster
    // using a memoization to prevent long runtime
    floodFill(i, j, memo) {
        memo.add(this.round.getBubbleHash(i, j));

        let neighbors = this.getNeighbors(i, j).filter(hash => !memo.has(hash));

        if (neighbors.length) {
            neighbors.forEach(hash => {
                let { indices } = this.round.fromBubbleHash(hash);
                this.floodFill(indices.i, indices.j, memo);
            });
        }
    }

    // return array of adjacent bubbles
    getNeighbors(i, j) {
        // bubble {i, j, points, type, visited}
        let neighbors = [];

        // left
        if (this.round.isBubble(i, j - 1)) {
            neighbors.push(this.round.getBubbleHash(i, j - 1));
        }

        // right
        if (this.round.isBubble(i, j + 1)) {
            neighbors.push(this.round.getBubbleHash(i, j + 1));
        }

        if (this.round.isSmallRow(i)) {
            // top left
            if (this.round.isBubble(i - 1, j)) {
                neighbors.push(this.round.getBubbleHash(i - 1, j));
            }
            // top right
            if (this.round.isBubble(i - 1, j + 1)) {
                neighbors.push(this.round.getBubbleHash(i - 1, j + 1));
            }
            // bottom left
            if (this.round.isBubble(i + 1, j)) {
                neighbors.push(this.round.getBubbleHash(i + 1, j));
            }
            // bottom right
            if (this.round.isBubble(i + 1, j + 1)) {
                neighbors.push(this.round.getBubbleHash(i + 1, j + 1));
            }
        } else {
            // top left
            if (this.round.isBubble(i - 1, j - 1)) {
                neighbors.push(this.round.getBubbleHash(i - 1, j - 1));
            }
            // top right
            if (this.round.isBubble(i - 1, j)) {
                neighbors.push(this.round.getBubbleHash(i - 1, j));
            }
            // bottom left
            if (this.round.isBubble(i + 1, j - 1)) {
                neighbors.push(this.round.getBubbleHash(i + 1, j - 1));
            }
            // bottom right
            if (this.round.isBubble(i + 1, j)) {
                neighbors.push(this.round.getBubbleHash(i + 1, j));
            }
        }
        return neighbors;
    }

    updateTopBoundary() {
        if (this.nowPlaying) {
            if (this.topBoundaryLaunchLimit === 0) {
                let isValid = this.round.shiftTopBoundary();

                console.log('SHIFTING TOP BOUNDARY... RESETTING LIMIT');
                this.bubbles.destroy();
                this.createStage();
                this.topBoundary.y += TILE_SIZE;
                this.topBoundaryLaunchLimit = TOP_BOUNDARY_LAUNCH_LIMIT;

                if (!isValid) this.checkLose();
            } else {
                console.log('LAUNCH LIMIT ', this.topBoundaryLaunchLimit);
                this.topBoundaryLaunchLimit--;
            }
        }
    }

    updateScore(currentColor) {
        console.log('UPDATING SCORE');

        this.scoreKeeper.calculate(currentColor);

        // animate scores
        this.scoreKeeper.mergeMap.forEach((bubble, idx) => {
            let { i, j, score } = bubble;
            let { x, y } = this.round.getCoordinates(i, j);

            let scoreText = this.add.bitmapText(x, y, 'upheaval', score, MID_FONT_SIZE);
            scoreText.anchor.set(0.5, 0.5);

            let scoreTween = this.add.tween(scoreText)
                .to({ alpha: 0, y: y - 10 }, 600, Phaser.Easing.Linear.None, true, 0);

            scoreTween.onComplete.add(() => scoreText.destroy(), this);
        });

        this.game.data.player.totalScore += this.scoreKeeper.currentScore;
        this.totalScoreText.setText(appendDigits(14, this.game.data.player.totalScore, S_PLAY.TOTAL));
        this.scoreKeeper.refreshMaps();
    }

    checkLose() {
        if (this.game.data.player.credits === 0) {
            this.stopGame('GAMEOVER');
        } else {
            this.stopGame('LOSE');
        }
    }

    checkWin() {
        if (!this.bubbles.length ||
            this.bubbles.children.every(bubble => bubble.data.colorCode === EntityMap.gold)) {
            if (this.game.data.player.currentRound === TOTAL_ROUNDS) {
                this.stopGame('WINALL');
                if (window.PlatformSDK) PlatformSDK.endGame();
            } else {
                this.stopGame('WIN');
                if (window.PlatformSDK) PlatformSDK.endGame();
            }
        }
    }

    shutdown() {
        this.game.keySpace.onDown.remove(this.launchBubble, this);
        this.game.keyEnter.onDown.remove(this.changeState, this);
        this.game.keyDown.onDown.remove(this.changeCurrentNavigation, this);
        this.game.keyUp.onDown.remove(this.changeCurrentNavigation, this);
        // hide controls when leaving Play
        this.disableControls && this.disableControls();
        if (window.PlatformSDK) PlatformSDK.endGame();
    }
};