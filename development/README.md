# 网站开发文档

> 类型：索引 ｜ 状态：维护中 ｜ 适用版本：全部版本 ｜ 更新：2026-11-14 ｜ 读者：网站维护者、贡献者

本目录放网站仓库的开发文档。`docs/` 是 VitePress 的**公开站点内容**，会被构建和部署；
内部开发说明放在本目录，不进入站点构建。

## 快速入口

| 我想… | 先看 |
| --- | --- |
| 本地启动、修改页面 | [README](../README.md)、[网站构建与发布](../WEBSITE.md) |
| 提交改动 | [贡献指南](../CONTRIBUTING.md) |
| 更新软件/插件下载数据 | [内容与数据同步](content-sync.md) |
| 构建、测试、部署与回滚 | [发布流程](release.md) |
| 新增或整理文档 | [文档规范](documentation.md) |

## 仓库边界

| 内容 | 位置 | 说明 |
| --- | --- | --- |
| 公开页面 | `docs/*.md`、`docs/plugins/*.md` | 会被 VitePress 构建；面向用户 |
| 主题与组件 | `docs/.vitepress/theme/` | 首页、插件卡片、预览与交互 |
| 构建数据 | `docs/data/software-release.json`、`docs/data/plugins.json` | 来自已发布 Release，由同步工具生成 |
| 站点静态资源 | `docs/public/` | 截图、视频、平台图标与素材说明 |
| 开发文档 | `development/` | 不进入站点构建 |
| 构建输出 | `docs/.vitepress/dist/` | 构建产物；不手工编辑 |
| 本机资料 | `work/`、`node_modules/` | 不提交 |

## 全流程

| 阶段 | 做什么 | 产出 |
| --- | --- | --- |
| 需求 | 明确页面、文案或数据变化 | Issue/PR 描述与验收条件 |
| 设计 | 确认页面结构、数据来源和回退 | 本目录或 PR 说明 |
| 实现 | 页面、组件、样式或数据同步脚本 | 代码与测试 |
| 验证 | 构建、`npm test`、检查同步后的数据 | 命令与结果 |
| 发布 | 合并到 `main`，手动或定时部署 | 部署记录与线上检查 |
| 同步 | 读取软件/插件正式 Release | `docs/data/*.json`（构建时更新，不手改） |

网站只展示已发布资产；软件与插件先发布，网站最后同步。详细介绍仍通过 PR 修改，自动同步不改写人工文案。

## 文档维护

- 开发文档写元信息：类型、状态、适用版本、更新日期、读者；格式见[文档规范](documentation.md)。
- 新增开发文档放本目录并在本页登记；不要放进 `docs/`，避免被当作公开页面构建。
- 跨仓库引用使用完整 GitHub URL；不写本机绝对路径、账号、Cookie 或令牌。
- 提交前运行：

```powershell
npm test
npm run build
git diff --check
```

完整规则见[文档规范](documentation.md)；共享写作原则见本体仓库的
[开发文档规范](https://github.com/Lanpropro/DD_Monitor_CE/blob/develop/docs/standards/documentation.md)。
