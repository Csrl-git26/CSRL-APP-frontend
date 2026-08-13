import { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LayoutDashboard, Trophy, Users, AlertTriangle, BarChart2, BarChart3, TrendingUp, Building2, ArrowLeft, Loader2, Search, Eye, Brain, Package } from 'lucide-react';
import {
  fetchCenterDataApi,
  fetchOverview,
  fetchRankings,
  fetchSubjectAverages,
  fetchCentreLeaderboard,
  fetchTestInsights,
  parseTestColumn,
  resolveStudentPhotoUrl,
  fetchCentersApi,
  fetchCentreChart,
  getStreamConfig,
} from '../services/dataService';
import { useAuth } from '../context/AuthContext';
import StudentProfileView from './StudentProfileView';
import CentreLeaderboard from './CentreLeaderboard';
import { CENTERS } from '../config/centers';
import TestInsightsPanel from './TestInsightsPanel';
import CenterWeakTopics from './CenterWeakTopics';
import CenterOverallWeakTopics from './CenterOverallWeakTopics';
import { getCenterWeakTopics } from '../services/weakTopicApi';
import PastYearDataTab from './PastYearDataTab';
import PerformanceChart from './PerformanceChart';
import TestRecordsTable from './TestRecordsTable';

const TABS = [
  { key: 'leaderboard', Icon: Trophy,         label: 'Centre Leaderboard' },
  { key: 'overview',   Icon: LayoutDashboard, label: 'Overview'  },
  { key: 'topbottom',  Icon: Trophy,          label: 'Rankings'  },
  { key: 'students',   Icon: Users,           label: 'Students'  },
  { key: 'pastyear',   Icon: Package,         label: 'Past Year Data' },
];

function getInitials(name = '') {
  return name.trim().split(/\s+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function CentreDashboard({ adminViewCenterCode }) {
  const outletContext = useOutletContext();
  const [localActivePage, setLocalActivePage] = useState('overview');
  
  const activePage = adminViewCenterCode ? localActivePage : outletContext?.activePage;
  const setActivePage = adminViewCenterCode ? setLocalActivePage : outletContext?.setActivePage;

  const { user: auth } = useAuth();
  const [centersList, setCentersList] = useState([]);

  const [selectedCenterCode, setSelectedCenterCode] = useState(() => adminViewCenterCode || auth.centerCode || 'GAIL');

  useEffect(() => {
    if (adminViewCenterCode) {
      setSelectedCenterCode(adminViewCenterCode);
    }
  }, [adminViewCenterCode]);

  const [data,             setData]             = useState(null);
  const [overview,         setOverview]         = useState(null);
  const [topRanked,        setTopRanked]        = useState([]);
  const [bottomRanked,     setBottomRanked]     = useState([]);
  const [allRanked,        setAllRanked]        = useState([]);
  const [subjectAvgs,      setSubjectAvgs]      = useState([]);
  const [loading,          setLoading]          = useState(true);
  const [error,            setError]            = useState('');
  const [viewingStudentId, setViewingStudentId] = useState(null);
  const [selectedTestKey,  setSelectedTestKey]  = useState('');
  const [searchTerm,       setSearchTerm]       = useState('');
  const [filterCategory,   setFilterCategory]   = useState('ALL');
  const [filterStream,     setFilterStream]     = useState('ALL');
  const [filterSponsor,    setFilterSponsor]    = useState('ALL');
  const [filterGender,     setFilterGender]     = useState('ALL');
  const [filterState,      setFilterState]      = useState('ALL');
  const [testInsights, setTestInsights]         = useState(null);
  const [testInsightsLoading, setTestInsightsLoading] = useState(false);
  const [testInsightsError, setTestInsightsError]   = useState('');
  const [centreBoard, setCentreBoard] = useState([]);
  const [accuracyWeakSubject, setAccuracyWeakSubject] = useState(null);
  const [centreChartData, setCentreChartData] = useState([]);

  useEffect(() => {
    let active = true;
    fetchCentersApi()
      .then((list) => {
        if (active && Array.isArray(list) && list.length > 0) {
          setCentersList(list);
          const codes = list.map(c => c.code);
          const initialCode = adminViewCenterCode || auth.centerCode || list[0].code;
          if (codes.includes(initialCode)) {
            setSelectedCenterCode(initialCode);
          } else {
            setSelectedCenterCode(list[0].code);
          }
        }
      })
      .catch((err) => console.error('Failed to fetch centers:', err));
    return () => { active = false; };
  }, [auth.centerCode]);

  const activeCenter = centersList.find((c) => c.code === selectedCenterCode);
  const centreTitle = activeCenter?.name || (auth.name || selectedCenterCode);

  // ── Initial load ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const [d, ov] = await Promise.all([
          fetchCenterDataApi(null, selectedCenterCode),
          fetchOverview(null, selectedCenterCode).catch(() => null),
        ]);
        setData(d);
        setOverview(ov);

        // Select first total-column from descending-sorted list as default test key
        const rankingCols = (d.testColumns || [])
          .filter((c) => !String(c).includes('_'))
          .sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true, sensitivity: 'base' }));
        const candidate   = rankingCols.length ? rankingCols[0] : d.testColumns?.[0];
        if (candidate) setSelectedTestKey(candidate);

        fetchCentreChart(selectedCenterCode)
          .then(res => setCentreChartData(res?.chartData || []))
          .catch(e => console.error("Failed to fetch centre chart:", e));
      } catch (err) {
        setError('Failed to load: ' + err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedCenterCode]);

  // Subject performance + weak subject for the selected test only
  useEffect(() => {
    if (!selectedCenterCode || !selectedTestKey) return undefined;
    let cancelled = false;
    
    fetchCentreLeaderboard(null, selectedTestKey)
      .then(board => setCentreBoard(Array.isArray(board) ? board : []))
      .catch(() => setCentreBoard([]));
    
    fetchSubjectAverages(null, selectedCenterCode, selectedTestKey)
      .then((avgs) => {
        if (!cancelled) setSubjectAvgs(Array.isArray(avgs) ? avgs : []);
      })
      .catch(() => {
        if (!cancelled) setSubjectAvgs([]);
      });
    return () => {
      cancelled = true;
    };
  }, [selectedCenterCode, selectedTestKey]);

  useEffect(() => {
    if (!selectedCenterCode || !selectedTestKey) return undefined;
    let cancelled = false;
    getCenterWeakTopics(selectedCenterCode, selectedTestKey)
      .then((res) => {
        if (!cancelled && res.success && res.data) {
          const doc = res.data;
          if (doc && doc.weakSubjects) {
            let highestPercent = -1;
            let weakestSub = null;
            let isMedium = false;
            
            Object.keys(doc.weakSubjects).forEach(sub => {
              const strong = doc.weakSubjects[sub]?.strongWeak;
              if (strong && strong.length > 0 && strong[0].percentage > highestPercent) {
                highestPercent = strong[0].percentage;
                weakestSub = sub;
                isMedium = false;
              }
            });
            
            if (!weakestSub) {
              Object.keys(doc.weakSubjects).forEach(sub => {
                const medium = doc.weakSubjects[sub]?.mediumWeak;
                if (medium && medium.length > 0 && medium[0].percentage > highestPercent) {
                  highestPercent = medium[0].percentage;
                  weakestSub = sub;
                  isMedium = true;
                }
              });
            }
            
            if (weakestSub) {
              setAccuracyWeakSubject({ subject: weakestSub, isMedium, percent: highestPercent });
            } else {
              setAccuracyWeakSubject(null);
            }
          } else {
              setAccuracyWeakSubject(null);
          }
        }
      })
      .catch(() => { if (!cancelled) setAccuracyWeakSubject(null); });
    return () => { cancelled = true; };
  }, [selectedCenterCode, selectedTestKey]);

  // ── Reload rankings when selectedTestKey changes ──────────────────────────────

  useEffect(() => {
    if (!selectedTestKey) return;
    Promise.all([
      fetchRankings(null, { testKey: selectedTestKey, centerCode: selectedCenterCode, limit: 30, order: 'desc' }).catch(() => ({ ranked: [] })),
      fetchRankings(null, { testKey: selectedTestKey, centerCode: selectedCenterCode, limit: 30, order: 'asc'  }).catch(() => ({ ranked: [] })),
      fetchRankings(null, { testKey: selectedTestKey, centerCode: selectedCenterCode, limit: Math.max(1000, data?.profiles?.length || 0), order: 'desc' }).catch(() => ({ ranked: [] })),
    ]).then(([top, bottom, all]) => {
      setTopRanked(top.ranked    || []);
      setBottomRanked(bottom.ranked || []);
      setAllRanked(all.ranked || []);
    });
  }, [selectedTestKey, selectedCenterCode, data?.profiles?.length]);

  useEffect(() => {
    if (activePage !== 'topbottom' || !selectedTestKey) return undefined;
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
  }, [activePage, selectedTestKey]);

  const rankingTestColumns = useMemo(
    () => (data?.testColumns || [])
      .filter((c) => !String(c).includes('_'))
      .sort((a, b) => String(b).localeCompare(String(a), undefined, { numeric: true, sensitivity: 'base' })),
    [data]
  );

  const rankingSubjectCols = useMemo(() => {
    if (!data?.testColumns) return [];
    return data.testColumns.filter((col) => {
      const meta = parseTestColumn(col);
      return meta.testName === selectedTestKey && !meta.isTotal;
    });
  }, [data, selectedTestKey]);

  const rankingSubjects = useMemo(() => rankingSubjectCols.map(c => parseTestColumn(c).subject), [rankingSubjectCols]);

  const profileByRoll = useMemo(() => {
    const map = new Map();
    (data?.profiles || []).forEach((p) => map.set(p.ROLL_KEY, p));
    return map;
  }, [data]);

  const filteredStudents = useMemo(() => {
    if (!data) return [];
    const q = searchTerm.toLowerCase();
    return data.profiles.filter((p) => {
      const matchSearch  = !q || (p["STUDENT'S NAME"] || '').toLowerCase().includes(q) || (p.ROLL_KEY || '').toLowerCase().includes(q);
      const matchCat     = filterCategory === 'ALL' || p.CATEGORY   === filterCategory;
      const matchStream  = filterStream   === 'ALL' || (p.stream || 'JEE') === filterStream;
      const matchSponsor = filterSponsor  === 'ALL' || (p.SPONSOR || (p.centerCode === 'KNP' || p.centerCode === 'GAIL' ? 'GAIL' : (p.centerCode === 'JDH' || p.centerCode === 'OIL_INDIA' ? 'OIL_INDIA' : '—'))) === filterSponsor;
      const matchGender  = filterGender   === 'ALL' || p.GENDER === filterGender;
      const matchState   = filterState    === 'ALL' || p.STATE === filterState;
      return matchSearch && matchCat && matchStream && matchSponsor && matchGender && matchState;
    }).sort((a, b) => a.ROLL_KEY.localeCompare(b.ROLL_KEY, undefined, { numeric: true }));
  }, [data, searchTerm, filterCategory, filterStream, filterSponsor, filterGender, filterState]);

  const categories  = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.CATEGORY).filter(Boolean))]], [data]);
  const sponsorsList = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.SPONSOR || (p.centerCode === 'KNP' || p.centerCode === 'GAIL' ? 'GAIL' : (p.centerCode === 'JDH' || p.centerCode === 'OIL_INDIA' ? 'OIL_INDIA' : '—'))).filter(Boolean))]], [data]);
  const gendersList = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.GENDER).filter(Boolean))]], [data]);
  const statesList  = useMemo(() => ['ALL', ...[...new Set((data?.profiles || []).map((p) => p.STATE).filter(Boolean))]], [data]);

  /** Lowest centre-wide subject average(s) from parsed test marks (same rule as overview KPI). */
  const { minSubjectAvg, weakSubjectFromPerformance } = useMemo(() => {
    if (!subjectAvgs.length) return { minSubjectAvg: null, weakSubjectFromPerformance: null };
    
    const streamCfg = getStreamConfig(activeCenter?.stream || 'JEE');
    
    // Average Marks
    const minAvg = Math.min(...subjectAvgs.map((s) => s.avg));
    const tiedAvg = subjectAvgs.filter((s) => s.avg === minAvg);
    const labelAvg = tiedAvg.length === 1
      ? `${tiedAvg[0].subject} (${minAvg}/${streamCfg.maxBySubject?.[tiedAvg[0].subject] || 100})`
      : `${tiedAvg.map((t) => t.subject).join(', ')} (${minAvg}/${streamCfg.maxBySubject?.[tiedAvg[0].subject] || 100})`;
      
    return { minSubjectAvg: minAvg, weakSubjectFromPerformance: labelAvg };
  }, [subjectAvgs, activeCenter?.stream]);

  // ── Render states ─────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="fade-in dashboard-page" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14, color: 'var(--gray-400)' }}>
          <Loader2 size={36} className="spin" />
          <p style={{ fontWeight: 600 }}>Loading {centreTitle}…</p>
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
          <button
            type="button"
            onClick={() => setViewingStudentId(null)}
            className="btn btn-sm"
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', border: 'none', marginRight: 8, gap: 5 }}
          >
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

  // ── Section components ────────────────────────────────────────────────────────

  const LeaderboardSection = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 18, fontWeight: 800, color: 'var(--gray-800)' }}>
            <Trophy size={18} aria-hidden="true" />Centre Rankings — {selectedTestKey}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-400)', marginTop: 2 }}>Sorted descending by average score</div>
        </div>
      </div>
      <CentreLeaderboard 
        centreStats={centreBoard} 
        selTest={selectedTestKey} 
        onCentreClick={(code) => {
          setSelectedCenterCode(code);
          setActivePage('overview');
        }}
      />
    </div>
  );

  const OverviewSection = () => {
    const totalStudents = overview?.totalStudents ?? data.profiles.length;
    const weakSubject   = weakSubjectFromPerformance ?? overview?.weakSubject ?? 'N/A';
    const validScores   = allRanked.filter(r => typeof r.marks === 'number');
    const avgScore      = validScores.length
      ? Math.round(validScores.reduce((s, r) => s + r.marks, 0) / validScores.length)
      : 0;
    const topScore = topRanked.length && typeof topRanked[0]?.marks === 'number' ? topRanked[0].marks : 0;

    const statCards = [
      { Icon: Users,         value: totalStudents, label: 'Students',     bg: '#e8f0fc', color: '#1a4fa0' },
      { Icon: AlertTriangle, value: weakSubject,   label: 'Weak Sub (Avg)', bg: '#fdecea', color: 'var(--red)' },
      { Icon: BarChart2,     value: avgScore,      label: 'Avg Score',    bg: '#e6f5ed', color: '#1a6e3b' },
      { Icon: TrendingUp,    value: topScore,      label: 'Top Score',    bg: '#fff3e0', color: '#b45309' },
    ];

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div className="grid-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {statCards.map(({ Icon, value, label, bg, color }) => (
            <div className="stat-card" key={label}>
              <div className="stat-icon" style={{ background: bg }}>
                <Icon size={20} color={color} aria-hidden="true" />
              </div>
              <div>
                <div className="stat-val" style={{ color }}>{value}</div>
                <div className="stat-lbl">{label}</div>
              </div>
            </div>
          ))}
        </div>

        {subjectAvgs.length > 0 && (
          <div className="card">
            <div className="section-title">Subject Performance — {selectedTestKey}</div>
            <div style={{ fontSize: 12, color: 'var(--gray-600)', marginTop: -8, marginBottom: 12 }}>
              Averages for this test only. Weakest subject first (lowest average).
            </div>
            {subjectAvgs.map((s) => {
              const isWeakest = minSubjectAvg != null && s.avg === minSubjectAvg;
              return (
                <div key={s.subject} style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 13 }}>
                    <span style={{ fontWeight: isWeakest ? 700 : 400, color: isWeakest ? 'var(--red)' : 'inherit' }}>
                      {s.subject}
                      {isWeakest && <AlertTriangle size={12} style={{ marginLeft: 5 }} color="var(--red)" aria-hidden="true" />}
                    </span>
                    <span style={{ fontWeight: 600 }}>{s.avg}/{getStreamConfig(activeCenter?.stream || 'JEE').maxBySubject?.[s.subject] || 100}</span>
                  </div>
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${Math.min(100, s.avg)}%`, background: isWeakest ? '#e74c3c' : '#1a4fa0' }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <CenterOverallWeakTopics centerId={selectedCenterCode} />

        <div style={{ marginTop: '24px' }}>
          <PerformanceChart chartData={centreChartData} streamCfg={getStreamConfig(activeCenter?.stream || 'JEE')} />
          <TestRecordsTable chartData={centreChartData} streamCfg={getStreamConfig(activeCenter?.stream || 'JEE')} stream={activeCenter?.stream || 'JEE'} isCentre={true} />
        </div>
        
        <div style={{ marginTop: '24px' }}>
          <CenterWeakTopics centerId={selectedCenterCode} activeTestKey={selectedTestKey} />
        </div>
      </div>
    );
  };

  const RankingsPair = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div className="grid-2">
        <div className="card">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <TrendingUp size={14} aria-hidden="true" />
          Top 30 — {selectedTestKey}
        </div>
        <div className="table-wrap">
        <table className="table table-compact">
          <thead>
            <tr>
              <th>#</th><th>Student</th><th>Cat.</th>
              {rankingSubjects.map((s) => {
                const abbr = s === 'Physics' ? 'P' : s === 'Chemistry' ? 'C' : (s === 'Math' || s === 'Mathematics') ? 'M' : s === 'Biology' ? 'B' : s.substring(0, 3);
                return <th key={s} title={s}>{abbr}</th>;
              })}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {topRanked.map((s) => {
              const testDoc = data?.tests?.find(t => t.ROLL_KEY === s.roll) || {};
              const rankColor = s.rank === 1 ? '#d97706' : s.rank === 2 ? '#6b7280' : s.rank === 3 ? '#c2410c' : 'inherit';
              const profile = profileByRoll.get(s.roll);
              const photoUrl = profile?.['STUDENT PHOTO URL'] ? resolveStudentPhotoUrl(profile['STUDENT PHOTO URL'], 'fallback') : null;
              return (
                <tr key={s.roll} style={{ cursor: 'pointer' }} onClick={() => setViewingStudentId(s.roll)}>
                  <td><span style={{ fontWeight: 800, color: rankColor }}>{s.rank}</span></td>
                  <td>
                    <div className="student-row">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Avatar" className="avatar" style={{width: 32, height: 32, fontSize: 12, objectFit: 'cover'}} />
                      ) : (
                        <div className="avatar" style={{width: 32, height: 32, fontSize: 12}}>{getInitials(s.name)}</div>
                      )}
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{s.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{s.roll}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: '#f5f5f5', color: '#666', fontWeight: 600 }}>{profile?.CATEGORY || '—'}</span>
                  </td>
                  {rankingSubjectCols.map((col, idx) => {
                    const raw = testDoc[col];
                    const val = (raw === undefined || raw === null || raw === '') ? '—' : raw;
                    return (
                      <td key={col} style={{ color: val === '—' ? 'var(--gray-200)' : 'inherit' }}>
                        {val}
                      </td>
                    );
                  })}
                  <td><strong style={{ color: '#1a4fa0' }}>{s.marks}</strong></td>
                </tr>
              );
            })}
            {!topRanked.length && (
              <tr><td colSpan={rankingSubjects.length + 3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 20 }}>No data for {selectedTestKey}</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>

        <div className="card">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <AlertTriangle size={14} color="var(--red)" aria-hidden="true" />
          Bottom 30 — {selectedTestKey}
        </div>
        <div className="table-wrap">
        <table className="table table-compact">
          <thead>
            <tr>
              <th>Rank</th><th>Student</th><th>Cat.</th>
              {rankingSubjects.map((s) => {
                const abbr = s === 'Physics' ? 'P' : s === 'Chemistry' ? 'C' : (s === 'Math' || s === 'Mathematics') ? 'M' : s === 'Biology' ? 'B' : s.substring(0, 3);
                return <th key={s} title={s}>{abbr}</th>;
              })}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {bottomRanked.map((s) => {
              const testDoc = data?.tests?.find(t => t.ROLL_KEY === s.roll) || {};
              const profile = profileByRoll.get(s.roll);
              const photoUrl = profile?.['STUDENT PHOTO URL'] ? resolveStudentPhotoUrl(profile['STUDENT PHOTO URL'], 'fallback') : null;
              return (
              <tr key={s.roll} style={{ cursor: 'pointer' }} onClick={() => setViewingStudentId(s.roll)}>
                <td style={{ color: 'var(--red)', fontWeight: 700 }}>#{s.rank}</td>
                <td>
                  <div className="student-row">
                    {photoUrl ? (
                      <img src={photoUrl} alt="Avatar" className="avatar" style={{width: 32, height: 32, fontSize: 12, objectFit: 'cover'}} />
                    ) : (
                      <div className="avatar" style={{ background: '#fdecea', color: 'var(--red)', width: 32, height: 32, fontSize: 12 }}>{getInitials(s.name)}</div>
                    )}
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 12 }}>{s.name}</div>
                      <div style={{ fontSize: 10, color: 'var(--gray-400)' }}>{s.roll}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: '#fdecea', color: 'var(--red)', fontWeight: 600 }}>{profile?.CATEGORY || '—'}</span>
                </td>
                {rankingSubjectCols.map((col, idx) => {
                  const raw = testDoc[col];
                  const val = (raw === undefined || raw === null || raw === '') ? '—' : raw;
                  return (
                    <td key={col} style={{ color: val === '—' ? 'var(--gray-200)' : 'inherit' }}>
                      {val}
                    </td>
                  );
                })}
                <td><strong style={{ color: 'var(--red)' }}>{s.marks}</strong></td>
              </tr>
            )})}
            {!bottomRanked.length && (
              <tr><td colSpan={rankingSubjects.length + 3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 20 }}>No data</td></tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
      </div>

      <div className="card">
        <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Trophy size={14} aria-hidden="true" />
          All students rankwise — {selectedTestKey}
        </div>
        <div className="table-wrap" style={{ maxHeight: 440, overflowY: 'auto' }}>
          <table className="table table-compact">
            <thead>
              <tr>
                <th>Rank</th><th>Student</th><th>Cat.</th><th>Stream</th>
                {rankingSubjects.map((s) => {
                  const abbr = s === 'Physics' ? 'P' : s === 'Chemistry' ? 'C' : (s === 'Math' || s === 'Mathematics') ? 'M' : s === 'Biology' ? 'B' : s.substring(0, 3);
                  return <th key={s} title={s}>{abbr}</th>;
                })}
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {allRanked.map((s) => {
                const profile = profileByRoll.get(s.roll);
                const photoUrl = profile?.['STUDENT PHOTO URL'] ? resolveStudentPhotoUrl(profile['STUDENT PHOTO URL'], 'fallback') : null;
                return (
                <tr key={`all-${s.roll}`} style={{ cursor: 'pointer' }} onClick={() => setViewingStudentId(s.roll)}>
                  <td><strong>#{s.rank}</strong></td>
                  <td>
                    <div className="student-row">
                      {photoUrl ? (
                        <img src={photoUrl} alt="Avatar" className="avatar" style={{width: 32, height: 32, fontSize: 12, objectFit: 'cover'}} />
                      ) : (
                        <div className="avatar" style={{width: 32, height: 32, fontSize: 12}}>{getInitials(s.name)}</div>
                      )}
                      <span style={{ fontWeight: 600, fontSize: 13 }}>{s.name}</span>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 10, padding: '2px 5px', borderRadius: 4, background: '#f5f5f5', color: '#666', fontWeight: 600 }}>{profile?.CATEGORY || '—'}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 3, background: s.stream === 'NEET' ? '#e6f5ed' : '#e8f0fc', color: s.stream === 'NEET' ? '#1a6e3b' : '#1a4fa0', fontWeight: 600 }}>
                      {s.stream || 'JEE'}
                    </span>
                  </td>
                  {rankingSubjectCols.map((col) => {
                    const raw = data?.tests?.find(t => t.ROLL_KEY === s.roll)?.[col];
                    const val = (raw === undefined || raw === null || raw === '') ? '—' : raw;
                    return (
                      <td key={col} style={{ color: val === '—' ? 'var(--gray-200)' : 'inherit' }}>
                        {val}
                      </td>
                    );
                  })}
                  <td><strong style={{ color: '#1a4fa0' }}>{s.marks}</strong></td>
                </tr>
              )})}
              {!allRanked.length && (
                <tr><td colSpan={4} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: 20 }}>No data for {selectedTestKey}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card" style={{ marginTop: 8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: 'var(--csrl-blue)' }}>Test Analysis Tab</h2>
        <TestInsightsPanel
          insights={testInsights}
          loading={testInsightsLoading}
          error={testInsightsError}
          testKey={selectedTestKey}
          hideSubjectAverages
        />
      </div>
    </div>
  );

  const StudentsSection = () => (
    <div className="card">
      <div className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <Users size={14} aria-hidden="true" />
        All Students ({filteredStudents.length})
      </div>
        <div className="search-row" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '14px' }}>
          <div style={{ position: 'relative', flex: '1 1 200px' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)', pointerEvents: 'none' }} />
            <input
              className="input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name or roll…"
              style={{ width: '100%', paddingLeft: 30 }}
            />
          </div>
          <select className="input select" value={filterSponsor} onChange={(e) => setFilterSponsor(e.target.value)} style={{ flex: '1 1 120px' }}>
            <option value="ALL">All Sponsors</option>
            {sponsorsList.filter((s) => s !== 'ALL' && s !== '—').map((s) => <option key={s} value={s}>{s}</option>)}
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
          <tr><th>Roll</th><th>Name</th><th>Stream</th><th>Category</th><th>Mobile</th><th>Actions</th></tr>
        </thead>
        <tbody>
          {filteredStudents.map((s) => {
            const photoUrl = s['STUDENT PHOTO URL'] ? resolveStudentPhotoUrl(s['STUDENT PHOTO URL'], 'fallback') : null;
            return (
            <tr key={s.ROLL_KEY} style={{ cursor: 'pointer' }} onClick={() => setViewingStudentId(s.ROLL_KEY)}>
              <td><strong style={{ color: '#1a4fa0' }}>{s.ROLL_KEY}</strong></td>
              <td>
                <div className="student-row">
                  {photoUrl ? (
                    <img src={photoUrl} alt="Avatar" className="avatar" style={{width: 32, height: 32, fontSize: 12, objectFit: 'cover'}} />
                  ) : (
                    <div className="avatar" style={{width: 32, height: 32, fontSize: 12}}>{getInitials(s["STUDENT'S NAME"])}</div>
                  )}
                  <strong>{s["STUDENT'S NAME"]}</strong>
                </div>
              </td>
              <td>
                <span style={{ fontSize: 11, padding: '2px 6px', borderRadius: 3, background: s.stream === 'NEET' ? '#e6f5ed' : '#e8f0fc', color: s.stream === 'NEET' ? '#1a6e3b' : '#1a4fa0', fontWeight: 600 }}>
                  {s.stream || 'JEE'}
                </span>
              </td>
              <td><span className={`badge badge-${(s.CATEGORY || 'general').toLowerCase()}`}>{s.CATEGORY || 'General'}</span></td>
              <td style={{ fontSize: 13, color: 'var(--gray-600)' }}>{s['Mobile No.'] || '—'}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  aria-label="View student profile"
                  onClick={() => setViewingStudentId(s.ROLL_KEY)}
                >
                  <Eye size={13} />
                </button>
              </td>
            </tr>
          )})}
          {!filteredStudents.length && (
            <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: 'var(--gray-400)' }}>No students found.</td></tr>
          )}
        </tbody>
      </table>
      </div>
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────────

  return (
    <div className={adminViewCenterCode ? "" : "fade-in dashboard-page"}>
      <div className="page-header" style={adminViewCenterCode ? { background: 'transparent', padding: '0 0 16px 0', border: 'none', color: 'var(--gray-800)' } : {}}>
        <div style={{ padding: 8, borderRadius: 10, background: adminViewCenterCode ? '#f1f5f9' : 'rgba(255,255,255,.9)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44 }}>
          {CENTERS[selectedCenterCode]?.logo ? (
            <img src={CENTERS[selectedCenterCode].logo} alt={centreTitle} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
          ) : (
            <Building2 size={24} color="var(--csrl-blue)" aria-hidden="true" />
          )}
        </div>
        <div>
          <h1 style={adminViewCenterCode ? { color: 'var(--gray-800)' } : {}}>{centreTitle}</h1>
          <p style={adminViewCenterCode ? { color: 'var(--gray-500)' } : {}}>{data.profiles.length} students</p>
        </div>
        <div className="page-header-toolbar" style={{ marginLeft: 'auto', display: 'flex', gap: 12 }}>
          <select
            className="input select"
            value={selectedCenterCode}
            onChange={(e) => setSelectedCenterCode(e.target.value)}
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.3)', width: 220 }}
          >
            {centersList.map((c) => {
              const label = c.name;
              return (
                <option key={c.code} value={c.code} style={{ color: '#000' }}>
                  {label}
                </option>
              );
            })}
          </select>
          <select
            className="input select"
            value={selectedTestKey}
            onChange={(e) => setSelectedTestKey(e.target.value)}
            style={{ background: 'rgba(255,255,255,.15)', color: '#fff', borderColor: 'rgba(255,255,255,.3)', width: 200 }}
          >
            {rankingTestColumns.map((t) => <option key={t} value={t} style={{ color: '#333' }}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className={adminViewCenterCode ? "" : "content dashboard-page-body"}>
        <div style={{ marginBottom: 14, flexShrink: 0 }}>
          <div className="tab-bar">
            {TABS.map(({ key, Icon, label }) => (
              <button
                key={key}
                type="button"
                className={`tab${activePage === key ? ' active' : ''}`}
                onClick={() => setActivePage(key)}
              >
                <Icon size={13} aria-hidden="true" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div className={adminViewCenterCode ? "" : "dashboard-scroll"}>
          {activePage === 'leaderboard' && <LeaderboardSection />}
          {activePage === 'overview'   && <OverviewSection />}
          {activePage === 'topbottom'  && <RankingsPair />}
          {activePage === 'students'   && <StudentsSection />}
          {activePage === 'pastyear'   && <PastYearDataTab isAdmin={false} />}
        </div>
      </div>
    </div>
  );
}
