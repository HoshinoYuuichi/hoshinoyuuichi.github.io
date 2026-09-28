(function () {
  var IMG_RE = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i
  var mask

  function ensureMask() {
    if (mask) return mask
    mask = document.createElement('div')
    mask.className = 'social-qr-mask'
    mask.setAttribute('aria-hidden', 'true')
    mask.innerHTML =
      '<div class="social-qr-modal" role="dialog" aria-modal="true">' +
      '<div class="social-qr-title"></div>' +
      '<img class="social-qr-img" src="" alt="qr" />' +
      '<p class="social-qr-tip">请使用对应应用扫码</p>' +
      '<button class="social-qr-close" type="button">关闭</button>' +
      '</div>'
    document.body.appendChild(mask)

    mask.addEventListener('click', function (e) {
      if (e.target === mask || e.target.classList.contains('social-qr-close')) close()
    })
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close()
    })
    return mask
  }

  function open(title, src, tip) {
    ensureMask()
    mask.querySelector('.social-qr-title').textContent = title || '二维码'
    mask.querySelector('.social-qr-img').src = src
    mask.querySelector('.social-qr-tip').textContent = tip || '请使用对应应用扫码'
    mask.classList.add('show')
    mask.setAttribute('aria-hidden', 'false')
  }

  function close() {
    if (!mask) return
    mask.classList.remove('show')
    mask.setAttribute('aria-hidden', 'true')
    mask.querySelector('.social-qr-img').src = ''
  }

  function isImageHref(href) {
    return href && IMG_RE.test(href)
  }

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('.social-icon')
    if (!a) return
    if (!isImageHref(a.getAttribute('href'))) return
    e.preventDefault()
    open(a.getAttribute('title'), a.getAttribute('href'))
  }, true)
})()
