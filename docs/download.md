---
title: 下载与兼容性
---

<script setup>
import release from './data/software-release.json'
import plugins from './data/plugins.json'
</script>

# 下载 DD 监控室 CE

## Windows 安装器

支持 Windows 10 / 11 64 位。下载安装器，按提示安装后启动，无需另外安装 Python 或播放器运行库。

<div class="card-actions">
  <a class="action primary" :href="release.download">下载 {{ release.tag }} 安装器</a>
  <a class="action secondary" :href="release.release">查看 {{ release.tag }} 发布说明</a>
</div>

<p>当前版本 <strong>{{ release.tag }}</strong>，发布于 {{ release.publishedOn }}。上方按钮直接下载官方 <code>{{ release.packageName }}</code>。GitHub 自动生成的 Source code 是源码，不是安装器。</p>

<details><summary>核对安装包 SHA256</summary>
<code class="checksum">{{ release.sha256 }}</code>
</details>

安装器支持创建快捷方式及卸载。[安装与启动帮助](/guide#启动软件)。

## 插件兼容性

建议先将软件升级到最新公开版，再安装插件。各插件的最低软件版本见下表，还需要配套软件提供相应功能与运行库。

| 插件 | 下载版本 | 最低软件版本 | 使用要求 |
| --- | --- | --- | --- |
| [国内直播平台](/plugins/domestic_live) | {{ plugins.find(p => p.id === 'domestic_live').version }} | {{ plugins.find(p => p.id === 'domestic_live').minAppVersion }} | 国内平台取流、画质与弹幕接口，FFmpeg |
| [海外直播平台](/plugins/global_live) | {{ plugins.find(p => p.id === 'global_live').version }} | {{ plugins.find(p => p.id === 'global_live').minAppVersion }} | 海外平台取流、自动画质、聊天接口，FFmpeg |
| [比赛二路同步](/plugins/match_sync) | {{ plugins.find(p => p.id === 'match_sync').version }} | {{ plugins.find(p => p.id === 'match_sync').minAppVersion }} | 比赛同步接口、PyAV、NumPy、FFmpeg |

v0.5 将播放内核升级为 libmpv，增加编解码与硬件录制设置、Qt Quick 弹幕绘制、通知中心及 B 站弹幕发送。旧 v0.2 用户首次需手动升级软件，之后可使用配套版本提供的更新功能。新插件依赖的后续改进，以对应插件发布页的要求为准。

::: warning 旧 v0.2 的兼容限制
此前核实的 v0.2 EXE 附件缺少 `ddm.live_danmaku`、`ddm.global_danmaku`、`ddm.auto_quality` 等模块，不能只替换插件 ZIP 来补齐。请先升级软件。
:::

## 插件下载

[浏览全部插件](/plugins/)，选择需要的平台或比赛同步功能。每个插件有独立版本、固定下载链接与 SHA256 校验值，不要求所有插件同时更新。

下载后在「设置 → 插件」导入 ZIP、勾选启用并保存重启。[查看安装与升级帮助](/guide#安装插件)。

## 从源码运行

需要 Python 3.10+、libmpv 运行库、FFmpeg，以及当前软件仓库 `requirements.txt` 中的依赖。比赛同步还需要 PyAV 与 NumPy。

[打开软件源码与完整安装说明](https://github.com/Lanpropro/DD_Monitor_CE#快速开始)

GitHub 附件下载速度取决于网络环境。下载异常时打开官方发布页重试，避免使用来源不明的重打包文件。
