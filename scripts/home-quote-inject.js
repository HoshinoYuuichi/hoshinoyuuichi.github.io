'use strict'

const { join } = require('path')

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
  const inject = `<script>window.HOME_QUOTE_CONFIG=${configJson};</script><script defer src="/js/home-quote.js"></script></body>`

  if (/<\/body>/i.test(htmlContent)) {
    return htmlContent.replace(/<\/body>/i, inject)
  }
  return htmlContent
})
