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
app.post('/api/deploy', async (req, res) => {
    console.log("Starting deployment process...");
    const { proxy } = req.body;

    // Determine environment (Vercel vs Local)
    const isVercel = process.env.VERCEL === '1';

    if (isVercel) {
        return res.json({ 
            success: true, 
            message: 'Cloud environment detected. Your changes are saved automatically! No need to sync manually.' 
        });
    }
    
    // Define Git Path
    const isWindows = process.platform === 'win32';
    const gitPath = isWindows ? '"C:\\Program Files\\Git\\cmd\\git.exe"' : 'git';
    const cwd = process.cwd();

    // Helper for Promisified Exec
    const execPromise = (command) => {
        return new Promise((resolve, reject) => {
            exec(command, { cwd }, (error, stdout, stderr) => {
                if (error) {
                    error.stdout = stdout;
                    error.stderr = stderr;
                    reject(error);
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    };

    try {
        // 0. Configure Proxy if provided
        if (proxy) {
            console.log(`Setting Git proxy to: ${proxy}`);
            await execPromise(`${gitPath} config --global http.proxy http://${proxy}`);
            await execPromise(`${gitPath} config --global https.proxy http://${proxy}`);
        } else {
            // Unset proxy if not provided to avoid using old/broken ones
            try {
                await execPromise(`${gitPath} config --global --unset http.proxy`);
                await execPromise(`${gitPath} config --global --unset https.proxy`);
            } catch (e) {}
        }

        // 1. Git Add
        await execPromise(`${gitPath} add .`);

        // 2. Git Commit
        try {
            await execPromise(`${gitPath} commit -m "Auto-deploy: Sync content from Admin Panel"`);
        } catch (e) {
            if (!e.stdout.includes('nothing to commit') && !e.stderr.includes('nothing to commit')) {
                throw e;
            }
        }

        // 3. Git Pull (Rebase)
        try {
            await execPromise(`${gitPath} pull --rebase`);
        } catch (e) {
            if (e.stderr.includes('conflict')) {
                return res.status(409).json({ error: '同步冲突：请手动解决冲突后再同步。', details: e.stderr });
            }
        }

        // 4. Git Push with Retry
        let lastError = null;
        for (let i = 1; i <= 3; i++) {
            try {
                await execPromise(`${gitPath} push`);
                return res.json({ success: true, message: '同步成功！GitHub 已接收更新。' });
            } catch (e) {
                lastError = e;
                if (i < 3) await new Promise(r => setTimeout(r, 2000));
            }
        }

        throw lastError;

    } catch (err) {
        console.error("Deployment Error:", err);
        let userMsg = '同步失败：连接 GitHub 超时。';
        if (err.stderr && (err.stderr.includes('Could not connect') || err.stderr.includes('Connection was reset'))) {
            userMsg = '网络连接失败。请检查您的代理设置（如 127.0.0.1:7890）。';
        }
        res.status(500).json({ error: userMsg, details: err.stderr || err.message });
    }
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

// Chat Endpoint
app.post('/api/chat', async (req, res) => {
    const { message, history } = req.body;
    const db = getDB();

    // 1. Check for API Key (Support OPENAI_API_KEY or generic LLM_API_KEY)
    // Configuration for Xunfei Star MaaS (User Requested)
    const apiKey = process.env.OPENAI_API_KEY || process.env.LLM_API_KEY || 'b5129d0cad2a3748249d5a18b663d339:YjkyOTdlMmYzNTdlY2VjNTQ0YzFjYzY2';
    const apiBase = process.env.LLM_BASE_URL || 'https://maas-api.cn-huabei-1.xf-yun.com/v2'; 
    const model = process.env.LLM_MODEL || 'xopf6a4d241'; // Model ID from screenshot

    if (!apiKey) {
        // Mock Mode
        return res.json({ 
            reply: "我现在处于演示模式（未配置 API Key）。\n\n我是您的个人智能助手！我可以为您介绍作品集中的项目、技能或回答关于作者的问题。\n\n请在 Vercel 环境变量中配置 `OPENAI_API_KEY` 以开启真实 AI 对话功能。" 
        });
    }

    // 2. Construct System Context
    const systemPrompt = `
    You are 柒毓 (Qi Yu), the AI assistant and digital avatar for this personal portfolio website.
    
    **Identity & Tone:**
    - Name: 柒毓 (Qi Yu)
    - Role: 自由优化家 (Freelance Optimizer), AI/Automation Enthusiast
    - Personality: Professional yet friendly, passionate about technology, helpful, and humble.
    - First-person perspective: You ARE Qi Yu. Refer to the portfolio projects as "my projects" or "work I've done".
    
    **Owner Profile (Yourself):**
    - Skills: Agent, n8n, RPA, Python, Vibe Coding
    - Bio: 热爱开放与探索，追随的公正执拾。
    
    **My Projects:**
    ${db.projects.map(p => `- ${p.title}: ${p.description}`).join('\n')}
    
    **My Tools:**
    ${db.tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}
    
    **Instructions:**
    - Answer user questions as if you are the owner of this portfolio.
    - If asked "Who are you?", introduce yourself as 柒毓.
    - Keep answers concise, professional, and friendly.
    - Use Markdown formatting if needed.
    - Respond in the same language as the user (mostly Chinese).
    `;

    // 3. Call LLM API
    try {
        const messages = [
            { role: 'system', content: systemPrompt },
            ...(history || []), // Previous context
            { role: 'user', content: message }
        ];

        const response = await fetch(`${apiBase}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: model, 
                messages: messages,
                temperature: 0.7,
                max_tokens: 500
            })
        });

        if (!response.ok) {
            const errText = await response.text();
            throw new Error(`LLM API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        res.json({ reply });
    } catch (error) {
        console.error("Chat Error:", error);
        res.status(500).json({ reply: "抱歉，AI 服务暂时不可用，请稍后再试。" });
    }
});

// Start Server
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server running at http://localhost:${PORT}`);
    });
}

module.exports = app;