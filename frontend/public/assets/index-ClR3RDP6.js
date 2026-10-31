// Fallback for stale cached index.html requesting index-ClR3RDP6.js
console.warn('Recovering from stale service worker cache for index-ClR3RDP6.js...');

if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(function(regs) {
    for (var i = 0; i < regs.length; i++) {
      regs[i].unregister();
    }
  });
}

if (typeof window !== 'undefined' && 'caches' in window) {
  caches.keys().then(function(keys) {
    for (var i = 0; i < keys.length; i++) {
      caches.delete(keys[i]);
    }
  }).then(function() {
    window.location.reload();
  });
} else if (typeof window !== 'undefined') {
  window.location.reload();
}

