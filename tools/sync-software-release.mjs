import { readFile, writeFile } from 'node:fs/promises'
import { pathToFileURL } from 'node:url'

const repository = 'https://github.com/Lanpropro/DD_Monitor_CE'

export function releaseData(latest, current) {
  const tag = latest.tag_name
  if (latest.draft || latest.prerelease || !/^v\d+\.\d+(?:\.\d+)?$/.test(tag)) throw new Error('Expected a stable software release')
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
  const portable = asset(`DDMonitorCE-${tag}-exe.zip`)
  return {
    ...current,
    verifiedOn: publishedOn,
    publishedOn,
    tag,
    download: portable.download,
    packageName: portable.name,
    release: latest.html_url,
    sha256: portable.sha256,
    installer: asset('DDMonitorSetup.exe')
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
