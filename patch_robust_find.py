import re

def patch_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find the block where viewingStudentId is checked
    old_code = """  if (viewingStudentId) {
    const profile      = data.profiles.find((p) => String(p.ROLL_KEY) === String(viewingStudentId));
    const studentTests = data.tests.find((t) => String(t.ROLL_KEY) === String(viewingStudentId)) || {};"""
    
    new_code = """  if (viewingStudentId) {
    const target = String(viewingStudentId).trim().toLowerCase();
    const profile = data.profiles.find((p) => {
      const rk = p.ROLL_KEY != null ? String(p.ROLL_KEY).trim().toLowerCase() : '';
      const rno = p['ROLL NO.'] != null ? String(p['ROLL NO.']).trim().toLowerCase() : '';
      const roll = p.roll != null ? String(p.roll).trim().toLowerCase() : '';
      return rk === target || rno === target || roll === target || p.ROLL_KEY === viewingStudentId;
    }) || profileByRoll?.get(viewingStudentId) || profileByRoll?.get(Number(viewingStudentId)) || profileByRoll?.get(String(viewingStudentId));
    
    const studentTests = data.tests.find((t) => {
      const rk = t.ROLL_KEY != null ? String(t.ROLL_KEY).trim().toLowerCase() : '';
      return rk === target || t.ROLL_KEY === viewingStudentId;
    }) || {};"""

    # If the old code isn't exactly matched, try a regex
    if old_code in content:
        content = content.replace(old_code, new_code)
    else:
        # Maybe it has slightly different spacing
        print(f"Could not find exact string in {filepath}. Trying regex...")
        content = re.sub(
            r'const profile\s*=\s*data\.profiles\.find\(\(p\)\s*=>\s*String\(p\.ROLL_KEY\)\s*===\s*String\(viewingStudentId\)\);',
            """const target = String(viewingStudentId).trim().toLowerCase();
    const profile = data.profiles.find((p) => {
      const rk = p.ROLL_KEY != null ? String(p.ROLL_KEY).trim().toLowerCase() : '';
      const rno = p['ROLL NO.'] != null ? String(p['ROLL NO.']).trim().toLowerCase() : '';
      const roll = p.roll != null ? String(p.roll).trim().toLowerCase() : '';
      return rk === target || rno === target || roll === target || p.ROLL_KEY === viewingStudentId;
    }) || (typeof profileByRoll !== 'undefined' ? (profileByRoll.get(viewingStudentId) || profileByRoll.get(Number(viewingStudentId)) || profileByRoll.get(String(viewingStudentId))) : undefined);""",
            content
        )
        content = re.sub(
            r'const studentTests\s*=\s*data\.tests\.find\(\(t\)\s*=>\s*String\(t\.ROLL_KEY\)\s*===\s*String\(viewingStudentId\)\)\s*\|\|\s*\{\};',
            """const studentTests = data.tests.find((t) => {
      const rk = t.ROLL_KEY != null ? String(t.ROLL_KEY).trim().toLowerCase() : '';
      return rk === target || t.ROLL_KEY === viewingStudentId;
    }) || {};""",
            content
        )

    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Patched {filepath}")

patch_file('src/components/AdminDashboard.jsx')
patch_file('src/components/CentreDashboard.jsx')
