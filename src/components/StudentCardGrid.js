import React from 'react';

function StudentCardGrid({ title, students }) {
  return (
    <div className="card-grid-container ds-card">
      <h3 className="ds-card__title">{title}</h3>
      <div className="student-card-grid">
        {students.map((student, idx) => (
          <StudentCard key={`${student['REGISTER NUMBER']}-${idx}`} student={student} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}

function StudentCard({ student, rank }) {
  const getResultClass = (res) => {
    if (res === 'T') return 'distinction';
    if (res === '1') return 'pass';
    if (res === '2') return 'second';
    if (res === 'NC') return 'nc';
    return 'fail';
  };

  return (
    <div className={`student-card rank-${rank}`}>
      <div className="card-header">
        <span className={`rank-badge rank-${rank}`}>#{rank}</span>
        <span className={`result-tag ${getResultClass(student.RES)}`}>{student.resultLabel}</span>
      </div>

      <div className="student-name">{student['CANDIDATE NAME']}</div>
      <div className="student-details">
        <div className="detail-row">{student['REGISTER NUMBER']}</div>
        <div className="detail-row">
          {student.section} <span className={`stream-badge ${student.stream}`}>{student.stream}</span>
        </div>
      </div>

      <div className="subjects-list">
        {student.subjects.map((sub, i) => {
          const displayTotal = sub.isAbsent ? 'AA' : sub.total;

          return (
            <div key={`${sub.code}-${i}`} className="subject-item">
              <span className="sub-name">{sub.name}</span>
              <span className="mark total">{displayTotal}</span>
            </div>
          );
        })}
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

export default StudentCardGrid;
