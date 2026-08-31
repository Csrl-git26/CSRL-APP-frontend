import React, { useEffect, useRef, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LabelList, Label } from 'recharts';
import { BarChart2 } from 'lucide-react';
import { CENTERS } from '../config/centers';

const Empty = ({ message }) => (
  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--gray-400)' }}>
    <BarChart2 size={36} style={{ margin: '0 auto 10px', opacity: 0.4 }} />
    <div style={{ fontWeight: 600 }}>{message}</div>
  </div>
);

const CustomTooltip = ({ active, payload, selectedSubject }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const centerName = CENTERS[data.code]?.name || data.code;
    
    let isRedFlag = false;
    if (selectedSubject === 'Total' || !selectedSubject) {
      isRedFlag = data.avg < 100 || (data.qualRate ?? 0) < 80;
    } else if (selectedSubject === 'Qualification') {
      isRedFlag = (data.qualRate ?? 0) < 80;
    } else {
      isRedFlag = data.avg <= 20;
    }


    return (
      <div style={{ background: '#fff', border: isRedFlag ? '2px solid #fca5a5' : '1px solid #ccc', padding: '12px', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: 13, zIndex: 100 }}>
        {isRedFlag && (<div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}><span style={{ display: 'inline-block', width: 14, height: 14, borderRadius: '50%', background: '#cc0000', animation: 'csrlPulse 1.2s ease-out infinite', boxShadow: '0 0 0 0 rgba(220,0,0,1)', flexShrink: 0, border: '2px solid #ff0000' }} /><span style={{ color: '#ef4444', fontWeight: 800, letterSpacing: 0.5 }}>⚠ ACTION REQUIRED</span></div>)}
        <p style={{ margin: '0 0 8px 0', fontWeight: 800, fontSize: 15 }}>{data.rank} {centerName === data.code ? centerName : `${centerName} (${data.code})`}</p>
        <p style={{ margin: '2px 0', color: 'var(--csrl-blue)', fontWeight: 700 }}>Avg Score: {data.avg}</p>
        <p style={{ margin: '2px 0', color: 'var(--gray-700)', fontWeight: 600 }}>Highest Individual Score: {data.top}</p>
        {data.bottom !== undefined && <p style={{ margin: '2px 0', color: 'var(--gray-700)', fontWeight: 600 }}>Lowest Individual Score: {data.bottom}</p>}
        
        {(!selectedSubject || selectedSubject === 'Total' || selectedSubject === 'Qualification') && data.qualRate !== undefined && <p style={{ margin: '2px 0', color: data.qualRate < 80 ? '#ef4444' : 'var(--gray-700)', fontWeight: data.qualRate < 80 ? 700 : 600 }}>Qual. Rate: {Math.round(data.qualRate)}%</p>}
        {(!selectedSubject || selectedSubject === 'Total') && <p style={{ margin: '8px 0 0 0', color: '#ef4444', fontWeight: 700 }}>Weakest: {data.weakSubject}</p>}
        
        {(() => {
          if (!data.notQualBySub) return null;
          const entries = Object.entries(data.notQualBySub).filter(([subj]) => {
            if (!selectedSubject || selectedSubject === 'Total' || selectedSubject === 'Qualification') return true;
            return subj === selectedSubject;
          });
          if (entries.length === 0) return null;
          
          const title = (!selectedSubject || selectedSubject === 'Total' || selectedSubject === 'Qualification')
            ? "No. of student subjectwise marks <=20"
            : `No. of student marks in ${selectedSubject} <=20`;
            
          return (
            <div style={{ marginTop: 8, padding: '6px 8px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 4 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#ef4444', marginBottom: 4, letterSpacing: 0.5 }}>{title}</div>
              {entries.map(([subj, count]) => (
                <div key={subj} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#ef4444', marginBottom: 2 }}>
                  <span>{subj}</span>
                  <span style={{ fontWeight: 600 }}>{count}</span>
                </div>
              ))}
            </div>
          );
        })()}
        <div style={{ marginTop: 12, paddingTop: 8, borderTop: '1px solid #eee', fontSize: 11, color: '#3b82f6', fontWeight: 600, textAlign: 'center', cursor: 'pointer' }}>
          🖱️ Click column for full overview
        </div>
      </div>
    );
  }
  return null;
};

export default function CentreLeaderboard({ centreStats = [], selTest, selectedSubject, onCentreClick }) {
  const audioCtxRef = useRef(null);

  const getAudioCtx = useCallback(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
    return audioCtxRef.current;
  }, []);

  // Play a sharp two-tone alert beep using Web Audio API (no external file needed)
  const playAlertSound = useCallback(() => {
    try {
      const ctx = getAudioCtx();
      const playTone = (freq, startTime, duration, vol = 0.4) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = ctx.currentTime;
      playTone(880, now, 0.12, 0.5);        // High beep
      playTone(660, now + 0.15, 0.12, 0.4); // Lower beep
      playTone(880, now + 0.30, 0.18, 0.5); // High beep again
    } catch (e) {
      // Audio not supported or blocked
    }
  }, [getAudioCtx]);

  // Play once on mount when red flags are detected
  useEffect(() => {
    if (!centreStats || !centreStats.length || !selTest) return;
    const hasRedFlag = centreStats.some(data => {
      if (selectedSubject === 'Total' || !selectedSubject) {
        return data.avg < 100 || (data.qualRate ?? 0) < 80;
      } else if (selectedSubject === 'Qualification') {
        return (data.qualRate ?? 0) < 80;
      } else {
        return data.avg <= 20;
      }
    });
    if (hasRedFlag) {
      // Small delay so the page renders first
      const t = setTimeout(() => playAlertSound(), 600);
      return () => clearTimeout(t);
    }
  }, [selTest, selectedSubject, centreStats, playAlertSound]);

  if (!selTest) return <Empty message="Select a test to view rankings" />;
  if (!centreStats.length) return <Empty message={`No test data for ${selTest}`} />;

  // Sort by rank ascending to ensure the highest rank is first (leftmost)
  const isQualSort = selectedSubject === 'Qualification';
  const sortedStats = [...centreStats].sort((a, b) => {
    if (isQualSort) return (b.qualRate || 0) - (a.qualRate || 0);
    return a.rank - b.rank;
  });
  const currentDataKey = isQualSort ? "qualRate" : "avg";
  const currentYLabel = isQualSort ? "Qualification %" : "Average Score";

    const renderCustomBarLabel = (props) => {
    const { x, y, width, height, value, index } = props;
    const data = sortedStats[index];
    
    let isRedFlag = false;
    if (data) {
      if (selectedSubject === 'Total' || !selectedSubject) {
        isRedFlag = data.avg < 100 || (data.qualRate ?? 0) < 80;
      } else if (selectedSubject === 'Qualification') {
        isRedFlag = (data.qualRate ?? 0) < 80;
      } else {
        isRedFlag = data.avg <= 20;
      }
    }
    const centerX = x + width / 2;

    const showInside = height > 70;
    const topY = showInside ? y + 25 : y - 25;
    const textColor = showInside ? "#ffffff" : "#1e293b";
    const subTextColor = showInside ? "#93c5fd" : "#0284c7";

    return (
      <g style={{ pointerEvents: 'none' }}>
        {isRedFlag && (
          <g style={{ pointerEvents: 'all', cursor: 'pointer' }} onMouseEnter={playAlertSound}>
            {/* SVG defs for radial gradient */}
            <defs>
              <radialGradient id={`rdg-${index}`} cx="40%" cy="35%" r="65%">
                <stop offset="0%"   stopColor="#ff6666" />
                <stop offset="45%"  stopColor="#dd0000" />
                <stop offset="100%" stopColor="#660000" />
              </radialGradient>
              <filter id={`rglow-${index}`} x="-80%" y="-80%" width="260%" height="260%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
              </filter>
            </defs>

            {/* Ring 1 — fastest, first wave */}
            <circle
              cx={centerX} cy={topY - 14} r={9}
              fill="none" stroke="#ff0000" strokeWidth={3}
              style={{ animation: 'csrlRing1 1s ease-out infinite 0s' }}
            />
            {/* Ring 2 — medium, second wave */}
            <circle
              cx={centerX} cy={topY - 14} r={9}
              fill="none" stroke="#cc0000" strokeWidth={2.5}
              style={{ animation: 'csrlRing2 1s ease-out infinite 0.25s' }}
            />
            {/* Ring 3 — slowest, third wave */}
            <circle
              cx={centerX} cy={topY - 14} r={9}
              fill="none" stroke="#990000" strokeWidth={2}
              style={{ animation: 'csrlRing3 1s ease-out infinite 0.5s' }}
            />
            {/* Dense core dot with gradient and glow */}
            <circle
              cx={centerX} cy={topY - 14} r={9}
              fill={`url(#rdg-${index})`}
              stroke="#ffffff"
              strokeWidth={2}
              filter={`url(#rglow-${index})`}
              style={{ animation: 'csrlDotPump 1s ease-in-out infinite' }}
            />
          </g>
        )}
        <text x={centerX} y={topY + (isRedFlag ? 12 : 0)} fill={textColor} textAnchor="middle" fontSize={15} fontWeight={900}>
          {typeof value === 'number' ? Math.round(value) : value}{isQualSort ? '%' : ''}
        </text>

      </g>
    );
  };

  return (
    <div style={{ width: '100%', height: 320, marginTop: 0 }}>
      <style>{`
        @keyframes csrlPulse {
          0%   { box-shadow: 0 0 0 0 rgba(200,0,0,1), 0 0 8px 2px rgba(255,0,0,0.9); background: #990000; }
          35%  { box-shadow: 0 0 0 10px rgba(200,0,0,0.5), 0 0 16px 6px rgba(255,0,0,0.6); background: #ff0000; }
          70%  { box-shadow: 0 0 0 20px rgba(200,0,0,0.1), 0 0 24px 8px rgba(255,0,0,0.2); background: #cc0000; }
          100% { box-shadow: 0 0 0 0 rgba(200,0,0,0), 0 0 8px 2px rgba(255,0,0,0.9); background: #990000; }
        }
        @keyframes csrlRing1 {
          0%   { r: 9;  stroke-opacity: 1;   stroke-width: 3; }
          100% { r: 22; stroke-opacity: 0;   stroke-width: 0.5; }
        }
        @keyframes csrlRing2 {
          0%   { r: 9;  stroke-opacity: 0.8; stroke-width: 2.5; }
          100% { r: 20; stroke-opacity: 0;   stroke-width: 0.5; }
        }
        @keyframes csrlRing3 {
          0%   { r: 9;  stroke-opacity: 0.5; stroke-width: 2; }
          100% { r: 18; stroke-opacity: 0;   stroke-width: 0.5; }
        }
        @keyframes csrlDotPump {
          0%   { r: 8; }
          40%  { r: 10; }
          100% { r: 8; }
        }
      `}</style>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={sortedStats}
          margin={{ top: 50, right: 30, left: 0, bottom: 5 }}
        >
          
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis 
            dataKey="code" 
            angle={-45} 
            textAnchor="end" 
            tick={{ fontSize: 14, fill: '#1e293b', fontWeight: 'bold' }} 
            interval={0}
            height={50}
            axisLine={false}
            tickLine={false}
          >
            
          </XAxis>
          <YAxis 
            tick={{ fontSize: 14, fill: '#1e293b', fontWeight: 'bold' }} 
            axisLine={false}
            tickLine={false}
            width={70}
          >
            <Label value={currentYLabel} angle={-90} position="insideLeft" style={{ textAnchor: 'middle', fontSize: 16, fontWeight: 'bold', fill: '#64748b' }} />
          </YAxis>
          <Tooltip content={<CustomTooltip selectedSubject={selectedSubject} />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar isAnimationActive={false} 
            dataKey={currentDataKey}
            radius={[4, 4, 0, 0]} 
            style={{ cursor: 'pointer' }} 
            fill={isQualSort ? "#8b5cf6" : "#1a4fa0"}
            activeBar={{ fill: isQualSort ? "#a78bfa" : '#2563eb', stroke: isQualSort ? "#c4b5fd" : '#93c5fd', strokeWidth: 2 }}
            onClick={(data) => {
              if (data && data.code && typeof onCentreClick === 'function') {
                onCentreClick(data.code);
              }
            }}
          >
            <LabelList dataKey={currentDataKey} content={renderCustomBarLabel} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
