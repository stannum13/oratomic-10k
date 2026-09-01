# Architecture Synthesis Engine — Design Spec

## Overview

A symbolic parametric intermediate representation (IR) and constraint-driven synthesis engine for fault-tolerant quantum computing architectures. Sits beneath the Oratomic viewer as Layers 0-3, turning the viewer from a visualization tool into a research compiler.

The engine represents quantum architectures as symbolic expressions where registers, dimensions, error rates, code sizes, and hardware costs remain unevaluated until a concrete instantiation is requested. This enables architecture-family reasoning: instead of evaluating one design at a time, we manipulate algebraic relationships between parameters and discover optimal regions via constraint solving.

## Architecture Stack

```
Layer 4: Viewer              — 3D visualization, parameter UI, MLX panels (DONE)
Layer 3: Experiment Engine   — Pareto search, reproducibility, comparison, export
Layer 2: Synthesis Engine    — constraint solvers, co-design optimization, inverse design
Layer 1: Code/Circuit Algebra — symbolic IR, polynomial rings, circuit hierarchy, TN topology
Layer 0: Compute Backends    — MLX, Stim, LDPC, TN libs, FPGA targets
```

This spec covers Layer 1 (primary) and Layer 3 (secondary). Layer 2 depends on research iteration. Layer 0 is partially done (MLX backend).

---

## Layer 1: Symbolic Parametric IR

### Core Principle

Every quantity in the system is either a **concrete value** or a **symbolic expression** over named parameters. The IR preserves algebraic structure until evaluation is explicitly requested.

### 1.1 Expression System

```typescript
// Symbolic expression tree
type Expr =
  | { tag: "lit"; value: number }                          // concrete literal
  | { tag: "param"; name: string }                         // named parameter
  | { tag: "add"; left: Expr; right: Expr }
  | { tag: "mul"; left: Expr; right: Expr }
  | { tag: "div"; num: Expr; den: Expr }
  | { tag: "pow"; base: Expr; exp: Expr }
  | { tag: "log"; arg: Expr }
  | { tag: "min"; args: Expr[] }
  | { tag: "max"; args: Expr[] }
  | { tag: "floor"; arg: Expr }
  | { tag: "ceil"; arg: Expr }
  | { tag: "cond"; test: BoolExpr; then: Expr; else: Expr } // conditional

type BoolExpr =
  | { tag: "lt"; left: Expr; right: Expr }
  | { tag: "le"; left: Expr; right: Expr }
  | { tag: "eq"; left: Expr; right: Expr }
  | { tag: "and"; left: BoolExpr; right: BoolExpr }
  | { tag: "or"; left: BoolExpr; right: BoolExpr }
  | { tag: "not"; arg: BoolExpr }
```

Operations:
- `evaluate(expr, bindings: Record<string, number>) → number` — substitute and compute
- `freeParams(expr) → Set<string>` — extract unbound parameter names
- `simplify(expr) → Expr` — algebraic simplification (constant folding, identity removal)
- `differentiate(expr, param) → Expr` — symbolic partial derivative for sensitivity analysis
- `substitute(expr, param, replacement) → Expr` — replace parameter with sub-expression
- `pretty(expr) → string` — human-readable rendering

### 1.2 Code Family IR

Represent qLDPC code families symbolically, not as isolated matrices.

```typescript
interface CodeFamily {
  name: string
  construction: "lifted-product" | "bivariate-bicycle" | "hypergraph-product" | "fiber-bundle"

  // Symbolic parameters
  params: {
    rA: Expr       // seed matrix rows
    nA: Expr       // seed matrix cols
    ell: Expr      // ring/lift order
  }

  // Derived quantities (symbolic)
  n: Expr          // physical qubits = (rA² + nA²) · ℓ
  k: Expr          // logical qubits ≥ (nA - rA)² · ℓ
  d: Expr          // distance (upper bound, may be symbolic)
  rate: Expr       // k / n
  stabWeight: Expr // rA + nA

  // Generating structure
  seedMatrix?: {
    ring: { type: "univariate"; order: Expr } | { type: "bivariate"; l: Expr; m: Expr }
    entries: Expr[][] // polynomial exponents (may be symbolic or concrete)
  }

  // Quality metrics (symbolic or computed)
  metrics?: {
    girth?: Expr
    expansion?: Expr
    pseudocodewordWeight?: Expr
  }

  // Constraints
  constraints: BoolExpr[] // e.g., d ≤ min((rA+1)!, (nA+1)!)
}
```

### 1.3 Circuit Hierarchy IR

Hierarchical circuit representation with symbolic resource tracking.

```typescript
interface CircuitNode {
  name: string
  type: "primitive" | "composite" | "repeat"

  // For primitives
  gate?: "toffoli" | "cnot" | "h" | "t" | "ccz" | "measure" | "ppm"

  // For composites — children with symbolic repetition
  children?: { node: CircuitNode; repeat: Expr }[]

  // Symbolic resource counts (propagated bottom-up)
  resources: {
    logicalQubits: Expr   // width
    toffoliCount: Expr    // non-Clifford gates
    toffoliDepth: Expr    // parallel layers of Toffoli
    cnotCount: Expr
    measurements: Expr
    tDepth: Expr
  }

  // Register lifetimes for ancilla allocation
  registers?: {
    name: string
    width: Expr
    lifetime: { start: Expr; end: Expr } // in terms of circuit depth
  }[]
}
```

The key property: `resources` fields are **symbolic expressions** over circuit parameters (bit length n, window size w, etc.). A ripple-carry adder has `toffoliCount = n`, a carry-lookahead has `toffoliCount = 5n - 3*log(n)`. Both exist as symbolic nodes; choosing between them is a synthesis decision.

### 1.4 Architecture IR

Ties together codes, circuits, and hardware into a complete design.

```typescript
interface Architecture {
  name: string

  // Hardware parameters (symbolic)
  hardware: {
    physicalErrorRate: Expr
    cycleTime: Expr           // ms
    gateTime: Expr            // us
    measurementTime: Expr     // us
    transportTime: Expr       // us
    decoderLatency: Expr      // us
    decoderThroughput: Expr   // Hz
  }

  // Code assignments
  memoryCode: CodeFamily
  processorCode: CodeFamily
  factoryCode: CodeFamily

  // Circuit
  circuit: CircuitNode

  // Zone qubit counts (symbolic)
  zones: {
    memory: Expr
    processor: Expr
    operation: Expr
    resource: Expr
  }

  // Derived costs (symbolic)
  costs: {
    totalQubits: Expr         // sum of zones
    blockErrorRate: Expr      // f(p, code distance)
    toffoliBudget: Expr       // log(0.9) / (τ_toff · log(1 - P_L))
    tauToff: Expr             // amortized cycles per Toffoli
    runtimeCycles: Expr       // toffoliCount × τ_toff
    runtimeDays: Expr         // runtimeCycles × cycleTime / 86400000
    feasible: BoolExpr        // toffoliBudget ≥ toffoliCount
    energyEstimate?: Expr     // optional power model
  }

  // Constraints that must hold for the architecture to be valid
  constraints: BoolExpr[]

  // Sensitivity: ∂cost/∂param for each cost and each hardware parameter
  sensitivity?: Record<string, Record<string, Expr>>
}
```

### 1.5 Instantiation and Evaluation

```typescript
// Binding set: concrete values for symbolic parameters
interface Bindings {
  [param: string]: number
}

// Evaluate an architecture at a specific point
function instantiate(arch: Architecture, bindings: Bindings): {
  totalQubits: number
  blockErrorRate: number
  runtimeDays: number
  feasible: boolean
  constraintsSatisfied: boolean
  // ... all costs evaluated
}

// Sweep: evaluate across a parameter range
function sweep(arch: Architecture, param: string, range: number[], fixed: Bindings): {
  points: { paramValue: number; costs: Record<string, number> }[]
  feasibleRange: [number, number] | null
  bottleneck: string // which cost dominates
}

// Pareto: find non-dominated points across two cost dimensions
function pareto(arch: Architecture, costX: string, costY: string, paramGrid: Bindings[]): {
  paretoFrontier: { x: number; y: number; bindings: Bindings }[]
  dominated: { x: number; y: number; bindings: Bindings }[]
}
```

### 1.6 Sensitivity and Bottleneck Detection

```typescript
// Compute symbolic sensitivity: ∂cost/∂param
function sensitivity(arch: Architecture, cost: string, param: string): Expr

// Detect which parameter dominates a cost in a given regime
function bottleneck(arch: Architecture, bindings: Bindings): {
  runtime: string     // e.g., "decoderLatency" or "transportTime"
  qubits: string      // e.g., "memoryCode.n" or "factoryCode.n"
  errorRate: string   // e.g., "physicalErrorRate" or "memoryCode.d"
}

// Detect regime transitions: where does the bottleneck change?
function regimeTransitions(arch: Architecture, param: string, range: [number, number]): {
  transitions: { value: number; from: string; to: string }[]
}
```

---

## Layer 3: Experiment Engine

### 3.1 Reproducibility

Every computation produces an artifact with full provenance:

```typescript
interface ExperimentArtifact {
  id: string                    // content-addressed hash
  timestamp: string
  engineVersion: string

  // What was computed
  architecture: Architecture    // symbolic, before instantiation
  bindings: Bindings
  results: Record<string, number>

  // How it was computed
  backend: string               // "js" | "mlx" | "stim" | "exact"
  seed?: number
  computeTimeMs: number

  // Assumptions explicitly listed
  assumptions: string[]
}
```

### 3.2 Export Formats

```typescript
function exportStim(arch: Architecture, bindings: Bindings): string        // Stim circuit
function exportOpenQASM(circuit: CircuitNode, bindings: Bindings): string  // OpenQASM 3.0
function exportParityCheck(code: CodeFamily, bindings: Bindings): {        // H_X, H_Z as sparse matrices
  hX: { rows: number; cols: number; entries: [number, number][] }
  hZ: { rows: number; cols: number; entries: [number, number][] }
}
function exportSyndromeDataset(                                            // for ML training
  code: CodeFamily,
  bindings: Bindings,
  errorRates: number[],
  samplesPerRate: number
): { syndromes: Uint8Array[]; errors: Uint8Array[]; rates: number[] }
```

### 3.3 Comparison and Pareto

Side-by-side comparison of architecture families, not just single points.

```typescript
interface ArchitectureComparison {
  architectures: { name: string; arch: Architecture; bindings: Bindings }[]
  metrics: string[]   // which costs to compare
  paretoFrontiers: Record<string, { x: number; y: number; archIndex: number }[]>
  dominanceMatrix: boolean[][] // does arch[i] dominate arch[j] on all metrics?
}
```

---

## Layer 1 Implementation Scope (This Build)

### What we build now:

1. **Expression system** — `Expr`, `BoolExpr`, `evaluate`, `simplify`, `freeParams`, `differentiate`, `pretty`
2. **Code family IR** — symbolic code representation with LP/BB constructors
3. **Architecture IR** — the Oratomic paper's architectures encoded symbolically
4. **Instantiation** — evaluate at a point, replacing the current `js-compute.ts` lookup tables
5. **Sweep + Pareto** — symbolic-aware versions of the current parameter sweep
6. **Sensitivity** — symbolic partial derivatives showing which parameters dominate
7. **Export** — parity check matrix export (extends existing LP code construction)
8. **Connect to viewer** — wire the symbolic engine into the Zustand store alongside existing compute

### What we defer:

- Constraint solvers (SMT/MILP) — needs Z3/OR-Tools integration
- Equality saturation — needs e-graph library
- Inverse design — depends on constraint solvers
- Active experiment selection — research problem
- Circuit IR with register-lifetime tracking — build after expression system proves out
- Stim/OpenQASM export — straightforward but lower priority than core algebra

### File Structure

```
viewer/src/
  engine/
    expr.ts              — expression tree, evaluate, simplify, differentiate, pretty
    bool-expr.ts         — boolean expression tree, evaluate
    code-family.ts       — CodeFamily type, LP/BB constructors, symbolic parameters
    circuit-ir.ts        — CircuitNode type, resource propagation (stub for now)
    architecture.ts      — Architecture type, Oratomic paper architectures
    instantiate.ts       — evaluate architecture at a point
    sweep.ts             — parameter sweep, Pareto frontier computation
    sensitivity.ts       — symbolic differentiation, bottleneck detection
    export.ts            — parity check matrix, syndrome dataset export
```
