'use strict'

const { join } = require('path')

hexo.extend.filter.register('after_generate', () => {
  const src = join(hexo.source_dir, '_data', 'anime_quotes.json')
  let all
  try {
    all = require(src)
  } catch (e) {
    return
  }

  const SAMPLE = 300
  const picked = []
  const used = new Set()
  while (picked.length < SAMPLE && used.size < all.length) {
    const i = Math.floor(Math.random() * all.length)
    if (used.has(i)) continue
    used.add(i)
    picked.push({ t: all[i].t, f: all[i].f })
  }

  const js = `window.ANIME_QUOTE_POOL=${JSON.stringify(picked)};`
  const outDir = join(hexo.public_dir, 'js')
  require('fs').mkdirSync(outDir, { recursive: true })
  require('fs').writeFileSync(join(outDir, 'home-anime-pool.js'), js)
})

hexo.extend.filter.register('after_render:html', (htmlContent, data) => {
  if (!data || !data.page) return htmlContent

  const path = data.path || ''
  if (path !== 'index.html' && path !== '') return htmlContent
  if (!data.page.posts) return htmlContent

  const file = join(hexo.source_dir, '_data', 'quotes.yml')
  let quotes
  try {
    quotes = hexo.render.renderSync({ path: file, engine: 'yaml' })
  } catch (e) {
    return htmlContent
  }

  const configJson = JSON.stringify(quotes)
  const inject =
    `<script>window.HOME_QUOTE_CONFIG=${configJson};</script>` +
    `<script defer src="/js/home-anime-pool.js"></script>` +
    `<script defer src="/js/home-quote.js"></script></body>`

  if (/<\/body>/i.test(htmlContent)) {
    return htmlContent.replace(/<\/body>/i, inject)
  }
  return htmlContent
})
