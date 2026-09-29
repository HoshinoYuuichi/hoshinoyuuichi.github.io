(function () {
  var cfg = window.HOME_QUOTE_CONFIG || {}
  var titleEl = document.getElementById('site-title')
  var fromEl = document.getElementById('home-quote-from')

  function pickLocal() {
    var list = cfg.local_quotes || []
    if (!list.length) return { text: cfg.fixed_quote || '' }
    return list[Math.floor(Math.random() * list.length)]
  }

  function pickAnime() {
    var pool = window.ANIME_QUOTE_POOL || []
    if (!pool.length) return null
    var item = pool[Math.floor(Math.random() * pool.length)]
    return { text: item.t, from: item.f }
  }

  function render(text, from) {
    if (titleEl) titleEl.textContent = text || ''
    if (fromEl) {
      fromEl.textContent = from ? '—— ' + from : ''
      fromEl.style.display = from ? '' : 'none'
    }
  }

  function run() {
    if (!titleEl) return

    var mode = cfg.mode || 'online'

    if (mode === 'fixed') {
      render(cfg.fixed_quote || '', '')
      return
    }

    if (mode === 'local') {
      var local = pickLocal()
      render(local.text, local.from)
      return
    }

    var initial = Math.random() < 0.5 ? pickLocal() : pickAnime() || pickLocal()
    render(initial.text, initial.from)

    var cb = 'HomeQuoteCb_' + Math.floor(Math.random() * 1e9)
    var timer = setTimeout(function () {
      cleanup()
    }, 8000)

    function cleanup() {
      clearTimeout(timer)
      try {
        delete window[cb]
      } catch (e) {
        window[cb] = undefined
      }
    }

    window[cb] = function (data) {
      cleanup()
      if (data && data.hitokoto) {
        var source = data.from_who || data.from || ''
        render(data.hitokoto, source)
      }
    }

    var s = document.createElement('script')
    var cats = ['k', 'a']
    var cat = cats[Math.floor(Math.random() * cats.length)]
    s.src = 'https://v1.hitokoto.cn/?c=' + cat + '&callback=' + cb
    s.onerror = cleanup
    document.head.appendChild(s)
  }

  run()

  document.addEventListener('pjax:success', function () {
    titleEl = document.getElementById('site-title')
    fromEl = document.getElementById('home-quote-from')
    run()
  })
})()
