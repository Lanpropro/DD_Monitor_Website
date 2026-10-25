import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { pluginData, verifiedBytes, ensurePluginPages } from '../tools/sync-plugin-releases.mjs'

const current = [{ id: 'match_sync', version: '1.2', name: '比赛二路同步', features: ['自动对齐比赛画面'] }]
function fixture() {
  return { plugins: [{
    id: 'match_sync', version: '1.4', min_app_version: '0.5', asset_name: 'match_sync-1.4.zip',
    url: 'https://github.com/Lanpropro/DD_Monitor_Plugins/releases/download/match-sync-v1.4/match_sync-1.4.zip',
    sha256: 'a'.repeat(64)
  }] }
}

test('published plugin metadata updates all release fields while preserving website copy', () => {
  const catalog = fixture()
  const result = pluginData(catalog, current)
  assert.equal(result.length, 1)
  assert.equal(result[0].version, '1.4')
  assert.equal(result[0].minAppVersion, '0.5')
  assert.equal(result[0].download, catalog.plugins[0].url)
  assert.equal(result[0].sha256, 'a'.repeat(64))
  assert.equal(result[0].release, 'https://github.com/Lanpropro/DD_Monitor_Plugins/releases/tag/match-sync-v1.4')
  assert.equal(result[0].name, current[0].name)
  assert.deepEqual(result[0].features, current[0].features)
  assert.equal(current[0].version, '1.2')
})

test('missing, duplicate, stale or unsafe catalog entries fail without a partial update', () => {
  for (const mutate of [
    data => { data.plugins = [] },
    data => { data.plugins.push({ ...data.plugins[0] }) },
    data => { data.plugins[0].version = '1.1' },
    data => { data.plugins[0].version = '1.5-beta' },
    data => { data.plugins[0].min_app_version = null },
    data => { data.plugins[0].sha256 = 'bad' },
    data => { data.plugins[0].asset_name = 'global_live-1.4.zip' },
    data => { data.plugins[0].url = data.plugins[0].url.replace('github.com', 'example.com') },
    data => { data.plugins[0].url = data.plugins[0].url.replace('DD_Monitor_Plugins', 'other-repo') },
    data => { data.plugins[0].url += '?mirror=1' }
  ]) {
    const data = fixture()
    mutate(data)
    assert.throws(() => pluginData(data, current))
  }
})

test('independent releases update overseas URLs even when its version is unchanged', () => {
  const download = 'https://github.com/Lanpropro/DD_Monitor_Plugins/releases/download'
  const before = [
    { id: 'domestic_live', version: '1.2' },
    { id: 'global_live', version: '1.1', download: `${download}/v1.1/global_live-1.1.zip` }
  ]
  const catalog = { plugins: before.map(plugin => {
    const version = plugin.id === 'domestic_live' ? '1.3' : '1.1'
    const tag = plugin.id === 'domestic_live' ? 'domestic-live-v1.3' : 'global-live-v1.1'
    return { id: plugin.id, version, min_app_version: '0.3', sha256: 'b'.repeat(64),
      asset_name: `${plugin.id}-${version}.zip`, url: `${download}/${tag}/${plugin.id}-${version}.zip` }
  }) }
  const result = pluginData(catalog, before)
  assert.equal(result[0].version, '1.3')
  assert.equal(result[1].version, '1.1')
  assert.match(result[1].download, /\/global-live-v1\.1\/global_live-1\.1\.zip$/)
  assert.match(result[1].release, /\/releases\/tag\/global-live-v1\.1$/)
})

test('new published plugins join once and remain stable on later synchronizations', () => {
  const catalog = fixture()
  catalog.plugins.push({ ...catalog.plugins[0], id: 'bili_live', name: 'B站直播互动', description: '发送弹幕与表情',
    min_app_version: '0.5.1', asset_name: 'bili_live-1.4.zip',
    url: catalog.plugins[0].url.replace('match_sync-1.4.zip', 'bili_live-1.4.zip') })
  const result = pluginData(catalog, current)
  assert.equal(result.length, 2)
  assert.equal(result[1].id, 'bili_live')
  assert.equal(result[1].minAppVersion, '0.5.1')
  assert.equal(result[1].autoCatalog, true)
  assert.deepEqual(pluginData(catalog, result), result)
  catalog.plugins.push({ ...catalog.plugins[1] })
  assert.throws(() => pluginData(catalog, current), /duplicate/)
  catalog.plugins.pop()
  catalog.plugins[1].id = '../escape'
  assert.throws(() => pluginData(catalog, current), /metadata/)
  catalog.plugins[1].id = 'bili_live'
  catalog.plugins[1].sha256 = 'bad'
  assert.throws(() => pluginData(catalog, current), /checksum/)
})

test('automatic detail pages are created without overwriting edited pages', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'plugin-pages-'))
  try {
    const url = pathToFileURL(directory + '/')
    await ensurePluginPages([{ id: 'bili_live', name: 'B站直播互动' }], url)
    assert.ok((await readFile(join(directory, 'bili_live.md'), 'utf8')).includes('<PluginInfo id="bili_live" />'))
    await writeFile(join(directory, 'bili_live.md'), 'edited page')
    await ensurePluginPages([{ id: 'bili_live', name: '新名称' }], url)
    assert.equal(await readFile(join(directory, 'bili_live.md'), 'utf8'), 'edited page')
  } finally { await rm(directory, { recursive: true }) }
})

test('plugin versions are compared numerically, including two-digit and patch versions', () => {
  assert.throws(() => pluginData(fixture(), [{ ...current[0], version: '1.10' }]))
  assert.throws(() => pluginData(fixture(), [{ ...current[0], version: '1.4.1' }]))
  assert.equal(pluginData(fixture(), [{ ...current[0], version: '1.3.9' }])[0].version, '1.4')
})

test('release catalog and ZIP bytes require successful HTTP responses and matching SHA256', async () => {
  const bytes = Buffer.from('published plugin asset')
  const sha256 = createHash('sha256').update(bytes).digest('hex')
  const ok = async () => new Response(bytes)
  assert.deepEqual(await verifiedBytes('https://example.com/asset', sha256, ok), bytes)
  await assert.rejects(verifiedBytes('https://example.com/asset', '0'.repeat(64), ok), /checksum mismatch/)
  await assert.rejects(verifiedBytes('https://example.com/asset', sha256, async () => new Response('', { status: 404 })), /HTTP 404/)
})

test('the built homepage, catalog, download table and details share the published plugin data', () => {
  const plugins = JSON.parse(readFileSync(new URL('../docs/data/plugins.json', import.meta.url)))
  const dist = new URL('../docs/.vitepress/dist/', import.meta.url)
  const read = page => readFileSync(new URL(page, dist), 'utf8')
  for (const plugin of plugins) {
    for (const page of ['index.html', 'plugins/index.html', `plugins/${plugin.id}.html`]) {
      assert.ok(read(page).includes(plugin.download), `${page} download for ${plugin.id}`)
      assert.ok(read(page).includes(`v${plugin.version}`), `${page} version for ${plugin.id}`)
    }
    const details = read(`plugins/${plugin.id}.html`)
    assert.ok(details.includes(plugin.release))
    assert.ok(details.includes(plugin.sha256))
    const row = read('download.html').match(new RegExp(`<tr><td><a[^>]+href="[^"]*plugins/${plugin.id}"[\\s\\S]*?</tr>`))?.[0]
    assert.ok(row?.includes(`<td>${plugin.version}</td>`), `download table version for ${plugin.id}`)
    assert.ok(row?.includes(`<td>${plugin.minAppVersion}</td>`), `download table requirement for ${plugin.id}`)
  }
})
