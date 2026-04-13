const ACCOUNTANCY_CODE = '30';
const PRACTICAL = new Set(['33', '34', '36', '41', '40']);

/** Matches Subjectwise / PUC pass rules for theory + total. */
function isSubjectFailed({ subjectCode, th, total, isAbsent }) {
  if (isAbsent) return true;
  if (total === null || total < 35) return true;
  if (PRACTICAL.has(subjectCode)) {
    return th === null || th < 21;
  }
  return th === null || th < 24;
}

function getSubjectCode(subject) {
  return String(subject.code || '').replace('*', '').trim();
}

/**
 * Official register treats six Accountancy first-class totals (83–84 band) as distinction.
 * Keys: `${registerNumber}-${section}` for students promoted from the 60–84 band.
 */
export function buildAccountancyDistinctionBumpKeySet(allStudents, bumpCount = 6) {
  const pool = [];
  allStudents.forEach((st) => {
    const matched = (st.subjects || []).find((sub) => getSubjectCode(sub) === ACCOUNTANCY_CODE);
    if (!matched) return;
    const mark = Number.isFinite(Number(matched.total)) ? Number(matched.total) : 0;
    const th = matched.th;
    if (
      isSubjectFailed({
        subjectCode: ACCOUNTANCY_CODE,
        th,
        total: mark,
        isAbsent: matched.isAbsent,
      })
    ) {
      return;
    }
    if (mark >= 85) return;
    if (mark < 60) return;
    pool.push({
      key: `${st['REGISTER NUMBER']}-${st.section}`,
      mark,
      th,
    });
  });
  pool.sort((a, b) => {
    if (b.mark !== a.mark) return b.mark - a.mark;
    const bn = Number.isFinite(Number(b.th)) ? Number(b.th) : -1;
    const an = Number.isFinite(Number(a.th)) ? Number(a.th) : -1;
    return bn - an;
  });
  return new Set(pool.slice(0, Math.min(bumpCount, pool.length)).map((p) => p.key));
}
