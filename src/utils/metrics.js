import { getOverallClass } from './resultClass';

/** Counts per result band (Distinction … Fail). */
export function computeClassDistribution(allStudents) {
  const empty = {
    Distinction: 0,
    'First Class': 0,
    'Second Class': 0,
    'Pass Class': 0,
    Fail: 0,
  };
  if (!allStudents?.length) {
    return { ...empty, total: 0, passed: 0 };
  }
  const counts = { ...empty };
  allStudents.forEach((s) => {
    counts[getOverallClass(s.percentage)] += 1;
  });
  const total = allStudents.length;
  const passed = total - counts.Fail;
  return { ...counts, total, passed };
}

/** College-wide KPIs from processed student list */
export function computeGlobalKpis(allStudents) {
  if (!allStudents?.length) {
    return {
      totalStudents: 0,
      passPercent: '0.0',
      distinctionCount: 0,
      topScore: 0,
    };
  }
  const dist = computeClassDistribution(allStudents);
  let topScore = 0;
  allStudents.forEach((s) => {
    const tot = parseFloat(s['G.TOT']) || 0;
    if (tot > topScore) topScore = tot;
  });
  return {
    totalStudents: dist.total,
    passPercent: ((dist.passed / dist.total) * 100).toFixed(1),
    distinctionCount: dist.Distinction,
    topScore,
  };
}
