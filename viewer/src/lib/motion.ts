/* =========================================================================
   Oratomic motion system.

   INVARIANT 1: no interface easing is ever used by a physics layer, and
                no physics easing is ever used by the interface.
   INVARIANT 2: QEC_PERIOD is the only value that never varies at a given
                time scale. Nothing may modulate it.
   ========================================================================= */

export const Layer = {
  ATOMIC:    'atomic',
  CODE:      'code',
  MAGIC:     'magic',
  ALGORITHM: 'algorithm',
  UI:        'ui',
} as const;
export type LayerType = typeof Layer[keyof typeof Layer];

/* ---------------------------------------------------------------- easing */

const clamp01 = (t: number) => Math.min(1, Math.max(0, t));

/** Quintic minimum-jerk. ATOMIC transport only — matches real AOD moves. */
export const minJerk = (t: number) => {
  const x = clamp01(t);
  return x * x * x * (10 - 15 * x + 6 * x * x);
};

/** Sine in-out. CODE layer only — the metronome breath. */
export const sineInOut = (t: number) => 0.5 * (1 - Math.cos(Math.PI * clamp01(t)));

/** Exponential decay. ATOMIC gate flash tail only. */
export const expOut = (t: number, k = 5) =>
  (1 - Math.exp(-k * clamp01(t))) / (1 - Math.exp(-k));

/** Spring, damping 25 / stiffness 200. UI layer only. */
export const uiSpring = { type: 'spring', stiffness: 200, damping: 25 } as const;
export const UI_EASE_CSS = 'cubic-bezier(0.16, 1, 0.3, 1)';

/* -------------------------------------------------------------- constants */

export const TIMING = {
  transport:     { dur: 400,  ease: minJerk,  interruptible: false },
  gateAttack:    { dur: 80,   ease: (t: number) => t },
  gateDecay:     { dur: 260,  ease: expOut },
  qecRound:      { dur: 1200, ease: sineInOut, interruptible: false },
  distillRounds: { min: 4, max: 7, pSuccess: 0.35 },
  algorithmTick: { wallMs: 90_000 },
  cameraDrift:   { radPerSec: 0.03, loopSec: 240, pauseOnHover: true },
  atomJitter:    { hz: 8, amplitudeLattice: 0.04 },
  scaleTransition: { dur: 800, easeCss: UI_EASE_CSS },
  ui:            { dur: 200, stagger: 40 },
} as const;

/** The one value nothing may modulate. */
export const QEC_PERIOD_MS = TIMING.qecRound.dur;

/* ------------------------------------------------------- the time telescope */

export const SCALE_STOPS = [
  { id: 'gate',       logRate: -6, label: 'gate scale',         legible: [Layer.ATOMIC] },
  { id: 'transport',  logRate: -3, label: 'transport scale',    legible: [Layer.ATOMIC] },
  { id: 'cycle',      logRate:  0, label: 'cycle scale',        legible: [Layer.CODE, Layer.ATOMIC] },
  { id: 'distill',    logRate:  2, label: 'distillation scale', legible: [Layer.MAGIC, Layer.CODE] },
  { id: 'block',      logRate:  5, label: 'logical block scale', legible: [Layer.MAGIC] },
  { id: 'algorithm',  logRate:  9, label: 'algorithm scale',    legible: [Layer.ALGORITHM] },
] as const;

export function layerVisibility(layer: LayerType, logRate: number) {
  const eventMs: Record<LayerType, number> = {
    [Layer.ATOMIC]:    0.001,
    [Layer.CODE]:      1,
    [Layer.MAGIC]:     6_000,
    [Layer.ALGORITHM]: 3.4e11,
    [Layer.UI]:        NaN,
  };
  const wallMs = eventMs[layer] / Math.pow(10, logRate) * 1000;
  if (wallMs > 60_000)  return { mode: 'frozen'  as const, alpha: 1 };
  if (wallMs > 60)      return { mode: 'discrete' as const, alpha: 1 };
  if (wallMs > 16)      return { mode: 'blurring' as const, alpha: 0.7 };
  return { mode: 'shimmer' as const, alpha: 0.35 };
}

export const SECTION_SCALE: Record<string, string> = {
  overview:     'cycle',
  architecture: 'transport',
  codes:        'cycle',
  surgery:      'cycle',
  magic:        'distill',
  resources:    'algorithm',
  simulator:    'cycle',
};

export function lerpLogRate(from: number, to: number, t: number) {
  const e = 1 - Math.pow(1 - clamp01(t), 3);
  return from + (to - from) * e;
}

/* ---------------------------------------------- producer / consumer engine */

export type SchedulerState = 'running' | 'stalled';

export interface MagicBuffer { count: number; capacity: number; }

export type SceneEvent =
  | { type: 'qec-round';      round: number }
  | { type: 'distill-begin';  endsAtRound: number }
  | { type: 'distill-commit'; buffer: number }
  | { type: 'distill-discard' }
  | { type: 'buffer-drain';   buffer: number }
  | { type: 'stall' }
  | { type: 'resume' }
  | { type: 'transport';  fromZone: string; toZone: string }
  | { type: 'gate-flash'; zone: string; wavelength: 420 | 780 };

export class Scheduler {
  tRounds = 0;
  state: SchedulerState = 'running';
  buffer: MagicBuffer = { count: 3, capacity: 8 };
  private attemptEndsAt = 0;
  private attemptActive = false;
  logicalOpsComplete = 0;

  constructor(private emit: (e: SceneEvent) => void) {}

  tickRound(rng: () => number = Math.random) {
    this.tRounds++;
    this.emit({ type: 'qec-round', round: this.tRounds });

    if (!this.attemptActive) {
      const { min, max } = TIMING.distillRounds;
      this.attemptEndsAt = this.tRounds + min + Math.floor(rng() * (max - min + 1));
      this.attemptActive = true;
      this.emit({ type: 'distill-begin', endsAtRound: this.attemptEndsAt });
    } else if (this.tRounds >= this.attemptEndsAt) {
      this.attemptActive = false;
      if (rng() < TIMING.distillRounds.pSuccess && this.buffer.count < this.buffer.capacity) {
        this.buffer.count++;
        this.emit({ type: 'distill-commit', buffer: this.buffer.count });
        if (this.state === 'stalled') {
          this.state = 'running';
          this.emit({ type: 'resume' });
        }
      } else {
        this.emit({ type: 'distill-discard' });
      }
    }

    if (this.state === 'running') {
      const needsMagic = this.tRounds % 3 === 0;
      if (needsMagic) {
        if (this.buffer.count > 0) {
          this.buffer.count--;
          this.emit({ type: 'buffer-drain', buffer: this.buffer.count });
          this.logicalOpsComplete++;
        } else {
          this.state = 'stalled';
          this.emit({ type: 'stall' });
        }
      }
    }
  }
}

/* -------------------------------------------------------------- zone geometry */

export const ZONES = {
  memory:    { lattice: 'square-dense',  spacing: 1.0, dotPx: 1.4, count: 5900 },
  processor: { lattice: 'square-sparse', spacing: 1.8, dotPx: 1.8, count: 1600 },
  magic:     { lattice: 'concentric',    spacing: 1.3, dotPx: 1.6, count: 1900 },
  readout:   { lattice: 'scatter',       spacing: 2.2, dotPx: 1.2, count: 2600 },
} as const;

/* -------------------------------------------------------------- idle life */

export const IDLE = {
  jitter: (i: number, tSec: number) => {
    const { hz, amplitudeLattice } = TIMING.atomJitter;
    return amplitudeLattice * Math.sin(2 * Math.PI * hz * tSec + i * 0.37);
  },
  lossRatePerAtomPerSec: 0.0004,
  reloadDelaySec: 2.5,
  cameraTheta: (tSec: number) => (tSec * TIMING.cameraDrift.radPerSec) % (2 * Math.PI),
};

/* -------------------------------------------------------------- bloom config */

export const BLOOM = {
  strength: 0.9,
  radius: 0.45,
  threshold: 0.82,
  grainIntensity: 0.045,
  chromaticAberration: 0.0012,
};
