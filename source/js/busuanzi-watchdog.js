(function () {
  var HOSTS = ['https://busuanzi.ibruce.info']

  function fill(data) {
    ;['site_uv', 'site_pv', 'page_pv'].forEach(function (key) {
      var el = document.getElementById('busuanzi_value_' + key)
      if (el && data && data[key] !== undefined) el.textContent = data[key]
    })
  }

  function stillSpinning() {
    return ['site_uv', 'site_pv'].some(function (key) {
      var el = document.getElementById('busuanzi_value_' + key)
      return el && el.querySelector('.fa-spinner')
    })
  }

  function fallback() {
    ;['site_uv', 'site_pv', 'page_pv'].forEach(function (key) {
      var el = document.getElementById('busuanzi_value_' + key)
      if (el && el.querySelector('.fa-spinner')) el.textContent = '-'
    })
  }

  function tryFetch(hostIndex) {
    if (hostIndex >= HOSTS.length) {
      fallback()
      return
    }
    var cbName = 'BusuanziFallback_' + Math.floor(Math.random() * 1e12)
    var done = false
    var timer = setTimeout(function () {
      if (done) return
      done = true
      cleanup()
      tryFetch(hostIndex + 1)
    }, 8000)

    function cleanup() {
      clearTimeout(timer)
      try {
        delete window[cbName]
      } catch (e) {
        window[cbName] = undefined
      }
    }

    window[cbName] = function (data) {
      if (done) return
      done = true
      cleanup()
      fill(data)
    }

    var s = document.createElement('script')
    s.src = HOSTS[hostIndex] + '/busuanzi?jsonpCallback=' + cbName
    s.referrerPolicy = 'no-referrer-when-downgrade'
    s.onerror = function () {
      if (done) return
      done = true
      cleanup()
      tryFetch(hostIndex + 1)
    }
    document.head.appendChild(s)
  }

  function run() {
    setTimeout(function () {
      if (stillSpinning()) tryFetch(0)
    }, 6000)
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    run()
  } else {
    window.addEventListener('DOMContentLoaded', run)
  }

  document.addEventListener('pjax:complete', function () {
    setTimeout(function () {
      if (stillSpinning()) tryFetch(0)
    }, 6000)
  })
})()
