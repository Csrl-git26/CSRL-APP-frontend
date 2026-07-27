import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { getJeePercentile, getNeetScore, parseTestColumn, resolveStudentPhotoUrl } from '../services/dataService';
import { getStudentOverallWeakTopics } from '../services/weakTopicApi';
import StudentReportCard from './StudentReportCard';
import StudentOverallWeakTopics from './StudentOverallWeakTopics';
import { mapProfileToExcelRow } from './exportUtils';

function displayCenter(code) {
  if (!code) return '—';
  const upper = code.toUpperCase();
  if (upper === 'GAIL' || upper === 'KNP') return 'KNP';
  if (upper === 'OIL_INDIA' || upper === 'JDH') return 'JDH';
  return code;
}

function InfoRow({ label, value }) {
  return (
    <div className="info-row">
      <span className="info-label">{label}</span>
      <span className="info-val">{value || '—'}</span>
    </div>
  );
}

export default function StudentProfileView({ profile, studentTests, testColumns }) {
  const [overallWeakSubjects, setOverallWeakSubjects] = React.useState(null);
  const [overallWeakTopicsData, setOverallWeakTopicsData] = React.useState(null);
  const [isExportingPDF, setIsExportingPDF] = React.useState(false);

  const exportProfileToPDF = async () => {
    if (!profile) return;
    setIsExportingPDF(true);
    
    setTimeout(async () => {
      try {
        const element = document.getElementById('pdf-report-content');
        if (!element) return;
        
        const canvas = await html2canvas(element, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 1.0);
        
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
        
        pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${profile.ROLL_KEY || 'Student'}_Report.pdf`);
      } catch (err) {
        console.error("Failed to generate PDF", err);
      } finally {
        setIsExportingPDF(false);
      }
    }, 150); // slight delay to ensure DOM is fully rendered
  };

  const exportProfileToExcel = () => {
    if (!profile) return;
    const row = mapProfileToExcelRow(profile);
    const ws = XLSX.utils.json_to_sheet([row]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Student Profile');
    XLSX.writeFile(wb, `${profile.ROLL_KEY || 'Student'}_Profile.xlsx`);
  };

  React.useEffect(() => {
    if (!profile?.ROLL_KEY) return;
    let cancelled = false;
    getStudentOverallWeakTopics(profile.ROLL_KEY).then((res) => {
      if (!cancelled && res.success && res.data) {
        if (res.data.overallWeakSubjects) setOverallWeakSubjects(res.data.overallWeakSubjects);
        setOverallWeakTopicsData(res.data);
      }
    });
    return () => { cancelled = true; };
  }, [profile?.ROLL_KEY]);

  const stream = profile?.stream || 'JEE';
  const school10 = profile?.['10th SCHOOL NAME'] || profile?.['10th SCHOOL'] || profile?.['SCHOOL NAME'] || profile?.SCHOOL || '';
  const school12 = profile?.['12th SCHOOL NAME'] || profile?.['12th SCHOOL'] || school10 || '';

  const { mappedTestList, weakSubject, chartData, subjects } = useMemo(() => {
    const testsMap      = {};
    const subjectTotals = {};
    const subjectCounts = {};

    (testColumns || []).forEach((col) => {
      const { testName, subject, isTotal } = parseTestColumn(col);
      if (!testsMap[testName]) testsMap[testName] = { name: testName, marks: {}, total: null };

      const rawMark = (studentTests || {})[col];
      const usable  = rawMark !== undefined && rawMark !== null && rawMark !== '' && String(rawMark).toLowerCase() !== 'absent';
      if (usable) {
        const m = parseFloat(rawMark);
        if (!isNaN(m)) {
          if (isTotal) {
            testsMap[testName].total = m;
          } else {
            testsMap[testName].marks[subject] = m;
            subjectTotals[subject] = (subjectTotals[subject] || 0) + m;
            subjectCounts[subject] = (subjectCounts[subject] || 0) + 1;
          }
        }
      } else if (!isTotal) {
        testsMap[testName].marks[subject] = 'A';
      }
    });

    // Compute total where missing
    Object.values(testsMap).forEach((t) => {
      if (t.total !== null) return;
      
      const numMarks = Object.values(t.marks).filter((v) => typeof v === 'number');
      if (numMarks.length > 0) {
        t.total = numMarks.reduce((sum, v) => sum + v, 0);
      } else {
        t.total = 'Absent';
      }
    });

    const mappedTestList = Object.values(testsMap)
      .sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

    let weakSub = 'N/A', minAvg = Infinity;
    Object.keys(subjectTotals).forEach((sub) => {
      const avg = subjectTotals[sub] / subjectCounts[sub];
      if (avg < minAvg && subjectCounts[sub] > 0) { minAvg = avg; weakSub = sub; }
    });

    // Collect subjects dynamically
    const allSubs = new Set();
    mappedTestList.forEach((t) => Object.keys(t.marks).forEach((s) => allSubs.add(s)));

    const chartData = mappedTestList.map((t) => ({ name: t.name, ...t.marks, Total: t.total }));
    return { mappedTestList, weakSubject: weakSub, chartData, subjects: Array.from(allSubs) };
  }, [studentTests, testColumns]);

  if (!profile) return <div style={{ padding: '32px', textAlign: 'center', color: 'var(--gray-400)' }}>Loading profile...</div>;

  const photo         = profile['STUDENT PHOTO URL'];
  const photoPrimary  = resolveStudentPhotoUrl(photo, 'primary');
  const photoFallback = resolveStudentPhotoUrl(photo, 'fallback');
  const jeePercentile = getJeePercentile(profile);
  const neetScore     = getNeetScore(profile);
  const examLabel     = stream === 'NEET' ? 'NEET Score' : 'JEE Percentile';
  const examValue     = stream === 'NEET' ? neetScore   : jeePercentile;
  const examColor     = stream === 'NEET' ? '#1a6e3b'   : '#1a8a4a';
  const catKey        = (profile.CATEGORY || 'general').toLowerCase();

  const subjectColor = (sub) => {
    const map = { Physics: '#1a4fa0', Chemistry: '#e86b1f', Math: '#1a8a4a', Biology: '#7c3aed', Botany: '#059669', Zoology: '#0891b2', Total: '#374151' };
    return map[sub] || '#374151';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      {/* Banner */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        {photo
          ? <img
              src={photoPrimary}
              alt={profile["STUDENT'S NAME"]}
              referrerPolicy="no-referrer"
              onError={(e) => {
                if (e.currentTarget.dataset.fallbackApplied === '1') {
                  e.currentTarget.style.display = 'none';
                  return;
                }
                e.currentTarget.dataset.fallbackApplied = '1';
                e.currentTarget.src = photoFallback || photo;
              }}
              style={{ width: 96, height: 96, borderRadius: 12, objectFit: 'cover', border: '2px solid var(--gray-100)', flexShrink: 0 }} />
          : <div style={{ width: 96, height: 96, borderRadius: 12, background: 'var(--csrl-blue-light)', color: 'var(--csrl-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, fontWeight: 700, flexShrink: 0 }}>
              {(profile["STUDENT'S NAME"] || '?')[0]}
            </div>
        }
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--csrl-blue)' }}>{profile["STUDENT'S NAME"] || 'Unknown'}</h2>
            <span className={`badge badge-${catKey}`}>{profile.CATEGORY || 'General'}</span>
            <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 4, background: stream === 'NEET' ? '#e6f5ed' : '#e8f0fc', color: stream === 'NEET' ? '#1a6e3b' : '#1a4fa0', fontWeight: 700 }}>
              {stream}
            </span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px' }}>
              <button type="button" onClick={exportProfileToPDF} disabled={isExportingPDF} className="btn btn-outline btn-sm">
                {isExportingPDF ? <Loader2 size={13} className="spin" /> : <Download size={13} />} 
                {isExportingPDF ? 'Exporting...' : 'Export PDF'}
              </button>
              <button type="button" onClick={exportProfileToExcel} className="btn btn-outline btn-sm">
                <Download size={13} /> Export Excel
              </button>
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-600)', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <span>📋 <strong>{profile['ROLL NO.'] || profile.ROLL_KEY}</strong></span>
            <span>📍 {displayCenter(profile.centerCode) || '—'}</span>
            <span>📱 {profile['Mobile No.'] || '—'}</span>
          </div>
        </div>
        {examValue && (
          <div style={{ textAlign: 'center', background: stream === 'NEET' ? '#e6f5ed' : '#e8f5ee', borderRadius: 10, padding: '16px 24px', flexShrink: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: examColor, textTransform: 'uppercase', letterSpacing: 1 }}>{examLabel}</div>
            <div style={{ fontSize: 28, fontWeight: 900, color: examColor, marginTop: 4 }}>{examValue}</div>
          </div>
        )}
      </div>

      {/* Info Grid */}
      <div className="grid-2">
        <div className="card">
          <div className="section-title">👨‍👩‍👧 Personal & Selection Info</div>
          <InfoRow label="Year" value={profile.YEAR || '-'} />
          <InfoRow label="Registration No." value={profile['Registration no.'] || profile.ROLL_KEY || '-'} />
          <InfoRow label="Sponsor" value={profile.SPONSOR || '-'} />
          <InfoRow label="Project Name" value={profile['PROJECT NAME'] || '-'} />
          <InfoRow label="Peer Group" value={profile['PEER GROUP'] || '-'} />
          <InfoRow label="Mode of Selection" value={profile['Mode of Selection'] || '-'} />
          <InfoRow label="Written Test Marks (240)" value={profile['Written Test Marks (240)'] || '-'} />
          <InfoRow label="Interview Marks (90)" value={profile['Interview Marks (90)'] || '-'} />
          <InfoRow label="HO Score in Final Admission" value={profile['HO Score in Final Admission'] || '-'} />
          <InfoRow label="Gender" value={profile.GENDER || '-'} />
          <InfoRow label="Date of Birth" value={profile['DATE OF BIRTH'] || '-'} />
          <InfoRow label="Single Child" value={profile['SINGLE CHILD (YES/NO)'] || '-'} />
          <InfoRow label="Number of Siblings" value={profile['Number of Siblings'] || '-'} />
          <InfoRow label="Student Mobile" value={profile['Mobile No.'] || '-'} />
          <InfoRow label="Embibe Email" value={profile['Embibe Email Id'] || '-'} />
          <InfoRow label="Embibe Mobile" value={profile['Embibe Mobile No.'] || '-'} />
          <InfoRow label="Father's Name" value={profile["FATHER'S NAME"] || '-'} />
          <InfoRow label="Father's Nature of Work" value={profile['FATHER NATURE OF WORK'] || '-'} />
          <InfoRow label="Father's Annual Income" value={profile["FATHER'S INCOME (ANNUAL)"] || '-'} />
          <InfoRow label="Mother's Name" value={profile["MOTHER'S NAME"] || '-'} />
          <InfoRow label="Mother's Nature of Work" value={profile['MOTHER NATURE OF WORK'] || '-'} />
          <InfoRow label="Mother's Annual Income" value={profile["MOTHER'S INCOME (ANNUAL)"] || '-'} />
          <div style={{ marginTop: 10, fontSize: 12, color: 'var(--gray-400)', lineHeight: 1.5 }}>
            📍 {profile['PARMANENT ADDRESS'] || '-'}, {profile.DISTRICT || '-'}, {profile.STATE || '-'}{profile.PINCODE ? ` - ${profile.PINCODE}` : ''}
          </div>
        </div>

        <div className="card">
          <div className="section-title">🎓 Education History</div>
          <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px', marginBottom: 10 }}>
            <div style={{ fontWeight: 700, color: 'var(--csrl-blue)', fontSize: 13, marginBottom: 8 }}>10th Standard</div>
            <InfoRow label="School" value={profile['10th SCHOOL NAME'] || '-'} />
            <InfoRow label="Board" value={profile['10th BOARD'] || '-'} />
            <InfoRow label="District" value={profile['10th DISTRICT'] || profile['DISTRICT_10'] || '-'} />
            <InfoRow label="State" value={profile['10th STATE'] || profile['STATE_10'] || '-'} />
            <InfoRow label="Percentage" value={profile['10th Precentage'] || profile['10th Percentage'] || '-'} />
          </div>
          <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px', marginBottom: 10 }}>
            <div style={{ fontWeight: 700, color: 'var(--csrl-blue)', fontSize: 13, marginBottom: 8 }}>12th Standard</div>
            <InfoRow label="School" value={profile['12th SCHOOL NAME'] || '-'} />
            <InfoRow label="Board" value={profile['12th BOARD'] || '-'} />
            <InfoRow label="District" value={profile['12th DISTRICT'] || profile['DISTRICT_12'] || '-'} />
            <InfoRow label="State" value={profile['12th STATE'] || profile['STATE_12'] || '-'} />
            <InfoRow label="Percentage" value={profile['12th Precentage'] || profile['12th Percentage'] || '-'} />
          </div>
          {stream === 'JEE' && (
            <div style={{ background: '#e8f0fc', borderRadius: 8, padding: '12px' }}>
              <div style={{ fontWeight: 700, color: '#1a4fa0', fontSize: 13, marginBottom: 8 }}>Competitive Exams</div>
              <InfoRow label="JEE Mains 2024-25 Percentile" value={getJeePercentile(profile) || '-'} />
              <InfoRow label="JEE Mains Qualification Status" value={profile['JEE Mains Qualification Status'] || '-'} />
              <InfoRow label="JEE Advanced 2024-25 Marks" value={profile['JEE Advanced Marks'] || '-'} />
              <InfoRow label="JEE Advanced Qualification Status" value={profile['JEE Advanced Qualification Status'] || '-'} />
            </div>
          )}
        </div>
      </div>

      {/* Target & Analysis */}
      <div className="grid-2">
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="section-title">🎯 Target & Goals</div>
          <div>
            <div className="label">Target College / Branch</div>
            <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)', marginTop: 4 }}>
              {profile['FUTURE COLLEGE (TARGET)'] || 'Not specified'}
            </div>
          </div>
          <div className="divider" style={{ margin: '4px 0' }} />
          <div className="section-title" style={{ marginBottom: 6 }}>🧠 Weak Subject Analysis</div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px', border: '1px solid var(--gray-200)' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--gray-600)', textTransform: 'uppercase', marginBottom: 4 }}>By Avg Score</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'var(--gray-800)' }}>{weakSubject}</div>
            </div>

            <div style={{ background: '#fdf2f8', borderRadius: 8, padding: '12px', border: '1px solid #fbcfe8' }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#9d174d', textTransform: 'uppercase', marginBottom: 4 }}>By Accuracy (Weakest)</div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#831843' }}>
                {(() => {
                  if (!overallWeakSubjects) return 'Loading...';
                  const weakest = [];
                  Object.keys(overallWeakSubjects).forEach(sub => {
                    if (overallWeakSubjects[sub]?.strongWeak?.length > 0) weakest.push(sub);
                  });
                  if (weakest.length === 0) {
                    Object.keys(overallWeakSubjects).forEach(sub => {
                      if (overallWeakSubjects[sub]?.mediumWeak?.length > 0) weakest.push(`${sub} (Medium)`);
                    });
                  }
                  return weakest.length > 0 ? weakest.join(', ') : 'None Flagged';
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-title">📈 Performance Trend</div>
          <div style={{ height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, left: 65, bottom: 75, right: 40 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={true} stroke="#eef0f5" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9097b1', fontSize: 11 }} angle={-35} textAnchor="end" interval={0} />
                <YAxis domain={[0, 'dataMax']} axisLine={{ stroke: '#dde0ea' }} tickLine={false} tick={{ fill: '#5a6282', fontSize: 11 }} width={55} />
                <Tooltip contentStyle={{ borderRadius: 8, border: 'none', boxShadow: 'var(--shadow-lg)', fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {subjects.map((sub) => (
                  <Line key={sub} type="monotone" dataKey={sub} stroke={subjectColor(sub)} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls isAnimationActive={false} label={{ position: 'top', fill: subjectColor(sub), fontSize: 11, fontWeight: 600 }} />
                ))}
                <Line type="monotone" dataKey="Total" stroke="#1a4fa0" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} isAnimationActive={false} label={{ position: 'top', fill: '#1a4fa0', fontSize: 11, fontWeight: 700 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <StudentOverallWeakTopics studentId={profile.ROLL_KEY} />
      </div>

      {/* Full Test Records */}
      <div className="card">
        <div className="section-title">📋 Complete Test Records</div>
        <div className="table-wrap">
          <table className="table">
            <thead>
              <tr>
                <th style={{ width: '30%' }}>Test Name</th>
                <th>Subject Breakdown</th>
                <th style={{ textAlign: 'right', width: '12%' }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {mappedTestList.map((test, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600 }}>{test.name}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                      {Object.entries(test.marks).map(([sub, mark]) => (
                        <span key={sub} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '3px 8px', borderRadius: 4, fontSize: 12,
                          background: mark === 'A' ? 'var(--red-bg)' : 'var(--csrl-blue-light)',
                          border: `1px solid ${mark === 'A' ? '#fca5a5' : '#bbd0f8'}`,
                        }}>
                          <span style={{ color: 'var(--gray-600)', fontWeight: 500 }}>{sub}:</span>
                          <span style={{ fontWeight: 700, color: mark === 'A' ? 'var(--red)' : subjectColor(sub) }}>{mark}</span>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 800, color: 'var(--csrl-blue)', fontSize: 16 }}>{test.total ?? '—'}</td>
                </tr>
              ))}
              {mappedTestList.length === 0 && (
                <tr><td colSpan={3} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '32px' }}>No test records found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* HIDDEN PRINTABLE CONTAINER */}
      <div style={{ position: 'absolute', left: '-9999px', top: '-9999px', opacity: 0, pointerEvents: 'none' }}>
        <StudentReportCard
          profile={profile}
          stream={stream}
          chartData={chartData}
          subjects={subjects}
          overallWeakSubjects={overallWeakSubjects}
          overallWeakTopicsData={overallWeakTopicsData}
          weakSubject={weakSubject}
          subjectColor={subjectColor}
          examResult={examValue}
          examLabel={examLabel}
        />
      </div>

    </div>
  );
}
