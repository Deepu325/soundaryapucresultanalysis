import React from 'react';

const NAV = [
  { id: 'toppers', icon: '🏆', label: 'Toppers' },
  { id: 'section-analysis', icon: '📊', label: 'Section analysis' },
  { id: 'section-subject', icon: '📚', label: 'Section & subject' },
  { id: 'subjectwise-analysis', icon: '📈', label: 'Subjectwise analysis' },
  { id: 'yearwise-analysis', icon: '📉', label: 'Year wise analysis' },
  { id: 'student-summary', icon: '👥', label: 'Student summary' },
];

function Sidebar({ activePage, onNavigate, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="sidebar-title-block">
        <img
          className="sidebar-logo"
          src={`${process.env.PUBLIC_URL}/spuc-logo.jpg`}
          alt="Soundarya Composite PU College"
          loading="lazy"
        />
        <h1>SPUC Result Dashboard</h1>
      </div>
      <nav className="sidebar-nav" aria-label="Main">
        {NAV.map((item) => (
          <button
            key={item.id}
            type="button"
            className={`nav-item ${activePage === item.id ? 'active-nav-item' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            <span className="nav-item__icon" aria-hidden>
              {item.icon}
            </span>
            <span className="nav-item__text">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="sidebar-footer">
        <img
          className="sidebar-footer-logo"
          src={`${process.env.PUBLIC_URL}/sims-logo-bca.jpeg`}
          alt="SIMS BCA"
          loading="lazy"
        />
        {onLogout ? (
          <button type="button" className="sidebar-logout" onClick={onLogout}>
            Log out
          </button>
        ) : null}
      </div>
      <section className="sidebar-credit-section" aria-label="Developer credit">
        <span className="sidebar-credit-section__text">Developed and deployed by Deepu KC</span>
      </section>
    </aside>
  );
}

export default Sidebar;
