# 网站素材来源

- `logo.svg`：软件仓库 `assets/logo.svg`，保留原标志。
- `screenshots/landscape.webp`：用户于2026-10-21替换的实际软件横屏截图，保留本地原图并转为1920×1064 WebP，裁去顶部16像素原生标题栏。
- `screenshots/danmaku.webp`：软件 `docs/overview5_Landscape_mode.png` 转为1920×1064 WebP，裁去顶部16像素原生标题栏。
- `screenshots/portrait.webp`：软件 `docs/overview2_Portrait_Mode.png` 转为1080×1702 WebP，裁去顶部26像素原生标题栏。
- 软件仓库中的原截图未改动；网站派生图仅裁去原生标题栏，保持内容的像素比例。这些图片来自项目现有文档，用于布局展示，不代表最新版本的每项控件。
- 平台图标复制自软件 `assets/platforms/`，具体出处见 `platforms/README.md`，仅用于识别平台。

软件仓库：https://github.com/Lanpropro/DD_Monitor_CE

## 比赛二路实录预览（2026-10-21）

- `videos/match-sync-recording.mp4`：复用软件仓库宣传片2工程 `videos/dd-monitor-ce-plugins-promo/assets/match-continuous.mp4`，上游为 `Video_reference/二路直播对齐.mp4` 的6–34秒，连续28秒。H.264 / 1920×1080 / 30fps / 无音轨 / faststart；仅压缩，不变速、不拼接、不补造界面。该派生素材已经不含原生标题栏。
- `videos/match-sync-poster.webp`：上述视频首帧。
- 章节：0–6秒对照画面，6–16秒偏移微调，16–23秒同步观看，23–28秒合并弹幕。沿用原工程 BRIEF.md 与 MEDIA.md 的说明：已有录屏展示手动微调，不能宣称为自动对齐成功实录。
- 视频来源在本地复用，默认静音，无新增音乐、外部服务或上传；原宣传片工程及素材未修改。

## 国内与海外插件视频展示（2026-10-21）

- `videos/domestic-live-recording.mp4`：复用宣传片2工程 `assets/domestic-apex-v7.mp4`，源录屏为 `Video_reference/国内apex1+5 重置.mp4` 的8.9–25.3秒。连续16.4秒，1＋5六窗，不替换格子、不变速。沿用该工程已去除原生标题栏的画面。
- `videos/global-live-recording.mp4`：复用宣传片2工程 `assets/global-stitched.mp4`，6.066667秒。九格分别来自 `海外平台九格增补.mp4` 和 `海外平台重录.mp4` 的独立时间段，详见原工程 `cell-selections.json`；这是宣传片剪辑，不代表同一时刻九路同时播放的性能。没有再拼接或改速。
- 两份网页视频均为 H.264 / 1920×1080 / 30fps / 无音轨 / faststart，封面 `*-poster.webp` 为对应视频首帧。
- 保留原始软件内容，仅为网页压缩；原素材、宣传片工程未修改。视频保留为历史源素材，当前插件预览不再加载视频。

## 截图标注与二路交互（2026-10-22）

- `previews/domestic-live.webp`：从国内网页视频第10秒抽帧；`previews/global-live.webp`：从海外网页视频第4秒抽帧，避开开头的画面异常。
- `previews/match-sync.webp`：从二路网页视频第10秒抽帧。三张均为1920×1080 WebP，保持原画面比例。
- 国内六格、海外九格的名称、平台及热点范围集中在 `docs/data/platform-previews.json`；平台为 `null` 时显示“平台待确认”，待维护者提供对应关系后更新。
- 二路固定展示录屏中的主画面与对照来源，保留原截图真实弹幕；网页控件仅演示相对手动偏移及独立模拟音量，不连接直播、不执行实际同步、不播放声音。

- `previews/avatars/domestic-1.webp` 至 `domestic-6.webp`：按维护者确认的六格顺序，从软件 `cache/avatars/room/` 的抖音458897981613、斗鱼1667826、B站3990387、斗鱼6218591、斗鱼6490082、抖音744948120380头像缓存派生为96×96 WebP。仅复制头像图片，不复制账号配置。
- 国内格子身份由维护者于2026-10-22确认；海外02名称为“波風水雞”，平台由本地已有主播记录确认为Twitch。
