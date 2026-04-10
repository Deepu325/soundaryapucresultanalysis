import React, { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import './App.css';

const streamMap = {
  'PCMB': 'Science', 'PMC': 'Science', 'PCME': 'Science', 'PCMC': 'Science',
  'CEBA': 'Commerce', 'SEBA': 'Commerce', 'MEBA': 'Commerce', 
  'MSBA': 'Commerce', 'PEBA': 'Commerce', 'CSBA': 'Commerce'
};

const subjectNames = {
  '01': 'Kannada', '02': 'English', '03': 'Hindi', '09': 'Sanskrit',
  '33': 'Physics', '34': 'Chemistry', '35': 'Mathematics', '36': 'Biology',
  '41': 'Computer Science', '40': 'Electronics', '22': 'Economics',
  '27': 'Business Studies', '30': 'Accountancy', '31': 'Statistics',
  '78': 'Basic Maths', '29': 'Political Science'
};

function App() {
  const [data, setData] = useState(null);
  const [selectedSection, setSelectedSection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('college');

  React.useEffect(() => {
    fetch('./students.json')
      .then(res => res.json())
      .then(json => {
        setData(json);
        setLoading(false);
      });
  }, []);

  const processedData = useMemo(() => {
    if (!data) return null;

    const allStudents = [];

    Object.entries(data).forEach(([section, students]) => {
      const streamPrefix = section.substring(0, 4);
      const stream = streamMap[streamPrefix] || 'Commerce';
      
      students.forEach(student => {
        const subjects = [];
        for (let i = 1; i <= 6; i++) {
          const subKey = i === 1 ? 'SUB' : `SUB.${i}`;
          const thKey = i === 1 ? 'TH' : `TH.${i}`;
          const ipKey = i === 1 ? 'I/P' : `I/P.${i}`;
          const totKey = i === 1 ? 'TOT' : `TOT.${i}`;
          
          const subCode = student[subKey];
          if (subCode) {
            const code = subCode.toString().replace('*', '');
            subjects.push({
              code: subCode,
              name: subjectNames[code] || subCode,
              th: student[thKey],
              ip: student[ipKey],
              total: student[totKey]
            });
          }
        }

        const percentage = ((student['G.TOT'] || 0) / 600 * 100).toFixed(1);
        const resultLabel = student['RES'] === 'T' ? 'Distinction' : student['RES'] === '1' ? 'Pass' : student['RES'];
        
        allStudents.push({ 
          ...student, 
          section, 
          stream,
          subjects,
          percentage,
          resultLabel
        });
      });
    });

    const collegeToppers = [...allStudents].sort((a, b) => (b['G.TOT'] || 0) - (a['G.TOT'] || 0)).slice(0, 10);
    const scienceStudents = allStudents.filter(s => s.stream === 'Science');
    const commerceStudents = allStudents.filter(s => s.stream === 'Commerce');
    const scienceToppers = [...scienceStudents].sort((a, b) => (b['G.TOT'] || 0) - (a['G.TOT'] || 0)).slice(0, 10);
    const commerceToppers = [...commerceStudents].sort((a, b) => (b['G.TOT'] || 0) - (a['G.TOT'] || 0)).slice(0, 10);

    const sectionStats = Object.entries(data).map(([section, students]) => {
      const passCount = students.filter(s => s['RES'] === '1' || s['RES'] === 'T').length;
      const distinctionCount = students.filter(s => s['RES'] === 'T').length;
      const total = students.reduce((sum, s) => sum + (s['G.TOT'] || 0), 0);
      const topper = [...students].sort((a, b) => (b['G.TOT'] || 0) - (a['G.TOT'] || 0))[0];
      
      return {
        section,
        totalStudents: students.length,
        passCount,
        distinctionCount,
        passPercent: ((passCount / students.length) * 100).toFixed(1),
        average: Math.round(total / students.length),
        topperName: topper['CANDIDATE NAME'],
        topperTotal: topper['G.TOT']
      };
    });

    const topSection = [...sectionStats].sort((a, b) => b.average - a.average)[0];

    return { allStudents, collegeToppers, scienceToppers, commerceToppers, sectionStats, topSection, sections: Object.keys(data) };
  }, [data]);

  if (loading) return <div className="loading">Loading...</div>;
  if (!processedData) return <div>Error loading data</div>;

  const filteredSections = selectedSection === 'all' ? processedData.sectionStats : processedData.sectionStats.filter(s => s.section === selectedSection);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🎓 SPUC Result Dashboard 2026</h1>
        <p>II PU Examination Results - Section Wise Analysis</p>
      </header>

      <div className="stats-grid">
        <div className="stat-card primary"><h3>Total Students</h3><div className="stat-value">{processedData.allStudents.length}</div></div>
        <div className="stat-card success"><h3>Total Sections</h3><div className="stat-value">{processedData.sections.length}</div></div>
        <div className="stat-card warning"><h3>Science Students</h3><div className="stat-value">{processedData.allStudents.filter(s => s.stream === 'Science').length}</div></div>
        <div className="stat-card info"><h3>Commerce Students</h3><div className="stat-value">{processedData.allStudents.filter(s => s.stream === 'Commerce').length}</div></div>
      </div>

      <div className="top-section-banner">
        <div className="trophy">🏆</div>
        <div className="top-section-info">
          <h2>Top Performing Section</h2>
          <h1>{processedData.topSection.section}</h1>
          <p>Average: {processedData.topSection.average} marks</p>
          <p>Topper: {processedData.topSection.topperName} ({processedData.topSection.topperTotal})</p>
        </div>
      </div>

      <div className="tabs-container">
        <div className="tabs">
          <button className={`tab-btn ${activeTab === 'college' ? 'active' : ''}`} onClick={() => setActiveTab('college')}>🏆 College Toppers</button>
          <button className={`tab-btn ${activeTab === 'science' ? 'active' : ''}`} onClick={() => setActiveTab('science')}>🔬 Science Toppers</button>
          <button className={`tab-btn ${activeTab === 'commerce' ? 'active' : ''}`} onClick={() => setActiveTab('commerce')}>💼 Commerce Toppers</button>
          <button className={`tab-btn ${activeTab === 'section' ? 'active' : ''}`} onClick={() => setActiveTab('section')}>📊 Section Analysis</button>
        </div>

        <div className="tab-content">
          {activeTab === 'college' && <StudentCardGrid title="Top 10 College Toppers" students={processedData.collegeToppers} />}
          {activeTab === 'science' && <StudentCardGrid title="Top 10 Science Toppers" students={processedData.scienceToppers} />}
          {activeTab === 'commerce' && <StudentCardGrid title="Top 10 Commerce Toppers" students={processedData.commerceToppers} />}
          {activeTab === 'section' && (
            <>
              <SectionFilter sections={processedData.sections} selectedSection={selectedSection} onSectionChange={setSelectedSection} />
              <SectionChart stats={filteredSections} />
              <SectionBarChart stats={filteredSections} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function StudentCardGrid({ title, students }) {
  return (
    <div className="card-grid-container">
      <h3>{title}</h3>
      <div className="student-card-grid">
        {students.map((student, idx) => (
          <StudentCard key={idx} student={student} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}

function StudentCard({ student, rank }) {
  const getResultClass = (res) => {
    if (res === 'T') return 'distinction';
    if (res === '1') return 'pass';
    if (res === 'NC') return 'nc';
    return 'fail';
  };

  return (
    <div className={`student-card rank-${rank}`}>
      <div className="card-header">
        <span className={`rank-badge rank-${rank}`}>#{rank}</span>
        <span className={`result-tag ${getResultClass(student['RES'])}`}>{student.resultLabel}</span>
      </div>
      
      <div className="student-name">{student['CANDIDATE NAME']}</div>
      <div className="student-details">
        <div className="detail-row">{student['REGISTER NUMBER']}</div>
        <div className="detail-row">{student.section} <span className={`stream-badge ${student.stream}`}>{student.stream}</span></div>
      </div>

      <div className="subjects-list">
        {student.subjects.map((sub, i) => (
          <div key={i} className="subject-item">
            <span className="sub-name">{sub.name}</span>
            <span className="mark total">{sub.total}</span>
          </div>
        ))}
      </div>

      <div className="card-footer">
        <div className="total-marks">
          <span className="label">Total</span>
          <span className="value">{student['G.TOT']}/600</span>
        </div>
        <div className="percentage">
          <span className="label">%</span>
          <span className="value">{student.percentage}%</span>
        </div>
      </div>
    </div>
  );
}

function SectionFilter({ sections, selectedSection, onSectionChange }) {
  return (
    <div className="section-filter">
      <label>Filter by Section:</label>
      <select value={selectedSection} onChange={(e) => onSectionChange(e.target.value)}>
        <option value="all">All Sections</option>
        {sections.map(sec => (<option key={sec} value={sec}>{sec}</option>))}
      </select>
    </div>
  );
}

function SectionChart({ stats }) {
  return (
    <div className="section-stats-grid">
      {stats.map(stat => (
        <div key={stat.section} className="section-card">
          <h4>{stat.section}</h4>
          <div className="section-stats">
            <div className="stat-row"><span>Students:</span><span>{stat.totalStudents}</span></div>
            <div className="stat-row"><span>Pass:</span><span>{stat.passCount} ({stat.passPercent}%)</span></div>
            <div className="stat-row"><span>Distinction:</span><span>{stat.distinctionCount}</span></div>
            <div className="stat-row"><span>Average:</span><span>{stat.average}</span></div>
          </div>
          <div className="section-topper">
            <span>Topper:</span>
            <strong>{stat.topperName}</strong>
            <span className="topper-marks">({stat.topperTotal})</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionBarChart({ stats }) {
  return (
    <div className="bar-chart-container">
      <h3>Section Performance Comparison</h3>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={stats}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="section" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="average" fill="#3b82f6" name="Average" />
          <Bar dataKey="topperTotal" fill="#10b981" name="Topper Score" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export default App;