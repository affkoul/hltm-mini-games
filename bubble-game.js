
window.Game = class Game extends Phaser.Game {
    constructor(width, height) {
        super({
            width,
            height,
            renderer: Phaser.AUTO,
            state: {
                create: () => {
                    this.state.add('load', Load);
                    this.state.add('menu', Menu);
                    this.state.add('play', Play);
                    this.state.add('tutorial', window.Tutorial);
                    this.state.start('load');
                }
            }
        });
    }
};
