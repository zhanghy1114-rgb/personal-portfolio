const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

// GitHub Config
const REPO_OWNER = 'zhanghy1114-rgb';
const REPO_NAME = 'personal-portfolio';
const FILE_PATH = 'data/db.json';

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
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
        particlesEnabled: true,
        adminPassword: 'admin' // Default password
    },
    projects: [],
    media: [],
    tools: [],
    articles: []
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

// Helper to save to GitHub (Cloud Mode)
async function saveToGitHub(data) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) {
        console.error("Missing GITHUB_TOKEN in environment variables");
        return;
    }

    const url = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
    const contentEncoded = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    try {
        // 1. Get current file SHA
        const getRes = await fetch(url, {
            headers: { 
                'Authorization': `token ${token}`,
                'User-Agent': 'Vercel-Admin-App'
            }
        });
        
        if (!getRes.ok) throw new Error(`Failed to fetch file info: ${getRes.statusText}`);
        
        const getJson = await getRes.json();
        const sha = getJson.sha;

        // 2. Commit update
        const putRes = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${token}`,
                'User-Agent': 'Vercel-Admin-App',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: 'Update content via Web Admin (Mobile/Cloud)',
                content: contentEncoded,
                sha: sha
            })
        });

        if (putRes.ok) {
            console.log("✅ Successfully saved changes to GitHub!");
        } else {
            console.error("❌ GitHub Update Failed:", await putRes.text());
        }
    } catch (e) {
        console.error("❌ GitHub API Error:", e.message);
    }
}

const saveDB = (data) => {
    memoryDB = data; // Always update memory
    
    // Local Save
    try {
        if (!process.env.VERCEL) {
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.log("Could not persist data to disk");
    }

    // Cloud Save (Trigger GitHub Update)
    if (process.env.VERCEL) {
        // Run asynchronously to not block response
        saveToGitHub(data).catch(err => console.error("Async Save Error:", err));
    }
};

// Multer Storage Configuration (Use /tmp for Vercel if needed, or memory storage)
const storage = multer.memoryStorage(); // Switch to memory storage for Vercel compatibility
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

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
app.post('/api/projects', upload.single('icon'), (req, res) => {
    const db = getDB();
    let iconUrl = '';
    
    if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        iconUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    const newProject = {
        id: Date.now(),
        title: req.body.title,
        description: req.body.description,
        link: req.body.link,
        category: req.body.category,
        iconUrl: iconUrl
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

// Add Tool
app.post('/api/tools', upload.single('icon'), (req, res) => {
    const db = getDB();
    let iconUrl = '';
    
    if (req.file) {
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        iconUrl = `data:${req.file.mimetype};base64,${b64}`;
    }

    const newTool = {
        id: Date.now(),
        name: req.body.name,
        description: req.body.description,
        link: req.body.link,
        iconUrl: iconUrl
    };
    db.tools.push(newTool);
    saveDB(db);
    res.json(newTool);
});

// Add Article
app.post('/api/articles', (req, res) => {
    const db = getDB();
    const newArticle = {
        id: Date.now(),
        ...req.body
    };
    db.articles.push(newArticle);
    saveDB(db);
    res.json(newArticle);
});

// Verify Password
app.post('/api/verify-password', (req, res) => {
    const { password } = req.body;
    const db = getDB();
    if (password === (db.settings.adminPassword || 'admin')) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Incorrect password' });
    }
});

// Deploy / Sync to GitHub
app.post('/api/deploy', (req, res) => {
    console.log("Starting deployment process...");

    // Determine environment (Vercel vs Local)
    // Vercel sets VERCEL=1 env var
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
        return res.status(403).json({ 
            error: 'Cannot sync from Cloud', 
            details: 'This feature is for local development only. Please run the project locally to sync changes to GitHub.' 
        });
    }
    
    // Define Git Path
    // On Windows Local, use the absolute path. On Mac/Linux/Vercel(if enabled), use 'git'.
    const isWindows = process.platform === 'win32';
    const gitPath = isWindows ? '"C:\\Program Files\\Git\\cmd\\git.exe"' : 'git';

    // 1. Git Add
    exec(`${gitPath} add .`, { cwd: process.cwd() }, (err, stdout, stderr) => {
        if (err) {
            console.error("Git Add Failed:", stderr);
            return res.status(500).json({ error: 'Git Add failed', details: stderr });
        }

        // 2. Git Commit
        exec(`${gitPath} commit -m "Auto-deploy: Sync content from Admin Panel"`, { cwd: process.cwd() }, (err, stdout, stderr) => {
            // Ignore error if nothing to commit
            if (err && !stdout.includes('nothing to commit') && !stderr.includes('nothing to commit')) {
                console.error("Git Commit Failed:", stderr);
                return res.status(500).json({ error: 'Git Commit failed', details: stderr });
            }

            // 3. Git Push
            exec(`${gitPath} push`, { cwd: process.cwd() }, (err, stdout, stderr) => {
                if (err) {
                    console.error("Git Push Failed:", stderr);
                    return res.status(500).json({ error: 'Git Push failed. Please check server logs or network.', details: stderr });
                }
                
                console.log("Git Push Success:", stdout);
                res.json({ success: true, message: 'Sync Successful! Vercel deployment triggered.' });
            });
        });
    });
});

// Delete Project
app.delete('/api/projects/:id', (req, res) => {
    const db = getDB();
    const id = parseInt(req.params.id);
    db.projects = db.projects.filter(p => p.id !== id);
    saveDB(db);
    res.json({ success: true });
});

// Delete Media
app.delete('/api/media/:id', (req, res) => {
    const db = getDB();
    const id = parseInt(req.params.id);
    db.media = db.media.filter(m => m.id !== id);
    saveDB(db);
    res.json({ success: true });
});

// Delete Tool
app.delete('/api/tools/:id', (req, res) => {
    const db = getDB();
    const id = parseInt(req.params.id);
    db.tools = db.tools.filter(t => t.id !== id);
    saveDB(db);
    res.json({ success: true });
});

// Delete Article
app.delete('/api/articles/:id', (req, res) => {
    const db = getDB();
    const id = parseInt(req.params.id);
    db.articles = db.articles.filter(a => a.id !== id);
    saveDB(db);
    res.json({ success: true });
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;