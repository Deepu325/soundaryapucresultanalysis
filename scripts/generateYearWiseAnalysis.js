/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const XLSX = require('xlsx');

const workbookPath = path.resolve(__dirname, '..', '..', 'Result Comparison 24-2525-26.xlsx');
const outputPath = path.resolve(__dirname, '..', 'public', 'year-wise-analysis.json');

const metricNameMap = {
  'Total Students Enrolled': 'totalEnrolled',
  'Discontinued/Absent': 'discontinued',
  'Total Appeared': 'totalAppeared',
  Distinction: 'distinction',
  'First Class': 'firstClass',
  'Second Class': 'secondClass',
  'Pass Class': 'passClass',
  Detained: 'detained',
  'No of Students Promoted': 'promoted',
  'No. of Centums': 'centums',
  'Pass Percentage': 'passPercentage',
};

const SHEET_CONFIGS = [
  { name: 'Languages', yearRow: 3, subjectRow: 4, sectionRow: 5, dataStart: 6, dataEnd: 20, nameCell: 1, defaultSection: 'TOT' },
  { name: 'SCIENCE', yearRow: 3, subjectRow: 4, sectionRow: 5, dataStart: 6, dataEnd: 20, nameCell: 0, defaultSection: 'SCI' },
  { name: 'COMMERCE', yearRow: 3, subjectRow: 4, sectionRow: null, dataStart: 6, dataEnd: 20, nameCell: 0, defaultSection: 'COM' },
];

function normalizeText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function normalizeYear(value) {
  const text = normalizeText(value);
  if (text === '25' || text === '2024-25') return '2024-25';
  if (text === '26' || text === '2025-26') return '2025-26';
  if (/^\d{4}-\d{2}$/.test(text)) return text;
  return null;
}

function normalizeMetric(value) {
  const cleaned = normalizeText(value).replace(/\.+/g, '').replace(/\s+/g, ' ');
  return metricNameMap[cleaned] || null;
}

function toNumeric(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

function readSheetRows(workbook, name) {
  const sheet = workbook.Sheets[name];
  if (!sheet) throw new Error(`Missing sheet: ${name}`);
  return XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
}

function buildRecords(rows, cfg) {
  const yearRow = rows[cfg.yearRow] || [];
  const subjectRow = rows[cfg.subjectRow] || [];
  const sectionRow = cfg.sectionRow !== null ? rows[cfg.sectionRow] || [] : [];

  const columnMeta = [];
  let lastYear = null;
  let lastSubject = '';
  for (let col = 0; col < Math.max(yearRow.length, subjectRow.length, sectionRow.length); col += 1) {
    const parsedYear = normalizeYear(yearRow[col]);
    if (parsedYear) lastYear = parsedYear;
    const year = lastYear;

    const parsedSubject = normalizeText(subjectRow[col]);
    if (parsedSubject) lastSubject = parsedSubject;
    const subject = lastSubject;

    if (!year || !subject) continue;
    const section = normalizeText(sectionRow[col]) || cfg.defaultSection;
    columnMeta.push({ col, year, subject, section });
  }

  const byKey = new Map();

  for (let r = cfg.dataStart; r <= cfg.dataEnd; r += 1) {
    const row = rows[r] || [];
    const rawMetric = row[cfg.nameCell];
    const metric = normalizeMetric(rawMetric);
    if (!metric) continue;

    columnMeta.forEach(({ col, year, subject, section }) => {
      const value = toNumeric(row[col]);
      if (value === null) return;
      const key = `${subject}|${section}|${year}`;
      const current = byKey.get(key) || {
        subject,
        section,
        year,
      };
      current[metric] = value;
      byKey.set(key, current);
    });
  }

  return [...byKey.values()];
}

function main() {
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`Excel file not found: ${workbookPath}`);
  }

  const workbook = XLSX.readFile(workbookPath);
  const records = SHEET_CONFIGS.flatMap((cfg) => {
    const rows = readSheetRows(workbook, cfg.name);
    return buildRecords(rows, cfg);
  });

  const payload = {
    generatedAt: new Date().toISOString(),
    sourceFile: path.basename(workbookPath),
    years: ['2024-25', '2025-26'],
    records: records.sort((a, b) => {
      if (a.subject !== b.subject) return a.subject.localeCompare(b.subject);
      if (a.section !== b.section) return a.section.localeCompare(b.section);
      return a.year.localeCompare(b.year);
    }),
  };

  fs.writeFileSync(outputPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${payload.records.length} records to ${outputPath}`);
}

main();
