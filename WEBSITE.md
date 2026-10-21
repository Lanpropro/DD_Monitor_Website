# 网站构建与发布

网站已独立到 `Lanpropro/DD_Monitor_Website`，本地目录为 `F:/CodexAppManager/Code/DD_Monitor_Website`。

## GitHub Pages

当前部署基路径为 `/DD_Monitor_Website/`，上线后的项目网址为：
https://lanpropro.github.io/DD_Monitor_Website/

1. 在网站仓库 Settings → Pages 中把 Source 选择为 GitHub Actions。
2. 在 Actions 中打开 Deploy website to Pages，选择 `main` 并手动运行。
3. 构建与测试通过后发布 `docs/.vitepress/dist/`。以工作流返回的网址及成功状态确认上线。

迁移本身只创建源码仓库及部署配置，不自动执行公开发布。
CI 对 main/develop 的推送与 PR 执行验证，部署工作流仅支持手动触发。

## 自定义域名

以后绑定独立域名时，将 config.mjs 的 base 改为 `/` 并同步修改 favicon 路径与测试中的 base；
再配置 Pages 自定义域名、DNS 与 HTTPS。本次迁移不购买域名、不改 DNS。

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
