'use strict'

const { join } = require('path')
const { url_for } = require('hexo-util')

function mdInline(text) {
  return hexo.render
    .renderSync({ text, engine: 'markdown' })
    .replace(/^<p>/, '')
    .replace(/<\/p>\s*$/, '')
    .replace(/\n/g, '')
}

function loadData(name) {
  const file = join(hexo.source_dir, '_data', `${name}.yml`)
  return hexo.render.renderSync({ path: file, engine: 'yaml' })
}

hexo.extend.tag.register('aboutdata', () => {
  const d = loadData('about')

  const intro = (d.intro || [])
    .map((line) => `<li>${mdInline(line)}</li>`)
    .join('')

  const tags = (d.tags || []).map((t) => `<span>${t}</span>`).join('')

  const links = (d.links || [])
    .map(
      (l) =>
        `<a class="about-link-btn" href="${l.url}"${/^https?:/.test(l.url) ? ' target="_blank"' : ''}><i class="${l.icon}"></i> ${l.name}</a>`
    )
    .join('')

  const footer = d.footer_note ? `<p>${mdInline(d.footer_note)}</p>` : ''

  return `
<div class="about-hero">
  <img class="about-avatar" src="${d.avatar}" alt="avatar" />
  <div>
    <h2 style="margin:0;">${d.name} <small style="font-weight:normal;opacity:.7;">${d.name_en}</small></h2>
    <p style="margin:.4em 0 0;">${d.tagline}</p>
    <p style="margin:.4em 0 0;">${d.motto}</p>
  </div>
</div>
<h2>关于这个博客</h2>
<p>这里是我的「数字后花园」。不追热点、不蹭算法，只认真记录我想留下的东西：</p>
<ul>${intro}</ul>
${footer}
<h2>兴趣标签</h2>
<div class="tag-cloud-about">${tags}</div>
<h2>联系方式</h2>
<div class="about-links">${links}</div>`
})

hexo.extend.tag.register('myselfdata', () => {
  const d = loadData('myself')

  const keywords = (d.keywords || []).map((k) => `<span>${k}</span>`).join('')

  const cards = (d.qa || [])
    .map(
      (item, i) =>
        `<div class="qa-card"><b>Q${i + 1} · ${item.q}</b><p>${item.a}</p></div>`
    )
    .join('')

  return `
<div class="myself-banner">
  <h2 style="margin:0;">${d.name_en}</h2>
  <p class="myself-sub" style="margin:.3em 0 0;">${d.subtitle}</p>
</div>
<h2>我的关键词</h2>
<div class="myself-chips">${keywords}</div>
<h2>十问十答</h2>
<div class="qa-grid">${cards}</div>`
})

hexo.extend.tag.register('timelinedata', () => {
  const d = loadData('timeline')

  const items = (d.items || [])
    .map(
      (item) => `
<div class="tl-item${item.future ? ' future' : ''}">
  <div class="tl-dot"></div>
  <div class="tl-content">
    <span class="tl-date">${item.date}</span>
    <h3 style="margin:.3em 0;">${item.title}</h3>
    <p>${item.desc}</p>
  </div>
</div>`
    )
    .join('')

  return `
<p>${d.intro || ''}</p>
<div class="tl-wrap">${items}</div>`
})
