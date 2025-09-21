/* 
    Pseudo state that displays user stats
 */
// === i18n & helpers for Status ===
(function () {
    if (!window.__LANG) {
        var KEY = 'portal.lang';
        var m = (location.search.match(/[?&]lang=(en|fr|zh)\b/) || [])[1];
        var saved = null; try { saved = localStorage.getItem(KEY); } catch (e) { }
        var lang = m || saved || (document.documentElement && document.documentElement.getAttribute('lang')) || 'en';
        window.__LANG = (lang === 'fr' || lang === 'zh') ? lang : 'en';
        try { localStorage.setItem(KEY, window.__LANG); } catch (e) { }
    }
    if (!window.__STR_STATUS) {
        window.__STR_STATUS = {
            en: { TIME: 'TIME', SCORE: 'SCORE', BONUS: 'BONUS' },
            fr: { TIME: 'TEMPS', SCORE: 'SCORE', BONUS: 'BONUS' },
            zh: { TIME: '时间', SCORE: '得分', BONUS: '奖励' }
        };
    }
})();
function __useBitmapFonts() { return window.__LANG !== 'zh'; }
function __uiTextStyle(px, align) {
    return {
        font: (px || 28) + 'px "Noto Sans SC","Microsoft YaHei",Arial,sans-serif',
        fill: '#fff', align: align || 'center', stroke: '#000', strokeThickness: 4
    };
}
const __S_STATUS = (window.__STR_STATUS && window.__STR_STATUS[window.__LANG]) || window.__STR_STATUS.en;

window.Status = class Status extends Phaser.Group {
    constructor(game, overlayConfig, headerConfig, statsConfig) {
        super(game);
        this.overlay = null;
        this.header = null;
        this.stats = [];
        this.createStatus(overlayConfig, headerConfig, statsConfig);
    }

    createStatus(overlayConfig, headerConfig, statsConfig) {
        if (overlayConfig) this.overlay = this.createOverlay(overlayConfig);
        if (headerConfig) this.header = this.createHeader(headerConfig);
        if (statsConfig) this.stats = this.createStats(statsConfig);
    }

    createOverlay(overlay) {
        if (this.overlay) this.remove(this.overlay);

        let { fill } = overlay;
        let graphic = new Phaser.Graphics(this.game, 0, 0);
        graphic.beginFill(fill);
        graphic.drawRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        graphic.alpha = 0.3;
        return this.add(graphic);
    }

    createHeader(header) {
        if (this.header) this.remove(this.header);

        let { x, y, font, message, fontSize } = header;
        let text;
        if (font && __useBitmapFonts()) {
            text = new Phaser.BitmapText(this.game, x, y, font, message, fontSize);
        } else {
            text = this.game.add.text(x, y, message, __uiTextStyle(fontSize, 'center'));
        }
        text.anchor.set(0.5, 0.5);
        return this.add(text);
    }

    createStats(stats) {
        if (this.stats.length) {
            this.stats.forEach((stat) => { this.remove(stat); });
        }

        let { x, y, font, message, fontSize, distance } = stats;
        let { time, score, bonus } = message;

        const propsStr = __S_STATUS.TIME + '\n' + __S_STATUS.SCORE + '\n' + __S_STATUS.BONUS;
        const valuesStr = time + '\n' + score + '\n' + bonus;

        let props, values;
        if (font && __useBitmapFonts()) {
            props = new Phaser.BitmapText(this.game, x, y, font, propsStr, fontSize);
            values = new Phaser.BitmapText(this.game, x + distance, y, font, valuesStr, fontSize);
        } else {
            props = this.game.add.text(x, y, propsStr, __uiTextStyle(fontSize, 'left'));
            values = this.game.add.text(x + distance, y, valuesStr, __uiTextStyle(fontSize, 'left'));
        }

        props.anchor.set(0, 0.5);
        values.anchor.set(0, 0.5);
        return this.addMultiple([props, values]);
    }
};