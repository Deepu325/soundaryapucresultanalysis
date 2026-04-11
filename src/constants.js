export const streamMap = {
  PCMB: 'Science',
  PMC: 'Science',
  PCME: 'Science',
  PCMC: 'Science',
  CEBA: 'Commerce',
  SEBA: 'Commerce',
  MEBA: 'Commerce',
  MSBA: 'Commerce',
  PEBA: 'Commerce',
  CSBA: 'Commerce',
};

/**
 * Subject code → display name (II PU). Total distinct papers used here: 16.
 * Code 75 is the optional/Basic Maths paper for commerce streams (e.g. MEBA), not a second “Mathematics elective”.
 * Code 35 is standard Mathematics (e.g. PCMB). Code 78 is Basic Maths where used in syllabus.
 */
export const subjectNames = {
  '01': 'Kannada',
  '02': 'English',
  '03': 'Hindi',
  '09': 'Sanskrit',
  '22': 'Economics',
  '27': 'Business Studies',
  '29': 'Political Science',
  '30': 'Accountancy',
  '31': 'Statistics',
  '33': 'Physics',
  '34': 'Chemistry',
  '35': 'Mathematics',
  '36': 'Biology',
  '40': 'Electronics',
  '41': 'Computer Science',
  '75': 'Basic Maths',
  '78': 'Basic Maths',
};

export const PU_SUBJECT_PAPER_COUNT = 16;
