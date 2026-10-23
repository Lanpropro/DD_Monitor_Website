import test from 'node:test'
import assert from 'node:assert/strict'
import { releaseData } from '../tools/sync-software-release.mjs'

const repository = 'https://github.com/Lanpropro/DD_Monitor_CE'
function fixture() {
  const tag = 'v0.6'
  return {
    tag_name: tag, draft: false, prerelease: false,
    html_url: `${repository}/releases/tag/${tag}`, published_at: '2026-11-01T03:00:00Z',
    assets: [`DDMonitorCE-${tag}-exe.zip`, 'DDMonitorSetup.exe'].map(name => ({
      name, state: 'uploaded', browser_download_url: `${repository}/releases/download/${tag}/${name}`,
      digest: `sha256:${'a'.repeat(64)}`
    }))
  }
}

test('a new stable release updates both packages, date and checksums while preserving legacy records', () => {
  const legacyPackage = { tag: 'v0.2' }
  const result = releaseData(fixture(), { tag: 'v0.5', legacyPackage })
  assert.equal(result.tag, 'v0.6')
  assert.equal(result.publishedOn, '2026-11-01')
  assert.equal(result.packageName, 'DDMonitorCE-v0.6-exe.zip')
  assert.equal(result.download, `${repository}/releases/download/v0.6/DDMonitorCE-v0.6-exe.zip`)
  assert.equal(result.installer.download, `${repository}/releases/download/v0.6/DDMonitorSetup.exe`)
  assert.equal(result.sha256, 'a'.repeat(64))
  assert.equal(result.installer.sha256, 'a'.repeat(64))
  assert.deepEqual(result.legacyPackage, legacyPackage)
})

test('drafts, prereleases and incomplete or untrusted assets cannot be published', () => {
  for (const mutate of [
    data => { data.draft = true },
    data => { data.prerelease = true },
    data => { data.tag_name = 'v0.6-beta' },
    data => { data.assets.pop() },
    data => { data.assets[0].digest = null },
    data => { data.assets[0].state = 'new' },
    data => { data.assets[0].browser_download_url = 'https://example.com/repacked.zip' },
    data => { data.html_url = 'https://example.com/release' },
    data => { data.published_at = null }
  ]) {
    const data = fixture()
    mutate(data)
    assert.throws(() => releaseData(data, {}))
  }
})
