self.addEventListener('install', function(e) {
	e.waitUntil(
		caches.open('codingphase').then(function(cache) {
			return cache.addAll([
				'/',
				'/index.html',
				// '/offline.html',
				'/css/styles.css'
			]);
		})
	);
});

self.addEventListener('fetch', function(event) {
	event.respondWith(
		caches.match(event.request).then(function(response) {
			return response || fetch(event.request);
		})
	);
});
