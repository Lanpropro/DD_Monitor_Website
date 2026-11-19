import plugins from './plugins.json' with { type: 'json' }

export const platformGroups = {
  domestic_live: ['huya_live', 'douyu_live', 'douyin_live'],
  global_live: ['twitch_live', 'youtube_live', 'chzzk_live']
}
const platformIds = Object.values(platformGroups).flat()
export const displayPlugins = plugins.filter(plugin => !platformIds.includes(plugin.id)).map(plugin => {
  const ids = platformGroups[plugin.id]
  if (!ids) return plugin
  const platforms = ids.map(id => plugins.find(item => item.id === id))
  return { ...plugin, category: plugin.id === 'domestic_live' ? '国内直播' : '海外直播',
    platforms: platforms.flatMap(item => item.platforms), icons: platforms.flatMap(item => item.icons),
    description: plugin.id === 'domestic_live' ? '按需选择虎牙、斗鱼与抖音的独立平台插件。' : '按需选择 Twitch、YouTube 与 CHZZK 的独立平台插件。',
    features: ['按平台选择下载', '独立安装与更新', '沿用原有关注与分组'], platformPlugins: platforms }
})
