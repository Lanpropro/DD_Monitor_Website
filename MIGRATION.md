# 网站仓库迁移记录

迁移日期：2026-10-22。
来源：`Lanpropro/DD_Monitor_Plugins`，源提交 `a6dac12ecee41463c1608cafe2a1cf8279d4a04e`。

从源分支筛选 docs/、package.json、package-lock.json、tests/website.test.mjs、WEBSITE.md、LICENSE 和 .gitignore 的历史，
使用 git-filter-repo 保留34个与网站相关的提交及其作者、时间、提交说明。过滤后的 commit SHA 与旧仓库不同。
插件源码、打包工具、安装包、真实账号配置和原仓库 Releases 不迁入网站仓库。

带入迁移前尚未提交的三处用户编辑：FeatureDemo.vue 主播名称、ScreenshotShowcase.vue 截图说明、plugins.json 卡片文案。
这些改动在新仓库的迁移提交中保存。截图和视频文件逐文件复核，内容未变。

站内基路径改为 /DD_Monitor_Website/，软件与插件下载 URL、版本和 SHA256 保持原值。
网站测试改为独立验证发布数据，不再读取插件源码清单。新仓库独立安装依赖，可脱离相邻仓库运行。

旧仓库完整 Git bundle、迁移前用户修改补丁和插件文件哈希保留在原仓库本机 work/website-migration-20261022/，不上传。
