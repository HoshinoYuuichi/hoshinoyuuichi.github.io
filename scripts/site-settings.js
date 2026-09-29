'use strict'

const { join } = require('path')

function loadYml(name) {
  const file = join(hexo.source_dir, '_data', `${name}.yml`)
  return hexo.render.renderSync({ path: file, engine: 'yaml' })
}

hexo.extend.filter.register('before_generate', () => {
  let site
  try {
    site = loadYml('site')
  } catch (e) {
    return
  }

  const theme = hexo.theme.config
  const aside = (theme.aside = theme.aside || {})

  if (site.announcement !== undefined && site.announcement !== '') {
    aside.card_announcement = aside.card_announcement || {}
    aside.card_announcement.content = site.announcement
  }

  if (site.author_desc !== undefined) {
    aside.card_author = aside.card_author || {}
    aside.card_author.description = site.author_desc
  }

  if (site.runtime_publish_date) {
    theme.runtimeshow = theme.runtimeshow || {}
    theme.runtimeshow.publish_date = site.runtime_publish_date
  }

  if (aside.card_author && aside.card_author.button) {
    if (site.follow_me_text) aside.card_author.button.text = site.follow_me_text
    if (site.follow_me_link) aside.card_author.button.link = site.follow_me_link
    if (site.follow_me_icon) aside.card_author.button.icon = site.follow_me_icon
  }

  if (site.site_subtitle !== undefined && site.site_subtitle !== '') {
    hexo.config.subtitle = site.site_subtitle
  }
  if (site.site_description !== undefined && site.site_description !== '') {
    hexo.config.description = site.site_description
  }

  if (site.waline_server) {
    theme.waline = theme.waline || {}
    theme.waline.serverURL = site.waline_server
  }

  let nav
  try {
    nav = loadYml('nav')
  } catch (e) {
    nav = null
  }

  if (nav && Array.isArray(nav.items)) {
    const menu = {}
    const items = nav.items.slice()

    ;(hexo.locals.get('pages') || [])
      .filter((pg) => pg.add_to_menu && pg.path && pg.path.indexOf('pages/') === 0)
      .forEach((pg) => {
        const slug = pg.path.replace(/^pages\//, '').replace(/index\.html$/, '').replace(/\/$/, '')
        items.push({
          label: pg.title || slug,
          url: '/' + pg.path.replace(/index\.html$/, ''),
          icon: 'fas fa-file-alt',
        })
      })

    items.forEach((item) => {
      const icon = item.icon ? ` || ${item.icon}` : ''
      if (Array.isArray(item.children) && item.children.length) {
        const key = `${item.label}${item.icon ? ' || ' + item.icon : ''}`
        menu[key] = item.children.map((child) => {
          return `${child.label} || ${child.url} || ${child.icon || 'fas'} `
        })
      } else {
        menu[item.label] = `${item.url}${icon}`
      }
    })
    theme.menu = menu
  }
}, 1)

hexo.extend.filter.register('template_locals', (locals) => {
  const page = locals.page
  if (!page || !page.path) return locals

  let bgs
  try {
    bgs = loadYml('backgrounds')
  } catch (e) {
    return locals
  }

  const map = bgs.pages || {}
  const path = page.path.replace(/index\.html$/, '').replace(/\.html$/, '')
  const key = path.replace(/\/$/, '')

  let hit

  if (Object.prototype.hasOwnProperty.call(map, key)) hit = map[key]
  if (!hit && key === '') hit = map.__home
  if (!hit) {
    Object.keys(map).forEach((k) => {
      if (k.startsWith('__')) return
      if (!hit && (path === k + '/' || path.indexOf(k + '/') === 0)) hit = map[k]
    })
  }

  if (hit && hit.top_img && page.top_img === undefined) {
    page.top_img = hit.top_img
  }

  const p = page.path || ''
  const isMessageboard = p === 'messageboard/index.html' || p === 'messageboard/'
  page.comments = isMessageboard

  return locals
})
