
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
let data = fs.readFileSync(dbPath, 'utf8');

// Fix certCover: ""videoLink": -> "", "videoLink":
data = data.replace(/""videoLink":/g, '"", "videoLink":');

// Fix iconUrl at end of file.
// Previous fix might have turned "" "articles" into "", "articles"
// We need to close the structure.
// "iconUrl" is in "tools" array.
// So we need to close object } and array ].
data = data.replace(/"iconUrl":\s*""\s*,?\s*"articles"/, '"iconUrl": "" }], "articles"');

// Write back
fs.writeFileSync(dbPath, data);
console.log("Applied final syntax fixes.");

try {
    JSON.parse(data);
    console.log("JSON is VALID!");
} catch (e) {
    console.log("JSON is still invalid:", e.message);
}
