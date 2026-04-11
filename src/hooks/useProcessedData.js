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

    const allStudents = [];

    Object.entries(data).forEach(([section, students]) => {
      const streamPrefix = section.substring(0, 4);
      const stream = streamMap[streamPrefix] || 'Commerce';

      students.forEach((student) => {
        let subjects = (student.subjects || []).map((sub) => {
          const th = parseFloat(sub.th) || 0;
          const ip = parseFloat(sub.ip) || 0;
          const total = sub.total === null || sub.total === undefined || sub.total === ''
            ? th + ip
            : parseFloat(sub.total) || 0;

          return {
            ...sub,
            th,
            ip,
            total,
          };
        });

        if (subjects.length < 6 && student.SUB) {
          const code = student.SUB.toString().replace('*', '');
          subjects = [
            ...subjects,
            {
              code: student.SUB,
              name: subjectNames[code] || student.SUB,
              th: parseFloat(student.TH) || 0,
              ip: parseFloat(student['I/P']) || 0,
              total: parseFloat(student.TOT) || 0,
            },
          ];
        }

        const percentage = (((student['G.TOT'] || 0) / 600) * 100).toFixed(1);
        const resultLabel = student.RES === 'T' ? 'Distinction' : student.RES === '1' ? 'Pass' : student.RES;

        allStudents.push({
          ...student,
          section,
          stream,
          subjects,
          percentage,
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
