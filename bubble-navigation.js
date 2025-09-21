/* 
    Reusable navigation component to be rendered in any Phaser state
*/
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

window.Navigation = class Navigation extends Phaser.Group {
    constructor(game, items, x, y, increment) {
        super(game);
        this.items = this.createItems(items, x, y, increment);
        this.currentIndex = 0;
        this.setAll('anchor.x', 0.5);
        this.setAll('anchor.y', 0.5);
    }

    createItems(items, x, y, increment) {
        return items.map((cur, idx) => {
            const { name, stateName, font, fontSize } = cur;
            const yy = y + (increment * idx);
            let item;

            if (useBitmapFonts() && font) {
                // EN/FR: bitmap font path
                item = new Phaser.BitmapText(this.game, x, yy, font, name, fontSize);
            } else {
                // ZH (or when font missing): system text path, MUST pass a real style object
                item = new Phaser.Text(this.game, x, yy, name, uiTextStyle(fontSize));
            }

            item.stateName = stateName;
            return this.add(item);
        });
    }

    createPolnareff(x, y, incrementY) {
        this.polnareffPosition = this.items.map((cur, idx) => {
            return idx === 0 ? y : y + (incrementY * idx);
        });

        this.polnareff = this.game.add.sprite(x, y, 'polnareff-1', 0);
        this.polnareff.anchor.set(0.5, 0.5);
        this.polnareff.animations.add('bounce', [0, 1], 2, true);
        this.polnareff.animations.play('bounce');
    }

    changeCurrentNavigation(increment) {
        if (increment > 0) {
            if (this.currentIndex < this.polnareffPosition.length - 1) {
                this.polnareff.y = this.polnareffPosition[++this.currentIndex];
            }
        } else if (increment < 0) {
            if (this.currentIndex > 0) {
                this.polnareff.y = this.polnareffPosition[--this.currentIndex];
            }
        }
    }

    // TODO: add params for tween args
    tweenNavigation(index, cb) {
        this.children[index].alpha = 0;

        let navigationTween = this.game.add.tween(this.children[index]).
            to({ alpha: 1 }, 100, "Linear", true, 0, 3);

        navigationTween.onComplete.add(cb, this.game);
    }
};