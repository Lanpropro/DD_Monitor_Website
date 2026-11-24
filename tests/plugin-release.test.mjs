import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { mkdtemp, readFile, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { zipSync, strToU8 } from 'fflate'
import { displayPlugins, platformGroups } from '../docs/data/plugin-display.mjs'
import { pluginData, verifiedBytes, ensurePluginPages, catalogFromReleases } from '../tools/sync-plugin-releases.mjs'

const current = [{ id: 'match_sync', version: '1.2', name: '比赛二路同步', features: ['自动对齐比赛画面'] }]

test('built-in Bilibili interaction has a software link instead of a plugin download', () => {
  const plugins = JSON.parse(readFileSync(new URL('../docs/data/plugins.json', import.meta.url), 'utf8'))
  assert.ok(!plugins.some(plugin => plugin.id === 'bili_live'))
  const read = page => readFileSync(new URL(`../docs/.vitepress/dist/${page}.html`, import.meta.url), 'utf8')
  for (const page of ['index', 'plugins/index', 'plugins/bili_live', 'software', 'download']) {
    assert.ok(!read(page).includes('/releases/download/bili-live-v1.1/'), page)
  }
  const detail = read('plugins/bili_live')
  assert.ok(detail.includes('已内置 B 站直播互动'))
  assert.ok(detail.includes('>下载 DD监控室CE</a>'))
})

function publishedFixture() {
  const files = new Map()
  const release = (version, minimum = '0.6') => {
    const name = `match_sync-${version}.zip`
    const bytes = zipSync({ 'match_sync/plugin.json': strToU8(JSON.stringify({ id: 'match_sync', version, min_app_version: minimum })) })
    const url = `https://github.com/Lanpropro/DD_Monitor_Plugins/releases/download/match-sync-v${version}/${name}`
    files.set(url, bytes)
    return { tag_name: `match-sync-v${version}`, html_url: `https://github.com/Lanpropro/DD_Monitor_Plugins/releases/tag/match-sync-v${version}`,
      published_at: '2026-11-02T16:10:00Z', assets: [{ name, state: 'uploaded', browser_download_url: url,
        digest: `sha256:${createHash('sha256').update(bytes).digest('hex')}` }] }
  }
  return { files, release, request: async url => new Response(files.get(url), { status: files.has(url) ? 200 : 404 }) }
}

test('independent stable ZIP releases synchronize without a catalog and choose numeric versions', async () => {
  const f = publishedFixture()
  const releases = [f.release('1.5'), f.release('1.10'), { ...f.release('2.0'), prerelease: true }, { ...f.release('3.0'), draft: true }]
  const result = pluginData(await catalogFromReleases(releases, f.request), current)
  assert.equal(result[0].version, '1.10')
  assert.equal(result[0].minAppVersion, '0.6')
  assert.ok(result[0].release.endsWith('match-sync-v1.10'))
})

test('the website catalog skips the built-in plugin before and after its Release is removed', async () => {
  const fixture = publishedFixture()
  const other = fixture.release('1.5')
  const url = 'https://github.com/Lanpropro/DD_Monitor_Plugins/releases'
  const tag = 'bili-live-v1.1'
  const name = 'bili_live-1.1.zip'
  const retired = {
    tag_name: tag, html_url: `${url}/tag/${tag}`,
    assets: [{ name, state: 'uploaded', browser_download_url: `${url}/download/${tag}/${name}`,
      digest: `sha256:${'a'.repeat(64)}` }]
  }
  const withRetired = await catalogFromReleases([other, retired], fixture.request)
  const withoutRetired = await catalogFromReleases([other], fixture.request)
  assert.deepEqual(withRetired, withoutRetired)
  assert.deepEqual(withRetired.plugins.map(plugin => plugin.id), ['match_sync'])
})

test('legacy manifests use only catalog requirements matching the exact verified ZIP', async () => {
  const f = publishedFixture()
  const release = f.release('1.5', undefined)
  // Remove the field rather than using the helper default.
  const bytes = zipSync({ 'match_sync/plugin.json': strToU8(JSON.stringify({ id: 'match_sync', version: '1.5' })) })
  const asset = release.assets[0]
  asset.digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
  f.files.set(asset.browser_download_url, bytes)
  const catalog = { plugins: [{ id: 'match_sync', version: '1.5', min_app_version: '0.3', url: asset.browser_download_url, sha256: asset.digest.slice(7) }] }
  const catalogAsset = { name: 'plugin-catalog.json', state: 'uploaded', browser_download_url: 'https://github.com/Lanpropro/DD_Monitor_Plugins/releases/download/match-sync-v1.5/plugin-catalog.json' }
  function updateCatalog() {
    const body = Buffer.from(JSON.stringify(catalog))
    catalogAsset.digest = `sha256:${createHash('sha256').update(body).digest('hex')}`
    f.files.set(catalogAsset.browser_download_url, body)
  }
  release.assets.push(catalogAsset)
  updateCatalog()
  assert.equal((await catalogFromReleases([release], f.request)).plugins[0].min_app_version, '0.3')
  catalog.plugins[0].version = '1.4'
  updateCatalog()
  await assert.rejects(catalogFromReleases([release], f.request), /manifest disagrees/)
})

test('legacy requirements survive a later catalog pointing to a different ZIP with the same version', async () => {
  const f = publishedFixture()
  const release = f.release('1.2', undefined)
  // This legacy package intentionally omits the minimum version.
  const bytes = zipSync({ 'match_sync/plugin.json': strToU8(JSON.stringify({ id: 'match_sync', version: '1.2' })) })
  const asset = release.assets[0]
  asset.digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
  f.files.set(asset.browser_download_url, bytes)
  function catalog(tag, published, entry) {
    const body = Buffer.from(JSON.stringify({ plugins: [entry] }))
    const url = `https://github.com/Lanpropro/DD_Monitor_Plugins/releases/download/${tag}/plugin-catalog.json`
    f.files.set(url, body)
    return { tag_name: tag, html_url: `https://github.com/Lanpropro/DD_Monitor_Plugins/releases/tag/${tag}`,
      published_at: published, assets: [{ name: 'plugin-catalog.json', state: 'uploaded', browser_download_url: url,
        digest: `sha256:${createHash('sha256').update(body).digest('hex')}` }] }
  }
  const entry = { id: 'match_sync', version: '1.2', min_app_version: '0.3', url: asset.browser_download_url, sha256: asset.digest.slice(7) }
  const original = catalog('original', '2026-11-01', entry)
  const later = catalog('later', '2026-11-02', { ...entry, url: entry.url.replace('match-sync-v1.2', 'later'), sha256: 'b'.repeat(64) })
  const result = await catalogFromReleases([later, release, original], f.request)
  assert.equal(result.plugins[0].min_app_version, '0.3')
  assert.equal(result.plugins[0].url, asset.browser_download_url)
  await assert.rejects(catalogFromReleases([later, release], f.request), /manifest disagrees/)
})

test('independent ZIP synchronization rejects tampered bytes, wrong manifests and unsafe assets', async () => {
  for (const kind of ['hash', 'manifest', 'repository', 'minimum']) {
    const f = publishedFixture()
    const release = f.release('1.5')
    const asset = release.assets[0]
    if (kind === 'hash') asset.digest = `sha256:${'0'.repeat(64)}`
    if (kind === 'repository') asset.browser_download_url = asset.browser_download_url.replace('github.com', 'example.com')
    if (kind === 'manifest' || kind === 'minimum') {
      const bytes = zipSync({ 'match_sync/plugin.json': strToU8(JSON.stringify({ id: 'match_sync', version: kind === 'manifest' ? '1.4' : '1.5' })) })
      f.files.set(asset.browser_download_url, bytes)
      asset.digest = `sha256:${createHash('sha256').update(bytes).digest('hex')}`
    }
    await assert.rejects(catalogFromReleases([release], f.request))
  }
})
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
  catalog.plugins.push({ ...catalog.plugins[0], id: 'example_live', name: 'B站直播互动', description: '发送弹幕与表情',
    min_app_version: '0.5.1', asset_name: 'example_live-1.4.zip',
    url: catalog.plugins[0].url.replace('match_sync-1.4.zip', 'example_live-1.4.zip') })
  const result = pluginData(catalog, current)
  assert.equal(result.length, 2)
  assert.equal(result[1].id, 'example_live')
  assert.equal(result[1].minAppVersion, '0.5.1')
  assert.equal(result[1].autoCatalog, true)
  assert.deepEqual(pluginData(catalog, result), result)
  catalog.plugins.push({ ...catalog.plugins[1] })
  assert.throws(() => pluginData(catalog, current), /duplicate/)
  catalog.plugins.pop()
  catalog.plugins[1].id = '../escape'
  assert.throws(() => pluginData(catalog, current), /metadata/)
  catalog.plugins[1].id = 'example_live'
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

test('current platform split and host requirements are visible across the website', () => {
  const plugins = JSON.parse(readFileSync(new URL('../docs/data/plugins.json', import.meta.url)))
  for (const id of ['huya_live', 'douyu_live', 'douyin_live', 'twitch_live', 'youtube_live', 'chzzk_live', 'bili_watchlater', 'proxy_control']) assert.ok(plugins.some(p => p.id === id), id)
  const read = page => readFileSync(new URL(`../docs/.vitepress/dist/${page}.html`, import.meta.url), 'utf8')
  assert.ok(read('guide').includes('数据与存储'))
  assert.ok(read('plugins/bili_watchlater').includes('原始 0.8'))
  assert.ok(read('plugins/bili_watchlater').includes('热修复 1'))
  assert.ok(read('software').includes('即时回放'))
  assert.ok(read('software').includes('与主窗口同时播放'))
})

test('grouped cards link to platform download choices while release metadata stays current', () => {
  const plugins = JSON.parse(readFileSync(new URL('../docs/data/plugins.json', import.meta.url)))
  const read = page => readFileSync(new URL(`../docs/.vitepress/dist/${page}`, import.meta.url), 'utf8')
  const independent = Object.values(platformGroups).flat()
  const expectedCards = plugins.filter(plugin => !independent.includes(plugin.id))
  assert.deepEqual(displayPlugins.map(plugin => plugin.id), expectedCards.map(plugin => plugin.id))
  const catalog = read('plugins/index.html')
  const cards = catalog.match(/<article class="plugin-card">[\s\S]*?<\/article>/g) ?? []
  assert.equal(cards.length, expectedCards.length)
  for (const plugin of expectedCards) {
    const target = platformGroups[plugin.id] ? '#下载选择' : ''
    assert.equal(cards.filter(card => card.includes(`/plugins/${plugin.id}${target}"`)).length, 1, plugin.id)
  }
  for (const page of ['index.html', 'plugins/index.html']) {
    const html = read(page)
    for (const group of Object.keys(platformGroups)) assert.ok(html.includes(`/plugins/${group}#下载选择`), page)
    for (const id of independent) assert.ok(!html.includes(`href="/plugins/${id}"`), `${page} must group ${id}`)
    assert.ok(html.includes('/platforms/chzzk.png'))
  }
  assert.equal(displayPlugins.filter(p => p.platformPlugins).length, 2)
  for (const plugin of plugins) {
    const group = Object.entries(platformGroups).find(([, ids]) => ids.includes(plugin.id))?.[0]
    if (platformGroups[plugin.id]) continue
    const page = group ? `plugins/${group}.html` : `plugins/${plugin.id}.html`
    const details = read(page)
    assert.ok(details.includes(plugin.download), page)
    assert.ok(details.includes(`v${plugin.version}`), page)
    assert.ok(details.includes(plugin.release), page)
    assert.ok(details.includes(plugin.sha256), page)
    assert.ok(read('download.html').includes(plugin.download) || read('download.html').includes(`/plugins/${plugin.id}`))
  }
})
