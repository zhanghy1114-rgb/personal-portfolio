
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
const data = fs.readFileSync(dbPath, 'utf8');
const len = data.length;
console.log(JSON.stringify(data.substring(len - 200, len)));
