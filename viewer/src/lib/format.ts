export function formatNumber(n: number): string {
  if (!isFinite(n) || isNaN(n)) return "\u2014";
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}k`;
  return n.toFixed(0);
}

export function formatSci(n: number): string {
  if (n === 0 || !isFinite(n) || isNaN(n)) return "\u2014";
  const exp = Math.floor(Math.log10(Math.abs(n)));
  const m = n / Math.pow(10, exp);
  return `${m.toFixed(1)}e${exp}`;
}

export function formatDays(d: number): string {
  if (!isFinite(d) || d < 0 || isNaN(d)) return "\u2014";
  if (d >= 365) return `${(d / 365).toFixed(1)} yr`;
  if (d >= 1) return `${d.toFixed(0)} days`;
  if (d >= 1 / 24) return `${(d * 24).toFixed(1)} hr`;
  return `${(d * 24 * 60).toFixed(0)} min`;
}
