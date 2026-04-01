const CACHE_NAME = 'btb-v4'
const STATIC_ASSETS = [
  '/manifest.json',
  '/img/btb-logo-app.png',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(STATIC_ASSETS).catch(() => {})
    )
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  if (request.method !== 'GET' || url.origin !== location.origin) return

  // Always fetch HTML/documents from network first to avoid stale Next.js shell/chunks.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
    return
  }

  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone()
          caches.open(CACHE_NAME).then(c => c.put(request, clone))
          return res
        })
        .catch(() => caches.match(request))
    )
  } else if (request.destination === 'image' || request.destination === 'font') {
    event.respondWith(
      caches.match(request).then(cached => {
        const networkFetch = fetch(request)
          .then(res => {
            const clone = res.clone()
            caches.open(CACHE_NAME).then(c => c.put(request, clone))
            return res
          })
          .catch(() => cached)
        return cached || networkFetch
      })
    )
  } else {
    // For app scripts/styles/chunks: network first, cache fallback.
    event.respondWith(
      fetch(request).catch(() => caches.match(request))
    )
  }
})
