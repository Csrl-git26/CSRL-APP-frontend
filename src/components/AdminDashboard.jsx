import { useState, useEffect, useMemo, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Users, Building2, FileText, AlertTriangle, Trophy, ArrowLeft,
  ShieldCheck, Plus, Upload, Download, Package, Pencil, Trash2,
  Search, TrendingUp, TrendingDown, LayoutDashboard, BarChart2,
  Lightbulb, Loader2, CheckCircle2,
  Eye, BarChart3,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  fetchGlobalData,
  fetchOverview,
  fetchRankings,
  fetchCentreLeaderboard,
  fetchTestInsights,
  addStudentApi,
  bulkUpsertStudentsApi,
  updateStudentApi,
  deleteStudentApi,
  bulkDeleteStudentsApi,
  upsertTestScoresApi,
  bulkUpsertTestScoresApi,
  parseTestColumn,
  getStreamConfig,
  resolveStudentPhotoUrl,
  deleteTestApi,
} from '../services/dataService';
import { useToast } from '../context/ToastContext';
import StudentProfileView from './StudentProfileView';
import StudentFormModal from './StudentFormModal';
import TestDataModal from './TestDataModal';
import CentreLeaderboard from './CentreLeaderboard';
import TestInsightsPanel from './TestInsightsPanel';
import AdminWeakTopics from './AdminWeakTopics';
import UploadMarksAwardSheetModal from './UploadMarksAwardSheetModal';
import PastYearDataTab from './PastYearDataTab';
import { mapProfileToExcelRow } from './exportUtils';

// ── Constants ─────────────────────────────────────────────────────────────────

const STUDENT_TEMPLATE_COLUMNS = [
  'YEAR', 'SPONSOR', 'PROJECT NAME', 'CENTRE CODE', 'Roll Number',
  'Registration No. (SSRP, CBT, CLT)',
  'PEER GROUP (A, B, C, D, ...)', "STUDENT'S NAME", 'GENDER', 'CATEGORY',
  'Embibe Email Id', 'Embibe Mobile No.', 'Mobile No.', 'DATE OF BIRTH',
  'Mode of Selection (SSRP/CBT-01/CBT-02)', 'Written Test Marks (240)',
  'Interview Marks (90)', 'HO Score in Final Admission List (100)',
  "FATHER'S NAME", 'FATHER NATURE OF WORK', "FATHER'S INCOME (ANNUAL)",
  "MOTHER'S NAME", 'MOTHER NATURE OF WORK', "MOTHER'S INCOME (ANNUAL)",
  'SINGLE CHILD (YES/NO)', 'Number of Siblings', 'PERMANENT ADDRESS',
  'DISTRICT', 'STATE', 'PINCODE',
  '10th SCHOOL NAME', '10th DISTRICT', '10th STATE', '10th BOARD', '10th Percentage',
  '12th SCHOOL NAME', '12th BOARD', '12th DISTRICT', '12th STATE', '12th Percentage',
  'JEE MAINS 2024-25 SCORE CARD (IF ATTEMPTED)',
  'JEE MAINS 2024-25 Percentile', 'JEE Mains 2024-25 Qualification Status',
  'JEE Advanced 2024-25 Marks', 'JEE Advanced 2024-25 Qualification Status',
  'OMR SHEET', 'ADMIT CARD OF CSRL WRITTEN TEST', 'VACCINATION REPORT', 'KYS',
  'INTERVIEW SHEET A', 'INTERVIEW SHEET B', 'SIGNED TERM & CONDITION',
  'SIGNED PARENTS CONSENT', 'MEDICAL CERTIFICATE', 'MEDICAL HISTORY',
  'INDEMNITY CUM DECLARATION', 'DECLARATION CUM AFFIDAVIT',
  'INCOME CERTIFICATE (Original)', 'BANK STATEMENT',
  'CLASS 10TH MARKSHEET', 'CLASS 10TH PASSING CERTIFICATE',
  'CLASS 12TH MARKSHEET', 'CLASS 12TH PASSING CERTIFICATE',
  'AADHAAR CARD NUMBER', 'CATEGORY CERTIFICATE',
  'PHYSICAL DISABILITY CERTIFICATE', 'DOMICILE CERTIFICATE', 'Email Id'
];

const TABS = [
  { key: 'leaderboard', Icon: Trophy,         label: 'Centre Leaderboard' },
  { key: 'overview',    Icon: LayoutDashboard, label: 'Dashboard'          },
  { key: 'ranking',     Icon: TrendingUp,      label: 'Rankings'           },
  { key: 'insights',    Icon: BarChart3,       label: 'Test analysis'      },
  { key: 'students',    Icon: Users,           label: 'Students'           },
  { key: 'marks',       Icon: FileText,        label: 'Test Marks'         },
  { key: 'import',      Icon: Upload,          label: 'Import / Export'    },
  { key: 'pastyear',    Icon: Package,         label: 'Past Year Data'     },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function normalizeCellValue(v) {
  return (v === undefined || v === null) ? '' : String(v).trim();
}

function normalizeRollKey(v) {
  return normalizeCellValue(v).replace(/\.0+$/, '').toUpperCase();
}

function normalizeCenterCode(v) {
  return normalizeCellValue(v).toUpperCase();
}

function displayCenter(code) {
  if (!code) return '—';
  const upper = code.toUpperCase();
  if (upper === 'GAIL' || upper === 'KNP') return 'KNP';
  if (upper === 'OIL_INDIA' || upper === 'JDH') return 'JDH';
  return code;
}

function displaySponsor(code) {
  if (!code) return '—';
  const upper = code.toUpperCase();
  if (upper === 'GAIL' || upper === 'KNP') return 'GAIL';
  if (upper === 'OIL_INDIA' || upper === 'JDH') return 'OIL_INDIA';
  return '—';
}

function getRowField(row, keys) {
  const normalizedKeys = keys.map(k => k.toLowerCase().trim());
  for (const [k, v] of Object.entries(row)) {
    if (v !== undefined && v !== null && v !== '') {
      if (normalizedKeys.includes(k.toLowerCase().trim())) {
        return v;
      }
    }
  }
  return '';
}

function mapExcelStudentToProfile(row) {
  const roll   = normalizeRollKey(getRowField(row, ['Roll Number', 'roll_number', 'ROLL_NUMBER', 'roll', 'ROLL_KEY', 'Registration no.']));
  const name   = normalizeCellValue(getRowField(row, ["STUDENT'S NAME", 'name', 'Name']));
  const centre = normalizeCenterCode(getRowField(row, ['CENTRE CODE', 'centre', 'Center', 'center', 'centerCode']));
  const stream = normalizeCellValue(getRowField(row, ['stream', 'Stream', 'STREAM'])).toUpperCase() || 'JEE';

  return {
    YEAR:                      normalizeCellValue(getRowField(row, ['YEAR', 'Year', 'year'])),
    ROLL_KEY: roll,
    "STUDENT'S NAME": name,
    'Registration no.':        normalizeCellValue(getRowField(row, ['Registration No. (SSRP, CBT, CLT)', 'Registration no.', 'registration_no'])),
    centerCode:                centre,
    stream:                    stream === 'NEET' ? 'NEET' : 'JEE',
    SPONSOR:                   normalizeCellValue(getRowField(row, ['SPONSOR', 'SPONSER', 'COMPANY', 'PSU', 'ORGANIZATION'])),
    'PROJECT NAME':            normalizeCellValue(getRowField(row, ['PROJECT NAME', 'project_name'])),
    'CENTRE CODE':             normalizeCellValue(getRowField(row, ['CENTRE CODE', 'centre_code'])),
    'Roll Number':             roll,
    'PEER GROUP':              normalizeCellValue(getRowField(row, ['PEER GROUP', 'PEER GROUP (A, B, C, D, ...)', 'peer_group'])),
    GENDER:                    normalizeCellValue(getRowField(row, ['GENDER', 'gender', 'Gender'])),
    CATEGORY:                  normalizeCellValue(getRowField(row, ['CATEGORY', 'category', 'Category'])),
    'Embibe Email Id':         normalizeCellValue(getRowField(row, ['Embibe Email Id', 'embibe_email_id'])),
    'Embibe Mobile No.':       normalizeCellValue(getRowField(row, ['Embibe Mobile No.', 'embibe_mobile_no'])),
    'Mobile No.':              normalizeCellValue(getRowField(row, ['Mobile No.', 'mobile', 'Mobile', 'mobile_no'])),
    'DATE OF BIRTH':           normalizeCellValue(getRowField(row, ['DATE OF BIRTH', 'dob', 'Date of Birth'])),
    'Mode of Selection':       normalizeCellValue(getRowField(row, ['Mode of Selection', 'Mode of Selection (SSRP/CBT-01/CBT-02)', 'mode_of_selection'])),
    'Written Test Marks (240)':normalizeCellValue(getRowField(row, ['Written Test Marks (240)', 'written_test_marks'])),
    'Interview Marks (90)':    normalizeCellValue(getRowField(row, ['Interview Marks (90)', 'interview_marks'])),
    'HO Score in Final Admission': normalizeCellValue(getRowField(row, ['HO Score in Final Admission', 'HO Score in Final Admission List (100)', 'ho_score'])),
    "FATHER'S NAME":           normalizeCellValue(getRowField(row, ["FATHER'S NAME", 'parent_name', 'father_name'])),
    'FATHER NATURE OF WORK':   normalizeCellValue(getRowField(row, ['FATHER NATURE OF WORK', 'father_nature_of_work'])),
    "FATHER'S INCOME (ANNUAL)":normalizeCellValue(getRowField(row, ["FATHER'S INCOME (ANNUAL)", 'father_income'])),
    "MOTHER'S NAME":           normalizeCellValue(getRowField(row, ["MOTHER'S NAME", 'mother_name'])),
    'MOTHER NATURE OF WORK':   normalizeCellValue(getRowField(row, ['MOTHER NATURE OF WORK', 'mother_nature_of_work'])),
    "MOTHER'S INCOME (ANNUAL)":normalizeCellValue(getRowField(row, ["MOTHER'S INCOME (ANNUAL)", 'mother_income'])),
    'SINGLE CHILD (YES/NO)':   normalizeCellValue(getRowField(row, ['SINGLE CHILD (YES/NO)', 'single_child'])),
    'Number of Siblings':      normalizeCellValue(getRowField(row, ['Number of Siblings', 'number_of_siblings'])),
    'PARMANENT ADDRESS':       normalizeCellValue(getRowField(row, ['PARMANENT ADDRESS', 'PERMANENT ADDRESS', 'address', 'Address'])),
    DISTRICT:                  normalizeCellValue(getRowField(row, ['DISTRICT', 'district'])),
    STATE:                     normalizeCellValue(getRowField(row, ['STATE', 'state'])),
    PINCODE:                   normalizeCellValue(getRowField(row, ['PINCODE', 'pincode'])),
    '10th SCHOOL NAME':        normalizeCellValue(getRowField(row, ['10th SCHOOL NAME', 'school_10'])),
    '10th DISTRICT':           normalizeCellValue(getRowField(row, ['10th DISTRICT', 'DISTRICT_10', 'district_10'])),
    '10th STATE':              normalizeCellValue(getRowField(row, ['10th STATE', 'STATE_10', 'state_10'])),
    '10th BOARD':              normalizeCellValue(getRowField(row, ['10th BOARD', 'board_10'])),
    '10th Precentage':         normalizeCellValue(getRowField(row, ['10th Percentage', '10th Precentage', 'percentage_10'])),
    '12th SCHOOL NAME':        normalizeCellValue(getRowField(row, ['12th SCHOOL NAME', 'school_12'])),
    '12th BOARD':              normalizeCellValue(getRowField(row, ['12th BOARD', 'board_12'])),
    '12th DISTRICT':           normalizeCellValue(getRowField(row, ['12th DISTRICT', 'DISTRICT_12', 'district_12'])),
    '12th STATE':              normalizeCellValue(getRowField(row, ['12th STATE', 'STATE_12', 'state_12'])),
    '12th Precentage':         normalizeCellValue(getRowField(row, ['12th Percentage', '12th Precentage', 'percentage_12'])),
    'JEE MAINS SCORE CARD':    normalizeCellValue(getRowField(row, ['JEE MAINS 2024-25 SCORE CARD (IF ATTEMPTED)', 'jee_mains_score_card'])),
    'JEE MAINS 2024-25 Precentille': normalizeCellValue(getRowField(row, ['JEE MAINS 2024-25 Percentile', 'JEE MAINS 2024-25 Precentille', 'jee_mains_percentile'])),
    'JEE Mains Qualification Status': normalizeCellValue(getRowField(row, ['JEE Mains 2024-25 Qualification Status', 'jee_mains_qualification_status'])),
    'JEE Advanced Marks':      normalizeCellValue(getRowField(row, ['JEE Advanced 2024-25 Marks', 'jee_advanced_marks'])),
    'JEE Advanced Qualification Status': normalizeCellValue(getRowField(row, ['JEE Advanced 2024-25 Qualification Status', 'jee_advanced_qualification_status'])),
    'OMR SHEET':               normalizeCellValue(getRowField(row, ['OMR SHEET', 'omr_sheet'])),
    'ADMIT CARD OF CSRL WRITTEN TEST': normalizeCellValue(getRowField(row, ['ADMIT CARD OF CSRL WRITTEN TEST', 'admit_card_csrl_written_test'])),
    'VACCINATION REPORT':      normalizeCellValue(getRowField(row, ['VACCINATION REPORT', 'vaccination_report'])),
    'KYS':                     normalizeCellValue(getRowField(row, ['KYS', 'kys'])),
    'INTERVIEW SHEET A':       normalizeCellValue(getRowField(row, ['INTERVIEW SHEET A', 'interview_sheet_a'])),
    'INTERVIEW SHEET B':       normalizeCellValue(getRowField(row, ['INTERVIEW SHEET B', 'interview_sheet_b'])),
    'SIGNED TERM & CONDITION': normalizeCellValue(getRowField(row, ['SIGNED TERM & CONDITION', 'signed_term_condition'])),
    'SIGNED PARENTS CONSENT':  normalizeCellValue(getRowField(row, ['SIGNED PARENTS CONSENT', 'signed_parents_consent'])),
    'MEDICAL CERTIFICATE':     normalizeCellValue(getRowField(row, ['MEDICAL CERTIFICATE', 'medical_certificate'])),
    'MEDICAL HISTORY':         normalizeCellValue(getRowField(row, ['MEDICAL HISTORY', 'medical_history'])),
    'INDEMNITY CUM DECLARATION': normalizeCellValue(getRowField(row, ['INDEMNITY CUM DECLARATION', 'indemnity_cum_declaration'])),
    'DECLARATION CUM AFFIDAVIT': normalizeCellValue(getRowField(row, ['DECLARATION CUM AFFIDAVIT', 'declaration_cum_affidavit'])),
    'INCOME CERTIFICATE (Original)': normalizeCellValue(getRowField(row, ['INCOME CERTIFICATE (Original)', 'income_certificate'])),
    'BANK STATEMENT':          normalizeCellValue(getRowField(row, ['BANK STATEMENT', 'bank_statement'])),
    'CLASS 10TH MARKSHEET':    normalizeCellValue(getRowField(row, ['CLASS 10TH MARKSHEET', 'class_10_marksheet'])),
    'CLASS 10TH PASSING CERTIFICATE': normalizeCellValue(getRowField(row, ['CLASS 10TH PASSING CERTIFICATE', 'class_10_passing_certificate'])),
    'CLASS 12TH MARKSHEET':    normalizeCellValue(getRowField(row, ['CLASS 12TH MARKSHEET', 'class_12_marksheet'])),
    'CLASS 12TH PASSING CERTIFICATE': normalizeCellValue(getRowField(row, ['CLASS 12TH PASSING CERTIFICATE', 'class_12_passing_certificate'])),
    'AADHAAR CARD NUMBER':     normalizeCellValue(getRowField(row, ['AADHAAR CARD NUMBER', 'aadhaar_card_number'])),
    'CATEGORY CERTIFICATE':    normalizeCellValue(getRowField(row, ['CATEGORY CERTIFICATE', 'category_certificate'])),
    'PHYSICAL DISABILITY CERTIFICATE': normalizeCellValue(getRowField(row, ['PHYSICAL DISABILITY CERTIFICATE', 'physical_disability_certificate'])),
    'DOMICILE CERTIFICATE':    normalizeCellValue(getRowField(row, ['DOMICILE CERTIFICATE', 'domicile_certificate'])),
    'Email Id':                normalizeCellValue(getRowField(row, ['Email Id', 'email_id', 'email'])),
    
    // Legacy mapping (just in case)
    'parent_mobile':           normalizeCellValue(getRowField(row, ['parent_mobile', 'Parent Mobile'])),
    'FUTURE COLLEGE (TARGET)': normalizeCellValue(getRowField(row, ['future_college', 'FUTURE COLLEGE (TARGET)'])),
    'WEAK SUBJECT (MANUAL)':   normalizeCellValue(getRowField(row, ['weak_subject_manual', 'WEAK SUBJECT (MANUAL)'])),
    'STUDENT PHOTO URL':       normalizeCellValue(getRowField(row, ['student_photo_url', 'STUDENT PHOTO URL'])),
  };
}

function mapExcelMarkRow(row, testKey) {
  const roll = normalizeRollKey(getRowField(row, ['roll_number', 'ROLL_NUMBER', 'Roll Number', 'roll', 'ROLL_KEY']));
  
  const updateObj = {};
  
  // Extract test key from row if available, otherwise fallback to dropdown selection
  const rowTestKey = getRowField(row, ['test_key', 'test key', 'Test Key']) || testKey;

  // Metadata columns that should not be inserted as test scores
  const ignoreCols = [
    'roll_number', 'roll number', 'roll', 'roll_key',
    'name', 'student name', 'student_name', 'student',
    'stream', 'centre', 'center', 'test_key', 'test key',
    'rank', 's.no.', 'sno', 'sl no', 's.no'
  ];

  for (const [key, val] of Object.entries(row)) {
    const lowerKey = key.trim().toLowerCase();
    if (!lowerKey || ignoreCols.includes(lowerKey)) continue;
    
    // Map generic marks columns to the specific test key
    if (['marks', 'score', 'total marks', 'total_marks', 'total'].includes(lowerKey)) {
      updateObj[rowTestKey] = normalizeCellValue(val);
    } else {
      // If the column is just a subject name (like 'Physics') without an underscore, prepend the test key.
      const originalKey = key.trim();
      if (!originalKey.includes('_') && rowTestKey) {
        updateObj[`${rowTestKey}_${originalKey}`] = normalizeCellValue(val);
      } else {
        updateObj[originalKey] = normalizeCellValue(val);
      }
    }
  }

  // Remove empty values so we don't accidentally overwrite existing scores with blanks
  for (const k of Object.keys(updateObj)) {
    if (updateObj[k] === '' || updateObj[k] === null || updateObj[k] === undefined) {
      delete updateObj[k];
    }
  }


  return {
    roll,
    test: testKey,
    updateObj,
    centre: getRowField(row, ['centre', 'center', 'centerCode']),
    stream: getRowField(row, ['stream', 'Stream', 'STREAM']),
    name: getRowField(row, ['name', 'Name', "STUDENT'S NAME"])
  };
}

/**
 * Build flat marks rows from profiles + tests for the marks table.
 * Dynamically handles JEE (Phy/Che/Mat) and NEET (Phy/Che/Bio).
 */
function buildMarksRows(profiles, tests, testColumns) {
  const rows = [];
  const subjectCols = (testColumns || []).filter((c) => !parseTestColumn(c).isTotal);
  if (!subjectCols.length) return rows;

  profiles.forEach((profile) => {
    const testDoc = tests.find((t) => t.ROLL_KEY === profile.ROLL_KEY);
    if (!testDoc) return;

    const stream    = profile.stream || testDoc.stream || 'JEE';
    const testNames = new Set(subjectCols.map((c) => parseTestColumn(c).testName));

    testNames.forEach((testName) => {
      const subjects = {};
      let hasAnyScore = false;

      subjectCols.forEach((col) => {
        const meta = parseTestColumn(col);
        if (meta.testName !== testName) return;
        const raw = testDoc[col];
        if (raw === undefined || raw === null || raw === '' || String(raw).toLowerCase() === 'absent') return;
        const n = parseFloat(raw);
        if (!isNaN(n)) { subjects[meta.subject] = n; hasAnyScore = true; }
      });

      if (!hasAnyScore) return;

      const total = Object.values(subjects).reduce((s, v) => s + v, 0);
      rows.push({
        roll:     profile.ROLL_KEY,
        name:     profile["STUDENT'S NAME"] || '',
        centre:   profile.centerCode || '',
        sponsor:  profile.SPONSOR || '',
        stream,
        test:     testName,
        subjects,
        total,
      });
    });
  });

  return rows.sort(
    (a, b) =>
      a.roll.localeCompare(b.roll) ||
      String(a.test).localeCompare(String(b.test), undefined, { numeric: true })
  );
}

function getInitials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

function pctBar(numerator, denominator) {
  return denominator > 0 ? Math.round((numerator / denominator) * 100) : 0;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AdminDashboard() {
  const { activePage, setActivePage } = useOutletContext();
  const showToast = useToast();

  const [data,            setData]            = useState(null);
  const [overview,        setOverview]        = useState(null);
  const [topRanked,       setTopRanked]       = useState([]);
  const [bottomRanked,    setBottomRanked]    = useState([]);
  const [centreBoard,     setCentreBoard]     = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [error,           setError]           = useState('');

  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [selectedTestKey,  setSelectedTestKey]  = useState('');
  const [manualTestOptions, setManualTestOptions] = useState([]);

  const [searchTerm,     setSearchTerm]     = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterCenter,   setFilterCenter]   = useState('ALL');
  const [filterStream,   setFilterStream]   = useState('ALL');
  const [filterSponsor,  setFilterSponsor]  = useState('ALL');
  const [filterGender,   setFilterGender]   = useState('ALL');
  const [filterState,    setFilterState]    = useState('ALL');

  const [marksSearch,  setMarksSearch]  = useState('');
  const [marksTestF,   setMarksTestF]   = useState('');
  const [marksCentreF, setMarksCentreF] = useState('');

  const [modalMode,    setModalMode]    = useState(null);
  const [modalStudent, setModalStudent] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [showMarksAwardModal, setShowMarksAwardModal] = useState(false);
  const [selectedStudents, setSelectedStudents] = useState([]);

  const [importMode,    setImportMode]    = useState(null);
  const [uploadPreview, setUploadPreview] = useState([]);
  const [uploadError,   setUploadError]   = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [uploadTestKey, setUploadTestKey] = useState('');
  const fileRef = useRef(null);

  const [testInsights, setTestInsights] = useState(null);
  const [testInsightsLoading, setTestInsightsLoading] = useState(false);
  const [testInsightsError, setTestInsightsError] = useState('');
  
  // Trigger to refetch backend analytics
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const triggerRefresh = () => setRefreshTrigger((prev) => prev + 1);

  // ── Bootstrap ──────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchGlobalData()
      .then((d) => {
        setData(d);
        const rankingCols = (d.testColumns || [])
          .filter((c) => !String(c).includes('_'))
          .sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true, sensitivity: 'base' }));
        const candidate   = rankingCols.length ? rankingCols[0] : d.testColumns?.[0];
        if (candidate && !selectedTestKey) setSelectedTestKey(candidate);
      })
      .catch((err) => setError('Failed to load dashboard data: ' + err.message))
      .finally(() => setLoading(false));

    fetchOverview(null).then(setOverview).catch(() => null);
  }, [refreshTrigger]);

  // ── Reload backend analytics when test key changes or data refreshes ──

  useEffect(() => {
    if (!selectedTestKey) return;
    Promise.all([
      fetchRankings(null, { testKey: selectedTestKey, limit: 30, order: 'desc' }).catch(() => ({ ranked: [] })),
      fetchRankings(null, { testKey: selectedTestKey, limit: 30, order: 'asc'  }).catch(() => ({ ranked: [] })),
      fetchCentreLeaderboard(null, selectedTestKey).catch(() => []),
    ]).then(([top, bottom, board]) => {
      setTopRanked(top.ranked    || []);
      setBottomRanked(bottom.ranked || []);
      setCentreBoard(Array.isArray(board) ? board : []);
    });
  }, [selectedTestKey, refreshTrigger]);

  useEffect(() => {
    if (activePage !== 'insights' || !selectedTestKey) return undefined;
    let cancelled = false;
    setTestInsightsLoading(true);
    setTestInsightsError('');
    fetchTestInsights(null, selectedTestKey, null)
      .then((d) => {
        if (!cancelled) setTestInsights(d);
      })
      .catch((err) => {
        if (!cancelled) setTestInsightsError(err.message || 'Failed to load test analysis');
      })
      .finally(() => {
        if (!cancelled) setTestInsightsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activePage, selectedTestKey, refreshTrigger]);

  // ── Derived data ───────────────────────────────────────────────────────────

  const rankingTestColumns = useMemo(
    () => (data?.testColumns || [])
      .filter((c) => !String(c).includes('_'))
      .sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true, sensitivity: 'base' })),
    [data]
  );

  const allTestOptions = useMemo(
    () => [...new Set([...manualTestOptions, ...rankingTestColumns])]
      .sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true, sensitivity: 'base' })),
    [manualTestOptions, rankingTestColumns]
  );

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.toLowerCase();
    return data.profiles.filter((p) => {
      const matchSearch  = !q || (p["STUDENT'S NAME"] || '').toLowerCase().includes(q) || (p.ROLL_KEY || '').toLowerCase().includes(q);
      const matchCat     = filterCategory === 'ALL' || p.CATEGORY   === filterCategory;
      const matchCenter  = filterCenter   === 'ALL' || p.centerCode === filterCenter;
      const matchStream  = filterStream   === 'ALL' || (p.stream || 'JEE') === filterStream;
      const matchSponsor = filterSponsor  === 'ALL' || (p.SPONSOR || displaySponsor(p.centerCode)) === filterSponsor;
      const matchGender  = filterGender   === 'ALL' || p.GENDER === filterGender;
      const matchState   = filterState    === 'ALL' || p.STATE === filterState;
      return matchSearch && matchCat && matchCenter && matchStream && matchSponsor && matchGender && matchState;
    }).sort((a, b) => a.ROLL_KEY.localeCompare(b.ROLL_KEY, undefined, { numeric: true }));
  }, [data, searchTerm, filterCategory, filterCenter, filterStream, filterSponsor, filterGender, filterState]);

  const categories  = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.CATEGORY).filter(Boolean))]], [data]);
  const centersList = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.centerCode).filter(Boolean))]], [data]);
  const sponsorsList = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.SPONSOR || displaySponsor(p.centerCode)).filter(Boolean))]], [data]);
  const gendersList = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.GENDER).filter(Boolean))]], [data]);
  const statesList  = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.STATE).filter(Boolean))]], [data]);

  // All unique subjects across test columns (for dynamic marks table header)
  const allSubjects = useMemo(() => {
    const seen = new Set();
    (data?.testColumns || []).forEach((col) => {
      const { subject, isTotal } = parseTestColumn(col);
      if (!isTotal && subject !== 'Total') seen.add(subject);
    });
    return Array.from(seen);
  }, [data]);

  const flatMarks = useMemo(
    () => buildMarksRows(data?.profiles || [], data?.tests || [], data?.testColumns || []),
    [data]
  );

  const filteredFlatMarks = useMemo(() => {
    const q = marksSearch.toLowerCase();
    return flatMarks.filter((m) => {
      const matchQ = !q || m.roll.toLowerCase().includes(q) || (m.name || '').toLowerCase().includes(q);
      const matchT = !marksTestF   || m.test   === marksTestF;
      const matchC = !marksCentreF || m.centre === marksCentreF;
      return matchQ && matchT && matchC;
    });
  }, [flatMarks, marksSearch, marksTestF, marksCentreF]);

  const uniqueMarkTests = useMemo(() => [...new Set(flatMarks.map((m) => m.test))].sort(), [flatMarks]);

  const handleAddNewTestOption = () => {
    const raw = window.prompt('Enter new test name (example: CAT-9(TEST))');
    const next = String(raw || '').trim();
    if (!next) return;
    const exists = allTestOptions.some((t) => String(t).toLowerCase() === next.toLowerCase());
    if (!exists) {
      setManualTestOptions((prev) => [...prev, next]);
      showToast(`Added test option: ${next}`, 'success');
    }
    setSelectedTestKey(next);
    setUploadTestKey(next);
  };

  const profileByRoll = useMemo(() => {
    const map = new Map();
    (data?.profiles || []).forEach((p) => map.set(p.ROLL_KEY, p));
    return map;
  }, [data]);

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleAddStudent = async (form) => {
    setModalLoading(true);
    try {
      const result = await addStudentApi(null, form);
      setData((d) => ({ ...d, profiles: [...d.profiles, result.student] }));
      triggerRefresh();
      setModalMode(null);
      showToast('Student added successfully.', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleEditStudent = async (form) => {
    setModalLoading(true);
    try {
      const result = await updateStudentApi(null, modalStudent.ROLL_KEY, form);
      setData((d) => ({ ...d, profiles: d.profiles.map((p) => p.ROLL_KEY === modalStudent.ROLL_KEY ? result.student : p) }));
      triggerRefresh();
      setModalMode(null);
      showToast('Student updated successfully.', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteStudent = async (rollKey, centerCode) => {
    if (!window.confirm(`Delete student ${rollKey}? This action cannot be undone.`)) return;
    try {
      await deleteStudentApi(null, rollKey, centerCode);
      setData((d) => ({
        ...d,
        profiles: d.profiles.filter((p) => p.ROLL_KEY !== rollKey),
        tests:    d.tests.filter((t)    => t.ROLL_KEY !== rollKey),
      }));
      triggerRefresh();
      showToast(`Student ${rollKey} deleted.`, 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleBulkDeleteStudents = async () => {
    if (!selectedStudents.length) return;
    if (!window.confirm(`Delete ${selectedStudents.length} students? This action cannot be undone.`)) return;
    try {
      await bulkDeleteStudentsApi(null, selectedStudents);
      setData((d) => ({
        ...d,
        profiles: d.profiles.filter((p) => !selectedStudents.includes(p.ROLL_KEY)),
        tests:    d.tests.filter((t)    => !selectedStudents.includes(t.ROLL_KEY)),
      }));
      triggerRefresh();
      setSelectedStudents([]);
      showToast(`${selectedStudents.length} students deleted successfully.`, 'success');
    } catch (e) {
      showToast('Error deleting students: ' + e.message, 'error');
    }
  };

  const handleExportSelectedStudents = () => {
    if (!selectedStudents.length) return;
    const dataToExport = data.profiles.filter((p) => selectedStudents.includes(p.ROLL_KEY));
    const cleanData = dataToExport.map(mapProfileToExcelRow);

    const worksheet = XLSX.utils.json_to_sheet(cleanData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Selected_Students');
    XLSX.writeFile(workbook, 'Selected_Students_Export.xlsx');
    showToast(`Exported ${selectedStudents.length} students to Excel.`, 'success');
  };

  const handleSaveTestScores = async (scores) => {
    setModalLoading(true);
    try {
      const result = await upsertTestScoresApi(null, modalStudent.ROLL_KEY, scores, modalStudent.centerCode);
      triggerRefresh();
      setModalMode(null);
      showToast('Test scores saved.', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // ── Export helpers ─────────────────────────────────────────────────────────

  const downloadStudentTemplate = () => {
    const rows = [
      STUDENT_TEMPLATE_COLUMNS,
      [
        // SPONSOR, PROJECT NAME, CENTRE CODE, Roll Number
        'GAIL', 'PROJECT XYZ', 'KNP', '2701001',
        // PEER GROUP, STUDENT'S NAME, GENDER, CATEGORY
        'A', 'Aarav Sharma', 'Male', 'OBC',
        // Embibe Email, Embibe Mobile, Mobile No, DATE OF BIRTH
        'aarav@embibe.com', '9876543210', '9876543210', '15/03/2006',
        // Mode of Selection, Written Test Marks, Interview Marks, HO Score
        'SSRP', 88, 30, 75,
        // FATHER'S NAME, FATHER NATURE, FATHER'S INCOME, MOTHER'S NAME, MOTHER NATURE, MOTHER'S INCOME
        'Rajesh Sharma', 'Govt. Job', '5,00,000', 'Priya Sharma', 'Housewife', '0',
        // SINGLE CHILD, Siblings, ADDRESS, DISTRICT, STATE, PINCODE
        'No', 1, 'Civil Lines, Kanpur', 'Kanpur', 'Uttar Pradesh', '208001',
        // 10th SCHOOL, 10th DISTRICT, 10th STATE, 10th BOARD, 10th %
        'DPS Kanpur', 'Kanpur', 'Uttar Pradesh', 'CBSE', 92.4,
        // 12th SCHOOL, 12th BOARD, 12th DISTRICT, 12th STATE, 12th %
        'KV Kanpur', 'CBSE', 'Kanpur', 'Uttar Pradesh', 89.1,
        // JEE Score Card, JEE Percentile, JEE Mains Qual, JEE Advanced Marks, JEE Advanced Qual
        'Yes', 95.5, 'Qualified', '', '',
        // OMR, Admit Card, Vacc, KYS, Interview A, Interview B, Signed Term, Signed Parents
        'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y',
        // Medical Cert, Medical History, Indemnity, Declaration, Income Cert, Bank Stmt
        'Y', 'N', 'Y', 'Y', 'Y', 'Y',
        // 10th Marksheet, 10th Pass Cert, 12th Marksheet, 12th Pass Cert
        'Y', 'Y', 'Y', 'Y',
        // Aadhaar, Category Cert, Disability Cert, Domicile, Email
        '1234-5678-9012', 'Y', 'N', 'Y', 'aarav@gmail.com'
      ]
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = STUDENT_TEMPLATE_COLUMNS.map(() => ({ wch: 22 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Students Template');
    XLSX.writeFile(wb, 'CSRL_Students_Template.xlsx');
  };

  const downloadMarksSampleFormat = () => {
    const rows = [
      ['Roll Number', 'name', 'stream', 'centre', 'Physics', 'Chemistry', 'Mathematics', 'Marks'],
      ['GAIL-JEE-001', 'John Doe', 'JEE', 'GAIL', 40, 50, 30, 120],
      ['GAIL-JEE-002', 'Jane Smith', 'JEE', 'GAIL', 50, 60, 40, 150]
    ];
    const ws = XLSX.utils.aoa_to_sheet(rows);
    ws['!cols'] = [{ wch: 15 }, { wch: 20 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 10 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Marks Template');
    XLSX.writeFile(wb, 'CSRL_Marks_Template.xlsx');
  };

  const exportStudentsXlsx = () => {
    if (!data?.profiles?.length) { showToast('No students to export.', 'warning'); return; }
    const rows = data.profiles.map(mapProfileToExcelRow);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), 'Students');
    XLSX.writeFile(wb, 'CSRL_Students_Export.xlsx');
    showToast('Student data exported.', 'success');
  };

  const exportMarksXlsx = () => {
    if (!selectedTestKey) { showToast('Select a test column first.', 'warning'); return; }
    const rows = (data?.profiles || []).map((p) => {
      const scoreDoc = data.tests.find((t) => t.ROLL_KEY === p.ROLL_KEY) || {};
      return {
        'Roll Number': p.ROLL_KEY,
        name:        p["STUDENT'S NAME"] || '',
        stream:      p.stream || 'JEE',
        centre:      p.centerCode || '',
        test_key:    selectedTestKey,
        marks:       scoreDoc[selectedTestKey] ?? '',
      };
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(rows), `Marks_${selectedTestKey}`);
    XLSX.writeFile(wb, `CSRL_Marks_${selectedTestKey}.xlsx`);
    showToast('Marks exported.', 'success');
  };

  const handleFormatTestData = async () => {
    if (!selectedTestKey) { showToast('Select a test column first.', 'warning'); return; }
    if (!window.confirm(`Are you absolutely sure you want to format (delete) all marks and analytics data for "${selectedTestKey}"? This will wipe the test completely and cannot be undone.`)) return;

    try {
      const res = await deleteTestApi(null, selectedTestKey);
      if (res.success) {
        showToast(`Successfully formatted test data for ${selectedTestKey}.`, 'success');
        setRefreshTrigger((r) => r + 1);
      } else {
        showToast(res.message || 'Failed to format test data.', 'error');
      }
    } catch (e) {
      showToast('Error formatting test data: ' + e.message, 'error');
    }
  };

  const exportCombinedWorkbook = () => {
    if (!data) return;
    const studentsRows = data.profiles.map(mapProfileToExcelRow);
    const marksRows = data.tests.map((t) => {
      const row = { roll_number: t.ROLL_KEY };
      (data.testColumns || []).forEach((col) => { row[col] = t[col] ?? ''; });
      return row;
    });
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(studentsRows), 'Students');
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(marksRows),    'Scores');
    XLSX.writeFile(wb, 'CSRL_Full_Data_Export.xlsx');
    showToast('Full workbook exported.', 'success');
  };

  // ── Import modal ────────────────────────────────────────────────────────────

  const resetImportState = () => {
    setUploadPreview([]); setUploadError(''); setUploadLoading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  const openImportModal = (mode) => {
    setImportMode(mode);
    setUploadTestKey(selectedTestKey || allTestOptions[0] || '');
    resetImportState();
  };

  const closeImportModal = () => { setImportMode(null); resetImportState(); };

  const handleImportFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      setUploadError('Please upload an .xlsx, .xls, or .csv file.');
      return;
    }
    setUploadLoading(true); setUploadError('');
    try {
      const buffer = await file.arrayBuffer();
      const wb     = XLSX.read(buffer, { type: 'array' });
      const ws     = wb.Sheets[wb.SheetNames[0]];
      const rows   = XLSX.utils.sheet_to_json(ws, { defval: '' });
      if (!rows.length) { setUploadError('The file contains no data rows.'); setUploadPreview([]); return; }

      if (importMode === 'students') {
        const existingRolls = new Set((data?.profiles || []).map((p) => normalizeRollKey(p.ROLL_KEY)));
        setUploadPreview(rows.map((row, idx) => {
          const mapped = mapExcelStudentToProfile(row);
          if (!mapped.ROLL_KEY)             return { row: idx + 2, status: 'err', reason: 'Missing roll_number' };
          if (!mapped["STUDENT'S NAME"])    return { row: idx + 2, status: 'err', reason: 'Missing name',   roll: mapped.ROLL_KEY };
          if (!mapped.centerCode)           return { row: idx + 2, status: 'err', reason: 'Missing centre', roll: mapped.ROLL_KEY };
          const exists = existingRolls.has(mapped.ROLL_KEY);
          return { row: idx + 2, status: exists ? 'update' : 'new', reason: exists ? 'Will update' : 'Will insert', roll: mapped.ROLL_KEY, name: mapped["STUDENT'S NAME"], centre: mapped.centerCode, payload: mapped };
        }));
      } else {
        const rollResolver = new Map();
        (data?.profiles || []).forEach(p => {
          const rk = normalizeRollKey(p.ROLL_KEY);
          if (rk) rollResolver.set(rk, p.ROLL_KEY);
          if (p['ROLL NO.']) rollResolver.set(normalizeRollKey(p['ROLL NO.']), p.ROLL_KEY);
          if (p['Registration no.']) rollResolver.set(normalizeRollKey(p['Registration no.']), p.ROLL_KEY);
        });

        const existingMarks = new Set((data?.tests || []).filter((t) => t[uploadTestKey] !== undefined).map((t) => t.ROLL_KEY));
        
        setUploadPreview(rows.map((row, idx) => {
          const mapped = mapExcelMarkRow(row, uploadTestKey);
          if (!mapped.roll) return { row: idx + 2, status: 'err', reason: 'Missing roll_number' };
          
          const resolvedRollKey = rollResolver.get(mapped.roll);
          if (!resolvedRollKey) return { row: idx + 2, status: 'err', reason: 'Roll not found', roll: mapped.roll };
          
          mapped.roll = resolvedRollKey;
          
          const colsFound = Object.keys(mapped.updateObj).length;
          if (colsFound === 0) return { row: idx + 2, status: 'err', reason: 'Missing marks columns', roll: mapped.roll };
          
          const exists = existingMarks.has(resolvedRollKey);
          return { 
            row: idx + 2, 
            status: exists ? 'update' : 'new', 
            reason: exists ? 'Will update score' : 'Will create score', 
            roll: mapped.roll, 
            marks: `${colsFound} subject(s)`, 
            payload: mapped 
          };
        }));
      }
    } catch (e) {
      setUploadError('Failed to parse file: ' + e.message);
      setUploadPreview([]);
    } finally {
      setUploadLoading(false);
    }
  };

  const confirmImport = async () => {
    const valid = uploadPreview.filter((p) => p.status === 'new' || p.status === 'update');
    if (!valid.length) { showToast('No valid rows to import.', 'warning'); return; }
    setUploadLoading(true);
    try {
      if (importMode === 'students') {
        // ── FAST BULK UPLOAD: send all students in ONE request ──
        const allStudents = valid.map((row) => row.payload);
        const result = await bulkUpsertStudentsApi(null, allStudents);
        triggerRefresh();
        showToast(`Students imported: ${result.inserted || 0} new, ${result.updated || 0} updated (${result.total || allStudents.length} total).`, 'success');
      } else {
        // ── FAST BULK UPLOAD: send all test marks in ONE request ──
        const allMarks = valid.map((row) => {
          const rowRoll = normalizeRollKey(row.payload.roll);
          const profile = data.profiles.find((p) => normalizeRollKey(p.ROLL_KEY) === rowRoll);
          const fallbackCenter = normalizeCenterCode(row.payload.centre);
          const centerCodeToUse = profile?.centerCode || fallbackCenter;

          return {
            rollKey: rowRoll,
            centerCode: centerCodeToUse,
            scores: row.payload.updateObj
          };
        });

        const result = await bulkUpsertTestScoresApi(null, allMarks);
        triggerRefresh();
        showToast(`Marks imported: ${result.upsertedCount || 0} new, ${result.modifiedCount || 0} updated (${result.matchedCount + result.upsertedCount} total).`, 'success');
      }
      closeImportModal();
    } catch (e) {
      showToast('Import failed: ' + e.message, 'error');
    } finally {
      setUploadLoading(false);
    }
  };

  // ── Render states ──────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="fade-in dashboard-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: 'var(--gray-400)' }}>
          <Loader2 size={36} className="spin" />
          <p style={{ fontWeight: 600 }}>Aggregating all centre data…</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fade-in dashboard-page" style={{ justifyContent: 'center', alignItems: 'center', padding: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: 'var(--red)' }}>
          <AlertTriangle size={20} />{error}
        </div>
      </div>
    );
  }

  if (viewingStudentId) {
    const profile      = data.profiles.find((p) => p.ROLL_KEY === viewingStudentId);
    const studentTests = data.tests.find((t) => t.ROLL_KEY === viewingStudentId) || {};
    return (
      <div className="fade-in dashboard-page">
        <div className="page-header">
          <button type="button" onClick={() => setViewingStudentId(null)} className="btn btn-sm" style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', marginRight: 8, gap: 5 }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div>
            <h1>Student Profile</h1>
            <p>{profile?.["STUDENT'S NAME"]} · {viewingStudentId}</p>
          </div>
        </div>
        <div className="content dashboard-page-body">
          <div className="dashboard-scroll">
            <StudentProfileView profile={profile} studentTests={studentTests} testColumns={data.testColumns} />
          </div>
        </div>
      </div>
    );
  }

  // ── Section components ─────────────────────────────────────────────────────

  const OverviewSection = () => {
    const totalStudents  = overview?.totalStudents ?? data.profiles.length;
    const weakSubject    = overview?.weakSubject   ?? 'N/A';
    const jeeCount       = data.profiles.filter((p) => (p.stream || 'JEE') === 'JEE').length;
    const neetCount      = data.profiles.filter((p) => p.stream === 'NEET').length;

    const statCards = [
      { Icon: Users,         value: totalStudents,                      label: 'Total Students',     bg: '#e8f0fc', color: '#1a4fa0' },
      { Icon: Building2,     value: Math.max(0, centersList.length - 1), label: 'Active Centres',    bg: '#fff3e0', color: '#b45309' },
      { Icon: FileText,      value: data?.tests?.length || 0,           label: 'Marks Entries',      bg: '#e6f5ed', color: '#1a6e3b' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="grid-3">
          {statCards.map((card) => {
            const CardIcon = card.Icon;
            return (
              <div className="stat-card" key={card.label}>
                <div className="stat-icon" style={{ background: card.bg }}>
                  <CardIcon size={20} color={card.color} aria-hidden="true" />
                </div>
                <div>
                  <div className="stat-val" style={{ color: card.color }}>{card.value}</div>
                  <div className="stat-lbl">{card.label}</div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="section-title">
              <Trophy size={15} style={{ marginRight: 6 }} aria-hidden="true" />
              Top Centres — {selectedTestKey}
            </div>
            <CentreLeaderboard centreStats={centreBoard} selTest={selectedTestKey} />
          </div>
          <div className="card">
            <div className="section-title">Category & Stream Distribution</div>
            {['General', 'OBC', 'SC', 'ST'].map((cat) => {
              const count = data.profiles.filter((s) => s.CATEGORY === cat).length;
              if (!count) return null;
              return (
                <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                  <span className={`badge badge-${cat.toLowerCase()}`} style={{ minWidth: 68, textAlign: 'center' }}>{cat}</span>
                  <div style={{ flex: 1 }}>
                    <div className="progress-bar">
                      <div className="progress-fill" style={{ width: `${pctBar(count, totalStudents || 1)}%`, background: '#1a4fa0' }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 14, fontWeight: 600, minWidth: 22, textAlign: 'right' }}>{count}</span>
                </div>
              );
            })}
            <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px solid var(--gray-100)', display: 'flex', gap: 10 }}>
              <div style={{ flex: 1, background: '#e8f0fc', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1a4fa0' }}>{jeeCount}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>JEE</div>
              </div>
              <div style={{ flex: 1, background: '#e6f5ed', borderRadius: 8, padding: '10px 14px', textAlign: 'center' }}>
                <div style={{ fontSize: 20, fontWeight: 800, color: '#1a6e3b' }}>{neetCount}</div>
                <div style={{ fontSize: 12, color: 'var(--gray-600)' }}>NEET</div>
              </div>
            </div>
          </div>
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <AdminWeakTopics centersList={centersList} selectedTestKey={selectedTestKey} />
        </div>
      </div>
    );
  };

  const LeaderboardSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 800, color: 'var(--gray-800)' }}>
            <Trophy size={18} aria-hidden="true" />Centre Rankings — {selectedTestKey}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>Sorted descending by average score</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--gray-600)' }}>Test:</span>
          <select className="input select" value={selectedTestKey} onChange={(e) => setSelectedTestKey(e.target.value)} style={{ width: 170, fontSize: 13 }}>
            {allTestOptions.map((col) => <option key={col} value={col}>{col}</option>)}
          </select>
          <button type="button" className="btn btn-sm btn-outline" onClick={handleAddNewTestOption}>+ New Test</button>
        </div>
      </div>
      <CentreLeaderboard centreStats={centreBoard} selTest={selectedTestKey} />
    </div>
  );

  const RankingsSection = () => (
    <div className="grid-2">
      <Top30Section />
      <Bottom30Section />
    </div>
  );

  const StudentsSection = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <Users size={15} aria-hidden="true" />Students ({filteredStudents.length})
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {selectedStudents.length > 0 && (
            <>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleExportSelectedStudents}>
                <Download size={13} /> Export Selected ({selectedStudents.length})
              </button>
              <button type="button" className="btn btn-danger btn-sm" onClick={handleBulkDeleteStudents}>
                <Trash2 size={13} /> Delete Selected ({selectedStudents.length})
              </button>
            </>
          )}
          <button type="button" className="btn btn-purple btn-sm" onClick={() => openImportModal('students')}>
            <Upload size={13} /> Bulk Upload
          </button>
          <button type="button" className="btn btn-success btn-sm" onClick={() => { setModalStudent(null); setModalMode('add'); }}>
            <Plus size={13} /> Add Student
          </button>
        </div>
      </div>
      <div className="search-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
        <div style={{ position: 'relative', flex: '1 1 200px' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          <input className="input" placeholder="Name or roll…" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: '100%', paddingLeft: 30 }} />
        </div>
        <select className="input select" value={filterSponsor} onChange={(e) => setFilterSponsor(e.target.value)} style={{ flex: '1 1 120px' }}>
          <option value="ALL">All Sponsors</option>
          {sponsorsList.filter((s) => s !== 'ALL').map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select className="input select" value={filterCenter}   onChange={(e) => setFilterCenter(e.target.value)}   style={{ flex: '1 1 120px' }}>
          <option value="ALL">All Centres</option>
          {centersList.filter((c) => c !== 'ALL').map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <select className="input select" value={filterStream}   onChange={(e) => setFilterStream(e.target.value)}   style={{ flex: '1 1 120px' }}>
          <option value="ALL">All Streams</option>
          <option value="JEE">JEE</option>
          <option value="NEET">NEET</option>
        </select>
        <select className="input select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} style={{ flex: '1 1 120px' }}>
          {categories.map((c) => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
        </select>
        <select className="input select" value={filterGender} onChange={(e) => setFilterGender(e.target.value)} style={{ flex: '1 1 100px' }}>
          <option value="ALL">All Genders</option>
          {gendersList.filter((g) => g !== 'ALL').map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        <select className="input select" value={filterState} onChange={(e) => setFilterState(e.target.value)} style={{ flex: '1 1 120px' }}>
          <option value="ALL">All States</option>
          {statesList.filter((s) => s !== 'ALL').map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th style={{ width: 40, textAlign: 'center' }}>
                <input 
                  type="checkbox" 
                  checked={filteredStudents.length > 0 && selectedStudents.length === filteredStudents.length}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedStudents(filteredStudents.map(s => s.ROLL_KEY));
                    } else {
                      setSelectedStudents([]);
                    }
                  }}
                />
              </th>
              <th>Roll</th><th>Name</th><th>Centre</th><th>Sponsor</th><th>Stream</th><th>Category</th><th>Mobile</th><th>Class 10</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => {
              const photoUrl = s['STUDENT PHOTO URL'] ? resolveStudentPhotoUrl(s['STUDENT PHOTO URL'], 'fallback') : null;
              return (
              <tr key={s.ROLL_KEY} style={{ background: selectedStudents.includes(s.ROLL_KEY) ? 'var(--gray-50)' : 'transparent' }}>
                <td style={{ textAlign: 'center' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedStudents.includes(s.ROLL_KEY)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedStudents([...selectedStudents, s.ROLL_KEY]);
                      } else {
                        setSelectedStudents(selectedStudents.filter(roll => roll !== s.ROLL_KEY));
                      }
                    }}
                  />
                </td>
                <td><strong style={{ color: '#1a4fa0' }}>{s.ROLL_KEY}</strong></td>
                <td>
                  <div className="student-row">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Avatar" className="avatar" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="avatar">{getInitials(s["STUDENT'S NAME"])}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{s["STUDENT'S NAME"]}</div>
                      <div style={{ fontSize: 11, color: 'var(--gray-400)' }}>{s.GENDER || '—'}</div>
                    </div>
                  </div>
                </td>
                <td><span className="badge" style={{ background: '#e8f0fc', color: '#1a4fa0' }}>{displayCenter(s.centerCode)}</span></td>
                <td><span className="badge" style={{ background: '#fce8e8', color: '#a01a1a' }}>{s.SPONSOR || displaySponsor(s.centerCode)}</span></td>
                <td>
                  <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 3, background: s.stream === 'NEET' ? '#e6f5ed' : '#e8f0fc', color: s.stream === 'NEET' ? '#1a6e3b' : '#1a4fa0', fontWeight: 700 }}>
                    {s.stream || 'JEE'}
                  </span>
                </td>
                <td><span className={`badge badge-${(s.CATEGORY || 'general').toLowerCase()}`}>{s.CATEGORY || 'General'}</span></td>
                <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{s['Mobile No.'] || '—'}</td>
                <td>{s['10th Precentage'] ? `${s['10th Precentage']}%` : '—'}</td>
                <td>
                  <div className="action-btns">
                    <button type="button" className="btn btn-primary btn-sm" aria-label="View student profile" onClick={() => setViewingStudentId(s.ROLL_KEY)}>
                      <Eye size={13} />
                    </button>
                    <button type="button" className="btn btn-warning btn-sm" aria-label="Edit student" onClick={() => { setModalStudent(s); setModalMode('edit'); }}>
                      <Pencil size={13} />
                    </button>
                    <button type="button" className="btn btn-outline btn-sm" aria-label="Edit test scores" onClick={() => { setModalStudent(s); setModalMode('tests'); }}>
                      <FileText size={13} />
                    </button>
                    <button type="button" className="btn btn-danger btn-sm" aria-label="Delete student" onClick={() => handleDeleteStudent(s.ROLL_KEY, s.centerCode)}>
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            );
            })}
            {!filteredStudents.length && (
              <tr><td colSpan={10} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>No students found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const MarksSection = () => (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap', gap: 10 }}>
        <div className="section-title" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 6 }}>
          <FileText size={15} aria-hidden="true" />Test Marks ({filteredFlatMarks.length})
        </div>
        <button type="button" className="btn btn-teal btn-sm" onClick={() => openImportModal('marks')}>
          <Upload size={13} /> Bulk Upload
        </button>
      </div>
      <div className="search-row">
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
          <input className="input" placeholder="Roll or name…" value={marksSearch} onChange={(e) => setMarksSearch(e.target.value)} style={{ maxWidth: 220, paddingLeft: 30 }} />
        </div>
        <select className="input select" value={marksTestF}   onChange={(e) => setMarksTestF(e.target.value)}   style={{ maxWidth: 220 }}>
          <option value="">All Tests</option>
          {uniqueMarkTests.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input select" value={marksCentreF} onChange={(e) => setMarksCentreF(e.target.value)} style={{ maxWidth: 180 }}>
          <option value="">All Centres</option>
          {centersList.filter((c) => c !== 'ALL').map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>
      <div className="table-wrap">
        <table className="table table-compact">
          <thead>
            <tr>
              <th>Roll</th><th>Name</th><th>Centre</th><th>Sponsor</th><th>Stream</th><th>Test</th>
              {allSubjects.map((s) => {
                const abbr = s === 'Physics' ? 'P' : s === 'Chemistry' ? 'C' : (s === 'Math' || s === 'Mathematics') ? 'M' : s === 'Biology' ? 'B' : s.substring(0, 3);
                return <th key={s} title={s}>{abbr}</th>;
              })}
              <th>Total</th><th>%</th>
            </tr>
          </thead>
          <tbody>
            {filteredFlatMarks.map((m) => {
              const maxTotal = getStreamConfig(m.stream).maxTotal;
              const pct      = m.total ? Math.round((m.total / maxTotal) * 100) : 0;
              return (
                <tr key={`${m.roll}-${m.test}`}>
                  <td><strong style={{ color: '#1a4fa0' }}>{m.roll}</strong></td>
                  <td style={{ fontWeight: 500, fontSize: 13 }}>{m.name || '—'}</td>
                  <td><span className="badge" style={{ background: '#e8f0fc', color: '#1a4fa0', fontSize: 11 }}>{displayCenter(m.centre)}</span></td>
                  <td><span className="badge" style={{ background: '#fce8e8', color: '#a01a1a', fontSize: 11 }}>{m.sponsor || displaySponsor(m.centre)}</span></td>
                  <td>
                    <span style={{ fontSize: 11, padding: '2px 5px', borderRadius: 3, background: m.stream === 'NEET' ? '#e6f5ed' : '#e8f0fc', color: m.stream === 'NEET' ? '#1a6e3b' : '#1a4fa0', fontWeight: 700 }}>
                      {m.stream}
                    </span>
                  </td>
                  <td><strong style={{ color: 'var(--csrl-orange)' }}>{m.test}</strong></td>
                  {allSubjects.map((sub) => (
                    <td key={sub} style={{ color: m.subjects[sub] === undefined ? 'var(--gray-200)' : 'inherit' }}>
                      {m.subjects[sub] ?? '—'}
                    </td>
                  ))}
                  <td><strong style={{ color: '#1a4fa0' }}>{m.total}</strong></td>
                  <td><span className={`chip ${pct >= 60 ? 'chip-good' : 'chip-weak'}`}>{pct}%</span></td>
                </tr>
              );
            })}
            {!filteredFlatMarks.length && (
              <tr><td colSpan={allSubjects.length + 8} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>No marks found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const Top30Section = () => (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <TrendingUp size={15} aria-hidden="true" />Top 30 — {selectedTestKey}
      </div>
      <div className="table-wrap">
      <table className="table table-compact">
        <thead>
          <tr>
            <th>#</th><th>Student</th><th>Centre</th><th>Sponsor</th><th>Cat.</th>
            {allSubjects.map((s) => {
              const abbr = s === 'Physics' ? 'P' : s === 'Chemistry' ? 'C' : (s === 'Math' || s === 'Mathematics') ? 'M' : s === 'Biology' ? 'B' : s.substring(0, 3);
              return <th key={s} title={s}>{abbr}</th>;
            })}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {topRanked.map((m) => {
            const profile   = profileByRoll.get(m.roll);
            const flatM = flatMarks.find(f => f.roll === m.roll && f.test === selectedTestKey) || { subjects: {} };
            const photoUrl = profile?.['STUDENT PHOTO URL'] ? resolveStudentPhotoUrl(profile['STUDENT PHOTO URL'], 'fallback') : null;
            const rankColor = m.rank === 1 ? '#d97706' : m.rank === 2 ? '#6b7280' : m.rank === 3 ? '#c2410c' : 'inherit';
            return (
              <tr key={m.roll} style={{ cursor: 'pointer' }} onClick={() => setViewingStudentId(m.roll)}>
                <td><span style={{ fontWeight: 800, color: rankColor }}>{m.rank}</span></td>
                <td>
                  <div className="student-row">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Avatar" className="avatar" style={{width: 32, height: 32, fontSize: 12, objectFit: 'cover'}} />
                    ) : (
                      <div className="avatar" style={{width: 32, height: 32, fontSize: 12}}>{getInitials(m.name)}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{m.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{m.roll}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className="badge" style={{ background: '#e8f0fc', color: '#1a4fa0', fontSize: 10 }}>{displayCenter(m.center)}</span>
                </td>
                <td>
                  <span className="badge" style={{ background: '#fce8e8', color: '#a01a1a', fontSize: 10 }}>{profile?.SPONSOR || displaySponsor(m.center)}</span>
                </td>
                <td>
                  <span style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: '#f5f5f5', color: '#666', fontWeight: 600 }}>{profile?.CATEGORY || '—'}</span>
                </td>
                {allSubjects.map((sub) => (
                  <td key={sub} style={{ color: flatM.subjects[sub] === undefined ? 'var(--gray-200)' : 'inherit' }}>
                    {flatM.subjects[sub] ?? '—'}
                  </td>
                ))}
                <td><strong style={{ fontSize: 13, color: '#1a4fa0' }}>{m.marks}</strong></td>
              </tr>
            );
          })}
          {!topRanked.length && (
            <tr><td colSpan={allSubjects.length + 5} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>No data for {selectedTestKey}.</td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );

  const Bottom30Section = () => (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <TrendingDown size={15} aria-hidden="true" />Bottom 30 — {selectedTestKey}
      </div>
      <div className="table-wrap">
      <table className="table table-compact">
        <thead>
          <tr>
            <th>Rank</th><th>Student</th><th>Centre</th><th>Sponsor</th><th>Cat.</th>
            {allSubjects.map((s) => {
              const abbr = s === 'Physics' ? 'P' : s === 'Chemistry' ? 'C' : (s === 'Math' || s === 'Mathematics') ? 'M' : s === 'Biology' ? 'B' : s.substring(0, 3);
              return <th key={s} title={s}>{abbr}</th>;
            })}
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {bottomRanked.map((m) => {
            const profile = profileByRoll.get(m.roll);
            const flatM = flatMarks.find(f => f.roll === m.roll && f.test === selectedTestKey) || { subjects: {} };
            const photoUrl = profile?.['STUDENT PHOTO URL'] ? resolveStudentPhotoUrl(profile['STUDENT PHOTO URL'], 'fallback') : null;
            return (
            <tr key={m.roll} style={{ cursor: 'pointer' }} onClick={() => setViewingStudentId(m.roll)}>
              <td style={{ color: 'var(--red)', fontWeight: 700 }}>#{m.rank}</td>
              <td>
                <div className="student-row">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" className="avatar" style={{width: 32, height: 32, fontSize: 12, objectFit: 'cover'}} />
                  ) : (
                    <div className="avatar" style={{ background: '#fdecea', color: 'var(--red)', width: 32, height: 32, fontSize: 12 }}>{getInitials(m.name)}</div>
                  )}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 12 }}>{m.name}</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{m.roll}</div>
                  </div>
                </div>
              </td>
              <td>
                <span className="badge" style={{ background: '#e8f0fc', color: '#1a4fa0', fontSize: 10 }}>{displayCenter(m.center)}</span>
              </td>
              <td>
                <span className="badge" style={{ background: '#fce8e8', color: '#a01a1a', fontSize: 10 }}>{profile?.SPONSOR || displaySponsor(m.center)}</span>
              </td>
              <td>
                <span style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: '#f5f5f5', color: '#666', fontWeight: 600 }}>{profile?.CATEGORY || '—'}</span>
              </td>
              {allSubjects.map((sub) => (
                <td key={sub} style={{ color: flatM.subjects[sub] === undefined ? 'var(--gray-200)' : 'inherit' }}>
                  {flatM.subjects[sub] ?? '—'}
                </td>
              ))}
              <td><strong style={{ fontSize: 13, color: 'var(--red)' }}>{m.marks}</strong></td>
            </tr>
          )})}
          {!bottomRanked.length && (
            <tr><td colSpan={allSubjects.length + 5} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>No data for {selectedTestKey}.</td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );

  const ImportExportSection = () => (
    <div className="grid-2">
      <div className="card" style={{ border: '2px solid #6d28d9' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ padding: 10, borderRadius: 10, background: '#ede9fe', flexShrink: 0 }}>
            <Users size={22} color="#6d28d9" aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Import Student Profiles</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>Bulk-add or update student profiles from Excel. Supports JEE and NEET streams.</div>
          </div>
        </div>
        <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Required columns:</div>
          <div style={{ color: 'var(--gray-600)', fontFamily: 'monospace', fontSize: 11, lineHeight: 1.8 }}>
            {STUDENT_TEMPLATE_COLUMNS.slice(0, 8).join(' · ')}<br />
            {STUDENT_TEMPLATE_COLUMNS.slice(8).join(' · ')}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={downloadStudentTemplate}><Download size={13} /> Download Template</button>
          <button type="button" className="btn btn-purple" onClick={() => openImportModal('students')}><Upload size={13} /> Upload Excel</button>
          <button type="button" className="btn btn-success btn-sm" onClick={exportStudentsXlsx}><Download size={13} /> Export</button>
        </div>
      </div>

      <div className="card" style={{ border: '2px solid #0f766e' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
          <div style={{ padding: 10, borderRadius: 10, background: '#ccfbf1', flexShrink: 0 }}>
            <BarChart2 size={22} color="#0f766e" aria-hidden="true" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Import Test Marks</div>
            <div style={{ fontSize: 13, color: 'var(--gray-600)', marginTop: 4 }}>Upload test-wise marks — select test column, upload, preview and confirm.</div>
          </div>
        </div>
        <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px 14px', marginBottom: 14, fontSize: 13 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Marks import:</div>
          <div style={{ color: 'var(--gray-600)', fontFamily: 'monospace', fontSize: 11 }}>Roll Number · marks/score</div>
          <div style={{ marginTop: 4, fontSize: 12, color: 'var(--gray-400)' }}>One column at a time (selected test).</div>
          <div style={{ marginTop: 8, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {allTestOptions.slice(0, 8).map((t) => (
              <button key={t} type="button" className="btn btn-ghost btn-sm" onClick={() => { setSelectedTestKey(t); setUploadTestKey(t); }}>{t}</button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-teal" onClick={() => openImportModal('marks')}><Upload size={13} /> Upload Marks</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={downloadMarksSampleFormat}><Download size={13} /> Download sample format</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={exportMarksXlsx}><Download size={13} /> Export selected test</button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={exportCombinedWorkbook}><Package size={13} /> Full workbook</button>
          <button type="button" className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red-bg)' }} onClick={handleFormatTestData}><Trash2 size={13} /> Format selected test</button>
        </div>
      </div>

      <div className="card" style={{ gridColumn: '1 / -1', background: 'var(--yellow-bg)', border: '1px solid #fde68a' }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <Lightbulb size={22} color="#92400e" aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
          <div style={{ fontSize: 13, color: '#92400e' }}>
            <strong>Tips for a smooth import:</strong>
            <ul style={{ marginTop: 6, paddingLeft: 18, lineHeight: 1.9 }}>
              <li>Keep the first row as column headers.</li>
              <li>Roll numbers must match exactly for record updates.</li>
              <li>Add a <code>stream</code> column with "JEE" or "NEET" for mixed batches.</li>
              <li>For marks: use one Excel file per test column.</li>
              <li>A preview will appear before any data is written.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <div className="fade-in dashboard-page">
      {/* Modals */}
      {showMarksAwardModal && (
        <UploadMarksAwardSheetModal onClose={() => setShowMarksAwardModal(false)} />
      )}
      {(modalMode === 'add' || modalMode === 'edit') && (
        <StudentFormModal mode={modalMode} student={modalStudent} loading={modalLoading} onClose={() => setModalMode(null)} onSubmit={modalMode === 'add' ? handleAddStudent : handleEditStudent} />
      )}
      {modalMode === 'tests' && (
        <TestDataModal
          student={modalStudent}
          testColumns={data.testColumns}
          existingScores={data.tests.find((t) => t.ROLL_KEY === modalStudent?.ROLL_KEY) || {}}
          loading={modalLoading}
          onClose={() => setModalMode(null)}
          onSubmit={handleSaveTestScores}
        />
      )}

      {importMode && (
        <div className="modal-overlay" onClick={closeImportModal}>
          <div className="modal" style={{ maxWidth: 760 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Upload size={16} aria-hidden="true" />
                {importMode === 'students' ? 'Import Student Profiles' : 'Import Test Marks'}
              </div>
              <button type="button" className="modal-close" onClick={closeImportModal} aria-label="Close">×</button>
            </div>
            <div className="modal-body">
              {importMode === 'marks' && (
                <div className="form-group">
                  <label className="label" htmlFor="importTestKey">Test Column</label>
                  <input 
                    id="importTestKey" 
                    type="text"
                    list="testOptions"
                    className="input" 
                    value={uploadTestKey} 
                    onChange={(e) => setUploadTestKey(e.target.value)}
                    placeholder="Enter new or select existing test (e.g. CAT-1(TEST))"
                  />
                  <datalist id="testOptions">
                    {allTestOptions.map((col) => <option key={col} value={col} />)}
                  </datalist>
                </div>
              )}
              <div className="upload-zone" role="button" tabIndex={0} onClick={() => fileRef.current?.click()} onKeyDown={(e) => e.key === 'Enter' && fileRef.current?.click()}>
                <Upload size={32} style={{ margin: '0 auto 10px', color: 'var(--gray-400)' }} aria-hidden="true" />
                <div style={{ fontWeight: 700, marginBottom: 6 }}>Click to upload Excel / CSV</div>
                <div style={{ fontSize: 13, color: 'var(--gray-400)' }}>
                  {importMode === 'students' ? 'Use the template headers for best column mapping.' : 'File must contain Roll Number. You can upload multiple subject columns at once.'}
                </div>
                <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" style={{ display: 'none' }} onChange={(e) => handleImportFile(e.target.files?.[0])} />
              </div>
              <div style={{ marginTop: 10 }}>
                {importMode === 'students' ? (
                  <button type="button" className="btn btn-outline btn-sm" onClick={downloadStudentTemplate}><Download size={13} /> Download Student Template</button>
                ) : (
                  <button type="button" className="btn btn-outline btn-sm" onClick={downloadMarksSampleFormat}><Download size={13} /> Download Marks Template</button>
                )}
              </div>
              {uploadLoading && <div style={{ marginTop: 12, color: 'var(--csrl-blue)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}><Loader2 size={14} className="spin" /> Processing file…</div>}
              {uploadError  && <div style={{ marginTop: 12, background: 'var(--red-bg)', color: 'var(--red)', borderRadius: 6, padding: '10px 12px', fontSize: 13 }}>{uploadError}</div>}
              {!!uploadPreview.length && (
                <div style={{ marginTop: 14 }}>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 10 }}>
                    <span className="pill-new">New: {uploadPreview.filter((r) => r.status === 'new').length}</span>
                    <span className="pill-update">Update: {uploadPreview.filter((r) => r.status === 'update').length}</span>
                    <span className="pill-err">Errors: {uploadPreview.filter((r) => r.status === 'err').length}</span>
                  </div>
                  <div className="preview-wrap">
                    <table className="preview-table">
                      <thead><tr><th>Row</th><th>Roll</th><th>{importMode === 'students' ? 'Name' : 'Marks'}</th><th>Status</th></tr></thead>
                      <tbody>
                        {uploadPreview.map((row, idx) => (
                          <tr key={idx}>
                            <td>{row.row}</td>
                            <td>{row.roll || '—'}</td>
                            <td>{importMode === 'students' ? (row.name || '—') : (row.marks ?? '—')}</td>
                            <td><span className={row.status === 'new' ? 'pill-new' : row.status === 'update' ? 'pill-update' : 'pill-err'}>{row.reason}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-ghost" onClick={closeImportModal}>Cancel</button>
              <button type="button" className="btn btn-primary" disabled={uploadLoading || !uploadPreview.length} onClick={confirmImport} style={{ gap: 6 }}>
                <CheckCircle2 size={14} /> Confirm Import
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="page-header">
        <div style={{ padding: 10, borderRadius: 10, background: 'rgba(255,255,255,.15)', flexShrink: 0 }}>
          <ShieldCheck size={24} color="#fff" aria-hidden="true" />
        </div>
        <div>
          <h1>CSRL Admin Dashboard</h1>
          <p>Super Admin · Full Control Panel</p>
        </div>
        <div className="page-header-toolbar" style={{ marginLeft: 'auto' }}>
          <button type="button" className="btn btn-success btn-sm" onClick={() => { setModalStudent(null); setModalMode('add'); }}>
            <Plus size={13} /> Student
          </button>
          <button type="button" className="btn btn-warning btn-sm" onClick={() => openImportModal('marks')}><Upload size={13} /> Marks</button>
          <button type="button" className="btn btn-purple btn-sm" onClick={() => openImportModal('students')}><Users size={13} /> Upload Students</button>
          <button type="button" className="btn btn-purple btn-sm" style={{ background: '#6d28d9' }} onClick={() => setShowMarksAwardModal(true)}><Upload size={13} /> Upload Weak Topics Sheet</button>
          <button type="button" className="btn btn-outline btn-sm" onClick={handleAddNewTestOption}>+ New Test</button>
          <select
            className="input select"
            value={selectedTestKey}
            onChange={(e) => setSelectedTestKey(e.target.value)}
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.3)', width: 148, fontSize: 13 }}
          >
            {allTestOptions.map((t) => <option key={t} value={t} style={{ color: '#333' }}>{t}</option>)}
          </select>
        </div>
      </div>

      {/* Tabs + scrollable body (lists scroll here, not the whole window) */}
      <div className="content dashboard-page-body">
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          <div className="tab-bar">
            {TABS.map((tab) => {
              const TabIcon = tab.Icon;
              return (
                <button key={tab.key} type="button" className={`tab${activePage === tab.key ? ' active' : ''}`} onClick={() => setActivePage(tab.key)}>
                  <TabIcon size={13} aria-hidden="true" />{tab.label}
                </button>
              );
            })}
          </div>
        </div>
        <div className="dashboard-scroll">
          {activePage === 'leaderboard' && <LeaderboardSection />}
          {activePage === 'overview'    && <OverviewSection />}
          {activePage === 'students'    && <StudentsSection />}
          {activePage === 'marks'       && <MarksSection />}
          {activePage === 'import'      && <ImportExportSection />}
          {activePage === 'ranking'     && <RankingsSection />}
          {activePage === 'pastyear'    && <PastYearDataTab isAdmin={true} />}
          {activePage === 'insights' && (
            <TestInsightsPanel
              insights={testInsights}
              loading={testInsightsLoading}
              error={testInsightsError}
              testKey={selectedTestKey}
              hideSubjectAverages
            />
          )}
        </div>
      </div>
    </div>
  );
}
