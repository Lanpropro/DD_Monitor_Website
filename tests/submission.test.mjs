import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = path => readFileSync(resolve(root, path), 'utf8')
const link = 'https://github.com/Lanpropro/DD_Monitor_Plugins/issues/new?template=plugin-submission.yml'

test('home and plugin catalog share a static submission entry without accounts or status tracking', () => {
  const component = read('docs/.vitepress/theme/PluginSubmission.vue')
  assert.ok(read('docs/.vitepress/theme/HomePage.vue').includes('<PluginSubmission />'))
  assert.ok(read('docs/plugins/index.md').includes('<PluginSubmission />'))
  assert.ok(read('docs/.vitepress/theme/index.js').includes("app.component('PluginSubmission', PluginSubmission)"))
  assert.ok(component.includes(link))
  assert.ok(component.includes('网页无需注册'))
  assert.ok(component.includes('需要 GitHub 账号'))
  assert.ok(component.includes('无需 Fork 或创建 PR'))
  assert.ok(component.includes('target="_blank" rel="noopener noreferrer"'))
  assert.ok(component.includes('@media (max-width: 760px)'))
  assert.doesNotMatch(component, /<form|<input|fetch\(|localStorage|sessionStorage|Authorization|oauth|审核状态|拒绝原因/i)
})

test('production HTML exposes a working external issue-form link on both pages', () => {
  for (const page of ['index.html', 'plugins/index.html']) {
    const html = read('docs/.vitepress/dist/' + page)
    assert.ok(html.includes(link), page)
    assert.ok(html.includes('aria-label="提交新插件"'), page)
    assert.ok(html.includes('提交新插件'), page)
    assert.doesNotMatch(html, /href="\/DD_Monitor_Website\/https:/)
  }
})

test('integrated home retains submission entry alongside annotated previews and match focus controls', () => {
  const home = read('docs/.vitepress/theme/HomePage.vue')
  for (const component of ['<PluginSubmission />','<MatchSyncDemo v-if=','<PlatformPreview v-else']) assert.ok(home.includes(component),component)
  const html = read('docs/.vitepress/dist/index.html')
  for (const feature of ['aria-label="提交新插件"','class="match-spotlight"','aria-label="二路演示进度"','previews/match-sync.webp']) assert.ok(html.includes(feature),feature)
})
