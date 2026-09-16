import re

# BACKEND
backend_file = '/Users/surya/Desktop/CSRL-APP-backed/server.js'
with open(backend_file, 'r') as f:
    backend_content = f.read()

endpoint_code = """
/**
 * DELETE /api/admin/tests-all/clear
 * Format (delete) all marks and analytics data for ALL tests.
 */
app.delete('/api/admin/tests-all/clear', authenticateToken, requireAdmin, async (req, res) => {
  try {
    if (!isDbEnabled()) return res.status(500).json({ message: 'DB not enabled' });
    await initMongo();
    
    const TestScore = (await import('./models/TestScore.js')).default;
    const StudentWeakTopics = (await import('./models/StudentWeakTopics.js')).default;
    const CenterWeakTopics = (await import('./models/CenterWeakTopics.js')).default;
    const TopicMap = (await import('./models/TopicMap.js')).default;
    const StudentRawMarks = (await import('./models/StudentRawMarks.js')).default;
    
    await TestScore.deleteMany({});
    await StudentWeakTopics.deleteMany({});
    await CenterWeakTopics.deleteMany({});
    await TopicMap.deleteMany({});
    await StudentRawMarks.deleteMany({});
    
    invalidateDataCache();
    console.log(`[CRUD] Formatted ALL test data globally`);
    return res.json({ success: true, message: `Successfully cleared ALL test data globally.` });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: e.message || 'Error clearing test data' });
  }
});
"""

if '/api/admin/tests-all/clear' not in backend_content:
    # Insert before DELETE /api/admin/tests/:testKey
    backend_content = backend_content.replace('/**\n * DELETE /api/admin/tests/:testKey', endpoint_code + '\n/**\n * DELETE /api/admin/tests/:testKey')
    with open(backend_file, 'w') as f:
        f.write(backend_content)
    print("Backend patched.")

# FRONTEND
frontend_file = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/AdminDashboard.jsx'
with open(frontend_file, 'r') as f:
    frontend_content = f.read()

func_code = """
  const handleFormatAllTestData = async () => {
    if (!window.confirm(`WARNING: You are about to DELETE ALL TEST MARKS for EVERY test across all students! Are you absolutely sure?`)) return;
    const doubleCheck = window.prompt("Type 'DELETE ALL TESTS' to confirm.");
    if (doubleCheck !== "DELETE ALL TESTS") return;

    try {
      const res = await fetch(`${API_BASE_URL}/api/admin/tests-all/clear`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (data.success) {
        showToast(data.message, "success");
        fetchGlobalData();
      } else {
        showToast(data.message || 'Failed to format all test data', "error");
      }
    } catch (e) {
      console.error(e);
      showToast("Error formatting all test data", "error");
    }
  };
"""

if 'handleFormatAllTestData' not in frontend_content:
    # Insert after handleFormatTestData
    frontend_content = frontend_content.replace('  const downloadStudentTemplate = () => {', func_code + '\n  const downloadStudentTemplate = () => {')

target_buttons = """<button type="button" className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red-bg)' }} onClick={handleFormatTestData}><Trash2 size={13} /> Format selected test</button>"""
replacement_buttons = """<button type="button" className="btn btn-outline btn-sm" style={{ color: 'var(--red)', borderColor: 'var(--red-bg)' }} onClick={handleFormatTestData}><Trash2 size={13} /> Format selected test</button>
          <button type="button" className="btn btn-sm" style={{ background: '#ef4444', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6, padding: '0 12px', borderRadius: 6, fontWeight: 600 }} onClick={handleFormatAllTestData}><Trash2 size={13} /> Delete all test data</button>"""

if 'Delete all test data' not in frontend_content:
    frontend_content = frontend_content.replace(target_buttons, replacement_buttons)
    with open(frontend_file, 'w') as f:
        f.write(frontend_content)
    print("Frontend patched.")

