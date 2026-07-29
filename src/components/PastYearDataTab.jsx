import { useState, useEffect, useMemo, useCallback } from 'react';
import { Upload, Download, Trash2, Search, Loader2, Filter, Calendar, Building2, MapPin } from 'lucide-react';
import * as XLSX from 'xlsx';
import {
  uploadPastYearData,
  fetchPastYearData,
  fetchPastYearFilters,
  deletePastYearData,
} from '../services/dataService';
import { useToast } from '../context/ToastContext';

// ── Past Year Data columns (from user's Excel format) ─────────────────────────
const PAST_YEAR_COLUMNS = [
  'YEAR',
  'Sponsor',
  'Centre Code',
  'Roll Number',
  'Student Name',
  'Gender',
  'Mobile No.',
  'DATE OF BIRTH',
  'Mode of Selection',
  "FATHER'S NAME",
  'PARMANENT ADDRESS',
  'STATE',
  'Category',
  '12TH STATE',
  'ANNUAL INCOME',
  'JEE MAINS (BEST OF TWO) Percentile Phy',
  'JEE MAINS (BEST OF TWO) Percentile Chem',
  'JEE MAINS (BEST OF TWO) Percentile Math',
  'JEE MAINS (BEST OF TWO) Percentile Total',
  'JEE MAINS (BEST OF TWO) QUALIFICATION',
  'JEE MAINS AIR',
  'JEE MAINS CAT. RANK',
  'JEE ADVANCED PHYSICS TOTAL',
  'JEE ADVANCED CHEMISTRY TOTAL',
  'JEE ADVANCED Mathematics TOTAL',
  'JEE ADVANCED TOTAL',
  'JEE ADVANCED Qualification',
  'JEE ADVANCED India Rank',
  'JEE ADVANCED Category Rank',
  'ADMISSION COLLEGE GROUP',
  'ADMISSION COLLEGE TYPE',
  'ADMISSION COLLEGE NAME',
  'ADMISSION BRANCH NAME',
  'ADMISSION REMARKS',
];

export default function PastYearDataTab({ isAdmin = false }) {
  const toast = useToast();
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    years: [], sponsors: [], centres: [], states: [], categories: [], genders: [],
  });
  const [activeFilters, setActiveFilters] = useState({
    year: '', sponsor: '', centre: '', state: '', category: '', gender: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);

  // Load filter options on mount
  const loadFilters = useCallback(async () => {
    try {
      const res = await fetchPastYearFilters();
      if (res?.success) {
        setFilters(res);
      }
    } catch (e) {
      console.error('Failed to load past year filters:', e);
    }
  }, []);

  useEffect(() => { loadFilters(); }, [loadFilters]);

  // Load data with current filters
  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const cleanFilters = {};
      Object.entries(activeFilters).forEach(([k, v]) => {
        if (v) cleanFilters[k] = v;
      });
      const res = await fetchPastYearData(cleanFilters);
      if (res?.success) {
        setData(res.data || []);
      }
    } catch (e) {
      console.error('Failed to load past year data:', e);
      toast.error('Failed to load past year data');
    } finally {
      setLoading(false);
    }
  }, [activeFilters, toast]);

  useEffect(() => { loadData(); }, [loadData]);

  // Search filter
  const displayed = useMemo(() => {
    if (!searchTerm) return data;
    const q = searchTerm.toLowerCase();
    return data.filter((row) => {
      return Object.values(row).some(v => String(v || '').toLowerCase().includes(q));
    });
  }, [data, searchTerm]);

  // Handle Excel upload
  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: 'array' });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const jsonRows = XLSX.utils.sheet_to_json(ws, { defval: '' });

      if (jsonRows.length === 0) {
        toast.error('No data rows found in the Excel file');
        return;
      }

      // Add Year column if present in the sheet name or first cell
      const rows = jsonRows.map((row) => {
        const clean = {};
        Object.entries(row).forEach(([key, val]) => {
          clean[key.trim()] = val === undefined || val === null ? '' : String(val).trim();
        });
        // Normalize Year field name variants
        if (!clean.Year && !clean.year && !clean.YEAR) {
          // Try to extract from sheet name if it looks like a year
          const sheetName = wb.SheetNames[0];
          if (/^\d{4}/.test(sheetName)) clean.Year = sheetName.match(/\d{4}/)[0];
        }
        if (clean.year) { clean.Year = clean.year; delete clean.year; }
        if (clean.YEAR) { clean.Year = clean.YEAR; delete clean.YEAR; }

        // Normalize Sponsor variants
        const sponsorVal = clean.Sponsor || clean.SPONSOR || clean.sponsor || clean.SPONSER || clean.Sponser || clean.sponser;
        if (sponsorVal) {
          clean.Sponsor = sponsorVal;
          delete clean.SPONSOR; delete clean.sponsor; delete clean.SPONSER; delete clean.Sponser; delete clean.sponser;
        }

        // Normalize Centre Code variants
        const centreVal = clean['Centre Code'] || clean['CENTRE CODE'] || clean['centre code'] || clean.Centre || clean.CENTRE || clean.centre;
        if (centreVal) {
          clean['Centre Code'] = centreVal;
          delete clean['CENTRE CODE']; delete clean['centre code']; delete clean.Centre; delete clean.CENTRE; delete clean.centre;
        }

        // Normalize other key variants if needed (Gender, Category, STATE)
        const genderVal = clean.Gender || clean.GENDER || clean.gender;
        if (genderVal) { clean.Gender = genderVal; delete clean.GENDER; delete clean.gender; }

        const catVal = clean.Category || clean.CATEGORY || clean.category;
        if (catVal) { clean.Category = catVal; delete clean.CATEGORY; delete clean.category; }

        const stateVal = clean.STATE || clean.State || clean.state;
        if (stateVal) { clean.STATE = stateVal; delete clean.State; delete clean.state; }

        return clean;
      });

      const CHUNK_SIZE = 500;
      let totalInserted = 0;

      for (let i = 0; i < rows.length; i += CHUNK_SIZE) {
        const chunk = rows.slice(i, i + CHUNK_SIZE);
        const res = await uploadPastYearData(chunk);
        
        if (res?.success) {
          totalInserted += res.inserted;
          const percent = Math.round(((i + chunk.length) / rows.length) * 100);
          setUploadProgress(Math.min(percent, 100));
        } else {
          throw new Error(res?.message || 'Chunk upload failed');
        }
      }

      toast.success(`Successfully uploaded ${totalInserted} past year records`);
      loadFilters();
      loadData();
    } catch (err) {
      console.error('Past year upload error:', err);
      toast.error(err.message || 'Failed to parse or upload the file');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = '';
    }
  };

  // Download filtered data as Excel
  const handleDownload = () => {
    if (displayed.length === 0) {
      toast.error('No data to download');
      return;
    }
    // Remove _id, __v, createdAt, updatedAt from download
    const clean = displayed.map((row) => {
      const out = {};
      Object.entries(row).forEach(([k, v]) => {
        if (['_id', '__v', 'createdAt', 'updatedAt'].includes(k)) return;
        out[k] = v;
      });
      return out;
    });
    const ws = XLSX.utils.json_to_sheet(clean);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Past Year Data');
    const yearLabel = activeFilters.year || 'All';
    const sponsorLabel = activeFilters.sponsor || 'All';
    XLSX.writeFile(wb, `Past_Year_Data_${yearLabel}_${sponsorLabel}.xlsx`);
    toast.success(`Downloaded ${clean.length} records`);
  };

  // Delete data
  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this past year data? This action cannot be undone.')) return;
    setDeleting(true);
    try {
      const deleteFilters = {};
      if (activeFilters.year) deleteFilters.year = activeFilters.year;
      if (activeFilters.sponsor) deleteFilters.sponsor = activeFilters.sponsor;
      const res = await deletePastYearData(deleteFilters);
      if (res?.success) {
        toast.success(`Deleted ${res.deleted} records`);
        loadFilters();
        loadData();
      }
    } catch (e) {
      toast.error('Failed to delete data');
    } finally {
      setDeleting(false);
    }
  };

  const updateFilter = (key, value) => {
    setActiveFilters((prev) => ({ ...prev, [key]: value }));
  };

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{ padding: '0 4px' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        flexWrap: 'wrap', gap: 12, marginBottom: 20,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Calendar size={20} style={{ color: 'var(--primary)' }} />
          <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700 }}>Past Year Data</h3>
          <span className="badge" style={{
            background: 'var(--primary)', color: '#fff', fontSize: 11, padding: '2px 10px',
          }}>{displayed.length} records</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {isAdmin && (
            <>
              <label className="btn btn-sm" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
                background: 'var(--primary)', color: '#fff', padding: '6px 14px',
                borderRadius: 8, fontSize: 13, fontWeight: 600,
              }}>
                {uploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                {uploading ? `Uploading ${uploadProgress}%` : 'Upload Past Data'}
                <input type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} hidden disabled={uploading} />
              </label>
              <button
                onClick={handleDelete}
                disabled={deleting || data.length === 0}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: '#fee2e2', color: '#991b1b', padding: '6px 14px',
                  borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
                }}
              >
                {deleting ? <Loader2 size={14} className="spin" /> : <Trash2 size={14} />}
                {deleting ? 'Deleting…' : 'Delete'}
              </button>
            </>
          )}
          <button
            onClick={handleDownload}
            disabled={displayed.length === 0}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: '#dcfce7', color: '#166534', padding: '6px 14px',
              borderRadius: 8, fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
            }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16,
        padding: '12px 16px', background: 'var(--surface)', borderRadius: 12,
        border: '1px solid var(--border)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--gray-500)', fontSize: 13, fontWeight: 600 }}>
          <Filter size={14} /> Filters:
        </div>

        <select className="input select" value={activeFilters.year} onChange={(e) => updateFilter('year', e.target.value)}
          style={{ flex: '1 1 100px', fontSize: 13 }}>
          <option value="">All Years</option>
          {filters.years.map((y) => <option key={y} value={y}>{y}</option>)}
        </select>

        <select className="input select" value={activeFilters.sponsor} onChange={(e) => updateFilter('sponsor', e.target.value)}
          style={{ flex: '1 1 120px', fontSize: 13 }}>
          <option value="">All Sponsors</option>
          {filters.sponsors.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="input select" value={activeFilters.centre} onChange={(e) => updateFilter('centre', e.target.value)}
          style={{ flex: '1 1 100px', fontSize: 13 }}>
          <option value="">All Centres</option>
          {filters.centres.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="input select" value={activeFilters.state} onChange={(e) => updateFilter('state', e.target.value)}
          style={{ flex: '1 1 100px', fontSize: 13 }}>
          <option value="">All States</option>
          {filters.states.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>

        <select className="input select" value={activeFilters.category} onChange={(e) => updateFilter('category', e.target.value)}
          style={{ flex: '1 1 100px', fontSize: 13 }}>
          <option value="">All Categories</option>
          {filters.categories.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select className="input select" value={activeFilters.gender} onChange={(e) => updateFilter('gender', e.target.value)}
          style={{ flex: '1 1 100px', fontSize: 13 }}>
          <option value="">All Genders</option>
          {filters.genders.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>

        <div style={{ position: 'relative', flex: '1 1 180px' }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
          <input
            className="input"
            placeholder="Search…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingLeft: 32, width: '100%', fontSize: 13 }}
          />
        </div>
      </div>

      {/* Data table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10, padding: 60, color: 'var(--gray-400)' }}>
          <Loader2 size={20} className="spin" /> Loading past year data…
        </div>
      ) : displayed.length === 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {isAdmin && (
            <div style={{
              background: 'var(--surface)', padding: 24, borderRadius: 12, border: '1px solid var(--primary)',
              boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '0 0 16px 0', color: 'var(--primary)', fontSize: 16 }}>
                <Upload size={18} /> Upload Past Year Data
              </h3>
              <p style={{ fontSize: 13, color: 'var(--gray-500)', marginBottom: 16 }}>
                Expected format for past year student records. Do NOT use the current year student template.
              </p>
              <div style={{
                background: 'var(--bg)', padding: 12, borderRadius: 8, fontSize: 11,
                color: 'var(--gray-500)', fontFamily: 'monospace', lineHeight: 1.6,
                maxHeight: 150, overflowY: 'auto', marginBottom: 20, whiteSpace: 'pre-wrap', border: '1px dashed var(--border)'
              }}>
                {PAST_YEAR_COLUMNS.join(' • ')}
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button
                  onClick={() => {
                    const ws = XLSX.utils.aoa_to_sheet([PAST_YEAR_COLUMNS]);
                    const wb = XLSX.utils.book_new();
                    XLSX.utils.book_append_sheet(wb, ws, 'PastYearFormat');
                    XLSX.writeFile(wb, 'Past_Year_Data_Template.xlsx');
                  }}
                  className="btn btn-outline"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, flex: 1, justifyContent: 'center' }}
                >
                  <Download size={14} /> Download Template
                </button>
                <label className="btn btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
                  {uploading ? <Loader2 size={14} className="spin" /> : <Upload size={14} />}
                  {uploading ? `Uploading ${uploadProgress}%` : 'Upload Excel'}
                  <input type="file" accept=".xlsx,.xls,.csv" onChange={handleUpload} hidden disabled={uploading} />
                </label>
              </div>
            </div>
          )}
          {!isAdmin && (
            <div style={{
              textAlign: 'center', padding: '50px 20px', color: 'var(--gray-400)',
              background: 'var(--surface)', borderRadius: 12, border: '1px solid var(--border)',
              gridColumn: '1 / -1'
            }}>
              <Calendar size={36} style={{ marginBottom: 10, opacity: 0.4 }} />
              <div style={{ fontWeight: 600, marginBottom: 4 }}>No past year data found</div>
              <div style={{ fontSize: 13 }}>No data available for the selected filters.</div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid var(--border)' }}>
          <table className="marks-table" style={{ fontSize: 12, minWidth: 1200 }}>
            <thead>
              <tr>
                <th style={{ position: 'sticky', left: 0, background: 'var(--surface)', zIndex: 2 }}>#</th>
                {PAST_YEAR_COLUMNS.map(col => <th key={col} style={{ whiteSpace: 'nowrap' }}>{col}</th>)}
              </tr>
            </thead>
            <tbody>
              {displayed.map((row, i) => (
                <tr key={row._id || i}>
                  <td style={{ position: 'sticky', left: 0, background: 'var(--bg)', zIndex: 1, fontWeight: 600, color: 'var(--gray-400)' }}>{i + 1}</td>
                  {PAST_YEAR_COLUMNS.map((col) => {
                    let val = row[col];
                    if (col === 'YEAR') val = row.YEAR || row.Year || row.year;
                    if (col === 'Sponsor') val = row.Sponsor || row.SPONSOR;
                    if (col === 'Centre Code') val = row['Centre Code'] || row['CENTRE CODE'];
                    
                    return (
                      <td key={col} style={{ maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {col === 'Sponsor' ? <span className="badge" style={{ background: '#fce8e8', color: '#a01a1a', fontSize: 11 }}>{val || '—'}</span> :
                         col === 'YEAR' ? <span className="badge" style={{ background: '#ede9fe', color: '#5b21b6', fontSize: 11 }}>{val || '—'}</span> :
                         col === 'Centre Code' ? <span className="badge" style={{ background: '#e0f2fe', color: '#0369a1', fontSize: 11 }}>{val || '—'}</span> :
                         (val || '—')}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
