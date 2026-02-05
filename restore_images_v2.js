
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
let data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// 1. Restore Settings Images
data.settings.backgroundImage = "bg-highres.jpg"; // Use the high-res one found in public
data.settings.qrDouyin = "qr_douyin.png";
data.settings.qrXiaohongshu = "qr_xiaohongshu.png";
data.settings.qrVideoAccount = "qr_video.png";
data.settings.videoCover = "我的视频.jpg";
data.settings.workflowCover = "我的工作流背景图片.jpg";
data.settings.certCover = "我的证书背景图片.jpg";

// 2. Try to restore Project Icons
// Map "AI短剧生成平台" to "短剧拉片智能体.png" if it exists
const shortDramaProject = data.projects.find(p => p.title.includes("AI短剧") || p.title.includes("短剧"));
if (shortDramaProject) {
    shortDramaProject.iconUrl = "短剧拉片智能体.png";
}

// 3. Ensure other empty icons stay empty (frontend handles them)

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log("Restored settings images and mapped known project icons.");
