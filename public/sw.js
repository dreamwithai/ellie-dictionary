const CACHE_NAME = 'ellie-dictionary-v1';
const urlsToCache = [
  '/ellie-dictionary/',
  '/ellie-dictionary/index.html',
  '/ellie-dictionary/bundle.js',
  '/ellie-dictionary/manifest.json',
  '/ellie-dictionary/icons-192x192.png',
  '/ellie-dictionary/icon-512x512.png',
  '/ellie-dictionary/apple-touch-icon.png',
  '/ellie-dictionary/favicon-32x32.png',
  '/ellie-dictionary/favicon-16x16.png'
];

// 설치 이벤트
self.addEventListener('install', event => {
  console.log('Service Worker 설치 중...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열림');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Service Worker 설치 완료');
        self.skipWaiting();
      })
  );
});

// 활성화 이벤트
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('오래된 캐시 삭제:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// 네트워크 요청 가로채기
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
}); 