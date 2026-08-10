import fs from 'fs';
const code = fs.readFileSync('src/components/StudentDashboard.jsx', 'utf8');
console.log(code.length);
