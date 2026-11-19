# 网站首次上线与托管对照记录

> 类型：记录 ｜ 状态：历史 ｜ 适用版本：全部版本 ｜ 更新：2026-11-15 ｜ 读者：网站维护者

2026-10-22 的上线与测速记录；仅供历史追溯，当前部署流程见 [WEBSITE.md](../../WEBSITE.md)。

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
