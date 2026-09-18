/* ==========================================================================
   site.js —— 配色切换 / 返回顶部 / 站内搜索
   纯原生 JS，无依赖。
   ========================================================================== */
(function () {
  'use strict';

  /* ------------------------------------------------------------------
     1. 配色切换（选择结果存 localStorage）
     ------------------------------------------------------------------ */
  function initThemeSwitcher() {
    var root = document.documentElement;
    var box = document.getElementById('themeSwitcher');
    if (!box) return;

    box.hidden = false;

    var toggle = box.querySelector('.theme-switcher-toggle');
    var panel = box.querySelector('.theme-switcher-panel');
    var buttons = Array.prototype.slice.call(panel.querySelectorAll('[data-theme-value]'));

    function mark(value) {
      buttons.forEach(function (b) {
        b.classList.toggle('is-active', b.getAttribute('data-theme-value') === value);
      });
    }

    var saved = null;
    try {
      saved = localStorage.getItem('blog-theme');
    } catch (e) {
      saved = null;
    }
    if (saved) mark(saved);

    toggle.addEventListener('click', function (e) {
      e.stopPropagation();
      panel.hidden = !panel.hidden;
    });

    document.addEventListener('click', function (e) {
      if (!box.contains(e.target)) panel.hidden = true;
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') panel.hidden = true;
    });

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var value = btn.getAttribute('data-theme-value');
        root.setAttribute('data-theme', value);
        try {
          localStorage.setItem('blog-theme', value);
        } catch (e) {
          /* 隐私模式下写入失败，忽略 */
        }
        mark(value);
        panel.hidden = true;
      });
    });
  }

  /* ------------------------------------------------------------------
     2. 返回顶部
     ------------------------------------------------------------------ */
  function initBackToTop() {
    var btn = document.getElementById('backToTop');
    if (!btn) return;

    function onScroll() {
      btn.hidden = window.scrollY < 300;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    btn.addEventListener('click', function (e) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  /* ------------------------------------------------------------------
     3. 站内搜索
     ------------------------------------------------------------------ */
  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function highlight(text, terms) {
    var out = escapeHtml(text);
    terms.forEach(function (t) {
      if (!t) return;
      var re = new RegExp('(' + t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi');
      out = out.replace(re, '<mark>$1</mark>');
    });
    return out;
  }

  function initSearch() {
    var form = document.getElementById('searchPageForm');
    var input = document.getElementById('searchInput');
    var results = document.getElementById('searchResults');
    var status = document.getElementById('searchStatus');
    if (!form || !input || !results) return;

    var urlNode = document.getElementById('searchIndexUrl');
    var indexUrl = urlNode ? JSON.parse(urlNode.textContent) : '/search.json';

    var index = null;
    var loading = null;

    function loadIndex() {
      if (index) return Promise.resolve(index);
      if (!loading) {
        loading = fetch(indexUrl)
          .then(function (r) {
            if (!r.ok) throw new Error('HTTP ' + r.status);
            return r.json();
          })
          .then(function (json) {
            index = json;
            return json;
          });
      }
      return loading;
    }

    function snippet(item, terms) {
      var text = item.text || item.excerpt || '';
      var lower = text.toLowerCase();
      var pos = -1;
      for (var i = 0; i < terms.length; i++) {
        var p = lower.indexOf(terms[i].toLowerCase());
        if (p >= 0 && (pos < 0 || p < pos)) pos = p;
      }
      if (pos < 0) pos = 0;
      var start = Math.max(0, pos - 40);
      return (start > 0 ? '…' : '') + text.slice(start, start + 150) + (text.length > start + 150 ? '…' : '');
    }

    function run(query) {
      var q = (query || '').trim();
      if (!q) {
        results.innerHTML = '';
        status.hidden = true;
        return;
      }
      var terms = q.split(/\s+/).filter(Boolean);

      loadIndex()
        .then(function (list) {
          var matched = list.filter(function (item) {
            var haystack = (item.title + ' ' + (item.tags || []).join(' ') + ' ' + (item.text || '')).toLowerCase();
            return terms.every(function (t) {
              return haystack.indexOf(t.toLowerCase()) >= 0;
            });
          });

          status.hidden = false;
          status.textContent = matched.length
            ? '找到 ' + matched.length + ' 篇相关文章'
            : '没有找到匹配的文章，换个关键词试试。';

          results.innerHTML = matched
            .map(function (item) {
              return (
                '<article class="search-result">' +
                '<h3><a href="' + escapeHtml(item.url) + '">' + highlight(item.title, terms) + '</a></h3>' +
                '<p class="post-meta-inline">' + escapeHtml(item.date || '') + '</p>' +
                '<p class="snippet">' + highlight(snippet(item, terms), terms) + '</p>' +
                '</article>'
              );
            })
            .join('');
        })
        .catch(function (err) {
          status.hidden = false;
          status.textContent = '搜索索引加载失败：' + err.message;
        });
    }

    var params = new URLSearchParams(window.location.search);
    var initial = params.get('q') || '';
    if (initial) input.value = initial;
    run(initial);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var q = input.value;
      var next = window.location.pathname + (q ? '?q=' + encodeURIComponent(q) : '');
      window.history.replaceState(null, '', next);
      run(q);
    });

    var debounce = null;
    input.addEventListener('input', function () {
      clearTimeout(debounce);
      debounce = setTimeout(function () {
        run(input.value);
      }, 180);
    });
  }

  /* ------------------------------------------------------------------
     4. 给正文里的大图加上点击放大的能力（可选，纯 CSS 兜底）
     ------------------------------------------------------------------ */
  function initImages() {
    var imgs = document.querySelectorAll('.post-content img');
    Array.prototype.forEach.call(imgs, function (img) {
      if (img.closest('a')) return;
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function () {
        if (img.classList.contains('is-zoomed')) {
          img.classList.remove('is-zoomed');
          img.style.maxWidth = '';
          img.style.cursor = 'zoom-in';
        } else {
          img.classList.add('is-zoomed');
          img.style.maxWidth = 'none';
          img.style.cursor = 'zoom-out';
        }
      });
    });
  }

  function init() {
    initThemeSwitcher();
    initBackToTop();
    initSearch();
    initImages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
