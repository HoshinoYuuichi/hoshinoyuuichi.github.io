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

  const footer = d.footer_note ? `<p>${mdInline(d.footer_note)}</p>` : ''

  const links = (d.links || [])
    .map((l) => {
      const glyph = l.img
        ? `<img class="about-link-icon" src="${l.img}" alt="${l.name}" />`
        : `<i class="${l.icon}"></i>`
      if (l.modal) {
        return `<a class="about-link-btn js-qr" href="javascript:void(0);" title="${l.name}" data-qr="${l.modal}" data-tip="${l.tip || ''}">${glyph}</a>`
      }
      return `<a class="about-link-btn" href="${l.url}" title="${l.name}"${/^(https?:|mailto:)/.test(l.url) ? ' target="_blank"' : ''} rel="noopener">${glyph}</a>`
    })
    .join('')

  let donate = ''
  if (d.donate && d.donate.length) {
    const donateLinks = d.donate
      .map(
        (l) => `<a class="about-link-btn js-qr" href="javascript:void(0);" title="${l.name}" data-qr="${l.modal}" data-tip="${l.tip || ''}"><img class="about-link-icon" src="${l.img}" alt="${l.name}" /></a>`
      )
      .join('')
    donate = `<h2>${d.donate_heading || '捐助'}</h2><p>${d.donate_tip || ''}</p><div class="about-links">${donateLinks}</div>`
  }

  return `
<div class="about-hero">
  <img class="about-avatar" src="${d.avatar}" alt="avatar" />
  <div>
    <h2 style="margin:0;">${d.name} <small style="font-weight:normal;opacity:.7;">${d.name_en}</small></h2>
    <p style="margin:.4em 0 0;">${d.tagline}</p>
    <p style="margin:.4em 0 0;">${d.motto}</p>
  </div>
</div>
<h2>${d.blog_heading || '关于这个博客'}</h2>
<p>${d.blog_lead || ''}</p>
<ul>${intro}</ul>
${footer}
<h2>${d.tags_heading || '兴趣标签'}</h2>
<div class="tag-cloud-about">${tags}</div>
<h2>${d.contact_heading || '联系方式'}</h2>
<div class="about-links">${links}</div>
${donate}
<div class="qr-mask" id="aboutQrMask" aria-hidden="true"><div class="qr-modal" role="dialog" aria-modal="true"><div class="qr-modal-title">二维码</div><img class="qr-modal-img" src="" alt="qr" /><p class="qr-modal-tip">请使用对应应用扫码</p><button class="qr-modal-close" type="button">关闭</button></div></div>
<script>
(function(){
  var mask=document.getElementById('aboutQrMask');
  if(!mask)return;
  var img=mask.querySelector('.qr-modal-img'),tip=mask.querySelector('.qr-modal-tip'),title=mask.querySelector('.qr-modal-title');
  function open(name,src,t){title.textContent=name||'二维码';img.src=src;tip.textContent=t||'请使用对应应用扫码';mask.classList.add('show');mask.setAttribute('aria-hidden','false');}
  function close(){mask.classList.remove('show');mask.setAttribute('aria-hidden','true');img.src='';}
  document.querySelectorAll('.js-qr').forEach(function(a){a.addEventListener('click',function(){open(a.getAttribute('title'),a.getAttribute('data-qr'),a.getAttribute('data-tip'));});});
  mask.addEventListener('click',function(e){if(e.target===mask||e.target.classList.contains('qr-modal-close'))close();});
  document.addEventListener('keydown',function(e){if(e.key==='Escape')close();});
})();
</script>`
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

hexo.extend.tag.register('messageboarddata', () => {
  const d = loadData('messageboard')

  const rules = (d.rules || [])
    .map((line) => `<li>${mdInline(line)}</li>`)
    .join('')

  const note = d.note ? `<div class="note info modern"><p>${mdInline(d.note)}</p></div>` : ''

  return `
<div class="mb-banner">
  <h2 style="margin:0;">${d.heading}</h2>
  <p style="margin:.4em 0 0;">${d.sub}</p>
</div>
${note}
<h2>${d.rules_heading || '留言须知'}</h2>
<ul>${rules}</ul>`
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
