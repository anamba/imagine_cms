(function () {
  'use strict';
  if (window.ImagineCmsPageLists) { window.ImagineCmsPageLists.init(); return; }

  var cleanups = [];

  function markerFor(key) {
    var walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT), node;
    while ((node = walker.nextNode())) {
      if (node.data === 'cms-list-end:' + key) return node;
    }
    return null;
  }

  function initialize(control) {
    if (control.cmsPageList) return;
    var marker = markerFor(control.dataset.cmsPagination);
    if (!marker) return;
    var button = control.querySelector('button'), status = control.querySelector('[role="status"]');
    var pending = false, failed = false, next = control.dataset.nextUrl, observer;
    control.cmsPageList = true;
    cleanups.push(function () {
      if (control.isConnected && marker.isConnected) return true;
      if (observer) observer.disconnect();
      return false;
    });

    function observe() {
      if (observer && next && !failed && control.isConnected) observer.observe(control);
    }
    function load(manual) {
      if (pending || !next || (!manual && failed)) return;
      if (!control.isConnected || !marker.isConnected) { if (observer) observer.disconnect(); return; }
      pending = true;
      if (observer) observer.unobserve(control);
      button.disabled = true;
      button.textContent = 'Loading…';
      status.textContent = 'Loading…';
      control.setAttribute('aria-busy', 'true');
      fetch(next, { credentials: 'same-origin', headers: { Accept: 'application/json' } })
        .then(function (response) {
          if (!response.ok) throw new Error('Load failed');
          return response.json();
        }).then(function (data) {
          if (!data || typeof data.html !== 'string' || !Number.isInteger(data.count) || data.count < 0 ||
              !(data.next_url === null || (typeof data.next_url === 'string' && data.next_url.length > 0)) ||
              (data.count === 0 && data.next_url !== null)) throw new Error('Invalid segment');
          if (data.next_url !== null) {
            var url = new URL(data.next_url, window.location.href);
            if (url.origin !== window.location.origin || url.href === new URL(next, window.location.href).href) throw new Error('Invalid next URL');
          }
          if (!marker.isConnected || !control.isConnected) { if (observer) observer.disconnect(); return; }
          var range = document.createRange();
          range.setStartBefore(marker);
          var fragment = range.createContextualFragment(data.html);
          var first = fragment.firstElementChild;
          marker.parentNode.insertBefore(fragment, marker);
          next = data.next_url;
          failed = false;
          button.hidden = !next;
          button.textContent = 'Load more';
          status.textContent = next ? data.count + ' more items loaded.' : 'All items loaded.';
          if (manual) {
            var target = first && (first.matches('a, button, input, select, textarea, [tabindex]') ? first : first.querySelector('a, button, input, select, textarea, [tabindex]'));
            target = target || first || (!next ? status : button);
            if (!target.hasAttribute('tabindex') && target === first) target.setAttribute('tabindex', '-1');
            if (target === status) status.setAttribute('tabindex', '-1');
            target.focus({ preventScroll: true });
          }
          marker.parentNode.dispatchEvent(new CustomEvent('imagine-cms:append', { bubbles: true, detail: { key: control.dataset.cmsPagination, count: data.count } }));
        }).catch(function () {
          failed = true;
          button.textContent = 'Retry';
          status.textContent = 'Could not load more items.';
        }).finally(function () {
          pending = false;
          button.disabled = false;
          control.removeAttribute('aria-busy');
          observe();
        });
    }
    button.addEventListener('click', function () { load(true); });
    if (control.dataset.mode === 'infinite' && 'IntersectionObserver' in window) {
      observer = new IntersectionObserver(function (entries) {
        if (!control.isConnected || !marker.isConnected) { observer.disconnect(); return; }
        if (entries.some(function (entry) { return entry.isIntersecting; })) load(false);
      }, { rootMargin: '200px' });
      observe();
    }
  }
  function init() { document.querySelectorAll('[data-cms-pagination]').forEach(initialize); }
  new MutationObserver(function () { cleanups = cleanups.filter(function (cleanup) { return cleanup(); }); }).observe(document, { childList: true, subtree: true });
  window.ImagineCmsPageLists = { init: init };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
