
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
let data = fs.readFileSync(dbPath, 'utf8');

// Fix missing object/array closers after corrupted iconUrl
// Case 1: iconUrl followed by "id" (start of next item)
// "iconUrl": "", "id": ... -> "iconUrl": "" }, { "id": ...
data = data.replace(/"iconUrl":\s*"",\s*"id":/g, '"iconUrl": "" }, { "id":');

// Case 2: iconUrl followed by "articles" (end of tools array)
// "iconUrl": "", "articles": ... -> "iconUrl": "" } ], "articles": ...
data = data.replace(/"iconUrl":\s*"",\s*"articles":/g, '"iconUrl": "" } ], "articles":');

// Write back
fs.writeFileSync(dbPath, data);
console.log("Applied structure fixes.");

try {
    JSON.parse(data);
    console.log("JSON is VALID!");
} catch (e) {
    console.log("JSON is still invalid:", e.message);
}
