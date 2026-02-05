
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');

try {
    const data = fs.readFileSync(dbPath, 'utf8');
    console.log("File length:", data.length);
    console.log("First 50 chars:", data.substring(0, 50));
    console.log("Last 50 chars:", data.substring(data.length - 50));
    
    try {
        JSON.parse(data);
        console.log("JSON is VALID");
    } catch (e) {
        console.log("JSON is INVALID:", e.message);
        // Print context around the error position if available
        // SyntaxError usually doesn't give position easily in simple message, but let's try
    }
} catch (e) {
    console.log("File read error:", e.message);
}
