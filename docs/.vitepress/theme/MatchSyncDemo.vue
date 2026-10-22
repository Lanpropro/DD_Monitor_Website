<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'

const steps = [
  { title:'选择主画面', text:'选一路比赛直播作为对照基准。', rect:[10,1,66,64], anchor:[46,33] },
  { title:'偏移微调', text:'调整另一路相对主画面的时间偏移。', rect:[10,65,66,34], anchor:[54,88] },
  { title:'混合声音', text:'每路声音独立控制；这里演示设置，不播放音频。', rect:[22,84,10,14], anchor:[27,91] },
  { title:'合并弹幕', text:'把不同来源的弹幕放进同一个面板。', rect:[76,1,23,98], anchor:[87,36] }
]
const sources = [
  { name:'玩机器 · Machine', platform:'斗鱼', color:'#53c8e8' },
  { name:'CS-advent', platform:'B站', color:'#fb7299' },
  { name:'CSBOY', platform:'虎牙', color:'#b29aff' }
]
const active = ref(0), main = ref(0), secondary = ref(2)
const offsets = ref([0,3.2,6.9]), volumes = ref([40,0,42]), muted = ref([false,true,false]), merged = ref(true)
const status = ref('点击截图上的标记，或选择下方功能开始体验。')
const relativeOffset = computed(() => Math.round((offsets.value[secondary.value] - offsets.value[main.value]) * 10) / 10)
const offsetMin = computed(() => Math.min(-10,relativeOffset.value))
const offsetMax = computed(() => Math.max(10,relativeOffset.value))
const offsetText = computed(() => `${relativeOffset.value > 0 ? '+' : ''}${relativeOffset.value.toFixed(1)} 秒`)
const messages = [
  { source:0, text:'这波配合漂亮' }, { source:2, text:'一起看这场比赛' },
  { source:1, text:'这个视角看得很清楚' }, { source:0, text:'下一回合继续' }, { source:2, text:'跟上主画面的节奏' }
]
function selectStep(index) { if (steps[index]) active.value = index }
function selectMain(index) {
  if (!sources[index]) return
  main.value = index
  if (secondary.value === index) secondary.value = sources.findIndex((_,i) => i !== index)
  status.value = `已将${sources[index].name}设为主画面，偏移以该路为基准。`
}
function setSecondary(index) { if (sources[index] && index !== main.value) secondary.value = index }
function setOffset(value) {
  const offset = Math.max(offsetMin.value,Math.min(offsetMax.value,Number(value)))
  offsets.value[secondary.value] = offsets.value[main.value] + offset
  status.value = `${sources[secondary.value].name}相对主画面的手动偏移为${offsetText.value}。`
}
function setVolume(index,value) { volumes.value[index] = Math.max(0,Math.min(100,Number(value))) }
function toggleMute(index) { muted.value[index] = !muted.value[index] }
function toggleMerged() { merged.value = !merged.value; status.value = merged.value ? '已将三路示意弹幕合并展示。' : '已按主播来源分开展示示意弹幕。' }
function reset() {
  main.value = 0; secondary.value = 2; offsets.value = [0,3.2,6.9]
  volumes.value = [40,0,42]; muted.value = [false,true,false]; merged.value = true
  status.value = '已恢复初始演示设置。'
}
const hotspotStyle = rect => ({ left:rect[0] + '%', top:rect[1] + '%', width:rect[2] + '%', height:rect[3] + '%' })
</script>

<template>
  <section class="match-sync-demo" aria-label="比赛二路同步交互示意">
    <div class="match-demo-heading"><p>真实界面 · 交互示意</p><button class="match-reset" @click="reset">重置演示</button></div>
    <div class="match-workspace">
      <div class="match-capture" data-reveal>
        <img class="sync-software" :src="withBase('/previews/match-sync.webp')" alt="比赛二路同步软件截图，主画面、对照、音量和弹幕区域可点选" width="1920" height="1080" loading="lazy" />
        <div class="main-source-badge">主画面 · {{ sources[main].name }}</div>
        <div class="match-comments" :class="{ separated:!merged }" :data-merged="merged">
          <strong>{{ merged ? '多房间弹幕' : '分路弹幕' }}</strong>
          <template v-if="merged"><p v-for="(message,i) in messages" :key="i"><b :style="{ color:sources[message.source].color }">[{{ sources[message.source].name }}]</b> {{ message.text }}</p></template>
          <template v-else><div v-for="(source,i) in sources" :key="source.name"><b :style="{ color:source.color }">{{ source.name }}</b><p v-for="message in messages.filter(item => item.source === i)" :key="message.text">{{ message.text }}</p></div></template>
        </div>
        <button v-for="(step,i) in steps" :key="step.title" class="match-hotspot" :style="hotspotStyle(step.rect)" :aria-label="'查看' + step.title + '交互'" :aria-pressed="active === i" @click="selectStep(i)"><span>{{ String(i + 1).padStart(2,'0') }} {{ step.title }}</span></button>
        <svg class="match-leader" viewBox="0 0 100 56.25" fill="none" aria-hidden="true"><polyline :points="`${steps[active].anchor[0]},${steps[active].anchor[1] * .5625} 98,${steps[active].anchor[1] * .5625} 98,28 100,28`" /><circle :cx="steps[active].anchor[0]" :cy="steps[active].anchor[1] * .5625" r=".6" /></svg>
      </div>
      <div class="match-settings">
        <span class="match-step-label">0{{ active + 1 }} / 操作体验</span><h4>{{ steps[active].title }}</h4><p class="match-step-description">{{ steps[active].text }}</p>
        <fieldset v-if="active === 0" class="source-picker"><legend>选择比赛主画面</legend><label v-for="(source,i) in sources" :key="source.name"><input type="radio" name="match-demo-main" :checked="main === i" @change="selectMain(i)" /><span>{{ source.name }}<small>{{ source.platform }}</small></span><span v-if="main === i" class="source-main">主画面</span></label></fieldset>
        <div v-else-if="active === 1" class="offset-settings"><label for="match-source">对照来源</label><select id="match-source" :value="secondary" @change="setSecondary(Number($event.target.value))"><option v-for="(source,i) in sources" :key="source.name" :value="i" :disabled="main === i">{{ source.name }}</option></select><label for="match-offset">相对主画面的偏移 <output>{{ offsetText }}</output></label><input id="match-offset" type="range" :min="offsetMin" :max="offsetMax" step="0.1" :value="relativeOffset" @input="setOffset($event.target.value)" /><div class="offset-ticks"><span>{{ offsetMin }} 秒</span><span>0</span><span>＋{{ offsetMax }} 秒</span></div><div class="offset-actions"><button aria-label="偏移减少0.1秒" @click="setOffset(relativeOffset - .1)">−0.1 秒</button><button @click="setOffset(0)">设为0秒</button><button aria-label="偏移增加0.1秒" @click="setOffset(relativeOffset + .1)">＋0.1 秒</button></div><p class="offset-help">正值延后，负值提前；仅展示手动偏移设置。</p></div>
        <div v-else-if="active === 2" class="sound-settings"><div v-for="(source,i) in sources" :key="source.name"><label :for="'match-volume-' + i">{{ source.name }}<output>{{ muted[i] ? '静音' : volumes[i] + '%' }}</output></label><div><button :aria-label="(muted[i] ? '取消静音' : '静音') + source.name" :aria-pressed="muted[i]" @click="toggleMute(i)">{{ muted[i] ? '取消静音' : '静音' }}</button><input :id="'match-volume-' + i" :aria-label="source.name + '模拟音量'" type="range" min="0" max="100" :value="volumes[i]" @input="setVolume(i,$event.target.value)" /></div></div></div>
        <div v-else class="merge-settings"><button :aria-pressed="merged" @click="toggleMerged">{{ merged ? '切换为分路弹幕' : '切换为合并弹幕' }}</button><p>截图右侧会跟随切换，来源颜色保持一致。</p></div>
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
.main-source-badge { position:absolute; top:4%; left:12%; max-width:60%; border-radius:4px; padding:3px 6px; color:#eef1f8; background:#101827ed; font-size:clamp(7px,.8vw,11px); }
.match-comments { position:absolute; inset:0 0 0 auto; width:24%; padding:8px; overflow:hidden; color:#d3dce8; background:#12161c; font-size:clamp(6px,.65vw,10px); line-height:1.8; }
.match-comments > strong { display:block; margin-bottom:8px; font-size:inherit; font-weight:500; color:#d3dce8; }
.match-comments p { margin:0 0 7px; }
.match-comments b { font-weight:500; }
.match-comments.separated > div { margin-bottom:7px; border-bottom:1px solid #ffffff1f; padding-bottom:5px; }
.match-hotspot { position:absolute; border:1px solid transparent; border-radius:4px; text-align:left; }
.match-hotspot > span { position:absolute; top:3px; left:3px; padding:3px 5px; border-radius:4px; background:#101827ed; color:#eef1f8; font-size:clamp(6px,.75vw,10px); }
.match-hotspot[aria-pressed=true] { border:2px solid var(--vp-c-brand-1); }
.match-hotspot[aria-pressed=true] > span { color:var(--vp-c-brand-1); }
.match-leader { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; color:var(--vp-c-brand-1); }
.match-leader polyline { stroke:currentColor; stroke-width:1.5px; vector-effect:non-scaling-stroke; }
.match-leader circle { fill:currentColor; }
.match-settings { min-width:0; }
.match-step-label { font-size:11px; color:var(--vp-c-brand-1); }
.match-settings h4 { margin:7px 0 8px; font-size:20px; font-weight:600; }
.match-step-description { margin:0 0 20px; font-size:13px; line-height:1.8; color:var(--vp-c-text-2); }
.source-picker { border:0; padding:0; margin:0; }
.source-picker legend { font-size:12px; margin-bottom:8px; color:var(--vp-c-text-2); }
.source-picker label { display:flex; align-items:center; gap:9px; padding:10px 0; border-bottom:1px solid var(--vp-c-divider); font-size:13px; cursor:pointer; }
.source-picker input { accent-color:var(--vp-c-brand-1); }
.source-picker small { display:block; font-size:11px; color:var(--vp-c-text-2); }
.source-main { margin-left:auto; font-size:10px; color:var(--vp-c-brand-1); white-space:nowrap; }
.offset-settings > label,.sound-settings label { display:block; font-size:12px; margin:12px 0 8px; }
.offset-settings select { width:100%; border:1px solid var(--vp-c-divider); border-radius:6px; padding:7px 9px; background:var(--vp-c-bg-soft); color:var(--vp-c-text-1); font-size:12px; }
.offset-settings input,.sound-settings input { width:100%; min-width:0; accent-color:var(--vp-c-brand-1); }
.offset-settings output,.sound-settings output { float:right; font-variant-numeric:tabular-nums; color:var(--vp-c-brand-1); }
.offset-ticks { display:flex; justify-content:space-between; color:var(--vp-c-text-2); font-size:10px; }
.offset-actions { display:flex; gap:5px; margin-top:15px; }
.offset-actions button,.sound-settings button,.merge-settings button { border:1px solid var(--vp-c-divider); border-radius:6px; padding:7px 8px; background:var(--vp-c-bg-soft); color:var(--vp-c-text-1); font-size:12px; }
.offset-help,.merge-settings p { font-size:11px; line-height:1.8; color:var(--vp-c-text-2); margin-top:12px; }
.sound-settings > div > div { display:flex; gap:10px; align-items:center; }
.sound-settings button { white-space:nowrap; }
.merge-settings button { border-color:var(--vp-c-brand-1); color:var(--vp-c-brand-1); }
.match-step-tabs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; margin-top:22px; }
.match-step-tabs button { display:flex; align-items:center; gap:10px; padding:13px 12px; border:1px solid var(--vp-c-divider); border-radius:8px; text-align:left; font-size:12px; color:var(--vp-c-text-2); background:var(--vp-c-bg-soft); }
.match-step-tabs button > span { font-size:10px; color:var(--vp-c-brand-1); }
.match-step-tabs button[aria-pressed=true] { border-color:var(--vp-c-brand-1); background:var(--vp-c-brand-soft); color:var(--vp-c-text-1); }
.match-status { min-height:22px; margin:14px 0 0; color:var(--vp-c-text-2); font-size:12px; line-height:1.8; }
.match-demo-note { margin:5px 0 0; color:var(--vp-c-text-2); font-size:11px; line-height:1.8; }
.match-sync-demo button:focus-visible,.match-sync-demo input:focus-visible,.match-sync-demo select:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:3px; }
@media (max-width:800px) { .match-workspace { grid-template-columns:1fr; gap:18px; } .match-leader { display:none; } .match-step-tabs { grid-template-columns:repeat(2,minmax(0,1fr)); } .match-settings { padding:16px; border:1px solid var(--vp-c-divider); border-radius:10px; } }
</style>
