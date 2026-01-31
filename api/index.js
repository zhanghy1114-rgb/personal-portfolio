const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure directories exist (Only for local dev or writable environments)
// Use process.cwd() for Vercel compatibility
const dataDir = path.join(process.cwd(), 'data');
const uploadsDir = path.join(process.cwd(), 'uploads');
try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
} catch (e) {
    console.log("Read-only file system detected or error creating dirs");
}

// Data File Paths
const DB_FILE = path.join(dataDir, 'db.json');

// In-memory fallback for read-only environments
let memoryDB = {
    settings: {
        backgroundColor: '#000000',
        backgroundImage: '',
        backgroundMusic: '',
        particlesEnabled: true
    },
    projects: [],
    media: [] 
};

// Initialize DB if not exists (Try-Catch for Vercel)
try {
    if (fs.existsSync(DB_FILE)) {
        memoryDB = JSON.parse(fs.readFileSync(DB_FILE));
    } else {
        fs.writeFileSync(DB_FILE, JSON.stringify(memoryDB, null, 2));
    }
} catch (e) {
    console.log("Could not write/read DB file, using in-memory DB");
}

// Helper to read/write DB
const getDB = () => {
    try {
        if (fs.existsSync(DB_FILE)) return JSON.parse(fs.readFileSync(DB_FILE));
    } catch (e) {}
    return memoryDB;
};

const saveDB = (data) => {
    memoryDB = data; // Always update memory
    try {
        fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
        console.log("Could not persist data to disk (read-only fs)");
    }
};

// Multer Storage Configuration (Use /tmp for Vercel if needed, or memory storage)
const storage = multer.memoryStorage(); // Switch to memory storage for Vercel compatibility
const upload = multer({ storage: storage });

// --- API Endpoints ---

// Get All Data
app.get('/api/data', (req, res) => {
    res.json(getDB());
});

// Update Settings
app.post('/api/settings', (req, res) => {
    const db = getDB();
    db.settings = { ...db.settings, ...req.body };
    saveDB(db);
    res.json(db.settings);
});

// Upload Background Image
app.post('/api/upload/background', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    const db = getDB();
    // In Vercel, we can't save files permanently. We'll return a data URI for demo purposes.
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    db.settings.backgroundImage = dataURI;
    saveDB(db);
    res.json({ url: dataURI });
});

// Upload Music
app.post('/api/upload/music', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    const db = getDB();
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    db.settings.backgroundMusic = dataURI;
    saveDB(db);
    res.json({ url: dataURI });
});

// Add Project (App Card)
app.post('/api/projects', (req, res) => {
    const db = getDB();
    const newProject = {
        id: Date.now(),
        ...req.body
    };
    db.projects.push(newProject);
    saveDB(db);
    res.json(newProject);
});

// Upload Media (Video/Photo)
app.post('/api/upload/media', upload.single('file'), (req, res) => {
    if (!req.file) return res.status(400).send('No file uploaded');
    const db = getDB();
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    const newMedia = {
        id: Date.now(),
        type: req.body.type, // 'video' or 'image'
        url: dataURI,
        title: req.body.title || req.file.originalname,
        description: req.body.description || ''
    };
    db.media.push(newMedia);
    saveDB(db);
    res.json(newMedia);
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;