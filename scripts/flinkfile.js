/**
 * flinkfile - render friend links from a YAML data file
 * usage: {% flinkfile link %}  (reads source/_data/link.yml)
 */

'use strict'

const { join } = require('path')
const { url_for } = require('hexo-util')

hexo.extend.tag.register('flinkfile', (args) => {
  const name = (args[0] || 'link').trim()
  const file = join(hexo.source_dir, '_data', `${name}.yml`)

  const content = hexo.render.renderSync({ path: file, engine: 'yaml' })

  let result = ''

  content.groups.forEach((i) => {
    const className = i.class_name ? `<div class="flink-name">${i.class_name}</div>` : ''
    const classDesc = i.class_desc ? `<div class="flink-desc">${i.class_desc}</div>` : ''

    let listResult = ''

    i.link_list.forEach((j) => {
      listResult += `
          <div class="flink-list-item">
            <a href="${j.link}" title="${j.name}" target="_blank">
              <div class="flink-item-icon">
                <img class="no-lightbox" src="${j.avatar}" onerror='this.onerror=null;this.src="${url_for.call(hexo, hexo.theme.config.error_img.flink)}"' alt="${j.name}" />
              </div>
              <div class="flink-item-name">${j.name}</div>
              <div class="flink-item-desc" title="${j.descr}">${j.descr}</div>
            </a>
          </div>`
    })

    result += `${className}${classDesc} <div class="flink-list">${listResult}</div>`
  })

  return `<div class="flink">${result}</div>`
})
