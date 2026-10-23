# DD Monitor Website

DD 监控室 CE 的软件介绍、插件展示与下载网站，使用 VitePress 构建。

- 网站源码：[DD_Monitor_Website](https://github.com/Lanpropro/DD_Monitor_Website)
- 软件本体：[DD_Monitor_CE](https://github.com/Lanpropro/DD_Monitor_CE)
- 插件与安装包：[DD_Monitor_Plugins](https://github.com/Lanpropro/DD_Monitor_Plugins)

## 本地启动

需要 Node.js 22 或更高版本。首次运行安装依赖：

```powershell
cd F:\CodexAppManager\Code\DD_Monitor_Website
npm ci
npm run dev
```

打开 http://127.0.0.1:5173/DD_Monitor_Website/ ，终端保持运行，按 Ctrl+C 停止。

## 修改内容

首页插件区和插件目录页共用 `PluginSubmission.vue`，链接到插件仓库的投稿 Issue 表单。网站不增加账号、鉴权或审核状态展示。首次部署入口前，应先确认插件仓库默认分支已启用 `plugin-submission.yml` 表单与工作流；详见[投稿流程](https://github.com/Lanpropro/DD_Monitor_Plugins/blob/main/SUBMISSIONS.md)。本轮不自动同步社区索引到展示卡片，也不部署网站。

- 首页：`docs/.vitepress/theme/HomePage.vue`
- 主播名称：`docs/.vitepress/theme/FeatureDemo.vue` 的 `cards` 数组
- 插件卡片文案与下载信息：`docs/data/plugins.json`
- 页面文章：`docs/*.md`、`docs/plugins/*.md`
- 软件版本、发布日期、Setup 安装器链接与 SHA256：`docs/data/software-release.json`，首页、下载页和软件页共用。
- 截图、缩略图、视频：`docs/public/`
- 网站路径与导航：`docs/.vitepress/config.mjs`

## 构建与验证

```powershell
npm run build
npm test
```

输出目录为 `docs/.vitepress/dist/`。构建后使用 `npm run preview`，访问 http://127.0.0.1:4173/DD_Monitor_Website/ 。

## 部署

CI 自动构建并运行测试；GitHub Pages 支持手动发布，并每6小时同步最新正式软件 Release 后构建、测试和发布，具体见 [部署说明](WEBSITE.md)。
插件和软件安装包继续从原仓库 Releases 下载，本仓库不保存插件源码和账号配置。

迁移记录见 [MIGRATION.md](MIGRATION.md)，开发流程见 [CONTRIBUTING.md](CONTRIBUTING.md)，素材来源见 [ASSETS.md](docs/public/ASSETS.md)。
保留原项目 [LGPL-2.1 许可](LICENSE)。第三方截图、直播画面和平台标识的权利归各自权利人。

## 自定义域名部署

正式域名为 `ddmonitor.top`。Pages 手动部署工作流使用 `SITE_BASE=/` 构建并测试，保证站点位于域名根路径；默认本地预览仍为 `/DD_Monitor_Website/`。域名需要在 GitHub Pages 设置中绑定，并在腾讯云 DNSPod 添加 GitHub Pages 的 A 记录及 www CNAME；证书就绪后启用 Enforce HTTPS。

### 首次上线记录（2026-10-22）

- 地址：https://ddmonitor.top/ ，`https://www.ddmonitor.top/` 自动跳转到主域名。
- 发布源码：`main` 的 `93afdb9e63d455fd165236e7d4486bf7805443b1`；部署工作流：https://github.com/Lanpropro/DD_Monitor_Website/actions/runs/39784554631 。
- DNSPod 免费套餐下保留两条 `@` A 记录：`185.199.108.153`、`185.199.109.153`；`www` CNAME 为 `lanpropro.github.io`，TTL 均为600秒。同名多IP数量受套餐限制，未购买额外服务。
- GitHub Pages 发布来源为 GitHub Actions，自定义域名为 `ddmonitor.top`，已启用 Enforce HTTPS。
- 验证：默认路径和根路径构建各63项测试通过；线上首页HTTPS、www跳转、软件页面及56张不同墙图加载正常。

### 免备案托管对照预览（2026-10-22）

- 测试地址：https://preview.ddmonitor.top/ 。项目 `ddmonitor-speed-preview`（`makers-ggkntr9xjghz`），部署 `dpnav9i4avx0`，区域为“全球可用区（不含中国大陆）”，采用免费托管。
- 本次直接上传根路径构建产物：PowerShell 中先设置 `$env:SITE_BASE='/'`，再运行 `npm run build` 与 `npm test`；66项测试通过。上传 `docs/.vitepress/dist/` 整个目录（192个文件，约53.66MB），无额外外层目录。
- 测试域名 CNAME：`preview` → `preview.ddmonitor.top.pages.dnsoe6.com`，TTL 600。归属验证记录为 `edgeonereclaim.preview` TXT；记录值由控制台生成，不在此保存。已申请免费自动续签证书。
- `ddmonitor.top` 和 `www` 继续指向 GitHub Pages，本次没有切换主站。EdgeOne 为直接上传项目，GitHub 推送不会自动更新该预览；后续修改需重新构建并上传，或另行配置自动部署。
- 对照结果：本机3轮、每轮25张首屏1280宽原图、6并发、固定各服务节点并保留 TLS 证书校验，以 SHA-256 检查每张图片完整性。两端每轮25张均验证通过；总下载时间中位数为 GitHub Pages 5.991秒、EdgeOne 自定义域名6.289秒。该测试排除 DNS 耗时，不是浏览器开屏时间，不能推断所有大陆网络表现；目前不足以支持切换主站。
- 临时 `edgeone.dev` 预览链接有有效期，不适合作为长期访问地址。相关测速原始记录留在本机忽略目录 `work/`，不提交浏览器 Cookie、临时预览校验参数或账号配置。
