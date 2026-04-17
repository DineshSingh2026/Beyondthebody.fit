const CACHE_NAME = 'btb-v6'
const STATIC_ASSETS = [
  '/manifest.json',
  '/img/BTB%20Logo%20-%20app.png',
  '/img/btb-logo-app-192.png',
  '/img/btb-logo-app-512.png',
  '/img/btb-logo-app-maskable-192.png',
  '/img/btb-logo-app-maskable-512.png',
  '/img/btb-logo-apple-touch-180.png',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    )
  )
})

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

function shouldIntercept(url) {
  if (url.pathname.startsWith('/api/')) return true
  if (url.pathname.startsWith('/img/')) return true
  return STATIC_ASSETS.includes(url.pathname)
}

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== location.origin) return
  if (!shouldIntercept(url)) return

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          if (res.ok) {
            const clone = res.clone()
            caches.open(CACHE_NAME).then(c => c.put(request, clone).catch(() => {}))
          }
          return res
        })
        .catch(async () => {
          const cached = await caches.match(request)
          return cached || Response.error()
        })
    )
    return
  }

  event.respondWith(
    (async () => {
      try {
        const res = await fetch(request)
        if (res.ok) {
          const clone = res.clone()
          await caches.open(CACHE_NAME).then(c => c.put(request, clone).catch(() => {}))
        }
        return res
      } catch {
        const cached = await caches.match(request)
        return cached || Response.error()
      }
    })()
  )
})
