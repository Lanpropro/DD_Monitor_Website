# 发布流程

> 类型：指南 ｜ 状态：维护中 ｜ 适用版本：全部版本 ｜ 更新：2026-11-14 ｜ 读者：网站维护者

本页说明网站从改动到上线的步骤、验证和回滚。站点内容与数据来源见[内容与数据同步](content-sync.md)。

## 1. 分支与提交

- `main`：可发布基线；部署工作流只在该分支执行部署。
- `develop`：日常开发汇总。
- `function/<名称>`：从 `develop` 创建的功能或修复分支。

每次修改明确暂存相关文件，运行构建与测试后创建独立提交；不提交 `node_modules/`、`work/`、
构建缓存、真实账号或临时凭证。共享分支不强推，撤销使用 revert。

## 2. 发布前检查

```powershell
npm ci
node tools/sync-software-release.mjs
node tools/sync-plugin-releases.mjs
git diff --stat
npm run build
npm test
git diff --check
```

- 同步后的数据与已发布 Release 一致，版本没有回退；
- 页面、组件和样式改动有对应测试；
- 构建成功，`docs/.vitepress/dist/` 为本次构建产物；
- 本地预览检查首页、下载页、插件目录和移动端布局。

自定义域名构建使用根路径：设置 `$env:SITE_BASE='/'` 后再构建，或使用 Pages 工作流的
`SITE_BASE: /`。默认本地预览仍使用 `/DD_Monitor_Website/`。

## 3. 自动验证与部署

| 工作流 | 触发 | 行为 |
| --- | --- | --- |
| `ci.yml` | 推送到 `main`/`develop`、面向两者的 PR、手动 | `npm ci` → 构建 → `npm test` |
| `pages.yml` | 手动、每 6 小时定时 | 同步软件与插件 Release → 构建 → 测试 → 上传产物；仅 `main` 部署 |

Pages 工作流在构建前运行两个同步脚本，使用 Actions 只读 `GITHUB_TOKEN`，不需要额外跨仓库凭证。
同步或测试失败时不会部署；定时任务可能延迟，需要立即更新时手动运行。

部署入口：Actions → `Deploy website to Pages` → Run workflow（选择 `main`）。
部署成功后以工作流返回的地址和成功状态确认，不以“提交已推送”代替上线。

## 4. 上线后验证

1. 首页、软件页、下载页、插件目录和详情页可访问；
2. 下载按钮指向官方 Release，版本与当前正式发布一致；
3. `https://ddmonitor.top/` 使用 HTTPS，`www` 正常跳转；
4. `sitemap.xml`、`robots.txt` 和 canonical 指向正式域名；
5. 移动端布局、图片和视频加载正常；
6. 控制台和构建日志没有新增错误。

检查结果写进 PR 或提交说明，注明构建来源、检查范围和未覆盖环境。技术配置通过不等于搜索引擎已收录。

## 5. 回滚

- 内容或数据错误：revert 对应提交，重新运行 Pages 工作流；不删除历史。
- 同步脚本或工作流变更导致构建失败：先恢复上一份可构建配置，再修复并重新验证。
- 已部署版本异常：保留部署记录，revert 后重新部署；不强推 `main`/`develop`。
- 不直接编辑 `docs/.vitepress/dist/` 修复线上问题，构建产物由源码重建。

## 6. 与软件、插件仓库的配合

网站不发布软件或插件本体，只同步已经公开的 Release。顺序是：

1. 软件或插件仓库完成验证、打标签、创建 Release，并上传带 SHA-256 的资产；
2. 网站在构建前同步数据；
3. 构建、测试、部署；
4. 线上检查下载与版本展示。

软件或插件未正式发布时，网站不提前展示版本号或下载地址；插件介绍文案可以先行准备，但下载区仍以已发布资产为准。

## 相关文档

- [网站开发文档](README.md)
- [内容与数据同步](content-sync.md)
- [网站构建与发布](../WEBSITE.md)
- [文档规范](documentation.md)
- [贡献指南](../CONTRIBUTING.md)
