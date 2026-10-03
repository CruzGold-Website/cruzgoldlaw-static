/* Cached for 7 days. After any change to this file run: node .build-sources/bump-asset-version.mjs js/lazy-video.js
   (gives it a new ?v= on every page that links it; see README.md). */
/**
 * Background videos below the first screen (the memorial section) carry data-autoplay and
 * preload="none" instead of autoplay, so they are not downloaded on page load. Each one starts
 * when it comes within 300px of the screen. Muted, so play() is allowed without a click.
 */
(function () {
  'use strict';
  var videos = document.querySelectorAll('video[data-autoplay]');
  if (!videos.length) return;
  function start(v) {
    v.removeAttribute('data-autoplay');
    v.muted = true;
    var p = v.play();
    if (p && p.catch) p.catch(function () {});
  }
  if (!('IntersectionObserver' in window)) {
    for (var i = 0; i < videos.length; i++) start(videos[i]);
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (entries[i].isIntersecting) { io.unobserve(entries[i].target); start(entries[i].target); }
    }
  }, { rootMargin: '300px 0px' });
  for (var j = 0; j < videos.length; j++) io.observe(videos[j]);
})();
