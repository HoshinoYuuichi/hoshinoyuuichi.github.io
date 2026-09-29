'use strict'

const { join } = require('path')

const file = join(hexo.source_dir, '_data', 'site.yml')

let site = {}
try {
  site = hexo.render.renderSync({ path: file, engine: 'yaml' }) || {}
} catch (e) {
  site = {}
}

if (site.umami_script && site.umami_id) {
  hexo.extend.injector.register(
    'head-end',
    `<script async defer src="${site.umami_script}" data-website-id="${site.umami_id}"></script>`,
    'default'
  )
}
