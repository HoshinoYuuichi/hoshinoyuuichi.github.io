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

  function shuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var t = arr[i]
      arr[i] = arr[j]
      arr[j] = t
    }
    return arr
  }

  function getPath(obj, path) {
    if (!path) return undefined
    return path.split('.').reduce(function (o, k) {
      return o == null ? undefined : o[k]
    }, obj)
  }

  function jsonp(src) {
    return new Promise(function (resolve, reject) {
      var cb = 'HQCb_' + Math.floor(Math.random() * 1e9)
      var timer = setTimeout(function () {
        cleanup()
        reject(new Error('timeout'))
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
        resolve(data)
      }

      var sep = src.indexOf('?') >= 0 ? '&' : '?'
      var s = document.createElement('script')
      s.src = src + sep + 'callback=' + cb
      s.onerror = function () {
        cleanup()
        reject(new Error('error'))
      }
      document.head.appendChild(s)
    })
  }

  function parseSource(source, data) {
    if (source.type === 'hitokoto') {
      if (data && data.hitokoto) {
        return { text: data.hitokoto, from: data.from_who || data.from || '' }
      }
    } else if (source.type === 'json') {
      var text = getPath(data, source.text_path)
      if (text) {
        return { text: text, from: getPath(data, source.from_path) || '' }
      }
    }
    return null
  }

  function trySource(source) {
    if (source.type === 'text') {
      return Promise.resolve({ text: source.url, from: source.name || '' })
    }
    if (source.type === 'json') {
      return fetch(source.url)
        .then(function (r) { return r.json() })
        .then(function (data) { return parseSource(source, data) })
    }
    return jsonp(source.url).then(function (data) { return parseSource(source, data) })
  }

  function showOnline() {
    var sources = shuffle((cfg.online_sources || []).filter(function (s) { return s.enabled }))
    var chain = Promise.resolve(null)

    sources.forEach(function (source) {
      chain = chain.then(function (result) {
        if (result) return result
        return trySource(source).catch(function () { return null })
      })
    })

    return chain
  }

  function run() {
    if (!titleEl) return

    var mode = cfg.mode || 'online'

    if (mode === 'fixed') {
      render(cfg.fixed_quote || '', '')
      return
    }

    if (mode === 'local') {
      var local = Math.random() < 0.6 ? pickLocal() : pickAnime() || pickLocal()
      render(local.text, local.from)
      return
    }

    var initial = Math.random() < 0.5 ? pickLocal() : pickAnime() || pickLocal()
    render(initial.text, initial.from)

    showOnline().then(function (result) {
      if (result) render(result.text, result.from)
    })
  }

  run()

  document.addEventListener('pjax:success', function () {
    titleEl = document.getElementById('site-title')
    fromEl = document.getElementById('home-quote-from')
    run()
  })
})()
