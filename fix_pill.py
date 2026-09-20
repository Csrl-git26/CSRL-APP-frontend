import os

filepath = '/Users/surya/Desktop/CSRL-APP-frontend/src/components/WeakTopicCard.jsx'
with open(filepath, 'r') as f:
    content = f.read()

old_logic = """  const renderPill = (item, type) => {
    const label = isCenter
      ? `${item.topic} (${item.percentage}%)`
      : item;
    const key   = isCenter ? item.topic : item;"""

new_logic = """  const renderPill = (item, type) => {
    const isString = typeof item === 'string';
    let label = item;
    let key = item;
    
    if (!isString) {
      label = isCenter && item.percentage ? `${item.topic} (${item.percentage}%)` : item.topic;
      key = item.topic;
    }"""

content = content.replace(old_logic, new_logic)

with open(filepath, 'w') as f:
    f.write(content)
print("Pill logic fixed!")
