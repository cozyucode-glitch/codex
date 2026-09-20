(function (root, factory) {
  const api = factory();

  if (typeof module === "object" && module.exports) {
    module.exports = api;
  }

  if (root) {
    root.CalculatorCore = api;
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const MAX_DISPLAY_LENGTH = 14;

  function roundResult(value) {
    if (!Number.isFinite(value)) {
      return value;
    }

    return Number.parseFloat(Number(value).toPrecision(12));
  }

  function calculate(left, operator, right) {
    const a = Number(left);
    const b = Number(right);

    if (!Number.isFinite(a) || !Number.isFinite(b)) {
      throw new Error("올바른 숫자가 아닙니다.");
    }

    switch (operator) {
      case "+":
        return roundResult(a + b);
      case "-":
        return roundResult(a - b);
      case "*":
        return roundResult(a * b);
      case "/":
        if (b === 0) {
          throw new Error("0으로 나눌 수 없습니다.");
        }
        return roundResult(a / b);
      default:
        throw new Error("지원하지 않는 연산자입니다.");
    }
  }

  function formatDisplay(value) {
    const text = String(value);

    if (text === "Error") {
      return text;
    }

    const number = Number(text);
    if (!Number.isFinite(number)) {
      return "Error";
    }

    if (text.includes(".") && text.length <= MAX_DISPLAY_LENGTH) {
      const [integer, decimal] = text.split(".");
      const formattedInteger = Number(integer || 0).toLocaleString("ko-KR");
      return `${formattedInteger}.${decimal}`;
    }

    const abs = Math.abs(number);
    if ((abs >= 1e12 || (abs > 0 && abs < 1e-9)) && number !== 0) {
      return number.toExponential(8).replace(/\.0+e/, "e");
    }

    const formatted = number.toLocaleString("ko-KR", {
      maximumFractionDigits: 10,
      useGrouping: true,
    });

    return formatted.length > 18 ? number.toExponential(8) : formatted;
  }

  function appendDigit(current, digit, maxLength = MAX_DISPLAY_LENGTH) {
    if (!/^\d$/.test(String(digit))) {
      return current;
    }

    const rawLength = String(current).replace("-", "").replace(".", "").length;
    if (rawLength >= maxLength) {
      return current;
    }

    if (current === "0") {
      return String(digit);
    }

    if (current === "-0") {
      return `-${digit}`;
    }

    return `${current}${digit}`;
  }

  function appendDecimal(current) {
    if (String(current).includes(".")) {
      return current;
    }

    return `${current}.`;
  }

  return {
    MAX_DISPLAY_LENGTH,
    appendDecimal,
    appendDigit,
    calculate,
    formatDisplay,
    roundResult,
  };
});
