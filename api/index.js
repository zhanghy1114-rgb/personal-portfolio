const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

// ==========================================
// CONFIGURATION
// ==========================================
const CONFIG = {
    PORT: 3000,
    GITHUB: {
        OWNER: 'zhanghy1114-rgb',
        REPO: 'personal-portfolio',
        FILE_PATH: 'data/db.json',
        TOKEN: process.env.GITHUB_TOKEN // Optional: from env if available
    },
    COZE: {
        // User provided token (JWT)
        API_KEY: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjM0MmEyMzU0LTI5ODgtNGJkYi04N2ViLTU1MjliYmJkMmVlZCJ9.eyJpc3MiOiJodHRwczovL2FwaS5jb3plLmNuIiwiYXVkIjpbIndZQ1VPTEtQb3lKU2RHeDFUaGtQZUQzdkhCVDdiYXlLIl0sImV4cCI6ODIxMDI2Njg3Njc5OSwiaWF0IjoxNzcwMDQ1OTczLCJzdWIiOiJzcGlmZmU6Ly9hcGkuY296ZS5jbi93b3JrbG9hZF9pZGVudGl0eS9pZDo3NjAyMjcyMTc2MTM3MzA2MTY0Iiwic3JjIjoiaW5ib3VuZF9hdXRoX2FjY2Vzc190b2tlbl9pZDo3NjAyMjg5NTY3NDYyMzI2Mjg3In0.lL1WeNgQuwfAC8Luks0kjU1l6Q7YrHcFh4BQBGZqMVweG5OKwBu-ATsE8myBsmBKxOQ7VHUpZm4FxnEyQjbC7-RL4vPcUzKPPPMsgswgIngF4e2cDcz9GeAJnA6XMCzz2gT0-49mOCQrD00jfijr1GcXqm3aqMaC0Fkh9-6V2Ujb8LtruI1VhNOEVnSHKcRO7gmI6BBtfiGuNdhVx-hLHQIkiLuzK1697PF44hudUZqKeWnw9fkS_qx3h4v2tje1-47JvgF0ctpWNkF6X8n0h2f7kBihonkfjcw9Cg3mQoYjDb2bjl_X-mET795UbItnhom5aZvZ5UIov8dCrFz1LA',
        API_URL: 'https://gj4p8f69bg.coze.site/stream_run',
        PROJECT_ID: '7602265065043165224' // Must be string to avoid precision loss
    },
    DIRS: {
        DATA: path.join(process.cwd(), 'data'),
        UPLOADS: path.join(process.cwd(), 'uploads')
    }
};

const DB_FILE = path.join(CONFIG.DIRS.DATA, 'db.json');

// ==========================================
// SETUP & MIDDLEWARE
// ==========================================
const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// Ensure directories exist
try {
    if (!fs.existsSync(CONFIG.DIRS.DATA)) fs.mkdirSync(CONFIG.DIRS.DATA, { recursive: true });
    if (!fs.existsSync(CONFIG.DIRS.UPLOADS)) fs.mkdirSync(CONFIG.DIRS.UPLOADS, { recursive: true });
} catch (e) {
    console.warn("Read-only file system detected or error creating dirs:", e.message);
}

// Multer Storage (Memory for Vercel compatibility)
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 20 * 1024 * 1024 } // 20MB
});

// ==========================================
// DATABASE LAYER (With Caching)
// ==========================================
let dbCache = null;

// Initial Default DB
const defaultDB = {
    settings: {
        backgroundColor: '#000000',
        backgroundImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop', // High-res default
        backgroundMusic: '',
        particlesEnabled: true,
        adminPassword: 'admin',
        // Feature Cards Links
        certLink: '',
        videoLink: '',
        workflowLink: '',
        certCover: '',
        videoCover: '',
        workflowCover: '',
        // Contact Info
        contactEmail: '602682647@qq.com',
        contactHandle: '毓见Agent',
        qrDouyin: '',
        qrXiaohongshu: '',
        qrVideoAccount: ''
    },
    projects: [],
    agents: [],
    certificates: [],
    media: [],
    tools: [],
    articles: []
};

// Load DB
function loadDB() {
    if (dbCache) return dbCache;
    
    try {
        if (fs.existsSync(DB_FILE)) {
            const data = fs.readFileSync(DB_FILE, 'utf8');
            dbCache = JSON.parse(data);
        } else {
            dbCache = { ...defaultDB };
            // Try to write initial file
            try { fs.writeFileSync(DB_FILE, JSON.stringify(dbCache, null, 2)); } catch(e){}
        }
    } catch (e) {
        console.error("Error loading DB:", e);
        dbCache = { ...defaultDB };
    }
    return dbCache;
}

// Save DB
function saveDB(data) {
    dbCache = data; // Update cache immediately
    
    // Persist to disk (Local)
    try {
        if (!process.env.VERCEL) {
            fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
        }
    } catch (e) {
        console.error("Could not write to disk:", e.message);
    }

    // Persist to Cloud (GitHub) - Async
    if (process.env.VERCEL) {
        syncToGitHub(data).catch(err => console.error("Async GitHub Save Error:", err));
    }
}

// GitHub Sync Helper
async function syncToGitHub(data) {
    const token = CONFIG.GITHUB.TOKEN;
    if (!token) return;

    const url = `https://api.github.com/repos/${CONFIG.GITHUB.OWNER}/${CONFIG.GITHUB.REPO}/contents/${CONFIG.GITHUB.FILE_PATH}`;
    const contentEncoded = Buffer.from(JSON.stringify(data, null, 2)).toString('base64');

    try {
        const getRes = await fetch(url, { headers: { 'Authorization': `token ${token}`, 'User-Agent': 'Vercel-App' } });
        if (!getRes.ok) throw new Error(`Fetch failed: ${getRes.statusText}`);
        const { sha } = await getRes.json();

        await fetch(url, {
            method: 'PUT',
            headers: { 'Authorization': `token ${token}`, 'User-Agent': 'Vercel-App', 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: 'Update via Web Admin', content: contentEncoded, sha })
        });
        console.log("✅ Changes saved to GitHub");
    } catch (e) {
        console.error("❌ GitHub Sync Failed:", e.message);
    }
}

// ==========================================
// API SERVICES
// ==========================================

/**
 * Handle Coze API Calls
 */
async function callCozeService(message, history) {
    console.log("Calling Coze API:", CONFIG.COZE.API_URL);

    const response = await fetch(CONFIG.COZE.API_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${CONFIG.COZE.API_KEY}`,
            'Content-Type': 'application/json',
            'Connection': 'keep-alive'
        },
        body: JSON.stringify({
            "content": { "query": { "prompt": [{ "type": "text", "content": { "text": message } }] } },
            "type": "query",
            "text": message, // Redundant but safe
            "session_id": history && history.length > 0 ? 'session_existing' : `session_${Date.now()}`,
            "project_id": CONFIG.COZE.PROJECT_ID
        })
    });

    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Coze API Error (${response.status}): ${errText}`);
    }

    const rawText = await response.text();
    // console.log("Coze Raw Response:", rawText.substring(0, 200) + "..."); // Log first 200 chars

    // Parse Response (NDJSON or JSON)
    let fullAnswer = '';
    const lines = rawText.split('\n');

    for (const line of lines) {
        if (!line.trim() || !line.startsWith('data:')) continue;
        try {
            const jsonStr = line.substring(5).trim();
            const data = JSON.parse(jsonStr);
            
            // Extract answer from various Coze formats
            if (data.event === 'conversation.message.delta' && data.data?.content) {
                fullAnswer += data.data.content;
            } else if (data.content?.answer) {
                fullAnswer += data.content.answer;
            } else if (typeof data.content === 'string') {
                fullAnswer += data.content;
            }
        } catch (e) {}
    }

    // Fallback: Try parsing as single JSON object if streaming parsing failed
    if (!fullAnswer) {
        try {
            const jsonBody = JSON.parse(rawText);
            if (jsonBody.data) {
                fullAnswer = typeof jsonBody.data === 'string' 
                    ? (JSON.parse(jsonBody.data).content || jsonBody.data) 
                    : (jsonBody.data.content || JSON.stringify(jsonBody.data));
            } else if (jsonBody.content) {
                fullAnswer = jsonBody.content;
            }
        } catch (e) {
            if (rawText.length > 0 && !rawText.startsWith('{')) fullAnswer = rawText;
        }
    }

    return fullAnswer || "AI 正在思考... (未收到有效回复)";
}

/**
 * Handle Git Deployment
 */
async function executeGitDeploy(proxy) {
    const isWindows = process.platform === 'win32';
    let gitPath = 'git'; // Default

    // Remove stale lock file if exists
    const lockFile = path.join(process.cwd(), '.git', 'index.lock');
    if (fs.existsSync(lockFile)) {
        try {
            fs.unlinkSync(lockFile);
            console.log('Removed stale .git/index.lock file');
        } catch (e) {
            console.warn('Warning: Could not remove .git/index.lock:', e.message);
        }
    }

    // Promisified Exec
    const run = (cmd) => new Promise((resolve, reject) => {
        exec(cmd, { cwd: process.cwd() }, (err, stdout, stderr) => {
            if (err) {
                err.stdout = stdout;
                err.stderr = stderr;
                reject(err);
            } else resolve({ stdout, stderr });
        });
    });

    // Detect WSL or Windows Git
    if (isWindows) {
        try {
            await run('wsl --list');
            gitPath = 'wsl -d Ubuntu-24.04 -e git'; // Prefer WSL if available
            console.log('Using WSL Git');
        } catch (e) {
            gitPath = '"C:\\Program Files\\Git\\cmd\\git.exe"'; // Fallback to standard Windows path
        }
    }

    // Check Git
    try { await run(`${gitPath} --version`); } 
    catch (e) { throw new Error('Git not found. Please install Git.'); }

    // Configure Proxy
    if (proxy) {
        await run(`${gitPath} config --global http.proxy http://${proxy}`);
        await run(`${gitPath} config --global https.proxy http://${proxy}`);
    } else {
        try {
            await run(`${gitPath} config --global --unset http.proxy`);
            await run(`${gitPath} config --global --unset https.proxy`);
        } catch(e) {}
    }

    // Execute Git Flow
    await run(`${gitPath} add .`);
    try { await run(`${gitPath} commit -m "Auto-deploy: Sync content"`); } catch(e) {} // Ignore empty commit
    try { await run(`${gitPath} pull --rebase`); } catch(e) { if(e.stderr.includes('conflict')) throw new Error('Merge conflict detected.'); }
    
    // Push with retry
    let lastError;
    for (let i = 0; i < 3; i++) {
        try {
            await run(`${gitPath} push`);
            return "同步成功！GitHub 已接收更新。";
        } catch(e) {
            lastError = e;
            await new Promise(r => setTimeout(r, 2000));
        }
    }
    throw lastError;
}

// ==========================================
// ROUTES
// ==========================================

// Get All Data
app.get('/api/data', (req, res) => res.json(loadDB()));

// Update Settings
app.post('/api/settings', (req, res) => {
    const db = loadDB();
    db.settings = { ...db.settings, ...req.body };
    saveDB(db);
    res.json(db.settings);
});

// Generic Upload Handler Helper
const handleUpload = (req, res, targetField, dbSection = 'settings') => {
    if (!req.file) return res.status(400).send('No file uploaded');
    const db = loadDB();
    const b64 = Buffer.from(req.file.buffer).toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${b64}`;
    
    if (dbSection === 'settings') {
        db.settings[targetField] = dataURI;
    } // Logic for other sections can be added if needed, but they use specific routes below
    
    saveDB(db);
    res.json({ url: dataURI });
};

// Specific Upload Routes
app.post('/api/upload/background', upload.single('file'), (req, res) => handleUpload(req, res, 'backgroundImage'));
app.post('/api/upload/music', upload.single('file'), (req, res) => handleUpload(req, res, 'backgroundMusic'));
app.post('/api/upload/certCover', upload.single('file'), (req, res) => handleUpload(req, res, 'certCover'));
app.post('/api/upload/videoCover', upload.single('file'), (req, res) => handleUpload(req, res, 'videoCover'));
app.post('/api/upload/workflowCover', upload.single('file'), (req, res) => handleUpload(req, res, 'workflowCover'));
app.post('/api/upload/qrDouyin', upload.single('file'), (req, res) => handleUpload(req, res, 'qrDouyin'));
app.post('/api/upload/qrXiaohongshu', upload.single('file'), (req, res) => handleUpload(req, res, 'qrXiaohongshu'));
app.post('/api/upload/qrVideoAccount', upload.single('file'), (req, res) => handleUpload(req, res, 'qrVideoAccount'));

// Projects
app.post('/api/projects', upload.single('icon'), (req, res) => {
    const db = loadDB();
    const newProject = {
        id: Date.now(),
        ...req.body,
        iconUrl: req.file ? `data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString('base64')}` : ''
    };
    db.projects.push(newProject);
    saveDB(db);
    res.json(newProject);
});

// Agents
app.post('/api/agents', upload.single('icon'), (req, res) => {
    const db = loadDB();
    const newAgent = {
        id: Date.now(),
        ...req.body,
        iconUrl: req.file ? `data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString('base64')}` : ''
    };
    db.agents.push(newAgent);
    saveDB(db);
    res.json(newAgent);
});

// Media
app.post('/api/upload/media', upload.single('file'), (req, res) => {
    const db = loadDB();
    const newMedia = {
        id: Date.now(),
        type: req.body.type,
        url: req.file ? `data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString('base64')}` : '',
        title: req.body.title || req.file?.originalname || 'Untitled',
        description: req.body.description || '',
        link: req.body.link || ''
    };
    db.media.push(newMedia);
    saveDB(db);
    res.json(newMedia);
});

// Tools
app.post('/api/tools', upload.single('icon'), (req, res) => {
    const db = loadDB();
    const newTool = {
        id: Date.now(),
        ...req.body,
        iconUrl: req.file ? `data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString('base64')}` : ''
    };
    db.tools.push(newTool);
    saveDB(db);
    res.json(newTool);
});

// Certificates
app.post('/api/certificates', upload.single('image'), (req, res) => {
    const db = loadDB();
    const newCert = {
        id: Date.now(),
        ...req.body,
        link: req.body.link || '',
        imageUrl: req.file ? `data:${req.file.mimetype};base64,${Buffer.from(req.file.buffer).toString('base64')}` : ''
    };
    db.certificates.push(newCert);
    saveDB(db);
    res.json(newCert);
});

// Articles
app.post('/api/articles', (req, res) => {
    const db = loadDB();
    const newArticle = { id: Date.now(), ...req.body };
    db.articles.push(newArticle);
    saveDB(db);
    res.json(newArticle);
});

// Delete Route Factory
const createDeleteRoute = (collection) => (req, res) => {
    const db = loadDB();
    const id = parseInt(req.params.id);
    db[collection] = db[collection].filter(item => item.id !== id);
    saveDB(db);
    res.json({ success: true });
};

app.delete('/api/projects/:id', createDeleteRoute('projects'));
app.delete('/api/agents/:id', createDeleteRoute('agents'));
app.delete('/api/media/:id', createDeleteRoute('media'));
app.delete('/api/tools/:id', createDeleteRoute('tools'));
app.delete('/api/certificates/:id', createDeleteRoute('certificates'));
app.delete('/api/articles/:id', createDeleteRoute('articles'));

// Verify Password
app.post('/api/verify-password', (req, res) => {
    const db = loadDB();
    if (req.body.password === (db.settings.adminPassword || 'admin')) {
        res.json({ success: true });
    } else {
        res.status(401).json({ success: false, message: 'Incorrect password' });
    }
});

// Deploy Route
app.post('/api/deploy', async (req, res) => {
    if (process.env.VERCEL) {
        return res.json({ success: true, message: 'Cloud environment detected. Changes saved automatically.' });
    }

    try {
        const message = await executeGitDeploy(req.body.proxy);
        res.json({ success: true, message });
    } catch (err) {
        console.error("Deployment Error:", err);
        let userMsg = '同步失败：连接 GitHub 超时。';
        if (err.stderr && (err.stderr.includes('Could not connect') || err.stderr.includes('Connection was reset'))) {
            userMsg = '网络连接失败。请检查您的代理设置。';
        }
        res.status(500).json({ error: userMsg, details: err.stderr || err.message });
    }
});

// Chat Route
app.post('/api/chat', async (req, res) => {
    try {
        const reply = await callCozeService(req.body.message, req.body.history);
        res.json({ reply });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ reply: `系统错误: ${error.message}` });
    }
});

// Start Server
if (require.main === module) {
    app.listen(CONFIG.PORT, () => {
        console.log(`Server running at http://localhost:${CONFIG.PORT}`);
    });
}

module.exports = app;
