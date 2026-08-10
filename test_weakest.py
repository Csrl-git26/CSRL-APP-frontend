import re

with open('src/components/CentreDashboard.jsx', 'r') as f:
    content = f.read()

replacement = """
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
              setAccuracyWeakSubject(isMedium ? `${weakestSub} (Medium)` : weakestSub);
            } else {
              setAccuracyWeakSubject('None');
            }
"""

old_logic = """
            const weakest = [];
            Object.keys(doc.weakSubjects).forEach(sub => {
              if (doc.weakSubjects[sub]?.strongWeak?.length > 0) weakest.push(sub);
            });
            if (weakest.length === 0) {
              Object.keys(doc.weakSubjects).forEach(sub => {
                if (doc.weakSubjects[sub]?.mediumWeak?.length > 0) weakest.push(`${sub} (Medium)`);
              });
            }
            setAccuracyWeakSubject(weakest.length > 0 ? weakest.join(', ') : 'None');
"""

# Strip out exact whitespace for safe replacement or use a regex
def normalize(s): return re.sub(r'\s+', '', s)

# Find start and end manually
idx = content.find("const weakest = [];")
if idx != -1:
    end_idx = content.find("setAccuracyWeakSubject(weakest.length > 0 ? weakest.join(', ') : 'None');", idx)
    if end_idx != -1:
        end_idx += len("setAccuracyWeakSubject(weakest.length > 0 ? weakest.join(', ') : 'None');")
        new_content = content[:idx] + replacement.strip() + content[end_idx:]
        with open('src/components/CentreDashboard.jsx', 'w') as f:
            f.write(new_content)
        print("Replaced logic!")
    else:
        print("End not found")
else:
    print("Start not found")
