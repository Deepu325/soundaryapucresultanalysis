import React, { useEffect, useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { subjectNames } from '../constants';
import { CHART_COLORS } from '../chartColors';

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
        students.push({
          name: student['CANDIDATE NAME'],
          registerNumber: student['REGISTER NUMBER'],
          section: student.section,
          mark: parseFloat(matched.total) || 0,
        });
      }
    });
    return students;
  }, [processedData.allStudents, selectedSubject]);

  const selectedSubjectLabel = useMemo(() => {
    const matched = subjects.find((s) => s.code === selectedSubject);
    return matched?.label || selectedSubject;
  }, [subjects, selectedSubject]);

  const selectedSubjectMarks = useMemo(
    () => selectedSubjectStudents.map((s) => s.mark),
    [selectedSubjectStudents]
  );

  const totalStudents = selectedSubjectMarks.length;
  const discontinued = 0;
  const totalAppeared = totalStudents;
  const distinction = selectedSubjectMarks.filter((mark) => mark >= 85).length;
  const firstClass = selectedSubjectMarks.filter((mark) => mark >= 60 && mark < 85).length;
  const secondClass = selectedSubjectMarks.filter((mark) => mark >= 50 && mark < 60).length;
  const passClass = selectedSubjectMarks.filter((mark) => mark >= 35 && mark < 50).length;
  const detained = selectedSubjectMarks.filter((mark) => mark < 35).length;
  const promoted = selectedSubjectMarks.filter((mark) => mark >= 35).length;
  const centums = selectedSubjectMarks.filter((mark) => mark === 100).length;
  const passPercentage = totalStudents > 0 ? ((promoted / totalStudents) * 100).toFixed(1) : '0.0';

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
          <div className="stat-value">{totalStudents}</div>
        </div>
        <div className="stat-card compact-stat-card warning">
          <h3>Discontinued/Absent</h3>
          <div className="stat-value">{discontinued}</div>
        </div>
        <div className="stat-card compact-stat-card info">
          <h3>Total Appeared</h3>
          <div className="stat-value">{totalAppeared}</div>
        </div>
        <div className="stat-card compact-stat-card success">
          <h3>No of Students Promoted</h3>
          <div className="stat-value">{promoted}</div>
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
                <tr><td className="subject-cell">Detained</td><td>{detained}</td></tr>
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
