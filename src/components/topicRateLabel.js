// Missing rates are not zero; accuracy is undefined when nothing was attempted.
function formatPercentage(value) {
  return typeof value === 'number' && Number.isFinite(value)
    ? `${Math.round(value)}%`
    : 'N/A';
}

export function topicRateLabel(topic, subject, topicRates = []) {
  const rate = Array.isArray(topicRates)
    ? topicRates.find(item => item.topic === topic && item.subject === subject)
    : undefined;
  return `${topic} (AT.-${formatPercentage(rate?.attemptPercentage)}, AC.-${formatPercentage(rate?.accuracyPercentage)})`;
}
