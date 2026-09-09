import re
import os

files_to_check = {
    'InsightsDashboard': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/InsightsDashboard.jsx',
    'SubjectTopCentres': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopCentres.jsx',
    'SubjectTopStudents': '/Users/surya/Desktop/CSRL-APP-frontend/src/components/SubjectTopStudents.jsx',
}

# --- INSIGHTS DASHBOARD ---
with open(files_to_check['InsightsDashboard'], 'r') as f:
    dashboard = f.read()

# 1. SectionTitle
old_section_title = """function SectionTitle({ Icon, children, color = '#1a4fa0' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:7, marginBottom:6,
      fontSize:14, fontWeight:800, color, letterSpacing:0.2 }}>
      <Icon size={15} />{children}
    </div>
  );
}"""

new_section_title = """function SectionTitle({ Icon, children, color = '#3b82f6' }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10,
      fontSize:15, fontWeight:800, color: '#0f172a', letterSpacing:0.2 }}>
      <Icon size={18} color={color} />{children}
    </div>
  );
}"""
dashboard = dashboard.replace(old_section_title, new_section_title)

# 2. Card Styles (Multiple replacements)
old_card_style = """background:'#fff', borderRadius:14, padding:'6px 8px',
              boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0'"""
new_card_style = """background:'#fff', borderRadius:16, padding:'16px 14px',
              boxShadow:'0 4px 12px -2px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.025)', border:'1px solid #f1f5f9'"""
dashboard = dashboard.replace(old_card_style, new_card_style)

# Also handle single line version if any:
old_card_style_inline = "background:'#fff', borderRadius:14, padding:'6px 8px', boxShadow:'0 2px 8px rgba(0,0,0,0.07)', border:'1px solid #e2e8f0'"
new_card_style_inline = "background:'#fff', borderRadius:16, padding:'16px 14px', boxShadow:'0 4px 12px -2px rgba(0, 0, 0, 0.05)', border:'1px solid #f1f5f9'"
dashboard = dashboard.replace(old_card_style_inline, new_card_style_inline)

# 3. KPI Cards Backgrounds
dashboard = dashboard.replace("bg=\"#eff6ff\"", "bg=\"linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)\"")
dashboard = dashboard.replace("bg=\"#fff7ed\"", "bg=\"linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%)\"")
dashboard = dashboard.replace("bg=\"#f0fdf4\"", "bg=\"linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)\"")
dashboard = dashboard.replace("bg=\"#faf5ff\"", "bg=\"linear-gradient(135deg, #faf5ff 0%, #f3e8ff 100%)\"")

# KPI Card border-radius upgrade
dashboard = dashboard.replace("borderRadius:10, padding:'6px 12px'", "borderRadius:16, padding:'14px 18px'")
dashboard = dashboard.replace("boxShadow:'0 1px 4px rgba(0,0,0,0.07)'", "boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.05)'")
dashboard = dashboard.replace("width:34, height:34, borderRadius:8", "width:42, height:42, borderRadius:12")
dashboard = dashboard.replace("<Icon size={18} color={color}/>", "<Icon size={22} color={color}/>")

# Decrease size of radial chart title to match others
dashboard = dashboard.replace("SectionTitle Icon={PieChartIcon} color=\"#2563eb\">Top 5 Centres - Qual %", "SectionTitle Icon={PieChartIcon} color=\"#22c55e\">Top 5 Centres - Qual %")

with open(files_to_check['InsightsDashboard'], 'w') as f:
    f.write(dashboard)


# --- SUBJECT TOP CENTRES ---
if os.path.exists(files_to_check['SubjectTopCentres']):
    with open(files_to_check['SubjectTopCentres'], 'r') as f:
        content = f.read()
    
    # Update CartesianGrid
    content = content.replace('<CartesianGrid strokeDasharray="3 3" vertical={false} />', '<CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />')
    
    # Update card style
    content = content.replace(old_card_style, new_card_style)
    content = content.replace(old_card_style_inline, new_card_style_inline)

    with open(files_to_check['SubjectTopCentres'], 'w') as f:
        f.write(content)

# --- SUBJECT TOP STUDENTS ---
if os.path.exists(files_to_check['SubjectTopStudents']):
    with open(files_to_check['SubjectTopStudents'], 'r') as f:
        content = f.read()
    
    # Update CartesianGrid
    content = content.replace('<CartesianGrid strokeDasharray="3 3" vertical={false} />', '<CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />')
    
    # Update card style
    content = content.replace(old_card_style, new_card_style)
    content = content.replace(old_card_style_inline, new_card_style_inline)

    with open(files_to_check['SubjectTopStudents'], 'w') as f:
        f.write(content)

print("Styling upgrades applied!")
