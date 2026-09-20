(() => {
  "use strict";

  const { appendDecimal, appendDigit, calculate, formatDisplay } = window.CalculatorCore;

  const display = document.getElementById("display");
  const history = document.getElementById("history");
  const keypad = document.querySelector(".keypad");
  const operatorButtons = [...document.querySelectorAll("[data-operator]")];

  const state = {
    current: "0",
    stored: null,
    operator: null,
    waitingForOperand: false,
    justCalculated: false,
    error: false,
  };

  function operatorSymbol(operator) {
    return { "+": "+", "-": "−", "*": "×", "/": "÷" }[operator] ?? operator;
  }

  function updateView() {
    display.textContent = state.error ? "Error" : formatDisplay(state.current);
    operatorButtons.forEach((button) => {
      button.classList.toggle("is-active", !state.error && button.dataset.operator === state.operator);
    });
  }

  function reset() {
    state.current = "0";
    state.stored = null;
    state.operator = null;
    state.waitingForOperand = false;
    state.justCalculated = false;
    state.error = false;
    history.textContent = "";
    updateView();
  }

  function setError(message) {
    state.current = "0";
    state.stored = null;
    state.operator = null;
    state.waitingForOperand = false;
    state.justCalculated = false;
    state.error = true;
    history.textContent = message;
    updateView();
  }

  function inputNumber(digit) {
    if (state.error || state.justCalculated) {
      reset();
    }

    if (state.waitingForOperand) {
      state.current = String(digit);
      state.waitingForOperand = false;
    } else {
      state.current = appendDigit(state.current, digit);
    }

    updateView();
  }

  function inputDecimal() {
    if (state.error || state.justCalculated) {
      reset();
    }

    if (state.waitingForOperand) {
      state.current = "0.";
      state.waitingForOperand = false;
    } else {
      state.current = appendDecimal(state.current);
    }

    updateView();
  }

  function applyPendingOperation() {
    if (state.stored === null || state.operator === null) {
      return Number(state.current);
    }

    return calculate(state.stored, state.operator, state.current);
  }

  function chooseOperator(nextOperator) {
    if (state.error) {
      return;
    }

    if (state.operator && state.waitingForOperand) {
      state.operator = nextOperator;
      history.textContent = `${formatDisplay(state.stored)} ${operatorSymbol(nextOperator)}`;
      updateView();
      return;
    }

    try {
      const result = applyPendingOperation();
      state.current = String(result);
      state.stored = result;
      state.operator = nextOperator;
      state.waitingForOperand = true;
      state.justCalculated = false;
      history.textContent = `${formatDisplay(result)} ${operatorSymbol(nextOperator)}`;
      updateView();
    } catch (error) {
      setError(error.message);
    }
  }

  function equals() {
    if (state.error || state.operator === null || state.stored === null || state.waitingForOperand) {
      return;
    }

    const left = state.stored;
    const right = state.current;
    const operator = state.operator;

    try {
      const result = calculate(left, operator, right);
      history.textContent = `${formatDisplay(left)} ${operatorSymbol(operator)} ${formatDisplay(right)} =`;
      state.current = String(result);
      state.stored = null;
      state.operator = null;
      state.waitingForOperand = false;
      state.justCalculated = true;
      updateView();
    } catch (error) {
      setError(error.message);
    }
  }

  function toggleSign() {
    if (state.error || state.current === "0") {
      return;
    }

    state.current = state.current.startsWith("-") ? state.current.slice(1) : `-${state.current}`;
    updateView();
  }

  function percent() {
    if (state.error) {
      return;
    }

    state.current = String(Number(state.current) / 100);
    state.justCalculated = false;
    updateView();
  }

  function backspace() {
    if (state.error) {
      reset();
      return;
    }

    if (state.waitingForOperand || state.justCalculated) {
      return;
    }

    if (state.current.length <= 1 || (state.current.startsWith("-") && state.current.length === 2)) {
      state.current = "0";
    } else {
      state.current = state.current.slice(0, -1);
    }

    updateView();
  }

  function handleAction(action) {
    if (action === "clear") reset();
    if (action === "decimal") inputDecimal();
    if (action === "equals") equals();
    if (action === "sign") toggleSign();
    if (action === "percent") percent();
  }

  keypad.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;

    if (button.dataset.number !== undefined) inputNumber(button.dataset.number);
    if (button.dataset.operator) chooseOperator(button.dataset.operator);
    if (button.dataset.action) handleAction(button.dataset.action);
  });

  document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^\d$/.test(key)) inputNumber(key);
    else if (["+", "-", "*", "/"].includes(key)) chooseOperator(key);
    else if (key === "." || key === ",") inputDecimal();
    else if (key === "Enter" || key === "=") equals();
    else if (key === "Escape" || key === "Delete") reset();
    else if (key === "Backspace") backspace();
    else if (key === "%") percent();
    else return;

    event.preventDefault();

    const selector =
      /^\d$/.test(key) ? `[data-number="${key}"]` :
      ["+", "-", "*", "/"].includes(key) ? `[data-operator="${key}"]` :
      key === "." || key === "," ? '[data-action="decimal"]' :
      key === "Enter" || key === "=" ? '[data-action="equals"]' : null;

    if (selector) {
      const button = document.querySelector(selector);
      button?.classList.add("is-pressed");
      window.setTimeout(() => button?.classList.remove("is-pressed"), 100);
    }
  });

  reset();
})();
