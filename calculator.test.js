const calculator = require('./calculator');

describe('Calculator Helper Functions', () => {
  test('calculate performs operations correctly', () => {
    expect(calculator.calculate('5', '+', '3')).toBe(8);
    expect(calculator.calculate('10', '−', '4')).toBe(6);
    expect(calculator.calculate('4', '×', '3')).toBe(12);
    expect(calculator.calculate('15', '÷', '3')).toBe(5);
    expect(calculator.calculate('5', '÷', '0')).toBe('Error');
  });

  test('formatNumber limits precision correctly', () => {
    expect(calculator.formatNumber('123.456')).toBe('123.456');
    expect(calculator.formatNumber('0.3333333333333333')).toBe('0.3333333333');
    expect(calculator.formatNumber('Error')).toBe('Error');
  });
});

describe('Calculator State Transitions', () => {
  beforeEach(() => {
    calculator.resetAll();
  });

  test('pressDigit updates state correctly', () => {
    calculator.pressDigit('7');
    expect(calculator.getState().currentInput).toBe('7');
    calculator.pressDigit('5');
    expect(calculator.getState().currentInput).toBe('75');
  });

  test('pressDot appends decimal point', () => {
    calculator.pressDigit('5');
    calculator.pressDot();
    expect(calculator.getState().currentInput).toBe('5.');
    calculator.pressDigit('2');
    expect(calculator.getState().currentInput).toBe('5.2');
    calculator.pressDot(); // Shouldn't add another dot
    expect(calculator.getState().currentInput).toBe('5.2');
  });

  test('basic arithmetic flow works', () => {
    calculator.pressDigit('9');
    calculator.pressOp('×');
    expect(calculator.getState().previousInput).toBe('9');
    expect(calculator.getState().operator).toBe('×');
    expect(calculator.getState().currentInput).toBe('0');

    calculator.pressDigit('8');
    calculator.pressEquals();
    expect(calculator.getState().currentInput).toBe('72');
    expect(calculator.getState().operator).toBeNull();
    expect(calculator.getState().justEvaled).toBe(true);
  });

  test('pressAC resets everything', () => {
    calculator.pressDigit('9');
    calculator.pressOp('+');
    calculator.pressDigit('2');
    calculator.pressAC();
    
    const state = calculator.getState();
    expect(state.currentInput).toBe('0');
    expect(state.previousInput).toBe('');
    expect(state.operator).toBeNull();
    expect(state.justEvaled).toBe(false);
  });

  test('pressToggleSign toggles positive/negative', () => {
    calculator.pressDigit('5');
    calculator.pressToggleSign();
    expect(calculator.getState().currentInput).toBe('-5');
    calculator.pressToggleSign();
    expect(calculator.getState().currentInput).toBe('5');
  });

  test('pressPercent divides by 100', () => {
    calculator.pressDigit('5');
    calculator.pressPercent();
    expect(calculator.getState().currentInput).toBe('0.05');
  });
});
