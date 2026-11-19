<script setup>
import { computed } from 'vue'
import { withBase } from 'vitepress'
import plugins from '../../data/plugins.json'
import { platformGroups } from '../../data/plugin-display.mjs'
const props = defineProps({ group: { type: String, required: true } })
const platforms = computed(() => platformGroups[props.group].map(id => plugins.find(plugin => plugin.id === id)))
</script>

<template>
  <div class="platform-downloads">
    <article v-for="plugin in platforms" :key="plugin.id" class="plugin-card">
      <div class="card-top"><div class="platform-icons"><img v-for="(icon, i) in plugin.icons" :key="icon" :src="withBase('/platforms/' + icon)" :alt="plugin.platforms[i]" width="32" height="32" /></div><span class="version">v{{ plugin.version }}</span></div>
      <h3>{{ plugin.name }}</h3>
      <p>{{ plugin.description }}</p>
      <p>最低软件版本 v{{ plugin.minAppVersion }}，建议先升级至 0.8 热修复 1。</p>
      <div class="card-actions"><a class="action primary" :href="plugin.download">下载 {{ plugin.name }} ZIP</a><a class="detail-link" :href="plugin.release">发布说明 ↗</a></div>
      <details><summary>安装包 SHA256</summary><code class="checksum">{{ plugin.sha256 }}</code></details>
    </article>
  </div>
</template>

<style scoped>
.platform-downloads { display: grid; gap: 20px; }
.platform-downloads h3 { margin-top: 0; }
</style>
