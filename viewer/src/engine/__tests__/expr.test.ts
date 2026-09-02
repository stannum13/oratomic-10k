import { describe, test, expect } from "vitest";
import {
  lit, param, add, mul, div, sub, pow, log, neg,
  evaluate, simplify, differentiate, freeParams, pretty, substitute,
  type Bindings,
} from "../expr";

describe("evaluate", () => {
  test("literal", () => {
    expect(evaluate(lit(42), {})).toBe(42);
  });

  test("parameter", () => {
    expect(evaluate(param("x"), { x: 3 })).toBe(3);
  });

  test("unbound parameter throws", () => {
    expect(() => evaluate(param("x"), {})).toThrow("Unbound parameter: x");
  });

  test("arithmetic", () => {
    const expr = add(mul(param("a"), lit(2)), lit(1));
    expect(evaluate(expr, { a: 5 })).toBe(11);
  });

  test("division", () => {
    expect(evaluate(div(lit(10), lit(3)), {})).toBeCloseTo(3.333, 2);
  });

  test("power", () => {
    expect(evaluate(pow(param("p"), lit(10)), { p: 0.001 })).toBeCloseTo(1e-30, 35);
  });

  test("log", () => {
    expect(evaluate(log(lit(Math.E)), {})).toBeCloseTo(1, 10);
  });

  test("negation", () => {
    expect(evaluate(neg(lit(5)), {})).toBe(-5);
  });

  test("subtraction", () => {
    expect(evaluate(sub(lit(10), lit(3)), {})).toBe(7);
  });
});

describe("simplify", () => {
  test("0 + x = x", () => {
    const expr = add(lit(0), param("x"));
    const result = simplify(expr);
    expect(result).toEqual(param("x"));
  });

  test("x * 1 = x", () => {
    const expr = mul(param("x"), lit(1));
    const result = simplify(expr);
    expect(result).toEqual(param("x"));
  });

  test("x * 0 = 0", () => {
    const expr = mul(param("x"), lit(0));
    const result = simplify(expr);
    expect(result).toEqual(lit(0));
  });

  test("constant folding", () => {
    const expr = add(lit(3), lit(4));
    const result = simplify(expr);
    expect(result).toEqual(lit(7));
  });

  test("double negation", () => {
    const expr = neg(neg(param("x")));
    const result = simplify(expr);
    expect(result).toEqual(param("x"));
  });
});

describe("differentiate", () => {
  test("d/dx of constant = 0", () => {
    const result = simplify(differentiate(lit(5), "x"));
    expect(evaluate(result, {})).toBe(0);
  });

  test("d/dx of x = 1", () => {
    const result = simplify(differentiate(param("x"), "x"));
    expect(evaluate(result, {})).toBe(1);
  });

  test("d/dx of y = 0", () => {
    const result = simplify(differentiate(param("y"), "x"));
    expect(evaluate(result, {})).toBe(0);
  });

  test("d/dx of 2x = 2", () => {
    const expr = mul(lit(2), param("x"));
    const result = simplify(differentiate(expr, "x"));
    expect(evaluate(result, { x: 5 })).toBe(2);
  });

  test("d/dx of x^2 = 2x", () => {
    const expr = pow(param("x"), lit(2));
    const deriv = differentiate(expr, "x");
    // Should evaluate to 2x at x=3 -> 6
    expect(evaluate(deriv, { x: 3 })).toBeCloseTo(6, 5);
  });

  test("d/dp of a*p^b = a*b*p^(b-1)", () => {
    // Block error rate: P_L = a * p^b
    const a = lit(14.6);
    const b = lit(7.1);
    const expr = mul(a, pow(param("p"), b));
    const deriv = differentiate(expr, "p");
    // At p=0.001: d/dp = 14.6 * 7.1 * 0.001^6.1
    const expected = 14.6 * 7.1 * Math.pow(0.001, 6.1);
    expect(evaluate(deriv, { p: 0.001 })).toBeCloseTo(expected, 20);
  });
});

describe("freeParams", () => {
  test("finds all parameters", () => {
    const expr = add(mul(param("a"), param("b")), param("c"));
    expect(freeParams(expr)).toEqual(new Set(["a", "b", "c"]));
  });

  test("literal has no params", () => {
    expect(freeParams(lit(5))).toEqual(new Set());
  });
});

describe("substitute", () => {
  test("replaces parameter", () => {
    const expr = add(param("x"), lit(1));
    const result = substitute(expr, "x", lit(5));
    expect(evaluate(result, {})).toBe(6);
  });
});

describe("pretty", () => {
  test("renders readable expression", () => {
    const expr = mul(lit(2), add(param("x"), lit(3)));
    const str = pretty(expr);
    expect(str).toContain("x");
    expect(str).toContain("2");
    expect(str).toContain("3");
  });
});
