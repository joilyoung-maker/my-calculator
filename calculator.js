// calculator.js
let currentInput  = '0';
let previousInput = '';
let operator      = null;
let justEvaled    = false;

function formatNumber(val) {
  if (val === 'Error') return 'Error';
  const num = parseFloat(val);
  if (isNaN(num)) return val;
  // Limit display to 10 significant digits
  const str = parseFloat(num.toPrecision(10)).toString();
  return str;
}

function toReal(op) {
  return op === '÷' ? '/' : op === '×' ? '*' : op === '−' ? '-' : '+';
}

function calculate(a, op, b) {
  const x = parseFloat(a), y = parseFloat(b);
  switch (op) {
    case '÷': return y === 0 ? 'Error' : x / y;
    case '×': return x * y;
    case '−': return x - y;
    case '+': return x + y;
    default:  return b;
  }
}

function updateDisplay(value) {
  if (typeof document !== 'undefined') {
    const resultEl = document.getElementById('result');
    if (resultEl) {
      resultEl.classList.remove('pop');
      void resultEl.offsetWidth; // reflow
      resultEl.classList.add('pop');
      resultEl.textContent = formatNumber(value);
    }
  }
}

function updateExpression(expr) {
  if (typeof document !== 'undefined') {
    const expressionEl = document.getElementById('expression');
    if (expressionEl) {
      expressionEl.textContent = expr;
    }
  }
}

function pressDigit(d) {
  if (justEvaled) {
    currentInput = d;
    updateExpression('');
    justEvaled = false;
  } else if (currentInput === '0' && d !== '0') {
    currentInput = d;
  } else if (currentInput.length < 12) {
    currentInput = currentInput === '0' ? d : currentInput + d;
  }
  updateDisplay(currentInput);
}

function pressDot() {
  if (justEvaled) { currentInput = '0.'; justEvaled = false; }
  if (!currentInput.includes('.')) currentInput += '.';
  updateDisplay(currentInput);
}

function pressOp(op) {
  if (operator && !justEvaled && previousInput !== '') {
    const res = calculate(previousInput, operator, currentInput);
    if (res === 'Error') { resetAll(); updateDisplay('Error'); return; }
    previousInput = String(res);
    updateDisplay(previousInput);
    updateExpression(formatNumber(previousInput) + ' ' + op);
  } else {
    previousInput = justEvaled ? currentInput : currentInput;
    updateExpression(formatNumber(previousInput) + ' ' + op);
  }
  operator = op;
  currentInput = '0';
  justEvaled = false;
}

function pressEquals() {
  if (!operator || previousInput === '') return;
  const expr = formatNumber(previousInput) + ' ' + operator + ' ' + formatNumber(currentInput);
  const res = calculate(previousInput, operator, currentInput);
  if (res === 'Error') { resetAll(); updateDisplay('Error'); return; }
  updateExpression(expr + ' =');
  currentInput = String(parseFloat(res.toPrecision(10)));
  operator = null;
  previousInput = '';
  justEvaled = true;
  updateDisplay(currentInput);
}

function pressAC() {
  resetAll();
  updateDisplay('0');
}

function pressToggleSign() {
  if (currentInput !== '0') {
    currentInput = currentInput.startsWith('-')
      ? currentInput.slice(1)
      : '-' + currentInput;
    updateDisplay(currentInput);
  }
}

function pressPercent() {
  const val = parseFloat(currentInput) / 100;
  currentInput = String(val);
  updateDisplay(currentInput);
}

function resetAll() {
  currentInput  = '0';
  previousInput = '';
  operator      = null;
  justEvaled    = false;
  updateExpression('');
}

// ── Web Environment Only (DOM bindings) ───────────────────────────────────
if (typeof document !== 'undefined') {
  // Keyboard support
  document.addEventListener('keydown', e => {
    if (e.key >= '0' && e.key <= '9') pressDigit(e.key);
    else if (e.key === '.')  pressDot();
    else if (e.key === '+')  pressOp('+');
    else if (e.key === '-')  pressOp('−');
    else if (e.key === '*')  pressOp('×');
    else if (e.key === '/')  { e.preventDefault(); pressOp('÷'); }
    else if (e.key === 'Enter' || e.key === '=') pressEquals();
    else if (e.key === 'Escape' || e.key === 'Delete') pressAC();
    else if (e.key === 'Backspace') {
      if (currentInput.length > 1) currentInput = currentInput.slice(0, -1);
      else currentInput = '0';
      updateDisplay(currentInput);
    }
    else if (e.key === '%') pressPercent();
  });

  // Ripple effect
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        const rect = this.getBoundingClientRect();
        ripple.style.left = (e.clientX - rect.left - 30) + 'px';
        ripple.style.top  = (e.clientY - rect.top - 30) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 500);
      });
    });
  });
}

// ── Export for Jest testing (Node.js environment) ────────────────────────
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    // State accessors for testing
    getState: () => ({ currentInput, previousInput, operator, justEvaled }),
    setState: (state) => {
      if (state.currentInput !== undefined) currentInput = state.currentInput;
      if (state.previousInput !== undefined) previousInput = state.previousInput;
      if (state.operator !== undefined) operator = state.operator;
      if (state.justEvaled !== undefined) justEvaled = state.justEvaled;
    },
    resetAll,
    formatNumber,
    calculate,
    pressDigit,
    pressDot,
    pressOp,
    pressEquals,
    pressAC,
    pressToggleSign,
    pressPercent
  };
}
