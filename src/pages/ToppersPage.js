import React, { useEffect, useMemo, useState } from 'react';
import StudentCardGrid from '../components/StudentCardGrid';

/** Prefer “… A” (e.g. PCMB A); otherwise first section in roster order. */
function defaultSectionForToppers(sections) {
  if (!sections?.length) return '';
  const aSection = sections.find((s) => /\sA$/i.test(s.trim()));
  return aSection || sections[0];
}

function ToppersPage({ processedData }) {
  const [activeTopperTab, setActiveTopperTab] = useState('college');
  const [sectionTopFilter, setSectionTopFilter] = useState(() => defaultSectionForToppers(processedData.sections));

  useEffect(() => {
    if (!processedData.sections.includes(sectionTopFilter)) {
      setSectionTopFilter(defaultSectionForToppers(processedData.sections));
    }
  }, [processedData.sections, sectionTopFilter]);

  const sectionToppersBySection = useMemo(() => {
    const map = {};
    processedData.sections.forEach((sec) => {
      map[sec] = processedData.allStudents
        .filter((s) => s.section === sec)
        .sort((a, b) => (b['G.TOT'] || 0) - (a['G.TOT'] || 0))
        .slice(0, 10);
    });
    return map;
  }, [processedData.allStudents, processedData.sections]);

  return (
    <div className="tabs-container">
      <div className="tabs">
        <button className={`tab-btn ${activeTopperTab === 'college' ? 'active' : ''}`} onClick={() => setActiveTopperTab('college')}>
          College
        </button>
        <button className={`tab-btn ${activeTopperTab === 'science' ? 'active' : ''}`} onClick={() => setActiveTopperTab('science')}>
          Science
        </button>
        <button className={`tab-btn ${activeTopperTab === 'commerce' ? 'active' : ''}`} onClick={() => setActiveTopperTab('commerce')}>
          Commerce
        </button>
        <button className={`tab-btn ${activeTopperTab === 'section' ? 'active' : ''}`} onClick={() => setActiveTopperTab('section')}>
          Section toppers
        </button>
      </div>

      <div className="tab-content">
        {activeTopperTab === 'college' && <StudentCardGrid title="Top 10 College Toppers" students={processedData.collegeToppers} />}
        {activeTopperTab === 'science' && <StudentCardGrid title="Top 10 Science Toppers" students={processedData.scienceToppers} />}
        {activeTopperTab === 'commerce' && <StudentCardGrid title="Top 10 Commerce Toppers" students={processedData.commerceToppers} />}
        {activeTopperTab === 'section' && (
          <div className="section-toppers-panel">
            <div className="ds-field-row section-toppers-filter">
              <label htmlFor="section-toppers-select">Section</label>
              <select
                id="section-toppers-select"
                className="ds-select"
                value={sectionTopFilter}
                onChange={(e) => setSectionTopFilter(e.target.value)}
              >
                {processedData.sections.map((sec) => (
                  <option key={sec} value={sec}>
                    {sec}
                  </option>
                ))}
              </select>
            </div>
            <StudentCardGrid title={`Top 10 — ${sectionTopFilter}`} students={sectionToppersBySection[sectionTopFilter] || []} />
          </div>
        )}
      </div>
    </div>
  );
}

export default ToppersPage;
