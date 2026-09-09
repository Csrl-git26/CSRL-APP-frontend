import sys

filepath = '/Users/surya/Desktop/CSRL-APP-backed/services/analyticsService.js'
with open(filepath, 'r') as f:
    content = f.read()

insert_target = """  return {
    testKey: displayTestKey,
    subjects,
    cutoffs,
    overallTopper,
    bestScorePercentStudent,
    rankedStudents: ranked,
    top10,
    top10CentreCounts,
    globalSubjectStats: subjectAvgs,
    weakestSubjectByScorePercent: weakestSubj,
    centreRows: enrichedRows,
    bottom5Centres,
    notQualifiedOverall,
    notQualifiedBySubject,
    qualificationRateByCentre: qualRates,
    studentInsight,
    note: displayTestKey.includes(',') ? 'Multiple tests combined' : null,
  };
}"""

if insert_target in content:
    new_code = """
  // Subject Top Students computation
  let phyStudents = [];
  let cheStudents = [];
  let mathStudents = [];

  profiles.forEach((p) => {
    const doc = tests.find((t) => t.ROLL_KEY === p.ROLL_KEY);
    if (!doc) return;
    
    let tookTest = false;
    for (const key of validTestKeys) {
        if (doc[key] !== undefined && doc[key] !== 'Absent') tookTest = true;
    }
    if (!tookTest) return;

    const rKeys = Object.keys(doc);
    const getScore = (sub) => {
       let k = null;
       for (const key of validTestKeys) {
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
    if (phy !== null) phyStudents.push({ roll: p.ROLL_KEY, name: p["STUDENT'S NAME"] || p["STUDENT NAME"] || 'Unknown', centerCode: p.centerCode || 'UNKNOWN', score: phy });
    
    const che = getScore('Chemistry');
    if (che !== null) cheStudents.push({ roll: p.ROLL_KEY, name: p["STUDENT'S NAME"] || p["STUDENT NAME"] || 'Unknown', centerCode: p.centerCode || 'UNKNOWN', score: che });
    
    const m1 = getScore('Math'), m2 = getScore('Mathematics');
    const math = Math.max(m1||0, m2||0);
    if (m1 !== null || m2 !== null) mathStudents.push({ roll: p.ROLL_KEY, name: p["STUDENT'S NAME"] || p["STUDENT NAME"] || 'Unknown', centerCode: p.centerCode || 'UNKNOWN', score: math });
  });

  phyStudents.sort((a,b) => b.score - a.score);
  cheStudents.sort((a,b) => b.score - a.score);
  mathStudents.sort((a,b) => b.score - a.score);

  const topPhyStu = phyStudents.slice(0, 3);
  const topCheStu = cheStudents.slice(0, 3);
  const topMathStu = mathStudents.slice(0, 3);

  const subjectTopStudents = [
    {
      subject: 'PHY',
      top1Code: topPhyStu[0]?.name?.split(' ')[0] || '', top1Val: Math.round(topPhyStu[0]?.score || 0), top1Roll: topPhyStu[0]?.roll || '',
      top2Code: topPhyStu[1]?.name?.split(' ')[0] || '', top2Val: Math.round(topPhyStu[1]?.score || 0), top2Roll: topPhyStu[1]?.roll || '',
      top3Code: topPhyStu[2]?.name?.split(' ')[0] || '', top3Val: Math.round(topPhyStu[2]?.score || 0), top3Roll: topPhyStu[2]?.roll || '',
    },
    {
      subject: 'CHEM',
      top1Code: topCheStu[0]?.name?.split(' ')[0] || '', top1Val: Math.round(topCheStu[0]?.score || 0), top1Roll: topCheStu[0]?.roll || '',
      top2Code: topCheStu[1]?.name?.split(' ')[0] || '', top2Val: Math.round(topCheStu[1]?.score || 0), top2Roll: topCheStu[1]?.roll || '',
      top3Code: topCheStu[2]?.name?.split(' ')[0] || '', top3Val: Math.round(topCheStu[2]?.score || 0), top3Roll: topCheStu[2]?.roll || '',
    },
    {
      subject: 'MATH',
      top1Code: topMathStu[0]?.name?.split(' ')[0] || '', top1Val: Math.round(topMathStu[0]?.score || 0), top1Roll: topMathStu[0]?.roll || '',
      top2Code: topMathStu[1]?.name?.split(' ')[0] || '', top2Val: Math.round(topMathStu[1]?.score || 0), top2Roll: topMathStu[1]?.roll || '',
      top3Code: topMathStu[2]?.name?.split(' ')[0] || '', top3Val: Math.round(topMathStu[2]?.score || 0), top3Roll: topMathStu[2]?.roll || '',
    }
  ];

  return {
    testKey: displayTestKey,
    subjectTopStudents,
    subjects,
    cutoffs,
    overallTopper,
    bestScorePercentStudent,
    rankedStudents: ranked,
    top10,
    top10CentreCounts,
    globalSubjectStats: subjectAvgs,
    weakestSubjectByScorePercent: weakestSubj,
    centreRows: enrichedRows,
    bottom5Centres,
    notQualifiedOverall,
    notQualifiedBySubject,
    qualificationRateByCentre: qualRates,
    studentInsight,
    note: displayTestKey.includes(',') ? 'Multiple tests combined' : null,
  };
}"""
    content = content.replace(insert_target, new_code)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print("Patched successfully!")
else:
    print("Insert target not found!")
    print(repr(insert_target))
