<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { MATCH_DURATION, matchTourFrame } from './match-tour.mjs'

const steps = [
  { title:'选择主画面', text:'以当前比赛画面作为对照基准。', rect:[10,1,66,64], anchor:[46,33] },
  { title:'偏移微调', text:'演示将对照画面的手动偏移逐步调至零。', rect:[10,65,66,34], anchor:[54,88] },
  { title:'混合声音', text:'演示调低主路音量，再静音另一路；不播放音频。', rect:[22,84,10,14], anchor:[27,91] },
  { title:'合并弹幕', text:'同一面板保留不同房间的来源名称与颜色。', rect:[76,1,23,98], anchor:[87,36] }
]
const sources = ['玩机器 · Machine','CS-advent','CSBOY']
const root = ref(null), time = ref(0), reduced = ref(false)
const frame = computed(() => matchTourFrame(time.value))
const active = computed(() => frame.value.active)
const focusedStep = computed(() => steps[active.value])
const detailStyle = computed(() => {
  const [x,y,w,h] = focusedStep.value.rect
  return { width:10000 / w + '%', height:10000 / h + '%', left:-x / w * 100 + '%', top:-y / h * 100 + '%' }
})
const hotspotStyle = rect => ({ left:rect[0] + '%', top:rect[1] + '%', width:rect[2] + '%', height:rect[3] + '%' })
const clock = value => `0:${String(Math.floor(value / 1000)).padStart(2,'0')}`
let observer, motion, visible = false, raf = 0, previous = null
function stop() { cancelAnimationFrame(raf); raf = 0; previous = null }
function tick(now) {
  raf = 0
  if (!visible || reduced.value || document.hidden) { previous = null; return }
  if (previous !== null) time.value = (time.value + Math.min(100,now - previous)) % MATCH_DURATION
  previous = now
  raf = requestAnimationFrame(tick)
}
function sync() {
  stop()
  if (visible && !reduced.value && !document.hidden) raf = requestAnimationFrame(tick)
}
function motionChanged() { reduced.value = motion.matches; if (reduced.value) time.value = 0; sync() }
onMounted(() => {
  motion = window.matchMedia('(prefers-reduced-motion: reduce)')
  reduced.value = motion.matches
  motion.addEventListener('change',motionChanged)
  document.addEventListener('visibilitychange',sync)
  if (typeof IntersectionObserver === 'function') {
    observer = new IntersectionObserver(entries => { visible = entries[0]?.isIntersecting ?? false; sync() }, { threshold:0.2 })
    observer.observe(root.value)
  } else { visible = true; sync() }
})
onUnmounted(() => {
  stop(); observer?.disconnect(); motion?.removeEventListener('change',motionChanged)
  document.removeEventListener('visibilitychange',sync)
})
</script>

<template>
  <section ref="root" class="match-sync-demo" aria-label="比赛二路同步自动演示">
    <div class="match-demo-heading"><p>真实界面 · {{ reduced ? '静态说明' : '自动演示' }}</p><span class="match-clock">{{ clock(time) }} / 0:34</span></div>
    <div class="match-workspace">
      <div class="match-capture" data-reveal>
        <img class="sync-software" :src="withBase('/previews/match-sync.webp')" alt="比赛二路同步软件真实截图，包含主画面、对照区、声音控制与真实合并弹幕" width="1920" height="1080" loading="lazy" />
        <template v-if="!reduced">
          <div class="match-spotlight" :style="hotspotStyle(focusedStep.rect)" aria-hidden="true"><span>{{ String(active + 1).padStart(2,'0') }} {{ focusedStep.title }}</span></div>
          <svg class="match-leader" viewBox="0 0 100 56.25" fill="none" aria-hidden="true"><polyline :points="`${focusedStep.anchor[0]},${focusedStep.anchor[1] * .5625} 98,${focusedStep.anchor[1] * .5625} 98,28 100,28`" /><circle :cx="focusedStep.anchor[0]" :cy="focusedStep.anchor[1] * .5625" r=".6" /></svg>
          <svg class="match-cursor" viewBox="0 0 24 28" :style="{ left:frame.cursor[0] + '%', top:frame.cursor[1] + '%' }" aria-hidden="true"><path d="M2 2v22l6-6 5 9 4-2-5-9h9Z" fill="white" stroke="#101827" stroke-width="1.5" /></svg>
        </template>
      </div>
      <div class="match-settings">
        <span class="match-step-label">0{{ active + 1 }} / {{ reduced ? '功能说明' : '本段演示' }}</span><h4>{{ focusedStep.title }}</h4><p class="match-step-description">{{ focusedStep.text }}</p>
        <figure v-if="!reduced && (active === 1 || active === 2)" class="match-detail"><div :style="{ aspectRatio:focusedStep.rect[2] * 16 / (focusedStep.rect[3] * 9) }"><img :src="withBase('/previews/match-sync.webp')" :style="detailStyle" :alt="focusedStep.title + '区域放大，取自同一张真实截图'" width="1920" height="1080" /></div><figcaption>{{ focusedStep.title }} · 区域放大</figcaption></figure>
        <p v-if="active === 0" class="fixed-source-note">以截图中的比赛主画面为基准，对照区域展示另一路直播。</p>
        <div v-else-if="active === 1" class="offset-settings"><p>相对主画面的偏移 <span class="demo-value">{{ frame.offset > 0 ? '+' : '' }}{{ frame.offset.toFixed(1) }} 秒</span></p><div class="demo-meter" aria-hidden="true"><span :style="{ transform:`scaleX(${(frame.offset + 10) / 20})` }"></span></div><div class="offset-ticks"><span>−10 秒</span><span>0</span><span>＋10 秒</span></div><p class="offset-help">正值延后，负值提前；这里演示手动微调过程。</p></div>
        <div v-else-if="active === 2" class="sound-settings"><div v-for="(source,i) in sources" :key="source"><p>{{ source }}<span class="demo-value">{{ frame.muted[i] ? '静音' : frame.volumes[i] + '%' }}</span></p><div class="demo-meter" aria-hidden="true"><span :style="{ transform:`scaleX(${frame.muted[i] ? 0 : frame.volumes[i] / 100})` }"></span></div></div></div>
        <div v-else class="merge-settings"><p>右侧为录屏中的真实合并弹幕。</p></div>
      </div>
    </div>
    <div class="match-step-tabs" data-reveal role="group" aria-label="二路演示进度"><div v-for="(step,i) in steps" :key="step.title" :class="{ 'is-active':active === i }" :aria-current="active === i ? 'step' : undefined"><span>0{{ i + 1 }}</span><div><strong>{{ step.title }}</strong><small v-if="reduced">{{ step.text }}</small></div><i v-if="!reduced" :style="{ transform:`scaleX(${active > i ? 1 : active === i ? frame.progress : 0})` }" aria-hidden="true"></i></div></div>
    <p class="match-demo-note">这是基于真实截图的自动演示，不连接直播、不执行真实同步或播放声音。</p>
  </section>
</template>
<style scoped>
.match-sync-demo { min-width:0; }
.match-demo-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px; }
.match-demo-heading p { margin:0; font-size:12px; color:var(--vp-c-text-2); }
.match-clock { font-size:12px; color:var(--vp-c-text-2); font-variant-numeric:tabular-nums; }
.match-workspace { display:grid; grid-template-columns:minmax(0,2.2fr) minmax(240px,1fr); align-items:center; gap:20px; }
.match-capture { position:relative; min-width:0; aspect-ratio:16/9; border:1px solid var(--vp-c-divider); border-radius:10px; overflow:hidden; background:#101114; }
.sync-software { display:block; width:100%; height:100%; object-fit:contain; }
.match-spotlight { position:absolute; border:2px solid var(--vp-c-brand-1); border-radius:4px; box-shadow:0 0 0 2000px #050a12b3; pointer-events:none; }
.match-detail { margin:0 0 18px; }
.match-detail > div { position:relative; overflow:hidden; border:1px solid var(--vp-c-brand-1); border-radius:6px; background:#101114; }
.match-detail img { position:absolute; max-width:none; }
.match-detail figcaption { margin-top:5px; font-size:11px; color:var(--vp-c-text-2); }
.match-leader { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; color:var(--vp-c-brand-1); }
.match-leader polyline { stroke:currentColor; stroke-width:1.5px; vector-effect:non-scaling-stroke; }
.match-leader circle { fill:currentColor; }
.match-settings { min-width:0; }
.match-step-label { font-size:11px; color:var(--vp-c-brand-1); }
.match-settings h4 { margin:7px 0 8px; font-size:20px; font-weight:600; }
.match-step-description { margin:0 0 20px; font-size:13px; line-height:1.8; color:var(--vp-c-text-2); }
.offset-ticks { display:flex; justify-content:space-between; color:var(--vp-c-text-2); font-size:10px; }
.fixed-source-note,.offset-help,.merge-settings p { font-size:11px; line-height:1.8; color:var(--vp-c-text-2); margin-top:12px; }
.match-step-tabs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; margin-top:22px; }
.match-step-tabs > div { position:relative; overflow:hidden; display:flex; align-items:center; gap:10px; padding:13px 12px; border:1px solid var(--vp-c-divider); border-radius:8px; text-align:left; font-size:12px; color:var(--vp-c-text-2); background:var(--vp-c-bg-soft); }
.match-step-tabs > div > span { font-size:10px; color:var(--vp-c-brand-1); }
.match-step-tabs > div.is-active { border-color:var(--vp-c-brand-1); background:var(--vp-c-brand-soft); color:var(--vp-c-text-1); }
.match-demo-note { margin:5px 0 0; color:var(--vp-c-text-2); font-size:11px; line-height:1.8; }
@media (max-width:800px) { .match-workspace { grid-template-columns:1fr; gap:18px; } .match-leader { display:none; } .match-step-tabs { grid-template-columns:repeat(2,minmax(0,1fr)); } .match-settings { padding:16px; border:1px solid var(--vp-c-divider); border-radius:10px; } }
 .match-spotlight > span { position:absolute; top:3px; left:3px; padding:3px 5px; border-radius:4px; background:#101827ed; color:var(--vp-c-brand-1); font-size:clamp(6px,.75vw,10px); }
.match-cursor { position:absolute; width:22px; height:26px; pointer-events:none; filter:drop-shadow(0 2px 3px #0008); }
.match-step-tabs strong { font-size:inherit; font-weight:500; }
.match-step-tabs small { display:block; margin-top:6px; font-size:11px; line-height:1.8; }
.match-step-tabs i { position:absolute; left:0; right:0; bottom:0; height:2px; background:var(--vp-c-brand-1); transform-origin:left; }
.demo-value { float:right; color:var(--vp-c-brand-1); font-variant-numeric:tabular-nums; }
.offset-settings > p,.sound-settings p { font-size:12px; margin:12px 0 8px; }
.sound-settings > div { margin-bottom:20px; }
.demo-meter { height:5px; border-radius:4px; overflow:hidden; background:var(--vp-c-divider); }
.demo-meter > span { display:block; width:100%; height:100%; background:var(--vp-c-brand-1); transform-origin:left; }
@media (prefers-reduced-motion:reduce) { .match-step-tabs > div { align-items:flex-start; } }
</style>
