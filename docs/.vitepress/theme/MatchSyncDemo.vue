<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

const steps = [
  { title:'选择主画面', text:'以当前比赛画面作为对照基准。', rect:[10,1,66,64], anchor:[46,33] },
  { title:'偏移微调', text:'调整另一路相对主画面的时间偏移。', rect:[10,65,66,34], anchor:[54,88] },
  { title:'混合声音', text:'每路声音独立控制；这里演示设置，不播放音频。', rect:[22,84,10,14], anchor:[27,91] },
  { title:'合并弹幕', text:'把不同来源的弹幕放进同一个面板。', rect:[76,1,23,98], anchor:[87,36] }
]
const sources = [
  { name:'玩机器 · Machine' },
  { name:'CS-advent' },
  { name:'CSBOY' }
]
const active = ref(0)
const relativeOffset = ref(6.9), volumes = ref([40,0,42]), muted = ref([false,true,false])
const status = ref('点击截图上的标记，或选择下方功能开始体验。')
const offsetText = computed(() => `${relativeOffset.value > 0 ? '+' : ''}${relativeOffset.value.toFixed(1)} 秒`)
function selectStep(index) { if (steps[index]) active.value = index }
function setOffset(value) {
  relativeOffset.value = Math.round(Math.max(-10,Math.min(10,Number(value))) * 10) / 10
  status.value = `对照画面相对主画面的手动偏移为${offsetText.value}。`
}
function setVolume(index,value) { volumes.value[index] = Math.max(0,Math.min(100,Number(value))) }
function toggleMute(index) { muted.value[index] = !muted.value[index] }
function reset() {
  relativeOffset.value = 6.9; volumes.value = [40,0,42]; muted.value = [false,true,false]
  status.value = '已恢复初始演示设置。'
}
const focusedStep = computed(() => steps[active.value])
const detailStyle = computed(() => {
  const [x,y,w,h] = focusedStep.value.rect
  return { width:10000 / w + '%', height:10000 / h + '%', left:-x / w * 100 + '%', top:-y / h * 100 + '%' }
})
const hotspotStyle = rect => ({ left:rect[0] + '%', top:rect[1] + '%', width:rect[2] + '%', height:rect[3] + '%' })
</script>

<template>
  <section class="match-sync-demo" aria-label="比赛二路同步交互示意">
    <div class="match-demo-heading"><p>真实界面 · 交互示意</p><button class="match-reset" @click="reset">重置演示</button></div>
    <div class="match-workspace">
      <div class="match-capture" data-reveal>
        <img class="sync-software" :src="withBase('/previews/match-sync.webp')" alt="比赛二路同步软件截图，主画面、对照、音量和弹幕区域可点选" width="1920" height="1080" loading="lazy" />
        <div class="match-spotlight" :style="hotspotStyle(focusedStep.rect)" aria-hidden="true"></div>
        <button v-for="(step,i) in steps" :key="step.title" class="match-hotspot" :style="hotspotStyle(step.rect)" :aria-label="'查看' + step.title + '交互'" :aria-pressed="active === i" @click="selectStep(i)"><span>{{ String(i + 1).padStart(2,'0') }} {{ step.title }}</span></button>
        <svg class="match-leader" viewBox="0 0 100 56.25" fill="none" aria-hidden="true"><polyline :points="`${steps[active].anchor[0]},${steps[active].anchor[1] * .5625} 98,${steps[active].anchor[1] * .5625} 98,28 100,28`" /><circle :cx="steps[active].anchor[0]" :cy="steps[active].anchor[1] * .5625" r=".6" /></svg>
      </div>
      <div class="match-settings">
        <span class="match-step-label">0{{ active + 1 }} / 操作体验</span><h4>{{ steps[active].title }}</h4><p class="match-step-description">{{ steps[active].text }}</p>
        <figure v-if="active === 1 || active === 2" class="match-detail"><div :style="{ aspectRatio:focusedStep.rect[2] * 16 / (focusedStep.rect[3] * 9) }"><img :src="withBase('/previews/match-sync.webp')" :style="detailStyle" :alt="focusedStep.title + '区域放大，取自同一张真实截图'" width="1920" height="1080" /></div><figcaption>{{ focusedStep.title }} · 区域放大</figcaption></figure>
        <p v-if="active === 0" class="fixed-source-note">以截图中的比赛主画面为基准，对照区域展示另一路直播。</p>
        <div v-else-if="active === 1" class="offset-settings"><label for="match-offset">相对主画面的偏移 <output>{{ offsetText }}</output></label><input id="match-offset" type="range" min="-10" max="10" step="0.1" :value="relativeOffset" @input="setOffset($event.target.value)" /><div class="offset-ticks"><span>−10 秒</span><span>0</span><span>＋10 秒</span></div><div class="offset-actions"><button aria-label="偏移减少0.1秒" @click="setOffset(relativeOffset - .1)">−0.1 秒</button><button @click="setOffset(0)">设为0秒</button><button aria-label="偏移增加0.1秒" @click="setOffset(relativeOffset + .1)">＋0.1 秒</button></div><p class="offset-help">正值延后，负值提前；仅展示手动偏移设置。</p></div>
        <div v-else-if="active === 2" class="sound-settings"><div v-for="(source,i) in sources" :key="source.name"><label :for="'match-volume-' + i">{{ source.name }}<output>{{ muted[i] ? '静音' : volumes[i] + '%' }}</output></label><div><button :aria-label="(muted[i] ? '取消静音' : '静音') + source.name" :aria-pressed="muted[i]" @click="toggleMute(i)">{{ muted[i] ? '取消静音' : '静音' }}</button><input :id="'match-volume-' + i" :aria-label="source.name + '模拟音量'" type="range" min="0" max="100" :value="volumes[i]" @input="setVolume(i,$event.target.value)" /></div></div></div>
        <div v-else class="merge-settings"><p>右侧保留录屏中的真实合并弹幕，可看到各房间的来源名称与颜色。</p></div>
      </div>
    </div>
    <div class="match-step-tabs" data-reveal role="group" aria-label="二路交互功能"><button v-for="(step,i) in steps" :key="step.title" :aria-pressed="active === i" @click="selectStep(i)"><span>0{{ i + 1 }}</span>{{ step.title }}</button></div>
    <p class="match-status" role="status">{{ status }}</p><p class="match-demo-note">这是基于真实截图的交互示意，不连接直播、不执行真实同步或播放声音。</p>
  </section>
</template>

<style scoped>
.match-sync-demo { min-width:0; }
.match-demo-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px; }
.match-demo-heading p { margin:0; font-size:12px; color:var(--vp-c-text-2); }
.match-reset { font-size:12px; color:var(--vp-c-brand-1); }
.match-workspace { display:grid; grid-template-columns:minmax(0,2.2fr) minmax(240px,1fr); align-items:center; gap:20px; }
.match-capture { position:relative; min-width:0; aspect-ratio:16/9; border:1px solid var(--vp-c-divider); border-radius:10px; overflow:hidden; background:#101114; }
.sync-software { display:block; width:100%; height:100%; object-fit:contain; }
.match-spotlight { position:absolute; border:2px solid var(--vp-c-brand-1); border-radius:4px; box-shadow:0 0 0 2000px #050a12b3; pointer-events:none; }
.match-detail { margin:0 0 18px; }
.match-detail > div { position:relative; overflow:hidden; border:1px solid var(--vp-c-brand-1); border-radius:6px; background:#101114; }
.match-detail img { position:absolute; max-width:none; }
.match-detail figcaption { margin-top:5px; font-size:11px; color:var(--vp-c-text-2); }
.match-hotspot { position:absolute; border:1px solid transparent; border-radius:4px; text-align:left; }
.match-hotspot > span { position:absolute; top:3px; left:3px; padding:3px 5px; border-radius:4px; background:#101827ed; color:#eef1f8; font-size:clamp(6px,.75vw,10px); }
.match-hotspot[aria-pressed=false] > span { visibility:hidden; }
.match-hotspot:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:-2px; }
.match-hotspot[aria-pressed=true] > span { color:var(--vp-c-brand-1); }
.match-leader { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; color:var(--vp-c-brand-1); }
.match-leader polyline { stroke:currentColor; stroke-width:1.5px; vector-effect:non-scaling-stroke; }
.match-leader circle { fill:currentColor; }
.match-settings { min-width:0; }
.match-step-label { font-size:11px; color:var(--vp-c-brand-1); }
.match-settings h4 { margin:7px 0 8px; font-size:20px; font-weight:600; }
.match-step-description { margin:0 0 20px; font-size:13px; line-height:1.8; color:var(--vp-c-text-2); }
.offset-settings > label,.sound-settings label { display:block; font-size:12px; margin:12px 0 8px; }
.offset-settings input,.sound-settings input { width:100%; min-width:0; accent-color:var(--vp-c-brand-1); }
.offset-settings output,.sound-settings output { float:right; font-variant-numeric:tabular-nums; color:var(--vp-c-brand-1); }
.offset-ticks { display:flex; justify-content:space-between; color:var(--vp-c-text-2); font-size:10px; }
.offset-actions { display:flex; gap:5px; margin-top:15px; }
.offset-actions button,.sound-settings button { border:1px solid var(--vp-c-divider); border-radius:6px; padding:7px 8px; background:var(--vp-c-bg-soft); color:var(--vp-c-text-1); font-size:12px; }
.fixed-source-note,.offset-help,.merge-settings p { font-size:11px; line-height:1.8; color:var(--vp-c-text-2); margin-top:12px; }
.sound-settings > div > div { display:flex; gap:10px; align-items:center; }
.sound-settings button { white-space:nowrap; }
.match-step-tabs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; margin-top:22px; }
.match-step-tabs button { display:flex; align-items:center; gap:10px; padding:13px 12px; border:1px solid var(--vp-c-divider); border-radius:8px; text-align:left; font-size:12px; color:var(--vp-c-text-2); background:var(--vp-c-bg-soft); }
.match-step-tabs button > span { font-size:10px; color:var(--vp-c-brand-1); }
.match-step-tabs button[aria-pressed=true] { border-color:var(--vp-c-brand-1); background:var(--vp-c-brand-soft); color:var(--vp-c-text-1); }
.match-status { min-height:22px; margin:14px 0 0; color:var(--vp-c-text-2); font-size:12px; line-height:1.8; }
.match-demo-note { margin:5px 0 0; color:var(--vp-c-text-2); font-size:11px; line-height:1.8; }
.match-sync-demo button:focus-visible,.match-sync-demo input:focus-visible,.match-sync-demo select:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:3px; }
@media (max-width:800px) { .match-workspace { grid-template-columns:1fr; gap:18px; } .match-leader { display:none; } .match-step-tabs { grid-template-columns:repeat(2,minmax(0,1fr)); } .match-settings { padding:16px; border:1px solid var(--vp-c-divider); border-radius:10px; } }
</style>
