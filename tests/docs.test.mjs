import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { dirname, resolve } from 'node:path'

const root = resolve(import.meta.dirname, '..')
const read = path => readFileSync(resolve(root, path), 'utf8')
const links = text => [...text.matchAll(/\]\(([^)]+)\)/g)].map(match => match[1])
const development = resolve(root, 'development')

const metadata = /^> 类型：(\S+) ｜ 状态：(\S+) ｜ 适用版本：([^｜]+) ｜ 更新：(\d{4}-\d{2}-\d{2}) ｜ 读者：(.+)$/m

test('development documents are indexed and kept out of the published site', () => {
  const documents = ['README.md', 'documentation.md', 'content-sync.md', 'release.md']
  for (const name of documents) assert.ok(existsSync(resolve(development, name)), name)
  assert.equal(existsSync(resolve(root, 'docs/development')), false)

  const contributing = read('CONTRIBUTING.md')
  for (const name of documents) assert.ok(contributing.includes(`(development/${name})`), name)
  assert.ok(read('README.md').includes('(development/README.md)'))
  assert.ok(read('WEBSITE.md').includes('(development/README.md)'))

  const seen = new Set()
  const queue = [resolve(development, 'README.md')]
  while (queue.length) {
    const file = queue.pop()
    if (seen.has(file)) continue
    seen.add(file)
    for (const target of links(readFileSync(file, 'utf8'))) {
      if (target.startsWith('#') || target.includes('://') || target.startsWith('mailto:')) continue
      const destination = resolve(dirname(file), target.split('#')[0])
      if (existsSync(destination) && destination.endsWith('.md') && destination.startsWith(development)) {
        queue.push(destination)
      }
    }
  }
  const missing = readdirSync(development)
    .filter(name => name.endsWith('.md'))
    .map(name => `development/${name}`)
    .filter(name => !seen.has(resolve(root, name)))
  assert.deepEqual(missing, [])
})

test('development documents declare type, status, version, update date and audience', () => {
  for (const path of ['development/README.md', 'development/documentation.md',
    'development/content-sync.md', 'development/release.md']) {
    const match = read(path).match(metadata)
    assert.ok(match, `missing metadata: ${path}`)
    const [, type, status, version, updated, readers] = match
    assert.ok(['规范', '指南', '参考', '记录', '索引'].includes(type), path)
    assert.ok(['草案', '维护中', '稳定', '冻结', '历史'].includes(status), path)
    assert.ok(version.trim() === '全部版本' || /^\d+\.\d+(\.x)?$/.test(version.trim()), path)
    assert.ok(new Date(`${updated}T00:00:00`) <= new Date(), path)
    assert.ok(readers.trim().length > 0, path)
  }
})

test('relative links in repository documentation resolve', () => {
  const documents = ['README.md', 'CONTRIBUTING.md', 'WEBSITE.md', 'MIGRATION.md',
    ...readdirSync(development).filter(name => name.endsWith('.md')).map(name => `development/${name}`)]
  for (const path of documents) {
    const file = resolve(root, path)
    for (const target of links(read(file))) {
      if (target.startsWith('#') || target.includes('://') || target.startsWith('mailto:')) continue
      const destination = resolve(dirname(file), target.split('#')[0])
      assert.ok(existsSync(destination), `${path}: missing ${target}`)
    }
  }
})

test('development documents avoid machine paths, secrets and cross-repository relative links', () => {
  const documents = ['README.md', 'CONTRIBUTING.md', 'WEBSITE.md',
    ...readdirSync(development).filter(name => name.endsWith('.md')).map(name => `development/${name}`)]
  for (const path of documents) {
    const source = read(path)
    for (const pattern of ['C:\\Users\\', 'F:\\CodexAppManager', 'F:/CodexAppManager', 'SESSDATA=', 'bili_jct=']) {
      assert.ok(!source.includes(pattern), `${path}: ${pattern}`)
    }
    assert.ok(!source.includes('../DD_Monitor_CE') && !source.includes('../DD_Monitor_Plugins'), path)
  }
})

test('sync and release documentation match the tools and data files', () => {
  const sync = read('development/content-sync.md')
  for (const text of ['tools/sync-software-release.mjs', 'tools/sync-plugin-releases.mjs',
    'docs/data/software-release.json', 'docs/data/plugins.json', 'GITHUB_TOKEN']) {
    assert.ok(sync.includes(text), text)
  }
  const release = read('development/release.md')
  for (const text of ['ci.yml', 'pages.yml', 'SITE_BASE', 'main']) {
    assert.ok(release.includes(text), text)
  }
  assert.doesNotThrow(() => JSON.parse(read('docs/data/software-release.json')))
  assert.doesNotThrow(() => JSON.parse(read('docs/data/plugins.json')))
})
