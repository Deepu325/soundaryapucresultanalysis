import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import GlobalKpiStrip from './components/GlobalKpiStrip';
import PageHeader from './components/PageHeader';
import LoadingSkeleton from './components/LoadingSkeleton';
import LoginPage from './pages/LoginPage';
import ToppersPage from './pages/ToppersPage';
import SectionWiseAnalysisPage from './pages/SectionWiseAnalysisPage';
import SectionAndSubjectPage from './pages/SectionAndSubjectPage';
import SubjectwiseResultAnalysisPage from './pages/SubjectwiseResultAnalysisPage';
import StudentSummaryPage from './pages/StudentSummaryPage';
import YearWiseAnalysisPage from './pages/YearWiseAnalysisPage';
import useProcessedData from './hooks/useProcessedData';
import { clearSession, isStoredSessionValid, persistSession } from './auth/loginConfig';

function App() {
  const [activePage, setActivePage] = useState('toppers');
  const [isAuthed, setIsAuthed] = useState(() => isStoredSessionValid());
  const { processedData, loading } = useProcessedData(isAuthed);

  function handleLoginSuccess() {
    persistSession();
    setIsAuthed(true);
  }

  function handleLogout() {
    clearSession();
    setIsAuthed(false);
  }

  let body = null;
  if (!isAuthed) {
    body = <LoginPage onLoginSuccess={handleLoginSuccess} />;
  } else if (loading) {
    body = <LoadingSkeleton />;
  } else if (!processedData) {
    body = (
      <div
        className="ds-empty app-above-watermark"
        style={{ minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        Could not load results. Check that students.json is available.
      </div>
    );
  } else {
    body = (
      <div className="dashboard-wrapper app-above-watermark">
        <Sidebar activePage={activePage} onNavigate={setActivePage} onLogout={handleLogout} />
        <div className="dashboard">
          <main className="ds-page">
            <PageHeader activePage={activePage} />
            {activePage !== 'yearwise-analysis' && <GlobalKpiStrip processedData={processedData} />}

            {activePage === 'toppers' && (
              <div className="stats-grid stats-grid--secondary">
                <div className="stat-card stat-card--ds">
                  <h3>Sections</h3>
                  <div className="stat-value">{processedData.sections.length}</div>
                </div>
                <div className="stat-card stat-card--ds">
                  <h3>Science</h3>
                  <div className="stat-value">{processedData.allStudents.filter((s) => s.stream === 'Science').length}</div>
                </div>
                <div className="stat-card stat-card--ds">
                  <h3>Commerce</h3>
                  <div className="stat-value">{processedData.allStudents.filter((s) => s.stream === 'Commerce').length}</div>
                </div>
              </div>
            )}

            {activePage === 'toppers' && <ToppersPage processedData={processedData} />}
            {activePage === 'section-analysis' && <SectionWiseAnalysisPage processedData={processedData} />}
            {activePage === 'section-subject' && <SectionAndSubjectPage processedData={processedData} />}
            {activePage === 'subjectwise-analysis' && <SubjectwiseResultAnalysisPage processedData={processedData} />}
            {activePage === 'yearwise-analysis' && <YearWiseAnalysisPage />}
            {activePage === 'student-summary' && <StudentSummaryPage processedData={processedData} />}
          </main>
        </div>
      </div>
    );
  }

  return (
    <>
      <div
        className="app-watermark"
        style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/watermark.png)` }}
        aria-hidden="true"
      />
      {body}
    </>
  );
}

export default App;
