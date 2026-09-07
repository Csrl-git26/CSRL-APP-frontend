with open('src/components/InsightsDashboard.jsx', 'r') as f:
    content = f.read()

# Update each LabelList to prepend subject code
replacements = [
    ('dataKey="Physics" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : \'\'}',
     'dataKey="Physics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Phy ${v}` : \'\'}'),
    ('dataKey="Chemistry" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : \'\'}',
     'dataKey="Chemistry" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Che ${v}` : \'\'}'),
    ('dataKey="Math" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : \'\'}',
     'dataKey="Math" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Mat ${v}` : \'\'}'),
    ('dataKey="Mathematics" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : \'\'}',
     'dataKey="Mathematics" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Mat ${v}` : \'\'}'),
    ('dataKey="Biology" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : \'\'}',
     'dataKey="Biology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Bio ${v}` : \'\'}'),
    ('dataKey="Botany" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : \'\'}',
     'dataKey="Botany" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Bot ${v}` : \'\'}'),
    ('dataKey="Zoology" position="center" fill="#fff" fontSize={9} fontWeight={700} formatter={(v) => v > 0 ? v : \'\'}',
     'dataKey="Zoology" position="center" fill="#fff" fontSize={8} fontWeight={700} formatter={(v) => v > 0 ? `Zoo ${v}` : \'\'}'),
]

for old, new in replacements:
    content = content.replace(old, new)

with open('src/components/InsightsDashboard.jsx', 'w') as f:
    f.write(content)
