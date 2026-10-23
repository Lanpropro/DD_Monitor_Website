import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const dist = resolve(import.meta.dirname, '../docs/.vitepress/dist')
const read = file => readFileSync(resolve(dist, file), 'utf8')
const routes = ['', 'software', 'download', 'guide', 'plugins/', 'plugins/domestic_live', 'plugins/global_live', 'plugins/match_sync']

test('the homepage uses the exact requested search title without a repeated site suffix', () => {
  assert.equal(read('index.html').match(/<title>(.*?)<\/title>/)?.[1], 'DD 监控室 CE｜多平台直播同屏观看')
  assert.match(read('index.html'), /<meta name="description" content="[^"]*多平台直播同屏观看[^"]*"/)
})

test('the initial homepage head exposes the Bing and Google ownership verification tags', () => {
  const head = read('index.html').match(/<head>[\s\S]*?<\/head>/)?.[0]
  assert.ok(head)
  assert.ok(head.includes('<meta name="msvalidate.01" content="D61A2B4684282295EBCEC08CE03541F6">'))
  assert.ok(head.includes('<meta name="google-site-verification" content="DcaYRcnYrK1c7coKJIsiQzx5su8JjqrCVy4jUXPM3uM">'))
})

test('all content pages have a unique production canonical URL matching the sitemap', () => {
  const sitemap = read('sitemap.xml')
  const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])
  assert.equal(locations.length, routes.length)
  assert.equal(new Set(locations).size, routes.length)
  for (const route of routes) {
    const file = route === '' ? 'index.html' : route.endsWith('/') ? `${route}index.html` : `${route}.html`
    const html = read(file)
    const url = `https://ddmonitor.top/${route}`
    const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map(match => match[1])
    assert.deepEqual(canonicals, [url], file)
    assert.ok(locations.includes(url), `missing sitemap URL: ${url}`)
    assert.ok(!html.includes('name="robots" content="noindex"'))
  }
  assert.ok(!sitemap.includes('/DD_Monitor_Website/'))
  assert.ok(!sitemap.includes('preview.ddmonitor.top'))
  assert.ok(!sitemap.includes('/404'))
  assert.ok(!sitemap.includes('/public/'))
})

test('robots allows crawling and advertises the production sitemap while the error page is not indexed', () => {
  const robots = read('robots.txt')
  assert.match(robots, /User-agent: \*/)
  assert.match(robots, /Allow: \//)
  assert.ok(!robots.includes('Disallow: /'))
  assert.ok(robots.includes('Sitemap: https://ddmonitor.top/sitemap.xml'))
  for (const page of ['404.html', 'public/ASSETS.html', 'public/platforms/README.html']) {
    assert.ok(read(page).includes('name="robots" content="noindex"'))
    assert.ok(!read(page).includes('rel="canonical"'))
  }
})
