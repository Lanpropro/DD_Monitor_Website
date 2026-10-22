<script setup>
import { computed, ref } from 'vue'
import { withBase } from 'vitepress'
import previews from '../../data/platform-previews.json'
const props = defineProps({ plugin: { type: Object, required: true } })
const active = ref(0)
const preview = computed(() => previews[props.plugin.id])
function select(index) { if (index >= 0 && index < preview.value.cells.length) active.value = index }
const labelTop = index => 5 + index * 90 / (preview.value.cells.length - 1)
function anchor(index) {
  const [x,y,w,h] = preview.value.cells[index].rect
  return { x:(x + w / 2) / 100 * 1036, y:93.6 + (y + h / 2) / 100 * 582.75 }
}
function line(index) {
  const { x:startX, y:startY } = anchor(index)
  const endY = labelTop(index) / 100 * 780
  return `${startX},${startY} 1056,${startY} 1056,${endY} 1078,${endY}`
}
const rectStyle = rect => ({ left:rect[0] + '%', top:rect[1] + '%', width:rect[2] + '%', height:rect[3] + '%' })
</script>

<template>
  <figure class="platform-preview" :aria-label="plugin.name + '平台标注预览'">
    <div class="platform-diagram">
      <div class="diagram-capture">
        <img :src="withBase('/previews/' + preview.image)" :alt="plugin.name + '真实软件截图'" width="1920" height="1080" loading="lazy" />
        <button v-for="(cell,i) in preview.cells" :key="i" class="capture-hotspot" :style="rectStyle(cell.rect)" :aria-label="`画面 ${i + 1}，${cell.name}，${cell.platform || '平台待确认'}`" :aria-pressed="active === i" @click="select(i)"><span>{{ String(i + 1).padStart(2,'0') }}</span></button>
      </div>
      <svg class="platform-leaders" viewBox="0 0 1400 780" fill="none" aria-hidden="true"><polyline :points="line(active)" /><circle :cx="anchor(active).x" :cy="anchor(active).y" r="5" /></svg>
      <button v-for="(cell,i) in preview.cells" :key="i" class="platform-callout" :style="{ top:labelTop(i) + '%' }" :aria-pressed="active === i" @click="select(i)">
        <span class="callout-number">{{ String(i + 1).padStart(2,'0') }}</span><span class="callout-text"><strong>{{ cell.name }}</strong><span><img v-if="cell.icon" :src="withBase('/platforms/' + cell.icon)" alt="" />{{ cell.platform || '平台待确认' }}</span></span>
      </button>
    </div>
    <figcaption>{{ preview.note }}</figcaption>
  </figure>
</template>

<style scoped>
.platform-preview { margin:0; min-width:0; }
.platform-diagram { position:relative; aspect-ratio:1400/780; }
.diagram-capture { position:absolute; left:0; top:12%; width:74%; aspect-ratio:16/9; border:1px solid var(--vp-c-divider); border-radius:10px; overflow:hidden; background:var(--vp-c-bg-alt); }
.diagram-capture > img { display:block; width:100%; height:100%; object-fit:contain; }
.capture-hotspot { position:absolute; border:1px solid transparent; border-radius:4px; text-align:left; }
.capture-hotspot > span { position:absolute; left:5px; top:5px; padding:2px 5px; border-radius:4px; background:#101827e8; color:#f5f2ea; font-size:11px; line-height:1.4; }
.capture-hotspot[aria-pressed=true] { border:2px solid var(--vp-c-brand-1); background:color-mix(in srgb,var(--vp-c-brand-1) 7%,transparent); }
.platform-leaders { position:absolute; inset:0; width:100%; height:100%; pointer-events:none; color:var(--vp-c-brand-1); }
.platform-leaders polyline { stroke:currentColor; stroke-width:2; vector-effect:non-scaling-stroke; }
.platform-leaders circle { fill:currentColor; }
.platform-callout { position:absolute; left:77%; width:23%; display:flex; align-items:center; gap:10px; transform:translateY(-50%); padding:7px 10px; border:1px solid var(--vp-c-divider); border-radius:9px; color:var(--vp-c-text-2); background:var(--vp-c-bg-soft); text-align:left; }
.platform-callout[aria-pressed=true] { border-color:var(--vp-c-brand-1); color:var(--vp-c-text-1); background:var(--vp-c-brand-soft); }
.callout-number { font-size:11px; color:var(--vp-c-brand-1); font-variant-numeric:tabular-nums; }
.callout-text { min-width:0; }
.callout-text strong { display:block; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:12px; font-weight:500; }
.callout-text > span { display:flex; align-items:center; gap:5px; margin-top:2px; font-size:11px; }
.callout-text img { width:13px; height:13px; object-fit:contain; }
.platform-preview figcaption { margin-top:14px; font-size:12px; line-height:1.8; color:var(--vp-c-text-2); }
.capture-hotspot:focus-visible,.platform-callout:focus-visible { outline:2px solid var(--vp-c-brand-1); outline-offset:2px; }
@media (max-width:700px) {
  .platform-diagram { aspect-ratio:auto; display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:7px; }
  .diagram-capture { position:relative; top:auto; width:100%; grid-column:1/-1; margin-bottom:14px; }
  .platform-leaders { display:none; }
  .platform-callout { position:relative; top:auto !important; left:auto; width:100%; transform:none; padding:8px; }
  .capture-hotspot > span { left:2px; top:2px; font-size:9px; padding:1px 3px; }
}
</style>
