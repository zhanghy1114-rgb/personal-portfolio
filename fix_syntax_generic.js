
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
let data = fs.readFileSync(dbPath, 'utf8');

// Generic fix for ""key": -> "", "key":
data = data.replace(/""([a-zA-Z0-9]+)":/g, '"", "$1":');

// Also check for "" "key": -> "", "key": (if quotes exist but comma missing)
data = data.replace(/""\s*"([a-zA-Z0-9]+)":/g, '"", "$1":');

// Write back
fs.writeFileSync(dbPath, data);
console.log("Applied generic syntax fixes.");

try {
    JSON.parse(data);
    console.log("JSON is VALID!");
} catch (e) {
    console.log("JSON is still invalid:", e.message);
}
