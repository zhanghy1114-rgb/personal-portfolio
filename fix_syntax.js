
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
let data = fs.readFileSync(dbPath, 'utf8');

// Fix 1: Insert missing commas between fields where we have "" "key"
// This matches the pattern from dump_head: "" "key"
data = data.replace(/""\s*"/g, '"", "');

// Fix 2: The specific case at the end of the file: "iconUrl": "" "articles": []
// We need to close the object and array before "articles".
// "iconUrl" is likely the last field of a tool object.
// So we need to add " } ], " before "articles"
data = data.replace(/"iconUrl":\s*"",\s*"articles"/, '"iconUrl": "" }, ], "articles"');
// Note: I added a comma in Fix 1, so it might be "" , "articles" now.
// So let's match with or without comma.
data = data.replace(/"iconUrl":\s*""\s*,?\s*"articles"/, '"iconUrl": "" }], "articles"');

// Fix 3: Also check for other unclosed objects if any.
// certCover was also broken.
// "certCover": "" "videoLink" -> "certCover": "", "videoLink" (Handled by Fix 1)

// Write back
fs.writeFileSync(dbPath, data);
console.log("Applied syntax fixes.");

try {
    JSON.parse(data);
    console.log("JSON is VALID!");
} catch (e) {
    console.log("JSON is still invalid:", e.message);
}
