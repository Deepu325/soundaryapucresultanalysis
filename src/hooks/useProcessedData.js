import { useEffect, useMemo, useState } from 'react';
import { streamMap, subjectNames } from '../constants';

function useProcessedData(enabled = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(enabled);

  useEffect(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    fetch('./students.json')
      .then((res) => res.json())
      .then((json) => {
        if (!cancelled) {
          setData(json);
          setLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled]);

  const processedData = useMemo(() => {
    if (!data) return null;

    const practicalSubjectCodes = new Set(['33', '34', '36', '41', '40']);

    const normalizeScore = (value) => {
      if (value === null || value === undefined || value === '' || value === 'AA' || value === 'aa') {
        return null;
      }
      const num = Number(value);
      return Number.isFinite(num) ? num : null;
    };

    const isSubjectFailed = ({ subjectCode, th, total, isAbsent }) => {
      if (isAbsent) return true;
      if (total === null || total < 35) return true;
      if (practicalSubjectCodes.has(subjectCode)) {
        return th === null || th < 21;
      }
      return th === null || th < 24;
    };

    const allStudents = [];

    Object.entries(data).forEach(([section, students]) => {
      const streamPrefix = section.substring(0, 4);
      const stream = streamMap[streamPrefix] || 'Commerce';

      students.forEach((student) => {
        let subjects = (student.subjects || []).map((sub) => {
          const code = sub.code?.toString().replace('*', '') || '';
          const th = normalizeScore(sub.th);
          const ip = normalizeScore(sub.ip);
          const totalRaw = normalizeScore(sub.total);
          const isAbsent = String(sub.th).toUpperCase() === 'AA';
          const total = totalRaw !== null ? totalRaw : (th || 0) + (ip || 0);

          return {
            ...sub,
            subjectCode: code,
            th,
            ip,
            total,
            isAbsent,
            failed: isSubjectFailed({ subjectCode: code, th, total, isAbsent }),
          };
        });

        if (subjects.length < 6 && student.SUB) {
          const code = student.SUB.toString().replace('*', '');
          const th = normalizeScore(student.TH);
          const ip = normalizeScore(student['I/P']);
          const totalRaw = normalizeScore(student.TOT);
          const isAbsent = String(student.TH).toUpperCase() === 'AA';
          const total = totalRaw !== null ? totalRaw : (th || 0) + (ip || 0);

          subjects = [
            ...subjects,
            {
              code: student.SUB,
              subjectCode: code,
              name: subjectNames[code] || student.SUB,
              th,
              ip,
              total,
              isAbsent,
              failed: isSubjectFailed({ subjectCode: code, th, total, isAbsent }),
            },
          ];
        }

        const percentage = (((student['G.TOT'] || 0) / 600) * 100).toFixed(1);
        const subjectFailed = subjects.some((sub) => sub.failed);
        const finalResultCode = subjectFailed
          ? 'NC'
          : percentage >= 85
          ? 'T'
          : percentage >= 60
          ? '1'
          : percentage >= 50
          ? '2'
          : '1';
        const resultLabel = subjectFailed
          ? 'Fail'
          : percentage >= 85
          ? 'Distinction'
          : percentage >= 60
          ? 'First Class'
          : percentage >= 50
          ? 'Second Class'
          : 'Pass Class';

        allStudents.push({
          ...student,
          section,
          stream,
          subjects,
          percentage,
          RES: finalResultCode,
          resultLabel,
        });
      });
    });

    const collegeToppers = [...allStudents].sort((a, b) => (b['G.TOT'] || 0) - (a['G.TOT'] || 0)).slice(0, 10);
    const scienceStudents = allStudents.filter((s) => s.stream === 'Science');
    const commerceStudents = allStudents.filter((s) => s.stream === 'Commerce');
    const scienceToppers = [...scienceStudents].sort((a, b) => (b['G.TOT'] || 0) - (a['G.TOT'] || 0)).slice(0, 10);
    const commerceToppers = [...commerceStudents].sort((a, b) => (b['G.TOT'] || 0) - (a['G.TOT'] || 0)).slice(0, 10);
    const sections = Object.keys(data);

    return {
      allStudents,
      collegeToppers,
      scienceToppers,
      commerceToppers,
      sections,
    };
  }, [data]);

  return { processedData, loading };
}

export default useProcessedData;
