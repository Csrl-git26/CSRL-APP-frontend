import sys

filepath = '/Users/surya/Desktop/CSRL-APP-backed/services/analyticsService.js'
with open(filepath, 'r') as f:
    content = f.read()

old_block = """    if (!centreAgg[code]) centreAgg[code] = { sum: 0, count: 0, max: -Infinity, min: Infinity, studentCount: 0 };
    centreAgg[code].studentCount++;

    if (!doc) return;
    
    testKeys.forEach(key => {
      const mark = numericScore(doc[key]);
      if (mark === null) return;
      centreAgg[code].sum   += mark;
      centreAgg[code].count += 1;
      if (mark > centreAgg[code].max) centreAgg[code].max = mark;
      if (mark < centreAgg[code].min) centreAgg[code].min = mark;
    });
  });"""

new_block = """    if (!centreAgg[code]) centreAgg[code] = { sum: 0, count: 0, max: -Infinity, min: Infinity, studentCount: 0, phySum: 0, cheSum: 0, mathSum: 0, phyCount: 0, cheCount: 0, mathCount: 0 };
    centreAgg[code].studentCount++;

    if (!doc) return;
    
    testKeys.forEach(key => {
      const mark = numericScore(doc[key]);
      if (mark === null) return;
      centreAgg[code].sum   += mark;
      centreAgg[code].count += 1;
      if (mark > centreAgg[code].max) centreAgg[code].max = mark;
      if (mark < centreAgg[code].min) centreAgg[code].min = mark;
    });

    const rKeys = Object.keys(doc);
    const getScore = (sub) => {
       let k = null;
       for (const key of testKeys) {
          k = rKeys.find(rk => rk === `${key}_${sub}` || rk === `${key}_${sub.toUpperCase()}` || rk === `${key}_${sub.toLowerCase()}`);
          if (k) break;
       }
       if (!k) k = rKeys.find(rk => rk === sub || rk.toLowerCase().endsWith('_' + sub.toLowerCase()));
       if (k && !isNaN(Number(doc[k]))) {
           let val = Number(doc[k]);
           return val > 0 ? val : 0;
       }
       return null;
    };
    
    const phy = getScore('Physics');
    if (phy !== null) { centreAgg[code].phySum += phy; centreAgg[code].phyCount++; }
    const che = getScore('Chemistry');
    if (che !== null) { centreAgg[code].cheSum += che; centreAgg[code].cheCount++; }
    
    const m1 = getScore('Math'), m2 = getScore('Mathematics');
    const math = Math.max(m1||0, m2||0);
    if (m1 !== null || m2 !== null) { 
         centreAgg[code].mathSum += math; 
         centreAgg[code].mathCount++; 
    }
  });"""

if old_block in content:
    content = content.replace(old_block, new_block)
    
    old_return = """      const weakSubject    = weakAnalysis.length ? weakAnalysis[0].subject : 'N/A';
      return { code, avg, top, bottom, tested: s.count, studentCount: s.studentCount, weakSubject };"""
      
    new_return = """      const weakSubject    = weakAnalysis.length ? weakAnalysis[0].subject : 'N/A';
      return { 
         code, avg, top, bottom, tested: s.count, studentCount: s.studentCount, weakSubject,
         Physics: s.phyCount ? Math.round(s.phySum / s.phyCount) : 0,
         Chemistry: s.cheCount ? Math.round(s.cheSum / s.cheCount) : 0,
         Math: s.mathCount ? Math.round(s.mathSum / s.mathCount) : 0
      };"""
      
    content = content.replace(old_return, new_return)

    with open(filepath, 'w') as f:
        f.write(content)
    print("Patched analyticsService.js successfully!")
else:
    print("Could not find old_block in analyticsService.js")
