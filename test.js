const fs = require('fs');
try {
  const code = fs.readFileSync('src/components/StudentDashboard.jsx', 'utf8');
  require('vm').Script(code);
  console.log("Syntax is valid!");
} catch (e) {
  console.error("Syntax Error:");
  console.error(e);
}
