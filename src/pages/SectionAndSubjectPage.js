import React, { useMemo, useState } from 'react';

const subjectShortNameMap = {
  '01': 'KAN',
  '02': 'ENG',
  '03': 'HIN',
  '09': 'SAN',
  '22': 'ECO',
  '27': 'BST',
  '29': 'POL',
  '30': 'ACC',
  '31': 'STAT',
  '33': 'PHY',
  '34': 'CHE',
  '35': 'MATHS',
  '36': 'BIO',
  '40': 'ELE',
  '41': 'CS',
  '75': 'B-MATHS',
  '78': 'B-MATHS',
};

const getSubjectCode = (subject) => String(subject.code || '').replace('*', '').trim();

function SectionAndSubjectPage({ processedData }) {
  const [selectedSection, setSelectedSection] = useState(processedData.sections[0] || '');
  const sectionStudents = useMemo(
    () => processedData.allStudents.filter((student) => student.section === selectedSection),
    [processedData.allStudents, selectedSection]
  );

  const heatmapRows = useMemo(() => {
    const subjectMap = {};

    sectionStudents.forEach((student) => {
      (student.subjects || []).forEach((subject) => {
        const code = getSubjectCode(subject) || String(subject.name || subject.code);
        if (!subjectMap[code]) {
          subjectMap[code] = {
            code,
            subjectName: String(subject.name || subject.code),
            distinction: 0,
            firstClass: 0,
            secondClass: 0,
            thirdClass: 0,
            centums: 0,
            fail: 0,
          };
        }

        const marks = parseFloat(subject.total) || 0;
        if (marks === 100) subjectMap[code].centums += 1;
        if (marks >= 85) subjectMap[code].distinction += 1;
        else if (marks >= 60) subjectMap[code].firstClass += 1;
        else if (marks >= 50) subjectMap[code].secondClass += 1;
        else if (marks >= 35) subjectMap[code].thirdClass += 1;
        else subjectMap[code].fail += 1;
      });
    });

    return Object.values(subjectMap).sort((a, b) => a.code.localeCompare(b.code, undefined, { numeric: true }));
  }, [sectionStudents]);

  const maxHeatValue = useMemo(() => {
    if (!heatmapRows.length) return 1;
    return Math.max(
      ...heatmapRows.flatMap((row) => [row.distinction, row.firstClass, row.secondClass, row.thirdClass, row.centums, row.fail]),
      1
    );
  }, [heatmapRows]);

  const getHeatCellStyle = (value, isFail = false, forceGreen = false) => {
    if (value === 0) {
      return {
        backgroundColor: '#ffffff',
      };
    }
    const intensity = value / maxHeatValue;
    if (isFail) {
      return {
        backgroundColor: `rgba(220, 38, 38, ${0.18 + intensity * 0.6})`,
      };
    }
    if (forceGreen) {
      return {
        backgroundColor: `hsla(120, 85%, 42%, ${0.2 + intensity * 0.6})`,
      };
    }
    const hue = Math.round(intensity * 120); // 0=red, 60=yellow, 120=green
    return {
      backgroundColor: `hsla(${hue}, 85%, 45%, ${0.18 + intensity * 0.55})`,
    };
  };

  const getShortSubject = (code, subjectName) => subjectShortNameMap[code] || subjectName.slice(0, 8).toUpperCase();
  const totalStudents = sectionStudents.length;
  const discontinued = 0;
  const totalAppeared = totalStudents;
  const promoted = sectionStudents.filter((s) => parseFloat(s.percentage) >= 35).length;
  const passPercentage = totalStudents > 0 ? ((promoted / totalStudents) * 100).toFixed(1) : '0.0';

  return (
    <div>
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
          <div className="stat-card compact-stat-card secondary">
            <h3>Pass Percentage</h3>
            <div className="stat-value">{passPercentage}%</div>
          </div>
        </div>

        <div className="chart-container">
          <h3>Section And Subject Heat Map</h3>
          <div className="section-filter ds-field-row">
            <label htmlFor="section-subject-select">Section</label>
            <select
              id="section-subject-select"
              className="ds-select"
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
            >
              {processedData.sections.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}
                </option>
              ))}
            </select>
          </div>
          <div className="ds-heatmap-legend" aria-hidden>
            <span className="ds-heatmap-legend__item">
              <span className="ds-heatmap-legend__swatch" style={{ background: 'hsla(120, 85%, 42%, 0.45)' }} />
              Stronger performance
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
                  <th>SUBJECT</th>
                  <th>DISTINCTION</th>
                  <th>I CLASS</th>
                  <th>II CLASS</th>
                  <th>III CLASS</th>
                  <th>CENTUMS</th>
                  <th>FAIL</th>
                </tr>
              </thead>
              <tbody>
                {heatmapRows.map((row) => (
                  <tr key={row.code}>
                    <td className="subject-cell" title={row.subjectName}>
                      {getShortSubject(row.code, row.subjectName)}
                    </td>
                    <td style={getHeatCellStyle(row.distinction)} title={`Distinction: ${row.distinction}`}>
                      {row.distinction}
                    </td>
                    <td style={getHeatCellStyle(row.firstClass)} title={`First class: ${row.firstClass}`}>
                      {row.firstClass}
                    </td>
                    <td style={getHeatCellStyle(row.secondClass)} title={`Second class: ${row.secondClass}`}>
                      {row.secondClass}
                    </td>
                    <td style={getHeatCellStyle(row.thirdClass)} title={`Pass class: ${row.thirdClass}`}>
                      {row.thirdClass}
                    </td>
                    <td style={getHeatCellStyle(row.centums, false, true)} title={`Centums: ${row.centums}`}>
                      {row.centums}
                    </td>
                    <td style={getHeatCellStyle(row.fail, true)} title={`Fail: ${row.fail}`}>
                      {row.fail}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionAndSubjectPage;
