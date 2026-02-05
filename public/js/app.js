// Use relative path for production (Vercel) compatibility
        const API_URL = '/api';
        
        // Global Settings State to prevent partial updates from resetting other fields
        let globalSettings = {};

        // --- Data Fetching ---
        async function fetchData() {
            try {
                const res = await fetch(`${API_URL}/data`);
                const data = await res.json();
                
                applySettings(data.settings);
                renderProjects(data.projects);
                renderAgents(data.agents);
                renderCertificates(data.certificates);
                renderMedia(data.media);
                renderTools(data.tools);
                renderArticles(data.articles);

                // Render Admin Lists
                renderAdminList('adminProjectsList', data.projects, 'projects');
                renderAdminList('adminAgentsList', data.agents, 'agents');
                renderAdminList('adminCertificatesList', data.certificates, 'certificates');
                
                // Split Media into Videos and Workflow for Admin List
                const videos = (data.media || []).filter(m => m.type === 'video');
                const workflows = (data.media || []).filter(m => m.type === 'image');
                
                renderAdminList('adminVideosList', videos, 'media');
                renderAdminList('adminWorkflowList', workflows, 'media');

                renderAdminList('adminToolsList', data.tools, 'tools');
                renderAdminList('adminArticlesList', data.articles, 'articles');
            } catch (err) {
                console.error('Failed to fetch data:', err);
            }
        }

        // --- New Feature Card Logic ---

        async function updateGlobalSetting(key, value) {
            await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ [key]: value })
            });
            // Update UI immediately
            applySettings({ [key]: value });
        }

        async function uploadCover(type, input) {
            const file = input.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append('file', file);
            
            // Show loading
            const originalLabel = input.previousElementSibling.textContent;
            input.previousElementSibling.textContent = '正在上传...';
            input.disabled = true;

            try {
                const res = await fetch(`${API_URL}/upload/${type}`, { method: 'POST', body: formData });
                const data = await res.json();
                
                // Update UI
                const settingKey = type; // e.g., 'certCover'
                applySettings({ [settingKey]: data.url });
                alert('封面更新成功！');
            } catch (e) {
                console.error(e);
                alert('上传失败');
            } finally {
                input.previousElementSibling.textContent = originalLabel;
                input.disabled = false;
                input.value = ''; // Clear input
            }
        }

        function renderAdminList(elementId, items, type) {
            const container = document.getElementById(elementId);
            if (!container) return;

            if (!items || items.length === 0) {
                container.innerHTML = '<p style="color:var(--text-secondary); font-size:0.8rem;">No items yet.</p>';
                return;
            }

            container.innerHTML = items.map(item => `
                <div class="admin-item">
                    <span class="admin-item-title">${item.title || item.name}</span>
                    <button class="btn-delete" onclick="deleteItem('${type}', ${item.id})">Delete</button>
                </div>
            `).join('');
        }

        async function deleteItem(type, id) {
            if (!confirm('Are you sure you want to delete this item?')) return;
            
            try {
                await fetch(`${API_URL}/${type}/${id}`, { method: 'DELETE' });
                fetchData(); // Refresh all lists
            } catch (err) {
                console.error('Failed to delete:', err);
                alert('Failed to delete item.');
            }
        }

        function applySettings(newSettings) {
            // Merge new settings into global state
            globalSettings = { ...globalSettings, ...newSettings };
            const settings = globalSettings;

            if (settings.backgroundColor) {
                document.documentElement.style.setProperty('--bg-color', settings.backgroundColor);
                const bgInput = document.getElementById('bgColorInput');
                if(bgInput) bgInput.value = settings.backgroundColor;
            }
            if (settings.backgroundImage) {
                document.body.style.backgroundImage = `url(${settings.backgroundImage})`;
            }
            if (settings.backgroundMusic) {
                const audio = document.getElementById('bgMusic');
                const currentSrc = audio.src;
                const newSrc = settings.backgroundMusic;
                if (currentSrc !== newSrc && !currentSrc.endsWith(newSrc)) {
                    audio.src = newSrc;
                    document.getElementById('playerTitle').textContent = "背景音乐";
                }
            }
            
            // --- Feature Cards Settings ---
            
            // Certificates
            document.getElementById('feat-cert-link').href = settings.certLink || '#';
            const inputCert = document.getElementById('settingCertLink');
            if (inputCert && document.activeElement !== inputCert) inputCert.value = settings.certLink || '';

            if (settings.certCover) {
                document.getElementById('feat-cert-bg').style.backgroundImage = `url(${settings.certCover})`;
            } else {
                 // Default fallback gradient if no image
                document.getElementById('feat-cert-bg').style.background = 'linear-gradient(45deg, #1a1a1a, #2d2d2d)';
            }

            // Videos
            document.getElementById('feat-video-link').href = settings.videoLink || '#';
            const inputVideo = document.getElementById('settingVideoLink');
            if (inputVideo && document.activeElement !== inputVideo) inputVideo.value = settings.videoLink || '';

            if (settings.videoCover) {
                document.getElementById('feat-video-bg').style.backgroundImage = `url(${settings.videoCover})`;
            } else {
                document.getElementById('feat-video-bg').style.background = 'linear-gradient(45deg, #1a1a1a, #2d2d2d)';
            }

            // Workflow
            document.getElementById('feat-workflow-link').href = settings.workflowLink || '#';
            const inputWorkflow = document.getElementById('settingWorkflowLink');
            if (inputWorkflow && document.activeElement !== inputWorkflow) inputWorkflow.value = settings.workflowLink || '';

            if (settings.workflowCover) {
                document.getElementById('feat-workflow-bg').style.backgroundImage = `url(${settings.workflowCover})`;
            } else {
                document.getElementById('feat-workflow-bg').style.background = 'linear-gradient(45deg, #1a1a1a, #2d2d2d)';
            }

            // --- Contact Settings ---
            if (settings.contactEmail) {
                const emailEl = document.getElementById('displayEmail');
                if (emailEl) emailEl.textContent = settings.contactEmail;
                const input = document.getElementById('settingEmail');
                if(input && document.activeElement !== input) input.value = settings.contactEmail;
            }
            if (settings.contactHandle) {
                // Update all handle displays
                document.querySelectorAll('.display-handle').forEach(el => {
                    el.textContent = settings.contactHandle;
                });
                // Fallback for ID if it still exists elsewhere
                const handleEl = document.getElementById('displayHandle');
                if (handleEl) handleEl.textContent = settings.contactHandle;

                const input = document.getElementById('settingHandle');
                if(input && document.activeElement !== input) input.value = settings.contactHandle;
            }

            // QRs
            const setQr = (key, displayId, previewId, fallbackText) => {
                const el = document.getElementById(displayId);
                const prev = document.getElementById(previewId);
                if (settings[key]) {
                    if(el) el.src = settings[key];
                    if(prev) prev.src = settings[key];
                } else {
                    // Fallback placeholder
                    const placeholder = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${fallbackText}`;
                    if(el) el.src = placeholder;
                    if(prev) prev.src = placeholder;
                }
            };

            setQr('qrDouyin', 'displayQrDouyin', 'previewQrDouyin', 'Douyin');
            setQr('qrXiaohongshu', 'displayQrRed', 'previewQrRed', 'Xiaohongshu');
            setQr('qrVideoAccount', 'displayQrVideo', 'previewQrVideo', 'WeChatVideo');
        }

        function renderProjects(projects) {
            const html = (projects || []).map(p => `
                <a href="${p.link || '#'}" class="project-card" target="_blank">
                    <div class="project-icon-wrapper">
                         ${p.iconUrl ? `<img src="${p.iconUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : '<i class="fas fa-layer-group"></i>'}
                    </div>
                    <div class="project-info">
                        <h3>${p.title}</h3>
                        <p>${p.description}</p>
                    </div>
                    <span class="category-pill">${p.category}</span>
                </a>
            `).join('');
            
            const worksGrid = document.getElementById('worksGrid');
            if(worksGrid) worksGrid.innerHTML = html || '<p style="color:#888;">暂无作品</p>';
        }

        function renderAgents(agents) {
            const html = (agents || []).map(a => `
                <a href="${a.link || '#'}" class="project-card" target="_blank">
                    <div class="project-icon-wrapper">
                         ${a.iconUrl ? `<img src="${a.iconUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : '<i class="fas fa-robot"></i>'}
                    </div>
                    <div class="project-info">
                        <h3>${a.title}</h3>
                        <p>${a.description}</p>
                    </div>
                    <span class="category-pill">Agent</span>
                </a>
            `).join('');
            
            const agentsGrid = document.getElementById('agentsGrid');
            if(agentsGrid) agentsGrid.innerHTML = html || '<p style="color:#888;">暂无智能体</p>';
        }

        function renderMedia(mediaList) {
            const videos = (mediaList || []).filter(m => m.type === 'video');
            const products = (mediaList || []).filter(m => m.type === 'image');

            const videosGrid = document.getElementById('videosGrid');
            if (videosGrid) {
                videosGrid.innerHTML = videos.map(v => `
                    <a href="${v.link || v.url}" class="project-card" target="_blank" style="text-decoration: none;">
                        <div style="position: relative; width: 100%; margin-bottom: 1rem;">
                            <video src="${v.url}" style="width:100%; border-radius:var(--radius-md); display: block;" muted loop onmouseover="this.play()" onmouseout="this.pause()"></video>
                            <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); pointer-events: none;">
                                <i class="fas fa-play-circle" style="font-size: 3rem; color: rgba(255,255,255,0.8);"></i>
                            </div>
                        </div>
                        <h3>${v.title}</h3>
                        <span class="category-pill">Video</span>
                    </a>
                `).join('') || '<p style="color:#888; text-align:center;">暂无视频</p>';
            }

            const productsGrid = document.getElementById('productsGrid');
            if (productsGrid) {
                productsGrid.innerHTML = products.map(product => `
                    <a href="${product.link || product.url}" class="project-card" target="_blank" style="text-decoration: none;">
                        <img src="${product.url}" class="media-preview" style="border-radius:var(--radius-md); margin-bottom:1rem;">
                        <h3>${product.title}</h3>
                        <span class="category-pill">Workflow</span>
                    </a>
                `).join('') || '<p style="color:#888; text-align:center;">暂无我的工作流</p>';
            }
        }

        function renderCertificates(certificates) {
            const html = (certificates || []).map(c => `
                <a href="${c.link || c.imageUrl || '#'}" class="project-card" target="_blank" style="text-decoration: none;">
                    <div class="project-icon-wrapper">
                        ${c.imageUrl ? `<img src="${c.imageUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : '<i class="fas fa-certificate"></i>'}
                    </div>
                    <h3>${c.title}</h3>
                    <p>${c.issuer}</p>
                    <p style="font-size:0.8rem; color:var(--text-secondary);">${c.date}</p>
                    <span class="category-pill">Certificate</span>
                </a>
            `).join('');
            
            const certificatesGrid = document.getElementById('certificatesGrid');
            if(certificatesGrid) certificatesGrid.innerHTML = html || '<p style="color:#888;">暂无证书</p>';
        }

        function renderTools(tools) {
            // Render grid cards for the Tools Section in main content.
            const gridHtml = (tools || []).map(t => `
                <div class="project-card" ${t.link ? `onclick="window.open('${t.link}', '_blank')" style="cursor:pointer;"` : ''}>
                    <div class="project-icon-wrapper">
                        ${t.iconUrl ? `<img src="${t.iconUrl}" style="width:100%; height:100%; object-fit:cover; border-radius:50%;">` : `<i class="${t.icon || 'fas fa-wrench'}"></i>`}
                    </div>
                    <h3>${t.name}</h3>
                    <p>${t.description}</p>
                    <span class="category-pill">Tool</span>
                </div>
            `).join('');
            
            // If we want to replace the static content in #section-tools .projects-grid
            const toolsGrid = document.querySelector('#section-tools .projects-grid');
            if(toolsGrid) toolsGrid.innerHTML = gridHtml || '<p style="color:#888;">暂无工具</p>';
        }

        function renderArticles(articles) {
            const html = (articles || []).map(a => `
                <div class="project-card" onclick="window.open('${a.link || '#'}', '_blank')">
                    <div class="project-icon-wrapper">📝</div>
                    <h3>${a.title}</h3>
                    <p>${a.summary}</p>
                    <span class="category-pill">${a.category || 'Blog'}</span>
                </div>
            `).join('');
            
            const articlesGrid = document.querySelector('#section-articles .projects-grid');
            if(articlesGrid) articlesGrid.innerHTML = html || '<p style="color:#888;">暂无文章</p>';
        }

        // --- Admin Actions ---
        
        // Change Background Color
        document.getElementById('bgColorInput').addEventListener('change', async (e) => {
            const color = e.target.value;
            applySettings({ backgroundColor: color });
            
            await fetch(`${API_URL}/settings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ backgroundColor: color })
            });
        });

        // Upload Background Image
        document.getElementById('bgImageInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            // Check file size (allow up to 20MB for high quality images)
            if (file.size > 20 * 1024 * 1024) {
                alert('文件过大！请上传小于 20MB 的图片文件。');
                e.target.value = ''; // Clear input
                return;
            }
            
            const formData = new FormData();
            formData.append('file', file);
            
            // Show loading state
            const label = e.target.previousElementSibling;
            const originalText = label.textContent;
            label.textContent = '背景图片 (正在上传...)';
            
            try {
                const res = await fetch(`${API_URL}/upload/background`, { method: 'POST', body: formData });
                const data = await res.json();
                applySettings({ backgroundImage: data.url });
                alert('背景图片上传成功！');
            } catch (error) {
                alert('背景图片上传失败，请重试。');
                console.error('Background image upload failed:', error);
            } finally {
                // Restore original label text
                label.textContent = originalText;
            }
        });

        // Upload Music
        document.getElementById('bgMusicInput').addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Check file size (limit to 4MB for Vercel/GitHub compatibility)
            if (file.size > 4 * 1024 * 1024) {
                alert('文件过大！请上传小于 4MB 的音频文件。');
                e.target.value = ''; // Clear input
                return;
            }

            // Show loading state
            const label = e.target.previousElementSibling;
            const originalText = label.textContent;
            label.textContent = '背景音乐 (正在上传...)';
            e.target.disabled = true;

            const formData = new FormData();
            formData.append('file', file);
            
            try {
                const res = await fetch(`${API_URL}/upload/music`, { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Upload failed');
                
                const data = await res.json();
                applySettings({ backgroundMusic: data.url });
                
                const audio = document.getElementById('bgMusic');
                // audio.src is updated by applySettings
                document.getElementById('playerTitle').textContent = file.name.replace(/\.[^/.]+$/, ""); // Remove extension
                
                // Try to auto-play
                try {
                    await audio.play();
                    document.getElementById('playerStatus').textContent = "Playing...";
                    document.getElementById('sidebarPlayBtn').innerHTML = '<i class="fas fa-pause"></i>';
                    document.getElementById('musicToggleBtn').classList.add('music-active');
                } catch (err) {
                    console.log("Auto-play blocked, user interaction required");
                }

                alert('背景音乐上传成功！');
            } catch (err) {
                console.error(err);
                alert('上传失败，请重试。');
            } finally {
                // Reset UI
                label.textContent = originalText;
                e.target.disabled = false;
            }
        });

        // Upload Project
        async function uploadProject() {
            const formData = new FormData();
            formData.append('title', document.getElementById('projTitle').value);
            formData.append('description', document.getElementById('projDesc').value);
            formData.append('link', document.getElementById('projLink').value);
            formData.append('category', document.getElementById('projCategory').value);
            
            const iconFile = document.getElementById('projIconInput').files[0];
            if (iconFile) {
                formData.append('icon', iconFile);
            }
            
            try {
                const res = await fetch(`${API_URL}/projects`, {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('Failed to upload project');
                alert('应用添加成功！刷新页面查看。');
                fetchData();
            } catch (e) {
                console.error(e);
                alert('添加失败，请重试。');
            }
        }

        // Add Agent
        async function addAgent() {
            const formData = new FormData();
            formData.append('title', document.getElementById('agentTitle').value);
            formData.append('description', document.getElementById('agentDesc').value);
            formData.append('link', document.getElementById('agentLink').value);
            
            const iconFile = document.getElementById('agentIconInput').files[0];
            if (iconFile) {
                formData.append('icon', iconFile);
            }
            
            try {
                const res = await fetch(`${API_URL}/agents`, {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('Failed to add agent');
                alert('智能体添加成功！');
                fetchData();
            } catch (e) {
                console.error(e);
                alert('添加失败，请重试。');
            }
        }

        // Upload Video
        async function uploadVideo() {
            const fileInput = document.getElementById('videoFileInput');
            const file = fileInput.files[0];
            if (!file) return alert('请选择视频文件');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'video');
            formData.append('title', document.getElementById('videoTitle').value);
            formData.append('link', document.getElementById('videoLink').value);

            try {
                const res = await fetch(`${API_URL}/upload/media`, { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Upload failed');
                alert('视频上传成功！刷新页面查看。');
                fetchData();
            } catch (e) {
                console.error(e);
                alert('上传失败，请重试。');
            }
        }

        // Upload Workflow
        async function uploadWorkflow() {
            const fileInput = document.getElementById('workflowFileInput');
            const file = fileInput.files[0];
            if (!file) return alert('请选择图片文件');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', 'image');
            formData.append('title', document.getElementById('workflowTitle').value);
            formData.append('link', document.getElementById('workflowLink').value);

            try {
                const res = await fetch(`${API_URL}/upload/media`, { method: 'POST', body: formData });
                if (!res.ok) throw new Error('Upload failed');
                alert('工作流上传成功！刷新页面查看。');
                fetchData();
            } catch (e) {
                console.error(e);
                alert('上传失败，请重试。');
            }
        }

        // Add Tool
        async function addTool() {
            const formData = new FormData();
            formData.append('name', document.getElementById('toolName').value);
            formData.append('description', document.getElementById('toolDesc').value);
            formData.append('link', document.getElementById('toolLink').value);
            
            const iconFile = document.getElementById('toolIconInput').files[0];
            if (iconFile) {
                formData.append('icon', iconFile);
            }
            
            try {
                const res = await fetch(`${API_URL}/tools`, {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('Failed to add tool');
                alert('工具添加成功！');
                fetchData();
            } catch (e) {
                console.error(e);
                alert('添加失败，请重试。');
            }
        }

        // Add Certificate
        async function uploadCertificate() {
            const formData = new FormData();
            formData.append('title', document.getElementById('certTitle').value);
            formData.append('issuer', document.getElementById('certIssuer').value);
            formData.append('date', document.getElementById('certDate').value);
            formData.append('link', document.getElementById('certLink').value);
            
            const imageFile = document.getElementById('certImageInput').files[0];
            if (imageFile) {
                formData.append('image', imageFile);
            }
            
            try {
                const res = await fetch(`${API_URL}/certificates`, {
                    method: 'POST',
                    body: formData
                });
                if (!res.ok) throw new Error('Failed to add certificate');
                alert('证书添加成功！');
                fetchData();
            } catch (e) {
                console.error(e);
                alert('添加失败，请重试。');
            }
        }

        // Add Article
        async function addArticle() {
            const article = {
                title: document.getElementById('articleTitle').value,
                summary: document.getElementById('articleSummary').value,
                link: document.getElementById('articleLink').value,
                category: document.getElementById('articleCategory').value
            };
            
            try {
                const res = await fetch(`${API_URL}/articles`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(article)
                });
                if (!res.ok) throw new Error('Failed to add article');
                alert('文章发布成功！');
                fetchData();
            } catch (e) {
                console.error(e);
                alert('发布失败，请重试。');
            }
        }

        // Deploy to Cloud
        function saveProxy() {
            const proxy = document.getElementById('gitProxyInput').value;
            localStorage.setItem('git_proxy', proxy);
            alert('代理设置已保存！同步时将尝试使用此代理。');
        }

        async function deployToCloud() {
            const btn = document.getElementById('deployBtn');
            const log = document.getElementById('deployLog');
            const proxy = localStorage.getItem('git_proxy');
            
            if (!confirm('确定要同步所有本地修改到云端并发布吗？')) return;

            btn.disabled = true;
            btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 正在同步发布中...';
            log.style.display = 'block';
            log.textContent = '> 开始同步进程...\n> 正在执行 Git Add/Commit/Push...';
            log.style.color = '#a0a0a0';

            try {
                const res = await fetch(`${API_URL}/deploy`, { 
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ proxy: proxy })
                });
                const data = await res.json();

                if (data.success) {
                    log.textContent += '\n> ' + data.message;
                    log.textContent += '\n> 成功！Vercel 正在自动构建上线。';
                    log.style.color = '#4ade80';
                    alert('发布成功！Vercel 正在后台更新，请稍候访问线上链接。');
                } else {
                    log.textContent += '\n> 错误: ' + data.error;
                    if (data.details) log.textContent += '\n' + data.details;
                    log.style.color = '#ff4444';
                }
            } catch (err) {
                log.textContent += '\n> 请求失败: ' + err.message;
                log.style.color = '#ff4444';
            } finally {
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-cloud-upload-alt"></i> 立即同步发布';
            }
        }

        // Initialize Proxy UI
        document.addEventListener('DOMContentLoaded', () => {
            const savedProxy = localStorage.getItem('git_proxy');
            if (savedProxy && document.getElementById('gitProxyInput')) {
                document.getElementById('gitProxyInput').value = savedProxy;
            }
        });


        // --- UI Interactions ---

        // Settings Panel Logic
        const settingsBtn = document.getElementById('settingsToggleBtn');
        const settingsPanel = document.getElementById('settingsPanel');
        const closeSettingsBtn = document.getElementById('closeSettingsBtn');
        const passwordModal = document.getElementById('passwordModal');
        const closePasswordModalBtn = document.getElementById('closePasswordModal');

        // Verify Password Logic
        async function verifyPassword() {
            const password = document.getElementById('adminPasswordInput').value;
            try {
                const res = await fetch(`${API_URL}/verify-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ password })
                });
                const data = await res.json();
                
                if (data.success) {
                    passwordModal.classList.remove('show');
                    passwordModal.style.display = 'none';
                    // Use setTimeout to allow UI update
                    setTimeout(() => {
                        settingsPanel.style.display = 'flex'; // Ensure it's visible
                        // Force reflow
                        void settingsPanel.offsetWidth;
                        settingsPanel.classList.add('show');
                    }, 50);
                    
                    document.getElementById('adminPasswordInput').value = ''; // Clear password
                    document.getElementById('passwordError').style.display = 'none';
                } else {
                    document.getElementById('passwordError').style.display = 'block';
                }
            } catch (err) {
                console.error('Verify failed', err);
            }
        }

        // Open Password Modal instead of Settings Panel
        settingsBtn.addEventListener('click', () => {
            // Check if already open
            if (settingsPanel.classList.contains('show')) {
                settingsPanel.classList.remove('show');
                setTimeout(() => { settingsPanel.style.display = 'none'; }, 300); // Wait for transition
            } else {
                // Ensure settings panel is hidden
                settingsPanel.classList.remove('show');
                settingsPanel.style.display = 'none';
                
                // Show Password Modal
                passwordModal.style.display = 'flex';
                // Small timeout to allow display:block to apply before adding class (if we had transition)
                setTimeout(() => { passwordModal.classList.add('show'); }, 10);
            }
        });

        // Close Password Modal
        closePasswordModalBtn.addEventListener('click', () => {
            passwordModal.classList.remove('show');
            setTimeout(() => { passwordModal.style.display = 'none'; }, 300);
        });

        closeSettingsBtn.addEventListener('click', () => {
            settingsPanel.classList.remove('show');
            setTimeout(() => { settingsPanel.style.display = 'none'; }, 300);
        });

        // Settings Tabs Logic
        document.querySelectorAll('.settings-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                // Remove active class from all tabs
                document.querySelectorAll('.settings-tab').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                tab.classList.add('active');
                
                // Hide all sections
                document.querySelectorAll('.settings-section').forEach(s => s.classList.remove('active'));
                // Show target section
                const targetId = tab.getAttribute('data-tab');
                document.getElementById(`tab-${targetId}`).classList.add('active');
            });
        });

        // Tab Switching Logic
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                const targetId = link.getAttribute('data-target');
                document.querySelectorAll('.page-section').forEach(section => {
                    section.classList.remove('active');
                });
                
                const targetSection = document.getElementById(`section-${targetId}`);
                if (targetSection) {
                    targetSection.classList.add('active');
                }
            });
        });

        // Music Player Controls
        const bgMusic = document.getElementById('bgMusic');
        const sidebarPlayBtn = document.getElementById('sidebarPlayBtn');
        const topMusicBtn = document.getElementById('musicToggleBtn');
        const playerStatus = document.getElementById('playerStatus');

        function togglePlay() {
            if (bgMusic.paused) {
                bgMusic.play().catch(e => console.log("Audio play failed interaction required"));
                playerStatus.textContent = "Playing...";
                sidebarPlayBtn.innerHTML = '<i class="fas fa-pause"></i>';
                topMusicBtn.classList.add('music-active');
            } else {
                bgMusic.pause();
                playerStatus.textContent = "Paused";
                sidebarPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
                topMusicBtn.classList.remove('music-active');
            }
        }

        sidebarPlayBtn.addEventListener('click', togglePlay);
        topMusicBtn.addEventListener('click', togglePlay);

        // Handle initial audio load error gracefully
        bgMusic.addEventListener('error', (e) => {
            console.warn("Audio load error (expected if autoplay blocked):", e);
            playerStatus.textContent = "Click to Play";
            sidebarPlayBtn.innerHTML = '<i class="fas fa-play"></i>';
            topMusicBtn.classList.remove('music-active');
        });


        // --- Starry Mouse Trail ---
        class StarryMouseTrail {
            constructor() {
                this.canvas = document.createElement('canvas');
                this.ctx = this.canvas.getContext('2d');
                this.canvas.style.position = 'fixed';
                this.canvas.style.top = '0';
                this.canvas.style.left = '0';
                this.canvas.style.width = '100%';
                this.canvas.style.height = '100%';
                this.canvas.style.pointerEvents = 'none';
                this.canvas.style.zIndex = '9999';
                document.body.appendChild(this.canvas);
                
                this.particles = [];
                this.colors = ['#FFFFFF', '#F0F8FF', '#E0FFFF', '#B0C4DE']; 
                this.resize();
                
                window.addEventListener('resize', () => this.resize());
                window.addEventListener('mousemove', (e) => this.spawn(e.clientX, e.clientY));
                
                this.animate();
            }
            
            resize() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }
            
            spawn(x, y) {
                for(let i = 0; i < 3; i++) {
                    this.particles.push({
                        x: x,
                        y: y,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        size: Math.random() * 3 + 1,
                        color: this.colors[Math.floor(Math.random() * this.colors.length)],
                        life: 1,
                        decay: 0.01 + Math.random() * 0.02,
                        rotation: Math.random() * Math.PI * 2,
                        rotationSpeed: (Math.random() - 0.5) * 0.1,
                        shape: Math.random() > 0.3 ? 'star' : 'dust'
                    });
                }
            }
            
            drawStar(x, y, r, color, rotation, opacity) {
                this.ctx.save();
                this.ctx.translate(x, y);
                this.ctx.rotate(rotation);
                this.ctx.beginPath();
                this.ctx.fillStyle = color;
                this.ctx.shadowBlur = 10;
                this.ctx.shadowColor = color;
                
                for (let i = 0; i < 4; i++) {
                    this.ctx.lineTo(Math.cos((0 + i * 90) * Math.PI / 180) * r, 
                                  -Math.sin((0 + i * 90) * Math.PI / 180) * r);
                    this.ctx.lineTo(Math.cos((45 + i * 90) * Math.PI / 180) * (r * 0.2), 
                                  -Math.sin((45 + i * 90) * Math.PI / 180) * (r * 0.2));
                }
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.restore();
            }

            drawDust(x, y, r, color) {
                this.ctx.beginPath();
                this.ctx.arc(x, y, r, 0, Math.PI * 2);
                this.ctx.fillStyle = color;
                this.ctx.shadowBlur = 5;
                this.ctx.shadowColor = color;
                this.ctx.fill();
            }
            
            animate() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                for (let i = 0; i < this.particles.length; i++) {
                    const p = this.particles[i];
                    p.x += p.vx;
                    p.y += p.vy;
                    p.life -= p.decay;
                    p.rotation += p.rotationSpeed;
                    
                    if (p.life > 0) {
                        this.ctx.globalAlpha = p.life;
                        if (p.shape === 'star') {
                            this.drawStar(p.x, p.y, p.size * 2, p.color, p.rotation, p.life);
                        } else {
                            this.drawDust(p.x, p.y, p.size, p.color);
                        }
                    }
                }
                this.ctx.globalAlpha = 1;
                this.particles = this.particles.filter(p => p.life > 0);
                requestAnimationFrame(() => this.animate());
            }
        }
        
        // Initialize Starry Mouse Trail
        new StarryMouseTrail();

        // Particle System (Background)
        class ParticleSystem {
            constructor() {
                this.canvas = document.getElementById('particleCanvas');
                this.ctx = this.canvas.getContext('2d');
                this.particles = [];
                this.resize();
                
                window.addEventListener('resize', () => this.resize());
                this.initParticles();
                this.animate();
            }

            resize() {
                this.canvas.width = window.innerWidth;
                this.canvas.height = window.innerHeight;
            }

            initParticles() {
                this.particles = [];
                const count = window.innerWidth < 768 ? 50 : 150; 
                for (let i = 0; i < count; i++) {
                    this.particles.push(new Particle(this.canvas));
                }
            }

            animate() {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
                this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
                this.ctx.lineWidth = 0.5;
                
                for(let i = 0; i < this.particles.length; i++) {
                    const p1 = this.particles[i];
                    p1.update();
                    p1.draw(this.ctx);
                    
                    for(let j = i + 1; j < this.particles.length; j++) {
                        const p2 = this.particles[j];
                        const dx = p1.x - p2.x;
                        const dy = p1.y - p2.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance < 100) {
                            this.ctx.beginPath();
                            this.ctx.moveTo(p1.x, p1.y);
                            this.ctx.lineTo(p2.x, p2.y);
                            this.ctx.stroke();
                        }
                    }
                }
                requestAnimationFrame(() => this.animate());
            }
        }

        class Particle {
            constructor(canvas) {
                this.canvas = canvas;
                this.x = Math.random() * this.canvas.width;
                this.y = Math.random() * this.canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.size = Math.random() * 2 + 0.5;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > this.canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > this.canvas.height) this.vy *= -1;
            }

            draw(ctx) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.fill();
            }
        }

        new ParticleSystem();

        // Initial Fetch
        fetchData();
    


        // Chat Widget Logic
        const chatWidget = {
            isOpen: false,
            history: [], // Conversation history
            
            init() {
                this.cacheDOM();
                this.bindEvents();
                this.makeDraggable();
            },

            cacheDOM() {
                this.container = document.getElementById('chat-widget-container');
                this.btn = document.getElementById('chat-toggle-btn');
                this.window = document.getElementById('chat-window');
                this.closeBtn = document.getElementById('chat-close-btn');
                this.messages = document.getElementById('chat-messages');
                this.input = document.getElementById('chat-input');
                this.sendBtn = document.getElementById('chat-send-btn');
                this.header = document.getElementById('chat-header');
            },

            bindEvents() {
                this.btn.addEventListener('click', () => this.toggleChat());
                this.closeBtn.addEventListener('click', () => this.toggleChat());
                this.sendBtn.addEventListener('click', () => this.sendMessage());
                this.input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') this.sendMessage();
                });
            },

            toggleChat() {
                this.isOpen = !this.isOpen;
                if (this.isOpen) {
                    this.window.classList.remove('hidden');
                    this.btn.style.display = 'none'; // Hide FAB when open
                    this.scrollToBottom();
                    this.logEvent('chat_opened');
                } else {
                    this.window.classList.add('hidden');
                    this.btn.style.display = 'flex';
                }
            },

            async sendMessage() {
                const text = this.input.value.trim();
                if (!text) return;

                // User Message
                this.appendMessage('user', text);
                this.input.value = '';
                this.history.push({ role: 'user', content: text });

                // Loading State
                const loadingId = this.appendLoading();

                try {
                    // Use relative URL properly - should work in most cases but let's be robust
                    const res = await fetch('/api/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                            message: text,
                            history: this.history.slice(-10) // Keep last 10 turns context
                        })
                    });
                    
                    const data = await res.json();

                    if (!res.ok) {
                        throw new Error(data.reply || data.error || `Server error: ${res.status}`);
                    }
                    
                    // Remove loading
                    this.removeMessage(loadingId);
                    
                    // Bot Message with Typewriter
                    this.typeWriter(data.reply);
                    this.history.push({ role: 'assistant', content: data.reply });
                    this.logEvent('message_sent');

                } catch (err) {
                    console.error("Chat fetch error:", err);
                    this.removeMessage(loadingId);
                    // Check if it's a connection refused error
                    let errorMsg = '抱歉，网络出了点小差错，请稍后再试。';
                    
                    // Use specific error message if available from backend (parsed above)
                    if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError')) {
                        errorMsg = err.message;
                    } else if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
                        errorMsg = '无法连接到服务器。请确保后端服务正在运行 (npm start)。';
                    }
                    this.appendMessage('bot', errorMsg);
                }
            },

            appendMessage(role, text) {
                const div = document.createElement('div');
                div.className = `message ${role}-message`;
                div.textContent = text;
                this.messages.appendChild(div);
                this.scrollToBottom();
                return div;
            },

            appendLoading() {
                const div = document.createElement('div');
                div.className = 'message bot-message';
                div.innerHTML = '<i class="fas fa-ellipsis-h fa-fade"></i>'; // FontAwesome loading
                div.id = 'msg-' + Date.now();
                this.messages.appendChild(div);
                this.scrollToBottom();
                return div.id;
            },

            removeMessage(id) {
                const el = document.getElementById(id);
                if (el) el.remove();
            },

            typeWriter(text) {
                const div = document.createElement('div');
                div.className = 'message bot-message typing-cursor';
                this.messages.appendChild(div);
                this.scrollToBottom();

                let i = 0;
                const speed = 30; // ms per char

                const type = () => {
                    if (i < text.length) {
                        div.textContent += text.charAt(i);
                        i++;
                        this.scrollToBottom();
                        setTimeout(type, speed);
                    } else {
                        div.classList.remove('typing-cursor');
                    }
                };
                type();
            },

            scrollToBottom() {
                this.messages.scrollTop = this.messages.scrollHeight;
            },

            makeDraggable() {
                // Only on desktop
                if (window.innerWidth <= 600) return;

                let isDragging = false;
                let currentX;
                let currentY;
                let initialX;
                let initialY;
                let xOffset = 0;
                let yOffset = 0;

                const dragStart = (e) => {
                    initialX = e.clientX - xOffset;
                    initialY = e.clientY - yOffset;

                    if (e.target === this.header || this.header.contains(e.target)) {
                        isDragging = true;
                    }
                };

                const dragEnd = () => {
                    initialX = currentX;
                    initialY = currentY;
                    isDragging = false;
                };

                const drag = (e) => {
                    if (isDragging) {
                        e.preventDefault();
                        currentX = e.clientX - initialX;
                        currentY = e.clientY - initialY;

                        xOffset = currentX;
                        yOffset = currentY;

                        setTranslate(currentX, currentY, this.window);
                    }
                };

                const setTranslate = (xPos, yPos, el) => {
                    el.style.transform = `translate3d(${xPos}px, ${yPos}px, 0)`;
                };

                this.header.addEventListener("mousedown", dragStart);
                document.addEventListener("mouseup", dragEnd);
                document.addEventListener("mousemove", drag);
            },
            
            logEvent(eventName) {
                // Placeholder for Analytics (A/B Testing)
                console.log(`[Analytics] Event: ${eventName}`);
                // Example: gtag('event', eventName, { ... });
            }
        };

        // Initialize when DOM loaded
        document.addEventListener('DOMContentLoaded', () => {
            chatWidget.init();
        });