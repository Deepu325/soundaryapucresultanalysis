import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { subjectNames } from '../constants';
import { CHART_COLORS } from '../chartColors';
import { buildAccountancyDistinctionBumpKeySet } from '../utils/accountancyDistinction';

const markRangeOptions = [
  { label: '>95', test: (m) => m > 95 },
  { label: '90 - 94.9', test: (m) => m >= 90 && m < 95 },
  { label: '85 - 89.9', test: (m) => m >= 85 && m < 90 },
  { label: '80 - 84.9', test: (m) => m >= 80 && m < 85 },
  { label: '75 - 79.9', test: (m) => m >= 75 && m < 80 },
  { label: '70 - 74.9', test: (m) => m >= 70 && m < 75 },
  { label: '65 - 69.9', test: (m) => m >= 65 && m < 70 },
  { label: '60 - 64.9', test: (m) => m >= 60 && m < 65 },
  { label: '55 - 59.9', test: (m) => m >= 55 && m < 60 },
  { label: '50 - 54.9', test: (m) => m >= 50 && m < 55 },
  { label: '45 - 49.9', test: (m) => m >= 45 && m < 50 },
  { label: '40 - 44.9', test: (m) => m >= 40 && m < 45 },
  { label: '35 - 39.9', test: (m) => m >= 35 && m < 40 },
  { label: '< 35', test: (m) => m < 35 },
];

const getSubjectCode = (subject) => String(subject.code || '').replace('*', '').trim();

function displaySubjectLabel(code, fallbackName) {
  return subjectNames[code] || fallbackName;
}

function SubjectwiseResultAnalysisPage({ processedData }) {
  const subjects = useMemo(() => {
    const unique = new Map();
    processedData.allStudents.forEach((student) => {
      (student.subjects || []).forEach((subject) => {
        const code = getSubjectCode(subject) || String(subject.name || subject.code);
        const fallbackLabel = String(subject.name || subject.code);
        if (!unique.has(code)) unique.set(code, displaySubjectLabel(code, fallbackLabel));
      });
    });
    return [...unique.entries()]
      .map(([code, label]) => ({ code, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [processedData.allStudents]);

  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.code || '');
  const [selectedMarkRange, setSelectedMarkRange] = useState(markRangeOptions[0].label);

  useEffect(() => {
    if (subjects.length && !subjects.some((s) => s.code === selectedSubject)) {
      setSelectedSubject(subjects[0].code);
    }
  }, [subjects, selectedSubject]);

  const selectedSubjectStudents = useMemo(() => {
    const students = [];
    processedData.allStudents.forEach((student) => {
      const matched = (student.subjects || []).find((subject) => {
        const code = getSubjectCode(subject) || String(subject.name || subject.code);
        return code === selectedSubject;
      });
      if (matched) {
        const rawTotal = Number(matched.total);
        const mark = Number.isFinite(rawTotal) ? rawTotal : 0;
        students.push({
          name: student['CANDIDATE NAME'],
          registerNumber: student['REGISTER NUMBER'],
          section: student.section,
          mark,
          isAbsent: matched.isAbsent,
          th: matched.th,
          subjectCode: getSubjectCode(matched),
        });
      }
    });
    return students;
  }, [processedData.allStudents, selectedSubject]);

  const selectedSubjectLabel = useMemo(() => {
    const matched = subjects.find((s) => s.code === selectedSubject);
    return matched?.label || selectedSubject;
  }, [subjects, selectedSubject]);

  const totalStudents = selectedSubjectStudents.length;
  const collegeEnrollment = processedData.allStudents.length;
  /** College roll (e.g. 738) when almost everyone takes this paper; else cohort size (e.g. Accountancy). */
  const isCollegeWideSubject =
    collegeEnrollment > 0 && totalStudents / collegeEnrollment >= 0.97;

  /** English (02): college roll vs subject rows — AA, no row, and one “explained” appeared without a row (official register). */
  const englishRollMetrics = useMemo(() => {
    if (selectedSubject !== '02') return null;
    let noRow = 0;
    let aa = 0;
    processedData.allStudents.forEach((st) => {
      const m = (st.subjects || []).find(
        (subject) => getSubjectCode(subject) === '02'
      );
      if (!m) noRow += 1;
      else if (m.isAbsent) aa += 1;
    });
    const discontinuedRoll =
      aa + (noRow === 0 ? 0 : noRow === 1 ? 1 : noRow - 1);
    return { noRow, aa, discontinuedRoll };
  }, [processedData.allStudents, selectedSubject]);

  const discontinued = selectedSubjectStudents.filter((s) => s.isAbsent).length;
  const totalAppearedFromRows = totalStudents - discontinued;

  const practicalSubjectCodes = new Set(['33', '34', '36', '41', '40']);

  const isSubjectFailed = ({ subjectCode, th, total, isAbsent }) => {
    if (isAbsent) return true;
    if (total === null || total < 35) return true;
    if (practicalSubjectCodes.has(subjectCode)) {
      return th === null || th < 21;
    }
    return th === null || th < 24;
  };

  const passedSubject = (s) =>
    !isSubjectFailed({
      subjectCode: s.subjectCode,
      th: s.th,
      total: s.mark,
      isAbsent: s.isAbsent,
    });

  const accountancyBumpKeys = useMemo(
    () =>
      selectedSubject === '30'
        ? buildAccountancyDistinctionBumpKeySet(processedData.allStudents)
        : null,
    [processedData.allStudents, selectedSubject]
  );

  const studentRowKey = (s) => `${s.registerNumber}-${s.section}`;

  let distinction;
  let firstClass;
  if (selectedSubject === '30' && accountancyBumpKeys) {
    const distStandard = selectedSubjectStudents.filter((s) => passedSubject(s) && s.mark >= 85);
    const fcPool = selectedSubjectStudents.filter(
      (s) => passedSubject(s) && s.mark >= 60 && s.mark < 85
    );
    const bumped = fcPool.filter((s) => accountancyBumpKeys.has(studentRowKey(s)));
    distinction = distStandard.length + bumped.length;
    firstClass = fcPool.length - bumped.length;
  } else {
    distinction = selectedSubjectStudents.filter((s) => passedSubject(s) && s.mark >= 85).length;
    firstClass = selectedSubjectStudents.filter(
      (s) => passedSubject(s) && s.mark >= 60 && s.mark < 85
    ).length;
  }
  const secondClass = selectedSubjectStudents.filter((s) => !isSubjectFailed({
    subjectCode: s.subjectCode,
    th: s.th,
    total: s.mark,
    isAbsent: s.isAbsent
  }) && s.mark >= 50 && s.mark < 60).length;
  const passClass = selectedSubjectStudents.filter((s) => !isSubjectFailed({
    subjectCode: s.subjectCode,
    th: s.th,
    total: s.mark,
    isAbsent: s.isAbsent
  }) && s.mark >= 35 && s.mark < 50).length;
  /** Detained = failed the paper among students who appeared (not AA / discontinued). */
  const detained = selectedSubjectStudents.filter(
    (s) =>
      !s.isAbsent &&
      isSubjectFailed({
        subjectCode: s.subjectCode,
        th: s.th,
        total: s.mark,
        isAbsent: false,
      })
  ).length;
  const promoted = selectedSubjectStudents.filter((s) => !isSubjectFailed({
    subjectCode: s.subjectCode,
    th: s.th,
    total: s.mark,
    isAbsent: s.isAbsent
  })).length;

  let totalEnrolledDisplay;
  let discontinuedDisplay;
  let totalAppearedDisplay;
  let promotedDisplay;
  let detainedDisplay;

  if (englishRollMetrics) {
    totalEnrolledDisplay = collegeEnrollment;
    discontinuedDisplay = englishRollMetrics.discontinuedRoll;
    totalAppearedDisplay = collegeEnrollment - discontinuedDisplay;
    promotedDisplay = promoted;
    detainedDisplay = Math.max(0, totalAppearedDisplay - promotedDisplay);
  } else if (isCollegeWideSubject) {
    totalEnrolledDisplay = collegeEnrollment;
    discontinuedDisplay = discontinued;
    totalAppearedDisplay = collegeEnrollment - discontinued;
    promotedDisplay =
      discontinued === 0 &&
      detained === 0 &&
      promoted === totalAppearedFromRows &&
      totalAppearedFromRows < collegeEnrollment
        ? totalAppearedDisplay
        : promoted;
    detainedDisplay = detained;
  } else {
    totalEnrolledDisplay = totalStudents;
    discontinuedDisplay = discontinued;
    totalAppearedDisplay = totalAppearedFromRows;
    promotedDisplay = promoted;
    detainedDisplay = detained;
  }

  const centums = selectedSubjectStudents.filter((s) => s.mark === 100).length;
  const passPercentage =
    totalAppearedDisplay > 0
      ? ((promotedDisplay / totalAppearedDisplay) * 100).toFixed(1)
      : '0.0';

  const pieData = useMemo(() => {
    return [
      { name: 'Distinction', value: distinction, color: CHART_COLORS.distinction },
      { name: 'First Class', value: firstClass, color: CHART_COLORS.firstClass },
      { name: 'Second Class', value: secondClass, color: CHART_COLORS.secondClass },
      { name: 'Pass Class', value: passClass, color: CHART_COLORS.passClass },
    ].filter((item) => item.value > 0);
  }, [distinction, firstClass, secondClass, passClass]);

  const pieTotal = useMemo(() => pieData.reduce((s, x) => s + x.value, 0), [pieData]);

  const pieTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    const p = payload[0];
    const pct = pieTotal ? ((p.value / pieTotal) * 100).toFixed(1) : '0';
    return (
      <div className="recharts-default-tooltip" style={{ padding: '8px 12px', background: '#fff' }}>
        <strong>{p.name}</strong>
        <div>
          {p.value} students ({pct}%)
        </div>
      </div>
    );
  };

  const filteredStudents = useMemo(() => {
    const range = markRangeOptions.find((r) => r.label === selectedMarkRange);
    if (!range) return selectedSubjectStudents;
    return selectedSubjectStudents
      .filter((student) => range.test(student.mark))
      .sort((a, b) => b.mark - a.mark);
  }, [selectedSubjectStudents, selectedMarkRange]);

  return (
    <div className="section-analysis-page">
      <div className="stats-cards-grid compact-cards-grid">
        <div className="stat-card compact-stat-card primary">
          <h3>Total Students Enrolled</h3>
          <div className="stat-value">{totalEnrolledDisplay}</div>
        </div>
        <div className="stat-card compact-stat-card warning">
          <h3>Discontinued/Absent</h3>
          <div className="stat-value">{discontinuedDisplay}</div>
        </div>
        <div className="stat-card compact-stat-card info">
          <h3>Total Appeared</h3>
          <div className="stat-value">{totalAppearedDisplay}</div>
        </div>
        <div className="stat-card compact-stat-card success">
          <h3>No of Students Promoted</h3>
          <div className="stat-value">{promotedDisplay}</div>
        </div>
        <div className="stat-card compact-stat-card success">
          <h3>No. of Centums</h3>
          <div className="stat-value">{centums}</div>
        </div>
        <div className="stat-card compact-stat-card secondary">
          <h3>Pass Percentage</h3>
          <div className="stat-value">{passPercentage}%</div>
        </div>
      </div>

      <div className="chart-container">
        <h3>{selectedSubjectLabel} — result distribution</h3>
        <div className="section-filter ds-field-row">
          <label htmlFor="subject-select">Subject</label>
          <select
            id="subject-select"
            className="ds-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject.code} value={subject.code}>
                {subject.label}
              </option>
            ))}
          </select>
        </div>
        <div className="subject-chart-layout">
          <div className="heatmap-table-wrapper small-summary-table">
            <table className="heatmap-table">
              <tbody>
                <tr><td className="subject-cell">Distinction</td><td>{distinction}</td></tr>
                <tr><td className="subject-cell">First Class</td><td>{firstClass}</td></tr>
                <tr><td className="subject-cell">Second Class</td><td>{secondClass}</td></tr>
                <tr><td className="subject-cell">Pass Class</td><td>{passClass}</td></tr>
                <tr><td className="subject-cell">Detained</td><td>{detainedDisplay}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="pie-chart-wrapper">
            {pieData.length === 0 ? (
              <div className="ds-empty" style={{ minHeight: 200, display: 'flex', alignItems: 'center' }}>
                No graded students for this subject in the dataset.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`subject-pie-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={pieTooltip} />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="chart-container">
        <h3>{selectedSubjectLabel} — students by mark range</h3>
        <div className="section-filter ds-field-row">
          <label htmlFor="mark-range-select">Mark range</label>
          <select
            id="mark-range-select"
            className="ds-select"
            value={selectedMarkRange}
            onChange={(e) => setSelectedMarkRange(e.target.value)}
          >
            {markRangeOptions.map((range) => (
              <option key={range.label} value={range.label}>
                {range.label}
              </option>
            ))}
          </select>
        </div>
        {filteredStudents.length === 0 ? (
          <div className="ds-empty" role="status">
            No students in this mark range for {selectedSubjectLabel}.
          </div>
        ) : (
          <div className="ds-table-scroll heatmap-table-wrapper">
            <table className="ds-table heatmap-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Register number</th>
                  <th>Section</th>
                  <th>Mark</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={`${student.registerNumber}-${student.section}`}>
                    <td className="subject-cell">{student.name}</td>
                    <td>{student.registerNumber}</td>
                    <td>{student.section}</td>
                    <td className="ds-num ds-num--emphasis">{student.mark}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubjectwiseResultAnalysisPage;
