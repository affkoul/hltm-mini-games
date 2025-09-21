// images and fonts will be served from express static since there are no
// webpack loaders available for the fnt extension
// No bundler => use direct relative paths that exist on your server
const image = './bubble_shooter_assets/images/';
const font = './bubble_shooter_assets/fonts/';
// const wav = './bubble_shooter_assets/audio/wav/';
const mp3 = './bubble_shooter_assets/audio/mp3/';
const ogg = './bubble_shooter_assets/audio/ogg/';

// === i18n singletons used by preloader ===
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
    if (!window.__I18N_LOAD) {
        window.__I18N_LOAD = {
            en: { loading: 'LOADING...', soundToggle: 'Toggle sound', soundOn: 'Sound: On', soundOff: 'Sound: Off', github: 'View source on GitHub', launching: 'LAUNCHING GAME ' },
            fr: { loading: 'CHARGEMENT…', soundToggle: 'Basculer le son', soundOn: 'Son : Activé', soundOff: 'Son : Coupé', github: 'Voir la source sur GitHub', launching: 'LANCEMENT DU JEU ' },
            zh: { loading: '加载中…', soundToggle: '切换声音', soundOn: '声音：开', soundOff: '声音：关', github: '在 GitHub 查看源码', launching: '启动游戏 ' }
        };
    }
})();

/*
    Loads all sprite, audio, and fonts. Enable arcade physics
 */
window.Load = class Load extends Phaser.State {
    preload() {
        // Preload text - show this if it takes a while for assets to load
        let loadTimer = this.time.create(true);
        loadTimer.add(
            Phaser.Timer.SECOND * 1.5,
            () => {
                // SAFE
                var cv = (this.game && this.game.canvas) || document.querySelector('canvas');
                if (cv) cv.style.opacity = 1;

                var gh = document.getElementById('github');
                if (gh) gh.style.opacity = 1;

                var snd = document.getElementById('sound');
                if (snd) snd.style.opacity = 1;

                const S = window.__I18N_LOAD[window.__LANG] || window.__I18N_LOAD.en;

                if (gh) gh.title = (S.github || '');
                if (snd) { snd.title = S.soundToggle; snd.setAttribute('aria-label', S.soundToggle); }

                let loadingText = this.add.text(CENTER_X, CENTER_Y, S.loading, {
                    font: '40px monospace',
                    fill: 'yellow',
                    align: 'center',
                    strokeThickness: 5
                });

                loadingText.anchor.set(0.5);
                loadingText.alpha = 0;

                let loadingTween = this.add.tween(loadingText).to({ alpha: 1 }, 500, 'Linear', true, 0, -1);

                loadingTween.yoyo(true, 300);
            },
            this
        );
        loadTimer.start();

        // load image sprites
        this.load.image('tile-1', image + 'tile-sm-1.png');
        this.load.image('tile-2', image + 'tile-sm-2.png');
        this.load.image('tile-3', image + 'tile-sm-3.png');
        this.load.image('cloud-1', image + 'cloud-md-1.png');
        this.load.image('arrow-1', image + 'arrow-sm-1.png');
        this.load.image('block-1', image + 'block-sm-1.png');
        this.load.image('launcher-platform-1', image + 'launcher-platform-md-1.png');
        this.load.image('launcher-wheel-1', image + 'launcher-wheel-sm-1.png');
        this.load.image('speech-bubble-1', image + 'speech-bubble-sm-1.png');
        this.load.image('rainbow-1', image + 'rainbow-sm-1.png');

        // polnareff spritesheet
        // key, url, frameWidth, frameHeight, frameMax, margin, spacing
        this.load.spritesheet('polnareff-1', image + 'polnareff-sp-1.png', 60, 60, 2, 0, 0);

        // load fonts
        this.load.bitmapFont('happy-hell', font + 'happy-hell/medium/font.png', font + 'happy-hell/medium/font.fnt');
        this.load.bitmapFont('upheaval', font + 'upheaval/font.png', font + 'upheaval/font.fnt');

        // load audio (wav, mp3, ogg)
        this.load.audio('theme-0', [mp3 + 'theme-0.mp3', ogg + 'theme-0.ogg']);
        this.load.audio('theme-1', [mp3 + 'theme-1.mp3', ogg + 'theme-1.ogg']);
        this.load.audio('theme-2', [mp3 + 'theme-2.mp3', ogg + 'theme-2.ogg']);
        this.load.audio('game-win', [mp3 + 'game-win.mp3', ogg + 'game-win.ogg']);
        this.load.audio('game-lose', [mp3 + 'game-lose.mp3', ogg + 'game-lose.ogg']);
        this.load.audio('launch-bubble', [mp3 + 'launch-bubble.mp3', ogg + 'launch-bubble.ogg']);
        this.load.audio('target-bubble', [mp3 + 'target-bubble.mp3', ogg + 'target-bubble.ogg']);
        this.load.audio('non-target-bubble', [mp3 + 'non-target-bubble.mp3', ogg + 'non-target-bubble.ogg']);
        this.load.audio('select-navigation', [mp3 + 'select-navigation.mp3', ogg + 'select-navigation.ogg']);
        this.load.audio('switch-navigation', [
            ogg + 'switch-navigation.ogg',
            // fails to decode for firefox - (Error: The buffer passed to decodeAudioData contains invalid content which cannot be decoded successfully.)
            mp3 + 'switch-navigation.mp3'
        ]);

        // register keys. registering through the game object so each state can have access
        this.game.keyLeft = this.game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
        this.game.keyRight = this.game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
        this.game.keyUp = this.game.input.keyboard.addKey(Phaser.Keyboard.UP);
        this.game.keyDown = this.game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
        this.game.keySpace = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);
        this.game.keyEnter = this.game.input.keyboard.addKey(Phaser.Keyboard.ENTER);

        // prevent key event propagating up to the browser
        this.input.keyboard.addKeyCapture([
            Phaser.Keyboard.LEFT,
            Phaser.Keyboard.RIGHT,
            Phaser.Keyboard.UP,
            Phaser.Keyboard.DOWN,
            Phaser.Keyboard.SPACEBAR,
            Phaser.Keyboard.ENTER
        ]);
    }

    create() {
        // Canvas
        var cv = (this.game && this.game.canvas) || document.querySelector('canvas');
        if (cv && cv.style) cv.style.opacity = 1;

        // GitHub ribbon (optional)
        var gh = document.getElementById('github');
        if (gh && gh.style) gh.style.opacity = 1;

        // Sound button (optional)
        var snd = document.getElementById('sound');
        if (snd && snd.style) snd.style.opacity = 1;

        // adding data object to prevent overwriting phaser props
        this.game.data = {};

        this.game.data.lang = window.__LANG;
        this.game.data.i18n = window.__I18N_LOAD; // share the strings table;   // (optional) share strings table if you want

        // namespace audio
        this.game.data.audio = {};
        this.game.data.audio.theme0 = this.game.add.audio('theme-0');
        this.game.data.audio.theme1 = this.game.add.audio('theme-1');
        this.game.data.audio.theme2 = this.game.add.audio('theme-2');
        this.game.data.audio.gameWin = this.game.add.audio('game-win');
        this.game.data.audio.gameLose = this.game.add.audio('game-lose');
        this.game.data.audio.launchBubble = this.game.add.audio('launch-bubble');
        this.game.data.audio.targetBubble = this.game.add.audio('target-bubble');
        this.game.data.audio.nonTargetBubble = this.game.add.audio('non-target-bubble');
        this.game.data.audio.selectNavigation = this.game.add.audio('select-navigation');
        this.game.data.audio.switchNavigation = this.game.add.audio('switch-navigation');

        // load continuing user if they exist
        let player = Player.getExistingPlayer();
        if (player) {
            let { name, credits, totalScore, highScore, currentRound, gameCompleted } = player;
            this.game.data.player = new Player(name, credits, totalScore, highScore, currentRound, gameCompleted);
        } else {
            this.game.data.player = null;
        }

        // enable physics
        this.physics.startSystem(Phaser.Physics.ARCADE);
        // ----- SCALE / RESIZE SETUP -----
        var sc = this.game.scale;

        sc.scaleMode = Phaser.ScaleManager.SHOW_ALL;   // keep aspect, letterbox
        sc.pageAlignHorizontally = true;
        sc.pageAlignVertically = true;

        // Let the canvas shrink on mobile but not explode
        sc.setMinMax(320, 240, CANVAS_WIDTH, CANVAS_HEIGHT);
        sc.refresh();

        // Re-place the on-screen controls whenever Phaser rescales
        if (typeof sc.setResizeCallback === 'function') {
            sc.setResizeCallback(function () {
                if (typeof positionControlsNearCanvas === 'function') {
                    positionControlsNearCanvas();
                }
            }, this);
        }
        // --------------------------------
        // change start
        this.state.start('menu');
        // One more sync after first state switch (covers very slow devices)
        if (this.game && this.game.scale) this.game.scale.refresh();
        // initialize sounds
        this.game.data.audio.theme0.play(null, 0, 1, true);
        this.toggleSound();

        const S = window.__I18N_LOAD[window.__LANG] || window.__I18N_LOAD.en;
        console.log(S.launching, this.game);
    }

    // https://github.com/photonstorm/phaser/issues/2913
    toggleSound() {
        const soundElement = document.getElementById('sound');
        const SL = window.__I18N_LOAD[window.__LANG] || window.__I18N_LOAD.en;

        // If #sound isn’t present, don’t touch DOM styles; still set mute state so audio won’t error
        if (!soundElement) {
            // Safe defaults without UI
            this.game.data.audio.theme0.onPlay.addOnce(() => {
                if (this.game.sound.context.state === 'suspended') {
                    this.game.sound.context.suspend().then(() => {
                        this.game.sound.mute = true;
                    });
                } else {
                    this.game.sound.context.resume().then(() => {
                        this.game.sound.mute = false;
                    });
                }
            });
            return;
        }

        this.game.data.audio.theme0.onPlay.addOnce(() => {
            if (this.game.sound.context.state === 'suspended') {
                this.game.sound.context.suspend().then(() => {
                    this.game.sound.mute = true;
                    soundElement.style.backgroundImage = "url('" + image + "volume-mute.svg')";
                    soundElement.title = SL.soundOff;
                    soundElement.setAttribute('aria-label', SL.soundOff);
                    soundElement.setAttribute('aria-pressed', 'true'); // pressed = muted
                });
            } else {
                this.game.sound.context.resume().then(() => {
                    this.game.sound.mute = false;
                    soundElement.style.backgroundImage = "url('" + image + "volume-medium.svg')";
                    soundElement.title = SL.soundOn;
                    soundElement.setAttribute('aria-label', SL.soundOn);
                    soundElement.setAttribute('aria-pressed', 'false');
                });
            }
        });

        soundElement.addEventListener('click', () => {
            this.game.sound.context.resume().then(() => {
                if (this.game.sound.mute) {
                    this.game.sound.mute = false;
                    soundElement.style.backgroundImage = "url('" + image + "volume-medium.svg')";
                    soundElement.title = SL.soundOn;
                    soundElement.setAttribute('aria-label', SL.soundOn);
                    soundElement.setAttribute('aria-pressed', 'false');
                } else {
                    this.game.sound.mute = true;
                    soundElement.style.backgroundImage = "url('" + image + "volume-mute.svg')";
                    soundElement.title = SL.soundOff;
                    soundElement.setAttribute('aria-label', SL.soundOff);
                    soundElement.setAttribute('aria-pressed', 'true');
                }
            });
        });
    }
};