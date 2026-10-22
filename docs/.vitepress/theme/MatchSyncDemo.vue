<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { withBase } from 'vitepress'
import { MATCH_DURATION, matchTourFrame } from './match-tour.mjs'

const steps = [
  { title:'选择主画面', text:'以录屏中的比赛主画面作为对照基准。', rect:[10,1,66,64], anchor:[46,33] },
  { title:'偏移微调', text:'观看下方的双路对照区域与手动偏移设置。', rect:[10,65,66,34], anchor:[54,88] },
  { title:'混合声音', text:'每路直播都有独立的音量与静音设置。', rect:[22,84,10,14], anchor:[27,91] },
  { title:'合并弹幕', text:'收起对照区域，继续观看比赛与带来源标记的真实弹幕。', rect:[76,1,23,98], anchor:[87,36] }
]
const root = ref(null), video = ref(null), time = ref(0), reduced = ref(false), blocked = ref(false)
const frame = computed(() => matchTourFrame(time.value))
const active = computed(() => frame.value.active)
const focusedStep = computed(() => steps[active.value])
const hotspotStyle = rect => ({ left:rect[0] + '%', top:rect[1] + '%', width:rect[2] + '%', height:rect[3] + '%' })
const clock = value => `0:${String(Math.floor(value / 1000)).padStart(2,'0')}`
let observer, motion, visible = false, disposed = false
function readTime() { time.value = (video.value?.currentTime || 0) * 1000 }
function sync() {
  const player = video.value
  if (!player) return
  if (disposed || !visible || reduced.value || document.hidden) { player.pause(); return }
  player.muted = true
  const playing = player.play()
  playing?.then(() => {
    blocked.value = false
    if (disposed || !visible || reduced.value || document.hidden) player.pause()
  }).catch(() => { blocked.value = true })
}
function motionChanged() { reduced.value = motion.matches; sync() }
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
  disposed = true; video.value?.pause(); observer?.disconnect(); motion?.removeEventListener('change',motionChanged)
  document.removeEventListener('visibilitychange',sync)
})
</script>

<template>
  <section ref="root" class="match-sync-demo" aria-label="比赛二路同步自动演示">
    <div class="match-demo-heading"><p>真实录屏 · {{ reduced || blocked ? '静态预览' : '同步标注' }}</p><span class="match-clock">{{ clock(time) }} / {{ clock(MATCH_DURATION) }}</span></div>
    <div class="match-workspace">
      <div class="match-capture" data-reveal>
        <video ref="video" class="sync-software" :src="withBase('/videos/match-sync-recording.mp4')" :poster="withBase('/videos/match-sync-poster.webp')" muted loop playsinline preload="metadata" disablepictureinpicture disableremoteplayback tabindex="-1" aria-label="比赛二路同步真实录屏，标注随视频进度自动变化" @timeupdate="readTime" @seeking="readTime" @loadeddata="sync"></video>
        <div class="match-spotlight" :style="hotspotStyle(focusedStep.rect)" aria-hidden="true"><span>{{ String(active + 1).padStart(2,'0') }} {{ focusedStep.title }}</span></div>
        <svg class="match-leader" viewBox="0 0 100 56.25" fill="none" aria-hidden="true"><polyline :points="`${focusedStep.anchor[0]},${focusedStep.anchor[1] * .5625} 98,${focusedStep.anchor[1] * .5625} 98,28 100,28`" /><circle :cx="focusedStep.anchor[0]" :cy="focusedStep.anchor[1] * .5625" r=".6" /></svg>
      </div>
      <div class="match-settings"><span class="match-step-label">0{{ active + 1 }} / 本段演示</span><h4>{{ focusedStep.title }}</h4><p class="match-step-description">{{ focusedStep.text }}</p></div>
    </div>
    <div class="match-step-tabs" data-reveal role="group" aria-label="二路演示进度"><div v-for="(step,i) in steps" :key="step.title" :class="{ 'is-active':active === i }" :aria-current="active === i ? 'step' : undefined"><span>0{{ i + 1 }}</span><div><strong>{{ step.title }}</strong><small v-if="reduced">{{ step.text }}</small></div><i v-if="!reduced" :style="{ transform:`scaleX(${active > i ? 1 : active === i ? frame.progress : 0})` }" aria-hidden="true"></i></div></div>
  </section>
</template>
<style scoped>
.match-sync-demo { min-width:0; }
.match-demo-heading { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:12px; }
.match-demo-heading p { margin:0; font-size:12px; color:var(--vp-c-text-2); }
.match-clock { font-size:12px; color:var(--vp-c-text-2); font-variant-numeric:tabular-nums; }
.match-workspace { display:grid; grid-template-columns:minmax(0,2.2fr) minmax(240px,1fr); align-items:center; gap:20px; }
.match-capture { position:relative; min-width:0; aspect-ratio:16/9; border:1px solid var(--vp-c-divider); border-radius:10px; overflow:hidden; background:#101114; }
.sync-software { display:block; width:100%; height:100%; object-fit:contain; pointer-events:none; }
.match-spotlight { position:absolute; border:2px solid var(--vp-c-brand-1); border-radius:4px; box-shadow:0 0 0 2000px #050a1266; pointer-events:none; }
.match-leader { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; color:var(--vp-c-brand-1); }
.match-leader polyline { stroke:currentColor; stroke-width:1.5px; vector-effect:non-scaling-stroke; }
.match-leader circle { fill:currentColor; }
.match-settings { min-width:0; }
.match-step-label { font-size:11px; color:var(--vp-c-brand-1); }
.match-settings h4 { margin:7px 0 8px; font-size:20px; font-weight:600; }
.match-step-description { margin:0 0 20px; font-size:13px; line-height:1.8; color:var(--vp-c-text-2); }
.match-step-tabs { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; margin-top:22px; }
.match-step-tabs > div { position:relative; overflow:hidden; display:flex; align-items:center; gap:10px; padding:13px 12px; border:1px solid var(--vp-c-divider); border-radius:8px; text-align:left; font-size:12px; color:var(--vp-c-text-2); background:var(--vp-c-bg-soft); }
.match-step-tabs > div > span { font-size:10px; color:var(--vp-c-brand-1); }
.match-step-tabs > div.is-active { border-color:var(--vp-c-brand-1); background:var(--vp-c-brand-soft); color:var(--vp-c-text-1); }
@media (max-width:800px) { .match-workspace { grid-template-columns:1fr; gap:18px; } .match-leader { display:none; } .match-step-tabs { grid-template-columns:repeat(2,minmax(0,1fr)); } .match-settings { padding:16px; border:1px solid var(--vp-c-divider); border-radius:10px; } }
 .match-spotlight > span { position:absolute; top:3px; left:3px; padding:3px 5px; border-radius:4px; background:#101827ed; color:var(--vp-c-brand-1); font-size:clamp(6px,.75vw,10px); }
.match-step-tabs strong { font-size:inherit; font-weight:500; }
.match-step-tabs small { display:block; margin-top:6px; font-size:11px; line-height:1.8; }
.match-step-tabs i { position:absolute; left:0; right:0; bottom:0; height:2px; background:var(--vp-c-brand-1); transform-origin:left; }
@media (prefers-reduced-motion:reduce) { .match-step-tabs > div { align-items:flex-start; } }
</style>
