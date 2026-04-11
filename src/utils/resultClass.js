/** Overall result band from percentage (aligned with II PU summary / filters). */
export function getOverallClass(pct) {
  const p = parseFloat(pct) || 0;
  if (p >= 85) return 'Distinction';
  if (p >= 60) return 'First Class';
  if (p >= 50) return 'Second Class';
  if (p >= 35) return 'Pass Class';
  return 'Fail';
}
