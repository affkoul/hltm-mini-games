let selectedNum = null;
let selectedTile = null;
let errors = 0;
let board = [];
let solution = [];
let notesMode = false;
let difficulty = 'beginner';
let timer = null;
let seconds = 0;
let gameActive = true;
let tileNotes = {};

let completedRows = new Set();
let completedCols = new Set();
let completedBoxes = new Set();

const difficultyLevels = {
    'beginner': 26,
    'easy': 38,
    'normal': 44,
    'hard': 58,
    'expert': 68
};

// ================== SndSudoku (lives in sudoku.js) ==================
window.SndSudoku = (() => {
    let ctx = null;
    let muted = JSON.parse(localStorage.getItem('sudoku.muted') || 'false');
    let btn = null;

    const LABELS = {
        en: ['Sound: On', 'Sound: Off'],
        fr: ['Son : Activé', 'Son : Coupé'],
        zh: ['声音：开', '声音：关']
    };
    const lang = () => document.documentElement.getAttribute('lang') || 'en';
    const label = () => (LABELS[lang()] || LABELS.en)[muted ? 1 : 0];

    function createCtx() {
        if (!ctx) {
            try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
            catch (e) { /* audio not available */ }
        }
        return ctx;
    }
    async function ready() {
        const c = createCtx();
        if (!c) return null;
        if (c.state !== 'running') {
            try { await c.resume(); } catch (e) { }
        }
        return c;
    }

    function tone({ f = 440, dur = 0.1, type = 'triangle', a = 0.01, v = 0.18 }) {
        if (muted) return;
        ready().then(c => {
            if (!c) return;
            const t = c.currentTime;
            const o = c.createOscillator();
            const g = c.createGain();
            o.type = type;
            o.frequency.setValueAtTime(f, t);
            g.gain.setValueAtTime(0, t);
            g.gain.linearRampToValueAtTime(v, t + a);
            g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
            o.connect(g); g.connect(c.destination);
            o.start(t); o.stop(t + dur);
        });
    }

    const play = {
        select() { tone({ f: 420, dur: 0.07, type: 'sine', v: 0.14 }); },
        inputGood(n = 1) { tone({ f: 480 + n * 12, dur: 0.09, type: 'triangle', v: 0.20 }); },
        inputNote() { tone({ f: 360, dur: 0.07, type: 'sine', v: 0.14 }); },
        erase() { tone({ f: 300, dur: 0.06, type: 'sine', v: 0.14 }); },
        conflict() {
            if (muted) return;
            ready().then(c => {
                if (!c) return;
                const t = c.currentTime;
                const o = c.createOscillator(), g = c.createGain();
                o.type = 'sawtooth';
                o.frequency.setValueAtTime(360, t);
                o.frequency.exponentialRampToValueAtTime(150, t + 0.24);
                g.gain.setValueAtTime(0, t);
                g.gain.linearRampToValueAtTime(0.16, t + 0.01);
                g.gain.exponentialRampToValueAtTime(0.0001, t + 0.24);
                o.connect(g); g.connect(c.destination);
                o.start(t); o.stop(t + 0.26);
            });
        },
        completeSet() { [540, 640].forEach((f, i) => setTimeout(() => tone({ f, dur: 0.12, type: 'square', v: 0.18 }), i * 90)); },
        newGame() { [420, 560].forEach((f, i) => setTimeout(() => tone({ f, dur: 0.12, type: 'triangle', v: 0.18 }), i * 100)); },
        win() { [523, 659, 784, 988].forEach((f, i) => setTimeout(() => tone({ f, dur: 0.14, type: 'triangle', v: 0.20 }), i * 95)); }
    };

    function armUnlockers() {
        const once = { once: true, passive: true };
        const kick = () => { ready(); };
        ['pointerdown', 'click', 'keydown', 'touchstart', 'mousedown'].forEach(ev =>
            document.addEventListener(ev, kick, once)
        );
        document.addEventListener('visibilitychange', () => { if (!document.hidden) ready(); });
    }

    function mountButton() {
        if (btn) return btn;
        btn = document.createElement('button');
        btn.id = 'sound-btn';
        btn.className = 'gd-btn';
        btn.textContent = label();
        btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
        // match your button styling
        // btn.style.marginLeft = '8px';
        // btn.style.minWidth = '150px';

        btn.addEventListener('click', () => {
            muted = !muted;
            try { localStorage.setItem('sudoku.muted', JSON.stringify(muted)); } catch { }
            btn.textContent = label();
            btn.setAttribute('aria-pressed', muted ? 'true' : 'false');
            if (!muted) play.select(); // confirmation blip
        });

        const host = document.querySelector('.game-buttons') || document.body;
        host.appendChild(btn);

        armUnlockers();
        return btn;
    }

    return { play, mountButton, ready };
})();

function boxKey(r, c) { return `${Math.floor(r / 3)}-${Math.floor(c / 3)}`; }

function isRowComplete(r) {
    for (let c = 0; c < 9; c++) {
        const v = document.getElementById(r + "-" + c).querySelector('.tile-value').innerText;
        if (v === "" || v !== solution[r][c]) return false;
    }
    return true;
}
function isColComplete(c) {
    for (let r = 0; r < 9; r++) {
        const v = document.getElementById(r + "-" + c).querySelector('.tile-value').innerText;
        if (v === "" || v !== solution[r][c]) return false;
    }
    return true;
}
function isBoxComplete(r, c) {
    const rs = Math.floor(r / 3) * 3, cs = Math.floor(c / 3) * 3;
    for (let rr = rs; rr < rs + 3; rr++) {
        for (let cc = cs; cc < cs + 3; cc++) {
            const v = document.getElementById(rr + "-" + cc).querySelector('.tile-value').innerText;
            if (v === "" || v !== solution[rr][cc]) return false;
        }
    }
    return true;
}

// --- i18n helpers ---
function S() {
    // Fallbacks keep game usable even if table isn't present
    const en = {
        errors: 'Errors',
        time: 'Time',
        notesMode: 'Notes Mode',
        notesOn: 'Notes: On',
        notesOff: 'Notes: Off',
        congrats: 'Congratulations! You solved the puzzle!'
    };
    const tbl = (window.__SUDOKU_STR && (window.__SUDOKU_STR[window.__LANG] || window.__SUDOKU_STR.en)) || en;
    return Object.assign({}, en, tbl);
}

function uiSetErrors(n) {
    const el = document.getElementById('errors');
    if (el) el.textContent = S().errors + ': ' + n;
}

function uiSetTime(totalSeconds) {
    const el = document.getElementById('timer');
    if (el) el.textContent = S().time + ': ' + formatTime(totalSeconds);
}

function uiShowWin() {
    SudokuSDK.complete({ errors: totalErrorsSoFar });
    // Your existing “congrats” UI can stay as-is.
    const el = document.getElementById('message');
    if (el) {
        el.textContent = S().congrats;
        el.style.display = 'block';
    }
    if (window.SndSudoku) SndSudoku.play.win();
    if (window.PlatformSDK) PlatformSDK.endGame();
}

function uiResetNotesButton() {
    const btn = document.getElementById('notes-btn');
    if (!btn) return;
    // If you set data-label-on/off in HTML hydration, we’ll reuse them.
    const offLabel = btn.getAttribute('data-label-off') || S().notesMode || S().notesOff;
    btn.textContent = offLabel;
}

function uiToggleNotesButton(on) {
    const btn = document.getElementById('notes-btn');
    if (!btn) return;
    const onLabel = btn.getAttribute('data-label-on') || S().notesOn;
    const offLabel = btn.getAttribute('data-label-off') || S().notesOff || S().notesMode;
    btn.textContent = on ? onLabel : offLabel;
}

function generateSolution() {
    const sol = Array(9).fill().map(() => Array(9).fill(0));

    for (let box = 0; box < 9; box += 3) {
        fillBox(sol, box, box);
    }

    solveSudoku(sol);
    return sol.map(row => row.join(''));
}

function fillBox(grid, row, col) {
    const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    shuffle(nums);

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            grid[row + i][col + j] = nums.pop();
        }
    }
}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function isValid(grid, row, col, num) {

    for (let x = 0; x < 9; x++) {
        if (grid[row][x] === num) return false;
    }

    for (let x = 0; x < 9; x++) {
        if (grid[x][col] === num) return false;
    }

    const startRow = row - row % 3;
    const startCol = col - col % 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (grid[i + startRow][j + startCol] === num) return false;
        }
    }

    return true;
}

function solveSudoku(grid) {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                const nums = [1, 2, 3, 4, 5, 6, 7, 8, 9];
                shuffle(nums);

                for (let num of nums) {
                    if (isValid(grid, row, col, num)) {
                        grid[row][col] = num;

                        if (solveSudoku(grid)) {
                            return true;
                        }

                        grid[row][col] = 0;
                    }
                }

                return false;
            }
        }
    }

    return true;
}

function generatePuzzle(solution, difficultyLevel) {
    const puzzle = solution.map(row => row.split(''));
    let cellsToRemove = difficultyLevels[difficultyLevel];

    while (cellsToRemove > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);

        if (puzzle[row][col] !== '-') {
            puzzle[row][col] = '-';
            cellsToRemove--;
        }
    }

    return puzzle.map(row => row.join(''));
}

function initGame() {
    if (window.PlatformSDK) PlatformSDK.endGame();   // end previous session
    if (timer) {
        clearInterval(timer);
    }
    // clear containers so we don't duplicate tiles/digits on new game
    const boardEl = document.getElementById("board");
    const digitsEl = document.getElementById("digits");
    if (boardEl) boardEl.innerHTML = "";
    if (digitsEl) digitsEl.innerHTML = "";

    // reset progress trackers
    completedRows.clear();
    completedCols.clear();
    completedBoxes.clear();

    solution = generateSolution();
    board = generatePuzzle(solution, difficulty);
    errors = 0;
    seconds = 0;
    gameActive = true;
    tileNotes = {};

    uiSetErrors(errors);
    uiSetTime(seconds);
    document.getElementById("message").style.display = "none";

    uiResetNotesButton();

    timer = setInterval(updateTimer, 1000);

    // SFX: new game
    if (window.SndSudoku) SndSudoku.play.newGame();

    setGame();
    if (window.PlatformSDK) PlatformSDK.startGame('SUDOKU'); // start new session
    window.SudokuSDK.new(this.difficulty);   // currentDifficulty ∈ 'beginner'|'easy'|'normal'|'hard'|'expert'
}

function formatTime(totalSeconds) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function updateTimer() {
    if (gameActive) {
        seconds++;
        uiSetTime(seconds);
    }
}

function checkWin() {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const tile = document.getElementById(r + "-" + c);
            const value = tile.querySelector('.tile-value').innerText;
            if (value === "" || value !== solution[r][c]) {
                return false;
            }
        }
    }

    gameActive = false;
    clearInterval(timer);
    uiShowWin();
    return true;
}

window.onload = function () {
    // add this line first:
    SndSudoku.mountButton();

    document.getElementById("new-game-btn").addEventListener("click", initGame);
    document.getElementById("notes-btn").addEventListener("click", toggleNotesMode);

    document.querySelectorAll(".difficulty-btn").forEach(btn => {
        btn.addEventListener("click", function () {
            document.querySelectorAll(".difficulty-btn").forEach(b => b.classList.remove("active"));
            this.classList.add("active");

            difficulty = this.dataset.level;
            initGame();
        });
    });

    initGame();
};

function setGame() {
    document.getElementById("digits").innerHTML = "";

    for (let i = 1; i <= 9; i++) {
        let number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.addEventListener("click", selectNumber);
        number.classList.add("number");
        document.getElementById("digits").appendChild(number);
    }

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();

            let tileContent = document.createElement("div");
            tileContent.classList.add("tile-content");

            let tileValue = document.createElement("div");
            tileValue.classList.add("tile-value");

            let tileNotesContainer = document.createElement("div");
            tileNotesContainer.classList.add("tile-notes");

            for (let i = 1; i <= 9; i++) {
                let note = document.createElement("div");
                note.classList.add("note");
                note.dataset.note = i;
                tileNotesContainer.appendChild(note);
            }

            tileContent.appendChild(tileValue);
            tileContent.appendChild(tileNotesContainer);
            tile.appendChild(tileContent);

            if (board[r][c] !== "-") {
                tileValue.innerText = board[r][c];
                tile.classList.add("tile-start");
            }

            if (r % 3 === 0) tile.classList.add("border-top-bold");
            if (c % 3 === 0) tile.classList.add("border-left-bold");
            if (r === 8) tile.classList.add("border-bottom-bold");
            if (c === 8) tile.classList.add("border-right-bold");

            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").append(tile);
        }
    }
}

function selectNumber() {
    if (selectedNum != null) {
        selectedNum.classList.remove("number-selected");
    }
    selectedNum = this;
    selectedNum.classList.add("number-selected");
    clearInvalidHighlights();

    // SFX
    if (window.SndSudoku) SndSudoku.play.select();
}

function selectTile() {
    clearHighlights();

    if (selectedTile) {
        selectedTile.classList.remove("tile-selected");
    }

    this.classList.add("tile-selected");
    selectedTile = this;

    // SFX for focusing a tile
    if (window.SndSudoku) SndSudoku.play.select();

    let tileValue = this.querySelector('.tile-value').innerText;

    if (tileValue !== "") {
        highlightSameNumbers(tileValue);
    }

    if (tileValue !== "") {
        let coords = this.id.split("-");
        let r = parseInt(coords[0]);
        let c = parseInt(coords[1]);
        highlightInvalidPositions(r, c, tileValue);
    }

    // Notes mode: toggle a note, play note sound, then stop
    if (notesMode && selectedNum) {
        if (this.classList.contains("tile-start")) return;

        let [r, c] = this.id.split("-").map(Number);
        let tileId = r + "-" + c;
        if (!tileNotes[tileId]) tileNotes[tileId] = [];

        let noteValue = selectedNum.id;
        let noteElement = this.querySelector(`.note[data-note="${noteValue}"]`);

        if (tileNotes[tileId].includes(noteValue)) {
            tileNotes[tileId] = tileNotes[tileId].filter(n => n !== noteValue);
            noteElement.innerText = "";
        } else {
            tileNotes[tileId].push(noteValue);
            noteElement.innerText = noteValue;
        }

        // SFX: note toggled
        if (window.SndSudoku) SndSudoku.play.inputNote();
        return;
    }

    // Normal entry mode
    if (selectedNum) {
        if (this.classList.contains("tile-start")) return;

        let [r, c] = this.id.split("-").map(Number);
        let tileValueElement = this.querySelector('.tile-value');

        // clear notes if any
        let tileId = r + "-" + c;
        if (tileNotes[tileId]) {
            tileNotes[tileId] = [];
            this.querySelectorAll('.note').forEach(note => note.innerText = "");
        }

        if (solution[r][c] == selectedNum.id) {
            // Correct value
            tileValueElement.innerText = selectedNum.id;
            this.classList.add("tile-correct");

            // SFX: correct input (pitch varies with digit)
            if (window.SndSudoku) SndSudoku.play.inputGood(parseInt(selectedNum.id, 10));

            // Row/col/box completion chime (only first time each completes)
            let ding = false;
            if (isRowComplete(r) && !completedRows.has(r)) { completedRows.add(r); ding = true; }
            if (isColComplete(c) && !completedCols.has(c)) { completedCols.add(c); ding = true; }
            const bKey = boxKey(r, c);
            if (isBoxComplete(r, c) && !completedBoxes.has(bKey)) { completedBoxes.add(bKey); ding = true; }
            if (ding && window.SndSudoku) SndSudoku.play.completeSet();

            checkWin();
            window.SudokuSDK.correct();
        } else {
            // Incorrect value
            errors += 1;
            uiSetErrors(errors);
            if (window.SndSudoku) SndSudoku.play.conflict();
            window.SudokuSDK.error();
        }
    }
}

function toggleNotesMode() {
    SudokuSDK.note();
    notesMode = !notesMode;
    const btn = document.getElementById("notes-btn");
    if (btn) btn.classList.toggle("active");
    uiToggleNotesButton(notesMode);

    if (selectedNum) {
        selectedNum.classList.remove("number-selected");
        selectedNum = null;
    }
}

function clearHighlights() {
    document.querySelectorAll('.tile-invalid').forEach(tile => {
        tile.classList.remove('tile-invalid');
    });
    document.querySelectorAll('.tile-highlight').forEach(tile => {
        tile.classList.remove('tile-highlight');
    });
}

function clearInvalidHighlights() {
    document.querySelectorAll('.tile-invalid').forEach(tile => {
        tile.classList.remove('tile-invalid');
    });
}

function highlightSameNumbers(number) {
    document.querySelectorAll('.tile').forEach(tile => {
        let tileValue = tile.querySelector('.tile-value').innerText;
        if (tileValue === number) {
            tile.classList.add("tile-highlight");
        }
    });
}

function highlightInvalidPositions(row, col, num) {

    let boxRowStart = Math.floor(row / 3) * 3;
    let boxColStart = Math.floor(col / 3) * 3;

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (r === row && c === col) continue;

            if (r === row || c === col ||
                (r >= boxRowStart && r < boxRowStart + 3 &&
                    c >= boxColStart && c < boxColStart + 3)) {

                let tile = document.getElementById(r + "-" + c);
                let tileValue = tile.querySelector('.tile-value').innerText;
                if (tileValue === "" || tileValue !== num) {
                    tile.classList.add("tile-invalid");
                }
            }
        }
    }
}