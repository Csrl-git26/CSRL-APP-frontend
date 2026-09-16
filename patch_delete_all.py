import re

file_path = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/AdminDashboard.jsx'

with open(file_path, 'r') as f:
    content = f.read()

func_code = """  const clearAllData = async () => {
    if (!window.confirm("WARNING: This will permanently delete ALL students, test scores, and analytics data! Are you absolutely sure?")) return;
    const doubleCheck = window.prompt("Type 'DELETE ALL' to confirm clearing all data.");
    if (doubleCheck !== "DELETE ALL") return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/students/clear-all`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast("All student data cleared successfully.", "success");
        fetchGlobalData();
      } else {
        showToast(data.message || 'Failed to clear data', "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Error clearing data", "error");
    }
  };

  // ── Export helpers ─────────────────────────────────────────────────────────"""

content = content.replace('  // ── Export helpers ─────────────────────────────────────────────────────────', func_code)

target_btn_html = """        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-outline btn-sm" onClick={downloadStudentTemplate}><Download size={13} /> Download Template</button>
          <button type="button" className="btn btn-purple" onClick={() => openImportModal('students')}><Upload size={13} /> Upload Excel</button>
          <button type="button" className="btn btn-success btn-sm" onClick={exportStudentsXlsx}><Download size={13} /> Export</button>
        </div>"""

replacement_html = """        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button type="button" className="btn btn-outline btn-sm" onClick={downloadStudentTemplate}><Download size={13} /> Download Template</button>
            <button type="button" className="btn btn-purple" onClick={() => openImportModal('students')}><Upload size={13} /> Upload Excel</button>
            <button type="button" className="btn btn-success btn-sm" onClick={exportStudentsXlsx}><Download size={13} /> Export</button>
          </div>
          <button type="button" className="btn btn-sm" onClick={clearAllData} style={{ background: '#ef4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', borderRadius: 6, fontWeight: 600 }}><Trash2 size={13} /> Delete All Data</button>
        </div>"""

content = content.replace(target_btn_html, replacement_html)

with open(file_path, 'w') as f:
    f.write(content)

print("Patched.")
