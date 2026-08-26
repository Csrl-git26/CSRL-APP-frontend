const chartData = [
  { name: 'FMT04', Physics: 16 }
];

const rawMarks = [
  { testId: 'FMT04', marks: { 'Q1': 4, 'Q2': 4, 'Q3': 4, 'Q4': 4, 'Q5': 0, 'Q6': -1 } }
];

const topicMaps = [
  { testId: 'FMT04', topics: [
    { subject: 'Physics', questions: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6'] }
  ]}
];

chartData.forEach(row => {
  const normRowName = row.name.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const rawMarkDoc = rawMarks.find(m => m.testId && m.testId.replace(/[^a-zA-Z0-9]/g, '').toUpperCase() === normRowName);
  
  if (rawMarkDoc && rawMarkDoc.marks) {
    const tMap = topicMaps.find(t => t.testId === rawMarkDoc.testId);
    if (tMap) {
      const qToSub = {};
      (tMap.topics || []).forEach(t => {
        (t.questions || []).forEach(q => {
          qToSub[q] = t.subject;
        });
      });
      
      const metrics = {};
      let totalAttempted = 0;
      let totalCorrect = 0;
      
      Object.entries(rawMarkDoc.marks).forEach(([q, mark]) => {
        const sub = qToSub[q];
        if (!sub) return;
        if (!metrics[sub]) metrics[sub] = { attempted: 0, correct: 0 };
        
        if (mark !== undefined && mark !== null) {
          metrics[sub].attempted++;
          totalAttempted++;
          if (Number(mark) > 0) {
            metrics[sub].correct++;
            totalCorrect++;
          }
        }
      });
      
      Object.keys(metrics).forEach(sub => {
        const outSub = sub === 'Mathematics' ? 'Math' : sub;
        row[`${outSub}_Attempted`] = metrics[sub].attempted;
        row[`${outSub}_Correct`] = metrics[sub].correct;
        if (metrics[sub].attempted > 0) {
          row[`${outSub}_Accuracy`] = Math.round((metrics[sub].correct / metrics[sub].attempted) * 100);
        }
      });
      
      if (totalAttempted > 0) {
        row['Total_Attempted'] = totalAttempted;
        row['Total_Correct'] = totalCorrect;
        row['Total_Accuracy'] = Math.round((totalCorrect / totalAttempted) * 100);
      }
    }
  }
});

console.log(JSON.stringify(chartData, null, 2));
