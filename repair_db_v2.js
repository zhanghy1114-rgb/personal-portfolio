
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');

try {
    let data = fs.readFileSync(dbPath, 'utf8');
    
    // Regex to match a double-quoted string containing "chars omitted"
    // We assume the string does not contain unescaped quotes (which is true for the corruption marker)
    // The corruption marker is literally [... chars omitted ...]
    // So it won't have quotes inside it.
    
    const regex = /"[^"]*chars omitted[^"]*"/g;
    
    if (regex.test(data)) {
        console.log("Found corrupted strings. Replacing with empty strings...");
        const fixedData = data.replace(regex, '""');
        
        fs.writeFileSync(dbPath, fixedData);
        console.log("Replaced all corrupted strings.");
        
        try {
            JSON.parse(fixedData);
            console.log("JSON is now VALID.");
        } catch (e) {
            console.log("JSON is still invalid:", e.message);
            // Print context of new error
            // Error message usually gives position
        }
    } else {
        console.log("No corrupted strings found matching regex.");
    }

} catch (e) {
    console.error("Error:", e.message);
}
