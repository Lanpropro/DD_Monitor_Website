# 网站构建与发布

网站已独立到 `Lanpropro/DD_Monitor_Website`，本地目录为 `F:/CodexAppManager/Code/DD_Monitor_Website`。

## GitHub Pages

当前部署基路径为 `/DD_Monitor_Website/`，上线后的项目网址为：
https://lanpropro.github.io/DD_Monitor_Website/

1. 在网站仓库 Settings → Pages 中把 Source 选择为 GitHub Actions。
2. 在 Actions 中打开 Deploy website to Pages，选择 `main` 并手动运行。
3. 构建与测试通过后发布 `docs/.vitepress/dist/`。以工作流返回的网址及成功状态确认上线。

迁移本身只创建源码仓库及部署配置，不自动执行公开发布。
CI 对 main/develop 的推送与 PR 执行验证。Pages 工作流支持手动触发，并每6小时检查软件仓库的最新正式 Release，更新构建中的版本数据后发布到 `https://ddmonitor.top/`。GitHub 定时任务可能延迟，长期无活动也可能停用；需要立即更新时可手动运行。

同步脚本为 `tools/sync-software-release.mjs`，使用 Actions 自带的只读 `GITHUB_TOKEN` 读取公开发布信息，不需要额外跨仓库凭证。Setup 安装器必须已上传并提供 SHA256，且地址属于官方软件仓库；缺少资产或校验值时失败并保留现有站点。同步只更新本次构建的数据，不提交回源码分支。版本专属功能介绍仍按 PR 流程维护。

本地更新版本基线可运行 `node tools/sync-software-release.mjs`，检查 `docs/data/software-release.json` 后构建、测试并提交。普通本地构建和测试不会联网查询 Release。

同一 Pages 工作流也运行 `node tools/sync-plugin-releases.mjs`，读取插件仓库最新正式 Release 的 `plugin-catalog.json`，自动更新网站已有插件的版本、下载链接、SHA256、最低软件版本和发布说明链接。脚本核对目录及各 ZIP 的 SHA256，拒绝版本回退、缺少条目和非官方地址；任一验证失败则不发布。首页、插件目录、详情页和下载页共用 `docs/data/plugins.json`。新插件通过同样的目录与 ZIP 校验后自动加入滚动列表、插件目录、兼容性表及侧栏，并创建基础详情页。已有插件的人工文案保留，新插件默认使用目录名称及简介；没有专门截图时展示功能文字和发布说明，不复用其他插件的预览。

发布插件时应上传包含全部正式插件的最新 `plugin-catalog.json` 和相应 ZIP。网站每6小时检查一次，非即时发布回调；需要立即更新时，在网站仓库手动运行 Deploy website to Pages。同步仅修改构建产物所用数据，不回写 Git 分支；本地可运行同一脚本更新版本基线。

详情页下载区的版本与“发布说明”链接随目录自动同步；下方手写更新记录保留人工整理的历史，不要求每次发布先改网页文案。验证应检查同步后的下载区与目录一致，不能以手写记录尚未包含新版本阻止自动发布。

## 自定义域名

以后绑定独立域名时，将 config.mjs 的 base 改为 `/` 并同步修改 favicon 路径与测试中的 base；
再配置 Pages 自定义域名、DNS 与 HTTPS。本次迁移不购买域名、不改 DNS。

## 搜索引擎收录

正式站点地图为 `https://ddmonitor.top/sitemap.xml`，构建时自动生成；`robots.txt` 允许抓取并声明站点地图。首页使用指定标题，各内容页的 canonical 统一指向正式域名，不随本地预览的 base 改变。404 与内部素材说明页标记为 noindex，且不进入站点地图。

部署后，在百度搜索资源平台、Bing Webmaster Tools 和 Google Search Console 中验证网站归属，再提交上述站点地图及首页。验证记录或验证文件应使用各平台实际提供的值，不预填。技术配置不代表已提交平台，也不保证收录或排名。

## 本地开发

```powershell
npm ci
npm run dev
npm run build
npm test
npm run preview
```

开发端口为5173，构建预览端口为4173。下载按钮继续指向原软件、插件仓库的 Releases。
视频默认无音轨，素材来源见 docs/public/ASSETS.md。
