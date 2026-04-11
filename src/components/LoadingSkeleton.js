import React from 'react';

function LoadingSkeleton() {
  return (
    <div className="dashboard-wrapper shell-loading app-above-watermark">
      <aside className="sidebar sidebar--skeleton" aria-hidden>
        <div className="ds-skel ds-skel--title" />
        <div className="ds-skel ds-skel--nav" />
        <div className="ds-skel ds-skel--nav" />
        <div className="ds-skel ds-skel--nav" />
      </aside>
      <div className="dashboard dashboard--skeleton">
        <div className="ds-skel ds-skel--kpi-row" />
        <div className="ds-skel ds-skel--block" />
        <div className="ds-skel ds-skel--block ds-skel--short" />
      </div>
    </div>
  );
}

export default LoadingSkeleton;
