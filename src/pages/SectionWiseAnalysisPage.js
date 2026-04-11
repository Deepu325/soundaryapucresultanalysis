import React, { useMemo, useState } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { CHART_COLORS } from '../chartColors';

function SectionWiseAnalysisPage({ processedData }) {
  const [selectedSection, setSelectedSection] = useState(processedData.sections[0] || '');
  const sectionData = useMemo(
    () => processedData.allStudents.filter((s) => s.section === selectedSection),
    [processedData.allStudents, selectedSection]
  );

  const resultStats = useMemo(() => {
    return {
      distinction: sectionData.filter((s) => parseFloat(s.percentage) >= 85).length,
      firstClass: sectionData.filter((s) => parseFloat(s.percentage) >= 60 && parseFloat(s.percentage) < 85).length,
      secondClass: sectionData.filter((s) => parseFloat(s.percentage) >= 50 && parseFloat(s.percentage) < 60).length,
      passClass: sectionData.filter((s) => parseFloat(s.percentage) >= 35 && parseFloat(s.percentage) < 50).length,
      fail: sectionData.filter((s) => parseFloat(s.percentage) < 35).length,
    };
  }, [sectionData]);

  const pieData = [
    { name: 'Distinction', value: resultStats.distinction, color: CHART_COLORS.distinction },
    { name: 'First Class', value: resultStats.firstClass, color: CHART_COLORS.firstClass },
    { name: 'Second Class', value: resultStats.secondClass, color: CHART_COLORS.secondClass },
    { name: 'Pass Class', value: resultStats.passClass, color: CHART_COLORS.passClass },
    { name: 'Fail', value: resultStats.fail, color: CHART_COLORS.fail },
  ].filter((item) => item.value > 0);

  const pieTotal = useMemo(() => pieData.reduce((s, x) => s + x.value, 0), [pieData]);

  const totalStudents = sectionData.length;
  const appeared = totalStudents;
  const promoted = sectionData.filter((s) => parseFloat(s.percentage) >= 35).length;
  const passPercentage = totalStudents > 0 ? ((promoted / totalStudents) * 100).toFixed(1) : 0;
  const discontinued = 0;

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

  return (
    <div className="tabs-container">
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
            <div className="stat-value">{appeared}</div>
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
          <h3>Result distribution (overall %)</h3>
          <div className="chart-with-filter">
            <div className="pie-chart-wrapper">
              {pieData.length === 0 ? (
                <div className="ds-empty" style={{ minHeight: 200, display: 'flex', alignItems: 'center' }}>
                  No students in this section for the current dataset.
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
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={pieTooltip} />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>

            <div className="section-filter side-filter">
              <label htmlFor="section-wise-section-select">Section</label>
              <select
                id="section-wise-section-select"
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default SectionWiseAnalysisPage;
