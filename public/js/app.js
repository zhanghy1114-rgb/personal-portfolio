const API_URL = '/api';

let musicPlaying = false;
let siteData = {};
const bgMusic = document.getElementById('bgMusic');

function applyDigitalHumanConcept() {
    const home = document.getElementById('home');
    if (!home || home.dataset.digitalConcept === 'true') return;

    home.dataset.digitalConcept = 'true';
    document.body.classList.add('ai-controlled-site');
    home.classList.add('digital-human-hero');
    home.classList.add('character-home');

    const content = home.querySelector('.hero-content');
    if (content) {
        content.innerHTML = `
                <div class="persona-intro">
                    <div class="hero-badge digital-badge">
                    <span class="badge-dot"></span> QIYU IP MODELING / CHARACTER RIG ONLINE
                </div>
                <h1 class="hero-title digital-title">
                    <span class="title-line">把想法训练成</span>
                    <span class="title-line title-accent">可执行的 AI 作品</span>
                </h1>
                <p class="hero-subtitle digital-subtitle">
                    这里是柒毓的个人 AI 创作中枢：短剧、智能体、Prompt、工作流和现实实验，都被整理成可以继续迭代的实战入口。
                </p>
                <div class="home-signal-bar" aria-label="小毓状态">
                    <span><i class="fas fa-cube"></i> 三视图锁定</span>
                    <span><i class="fas fa-wand-magic-sparkles"></i> 材质扫描</span>
                    <span><i class="fas fa-face-smile"></i> 表情绑定</span>
                </div>
                <div class="hero-actions digital-actions">
                    <button class="btn-glass" onclick="document.getElementById('chatFab')?.click()">
                        <span>和小毓对话</span>
                        <i class="fas fa-comment-dots"></i>
                    </button>
                    <button class="btn-ghost" onclick="navigateTo('works')">
                        <span>查看她的作品</span>
                        <i class="fas fa-arrow-right"></i>
                    </button>
                </div>
            </div>
            <div class="home-module-rail persona-orbit-nav" aria-label="首页快速入口">
                <button onclick="navigateTo('works')">
                    <i class="fas fa-layer-group"></i>
                    <strong>作品矩阵</strong>
                    <span>短剧 / 学习伴侣 / IP 生成</span>
                </button>
                <button onclick="navigateTo('skills')">
                    <i class="fas fa-route"></i>
                    <strong>工作流</strong>
                    <span>从想法到落地的实战路径</span>
                </button>
                <button onclick="navigateTo('prompts')">
                    <i class="fas fa-terminal"></i>
                    <strong>Prompt库</strong>
                    <span>可复用的商业指令</span>
                </button>
                <button onclick="navigateTo('diary')">
                    <i class="fas fa-flask"></i>
                    <strong>养虾实验</strong>
                    <span>养虾日记与 AI 观察</span>
                </button>
            </div>
        `;
    }

    const visual = document.getElementById('heroVisual');
    if (visual) {
        visual.innerHTML = `
            <div class="persona-stage generated-persona-stage home-studio-stage xiaoyu-stage">
                <button class="xiaoyu-core-hitarea" onclick="document.getElementById('chatFab')?.click()" aria-label="和小毓对话"></button>
                <div class="holo-depth-shell shell-back"></div>
                <div class="holo-depth-shell shell-front"></div>
                <div class="holo-aura-ring ring-alpha"></div>
                <div class="holo-aura-ring ring-beta"></div>
                <div class="studio-orbit orbit-large"></div>
                <div class="studio-orbit orbit-small"></div>
                <canvas class="xiaoyu-model-canvas" id="xiaoyuModelCanvas" aria-label="小毓 3D 角色预览"></canvas>
                <div class="modeling-floor" aria-hidden="true"></div>
                <div class="model-turntable" aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>
                <div class="model-axis axis-x" aria-hidden="true"><span>X</span></div>
                <div class="model-axis axis-y" aria-hidden="true"><span>Y</span></div>
                <div class="model-axis axis-z" aria-hidden="true"><span>Z</span></div>
                <div class="model-measure measure-height" aria-hidden="true"><span>168CM</span></div>
                <div class="model-measure measure-material" aria-hidden="true"><span>TRANSLUCENT · EMISSIVE</span></div>
                <div class="stage-scan"></div>
                <div class="persona-field field-left" aria-hidden="true"></div>
                <div class="persona-field field-right" aria-hidden="true"></div>
                <div class="face-focus" aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>
                <div class="voice-pulse" aria-hidden="true">
                    <span></span><span></span><span></span>
                </div>
                <div class="presence-code code-left" aria-hidden="true">
                    <span>RIG_STATUS CALIBRATING</span>
                    <span>MESH_DETAIL HIGH</span>
                    <span>LIGHT_SHADER ICE_BLUE</span>
                </div>
                <div class="presence-code code-right" aria-hidden="true">
                    <span>FACE_BLENDSHAPE 24</span>
                    <span>POSE_LIBRARY READY</span>
                    <span>RENDER_PASS 03</span>
                </div>
                <img src="xiaoyu-ip.jpg?v=20260531-ip-v1" alt="小毓 AI 数字人格 IP 形象" class="digital-human-portrait homepage-digital-portrait">
                <div class="model-wireframe wire-head" aria-hidden="true"></div>
                <div class="model-wireframe wire-body" aria-hidden="true"></div>
                <div class="model-pin pin-face" aria-hidden="true"></div>
                <div class="model-pin pin-material" aria-hidden="true"></div>
                <div class="avatar-depth-shadow"></div>
                <div class="home-floating-panel panel-now persona-panel ip-reference-card">
                    <img src="xiaoyu-ip-expressions.jpg?v=20260531-ip-v1" alt="小毓 IP 表情系列">
                    <span>EXPRESSION</span>
                    <strong>表情系列已接入</strong>
                </div>
                <div class="home-floating-panel panel-stack persona-panel ip-reference-card">
                    <img src="xiaoyu-ip-turnaround.jpg?v=20260531-ip-v1" alt="小毓 IP 三视图">
                    <span>DESIGN</span>
                    <strong>三视图设定已归档</strong>
                </div>
                <div class="home-console persona-console">
                    <div class="console-topline">
                        <span></span><span></span><span></span>
                    </div>
                    <p>xiaoyu.listen()</p>
                    <strong>把“我帮你”说得刚刚好，把“我懂你”藏在缝隙里。</strong>
                </div>
                <div class="portrait-glow"></div>
            </div>
        `;
    }

    const chatName = document.querySelector('.chat-name');
    const chatStatus = document.querySelector('.chat-status');
    const firstBot = document.querySelector('.chat-msg.bot .msg-content');
    if (chatName) chatName.textContent = '柒毓 AI 数字人格';
    if (chatStatus) chatStatus.textContent = '在线 · 记忆陪伴模式';
    if (firstBot) firstBot.textContent = '你好，我是柒毓的 AI 数字人格。你可以问我项目、工作流、Prompt 资源，也可以让我帮你把一个想法拆成行动步骤。';

    document.getElementById('aiControlDeck')?.remove();
    initDigitalEyeMotion();
    initHomeAvatarMotion();
    initXiaoyuModelViewport();
}

function initXiaoyuModelViewport() {
    const canvas = document.getElementById('xiaoyuModelCanvas');
    const stage = document.querySelector('.xiaoyu-stage');
    if (!canvas || !stage || canvas.dataset.modelReady === 'true') return;
    if (!window.THREE) return;

    canvas.dataset.modelReady = 'true';
    stage.classList.add('model-canvas-ready');

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
    camera.position.set(0.15, 1.18, 5.6);

    const root = new THREE.Group();
    root.position.set(0, -0.1, 0);
    scene.add(root);

    scene.add(new THREE.AmbientLight(0xbfeaff, 1.2));
    const key = new THREE.PointLight(0x9ee7ff, 3.8, 9);
    key.position.set(1.8, 2.9, 3.2);
    scene.add(key);
    const rim = new THREE.PointLight(0xffd166, 1.4, 7);
    rim.position.set(-2.4, 1.4, 2.2);
    scene.add(rim);

    const grid = new THREE.GridHelper(6.4, 28, 0x80e7ff, 0x2d7894);
    grid.position.y = -1.72;
    grid.material.transparent = true;
    grid.material.opacity = 0.36;
    root.add(grid);

    const ringMaterial = new THREE.MeshBasicMaterial({
        color: 0x8fe9ff,
        transparent: true,
        opacity: 0.34,
        side: THREE.DoubleSide
    });
    const ringA = new THREE.Mesh(new THREE.TorusGeometry(1.7, 0.012, 10, 120), ringMaterial);
    ringA.rotation.x = Math.PI / 2;
    ringA.position.y = -1.42;
    root.add(ringA);

    const ringB = ringA.clone();
    ringB.scale.set(1.34, 1.34, 1.34);
    ringB.material = ringMaterial.clone();
    ringB.material.opacity = 0.18;
    root.add(ringB);

    const textureLoader = new THREE.TextureLoader();
    const portraitTexture = textureLoader.load('xiaoyu-ip.jpg');
    portraitTexture.colorSpace = THREE.SRGBColorSpace;
    portraitTexture.repeat.set(1, 0.72);
    portraitTexture.offset.set(0, 0.2);

    const avatar = new THREE.Group();
    avatar.position.set(0.04, 0.18, 0);
    root.add(avatar);

    const avatarWidth = 2.22;
    const avatarHeight = 3.95;
    const sliceGeometry = new THREE.PlaneGeometry(avatarWidth, avatarHeight, 32, 32);
    for (let i = 0; i < 5; i += 1) {
        const material = new THREE.MeshPhysicalMaterial({
            map: portraitTexture,
            transparent: true,
            opacity: i === 2 ? 0.9 : 0.14,
            roughness: 0.28,
            metalness: 0.08,
            transmission: 0.18,
            thickness: 0.35,
            side: THREE.DoubleSide,
            emissive: new THREE.Color(0x1c6d95),
            emissiveIntensity: i === 2 ? 0.08 : 0.18
        });
        const slice = new THREE.Mesh(sliceGeometry, material);
        slice.position.z = (i - 2) * 0.045;
        slice.position.x = (i - 2) * 0.008;
        avatar.add(slice);
    }

    const edgeBox = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(avatarWidth, avatarHeight, 0.28)),
        new THREE.LineBasicMaterial({ color: 0xdff9ff, transparent: true, opacity: 0.28 })
    );
    avatar.add(edgeBox);

    const sideMaterial = new THREE.MeshBasicMaterial({
        color: 0x9fe8ff,
        transparent: true,
        opacity: 0.08,
        side: THREE.DoubleSide
    });
    const sideLeft = new THREE.Mesh(new THREE.PlaneGeometry(0.28, avatarHeight), sideMaterial);
    sideLeft.position.set(-avatarWidth / 2, 0, 0);
    sideLeft.rotation.y = Math.PI / 2;
    avatar.add(sideLeft);
    const sideRight = sideLeft.clone();
    sideRight.position.x = avatarWidth / 2;
    avatar.add(sideRight);

    const turnTexture = textureLoader.load('xiaoyu-ip-turnaround.jpg');
    turnTexture.colorSpace = THREE.SRGBColorSpace;
    const turnPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.58, 0.9),
        new THREE.MeshBasicMaterial({ map: turnTexture, transparent: true, opacity: 0.82, side: THREE.DoubleSide })
    );
    turnPanel.position.set(1.84, 0.85, -0.42);
    turnPanel.rotation.y = -0.32;
    root.add(turnPanel);

    const expressionTexture = textureLoader.load('xiaoyu-ip-expressions.jpg');
    expressionTexture.colorSpace = THREE.SRGBColorSpace;
    const expressionPanel = new THREE.Mesh(
        new THREE.PlaneGeometry(1.38, 0.78),
        new THREE.MeshBasicMaterial({ map: expressionTexture, transparent: true, opacity: 0.72, side: THREE.DoubleSide })
    );
    expressionPanel.position.set(-1.7, -0.62, -0.38);
    expressionPanel.rotation.y = 0.28;
    root.add(expressionPanel);

    const points = [];
    for (let i = 0; i < 90; i += 1) {
        points.push((Math.random() - 0.5) * 5.2, (Math.random() - 0.5) * 4.2, (Math.random() - 0.5) * 2.6);
    }
    const pointGeometry = new THREE.BufferGeometry();
    pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(points, 3));
    const pointCloud = new THREE.Points(pointGeometry, new THREE.PointsMaterial({
        color: 0xcdf8ff,
        size: 0.024,
        transparent: true,
        opacity: 0.5
    }));
    root.add(pointCloud);

    const resize = () => {
        const rect = canvas.getBoundingClientRect();
        const width = Math.max(1, Math.floor(rect.width));
        const height = Math.max(1, Math.floor(rect.height));
        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    };

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    resize();

    const motionOK = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const tick = () => {
        const t = performance.now() * 0.001;
        root.rotation.y = Math.sin(t * 0.42) * 0.16;
        avatar.rotation.y = Math.sin(t * 0.54) * 0.2;
        avatar.rotation.x = Math.sin(t * 0.31) * 0.035;
        ringA.rotation.z = t * 0.55;
        ringB.rotation.z = -t * 0.38;
        pointCloud.rotation.y = t * 0.06;
        renderer.render(scene, camera);
        if (motionOK) requestAnimationFrame(tick);
    };

    tick();
}

function initHomeAvatarMotion() {
    const stage = document.querySelector('.xiaoyu-stage');
    if (!stage || stage.dataset.avatarMotion === 'true') return;

    stage.dataset.avatarMotion = 'true';
    let tx = 0;
    let ty = 0;
    let gx = 0;
    let gy = 0;
    let lastMove = 0;

    function updateTarget(clientX, clientY) {
        const rect = stage.getBoundingClientRect();
        const centerX = rect.left + rect.width * 0.58;
        const centerY = rect.top + rect.height * 0.48;
        const dx = Math.max(-1, Math.min(1, (clientX - centerX) / (rect.width * 0.42)));
        const dy = Math.max(-1, Math.min(1, (clientY - centerY) / (rect.height * 0.38)));
        tx = dy * -4;
        ty = dx * 7;
        gx = dx * 10;
        gy = dy * 7;
        lastMove = Date.now();
    }

    window.addEventListener('pointermove', (event) => {
        updateTarget(event.clientX, event.clientY);
    }, { passive: true });

    function tick() {
        if (Date.now() - lastMove > 2400) {
            const t = Date.now() / 1000;
            tx = Math.sin(t * 0.46) * 2.2;
            ty = Math.sin(t * 0.62) * 4.2;
            gx = Math.sin(t * 0.62) * 5;
            gy = Math.sin(t * 0.38) * 3;
        }

        stage.style.setProperty('--tilt-x', `${tx.toFixed(2)}deg`);
        stage.style.setProperty('--tilt-y', `${ty.toFixed(2)}deg`);
        stage.style.setProperty('--gaze-x', `${gx.toFixed(2)}px`);
        stage.style.setProperty('--gaze-y', `${gy.toFixed(2)}px`);
        requestAnimationFrame(tick);
    }

    tick();
}

function initDigitalEyeMotion() {
    const shell = document.querySelector('.companion-shell');
    if (!shell || shell.dataset.eyeMotion === 'true') return;

    shell.dataset.eyeMotion = 'true';
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;
    let lastPointerMove = 0;

    function setTargetFromPoint(clientX, clientY) {
        const rect = shell.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.42;
        targetX = Math.max(-1, Math.min(1, (clientX - centerX) / (rect.width * 0.5)));
        targetY = Math.max(-1, Math.min(1, (clientY - centerY) / (rect.height * 0.35)));
        lastPointerMove = Date.now();
    }

    window.addEventListener('pointermove', (event) => {
        setTargetFromPoint(event.clientX, event.clientY);
    }, { passive: true });

    function tick() {
        if (Date.now() - lastPointerMove > 2600) {
            const t = Date.now() / 1000;
            targetX = Math.sin(t * 0.7) * 0.34;
            targetY = Math.sin(t * 0.45) * 0.16;
        }

        currentX += (targetX - currentX) * 0.08;
        currentY += (targetY - currentY) * 0.08;
        shell.style.setProperty('--eye-x', currentX.toFixed(3));
        shell.style.setProperty('--eye-y', currentY.toFixed(3));
        requestAnimationFrame(tick);
    }

    tick();
}

function injectAiControlDeck() {
    if (document.getElementById('aiControlDeck')) return;

    const deck = document.createElement('aside');
    deck.className = 'ai-control-deck';
    deck.id = 'aiControlDeck';
    deck.innerHTML = `
        <div class="control-orb">
            <img src="xiaoyu-ip.jpg?v=20260531-ip-v1" alt="小毓 AI 中控头像">
            <span class="orb-status"></span>
        </div>
        <div class="control-body">
            <div class="control-kicker">AI CONTROL</div>
            <div class="control-title">数字人中控已接管</div>
            <div class="control-subtitle" id="controlSubtitle">正在等待你的指令</div>
            <div class="control-commands">
                <button data-page="works"><i class="fas fa-layer-group"></i><span>项目</span></button>
                <button data-page="skills"><i class="fas fa-route"></i><span>工作流</span></button>
                <button data-page="prompts"><i class="fas fa-terminal"></i><span>Prompt</span></button>
                <button data-page="diary"><i class="fas fa-flask"></i><span>实验</span></button>
            </div>
        </div>
    `;
    document.body.appendChild(deck);

    deck.querySelectorAll('[data-page]').forEach(btn => {
        btn.addEventListener('click', () => {
            const page = btn.dataset.page;
            const label = btn.textContent.trim();
            const subtitle = document.getElementById('controlSubtitle');
            if (subtitle) subtitle.textContent = `正在调度「${label}」模块`;
            navigateTo(page);
        });
    });
}

async function fetchData() {
    try {
        const res = await fetch(`${API_URL}/data?t=${Date.now()}`);
        const data = await res.json();
        siteData = data;
        console.log('Diary links:');
        (data.diary || []).forEach((e, i) => console.log(`  [${i}] ${e.title?.substring(0, 30)} -> ${(e.link || '').substring(0, 60)}`));

        renderWorks(data.projects || []);
        renderArticles(data.articles || []);
        renderSkills(data.skills || []);
        renderPrompts(data.prompts || []);
        renderDiary(data.diary || []);
        renderComputing(data.computing || []);
        renderFooterContact(data.settings || {});

        if (data.settings) {
            if (data.settings.backgroundMusic) {
                bgMusic.src = data.settings.backgroundMusic;
            }
        }
    } catch (err) {
        console.error('Failed to fetch data:', err);
    }
}

function renderWorks(projects) {
    const gallery = document.getElementById('worksGallery');
    const dots = document.getElementById('galleryDots');
    if (!gallery) return;

    if (projects.length === 0) {
        gallery.innerHTML = '<div class="empty-state"><i class="fas fa-rocket"></i><p>作品正在建设中...</p></div>';
        if (dots) dots.innerHTML = '';
        return;
    }

    gallery.innerHTML = projects.map(p => `
        <a href="${p.link || '#'}" class="work-card" target="_blank">
            <div class="work-card-image">
                ${p.iconUrl
                    ? (p.iconUrl.startsWith('data:') || p.iconUrl.startsWith('http')
                        ? `<img src="${p.iconUrl}" alt="${p.title}">`
                        : `<img src="${p.iconUrl}" alt="${p.title}">`)
                    : '<i class="fas fa-layer-group"></i>'}
            </div>
            <div class="work-card-body">
                <h3>${p.title}</h3>
                <p>${p.description || ''}</p>
                ${p.category ? `<span class="work-card-tag">${p.category}</span>` : ''}
            </div>
        </a>
    `).join('');

    if (dots) {
        dots.innerHTML = projects.map((_, i) =>
            `<span class="gallery-dot${i === 0 ? ' active' : ''}" data-index="${i}"></span>`
        ).join('');
    }

    initGallery();
}

function initGallery() {
    const gallery = document.getElementById('worksGallery');
    const dots = document.querySelectorAll('.gallery-dot');
    const prevBtn = document.getElementById('galleryPrev');
    const nextBtn = document.getElementById('galleryNext');
    if (!gallery) return;

    const cardWidth = () => {
        const card = gallery.querySelector('.work-card');
        return card ? card.offsetWidth + 24 : 424;
    };

    const updateDots = () => {
        const scrollLeft = gallery.scrollLeft;
        const w = cardWidth();
        const index = Math.round(scrollLeft / w);
        dots.forEach((d, i) => d.classList.toggle('active', i === index));
    };

    gallery.addEventListener('scroll', updateDots);

    let isDragging = false;
    let startX = 0;

    gallery.addEventListener('mousedown', (e) => {
        isDragging = false;
        startX = e.clientX;
    });

    gallery.addEventListener('mousemove', (e) => {
        if (Math.abs(e.clientX - startX) > 5) isDragging = true;
    });

    gallery.addEventListener('click', (e) => {
        if (isDragging) {
            e.preventDefault();
            e.stopPropagation();
        }
    }, true);

    prevBtn?.addEventListener('click', () => {
        gallery.scrollBy({ left: -cardWidth() - 24, behavior: 'smooth' });
    });

    nextBtn?.addEventListener('click', () => {
        gallery.scrollBy({ left: cardWidth() + 24, behavior: 'smooth' });
    });

    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const index = parseInt(dot.dataset.index);
            gallery.scrollTo({ left: index * (cardWidth() + 24), behavior: 'smooth' });
        });
    });
}

function renderArticles(articles) {
    const grid = document.getElementById('articlesGrid');
    if (!grid) return;

    if (articles.length === 0) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-pen-nib"></i><p>文章正在撰写中...</p></div>';
        return;
    }

    grid.innerHTML = articles.map((a) => `
        <div class="article-card" onclick="window.open('${a.link || '#'}', '_blank')">
            <div class="article-card-top">
                <span class="article-tag">${a.category || '思考札记'}</span>
                <span class="article-date">${a.date || ''}</span>
            </div>
            <h3>${a.title}</h3>
            <p>${a.summary || a.description || ''}</p>
            <div class="article-meta">
                <span>阅读全文</span>
                <i class="fas fa-arrow-right"></i>
            </div>
        </div>
    `).join('');
}

function renderSkills(skills) {
    const container = document.getElementById('skillsContainer');
    if (!container) return;

    const skillLinks = [
        {
            title: 'Skill',
            tag: 'AI ABILITY',
            description: '\u6c89\u6dc0\u53ef\u590d\u7528\u7684 AI \u80fd\u529b\u3001\u63d0\u793a\u8bcd\u65b9\u6cd5\u548c\u5b9e\u6218\u6280\u80fd\uff0c\u8ba9\u7ecf\u9a8c\u53d8\u6210\u4e0b\u4e00\u6b21\u53ef\u4ee5\u76f4\u63a5\u8c03\u7528\u7684\u5de5\u5177\u7bb1\u3002',
            href: 'https://xnqfxp3scj.feishu.cn/wiki/PNSIw0aOPiuuDdkGF5XcFWFDnJ4?from=from_copylink',
            icon: 'fa-wand-magic-sparkles',
            accent: 'skill'
        },
        {
            title: 'MCP',
            tag: 'MODEL CONTEXT',
            description: '汇总可连接工具、数据和服务的 MCP 能力，让 AI 不只会回答，也能进入真实系统完成动作。',
            href: 'https://xnqfxp3scj.feishu.cn/wiki/P9zRwovXHiDAXhkSTSeclxAjnOc?from=from_copylink',
            icon: 'fa-plug-circle-bolt',
            accent: 'mcp'
        },
        {
            title: '\u5de5\u4f5c\u6d41',
            tag: 'WORKFLOW',
            description: '\u6574\u7406\u4ece\u60f3\u6cd5\u3001\u5185\u5bb9\u751f\u4ea7\u3001\u534f\u4f5c\u5230\u4ea4\u4ed8\u7684\u6d41\u7a0b\uff0c\u628a\u590d\u6742\u4efb\u52a1\u62c6\u6210\u53ef\u6267\u884c\u3001\u53ef\u590d\u76d8\u7684\u8def\u5f84\u3002',
            href: 'https://xnqfxp3scj.feishu.cn/wiki/JS8bwgSkHiCEIJkbQuacvAs2ngh?from=from_copylink',
            icon: 'fa-route',
            accent: 'workflow'
        }
    ];

    container.innerHTML = skillLinks.map(item => `
        <a class="skill-link-card ${item.accent}" href="${item.href}" target="_blank" rel="noopener">
            <div class="skill-link-top">
                <span class="skill-link-icon"><i class="fas ${item.icon}"></i></span>
                <span class="skill-link-tag">${item.tag}</span>
            </div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
            <div class="skill-link-meta">
                <span>\u6253\u5f00\u98de\u4e66\u77e5\u8bc6\u5e93</span>
                <i class="fas fa-arrow-up-right-from-square"></i>
            </div>
        </a>
    `).join('');
}

let promptDetailItems = [];

const promptCategoryPresets = ['职场提效', '视觉生成', '编程助手', '思维框架', '商业策略', '知识解构', '提示优化', '专家角色'];

const promptCategoryCards = [
    {
        title: '职场提效',
        key: 'promptLinkWorkplace',
        icon: 'fa-briefcase',
        desc: '周报、公文、汇报、通知和日常办公写作。',
        tone: 'mint'
    },
    {
        title: '视觉生成',
        key: 'promptLinkVisual',
        icon: 'fa-wand-magic-sparkles',
        desc: '图片、海报、分镜和视觉创意生成。',
        tone: 'cyan'
    },
    {
        title: '编程助手',
        key: 'promptLinkCoding',
        icon: 'fa-code',
        desc: '开发、调试、架构和代码协作提示词。',
        tone: 'blue'
    },
    {
        title: '思维框架',
        key: 'promptLinkThinking',
        icon: 'fa-diagram-project',
        desc: '拆解问题、结构化思考和决策分析。',
        tone: 'violet'
    },
    {
        title: '商业策略',
        key: 'promptLinkBusiness',
        icon: 'fa-chart-line',
        desc: '产品、运营、增长和商业模型推演。',
        tone: 'gold'
    },
    {
        title: '知识解构',
        key: 'promptLinkKnowledge',
        icon: 'fa-book-open',
        desc: '学习、提炼、解释和知识体系整理。',
        tone: 'green'
    },
    {
        title: '提示优化',
        key: 'promptLinkOptimization',
        icon: 'fa-sliders',
        desc: '改写、压缩、增强和评估 Prompt。',
        tone: 'rose'
    },
    {
        title: '专家角色',
        key: 'promptLinkExpert',
        icon: 'fa-user-tie',
        desc: '把 AI 设定成稳定可用的专业角色。',
        tone: 'silver'
    }
];

function renderPromptCategoryCards(items) {
    const settings = siteData.settings || {};

    return `
        <div class="prompt-category-grid">
            ${promptCategoryCards.map(card => {
                const link = String(settings[card.key] || '').trim();
                const hasLink = /^https?:\/\//i.test(link);
                const attrs = hasLink
                    ? `href="${escapeAdminText(link)}" target="_blank" rel="noopener"`
                    : `type="button" data-prompt-category-card="${escapeAdminText(card.title)}"`;
                const tag = hasLink ? 'a' : 'button';

                return `
                    <${tag} class="prompt-category-card ${card.tone}" ${attrs}>
                        <span class="prompt-category-icon"><i class="fas ${card.icon}"></i></span>
                        <strong>${card.title}</strong>
                        <small>${card.desc}</small>
                    </${tag}>
                `;
            }).join('')}
        </div>
    `;
}

function cleanPromptSummaryLine(line) {
    const value = String(line || '')
        .replace(/```+/g, '')
        .replace(/^#{1,6}\s*/, '')
        .replace(/^[-*\d.\s]+/, '')
        .replace(/\*\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    return value.replace(/^(\u6838\u5fc3\u4e3b\u9898|\u7528\u6237\u610f\u56fe|\u5185\u5bb9\u7279\u70b9|\u9002\u7528\u573a\u666f|\u4f18\u5316\u65b9\u5411|\u6269\u5c55\u5efa\u8bae|\u4e3b\u9898)[:\uff1a]\s*/, '');
}

function isPromptStructureLine(line) {
    const label = String(line || '').replace(/[:\uff1a]$/, '');
    const structureLabels = [
        '\u89d2\u8272', '\u4efb\u52a1', '\u6280\u80fd', '\u8981\u6c42', '\u529f\u80fd', '\u5bf9\u8bdd',
        '\u9700\u6c42\u786e\u8ba4', '\u5de5\u4f5c\u6d41\u7a0b', '\u8f93\u51fa\u683c\u5f0f', '\u521d\u59cb',
        '\u8d28\u91cf\u6807\u51c6', '\u4f7f\u7528\u5efa\u8bae', '\u9002\u7528\u573a\u666f', '\u4f18\u5316\u65b9\u5411',
        '\u6269\u5c55\u5efa\u8bae', '\u5e38\u7528\u8bcd\u7ec4', '\u5e38\u7528\u77ed\u8bed', '\u5e38\u7528\u52a8\u8bcd',
        '\u5e38\u7528\u540d\u8bcd', '\u5e38\u7528\u5f62\u5bb9\u8bcd', '\u5e38\u7528\u526f\u8bcd',
        '\u751f\u6210\u7684\u63d0\u793a\u8bcd', '\u6838\u5fc3\u4e3b\u9898', '\u7528\u6237\u610f\u56fe',
        '\u5185\u5bb9\u7279\u70b9', '\u4e3b\u9898'
    ];

    return structureLabels.includes(label)
        || /^\[[^\]]+\]$/.test(line)
        || /^[`=\-_*#\s]+$/.test(line);
}

function summarizePromptContent(content) {
    const normalized = String(content || '')
        .replace(/\r/g, '\n')
        .replace(/\\n/g, '\n');

    const lines = normalized
        .split('\n')
        .map(cleanPromptSummaryLine)
        .filter(line => line.length >= 6 && !isPromptStructureLine(line));

    const meaningKeywords = [
        '\u4f60\u662f', '\u4f60\u7684\u4efb\u52a1', '\u4efb\u52a1\u662f', '\u5e2e\u52a9\u7528\u6237',
        '\u751f\u6210', '\u64b0\u5199', '\u5206\u6790', '\u603b\u7ed3', '\u9002\u7528\u4e8e',
        '\u7528\u4e8e', '\u76ee\u6807'
    ];
    const preferred = lines.find(line => meaningKeywords.some(keyword => line.includes(keyword))) || lines[0] || '';
    const supporting = lines.find(line => line !== preferred && line.length >= 12) || '';
    const summary = [preferred, supporting]
        .filter(Boolean)
        .join(' ')
        .replace(/\s+/g, ' ')
        .trim();

    if (!summary) return '';
    return summary.length > 92 ? `${summary.slice(0, 92)}...` : summary;
}

function getPromptIntro(prompt) {
    const intro = String(prompt.intro || prompt.summary || '').trim();
    const contentIntro = summarizePromptContent(prompt.content || '');

    if (intro) return intro;
    if (contentIntro) return contentIntro;

    return '\u8fd9\u6761 Prompt \u8fd8\u6ca1\u6709\u586b\u5199\u6b63\u6587\uff0c\u5b8c\u5584\u5185\u5bb9\u540e\u4f1a\u81ea\u52a8\u751f\u6210\u66f4\u8d34\u5408\u7528\u9014\u7684\u7b80\u4ecb\u3002';
}

function getPromptSearchText(prompt) {
    const intro = getPromptIntro(prompt);
    return `${prompt.title || ''} ${prompt.category || ''} ${intro} ${prompt.content || ''}`.toLowerCase();
}

function renderPromptActions(prompt, index, label = '复制') {
    const content = String(prompt.content || '');
    const encodedContent = escapeAdminText(encodeURIComponent(content));
    const link = String(prompt.link || '').trim();
    const hasLink = /^https?:\/\//i.test(link);
    const safeLink = escapeAdminText(link);

    return `
        <div class="prompt-action-row">
            <button class="btn-copy" data-prompt-copy="${encodedContent}" title="复制提示词">
                <i class="fas fa-copy"></i> ${label}
            </button>
            <button class="btn-prompt-detail" data-prompt-detail="${index}" title="查看详情">
                <i class="fas fa-up-right-and-down-left-from-center"></i> 查看详情
            </button>
            ${hasLink ? `<a class="btn-prompt-link" href="${safeLink}" target="_blank" rel="noopener" title="打开原文"><i class="fas fa-arrow-up-right-from-square"></i> 原文</a>` : ''}
        </div>
    `;
}

function renderPromptCard(prompt, index) {
    const title = escapeAdminText(prompt.title || '未命名提示词');
    const category = escapeAdminText(prompt.category || '未分类');
    const intro = escapeAdminText(getPromptIntro(prompt));
    const searchText = escapeAdminText(getPromptSearchText(prompt));

    return `
        <article class="prompt-card" data-prompt-item data-prompt-card data-category="${category}" data-search="${searchText}">
            <div class="prompt-card-meta">
                <span class="prompt-index">P${String(index + 1).padStart(2, '0')}</span>
                <span class="prompt-tag">${category}</span>
            </div>
            <div class="prompt-header">
                <h3>${title}</h3>
            </div>
            <div class="prompt-card-summary">
                <p class="prompt-card-line">${intro}</p>
            </div>
            ${renderPromptActions(prompt, index, '复制')}
        </article>
    `;
}

function renderPrompts(prompts) {
    const grid = document.getElementById('promptsGrid');
    if (!grid) return;

    const items = Array.isArray(prompts) ? prompts : [];
    promptDetailItems = items;

    grid.innerHTML = `
        <div class="prompt-board prompt-category-only">
            ${renderPromptCategoryCards(items)}
        </div>
    `;
}

function initPromptControls(grid) {
    const search = grid.querySelector('#promptSearch');
    const filters = grid.querySelectorAll('[data-prompt-filter]');
    const items = grid.querySelectorAll('[data-prompt-item]');
    const cards = grid.querySelectorAll('[data-prompt-card]');
    const count = grid.querySelector('#promptCount');
    const empty = grid.querySelector('#promptFilterEmpty');
    const panel = document.getElementById('promptDetailPanel');
    const backdrop = document.getElementById('promptDetailBackdrop');
    let activeCategory = '';

    const updateList = () => {
        const keyword = (search?.value || '').trim().toLowerCase();
        let visibleCards = 0;

        items.forEach(item => {
            const categoryMatched = !activeCategory || item.dataset.category === activeCategory;
            const textMatched = !keyword || (item.dataset.search || '').includes(keyword);
            const visible = categoryMatched && textMatched;
            item.hidden = !visible;
            if (visible && item.matches('[data-prompt-card]')) visibleCards += 1;
        });

        if (count) count.textContent = `显示 ${visibleCards} / ${cards.length} 条 Prompt`;
        if (empty) empty.classList.toggle('show', visibleCards === 0);
    };

    search?.addEventListener('input', updateList);
    grid.querySelectorAll('[data-prompt-category-card]').forEach(btn => {
        btn.addEventListener('click', () => {
            activeCategory = btn.dataset.promptCategoryCard || '';
            filters.forEach(item => item.classList.toggle('active', item.dataset.promptFilter === activeCategory));
            updateList();
        });
    });

    filters.forEach(btn => {
        btn.addEventListener('click', () => {
            const nextCategory = btn.dataset.promptFilter || '';
            activeCategory = activeCategory === nextCategory ? '' : nextCategory;
            filters.forEach(item => item.classList.toggle('active', item.dataset.promptFilter === activeCategory));
            updateList();
        });
    });

    grid.querySelectorAll('[data-prompt-copy]').forEach(btn => {
        btn.addEventListener('click', () => {
            copyPrompt(btn, decodeURIComponent(btn.dataset.promptCopy || ''));
        });
    });

    const closeDetail = () => {
        panel?.classList.remove('open');
        backdrop?.classList.remove('show');
        panel?.setAttribute('aria-hidden', 'true');
    };

    const openDetail = (index) => {
        const prompt = promptDetailItems[Number(index)];
        if (!prompt || !panel) return;
        const intro = getPromptIntro(prompt);
        const link = String(prompt.link || '').trim();
        const hasLink = /^https?:\/\//i.test(link);

        panel.querySelector('[data-detail-category]').textContent = prompt.category || '未分类';
        panel.querySelector('[data-detail-title]').textContent = prompt.title || '未命名提示词';
        panel.querySelector('[data-detail-intro]').textContent = intro;
        panel.querySelector('[data-detail-content]').textContent = prompt.content || '';
        panel.querySelector('[data-detail-copy]').dataset.promptCopy = encodeURIComponent(prompt.content || '');

        const linkEl = panel.querySelector('[data-detail-link]');
        if (linkEl) {
            linkEl.href = hasLink ? link : '#';
            linkEl.hidden = !hasLink;
        }

        panel.classList.add('open');
        backdrop?.classList.add('show');
        panel.setAttribute('aria-hidden', 'false');
    };

    grid.parentElement?.querySelectorAll('[data-prompt-detail]').forEach(btn => {
        btn.addEventListener('click', () => openDetail(btn.dataset.promptDetail));
    });

    panel?.querySelector('[data-detail-copy]')?.addEventListener('click', (event) => {
        const btn = event.currentTarget;
        copyPrompt(btn, decodeURIComponent(btn.dataset.promptCopy || ''));
    });

    panel?.querySelector('[data-prompt-detail-close]')?.addEventListener('click', closeDetail);
    backdrop?.addEventListener('click', closeDetail);
}

function copyPrompt(btn, text) {
    const copyTask = navigator.clipboard?.writeText
        ? navigator.clipboard.writeText(text)
        : Promise.reject();

    copyTask.then(() => {
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> 复制';
            btn.classList.remove('copied');
        }, 2000);
    }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        btn.innerHTML = '<i class="fas fa-check"></i> 已复制';
        btn.classList.add('copied');
        setTimeout(() => {
            btn.innerHTML = '<i class="fas fa-copy"></i> 复制';
            btn.classList.remove('copied');
        }, 2000);
    });
}

function renderDiary(entries) {
    const timeline = document.getElementById('diaryTimeline');
    if (!timeline) return;

    if (entries.length === 0) {
        timeline.innerHTML = '<div class="empty-state"><i class="fas fa-fish"></i><p>养虾日记即将开始记录...</p></div>';
        return;
    }

    timeline.innerHTML = entries.map(e => `
        <a href="${e.link || 'https://mp.weixin.qq.com/mp/appmsgalbum?__biz=Mzk0OTUwNjM0OQ==&action=getalbum&album_id=4519584288459407364#wechat_redirect'}" target="_blank" class="diary-entry" style="text-decoration: none; color: inherit;">
            <div class="diary-date">${e.date || ''}</div>
            <div class="diary-dot"></div>
            <div class="diary-card">
                ${e.image ? `<img src="${e.image}" alt="${e.title}">` : ''}
                <div class="diary-card-body">
                    <h3>${e.title}</h3>
                    <p>${e.content || ''}</p>
                </div>
            </div>
        </a>
    `).join('');
}

function renderComputing(items) {
    const dashboard = document.getElementById('computingDashboard');
    if (!dashboard) return;

    if (items.length === 0) {
        items = [
            {
                name: '钟毓算力控制台',
                spec: 'AI 推理 · 智能体实验 · 工作流部署',
                status: '在线',
                link: 'https://api.qixiaoyu.com'
            },
            {
                name: 'AI 实验环境',
                spec: '适合短剧生成、Prompt 测试和自动化任务',
                status: '运行中',
                link: 'https://api.qixiaoyu.com'
            }
        ];
    }

    dashboard.innerHTML = items.map(c => `
        <a href="${c.link || '#'}" class="compute-card" target="_blank" style="text-decoration: none; color: inherit; cursor: pointer;">
            <div class="compute-icon"><i class="fas fa-microchip"></i></div>
            <h3>${c.name}</h3>
            <div class="compute-spec">${c.spec || ''}</div>
            <span class="compute-status ${c.status === '运行中' || c.status === '在线' ? 'status-online' : 'status-offline'}">
                <span class="status-dot"></span>
                ${c.status || '未知'}
            </span>
            ${c.link ? '<div style="margin-top: 12px; font-size: 0.75rem; color: var(--text-tertiary);"><i class="fas fa-external-link-alt"></i> api.qixiaoyu.com</div>' : ''}
        </a>
    `).join('');
}

function renderFooterContact(settings) {
    const container = document.getElementById('footerContact');
    if (!container) return;

    container.innerHTML = `
        <span>${settings.contactEmail || ''}</span>
        <span>${settings.contactHandle || '毓见Agent'}</span>
    `;
}

/* ========================================
   CONTENT ADMIN
   ======================================== */

const adminTypes = [
    {
        key: 'projects',
        label: '作品',
        endpoint: 'projects',
        titleKey: 'title',
        subtitleKey: 'description',
        multipart: true,
        fields: [
            { name: 'title', label: '作品标题', required: true },
            { name: 'category', label: '分类' },
            { name: 'link', label: '链接' },
            { name: 'icon', label: '封面/图标', type: 'file' },
            { name: 'description', label: '作品介绍', type: 'textarea', full: true }
        ]
    },
    {
        key: 'articles',
        label: '文章',
        endpoint: 'articles',
        titleKey: 'title',
        subtitleKey: 'summary',
        fields: [
            { name: 'title', label: '文章标题', required: true },
            { name: 'category', label: '分类' },
            { name: 'date', label: '日期', type: 'date' },
            { name: 'link', label: '链接' },
            { name: 'summary', label: '摘要', type: 'textarea', full: true }
        ]
    },
    {
        key: 'skills',
        label: '技能',
        endpoint: 'skills',
        titleKey: 'name',
        subtitleKey: 'category',
        fields: [
            { name: 'name', label: '技能名称', required: true },
            { name: 'category', label: '技能分类', placeholder: '例如：AI 工作流' },
            { name: 'level', label: '熟练度 0-100', type: 'number', value: '80' },
            { name: 'description', label: '说明', type: 'textarea', full: true }
        ]
    },
    {
        key: 'promptLinks',
        label: '提示词',
        endpoint: 'settings',
        settingsSource: true,
        fields: promptCategoryCards.map(card => ({
            name: card.key,
            label: `${card.title} 飞书链接`,
            placeholder: 'https://...'
        }))
    },
    {
        key: 'diary',
        label: '养虾日记',
        endpoint: 'diary',
        titleKey: 'title',
        subtitleKey: 'date',
        fields: [
            { name: 'title', label: '日记标题', required: true },
            { name: 'date', label: '日期', type: 'date' },
            { name: 'link', label: '外部链接' },
            { name: 'image', label: '图片地址' },
            { name: 'content', label: '日记内容', type: 'textarea', full: true }
        ]
    },
    {
        key: 'music',
        label: '音乐',
        endpoint: 'upload/music',
        multipart: true,
        fields: [
            { name: 'file', label: '背景音乐文件', type: 'file', required: true, full: true }
        ]
    }
];

let activeAdminType = adminTypes[0].key;

function escapeAdminText(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function getAdminPassword() {
    return sessionStorage.getItem('qiyuAdminPassword') || '';
}

function setAdminState(isAuthed) {
    const login = document.getElementById('adminLogin');
    const workspace = document.getElementById('adminWorkspace');
    login?.classList.toggle('hidden', isAuthed);
    workspace?.classList.toggle('open', isAuthed);
    if (isAuthed) {
        renderAdminTabs();
        renderAdminEditor();
        renderAdminList();
    }
}

function renderAdminTabs() {
    const tabs = document.getElementById('adminTabs');
    if (!tabs) return;

    tabs.innerHTML = adminTypes.map(type => `
        <button type="button" class="admin-tab${type.key === activeAdminType ? ' active' : ''}" data-admin-type="${type.key}">
            ${type.label}
        </button>
    `).join('');
}

function renderAdminEditor() {
    const form = document.getElementById('adminEditor');
    const type = adminTypes.find(item => item.key === activeAdminType);
    if (!form || !type) return;

    const fields = type.fields.map(field => {
        const inputId = `admin-${type.key}-${field.name}`;
        const common = `id="${inputId}" name="${field.name}" ${field.required ? 'required' : ''}`;
        const placeholder = field.placeholder ? `placeholder="${escapeAdminText(field.placeholder)}"` : '';
        const fieldValue = type.settingsSource ? siteData.settings?.[field.name] : field.value;
        const value = fieldValue ? `value="${escapeAdminText(fieldValue)}"` : '';
        const control = field.type === 'textarea'
            ? `<textarea ${common} ${placeholder}></textarea>`
            : field.type === 'select'
                ? `<select ${common}>
                    <option value="">请选择${escapeAdminText(field.label)}</option>
                    ${(field.options || []).map(option => `<option value="${escapeAdminText(option)}">${escapeAdminText(option)}</option>`).join('')}
                </select>`
                : `<input ${common} type="${field.type || 'text'}" ${placeholder} ${value}>`;

        return `
            <div class="admin-field${field.full ? ' full' : ''}">
                <label for="${inputId}">${field.label}</label>
                ${control}
            </div>
        `;
    }).join('');

    form.innerHTML = `
        ${fields}
        <button class="admin-submit" type="submit">${type.settingsSource ? '保存链接' : `添加${type.label}`}</button>
        <p class="admin-message full" id="adminEditorMessage"></p>
    `;
}

function renderAdminList() {
    const list = document.getElementById('adminList');
    const type = adminTypes.find(item => item.key === activeAdminType);
    if (!list || !type) return;

    if (type.key === 'music') {
        const currentMusic = siteData.settings?.backgroundMusic || '未设置';
        list.innerHTML = `
            <div class="admin-list-title">当前背景音乐</div>
            <div class="admin-list-item">
                <div>
                    <strong>${escapeAdminText(currentMusic)}</strong>
                    <span>上传新文件后会自动替换当前背景音乐</span>
                </div>
            </div>
        `;
        return;
    }

    const items = Array.isArray(siteData[type.key]) ? siteData[type.key] : [];
    if (type.key === 'prompts' && items.length > 0) {
        list.innerHTML = `
            <div class="admin-list-title">已有${type.label}</div>
            ${items.map(item => {
                const itemId = escapeAdminText(item.id);
                const title = escapeAdminText(item.title || '未命名提示词');
                const category = escapeAdminText(item.category || '未分类');
                const promptIntro = escapeAdminText(item.intro || '');

                return `
                    <div class="admin-list-item admin-list-item-prompt">
                        <div class="admin-list-main">
                            <strong>${title}</strong>
                            <span>${category}</span>
                        </div>
                        <label class="admin-inline-intro">
                            <span>简介</span>
                            <input type="text" value="${promptIntro}" placeholder="一句话说明这个提示词能解决什么问题" data-prompt-intro-input="${itemId}">
                        </label>
                        <button class="admin-save-intro" type="button" data-prompt-intro-save="${itemId}">保存简介</button>
                        <button class="admin-delete" type="button" data-delete-type="${type.key}" data-delete-id="${itemId}">
                            删除
                        </button>
                    </div>
                `;
            }).join('')}
        `;
        return;
    }

    if (type.settingsSource) {
        list.innerHTML = `
            <div class="admin-list-title">说明</div>
            <div class="admin-list-item">
                <div>
                    <strong>提示词分类卡片链接</strong>
                    <span>为空时，前台点击卡片会筛选对应分类；填写飞书链接后，点击卡片会直接打开链接。</span>
                </div>
            </div>
        `;
        return;
    }

    if (items.length === 0) {
        list.innerHTML = `
            <div class="admin-list-title">已有${type.label}</div>
            <div class="empty-state"><i class="fas fa-inbox"></i><p>还没有内容</p></div>
        `;
        return;
    }

    list.innerHTML = `
        <div class="admin-list-title">已有${type.label}</div>
        ${items.map(item => `
            <div class="admin-list-item">
                <div>
                    <strong>${escapeAdminText(item[type.titleKey] || item.title || item.name || '未命名')}</strong>
                    <span>${escapeAdminText(item[type.subtitleKey] || item.category || item.link || '')}</span>
                </div>
                <button class="admin-delete" type="button" data-delete-type="${type.key}" data-delete-id="${item.id}">
                    删除
                </button>
            </div>
        `).join('')}
    `;
}

async function submitAdminEditor(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.getElementById('adminEditorMessage');
    const type = adminTypes.find(item => item.key === activeAdminType);
    if (!type) return;

    const password = getAdminPassword();
    const headers = { 'X-Admin-Password': password };
    let body;

    if (type.multipart) {
        body = new FormData(form);
    } else {
        headers['Content-Type'] = 'application/json';
        body = JSON.stringify(Object.fromEntries(new FormData(form).entries()));
    }

    if (message) message.textContent = '正在保存...';

    try {
        const res = await fetch(`${API_URL}/${type.endpoint}`, {
            method: 'POST',
            headers,
            body
        });
        if (!res.ok) throw new Error(res.status === 401 ? '密码已失效，请重新登录。' : '保存失败。');
        if (!type.settingsSource) form.reset();
        await fetchData();
        renderAdminEditor();
        renderAdminList();
        if (type.key === 'music' && siteData.settings?.backgroundMusic) {
            bgMusic.src = siteData.settings.backgroundMusic;
        }
        if (message) message.textContent = '已保存。';
    } catch (error) {
        if (message) message.textContent = error.message;
    }
}

async function deleteAdminItem(typeKey, id) {
    const type = adminTypes.find(item => item.key === typeKey);
    if (!type || !id) return;
    if (!window.confirm(`确定删除这条${type.label}吗？`)) return;

    const res = await fetch(`${API_URL}/${type.endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'X-Admin-Password': getAdminPassword() }
    });
    if (!res.ok) {
        alert('删除失败，请重新登录后再试。');
        return;
    }
    await fetchData();
    renderAdminList();
}

async function updatePromptIntro(id, btn) {
    const input = document.querySelector(`[data-prompt-intro-input="${CSS.escape(String(id))}"]`);
    if (!input) return;

    const originalText = btn?.textContent || '保存简介';
    if (btn) {
        btn.disabled = true;
        btn.textContent = '保存中...';
    }

    try {
        const res = await fetch(`${API_URL}/prompts/${id}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': getAdminPassword()
            },
            body: JSON.stringify({ intro: input.value.trim() })
        });

        if (!res.ok) throw new Error(res.status === 401 ? '请重新登录后再保存。' : '简介保存失败。');
        await fetchData();
        renderAdminList();
    } catch (error) {
        alert(error.message || '简介保存失败。');
        if (btn) {
            btn.disabled = false;
            btn.textContent = originalText;
        }
    }
}

async function syncAdminToGithub() {
    const btn = document.getElementById('adminSyncBtn');
    const message = document.getElementById('adminSyncMessage');
    if (!btn) return;

    btn.disabled = true;
    if (message) message.textContent = '正在同步到 GitHub...';

    try {
        const res = await fetch(`${API_URL}/deploy`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Admin-Password': getAdminPassword()
            },
            body: JSON.stringify({})
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || data.message || '同步失败。');
        if (message) message.textContent = data.message || '同步成功。';
    } catch (error) {
        if (message) message.textContent = error.message || '同步失败。';
    } finally {
        btn.disabled = false;
    }
}

function initAdminPanel() {
    const backdrop = document.getElementById('adminBackdrop');
    const openBtn = document.getElementById('adminOpenBtn');
    const closeBtn = document.getElementById('adminCloseBtn');
    const login = document.getElementById('adminLogin');
    const passwordInput = document.getElementById('adminPassword');
    const loginMessage = document.getElementById('adminLoginMessage');
    const editor = document.getElementById('adminEditor');
    const tabs = document.getElementById('adminTabs');
    const list = document.getElementById('adminList');
    const syncBtn = document.getElementById('adminSyncBtn');

    openBtn?.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();
        backdrop?.classList.add('open');
        backdrop?.setAttribute('aria-hidden', 'false');
        setAdminState(Boolean(getAdminPassword()));
        if (!getAdminPassword()) setTimeout(() => passwordInput?.focus(), 50);
    });

    closeBtn?.addEventListener('click', () => {
        backdrop?.classList.remove('open');
        backdrop?.setAttribute('aria-hidden', 'true');
    });

    backdrop?.addEventListener('click', (event) => {
        if (event.target === backdrop) {
            backdrop.classList.remove('open');
            backdrop.setAttribute('aria-hidden', 'true');
        }
    });

    login?.addEventListener('submit', async (event) => {
        event.preventDefault();
        const password = passwordInput?.value.trim();
        if (!password) return;

        if (loginMessage) loginMessage.textContent = '正在校验...';
        const res = await fetch(`${API_URL}/verify-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password })
        });

        if (res.ok) {
            sessionStorage.setItem('qiyuAdminPassword', password);
            if (loginMessage) loginMessage.textContent = '';
            setAdminState(true);
        } else if (loginMessage) {
            loginMessage.textContent = '密码不正确。';
        }
    });

    tabs?.addEventListener('click', (event) => {
        const btn = event.target.closest('[data-admin-type]');
        if (!btn) return;
        activeAdminType = btn.dataset.adminType;
        renderAdminTabs();
        renderAdminEditor();
        renderAdminList();
    });

    editor?.addEventListener('submit', submitAdminEditor);
    syncBtn?.addEventListener('click', syncAdminToGithub);

    list?.addEventListener('click', (event) => {
        const saveIntroBtn = event.target.closest('[data-prompt-intro-save]');
        if (saveIntroBtn) {
            updatePromptIntro(saveIntroBtn.dataset.promptIntroSave, saveIntroBtn);
            return;
        }

        const btn = event.target.closest('[data-delete-id]');
        if (!btn) return;
        deleteAdminItem(btn.dataset.deleteType, btn.dataset.deleteId);
    });
}

/* ========================================
   STAR CANVAS
   ======================================== */

(function initStarCanvas() {
    const canvas = document.getElementById('starCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let stars = [];
    let animId;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createStars() {
        const count = Math.floor((canvas.width * canvas.height) / 4000);
        stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.5 + 0.5,
                opacity: Math.random(),
                speed: Math.random() * 0.005 + 0.002,
                direction: Math.random() > 0.5 ? 1 : -1
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        stars.forEach(s => {
            s.opacity += s.speed * s.direction;
            if (s.opacity >= 1) s.direction = -1;
            if (s.opacity <= 0.1) s.direction = 1;

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 255, ${s.opacity * 0.6})`;
            ctx.fill();
        });

        animId = requestAnimationFrame(draw);
    }

    window.addEventListener('resize', () => {
        resize();
        createStars();
    });

    resize();
    createStars();
    draw();
})();

/* ========================================
   PAGE NAVIGATION
   ======================================== */

let currentPage = null;

function navigateTo(pageId) {
    if (currentPage === pageId) return;

    document.querySelectorAll('.section-page').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

    const target = document.getElementById(pageId);
    if (target) target.classList.add('active');

    const navItem = document.querySelector(`.nav-item[href="#${pageId}"]`);
    if (navItem) navItem.classList.add('active');

    currentPage = pageId;
    document.body.dataset.page = pageId;
    if (pageId !== 'home') {
        document.getElementById('chatWindow')?.classList.remove('open');
    }

    const subtitle = document.getElementById('controlSubtitle');
    const pageNames = {
        home: '主页已就绪',
        works: '正在展开项目档案',
        articles: '正在整理文章内容',
        skills: '正在调度工作流模块',
        prompts: '正在打开 Prompt 资源',
        diary: '正在进入现实实验记录',
        computing: '正在打开钟毓算力页面'
    };
    if (subtitle) subtitle.textContent = pageNames[pageId] || '正在切换模块';
    window.scrollTo({ top: 0, behavior: 'instant' });
}

window.navigateTo = navigateTo;

(function initPageNavigation() {
    document.addEventListener('click', (e) => {
        const navItem = e.target.closest('a[href^="#"]');
        if (navItem) {
            const pageId = navItem.getAttribute('href').substring(1);
            if (!pageId) return;
            e.preventDefault();
            navigateTo(pageId);
            return;
        }

        const inlineTarget = e.target.closest('[onclick*="navigateTo"]');
        if (inlineTarget) {
            const match = inlineTarget.getAttribute('onclick')?.match(/navigateTo\('([^']+)'\)/);
            if (match?.[1]) {
                e.preventDefault();
                navigateTo(match[1]);
            }
        }
    });

    const initialPage = window.location.hash?.replace('#', '') || 'home';
    navigateTo(document.getElementById(initialPage) ? initialPage : 'home');
})();

/* ========================================
   SCROLL REVEAL
   ======================================== */

(function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.section-header, .article-card, .skill-category, .prompt-card, .diary-card, .compute-card').forEach(el => {
        el.classList.add('reveal');
        observer.observe(el);
    });
})();

/* ========================================
   CHAT WIDGET
   ======================================== */

(function initChat() {
    const fab = document.getElementById('chatFab');
    const win = document.getElementById('chatWindow');
    const close = document.getElementById('chatClose');
    const input = document.getElementById('chatInput');
    const send = document.getElementById('chatSend');
    const messages = document.getElementById('chatMessages');

    try { localStorage.removeItem('qiyuChatFabPosition'); } catch (e) {}

    fab?.addEventListener('click', () => win?.classList.toggle('open'));
    close?.addEventListener('click', () => win?.classList.remove('open'));

    function addMessage(text, type) {
        if (!messages) return;
        const div = document.createElement('div');
        div.className = `chat-msg ${type}`;
        div.innerHTML = `<div class="msg-content">${text}</div>`;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
    }

    async function sendMessage() {
        if (!input) return;
        const text = input.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        input.value = '';

        try {
            const res = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text })
            });
            const data = await res.json();
            addMessage(data.reply || '正在思考...', 'bot');
        } catch (e) {
            addMessage('网络连接失败，请稍后再试。', 'bot');
        }
    }

    send?.addEventListener('click', sendMessage);
    input?.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });
})();

/* ========================================
   BACKGROUND MUSIC
   ======================================== */

(function initMusic() {
    const btn = document.getElementById('musicBtn');
    btn?.addEventListener('click', () => {
        if (musicPlaying) {
            bgMusic.pause();
            btn.classList.remove('playing');
        } else {
            bgMusic.play().catch(() => {});
            btn.classList.add('playing');
        }
        musicPlaying = !musicPlaying;
    });
})();

/* ========================================
   INIT
   ======================================== */

applyDigitalHumanConcept();
initAdminPanel();
fetchData();
