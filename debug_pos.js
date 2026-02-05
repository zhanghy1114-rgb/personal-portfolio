
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
const data = fs.readFileSync(dbPath, 'utf8');
const idx = 288;
console.log(data.substring(idx - 50, idx + 50));
