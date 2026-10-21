# 网站开发与贡献

`main` 为可发布基线，`develop` 汇总日常开发，独立功能使用 `function/<名称>` 分支并通过 PR 合入 `develop`。
迁移时导入了已完成的网站提交历史；后续发布从 `develop` 通过 PR 合入 `main`。

每次修改明确暂存相关文件，运行 `npm run build`、`npm test` 和 `git diff --check` 后创建对应 commit。
不要提交 node_modules、构建输出、work、本机配置、Cookie 或其他凭证。不要使用 `git add .` 收集本机文件。
共享分支不强推，撤销通过 revert 完成。

网站下载信息来自软件和插件仓库已发布的 Release，修改展示文案不会改变插件实现。
测试与开发不依赖相邻软件、插件仓库，也不读取真实账号或发送弹幕。
公开部署通过 Pages 手动工作流执行，发布前确认展示内容与下载链接。
