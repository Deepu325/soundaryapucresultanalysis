import React, { useEffect, useMemo, useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LabelList,
  ResponsiveContainer,
} from 'recharts';

const YEAR_COLORS = {
  '2024-25': '#dc2626',
  '2025-26': '#2563eb',
};

const METRIC_KEYS = ['totalAppeared', 'promoted', 'distinction', 'passClass', 'secondClass'];

function formatMetric(metric) {
  if (metric === 'totalAppeared') return 'Appeared';
  if (metric === 'promoted') return 'Students Promoted';
  if (metric === 'distinction') return 'Distinction';
  if (metric === 'passClass') return 'Pass Class';
  if (metric === 'secondClass') return 'Second Class';
  return metric;
}

function shortYear(year) {
  if (year === '2024-25') return '24-25';
  if (year === '2025-26') return '25-26';
  return year;
}

function metricValue(row, selectedMetric) {
  const raw = row[selectedMetric];
  if (typeof raw !== 'number') return null;
  return raw;
}

function computePassRatePercent(promoted, totalAppeared) {
  if (!totalAppeared || totalAppeared <= 0) return '0.0';
  return ((promoted / totalAppeared) * 100).toFixed(1);
}

function pickYearValue(rowsForYear, metricKey) {
  const totalRow = rowsForYear.find((r) => r.section === 'TOT');
  if (totalRow) return metricValue(totalRow, metricKey) || 0;
  return rowsForYear.reduce((sum, row) => {
    const n = metricValue(row, metricKey);
    return sum + (typeof n === 'number' ? n : 0);
  }, 0);
}

function YearWiseAnalysisPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch('./year-wise-analysis.json')
      .then((res) => res.json())
      .then((json) => {
        if (cancelled) return;
        setData(json);
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const subjects = useMemo(() => {
    const unique = new Set((data?.records || []).map((r) => r.subject));
    return [...unique].sort((a, b) => a.localeCompare(b));
  }, [data]);

  useEffect(() => {
    if (subjects.length > 0 && !subjects.includes(selectedSubject)) {
      setSelectedSubject(subjects[0]);
    }
  }, [subjects, selectedSubject]);

  const chartData = useMemo(() => {
    if (!data?.records || !selectedSubject) return [];
    const rows = data.records.filter((r) => r.subject === selectedSubject);
    const years = data.years || ['2024-25', '2025-26'];

    return METRIC_KEYS.map((metricKey) => {
      const point = {
        metric: formatMetric(metricKey),
      };

      years.forEach((year) => {
        const yearRows = rows.filter((r) => r.year === year);
        const value = pickYearValue(yearRows, metricKey);
        point[year] = value;
      });

      return point;
    });
  }, [data, selectedSubject]);

  const visibleYears = useMemo(() => data?.years || ['2024-25', '2025-26'], [data]);

  const tableRows = useMemo(() => {
    if (!data?.records || !selectedSubject) return [];
    return data.records
      .filter((r) => r.subject === selectedSubject)
      .sort((a, b) => {
        if (a.section !== b.section) return a.section.localeCompare(b.section);
        return a.year.localeCompare(b.year);
      });
  }, [data, selectedSubject]);

  const subjectKpisByYear = useMemo(() => {
    if (!data?.records || !selectedSubject) return [];
    const years = data.years || ['2024-25', '2025-26'];
    return years.map((year) => {
      const rows = data.records.filter((r) => r.subject === selectedSubject && r.year === year);
      const totals = {
        totalAppeared: pickYearValue(rows, 'totalAppeared'),
        promoted: pickYearValue(rows, 'promoted'),
        distinction: pickYearValue(rows, 'distinction'),
      };
      const passRate = computePassRatePercent(totals.promoted, totals.totalAppeared);
      return { year, ...totals, passRate };
    });
  }, [data, selectedSubject]);

  if (loading) {
    return <div className="ds-empty">Loading year-wise analysis...</div>;
  }

  if (!data?.records?.length) {
    return <div className="ds-empty">Could not load year-wise-analysis.json.</div>;
  }

  return (
    <div className="section-analysis-page">
      <div className="chart-container">
        <h3>Year Wise Analysis</h3>
        <div className="ds-field-row">
          <label htmlFor="yearwise-subject">Subject</label>
          <select
            id="yearwise-subject"
            className="ds-select"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>

        </div>

        {subjectKpisByYear.length > 0 ? (
          <section aria-label="Subject overview">
            {subjectKpisByYear.map((kpi) => (
              <div key={kpi.year} style={{ marginBottom: 12 }}>
                <h4 style={{ margin: '4px 0 8px', fontSize: '0.95rem', color: '#334155' }}>
                  {kpi.year}
                </h4>
                <div className="ds-kpi-strip">
                  <div className="ds-kpi-card ds-kpi-card--brand">
                    <span className="ds-kpi-card__label">Appeared</span>
                    <span className="ds-kpi-card__value">{kpi.totalAppeared}</span>
                  </div>
                  <div className="ds-kpi-card ds-kpi-card--success">
                    <span className="ds-kpi-card__label">Promoted</span>
                    <span className="ds-kpi-card__value">{kpi.promoted}</span>
                  </div>
                  <div className="ds-kpi-card ds-kpi-card--highlight">
                    <span className="ds-kpi-card__label">Distinction</span>
                    <span className="ds-kpi-card__value">{kpi.distinction}</span>
                  </div>
                  <div className="ds-kpi-card ds-kpi-card--accent">
                    <span className="ds-kpi-card__label">Pass rate</span>
                    <span className="ds-kpi-card__value">{kpi.passRate}%</span>
                  </div>
                </div>
              </div>
            ))}
          </section>
        ) : null}

        <div style={{ width: '100%', height: 380 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 20, right: 32, left: 8, bottom: 10 }}>
              <CartesianGrid stroke="#d1d5db" strokeDasharray="0" />
              <XAxis dataKey="metric" />
              <YAxis
                domain={['auto', 'auto']}
                tickFormatter={(value) => value}
              />
              <Tooltip
                labelFormatter={(label) => `Metric: ${label}`}
                formatter={(value) => {
                  if (value === null || value === undefined) return ['-', 'Value'];
                  return [value, 'Value'];
                }}
              />
              <Legend />
              {visibleYears.map((year) => (
                <Line
                  key={year}
                  type="linear"
                  dataKey={year}
                  stroke={YEAR_COLORS[year] || '#334155'}
                  strokeWidth={3}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                  name={`${shortYear(year)} values`}
                >
                  <LabelList
                    dataKey={year}
                    position="top"
                    formatter={(value) => {
                      if (value === null || value === undefined) return '';
                      return Number(value).toFixed(0);
                    }}
                    style={{ fontSize: 11, fill: '#0f172a' }}
                  />
                </Line>
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="chart-container">
        <h3>Year-wise details</h3>
        <div className="ds-table-scroll heatmap-table-wrapper">
          <table className="ds-table heatmap-table">
            <thead>
              <tr>
                <th>Subject</th>
                <th>Section</th>
                <th>Year</th>
                <th>Appeared</th>
                <th>Promoted</th>
                <th>Distinction</th>
                <th>Pass %</th>
              </tr>
            </thead>
            <tbody>
              {tableRows.map((row) => (
                <tr key={`${row.subject}-${row.section}-${row.year}`}>
                  <td className="subject-cell">{row.subject}</td>
                  <td>{row.section}</td>
                  <td>{row.year}</td>
                  <td className="ds-num">{row.totalAppeared ?? '-'}</td>
                  <td className="ds-num">{row.promoted ?? '-'}</td>
                  <td className="ds-num">{row.distinction ?? '-'}</td>
                  <td className="ds-num ds-num--emphasis">
                    {row.totalAppeared > 0 && typeof row.promoted === 'number'
                      ? `${computePassRatePercent(row.promoted, row.totalAppeared)}%`
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default YearWiseAnalysisPage;
