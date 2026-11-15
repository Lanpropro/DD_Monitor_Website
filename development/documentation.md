# 网站文档规范

> 类型：规范 ｜ 状态：维护中 ｜ 适用版本：全部版本 ｜ 更新：2026-11-15 ｜ 读者：网站维护者、贡献者

本规范是网站仓库的文档基线。共享原则（全流程、证据分层、生命周期、状态词）见本体仓库的
[开发文档规范](https://github.com/Lanpropro/DD_Monitor_CE/blob/develop/docs/standards/documentation.md)；
下面写网站仓库的额外约定。

## 1. 公开内容与开发文档分开

| 位置 | 性质 | 规则 |
| --- | --- | --- |
| `docs/` | 公开站点的内容源码；构建产物在 `docs/.vitepress/dist/` | 面向用户，按页面写作；不放内部分析、账号信息或开发待办 |
| `docs/data/` | 构建数据 | 由同步工具生成或按发布资产更新；不手改 SHA-256 和下载地址 |
| `docs/.vitepress/` | 主题、配置、构建 | 组件与配置改动必须有测试 |
| `development/` | 内部开发文档 | 不进入构建；本规范的适用范围 |
| `work/` | 本机资料 | 不提交，不作为文档链接目标 |

开发文档不得放进 `docs/`，否则会被 VitePress 构建并可能被搜索引擎收录。

## 2. 元信息

长期维护的开发文档在标题下写：

```markdown
> 类型：指南 ｜ 状态：维护中 ｜ 适用版本：全部版本 ｜ 更新：2026-11-14 ｜ 读者：网站维护者
```

- 类型：`规范`、`指南`、`参考`、`记录`、`索引`。
- 状态：`草案`、`维护中`、`稳定`、`冻结`、`历史`。
- 网站没有独立版本号；“适用版本”写 `全部版本`，需要区分时写对应的软件版本族。
- 豁免：`README.md`、`CONTRIBUTING.md`、`AGENTS.md`、`LICENSE`、`MIGRATION.md`。

## 3. 内容与数据规则

- 软件下载信息来自 [DD_Monitor_CE](https://github.com/Lanpropro/DD_Monitor_CE) 的正式 Release；
  插件下载信息来自 [DD_Monitor_Plugins](https://github.com/Lanpropro/DD_Monitor_Plugins) 的正式 Release。
- SHA-256 必须来自公开附件；本机重新构建的哈希不能替代。
- 自动同步只更新构建数据，不回写源码分支；人工文案（页面、插件介绍、更新记录）仍通过 PR 修改。
- 同步失败时保留现有站点，不发布半更新数据；拒绝版本回退、非官方地址和清单不符。
- 不在仓库中保存插件源码、账号、Cookie、令牌或临时预览凭证。

## 4. 链接与命名

- 开发文档文件名使用小写英文加连字符：`content-sync.md`、`release.md`。
- 相对链接必须能在克隆后的仓库解析；同一仓库内使用相对路径，跨仓库使用完整 GitHub URL。
- 链接到已发布附件时写明仓库和标签，不只写“下载”。
- 不写本机绝对路径（例如某台电脑上的开发目录或 Windows 用户目录）；命令中的目录用相对路径或占位符。

## 5. 发布与历史

- `MIGRATION.md` 记录迁移事实，不随新功能改写；新的迁移或结构调整追加记录。
- 发布流程变更（分支、构建、部署、同步）与工作流文件同批更新。
- 站点部署后的验证结果写在 PR 或发布记录中，包含时间、构建来源和检查范围。
- 撤销部署使用 revert 后重新部署；不强推 `main`/`develop`。

## 6. 校验

```powershell
npm test
npm run build
git diff --check
```

`npm test` 会运行 `tests/docs.test.mjs`，检查开发文档入口、索引、链接、元信息和本机路径；
其余测试检查页面内容、数据同步和构建产物。构建产物 `docs/.vitepress/dist/` 由 `npm run build` 生成，
不手工编辑。

## 相关文档

- [网站开发文档](README.md)
- [内容与数据同步](content-sync.md)
- [发布流程](release.md)
- [网站构建与发布](../WEBSITE.md)
- [贡献指南](../CONTRIBUTING.md)
- 本体仓库的[开发文档规范](https://github.com/Lanpropro/DD_Monitor_CE/blob/develop/docs/standards/documentation.md)
