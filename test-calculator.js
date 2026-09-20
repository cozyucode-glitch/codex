const assert = require("node:assert/strict");
const {
  appendDecimal,
  appendDigit,
  calculate,
  formatDisplay,
  roundResult,
} = require("./calculator-core.js");

assert.equal(calculate(2, "+", 3), 5);
assert.equal(calculate(10, "-", 4), 6);
assert.equal(calculate(7, "*", 8), 56);
assert.equal(calculate(9, "/", 3), 3);
assert.equal(calculate(0.1, "+", 0.2), 0.3);
assert.throws(() => calculate(1, "/", 0), /0으로 나눌 수 없습니다/);
assert.throws(() => calculate(1, "^", 2), /지원하지 않는 연산자/);
assert.equal(appendDigit("0", "7"), "7");
assert.equal(appendDigit("12", "3"), "123");
assert.equal(appendDecimal("12"), "12.");
assert.equal(appendDecimal("12.3"), "12.3");
assert.equal(roundResult(1 / 3), 0.333333333333);
assert.equal(formatDisplay("12345"), "12,345");
assert.equal(formatDisplay("12.50"), "12.50");

console.log("calculator tests passed");
