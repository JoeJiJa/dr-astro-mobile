// Dr. Astro Service Worker — Cache-First Strategy
const CACHE_VERSION = 'dr-astro-v3';
const STATIC_CACHE = `${CACHE_VERSION}-static`;
const IMAGE_CACHE  = `${CACHE_VERSION}-images`;
const FONT_CACHE   = `${CACHE_VERSION}-fonts`;
const PDF_CACHE    = `${CACHE_VERSION}-pdfs`;

// Assets to pre-cache on install
const PRE_CACHE = [
    '/',
    '/app-logo.jpg',
    '/splash-icon.png',
    '/hero-bg.png',
    '/manifest.json',
];

// ── INSTALL ─────────────────────────────────────────────
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then((cache) => {
            // Don't fail install if pre-cache partially fails
            return Promise.allSettled(PRE_CACHE.map(url => cache.add(url)));
        }).then(() => self.skipWaiting())
    );
});

// ── ACTIVATE ────────────────────────────────────────────
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter(k => k.startsWith('dr-astro-') && k !== STATIC_CACHE && k !== IMAGE_CACHE && k !== FONT_CACHE && k !== PDF_CACHE)
                    .map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

// ── FETCH STRATEGY ──────────────────────────────────────
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-GET, chrome-extension, and Firestore/Firebase requests (let them go to network)
    if (request.method !== 'GET') return;
    if (url.hostname.includes('firestore.googleapis.com')) return;
    if (url.hostname.includes('firebase') || url.hostname.includes('google.com/identitytoolkit')) return;
    if (url.protocol === 'chrome-extension:') return;

    // Google Fonts — cache-first
    if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
        event.respondWith(
            caches.open(FONT_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) return cached;
                const response = await fetch(request);
                cache.put(request, response.clone());
                return response;
            })
        );
        return;
    }

    // External images (book covers, CDN images) — cache-first with 7-day TTL
    if (
        url.hostname.includes('storage.googleapis.com') ||
        url.hostname.includes('m.media-amazon.com') ||
        url.hostname.includes('encrypted-tbn0.gstatic.com') ||
        url.hostname.includes('glide-prod.appspot.com') ||
        url.hostname.includes('api.dicebear.com') ||
        (request.destination === 'image' && url.origin !== self.location.origin)
    ) {
        // Special handling for PDFs vs Images
        const isPdf = url.pathname.toLowerCase().endsWith('.pdf') || url.search.toLowerCase().includes('pdf') || request.destination === 'document';
        const targetCache = isPdf ? PDF_CACHE : IMAGE_CACHE;

        event.respondWith(
            caches.open(targetCache).then(async (cache) => {
                const cached = await cache.match(request);
                if (cached) return cached;
                try {
                    const response = await fetch(request, { mode: 'cors', credentials: 'omit' });
                    if (response.ok) cache.put(request, response.clone());
                    return response;
                } catch {
                    return new Response('', { status: 503 });
                }
            })
        );
        return;
    }

    // App shell — stale-while-revalidate
    if (url.origin === self.location.origin) {
        event.respondWith(
            caches.open(STATIC_CACHE).then(async (cache) => {
                const cached = await cache.match(request);
                const networkFetch = fetch(request).then((response) => {
                    if (response.ok) cache.put(request, response.clone());
                    return response;
                }).catch(() => cached);
                return cached || networkFetch;
            })
        );
    }
});

// ── PUSH NOTIFICATIONS (future-ready) ───────────────────
self.addEventListener('push', (event) => {
    const data = event.data?.json() || { title: 'Dr. Astro', body: 'New update available!' };
    event.waitUntil(
        self.registration.showNotification(data.title, {
            body: data.body,
            icon: '/splash-icon.png',
            badge: '/app-logo.jpg',
        })
    );
});
