import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
const root = resolve(import.meta.dirname, '..')
const read = path => readFileSync(resolve(root,path),'utf8')

test('the website is independent from plugin source and keeps original release destinations', () => {
  assert.equal(existsSync(resolve(root,'plugins')),false)
  assert.equal(existsSync(resolve(root,'tools/build_plugins.py')),false)
  const plugins = JSON.parse(read('docs/data/plugins.json'))
  for (const plugin of plugins) assert.ok(plugin.download.startsWith('https://github.com/Lanpropro/DD_Monitor_Plugins/releases/download/'))
  const release = JSON.parse(read('docs/data/software-release.json'))
  assert.ok(release.download.startsWith('https://github.com/Lanpropro/DD_Monitor_CE/releases/download/'))
  assert.ok(read('docs/.vitepress/config.mjs').includes("base: '/DD_Monitor_Website/'"))
  const home = read('docs/.vitepress/dist/index.html')
  assert.ok(home.includes('/DD_Monitor_Website/wall/01.webp'))
  assert.ok(!home.includes('href="/DD_Monitor_Plugins/'))
  const pkg = JSON.parse(read('package.json'))
  assert.equal(pkg.scripts.dev,'npm run docs:dev')
  assert.ok(!JSON.stringify(pkg).includes('file:../'))
})

test('deployment is explicit and validation runs in the standalone repository', () => {
  assert.ok(read('.github/workflows/ci.yml').includes('workflow_dispatch:'))
  const workflow = read('.github/workflows/pages.yml')
  assert.ok(workflow.includes('workflow_dispatch:'))
  assert.ok(!workflow.includes('  push:'))
  assert.ok(workflow.includes("github.ref == 'refs/heads/main'"))
  assert.ok(workflow.includes('path: docs/.vitepress/dist'))
  for (const path of ['.github/workflows/ci.yml','.github/workflows/pages.yml']) {
    assert.ok(read(path).includes('npm run build')); assert.ok(read(path).includes('npm test'))
  }
  assert.ok(existsSync(resolve(root,'LICENSE')))
})
