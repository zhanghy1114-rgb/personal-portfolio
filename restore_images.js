
const fs = require('fs');
const path = require('path');
const dbPath = path.join(__dirname, 'data', 'db.json');
let data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Restore Settings Images from local files
data.settings.backgroundImage = "背景4.jpg"; // Picking a safe default from the list
data.settings.qrDouyin = "qr_douyin.png";
data.settings.qrXiaohongshu = "qr_xiaohongshu.png";
data.settings.qrVideoAccount = "qr_video.png";
data.settings.videoCover = "我的视频.jpg";
data.settings.workflowCover = "我的工作流背景图片.jpg";
data.settings.certCover = "我的证书背景图片.jpg";

// We don't have local icons for the specific tools/projects that were lost,
// so we leave them empty. The frontend will handle the fallback.

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
console.log("Restored available local images to db.json");
