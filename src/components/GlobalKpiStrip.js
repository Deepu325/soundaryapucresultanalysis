import React, { useMemo } from 'react';
import { computeGlobalKpis } from '../utils/metrics';

function GlobalKpiStrip({ processedData }) {
  const kpis = useMemo(() => computeGlobalKpis(processedData.allStudents), [processedData.allStudents]);

  return (
    <section className="ds-kpi-strip" aria-label="College overview">
      <div className="ds-kpi-card ds-kpi-card--brand">
        <span className="ds-kpi-card__label">Total students</span>
        <span className="ds-kpi-card__value">{kpis.totalStudents}</span>
      </div>
      <div className="ds-kpi-card ds-kpi-card--success">
        <span className="ds-kpi-card__label">Pass rate (≥35%)</span>
        <span className="ds-kpi-card__value">{kpis.passPercent}%</span>
      </div>
      <div className="ds-kpi-card ds-kpi-card--highlight">
        <span className="ds-kpi-card__label">Distinctions (≥85%)</span>
        <span className="ds-kpi-card__value">{kpis.distinctionCount}</span>
      </div>
      <div className="ds-kpi-card ds-kpi-card--accent">
        <span className="ds-kpi-card__label">Top score (/600)</span>
        <span className="ds-kpi-card__value">{kpis.topScore}</span>
      </div>
    </section>
  );
}

export default GlobalKpiStrip;
