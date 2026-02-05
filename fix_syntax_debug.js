
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
let data = fs.readFileSync(dbPath, 'utf8');

console.log("Original length:", data.length);
// Debug the substring around the first error
const idx = data.indexOf('backgroundImage');
console.log("Around backgroundImage:", data.substring(idx, idx + 50));

const newData = data.replace(/""\s*"/g, '"", "');
console.log("New length:", newData.length);

if (newData === data) {
    console.log("No replacement made!");
    // Try without regex g? Or check what exactly is there.
    // It matches "" followed by optional whitespace and "
} else {
    console.log("Replacement made.");
    fs.writeFileSync(dbPath, newData);
}
