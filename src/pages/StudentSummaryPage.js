import React, { useMemo, useState } from 'react';
import { getOverallClass } from '../utils/resultClass';

const classOptions = [
  { value: 'all', label: 'All classes' },
  { value: 'Distinction', label: 'Distinction (≥85%)' },
  { value: 'First Class', label: 'First Class (60–84.99%)' },
  { value: 'Second Class', label: 'Second Class (50–59.99%)' },
  { value: 'Pass Class', label: 'Pass Class (35–49.99%)' },
  { value: 'Fail', label: 'Fail (<35%)' },
];

function normCodePrefix(subject) {
  const c = String(subject.code || '').replace('*', '').trim();
  return c.slice(0, 2);
}

/** Marks for II PU language papers: 01 Kannada (K), 03 Hindi (H), 09 Sanskrit (S). */
function markForLangCode(student, codePrefix) {
  const sub = (student.subjects || []).find((s) => normCodePrefix(s).startsWith(codePrefix));
  if (!sub || sub.total === undefined || sub.total === null) return '—';
  return sub.total;
}

function markAtSubjectIndex(student, index) {
  const sub = (student.subjects || [])[index];
  if (!sub || sub.total === undefined || sub.total === null) return '—';
  return sub.total;
}

/** K/H/S = second language; Sub 1–5 = subjects[1]…[5] (English + four / five stream papers). II PU = 6 papers total. */
const SUMMARY_SUBJECT_HEADERS = [
  { key: 'K', title: 'Kannada (K)', kind: 'lang', code: '01' },
  { key: 'H', title: 'Hindi (H)', kind: 'lang', code: '03' },
  { key: 'S', title: 'Sanskrit (S)', kind: 'lang', code: '09' },
  { key: 'Sub 1', title: 'Sub 1 (English)', kind: 'idx', index: 1 },
  { key: 'Sub 2', title: 'Sub 2', kind: 'idx', index: 2 },
  { key: 'Sub 3', title: 'Sub 3', kind: 'idx', index: 3 },
  { key: 'Sub 4', title: 'Sub 4', kind: 'idx', index: 4 },
  { key: 'Sub 5', title: 'Sub 5', kind: 'idx', index: 5 },
];

function getSummaryRowMarks(student) {
  return SUMMARY_SUBJECT_HEADERS.map((h) => {
    if (h.kind === 'lang') return markForLangCode(student, h.code);
    return markAtSubjectIndex(student, h.index);
  });
}

function subjectForLangCode(student, codePrefix) {
  return (student.subjects || []).find((s) => normCodePrefix(s).startsWith(codePrefix)) || null;
}

/** Per summary column: whether that paper is failed (same rules as processedData subject.failed). */
function getSummaryRowFailFlags(student) {
  return SUMMARY_SUBJECT_HEADERS.map((h) => {
    if (h.kind === 'lang') {
      const sub = subjectForLangCode(student, h.code);
      return sub ? !!sub.failed : false;
    }
    const sub = (student.subjects || [])[h.index];
    return sub ? !!sub.failed : false;
  });
}

function getStudentClass(student) {
  return student.RES === 'NC' ? 'Fail' : getOverallClass(student.percentage);
}

function StudentSummaryPage({ processedData }) {
  const [sectionFilter, setSectionFilter] = useState('all');
  const [classFilter, setClassFilter] = useState('all');
  const [search, setSearch] = useState('');

  const filteredStudents = useMemo(() => {
    let list = processedData.allStudents;

    if (sectionFilter !== 'all') {
      list = list.filter((s) => s.section === sectionFilter);
    }

    if (classFilter !== 'all') {
      list = list.filter((s) => getStudentClass(s) === classFilter);
    }

    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((s) => {
        const name = String(s['CANDIDATE NAME'] || '').toLowerCase();
        const reg = String(s['REGISTER NUMBER'] || '').toLowerCase();
        return name.includes(q) || reg.includes(q);
      });
    }

    return [...list].sort((a, b) =>
      String(a['CANDIDATE NAME'] || '').localeCompare(String(b['CANDIDATE NAME'] || ''))
    );
  }, [processedData.allStudents, sectionFilter, classFilter, search]);

  const totalInDataset = processedData.allStudents.length;

  return (
    <div className="section-analysis-page student-summary-page">
      <div className="ds-field-row student-summary-filters">
        <label htmlFor="student-summary-section">Section</label>
        <select
          id="student-summary-section"
          className="ds-select"
          value={sectionFilter}
          onChange={(e) => setSectionFilter(e.target.value)}
        >
          <option value="all">All sections</option>
          {processedData.sections.map((sec) => (
            <option key={sec} value={sec}>
              {sec}
            </option>
          ))}
        </select>

        <label htmlFor="student-summary-class">Class</label>
        <select
          id="student-summary-class"
          className="ds-select"
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
        >
          {classOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <label htmlFor="student-summary-search">Search</label>
        <input
          id="student-summary-search"
          type="search"
          className="ds-input"
          placeholder="Name or register no."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoComplete="off"
        />
      </div>

      <p className="ds-insight" style={{ marginBottom: 'var(--ds-space-2)' }}>
        Showing <strong>{filteredStudents.length}</strong>
        {(filteredStudents.length !== totalInDataset || search.trim()) && (
          <>
            {' '}
            of <strong>{totalInDataset}</strong>
          </>
        )}{' '}
        student{filteredStudents.length !== 1 ? 's' : ''}
        {sectionFilter !== 'all' ? (
          <>
            {' '}
            in section <strong>{sectionFilter}</strong>
          </>
        ) : null}
        {classFilter !== 'all' ? (
          <>
            {' '}
            · Class: <strong>{classFilter}</strong>
          </>
        ) : null}
        {search.trim() ? ' · matching your search' : ''}.
        {sectionFilter === 'all' &&
        classFilter === 'all' &&
        !search.trim() &&
        filteredStudents.length === totalInDataset && (
          <span className="student-summary-roster-note"> Entire college roster.</span>
        )}
      </p>

      {filteredStudents.length === 0 ? (
        <div className="ds-empty" role="status">
          No students match the current filters. Try clearing search or widening class / section filters.
        </div>
      ) : (
        <div className="ds-table-scroll student-summary-table-wrap">
          <table className="ds-table heatmap-table student-summary-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Register</th>
                <th>Name</th>
                <th>Section</th>
                <th>Stream</th>
                {SUMMARY_SUBJECT_HEADERS.map((h) => (
                  <th key={h.key} title={h.title}>
                    {h.key}
                  </th>
                ))}
                <th>Total</th>
                <th>%</th>
                <th>Class</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student, idx) => {
                const marks = getSummaryRowMarks(student);
                const failFlags = getSummaryRowFailFlags(student);
                const rowClass = getStudentClass(student);
                const isFail = rowClass === 'Fail';
                return (
                  <tr
                    key={`${student['REGISTER NUMBER']}-${student.section}-${idx}`}
                    className={isFail ? 'student-summary-row--fail' : undefined}
                  >
                    <td className="ds-num">{idx + 1}</td>
                    <td>{student['REGISTER NUMBER']}</td>
                    <td className="subject-cell">{student['CANDIDATE NAME']}</td>
                    <td>{student.section}</td>
                    <td>{student.stream}</td>
                    {marks.map((m, i) => {
                      const h = SUMMARY_SUBJECT_HEADERS[i];
                      const paperFailed = failFlags[i];
                      return (
                        <td
                          key={h.key}
                          className={['ds-num', paperFailed ? 'student-summary-mark--fail' : '']
                            .filter(Boolean)
                            .join(' ')}
                          title={
                            paperFailed
                              ? `Failed / below requirement — ${h.title}`
                              : undefined
                          }
                        >
                          {m}
                        </td>
                      );
                    })}
                    <td className="ds-num ds-num--emphasis">{student['G.TOT'] ?? '—'}</td>
                    <td className="ds-num ds-num--emphasis">{student.percentage}%</td>
                    <td className={isFail ? 'student-summary-class--fail' : undefined}>{rowClass}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default StudentSummaryPage;
