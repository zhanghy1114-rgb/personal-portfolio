
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
const data = fs.readFileSync(dbPath, 'utf8');
console.log(JSON.stringify(data.substring(0, 300)));
