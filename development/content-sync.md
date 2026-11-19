# 内容与数据同步

> 类型：指南 ｜ 状态：维护中 ｜ 适用版本：全部版本 ｜ 更新：2026-11-19 ｜ 读者：网站维护者

网站的下载版本、插件目录和校验值来自软件与插件仓库的**正式 Release**。本页说明哪些内容自动同步、
哪些必须人工维护，以及失败时如何处理。

## 1. 数据来源

| 数据 | 来源 | 本地文件 | 同步工具 |
| --- | --- | --- | --- |
| 软件版本、安装器地址、SHA-256、发布日期 | DD_Monitor_CE 最新正式 Release | `docs/data/software-release.json` | `tools/sync-software-release.mjs` |
| 插件版本、最低软件版本、下载地址、SHA-256、发布页 | DD_Monitor_Plugins 正式 Releases | `docs/data/plugins.json` | `tools/sync-plugin-releases.mjs` |

只接受官方仓库地址：

- 软件：`https://github.com/Lanpropro/DD_Monitor_CE/releases/...`
- 插件：`https://github.com/Lanpropro/DD_Monitor_Plugins/releases/...`

其他域名、手工拼接的地址或本机文件都不接受。

## 2. 软件同步

`tools/sync-software-release.mjs`：

- 读取 `releases/latest`，拒绝草稿、预发布和非稳定标签；
- 要求 `DDMonitorSetup.exe` 已上传，地址属于官方 Release，并提供 GitHub 计算的 `sha256`；
- 写入版本标签、发布日期、下载地址、安装包名、发布页与 SHA-256；
- 找不到资产或校验值时失败，保留现有数据。

```powershell
node tools/sync-software-release.mjs
```

本地运行会读取 GitHub API；频繁调用时设置只读的 `GITHUB_TOKEN`，不要使用带写权限的令牌。

## 3. 插件同步

`tools/sync-plugin-releases.mjs`：

- 分页读取插件仓库正式 Releases，按插件选择最高版本；
- 要求资产名为 `<插件ID>-<版本>.zip`，地址属于官方 Release，并提供 SHA-256；
- 下载后在内存中校验哈希并读取包内 `plugin.json` 的 ID、版本和最低软件版本，不执行、不解压到磁盘；
- 拒绝版本回退、清单不符、非官方地址；旧包缺少 `min_app_version` 时按新到旧检查正式 Release 的已校验目录，只复用 ID、版本、下载地址和 SHA-256 全部一致的条目；新目录指向另一份同版本包时，不会覆盖旧包的兼容要求；
- 新增插件通过校验后加入目录并生成基础详情页；已有页面的人工文案保留。

```powershell
node tools/sync-plugin-releases.mjs
```

同步更新 `docs/data/plugins.json`，新增插件时还会创建 `docs/plugins/<ID>.md` 的基础详情页；工作流不回写源码分支。本地运行后同时检查数据与新增页面的差异再提交。

首页、目录与侧栏通过 `docs/data/plugin-display.mjs` 将六个独立平台归入国内／海外两组；真实版本和包地址仍由 `plugins.json` 同步维护。汇总详情页的下载选择区直接读取独立包数据，不能用旧组合包版本代表整组平台。

## 4. 人工维护的内容

以下内容不会被同步覆盖：

- `docs/*.md`、`docs/plugins/*.md` 的页面正文和手写更新记录；
- `docs/.vitepress/theme/` 的首页、卡片、预览与交互；
- `docs/public/` 的截图、视频、平台图标与素材说明；
- 插件详情页的人工介绍、功能列表和更新记录。

页面介绍、功能描述和使用说明通过 PR 修改；自动同步只保证下载区和版本数据与已发布资产一致。

## 5. 验证

同步后至少执行：

```powershell
npm test
npm run build
git diff --check
```

检查点：

1. `docs/data/software-release.json` 的标签、发布日期和 SHA-256 与 GitHub Release 一致；
2. `docs/data/plugins.json` 的每个下载地址属于官方 Release，版本没有回退；
3. 新增插件有详情页，最低软件版本展示正确；
4. 首页、下载页、插件目录和侧栏引用的版本一致；
5. 构建成功，`npm test` 通过；同步失败时没有发布半更新数据。

真实下载和安装仍由人工在浏览器中检查；测试通过不代表所有网络环境都能访问。

## 6. 顺序与失败处理

1. 软件仓库发布正式 Release，上传安装器并提供 SHA-256；
2. 插件仓库按插件发布正式 Release，上传 ZIP 并提供 SHA-256；
3. 网站同步两个数据源，构建与测试；
4. 合并到 `main` 后部署，检查线上页面和下载链接。

同步或构建失败时工作流停止，`deploy` 作业不会执行，现有站点保持不变。先修复 Release 资产或元数据，
再重新运行；不要手改 JSON 绕过校验，也不要用本机重新打包的哈希替代公开附件。

## 相关文档

- [网站开发文档](README.md)
- [发布流程](release.md)
- [网站构建与发布](../WEBSITE.md)
- [文档规范](documentation.md)
