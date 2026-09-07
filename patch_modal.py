with open('src/components/AdminDashboard.jsx', 'r') as f:
    content = f.read()

# 1. Add state
content = content.replace(
    'const [showClearRawMarksModal, setShowClearRawMarksModal] = useState(false);',
    'const [showClearRawMarksModal, setShowClearRawMarksModal] = useState(false);\n  const [showGraphsModal, setShowGraphsModal] = useState(false);'
)

# 2. Update onViewCentre prop in AdminDashboard.jsx
old_on_view_centre = "onViewCentre={(code) => { setPreviousPage(activePage); setFilterCenter(code); setActivePage('centre-overview'); }}"
new_on_view_centre = "onViewCentre={(code) => { setSelectedTrendCentre(code); setShowGraphsModal(true); }}"
content = content.replace(old_on_view_centre, new_on_view_centre)

# 3. Replace the grid-2 container with a modal block
grid_start_text = "<div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px' }}>"
modal_start_text = """{showGraphsModal && (
        <div className="modal-overlay" onClick={() => setShowGraphsModal(false)}>
          <div className="modal" style={{ maxWidth: 1200, width: '95%', height: '80vh', display: 'flex', flexDirection: 'column' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Trophy size={16} aria-hidden="true" />
                Centre Insights - {selectedTrendCentre}
              </div>
              <button type="button" className="modal-close" onClick={() => setShowGraphsModal(false)} aria-label="Close">×</button>
            </div>
            <div className="modal-body" style={{ background: '#f8fafc', padding: 20, flex: 1, overflowY: 'auto' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '20px', height: '100%' }}>"""

content = content.replace(grid_start_text, modal_start_text, 1)

grid_end_text = """            </div>
          </div>
        </div>


    </div>"""

modal_end_text = """            </div>
          </div>
        </div>
              </div>
            </div>
          </div>
        )}


    </div>"""
content = content.replace(grid_end_text, modal_end_text, 1)

with open('src/components/AdminDashboard.jsx', 'w') as f:
    f.write(content)
