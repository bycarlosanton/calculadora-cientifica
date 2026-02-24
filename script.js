class ScientificCalculator {
    constructor() {
        this.display = document.getElementById('display');
        this.history = document.getElementById('history');
        this.memoryIndicator = document.getElementById('memoryIndicator');
        this.angleMode = document.getElementById('angleMode');
        this.angleIndicator = document.getElementById('angleIndicator');
        this.buttonContainer = document.getElementById('buttonContainer');

        this.expressionPretty = '0';
        this.memory = 0;
        this.isRadians = false; // DEG por defecto internamente
        this.currentMode = 'basic';
        this.shouldResetDisplay = false;

        // índice lógico del cursor en expressionPretty
        this.caretIndex = 1;

        this.init();
    }

    init() {
        // botón muestra la acción disponible: estás en DEG, puedes cambiar a RAD
        this.angleMode.textContent = 'RAD';
        // indicador muestra el modo actual: D = grados
        this.angleIndicator.textContent = 'D';

        this.renderButtons('basic');
        this.setupEventListeners();
        this.renderWithCaret();
    }

    setupEventListeners() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentMode = e.target.dataset.mode;
                this.renderButtons(this.currentMode);
            });
        });

        // Toggle grados/radianes
        this.angleMode.addEventListener('click', (event) => {
            this.isRadians = !this.isRadians;

            // botón: muestra la acción a la que puedes cambiar
            // si estoy en radianes → botón dice DEG, si estoy en grados → RAD
            this.angleMode.textContent = this.isRadians ? 'DEG' : 'RAD';

            // indicador: muestra el modo actual (R si radianes, D si grados)
            this.angleIndicator.textContent = this.isRadians ? 'R' : 'D';

            this.addRipple(this.angleMode, event);
        });

        // teclado físico
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));

        // click dentro del display: mover caret aproximado por posición X
        this.display.addEventListener('click', (e) => {
            const rect = this.display.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const avgCharWidth = rect.width / (this.expressionPretty.length || 1);
            const index = Math.round(clickX / (avgCharWidth || 1));
            this.caretIndex = Math.max(0, Math.min(index, this.expressionPretty.length));
            this.renderWithCaret();
        });
    }

    renderButtons(mode) {
        const basicLayout = [
            { text: 'AC', action: 'clear', class: 'btn-clear' },
            { text: 'DEL', action: 'delete', class: 'btn-function' },
            { text: '%', action: 'percent', class: 'btn-function' },
            { text: '(', action: 'parenthesis', value: '(', class: 'btn-function' },
            { text: ')', action: 'parenthesis', value: ')', class: 'btn-function' },

            { text: '7', action: 'number', value: '7', class: 'btn-number' },
            { text: '8', action: 'number', value: '8', class: 'btn-number' },
            { text: '9', action: 'number', value: '9', class: 'btn-number' },
            { text: '÷', action: 'operator', value: '/', class: 'btn-operator' },
            { text: '×', action: 'operator', value: '*', class: 'btn-operator' },

            { text: '4', action: 'number', value: '4', class: 'btn-number' },
            { text: '5', action: 'number', value: '5', class: 'btn-number' },
            { text: '6', action: 'number', value: '6', class: 'btn-number' },
            { text: '−', action: 'operator', value: '-', class: 'btn-operator' },
            { text: '+', action: 'operator', value: '+', class: 'btn-operator' },

            { text: '1', action: 'number', value: '1', class: 'btn-number' },
            { text: '2', action: 'number', value: '2', class: 'btn-number' },
            { text: '3', action: 'number', value: '3', class: 'btn-number' },
            { text: 'x²', action: 'function', value: 'square', class: 'btn-function' },
            { text: '√', action: 'function', value: 'sqrt', class: 'btn-function' },

            { text: '0', action: 'number', value: '0', class: 'btn-number btn-zero' },
            { text: '.', action: 'decimal', value: '.', class: 'btn-number' },
            { text: '=', action: 'equals', class: 'btn-equals' },
        ];

        const scientificLayout = [
            { text: 'AC', action: 'clear', class: 'btn-clear' },
            { text: 'DEL', action: 'delete', class: 'btn-function' },
            { text: 'MC', action: 'memory', value: 'clear', class: 'btn-function' },
            { text: 'MR', action: 'memory', value: 'recall', class: 'btn-function' },
            { text: 'M+', action: 'memory', value: 'add', class: 'btn-function' },

            { text: 'sin', action: 'trig', value: 'sin', class: 'btn-function' },
            { text: 'cos', action: 'trig', value: 'cos', class: 'btn-function' },
            { text: 'tan', action: 'trig', value: 'tan', class: 'btn-function' },
            { text: 'ln', action: 'function', value: 'ln', class: 'btn-function' },
            { text: 'log', action: 'function', value: 'log', class: 'btn-function' },

            { text: '7', action: 'number', value: '7', class: 'btn-number' },
            { text: '8', action: 'number', value: '8', class: 'btn-number' },
            { text: '9', action: 'number', value: '9', class: 'btn-number' },
            { text: '(', action: 'parenthesis', value: '(', class: 'btn-function' },
            { text: ')', action: 'parenthesis', value: ')', class: 'btn-function' },

            { text: '4', action: 'number', value: '4', class: 'btn-number' },
            { text: '5', action: 'number', value: '5', class: 'btn-number' },
            { text: '6', action: 'number', value: '6', class: 'btn-number' },
            { text: '×', action: 'operator', value: '*', class: 'btn-operator' },
            { text: '÷', action: 'operator', value: '/', class: 'btn-operator' },

            { text: '1', action: 'number', value: '1', class: 'btn-number' },
            { text: '2', action: 'number', value: '2', class: 'btn-number' },
            { text: '3', action: 'number', value: '3', class: 'btn-number' },
            { text: '+', action: 'operator', value: '+', class: 'btn-operator' },
            { text: '−', action: 'operator', value: '-', class: 'btn-operator' },

            { text: '0', action: 'number', value: '0', class: 'btn-number' },
            { text: '.', action: 'decimal', value: '.', class: 'btn-number' },
            { text: 'π', action: 'constant', value: 'PI', class: 'btn-function' },
            { text: 'e', action: 'constant', value: 'E', class: 'btn-function' },
            { text: 'xʸ', action: 'power', value: '^', class: 'btn-function' },
            { text: '=', action: 'equals', class: 'btn-equals' },
        ];

        const layout = mode === 'scientific' ? scientificLayout : basicLayout;

        this.buttonContainer.innerHTML = '';
        layout.forEach(btn => {
            const button = document.createElement('button');
            button.className = `btn ${btn.class}`;
            button.textContent = btn.text;
            button.dataset.action = btn.action;
            if (btn.value !== undefined) button.dataset.value = btn.value;

            button.addEventListener('click', (e) => {
                this.handleButton(btn.action, btn.value, btn.text);
                this.addRipple(button, e);
            });

            this.buttonContainer.appendChild(button);
        });
    }

    // ------- botones --------

    handleButton(action, value, text) {
        switch (action) {
            case 'number':
                this.insertNumber(text);
                break;
            case 'operator':
                this.insertOperator(text);
                break;
            case 'decimal':
                this.insertText('.');
                break;
            case 'clear':
                this.clear();
                return;
            case 'delete':
                this.backspace();
                break;
            case 'equals':
                this.calculate();
                return;
            case 'percent':
                this.insertText('%');
                break;
            case 'function':
                this.insertFunction(text); // ln, log, x², √
                break;
            case 'trig':
                this.insertTrig(text); // sin, cos, tan
                break;
            case 'constant':
                this.insertConstant(value); // π, e
                break;
            case 'parenthesis':
                this.insertText(text);
                break;
            case 'power':
                this.insertText('^');
                break;
            case 'memory':
                this.handleMemory(value);
                break;
        }

        this.expressionPretty = this.expressionPretty || '0';
        this.renderWithCaret();
        this.display.focus();
    }

    insertNumber(digit) {
        if (this.expressionPretty === '0') {
            this.expressionPretty = digit;
            this.caretIndex = 1;
        } else {
            this.insertText(digit);
        }
    }

    insertOperator(op) {
        const last = this.expressionPretty[this.caretIndex - 1];
        if ('+−-×*/^'.includes(last)) {
            this.backspace();
            this.insertText(op);
        } else {
            this.insertText(op);
        }
    }

    insertFunction(text) {
        if (text === 'x²') {
            this.insertText('^2');
        } else if (text === '√') {
            this.insertText('√');
        } else if (text === 'ln' || text === 'log') {
            this.insertNamedFunction(text);
        }
    }

    insertTrig(name) {
        this.insertNamedFunction(name);
    }

    insertNamedFunction(name) {
        const before = this.expressionPretty.slice(0, this.caretIndex);
        const after = this.expressionPretty.slice(this.caretIndex);
        const call = `${name}()`;

        if (before && before !== '0' && !'+−-×*/(^'.includes(before.slice(-1))) {
            this.expressionPretty = before + '*' + call + after;
            this.caretIndex = before.length + 1 + name.length + 1;
        } else {
            const leftBase = (this.expressionPretty === '0') ? '' : before;
            this.expressionPretty = leftBase + call + after;
            this.caretIndex = leftBase.length + name.length + 1;
        }
    }

    insertConstant(value) {
        const symbol = value === 'PI' ? 'π' : 'e';
        if (this.expressionPretty === '0') {
            this.expressionPretty = symbol;
            this.caretIndex = 1;
        } else {
            const before = this.expressionPretty.slice(0, this.caretIndex);
            const after = this.expressionPretty.slice(this.caretIndex);
            if (before && !'+−-×*/(^'.includes(before.slice(-1))) {
                this.expressionPretty = before + '*' + symbol + after;
                this.caretIndex = before.length + 2;
            } else {
                this.expressionPretty = before + symbol + after;
                this.caretIndex = before.length + 1;
            }
        }
    }

    insertText(text) {
        if (this.expressionPretty === '0') {
            if (text === '.') {
                this.expressionPretty = '0.';
                this.caretIndex = this.expressionPretty.length;
                return;
            }
            this.expressionPretty = text;
            this.caretIndex = this.expressionPretty.length;
            return;
        }

        const before = this.expressionPretty.slice(0, this.caretIndex);
        const after = this.expressionPretty.slice(this.caretIndex);
        this.expressionPretty = before + text + after;
        this.caretIndex += text.length;
    }

    backspace() {
        if (this.caretIndex === 0) return;

        const patterns = ['sin(', 'cos(', 'tan(', 'ln(', 'log('];
        const before = this.expressionPretty.slice(0, this.caretIndex);
        const after = this.expressionPretty.slice(this.caretIndex);

        for (const p of patterns) {
            if (before.endsWith(p)) {
                const start = before.length - p.length;
                let depth = 1;
                let i = start + p.length;
                while (i < this.expressionPretty.length && depth > 0) {
                    const ch = this.expressionPretty[i];
                    if (ch === '(') depth++;
                    else if (ch === ')') depth--;
                    i++;
                }
                this.expressionPretty =
                    this.expressionPretty.slice(0, start) +
                    this.expressionPretty.slice(i);
                this.caretIndex = start;
                if (this.expressionPretty === '') {
                    this.expressionPretty = '0';
                    this.caretIndex = 1;
                }
                return;
            }
        }

        const newBefore = before.slice(0, -1);
        this.expressionPretty = newBefore + after;
        this.caretIndex = newBefore.length;
        if (this.expressionPretty === '') {
            this.expressionPretty = '0';
            this.caretIndex = 1;
        }
    }

    clear() {
        this.expressionPretty = '0';
        this.history.textContent = '';
        this.caretIndex = 1;
        this.renderWithCaret();
        this.display.focus();
    }

    // ------- caret visual --------

    renderWithCaret() {
        const expr = this.expressionPretty;
        const idx = Math.max(0, Math.min(this.caretIndex, expr.length));
        const left = expr.slice(0, idx);
        const right = expr.slice(idx);
        this.display.innerHTML =
            left +
            '<span class="caret-blink"></span>' +
            right;
    }

    // ------- memoria --------

    handleMemory(action) {
        try {
            const value = this.evaluateExpression(this.expressionPretty);
            switch (action) {
                case 'clear':
                    this.memory = 0;
                    this.updateMemoryIndicator();
                    break;
                case 'recall':
                    this.insertText(this.formatNumber(this.memory));
                    break;
                case 'add':
                    this.memory += value || 0;
                    this.updateMemoryIndicator();
                    break;
            }
        } catch {
            this.expressionPretty = 'Error';
            this.caretIndex = this.expressionPretty.length;
            this.renderWithCaret();
        }
    }

    updateMemoryIndicator() {
        if (this.memory !== 0) {
            this.memoryIndicator.innerHTML =
                `<span class="memory-badge">M: ${this.formatNumber(this.memory)}</span>`;
        } else {
            this.memoryIndicator.innerHTML = '';
        }
    }

    // ------- cálculo --------

    calculate() {
        try {
            const exprShown = this.expressionPretty;
            const result = this.evaluateExpression(exprShown);
            this.history.textContent = exprShown;
            this.expressionPretty = this.formatNumber(result);
            this.caretIndex = this.expressionPretty.length;
            this.renderWithCaret();
            this.shouldResetDisplay = true;
        } catch {
            this.expressionPretty = 'Error';
            this.caretIndex = this.expressionPretty.length;
            this.renderWithCaret();
            this.shouldResetDisplay = true;
        }
    }

    evaluateExpression(prettyExpr) {
        if (!prettyExpr || prettyExpr === 'Error') throw new Error('Invalid');

        let e = prettyExpr;

        // símbolos básicos
        e = e.replace(/×/g, '*')
             .replace(/÷/g, '/')
             .replace(/−/g, '-');

        // constantes
        e = e.replace(/π/g, `(${Math.PI})`);
        e = e.replace(/e/g, `(${Math.E})`);

        // porcentajes n% → (n/100)
        e = e.replace(/(\d+(\.\d+)?)%/g, '($1/100)');

        // raíz
        // √(expresión) -> sqrt(expresión)
        // √número      -> sqrt(número)
        // número√      -> sqrt(número)
        e = e.replace(/√\s*\(\s*([^)]+)\s*\)/g, 'sqrt($1)');
        e = e.replace(/√\s*([0-9.]+)/g, 'sqrt($1)');
        e = e.replace(/([0-9.]+)\s*√/g, 'sqrt($1)');

        // potencias ^ → **
        e = e.replace(/\^/g, '**');

        // multiplicación implícita
        e = e.replace(/\)\s*\(/g, ')*(');
        e = e.replace(/(\d+(\.\d+)?|\))\s*(sqrt|sin|cos|tan|ln|log)\b/g, '$1*$3');
        e = e.replace(/(\)|sqrt\([^()]*\)|sin\([^()]*\)|cos\([^()]*\)|tan\([^()]*\)|ln\([^()]*\)|log\([^()]*\))\s*(\d+(\.\d+)?|π|e)/g, '$1*$2');
        e = e.replace(/(\d+(\.\d+)?|π|e|\))\s*\(/g, '$1*(');
        e = e.replace(/(\d+(\.\d+)?|π|e)\s+(\d+(\.\d+)?|π|e)/g, '$1*$3');

        const sanitized = e.replace(/[ \t\r\n]+/g, '');

        const self = this;
        const sqrt = (x) => Math.sqrt(x);
        const ln   = (x) => Math.log(x);
        const log  = (x) => Math.log10(x);
        const toRad = (x) => self.isRadians ? x : x * (Math.PI / 180);
        const sin  = (x) => Math.sin(toRad(x));
        const cos  = (x) => Math.cos(toRad(x));
        const tan  = (x) => Math.tan(toRad(x));

        const result = Function(
            '"use strict";' +
            'const sqrt = arguments[0];' +
            'const ln = arguments[1];' +
            'const log = arguments[2];' +
            'const sin = arguments[3];' +
            'const cos = arguments[4];' +
            'const tan = arguments[5];' +
            'return (' + sanitized + ');'
        )(sqrt, ln, log, sin, cos, tan);

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            throw new Error('Invalid');
        }
        return result;
    }

    formatNumber(num) {
        if (typeof num !== 'number' || isNaN(num)) return num;
        if (Math.abs(num) >= 1e12 || (Math.abs(num) > 0 && Math.abs(num) <= 1e-8)) {
            return num.toExponential(6);
        }
        if (num % 1 === 0) return num.toString();
        return parseFloat(num.toFixed(10)).toString();
    }

    handleKeyboard(e) {
        const key = e.key;

        if (key >= '0' && key <= '9') this.insertNumber(key);
        else if (key === '.') this.insertText('.');
        else if (['+', '-', '*', '/'].includes(key)) {
            const map = { '+': '+', '-': '−', '*': '×', '/': '÷' };
            this.insertOperator(map[key]);
        }
        else if (key === 'Enter' || key === '=') this.calculate();
        else if (key === 'Escape') this.clear();
        else if (key === 'Backspace') this.backspace();
        else if (key === '(' || key === ')') this.insertText(key);
        else if (key === '%') this.insertText('%');

        this.expressionPretty = this.expressionPretty || '0';
        this.renderWithCaret();
    }

    addRipple(button, e) {
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    }
}

const calculator = new ScientificCalculator();
console.log('🔬 Calculadora Científica Profesional cargada!');
