/**
 * Symbolic expression tree for parametric architecture modeling.
 * Quantities remain symbolic until explicitly evaluated with concrete bindings.
 */

// ─── Expression Types ───────────────────────────────────

export type Expr =
  | { tag: "lit"; value: number }
  | { tag: "param"; name: string }
  | { tag: "add"; left: Expr; right: Expr }
  | { tag: "mul"; left: Expr; right: Expr }
  | { tag: "div"; num: Expr; den: Expr }
  | { tag: "pow"; base: Expr; exp: Expr }
  | { tag: "log"; arg: Expr }
  | { tag: "log10"; arg: Expr }
  | { tag: "min"; args: Expr[] }
  | { tag: "max"; args: Expr[] }
  | { tag: "floor"; arg: Expr }
  | { tag: "ceil"; arg: Expr }
  | { tag: "abs"; arg: Expr }
  | { tag: "neg"; arg: Expr }
  | { tag: "cond"; test: BoolExpr; then: Expr; else_: Expr }

export type BoolExpr =
  | { tag: "lt"; left: Expr; right: Expr }
  | { tag: "le"; left: Expr; right: Expr }
  | { tag: "eq"; left: Expr; right: Expr }
  | { tag: "gt"; left: Expr; right: Expr }
  | { tag: "ge"; left: Expr; right: Expr }
  | { tag: "and"; left: BoolExpr; right: BoolExpr }
  | { tag: "or"; left: BoolExpr; right: BoolExpr }
  | { tag: "not"; arg: BoolExpr }
  | { tag: "bool_lit"; value: boolean }

export type Bindings = Record<string, number>;

// ─── Constructors (convenience) ─────────────────────────

export const lit = (value: number): Expr => ({ tag: "lit", value });
export const param = (name: string): Expr => ({ tag: "param", name });
export const add = (a: Expr, b: Expr): Expr => ({ tag: "add", left: a, right: b });
export const sub = (a: Expr, b: Expr): Expr => add(a, neg(b));
export const mul = (a: Expr, b: Expr): Expr => ({ tag: "mul", left: a, right: b });
export const div = (a: Expr, b: Expr): Expr => ({ tag: "div", num: a, den: b });
export const pow = (base: Expr, exp: Expr): Expr => ({ tag: "pow", base, exp });
export const log = (arg: Expr): Expr => ({ tag: "log", arg });
export const log10 = (arg: Expr): Expr => ({ tag: "log10", arg });
export const symMin = (...args: Expr[]): Expr => ({ tag: "min", args });
export const symMax = (...args: Expr[]): Expr => ({ tag: "max", args });
export const floor = (arg: Expr): Expr => ({ tag: "floor", arg });
export const ceil = (arg: Expr): Expr => ({ tag: "ceil", arg });
export const abs = (arg: Expr): Expr => ({ tag: "abs", arg });
export const neg = (arg: Expr): Expr => ({ tag: "neg", arg });
export const cond = (test: BoolExpr, then: Expr, else_: Expr): Expr => ({ tag: "cond", test, then, else_ });

// Multi-operand add/mul
export const sum = (...args: Expr[]): Expr => args.reduce((a, b) => add(a, b));
export const prod = (...args: Expr[]): Expr => args.reduce((a, b) => mul(a, b));

// Boolean constructors
export const lt = (a: Expr, b: Expr): BoolExpr => ({ tag: "lt", left: a, right: b });
export const le = (a: Expr, b: Expr): BoolExpr => ({ tag: "le", left: a, right: b });
export const eq = (a: Expr, b: Expr): BoolExpr => ({ tag: "eq", left: a, right: b });
export const gt = (a: Expr, b: Expr): BoolExpr => ({ tag: "gt", left: a, right: b });
export const ge = (a: Expr, b: Expr): BoolExpr => ({ tag: "ge", left: a, right: b });
export const symAnd = (a: BoolExpr, b: BoolExpr): BoolExpr => ({ tag: "and", left: a, right: b });
export const symOr = (a: BoolExpr, b: BoolExpr): BoolExpr => ({ tag: "or", left: a, right: b });
export const symNot = (arg: BoolExpr): BoolExpr => ({ tag: "not", arg });
export const boolLit = (value: boolean): BoolExpr => ({ tag: "bool_lit", value });

// ─── Evaluation ─────────────────────────────────────────

export function evaluate(expr: Expr, bindings: Bindings): number {
  switch (expr.tag) {
    case "lit": return expr.value;
    case "param": {
      const val = bindings[expr.name];
      if (val === undefined) throw new Error(`Unbound parameter: ${expr.name}`);
      return val;
    }
    case "add": return evaluate(expr.left, bindings) + evaluate(expr.right, bindings);
    case "mul": return evaluate(expr.left, bindings) * evaluate(expr.right, bindings);
    case "div": return evaluate(expr.num, bindings) / evaluate(expr.den, bindings);
    case "pow": return Math.pow(evaluate(expr.base, bindings), evaluate(expr.exp, bindings));
    case "log": return Math.log(evaluate(expr.arg, bindings));
    case "log10": return Math.log10(evaluate(expr.arg, bindings));
    case "min": return Math.min(...expr.args.map(a => evaluate(a, bindings)));
    case "max": return Math.max(...expr.args.map(a => evaluate(a, bindings)));
    case "floor": return Math.floor(evaluate(expr.arg, bindings));
    case "ceil": return Math.ceil(evaluate(expr.arg, bindings));
    case "abs": return Math.abs(evaluate(expr.arg, bindings));
    case "neg": return -evaluate(expr.arg, bindings);
    case "cond": return evaluateBool(expr.test, bindings)
      ? evaluate(expr.then, bindings)
      : evaluate(expr.else_, bindings);
  }
}

export function evaluateBool(expr: BoolExpr, bindings: Bindings): boolean {
  switch (expr.tag) {
    case "lt": return evaluate(expr.left, bindings) < evaluate(expr.right, bindings);
    case "le": return evaluate(expr.left, bindings) <= evaluate(expr.right, bindings);
    case "eq": return evaluate(expr.left, bindings) === evaluate(expr.right, bindings);
    case "gt": return evaluate(expr.left, bindings) > evaluate(expr.right, bindings);
    case "ge": return evaluate(expr.left, bindings) >= evaluate(expr.right, bindings);
    case "and": return evaluateBool(expr.left, bindings) && evaluateBool(expr.right, bindings);
    case "or": return evaluateBool(expr.left, bindings) || evaluateBool(expr.right, bindings);
    case "not": return !evaluateBool(expr.arg, bindings);
    case "bool_lit": return expr.value;
  }
}

// ─── Free Parameters ────────────────────────────────────

export function freeParams(expr: Expr): Set<string> {
  const params = new Set<string>();
  function walk(e: Expr): void {
    switch (e.tag) {
      case "lit": break;
      case "param": params.add(e.name); break;
      case "add": case "mul": walk(e.left); walk(e.right); break;
      case "div": walk(e.num); walk(e.den); break;
      case "pow": walk(e.base); walk(e.exp); break;
      case "log": case "log10": case "floor": case "ceil": case "abs": case "neg": walk(e.arg); break;
      case "min": case "max": e.args.forEach(walk); break;
      case "cond": walkBool(e.test); walk(e.then); walk(e.else_); break;
    }
  }
  function walkBool(e: BoolExpr): void {
    switch (e.tag) {
      case "lt": case "le": case "eq": case "gt": case "ge": walk(e.left); walk(e.right); break;
      case "and": case "or": walkBool(e.left); walkBool(e.right); break;
      case "not": walkBool(e.arg); break;
      case "bool_lit": break;
    }
  }
  walk(expr);
  return params;
}

export function freeParamsBool(expr: BoolExpr): Set<string> {
  const params = new Set<string>();
  // Wrap in a dummy expression to reuse freeParams
  const dummy: Expr = { tag: "cond", test: expr, then: lit(0), else_: lit(0) };
  freeParams(dummy).forEach(p => params.add(p));
  return params;
}

// ─── Substitution ───────────────────────────────────────

export function substitute(expr: Expr, name: string, replacement: Expr): Expr {
  function subE(e: Expr): Expr {
    switch (e.tag) {
      case "lit": return e;
      case "param": return e.name === name ? replacement : e;
      case "add": return add(subE(e.left), subE(e.right));
      case "mul": return mul(subE(e.left), subE(e.right));
      case "div": return div(subE(e.num), subE(e.den));
      case "pow": return pow(subE(e.base), subE(e.exp));
      case "log": return log(subE(e.arg));
      case "log10": return log10(subE(e.arg));
      case "min": return symMin(...e.args.map(subE));
      case "max": return symMax(...e.args.map(subE));
      case "floor": return floor(subE(e.arg));
      case "ceil": return ceil(subE(e.arg));
      case "abs": return abs(subE(e.arg));
      case "neg": return neg(subE(e.arg));
      case "cond": return cond(subBool(e.test), subE(e.then), subE(e.else_));
    }
  }
  function subBool(e: BoolExpr): BoolExpr {
    switch (e.tag) {
      case "lt": return lt(subE(e.left), subE(e.right));
      case "le": return le(subE(e.left), subE(e.right));
      case "eq": return eq(subE(e.left), subE(e.right));
      case "gt": return gt(subE(e.left), subE(e.right));
      case "ge": return ge(subE(e.left), subE(e.right));
      case "and": return symAnd(subBool(e.left), subBool(e.right));
      case "or": return symOr(subBool(e.left), subBool(e.right));
      case "not": return symNot(subBool(e.arg));
      case "bool_lit": return e;
    }
  }
  return subE(expr);
}

// ─── Simplification ─────────────────────────────────────

export function simplify(expr: Expr): Expr {
  switch (expr.tag) {
    case "lit":
    case "param":
      return expr;

    case "add": {
      const l = simplify(expr.left);
      const r = simplify(expr.right);
      if (l.tag === "lit" && l.value === 0) return r;
      if (r.tag === "lit" && r.value === 0) return l;
      if (l.tag === "lit" && r.tag === "lit") return lit(l.value + r.value);
      return add(l, r);
    }

    case "mul": {
      const l = simplify(expr.left);
      const r = simplify(expr.right);
      if (l.tag === "lit" && l.value === 0) return lit(0);
      if (r.tag === "lit" && r.value === 0) return lit(0);
      if (l.tag === "lit" && l.value === 1) return r;
      if (r.tag === "lit" && r.value === 1) return l;
      if (l.tag === "lit" && r.tag === "lit") return lit(l.value * r.value);
      return mul(l, r);
    }

    case "div": {
      const n = simplify(expr.num);
      const d = simplify(expr.den);
      if (n.tag === "lit" && n.value === 0) return lit(0);
      if (d.tag === "lit" && d.value === 1) return n;
      if (n.tag === "lit" && d.tag === "lit") return lit(n.value / d.value);
      return div(n, d);
    }

    case "pow": {
      const b = simplify(expr.base);
      const e = simplify(expr.exp);
      if (e.tag === "lit" && e.value === 0) return lit(1);
      if (e.tag === "lit" && e.value === 1) return b;
      if (b.tag === "lit" && e.tag === "lit") return lit(Math.pow(b.value, e.value));
      return pow(b, e);
    }

    case "neg": {
      const a = simplify(expr.arg);
      if (a.tag === "lit") return lit(-a.value);
      if (a.tag === "neg") return a.arg;
      return neg(a);
    }

    case "log": {
      const a = simplify(expr.arg);
      if (a.tag === "lit") return lit(Math.log(a.value));
      return log(a);
    }

    case "log10": {
      const a = simplify(expr.arg);
      if (a.tag === "lit") return lit(Math.log10(a.value));
      return log10(a);
    }

    case "abs": {
      const a = simplify(expr.arg);
      if (a.tag === "lit") return lit(Math.abs(a.value));
      return abs(a);
    }

    case "floor": {
      const a = simplify(expr.arg);
      if (a.tag === "lit") return lit(Math.floor(a.value));
      return floor(a);
    }

    case "ceil": {
      const a = simplify(expr.arg);
      if (a.tag === "lit") return lit(Math.ceil(a.value));
      return ceil(a);
    }

    case "min": {
      const args = expr.args.map(simplify);
      const allLit = args.every(a => a.tag === "lit");
      if (allLit) return lit(Math.min(...args.map(a => (a as { tag: "lit"; value: number }).value)));
      return symMin(...args);
    }

    case "max": {
      const args = expr.args.map(simplify);
      const allLit = args.every(a => a.tag === "lit");
      if (allLit) return lit(Math.max(...args.map(a => (a as { tag: "lit"; value: number }).value)));
      return symMax(...args);
    }

    case "cond": {
      const t = simplifyBool(expr.test);
      if (t.tag === "bool_lit") return t.value ? simplify(expr.then) : simplify(expr.else_);
      return cond(t, simplify(expr.then), simplify(expr.else_));
    }
  }
}

function simplifyBool(expr: BoolExpr): BoolExpr {
  switch (expr.tag) {
    case "bool_lit": return expr;
    case "not": {
      const a = simplifyBool(expr.arg);
      if (a.tag === "bool_lit") return boolLit(!a.value);
      return symNot(a);
    }
    case "and": {
      const l = simplifyBool(expr.left);
      const r = simplifyBool(expr.right);
      if (l.tag === "bool_lit") return l.value ? r : boolLit(false);
      if (r.tag === "bool_lit") return r.value ? l : boolLit(false);
      return symAnd(l, r);
    }
    case "or": {
      const l = simplifyBool(expr.left);
      const r = simplifyBool(expr.right);
      if (l.tag === "bool_lit") return l.value ? boolLit(true) : r;
      if (r.tag === "bool_lit") return r.value ? boolLit(true) : l;
      return symOr(l, r);
    }
    default: return expr;
  }
}

// ─── Symbolic Differentiation ───────────────────────────

/** Symbolic partial derivative d(expr)/d(param) */
export function differentiate(expr: Expr, paramName: string): Expr {
  switch (expr.tag) {
    case "lit": return lit(0);
    case "param": return expr.name === paramName ? lit(1) : lit(0);

    case "add":
      return add(differentiate(expr.left, paramName), differentiate(expr.right, paramName));

    case "mul":
      // product rule: d(f*g) = f'*g + f*g'
      return add(
        mul(differentiate(expr.left, paramName), expr.right),
        mul(expr.left, differentiate(expr.right, paramName)),
      );

    case "div":
      // quotient rule: d(f/g) = (f'*g - f*g') / g^2
      return div(
        sub(
          mul(differentiate(expr.num, paramName), expr.den),
          mul(expr.num, differentiate(expr.den, paramName)),
        ),
        mul(expr.den, expr.den),
      );

    case "pow": {
      // d(f^g) = f^g * (g' * ln(f) + g * f'/f)
      const df = differentiate(expr.base, paramName);
      const dg = differentiate(expr.exp, paramName);
      return mul(
        pow(expr.base, expr.exp),
        add(
          mul(dg, log(expr.base)),
          mul(expr.exp, div(df, expr.base)),
        ),
      );
    }

    case "log":
      // d(ln(f)) = f'/f
      return div(differentiate(expr.arg, paramName), expr.arg);

    case "log10":
      // d(log10(f)) = f'/(f * ln(10))
      return div(differentiate(expr.arg, paramName), mul(expr.arg, lit(Math.LN10)));

    case "neg":
      return neg(differentiate(expr.arg, paramName));

    case "abs":
      // d|f| = sign(f) * f'
      return mul(div(expr.arg, abs(expr.arg)), differentiate(expr.arg, paramName));

    case "floor":
    case "ceil":
      // Not differentiable, return 0 (piecewise constant)
      return lit(0);

    case "min":
    case "max":
      // Return 0 — not differentiable in general
      return lit(0);

    case "cond":
      // Differentiate both branches (test is treated as constant w.r.t. param)
      return cond(expr.test, differentiate(expr.then, paramName), differentiate(expr.else_, paramName));
  }
}

// ─── Pretty Printing ────────────────────────────────────

export function pretty(expr: Expr): string {
  switch (expr.tag) {
    case "lit": {
      if (Number.isInteger(expr.value)) return expr.value.toString();
      if (Math.abs(expr.value) < 0.001 || Math.abs(expr.value) > 1e6) return expr.value.toExponential(2);
      return expr.value.toPrecision(4);
    }
    case "param": return expr.name;
    case "add": return `(${pretty(expr.left)} + ${pretty(expr.right)})`;
    case "mul": return `(${pretty(expr.left)} · ${pretty(expr.right)})`;
    case "div": return `(${pretty(expr.num)} / ${pretty(expr.den)})`;
    case "pow": return `${pretty(expr.base)}^${pretty(expr.exp)}`;
    case "log": return `ln(${pretty(expr.arg)})`;
    case "log10": return `log10(${pretty(expr.arg)})`;
    case "min": return `min(${expr.args.map(pretty).join(", ")})`;
    case "max": return `max(${expr.args.map(pretty).join(", ")})`;
    case "floor": return `floor(${pretty(expr.arg)})`;
    case "ceil": return `ceil(${pretty(expr.arg)})`;
    case "abs": return `|${pretty(expr.arg)}|`;
    case "neg": return `(-${pretty(expr.arg)})`;
    case "cond": return `if ${prettyBool(expr.test)} then ${pretty(expr.then)} else ${pretty(expr.else_)}`;
  }
}

export function prettyBool(expr: BoolExpr): string {
  switch (expr.tag) {
    case "lt": return `${pretty(expr.left)} < ${pretty(expr.right)}`;
    case "le": return `${pretty(expr.left)} <= ${pretty(expr.right)}`;
    case "eq": return `${pretty(expr.left)} = ${pretty(expr.right)}`;
    case "gt": return `${pretty(expr.left)} > ${pretty(expr.right)}`;
    case "ge": return `${pretty(expr.left)} >= ${pretty(expr.right)}`;
    case "and": return `(${prettyBool(expr.left)} && ${prettyBool(expr.right)})`;
    case "or": return `(${prettyBool(expr.left)} || ${prettyBool(expr.right)})`;
    case "not": return `!${prettyBool(expr.arg)}`;
    case "bool_lit": return expr.value ? "true" : "false";
  }
}
