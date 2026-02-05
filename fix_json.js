
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'db.json');

try {
    let data = fs.readFileSync(dbPath, 'utf8');
    
    // Replace unescaped control characters
    // JSON strings cannot contain unescaped newlines.
    // We'll replace actual newlines with nothing (assuming they are line breaks in base64)
    // BUT we must be careful not to break the JSON structure (indentation).
    // However, indentation is usually outside strings.
    // The error says "in string literal", so it's inside a value.
    
    // Strategy:
    // 1. Identify the string literals.
    // 2. Remove control characters from within them.
    
    // A simpler heuristic for this specific case (base64 image strings):
    // If we have a long string, it might have been wrapped.
    // We can try to use a regex to find strings and clean them.
    
    // Or, since we know it's likely the "backgroundImage" field, let's look at that.
    
    // Let's try to just remove newlines that are NOT followed by optional whitespace and a key-start or end-brace.
    // Actually, standard JSON.parse is strict.
    
    // Let's try to fix it by removing all newlines and then re-formatting? 
    // No, that might break if there are valid newlines in keys (unlikely) or valid escaped newlines (which are \n, two chars).
    // Real control characters (ASCII 0-31) are the problem.
    
    // Let's replace all control characters (except \r, \n, \t) with nothing.
    // And for \r and \n, if they are inside a string, they are illegal.
    
    // Let's try a regex approach to find the specific bad characters.
    // \x00-\x1F are control chars.
    
    // We will read the file char by char or just use a replace for the known problematic range if it's specific.
    // The error was at position 2082.
    
    // Let's look at the context around 2082 again.
    const pos = 2082;
    const start = Math.max(0, pos - 50);
    const end = Math.min(data.length, pos + 50);
    console.log("Context:\n" + data.substring(start, end));
    
    // If it is a newline inside the base64 string, we should just remove it.
    
    // Heuristic fix: Remove \r and \n that are inside quotes.
    // This is hard to do with simple regex because of escaped quotes.
    
    // Alternative: The file content I saw earlier had "..." omitted.
    // Maybe I can just replace the backgroundImage with a placeholder if I can't save it.
    // But the user wants their data.
    
    // Let's try to sanitize the string.
    // We'll traverse the string, keeping track of whether we are inside a string.
    // If inside a string, ignore/remove unescaped newlines.
    
    let inString = false;
    let escaped = false;
    let newData = '';
    
    for (let i = 0; i < data.length; i++) {
        const char = data[i];
        
        if (inString) {
            if (escaped) {
                escaped = false;
                newData += char;
            } else {
                if (char === '\\') {
                    escaped = true;
                    newData += char;
                } else if (char === '"') {
                    inString = false;
                    newData += char;
                } else {
                    // Inside string: check for control chars
                    const code = char.charCodeAt(0);
                    if (code < 32) {
                        // Skip control characters inside string (like \n, \r)
                        // console.log(`Skipping control char ${code} at ${i}`);
                    } else {
                        newData += char;
                    }
                }
            }
        } else {
            // Outside string
            if (char === '"') {
                inString = true;
            }
            newData += char;
        }
    }
    
    // Try to parse the fixed data
    try {
        const parsed = JSON.parse(newData);
        console.log("Fix successful! Writing back to file...");
        fs.writeFileSync(dbPath, JSON.stringify(parsed, null, 2));
        console.log("File saved.");
    } catch (e) {
        console.log("Fix failed:", e.message);
        // Save the attempt anyway? No, dangerous.
        // Let's dump the context of the new error
    }
    
} catch (e) {
    console.error("Error:", e.message);
}
