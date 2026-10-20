export function resolveChatScope(question, previous) {
  const neet = /\bneet\b|नीट/i.test(question);
  const jee = /\bjee\b|जेईई/i.test(question);
  const advanced = /\badvanced\b|\badv\b|एडवांस/i.test(question);
  const main = /\bmains?\b|मेन/i.test(question);
  if ((neet && (jee || advanced || main)) || (advanced && main)) return { message: 'Please ask about one exam at a time: JEE Main, JEE Advanced or NEET.' };
  if (neet) return { scope: { stream:'NEET', branch:'MAIN' } };
  if (advanced || main) return { scope: { stream:'JEE', branch:advanced ? 'ADVANCED' : 'MAIN' } };
  if (jee && previous?.stream !== 'JEE') return { message: 'Do you mean JEE Main or JEE Advanced?' };
  if (previous) return { scope:previous };
  return { message: 'Should I check JEE Main, JEE Advanced or NEET? Reply with the exam name and I will answer your question.' };
}
