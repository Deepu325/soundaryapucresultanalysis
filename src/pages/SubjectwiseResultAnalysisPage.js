import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

const PRACTICAL_SUBJECT_CODES = new Set(['33', '34', '36', '41', '40']);

const getSubjectCode = (subject) => String(subject.code || '').replace('*', '').trim();
const YEARWISE_SUBJECT_MAP = {
  '01': 'KAN',
  '02': 'ENG',
  '03': 'HIN',
  '09': 'SANS',
  '22': 'ECO',
  '27': 'B.STU',
  '29': 'P.SCI',
  '30': 'ACC',
  '31': 'STAT',
  '33': 'PHY',
  '34': 'CHE',
  '35': 'MAT',
  '36': 'BIO',
  '40': 'ELE',
  '41': 'C.SCI',
  '75': 'B.MAT',
  '78': 'B.MAT',
};

const SUBJECT_SECTION_TEACHERS = {
  '01': {
    'PCMB A': 'HM',
    'PCMB-B': 'TK',
    'PCMB-C': 'NL',
    'PCMB-D': 'PD',
    'PCMB-E': 'HM',
    'PCMC-F': 'HM',
    'CEBA-C1': 'HM',
    'CEBA-C2': 'NL',
    'CEBA-C3': 'NL',
    'SEBA-C4': 'TK',
    'MEBA-C5': 'PD',
    'MSBA-C5': 'TK',
    'CSBA-C6': 'PD',
    'PEBA-C5': 'HM',
  },
  '02': {
    'PCMB A': 'CS',
    'PCMB-B': 'SC',
    'PCMB-C': 'SP',
    'PCMB-D': 'CS',
    'PCMB-E': 'SP',
    'PCME-E': 'SP',
    'PCMC-F': 'SC',
    'CEBA-C1': 'SC/SP',
    'CEBA-C2': 'CS/SC',
    'CEBA-C3': 'CS/SD',
    'SEBA-C4': 'SD/CS',
    'MEBA-C5': 'SP',
    'MSBA-C5': 'SP',
    'CSBA-C6': 'SD/SC',
    'PEBA-C5': 'SP',
  },
  '33': {
    'PCMB A': 'KK/BI',
    'PCMB-B': 'KK/BI',
    'PCMB-C': 'AG/VG',
    'PCMB-D': 'AG/VG',
    'PCMB-E': 'KK/VG',
    'PCME-C': 'AG/VG',
    'PCME-E': 'AG/VG',
    'PCMC-F': 'AG/BI',
  },
  '34': {
    'PCMB A': 'RV/CK',
    'PCMB-B': 'BRR/BK',
    'PCMB-C': 'RV/BRR',
    'PCMB-D': 'RV/BRR',
    'PCMB-E': 'RV/CK',
    'PCMC-F': 'BRR/BK',
  },
  '35': {
    'PCMB A': 'CSS',
    'PCMB-B': 'SY',
    'PCMB-C': 'NS/SY',
    'PCMB-D': 'NS/SY',
    'PCMB-E': 'NS',
    'PCMC-F': 'NS/CSS',
  },
  '36': {
    'PCMB A': 'SM/JH',
    'PCMB-B': 'JJH/RK',
    'PCMB-C': 'SM/JH',
    'PCMB-D': 'SM/RK/SSM',
    'PCMB-E': 'SM/JH',
  },
  '41': {
    'PCMC-C': 'SU',
    'PCMC-F': 'SU',
    'CEBA-C1': 'VD',
    'CEBA-C2': 'SR',
    'CEBA-C3': 'VD/SR',
    'CSBA-C6': 'BA',
  },
  '27': {
    'CEBA-C1': 'AGK',
    'CEBA-C2': 'UR',
    'CEBA-C3': 'KK',
    'SEBA-C4': 'DM',
    'MEBA-C5': 'PR',
    'MSBA-C5': 'PR',
    'CSBA-C6': 'CPM',
    'PEBA-C5': 'PR',
  },
  '30': {
    'CEBA-C1': 'DM',
    'CEBA-C2': 'PR',
    'CEBA-C3': 'CPM',
    'SEBA-C4': 'KK',
    'MEBA-C5': 'UR',
    'MSBA-C5': 'UR',
    'CSBA-C6': 'AGK',
    'PEBA-C5': 'UR',
  },
  '22': {
    'CEBA-C1': 'VK',
    'CEBA-C2': 'VK',
    'CEBA-C3': 'NS',
    'SEBA-C4': 'NS',
    'MEBA-C5': 'NS',
    'PEBA-C5': 'NS',
  },
};

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
  const [selectedStreamFilter, setSelectedStreamFilter] = useState('all');
  const [yearWiseData, setYearWiseData] = useState(null);

  useEffect(() => {
    if (subjects.length && !subjects.some((s) => s.code === selectedSubject)) {
      setSelectedSubject(subjects[0].code);
    }
  }, [subjects, selectedSubject]);

  useEffect(() => {
    let cancelled = false;
    fetch('./year-wise-analysis.json')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) setYearWiseData(json);
      })
      .catch(() => {
        if (!cancelled) setYearWiseData(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const isLanguageOrCsSubject = useMemo(
    () => ['01', '02', '03', '09', '41'].includes(selectedSubject),
    [selectedSubject]
  );

  useEffect(() => {
    if (!isLanguageOrCsSubject && selectedStreamFilter !== 'all') {
      setSelectedStreamFilter('all');
    }
  }, [isLanguageOrCsSubject, selectedStreamFilter]);

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
          stream: student.stream,
          mark,
          isAbsent: matched.isAbsent,
          th: matched.th,
          subjectCode: getSubjectCode(matched),
        });
      }
    });
    return students;
  }, [processedData.allStudents, selectedSubject]);

  const englishSectionExpectedAppeared = useMemo(() => {
    if (selectedSubject !== '02') return new Map();
    const bySection = new Map();

    processedData.allStudents.forEach((student) => {
      const section = student.section;
      if (!bySection.has(section)) {
        bySection.set(section, { total: 0, noRow: 0, aa: 0 });
      }
      const bucket = bySection.get(section);
      bucket.total += 1;

      const english = (student.subjects || []).find((subject) => getSubjectCode(subject) === '02');
      if (!english) {
        bucket.noRow += 1;
      } else if (english.isAbsent) {
        bucket.aa += 1;
      }
    });

    const expectedAppeared = new Map();
    bySection.forEach((bucket, section) => {
      const discontinued =
        bucket.aa + (bucket.noRow === 0 ? 0 : bucket.noRow === 1 ? 1 : bucket.noRow - 1);
      expectedAppeared.set(section, Math.max(0, bucket.total - discontinued));
    });
    return expectedAppeared;
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

  const isSubjectFailed = useCallback(({ subjectCode, th, total, isAbsent }) => {
    if (isAbsent) return true;
    if (total === null || total < 35) return true;
    if (PRACTICAL_SUBJECT_CODES.has(subjectCode)) {
      return th === null || th < 21;
    }
    return th === null || th < 24;
  }, []);

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

  const sectionWiseRows = useMemo(() => {
    const bySection = new Map();
    selectedSubjectStudents.forEach((student) => {
      if (!bySection.has(student.section)) {
        bySection.set(student.section, {
          section: student.section,
          stream: student.stream,
          appeared: 0,
          distinction: 0,
          firstClass: 0,
          secondClass: 0,
          passClass: 0,
          fail: 0,
          promoted: 0,
          centums: 0,
          markTotal: 0,
        });
      }
      const row = bySection.get(student.section);
      if (student.isAbsent) return;

      row.appeared += 1;
      row.markTotal += student.mark;
      if (student.mark === 100) row.centums += 1;
      const failed = isSubjectFailed({
        subjectCode: student.subjectCode,
        th: student.th,
        total: student.mark,
        isAbsent: false,
      });

      if (failed) {
        row.fail += 1;
        return;
      }

      row.promoted += 1;
      const bumpedDistinction =
        selectedSubject === '30' && accountancyBumpKeys?.has(studentRowKey(student)) && student.mark >= 60 && student.mark < 85;

      if (student.mark >= 85 || bumpedDistinction) row.distinction += 1;
      else if (student.mark >= 60) row.firstClass += 1;
      else if (student.mark >= 50) row.secondClass += 1;
      else if (student.mark >= 35) row.passClass += 1;
      else row.fail += 1;
    });

    return [...bySection.values()]
      .map((row) => {
        const adjustedAppeared =
          selectedSubject === '02' ? (englishSectionExpectedAppeared.get(row.section) ?? row.appeared) : row.appeared;
        const adjustedFail =
          selectedSubject === '02' ? Math.max(0, adjustedAppeared - row.promoted) : row.fail;
        return {
          ...row,
          appeared: adjustedAppeared,
          fail: adjustedFail,
          passPercent: adjustedAppeared > 0 ? ((row.promoted / adjustedAppeared) * 100).toFixed(1) : '0.0',
          classAvg: adjustedAppeared > 0 ? (row.markTotal / adjustedAppeared).toFixed(2) : '0.00',
        };
      })
      .sort((a, b) => a.section.localeCompare(b.section));
  }, [selectedSubjectStudents, selectedSubject, accountancyBumpKeys, englishSectionExpectedAppeared, isSubjectFailed]);

  const filteredSectionWiseRows = useMemo(() => {
    if (!isLanguageOrCsSubject || selectedStreamFilter === 'all') return sectionWiseRows;
    const expectedStream = selectedStreamFilter === 'science' ? 'Science' : 'Commerce';
    return sectionWiseRows.filter((row) => row.stream === expectedStream);
  }, [sectionWiseRows, selectedStreamFilter, isLanguageOrCsSubject]);

  const sectionHeatMax = useMemo(() => {
    if (!filteredSectionWiseRows.length) return 1;
    return Math.max(
      ...filteredSectionWiseRows.flatMap((row) => [
        row.appeared,
        row.distinction,
        row.firstClass,
        row.secondClass,
        row.passClass,
        row.fail,
        row.centums,
      ]),
      1
    );
  }, [filteredSectionWiseRows]);

  const heatCellStyle = (value, isFail = false) => {
    if (value === 0) return { backgroundColor: '#ffffff' };
    const intensity = value / sectionHeatMax;
    if (isFail) return { backgroundColor: `rgba(220, 38, 38, ${0.18 + intensity * 0.6})` };
    const hue = Math.round(intensity * 120);
    return { backgroundColor: `hsla(${hue}, 85%, 45%, ${0.18 + intensity * 0.55})` };
  };

  const sectionLabelWithTeacher = (section) => {
    const subjectTeachers = SUBJECT_SECTION_TEACHERS[selectedSubject] || {};
    let initials = subjectTeachers[section];
    if (!initials && section === 'PCMC-C') initials = subjectTeachers['PCME-C'] || subjectTeachers['PCMB-C'];
    if (!initials && section === 'PCME-C') initials = subjectTeachers['PCMC-C'] || subjectTeachers['PCMB-C'];
    return initials ? `${section} (${initials})` : section;
  };

  const officialTotalsRow = useMemo(() => {
    const yearwiseSubject = YEARWISE_SUBJECT_MAP[selectedSubject];
    if (!yearwiseSubject || !yearWiseData?.records?.length) return null;
    const years = yearWiseData.years || ['2024-25', '2025-26'];
    const latestYear = years[years.length - 1];
    const targetSection =
      selectedStreamFilter === 'science'
        ? 'SCI'
        : selectedStreamFilter === 'commerce'
        ? 'COM'
        : 'TOT';
    const row = yearWiseData.records.find(
      (r) => r.subject === yearwiseSubject && r.year === latestYear && r.section === targetSection
    );
    if (!row) return null;
    const fail = Math.max(0, (row.totalAppeared || 0) - (row.promoted || 0));
    return {
      section: `${targetSection} TOTAL (${latestYear})`,
      appeared: row.totalAppeared || 0,
      distinction: row.distinction || 0,
      firstClass: row.firstClass || 0,
      secondClass: row.secondClass || 0,
      passClass: row.passClass || 0,
      fail,
      centums: row.centums || 0,
      classAvg: '-',
      passPercent:
        row.totalAppeared > 0 ? ((row.promoted / row.totalAppeared) * 100).toFixed(1) : '0.0',
    };
  }, [selectedSubject, yearWiseData, selectedStreamFilter]);

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
        <h3>{selectedSubjectLabel} — overall section-wise analysis</h3>
        {isLanguageOrCsSubject ? (
          <div className="section-filter ds-field-row">
            <label htmlFor="subject-stream-filter">Stream</label>
            <select
              id="subject-stream-filter"
              className="ds-select"
              value={selectedStreamFilter}
              onChange={(e) => setSelectedStreamFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="science">Science</option>
              <option value="commerce">Commerce</option>
            </select>
          </div>
        ) : null}
        <div className="ds-heatmap-legend" aria-hidden>
          <span className="ds-heatmap-legend__item">
            <span className="ds-heatmap-legend__swatch" style={{ background: 'hsla(120, 85%, 42%, 0.45)' }} />
            Higher count
          </span>
          <span className="ds-heatmap-legend__item">
            <span className="ds-heatmap-legend__swatch" style={{ background: '#ffffff', borderColor: '#e2e8f0' }} />
            Zero
          </span>
          <span className="ds-heatmap-legend__item">
            <span className="ds-heatmap-legend__swatch" style={{ background: 'rgba(220, 38, 38, 0.45)' }} />
            Fail count
          </span>
        </div>
        <div className="heatmap-table-wrapper">
          <table className="heatmap-table">
            <thead>
              <tr>
                <th>Section</th>
                <th>Appeared</th>
                <th>Distinction</th>
                <th>I Class</th>
                <th>II Class</th>
                <th>Pass Class</th>
                <th>Fail</th>
                <th>Centums</th>
                <th>Class Avg</th>
                <th>Pass %</th>
              </tr>
            </thead>
            <tbody>
              {filteredSectionWiseRows.map((row) => (
                <tr key={row.section}>
                  <td className="subject-cell">{sectionLabelWithTeacher(row.section)}</td>
                  <td style={heatCellStyle(row.appeared)}>{row.appeared}</td>
                  <td style={heatCellStyle(row.distinction)}>{row.distinction}</td>
                  <td style={heatCellStyle(row.firstClass)}>{row.firstClass}</td>
                  <td style={heatCellStyle(row.secondClass)}>{row.secondClass}</td>
                  <td style={heatCellStyle(row.passClass)}>{row.passClass}</td>
                  <td style={heatCellStyle(row.fail, true)}>{row.fail}</td>
                  <td style={heatCellStyle(row.centums)}>{row.centums}</td>
                  <td className="ds-num">{row.classAvg}</td>
                  <td className="ds-num ds-num--emphasis">{row.passPercent}%</td>
                </tr>
              ))}
              {officialTotalsRow ? (
                <tr>
                  <td className="subject-cell"><strong>{officialTotalsRow.section}</strong></td>
                  <td className="ds-num"><strong>{officialTotalsRow.appeared}</strong></td>
                  <td className="ds-num"><strong>{officialTotalsRow.distinction}</strong></td>
                  <td className="ds-num"><strong>{officialTotalsRow.firstClass}</strong></td>
                  <td className="ds-num"><strong>{officialTotalsRow.secondClass}</strong></td>
                  <td className="ds-num"><strong>{officialTotalsRow.passClass}</strong></td>
                  <td className="ds-num"><strong>{officialTotalsRow.fail}</strong></td>
                  <td className="ds-num"><strong>{officialTotalsRow.centums}</strong></td>
                  <td className="ds-num"><strong>{officialTotalsRow.classAvg}</strong></td>
                  <td className="ds-num ds-num--emphasis"><strong>{officialTotalsRow.passPercent}%</strong></td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
        {filteredSectionWiseRows.length === 0 ? (
          <div className="ds-empty" role="status">
            No section rows for the selected stream.
          </div>
        ) : null}
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
