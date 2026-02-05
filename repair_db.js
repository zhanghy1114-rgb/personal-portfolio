
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');

try {
    let data = fs.readFileSync(dbPath, 'utf8');
    
    // Check if the corrupted string is present
    if (data.includes("chars omitted")) {
        console.log("Found corrupted marker. Repairing...");
        
        // The pattern seems to be inside the backgroundImage value.
        // We will look for "backgroundImage": ".... [omitted] ..."
        // And replace the whole value with empty string.
        
        // Regex to find "backgroundImage": " ... " where ... contains "chars omitted"
        // We need to be careful not to consume too much.
        // We can match from "backgroundImage" until the next key, e.g. "backgroundMusic"
        
        // Let's try to locate the start and end of the value.
        const key = '"backgroundImage":';
        const startIdx = data.indexOf(key);
        if (startIdx !== -1) {
            // Find the opening quote
            const valueStart = data.indexOf('"', startIdx + key.length);
            
            // Find the next key "backgroundMusic" to determine where to stop safely
            const nextKey = '"backgroundMusic"';
            const nextKeyIdx = data.indexOf(nextKey);
            
            if (valueStart !== -1 && nextKeyIdx !== -1) {
                // Find the closing quote before the next key
                // It should be the last quote before the comma before nextKey
                const valueEnd = data.lastIndexOf('"', nextKeyIdx);
                // Actually, let's just assume the corruption is contained within the value quotes.
                // But the corruption might have broken the quotes.
                
                // Let's just blindly replace the range between valueStart and the comma before nextKey
                // Find the comma before nextKey
                const commaIdx = data.lastIndexOf(',', nextKeyIdx);
                
                if (commaIdx > valueStart) {
                     const prefix = data.substring(0, valueStart);
                     const suffix = data.substring(commaIdx); // includes comma
                     
                     // Construct new data with empty image
                     const fixedData = prefix + '""' + suffix;
                     
                     fs.writeFileSync(dbPath, fixedData);
                     console.log("Repaired backgroundImage.");
                     
                     // Verify JSON
                     try {
                         JSON.parse(fixedData);
                         console.log("JSON is now VALID.");
                     } catch (e) {
                         console.log("JSON is still invalid:", e.message);
                         // Try to fix other occurrences?
                         // Maybe there are multiple corruptions.
                     }
                } else {
                    console.log("Could not safely locate boundaries.");
                }
            } else {
                 console.log("Could not find next key.");
            }
        }
    } else {
        console.log("No explicit corruption marker found.");
    }

} catch (e) {
    console.error("Error:", e.message);
}
