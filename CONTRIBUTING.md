# 网站开发与贡献

> 类型：指南 ｜ 状态：维护中 ｜ 适用版本：全部版本 ｜ 更新：2026-11-14 ｜ 读者：网站维护者、贡献者

`main` 为可发布基线，`develop` 汇总日常开发，独立功能使用 `function/<名称>` 分支并通过 PR 合入 `develop`。
迁移时导入了已完成的网站提交历史；后续发布从 `develop` 通过 PR 合入 `main`。

## 文档

开发文档入口为[网站开发文档](development/README.md)，规则见[文档规范](development/documentation.md)。
同步与发布分别见[内容与数据同步](development/content-sync.md)和[发布流程](development/release.md)。

- 内部开发文档放在 `development/`，不放进 `docs/`，避免被 VitePress 构建和公开收录。
- 长期维护文档写元信息：类型、状态、适用版本、更新日期、读者。
- 每项改动明确暂存相关文件，更新受影响的文档与索引；不把说明只留在 PR 评论里。
- 跨仓库引用使用完整 GitHub URL；不写本机绝对路径、账号、Cookie 或令牌。
- 构建产物 `docs/.vitepress/dist/` 由 `npm run build` 生成，不手工编辑。

## 开发与验证

```powershell
npm ci
npm run dev
npm run build
npm test
git diff --check
```

`npm run dev` 使用 `http://127.0.0.1:5173/DD_Monitor_Website/`；`npm run preview` 预览构建结果。
提交前至少通过构建、`npm test` 和 `git diff --check`；新增页面或组件补充对应测试。

## 内容与数据

- 软件和插件下载数据来自各自仓库的正式 Release，由 `tools/sync-software-release.mjs` 与
  `tools/sync-plugin-releases.mjs` 同步；只接受官方地址和公开附件的 SHA-256。
- 同步只更新构建数据，不回写源码分支；人工文案通过 PR 修改。
- 不手改校验值绕过验证，不用本机重新打包的哈希替代公开附件。
- 不同仓库的发布顺序：先发布软件/插件，再同步网站，最后部署。

## 部署

CI 对 `main`/`develop` 的推送与 PR 执行构建和测试；Pages 工作流支持手动触发，并每 6 小时同步最新正式
Release 后构建、测试和发布。只有 `main` 会执行部署。上线后检查页面、下载地址、HTTPS、跳转和站点地图；
异常时 revert 对应提交并重新部署，不强推共享分支。

网站不保存插件源码、账号配置、Cookie 或临时凭证；`node_modules/`、`work/`、缓存和本机产物不提交。
不要使用 `git add .` 收集本机文件。共享分支不强推，撤销通过 revert 完成。
