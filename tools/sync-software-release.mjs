import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const repository = 'https://github.com/Lanpropro/DD_Monitor_CE'
const versionPattern = /^v(\d+)\.(\d+)(?:\.(\d+))?(?:-hotfix\.(\d+))?$/

export function releaseData(latest, current) {
  const tag = latest.tag_name
  const version = versionPattern.exec(tag)
  if (latest.draft || latest.prerelease || !version) throw new Error('Expected a stable software release')
  const previous = versionPattern.exec(current.tag ?? '')
  if (previous) {
    const parts = match => [Number(match[1]), Number(match[2]), Number(match[3] ?? 0), Number(match[4] ?? 0)]
    const nextParts = parts(version)
    const previousParts = parts(previous)
    const lower = nextParts.findIndex((part, index) => part !== previousParts[index])
    if (lower !== -1 && nextParts[lower] < previousParts[lower]) throw new Error('Software version would decrease')
  }
  if (latest.html_url !== `${repository}/releases/tag/${tag}`) throw new Error('Unexpected release repository')
  const publishedOn = latest.published_at?.slice(0, 10)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(publishedOn)) throw new Error('Missing publication date')
  function asset(name) {
    const value = latest.assets.find(item => item.name === name)
    if (!value || value.state !== 'uploaded' || value.browser_download_url !== `${repository}/releases/download/${tag}/${name}` || !/^sha256:[a-f0-9]{64}$/.test(value.digest)) {
      throw new Error(`Missing or invalid release asset: ${name}`)
    }
    return { name, download: value.browser_download_url, sha256: value.digest.slice(7) }
  }
  const installer = asset('DDMonitorSetup.exe')
  return {
    ...current,
    verifiedOn: publishedOn,
    publishedOn,
    tag,
    download: installer.download,
    packageName: installer.name,
    release: latest.html_url,
    sha256: installer.sha256
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const headers = { Accept: 'application/vnd.github+json' }
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`
  const response = await fetch('https://api.github.com/repos/Lanpropro/DD_Monitor_CE/releases/latest', {
    headers, signal: AbortSignal.timeout(30000)
  })
  if (!response.ok) throw new Error(`Release lookup failed: HTTP ${response.status}`)
  const file = new URL('../docs/data/software-release.json', import.meta.url)
  const current = JSON.parse(await readFile(file, 'utf8'))
  const result = releaseData(await response.json(), current)
  await writeFile(file, JSON.stringify(result, null, 2) + '\n')
  console.log(`Software release synchronized: ${result.tag}`)
}
