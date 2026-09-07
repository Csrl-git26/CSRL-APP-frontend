with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

old = """                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0];
                   if (shortName.length < 3 && nameSplit.length > 1) shortName += ' ' + nameSplit[1];
                   
                   let d = { name: shortName, total: s.marks ?? s.score };"""

new = """                   let nameSplit = (s.name || s.roll || '—').split(' ');
                   let shortName = nameSplit[0];
                   if (shortName.length < 3 && nameSplit.length > 1) shortName += ' ' + nameSplit[1];
                   const centre = s.center || '';
                   const label = centre ? `${shortName} (${centre})` : shortName;
                   
                   let d = { name: label, total: s.marks ?? s.score };"""

content = content.replace(old, new)

# Also widen the YAxis to fit longer labels (name + centre code)
content = content.replace('interval={0} width={50}', 'interval={0} width={80}')

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
