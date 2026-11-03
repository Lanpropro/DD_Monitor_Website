import { readFile, writeFile, access } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { pathToFileURL } from 'node:url'
import { unzipSync } from 'fflate'

const repository = 'https://github.com/Lanpropro/DD_Monitor_Plugins'
const versionPattern = /^\d+\.\d+(?:\.\d+)?$/

function compareVersions(a, b) {
  const left = a.split('.').map(Number)
  const right = b.split('.').map(Number)
  for (let i = 0; i < 3; i++) {
    const difference = (left[i] || 0) - (right[i] || 0)
    if (difference) return difference
  }
  return 0
}

export function pluginData(catalog, current) {
  if (!Array.isArray(catalog.plugins)) throw new Error('Missing plugin catalog entries')
  const additions = catalog.plugins.filter(item => !current.some(plugin => plugin.id === item.id)).map(item => {
    if (!/^[a-z][a-z0-9_]*$/.test(item.id) || typeof item.name !== 'string' || !item.name.trim() || typeof item.description !== 'string' || !item.description.trim()) {
      throw new Error('Invalid new plugin metadata')
    }
    return { id: item.id, name: item.name, description: item.description, version: '0.0', category: '功能扩展',
      platforms: [], icons: [], features: [item.description], featureDetails: [item.description], autoCatalog: true }
  })
  return [...current, ...additions].map(plugin => {
    const entries = catalog.plugins.filter(item => item.id === plugin.id)
    if (entries.length !== 1) throw new Error(`Missing or duplicate catalog entry: ${plugin.id}`)
    const item = entries[0]
    if (!versionPattern.test(item.version) || !versionPattern.test(item.min_app_version) || !/^[a-f0-9]{64}$/.test(item.sha256)) {
      throw new Error(`Invalid version or checksum: ${plugin.id}`)
    }
    if (compareVersions(item.version, plugin.version) < 0) throw new Error(`Plugin version would decrease: ${plugin.id}`)
    const url = new URL(item.url)
    const assetName = `${plugin.id}-${item.version}.zip`
    const prefix = '/Lanpropro/DD_Monitor_Plugins/releases/download/'
    const parts = url.pathname.slice(prefix.length).split('/')
    if (url.origin !== 'https://github.com' || !url.pathname.startsWith(prefix) || parts.length !== 2 || !parts[0] || parts[1] !== assetName || item.asset_name !== assetName || url.search || url.hash) {
      throw new Error(`Unexpected plugin download: ${plugin.id}`)
    }
    return {
      ...plugin,
      version: item.version,
      download: item.url,
      sha256: item.sha256,
      minAppVersion: item.min_app_version,
      release: `${repository}/releases/tag/${parts[0]}`
    }
  })
}

export async function ensurePluginPages(plugins, directory = new URL('../docs/plugins/', import.meta.url)) {
  for (const plugin of plugins) {
    const file = new URL(`${plugin.id}.md`, directory)
    try { await access(file); continue } catch (error) { if (error.code !== 'ENOENT') throw error }
    await writeFile(file, `---\ntitle: ${JSON.stringify(plugin.name)}\n---\n\n# 插件详情\n\n<PluginInfo id="${plugin.id}" />\n\n## 安装与使用\n\n请先确认最低软件版本，再[按安装教程导入 ZIP](/guide#安装插件)。具体功能、使用要求及更新记录见上方“发布说明”。\n`)
  }
}

export async function verifiedBytes(url, sha256, request = fetch) {
  const response = await request(url, { signal: AbortSignal.timeout(30000) })
  if (!response.ok) throw new Error(`Plugin asset lookup failed: HTTP ${response.status}`)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (createHash('sha256').update(bytes).digest('hex') !== sha256) throw new Error(`Plugin asset checksum mismatch: ${url}`)
  return bytes
}

export async function catalogFromReleases(releases, request = fetch) {
  const stable = releases.filter(release => !release.draft && !release.prerelease)
  const catalogRelease = [...stable].sort((a, b) => (b.published_at || '').localeCompare(a.published_at || '')).find(release => release.assets?.some(asset => asset.name === 'plugin-catalog.json'))
  let catalogEntries = []
  if (catalogRelease) {
    const asset = catalogRelease.assets.find(asset => asset.name === 'plugin-catalog.json')
    if (catalogRelease.html_url !== `${repository}/releases/tag/${catalogRelease.tag_name}` || asset.state !== 'uploaded' || asset.browser_download_url !== `${repository}/releases/download/${catalogRelease.tag_name}/plugin-catalog.json` || !/^sha256:[a-f0-9]{64}$/.test(asset.digest)) throw new Error('Invalid plugin catalog asset')
    const catalog = JSON.parse((await verifiedBytes(asset.browser_download_url, asset.digest.slice(7), request)).toString('utf8'))
    if (!Array.isArray(catalog.plugins)) throw new Error('Missing plugin catalog entries')
    catalogEntries = catalog.plugins
  }
  const selected = new Map()
  for (const release of stable) {
    for (const asset of release.assets || []) {
      const match = /^([a-z][a-z0-9_]*)-(\d+\.\d+(?:\.\d+)?)\.zip$/.exec(asset.name)
      if (!match) continue
      const [, id, version] = match
      if (release.html_url !== `${repository}/releases/tag/${release.tag_name}` || asset.state !== 'uploaded' || asset.browser_download_url !== `${repository}/releases/download/${release.tag_name}/${asset.name}` || !/^sha256:[a-f0-9]{64}$/.test(asset.digest)) {
        throw new Error(`Invalid published plugin asset: ${asset.name}`)
      }
      const previous = selected.get(id)
      if (!previous || compareVersions(version, previous.version) > 0) selected.set(id, { id, version, asset })
    }
  }
  if (!selected.size) throw new Error('No stable plugin ZIP assets found')
  const plugins = await Promise.all([...selected.values()].map(async ({ id, version, asset }) => {
    const sha256 = asset.digest.slice(7)
    const bytes = await verifiedBytes(asset.browser_download_url, sha256, request)
    const path = `${id}/plugin.json`
    const files = unzipSync(bytes, { filter: file => file.name === path })
    if (!files[path]) throw new Error(`Missing plugin manifest: ${id}`)
    const manifest = JSON.parse(new TextDecoder().decode(files[path]).replace(/^\uFEFF/, ''))
    const matching = catalogEntries.filter(item => item.id === id && item.version === version && item.sha256 === sha256 && item.url === asset.browser_download_url)
    const minimum = manifest.min_app_version ?? (matching.length === 1 ? matching[0].min_app_version : undefined)
    if (manifest.id !== id || manifest.version !== version || !versionPattern.test(minimum)) {
      throw new Error(`Plugin manifest disagrees with release asset: ${id}`)
    }
    return { id, version, name: manifest.name, description: manifest.description,
      min_app_version: minimum, asset_name: asset.name, url: asset.browser_download_url, sha256 }
  }))
  return { plugins }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const headers = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const releases = []
  for (let page = 1; ; page++) {
    const response = await fetch(`https://api.github.com/repos/Lanpropro/DD_Monitor_Plugins/releases?per_page=100&page=${page}`, {
      headers, signal: AbortSignal.timeout(30000)
    })
    if (!response.ok) throw new Error(`Plugin release lookup failed: HTTP ${response.status}`)
    const batch = await response.json()
    releases.push(...batch)
    if (batch.length < 100) break
  }
  const catalog = await catalogFromReleases(releases)
  const file = new URL('../docs/data/plugins.json', import.meta.url)
  const result = pluginData(catalog, JSON.parse(await readFile(file, 'utf8')))
  await ensurePluginPages(result)
  await writeFile(file, JSON.stringify(result, null, 2) + '\n')
  console.log(`Plugin releases synchronized: ${result.map(plugin => `${plugin.id} ${plugin.version}`).join(', ')}`)
}
