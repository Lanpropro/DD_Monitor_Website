import { defineConfig } from 'vitepress'

const base = process.env.SITE_BASE || '/DD_Monitor_Website/'
const hostname = 'https://ddmonitor.top'

export default defineConfig({
  lang: 'zh-CN',
  title: 'DD 监控室 CE',
  description: 'DD 监控室 CE 是免费的 Windows 多平台直播同屏观看工具，支持多画面布局、独立音量控制、弹幕与平台插件扩展。提供软件下载、功能介绍和使用帮助。',
  base,
  cleanUrls: true,
  appearance: 'dark',
  head: [['link', { rel: 'icon', href: `${base}logo.svg` }]],
  sitemap: {
    hostname,
    transformItems: items => items.filter(item => item.url !== '404' && !item.url.startsWith('public/'))
  },
  transformHead({ pageData }) {
    if (pageData.relativePath === '404.md' || pageData.relativePath.startsWith('public/')) {
      return [['meta', { name: 'robots', content: 'noindex' }]]
    }
    const path = pageData.relativePath.replace(/(^|\/)index\.md$/, '$1').replace(/\.md$/, '')
    return [['link', { rel: 'canonical', href: `${hostname}/${path}` }]]
  },
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'DD 监控室 CE',
    sidebar: {
      '/plugins/': [{ text: '插件', items: [
        { text: '所有插件', link: '/plugins/' },
        { text: '国内直播平台', link: '/plugins/domestic_live' },
        { text: '海外直播平台', link: '/plugins/global_live' },
        { text: '比赛二路同步', link: '/plugins/match_sync' },
        { text: '安装与升级', link: '/guide' }
      ] }]
    },
    search: { provider: 'local', options: { locales: { root: { translations: {
      button: { buttonText: '搜索文档', buttonAriaLabel: '搜索文档' },
      modal: { noResultsText: '没有找到相关内容', resetButtonTitle: '清空搜索', footer: {
        selectText: '选择', navigateText: '切换', closeText: '关闭'
      } }
    } } } } },
    outline: { label: '本页内容' },
    docFooter: { prev: '上一页', next: '下一页' },
    darkModeSwitchLabel: '外观',
    sidebarMenuLabel: '目录',
    returnToTopLabel: '返回顶部',
    socialLinks: [{ icon: 'github', link: 'https://github.com/Lanpropro/DD_Monitor_Website' }],
    footer: {
      message: '基于 DD监控室的二次开发 · LGPL-2.1 · 平台标识仅用于来源识别',
      copyright: 'DD 监控室 CE · 软件与插件分别维护<span class="footer-contact"><span>联系我</span><a href="https://space.bilibili.com/193559518" target="_blank" rel="noopener noreferrer">B 站主页 ↗</a></span>'
    }
  }
})
