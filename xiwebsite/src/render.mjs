/**
 * HTML 模板层
 *
 * 类名刻意沿用原站（Maupassant 主题）的结构：
 *   #header > .container > .col-group > .site-name / #nav-menu
 *   #main.res-cons > article.post > .post-title / .post-meta / .content-detail
 *   #secondary > section.widget
 *   ol.page-navigator / #footer
 * 这样你照着 Maupassant 的样式资料改 CSS 也能直接套用。
 */

import { escapeHtml as h, escapeAttr as a, tagPath } from './util.mjs';
import { PRESETS } from './theme.mjs';

export const PRESET_LABELS = {
  maupassant: '原站白',
  ink: '墨白',
  sepia: '米黄',
  ocean: '青蓝',
  forest: '松绿',
  plum: '梅紫',
  dark: '深色',
};

/* ------------------------------------------------------------------ *
 *  页面骨架
 * ------------------------------------------------------------------ */

export function layout({
  config,
  theme,
  url,
  pageTitle,
  description = '',
  bodyClass = '',
  activePath = '',
  content = '',
  sidebar = '',
  canonical = '',
  ogType = 'website',
  headExtra = '',
  publishedTime = '',
}) {
  const siteTitle = config.title;
  const fullTitle = pageTitle ? `${pageTitle} - ${siteTitle}` : `${siteTitle} - ${config.description || ''}`.replace(/ - $/, '');
  const preset = PRESETS.includes(theme.preset) ? theme.preset : 'maupassant';

  const navHtml = (config.nav || [])
    .map((item) => {
      const href = url(item.link);
      const isActive =
        item.link === activePath ||
        (item.link !== '/' && activePath.startsWith(item.link.replace(/\.html$/, '')));
      return `<li${isActive ? ' class="current-menu-item"' : ''}><a href="${a(href)}">${h(item.text)}</a></li>`;
    })
    .join('\n            ');

  const switcher = config.features?.themeSwitcher
    ? `<div class="theme-switcher" id="themeSwitcher" hidden>
      <button type="button" class="theme-switcher-toggle" aria-label="切换配色" title="切换配色">
        <span class="ts-icon" aria-hidden="true">◐</span>
      </button>
      <div class="theme-switcher-panel" role="menu" hidden>
        <p class="ts-title">配色方案</p>
        ${PRESETS.map(
          (p) =>
            `<button type="button" role="menuitem" data-theme-value="${p}"${p === preset ? ' class="is-active"' : ''}>${h(
              PRESET_LABELS[p] || p
            )}</button>`
        ).join('\n        ')}
        <button type="button" role="menuitem" data-theme-value="auto">跟随系统</button>
      </div>
    </div>`
    : '';

  const backToTop = config.features?.backToTop
    ? `<a href="#" id="backToTop" class="back-to-top" aria-label="返回顶部" hidden>↑</a>`
    : '';

  const footerParts = [];
  if (config.footer?.copyright) {
    footerParts.push(
      h(
        config.footer.copyright
          .replace(/\{year\}/g, String(new Date().getFullYear()))
          .replace(/\{author\}/g, config.author || '')
      )
    );
  }
  if (config.footer?.icp) {
    const icpHref = config.footer.icpLink || 'https://beian.miit.gov.cn/';
    footerParts.push(`<a href="${a(icpHref)}" target="_blank" rel="noopener">${h(config.footer.icp)}</a>`);
  }
  if (config.footer?.extra) footerParts.push(config.footer.extra);

  const rssLink = config.features?.rss
    ? `<link rel="alternate" type="application/rss+xml" title="${a(siteTitle)}" href="${a(url('/feed.xml'))}">`
    : '';

  return `<!DOCTYPE html>
<html lang="${a(config.lang || 'zh-CN')}" data-theme="${a(preset)}" data-list-style="${a(theme.layout?.listStyle || 'excerpt')}" data-sidebar="${a(theme.layout?.sidebar || 'right')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${h(fullTitle)}</title>
${description ? `<meta name="description" content="${a(description)}">` : ''}
<meta name="author" content="${a(config.author || '')}">
${canonical ? `<link rel="canonical" href="${a(canonical)}">` : ''}
<meta property="og:type" content="${a(ogType)}">
<meta property="og:title" content="${a(fullTitle)}">
${description ? `<meta property="og:description" content="${a(description)}">` : ''}
<meta property="og:site_name" content="${a(siteTitle)}">
${canonical ? `<meta property="og:url" content="${a(canonical)}">` : ''}
${publishedTime ? `<meta property="article:published_time" content="${a(publishedTime)}">` : ''}
<meta name="twitter:card" content="summary">
<link rel="icon" href="${a(url('/assets/img/favicon.svg'))}" type="image/svg+xml">
${rssLink}
<link rel="stylesheet" href="${a(url('/assets/css/main.css'))}">
<link rel="stylesheet" href="${a(url('/assets/css/themes.css'))}">
<link rel="stylesheet" href="${a(url('/assets/css/theme-vars.css'))}">
<script>(function(){try{var t=localStorage.getItem('blog-theme');if(t&&t!=='auto'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();</script>
${config.extras?.headHtml || ''}
${headExtra}
</head>
<body class="${a(bodyClass)}">
<a class="skip-link" href="#main">跳到正文</a>

<header id="header" class="clearfix">
  <div class="container">
    <div class="col-group">
      <div class="site-name">
        <a id="logo" href="${a(url('/'))}">${h(siteTitle)}</a>
        ${config.description ? `<p class="description">${h(config.description)}</p>` : ''}
      </div>
      <nav id="nav-menu" class="clearfix">
        <ul class="menu">
            ${navHtml}
        </ul>
      </nav>
    </div>
  </div>
</header>

<div class="container">
  <div class="col-group">
    <div id="main" class="col-8">
      <div class="res-cons">
${content}
      </div>
    </div>
${sidebar}
  </div>
</div>

<footer id="footer">
  <div class="container">
    <p class="footer-inner">${footerParts.join(' · ')}</p>
  </div>
</footer>

${switcher}
${backToTop}
<script src="${a(url('/assets/js/site.js'))}" defer></script>
${config.extras?.bodyEndHtml || ''}
</body>
</html>
`;
}

/* ------------------------------------------------------------------ *
 *  侧栏 #secondary
 * ------------------------------------------------------------------ */

export function renderSidebar({ config, url, data, activeTag = '' }) {
  if (theme_sidebar_disabled(config)) return '';
  const s = config.sidebar || {};
  const blocks = [];

  if (s.search?.enabled && config.features?.search) {
    blocks.push(`<section class="widget widget_search">
  <form class="site-search-form" action="${a(url('/search.html'))}" method="get" role="search">
    <label class="screen-reader-text" for="s">搜索</label>
    <input type="search" id="s" name="q" placeholder="${a(s.search.placeholder || '搜索')}" autocomplete="off">
    <button type="submit" aria-label="搜索">⌕</button>
  </form>
</section>`);
  }

  if (s.recent?.enabled !== false) {
    const items = data.posts.filter((p) => !p.hidden).slice(0, s.recent?.count || 10);
    if (items.length) {
      blocks.push(`<section class="widget widget_recent_entries">
  <h3 class="widget-title">${h(s.recent?.title || '近期文章')}</h3>
  <ul>
${items.map((p) => `    <li><a href="${a(url(p.url))}">${h(p.title)}</a></li>`).join('\n')}
  </ul>
</section>`);
    }
  }

  if (s.archive?.enabled !== false) {
    let months = data.archives;
    if (s.archive?.limit) months = months.slice(0, s.archive.limit);
    if (months.length) {
      blocks.push(`<section class="widget widget_archive">
  <h3 class="widget-title">${h(s.archive?.title || '归档')}</h3>
  <ul>
${months
  .map(
    (m) =>
      `    <li><a href="${a(url(`/archives.html#${m.key}`))}">${m.year} 年 ${m.month} 月</a> <span class="count">(${m.posts.length})</span></li>`
  )
  .join('\n')}
  </ul>
</section>`);
    }
  }

  if (s.tags?.enabled && config.features?.tags && data.tags.length) {
    blocks.push(`<section class="widget widget_tag_cloud">
  <h3 class="widget-title">${h(s.tags?.title || '标签')}</h3>
  <div class="tagcloud">
${data.tags
  .map(
    (t) =>
      `    <a href="${a(url(t.path))}"${t.name === activeTag ? ' class="is-active"' : ''}>${h(t.name)} <span class="count">${t.posts.length}</span></a>`
  )
  .join('\n')}
  </div>
</section>`);
  }

  if (s.links?.enabled && (s.links?.items || []).length) {
    const sep = s.links.separator ?? ' / ';
    blocks.push(`<section class="widget widget_links">
  <h3 class="widget-title">${h(s.links?.title || '友链')}</h3>
  <p class="friend-links">
${(s.links.items || [])
  .map((l) => `    <a href="${a(l.url)}" target="_blank" rel="noopener">${h(l.name)}</a>`)
  .join(sep.trim() ? `\n    <span class="sep">${h(sep)}</span>\n` : '\n')}
  </p>
</section>`);
  }

  for (const w of s.widgets || []) {
    blocks.push(`<section class="widget widget_text">
  ${w.title ? `<h3 class="widget-title">${h(w.title)}</h3>` : ''}
  <div class="textwidget">${w.html || ''}</div>
</section>`);
  }

  if (!blocks.length) return '';
  return `    <div id="secondary" class="widget-area" role="complementary">
${blocks.join('\n')}
    </div>`;
}

/** layout.sidebar === 'none' 时完全不输出侧栏 */
function theme_sidebar_disabled(config) {
  return config.__sidebarNone === true;
}

/* ------------------------------------------------------------------ *
 *  文章列表项
 * ------------------------------------------------------------------ */

export function renderPostItem(post, { config, url }) {
  const showDate = config.posts?.showDate !== false;
  const showViews = config.posts?.showViews !== false;
  const showTags = config.posts?.showTags !== false;
  const showReading = config.posts?.showReadingTime !== false;
  const listStyle = config.__listStyle || 'excerpt';

  const meta = [];
  if (showDate) {
    meta.push(
      `<li class="post-date"><time datetime="${a(post.date.toISOString().slice(0, 10))}">${post.date
        .toISOString()
        .slice(0, 10)
        .replace(/-/g, '/')}</time></li>`
    );
  }
  if (showReading) meta.push(`<li class="post-reading">约 ${post.readingTime} 分钟</li>`);
  if (showViews) meta.push(`<li class="post-views">${h(post.viewsDisplay)} 次阅读</li>`);
  if (showTags && post.tags.length) {
    meta.push(
      `<li class="post-tags">${post.tags
        .map((t) => `<a href="${a(url(tagPath(t)))}">${h(t)}</a>`)
        .join(', ')}</li>`
    );
  }

  const cover =
    post.cover && listStyle !== 'full'
      ? `<a class="post-cover" href="${a(url(post.url))}" aria-hidden="true" tabindex="-1"><img src="${a(
          post.cover
        )}" alt="${a(post.title)}" loading="lazy" decoding="async"></a>`
      : '';

  let body;
  if (listStyle === 'full') {
    body = `<div class="content-detail post-content">${post.html}</div>`;
  } else {
    const text = post.summary || post.excerpt;
    body = `<div class="content-detail">
        ${cover}
        ${text ? `<p class="excerpt">${h(text)}</p>` : ''}
        <p class="more"><a href="${a(url(post.url))}">「阅读全文」</a></p>
      </div>`;
  }

  return `      <article class="post">
        <header>
          <h2 class="post-title"><a href="${a(url(post.url))}">${h(post.title)}</a></h2>
        </header>
        <ul class="post-meta">
          ${meta.join('\n          ')}
        </ul>
${body}
      </article>`;
}

/* ------------------------------------------------------------------ *
 *  分页 .page-navigator
 * ------------------------------------------------------------------ */
export function renderPagination({ current, total, url }) {
  if (total <= 1) return '';
  const pageUrl = (n) => (n === 1 ? url('/') : url(`/page/${n}/`));

  const items = [];
  const window = 2;

  const push = (n) =>
    items.push(
      n === current
        ? `<li class="current"><span>${n}</span></li>`
        : `<li><a href="${a(pageUrl(n))}">${n}</a></li>`
    );

  if (current > 1) items.push(`<li class="prev"><a href="${a(pageUrl(current - 1))}">« 上一页</a></li>`);

  const pages = new Set([1, total]);
  for (let i = current - window; i <= current + window; i++) if (i >= 1 && i <= total) pages.add(i);
  const sorted = [...pages].sort((x, y) => x - y);

  let last = 0;
  for (const n of sorted) {
    if (last && n - last > 1) items.push('<li class="dots"><span>…</span></li>');
    push(n);
    last = n;
  }

  if (current < total)
    items.push(`<li class="next"><a href="${a(pageUrl(current + 1))}">下一页 »</a></li>`);

  return `      <ol class="page-navigator">
        ${items.join('\n        ')}
      </ol>`;
}

/* ------------------------------------------------------------------ *
 *  首页 / 列表页
 * ------------------------------------------------------------------ */

export function renderListPage({ config, theme, url, data, pageData, activePath, sidebarHtml, canonicalBase = '' }) {
  const postsHtml = pageData.posts.map((p) => renderPostItem(p, { config, url })).join('\n');
  const empty = `<div class="empty-state"><p>这里还没有文章。</p><p class="hint">把 Markdown 文件放进 <code>content/posts/</code> 目录，然后运行 <code>node build.mjs</code>。</p></div>`;

  const content = `${pageData.posts.length ? postsHtml : empty}
${renderPagination({ current: pageData.page, total: data.totalPages, url })}`;

  const canonicalPath = pageData.page === 1 ? '/' : `/page/${pageData.page}/`;

  return layout({
    config,
    theme,
    url,
    pageTitle: pageData.page === 1 ? '' : `第 ${pageData.page} 页`,
    description: config.description || '',
    bodyClass: pageData.page === 1 ? 'home' : 'paged',
    activePath,
    content,
    sidebar: sidebarHtml,
    canonical: canonicalBase ? canonicalBase.replace(/\/$/, '') + canonicalPath : '',
  });
}

/* ------------------------------------------------------------------ *
 *  文章页
 * ------------------------------------------------------------------ */

function renderToc(headings) {
  const items = headings.filter((x) => x.depth >= 2 && x.depth <= 4);
  if (items.length < 3) return '';
  return `<nav class="post-toc" aria-label="目录">
  <p class="toc-title">目录</p>
  <ul>
${items
  .map(
    (x) =>
      `    <li class="toc-level-${x.depth}"><a href="#${a(x.id)}">${h(x.text)}</a></li>`
  )
  .join('\n')}
  </ul>
</nav>`;
}

export function renderPostPage({ config, theme, url, data, post, related, sidebarHtml, canonicalBase }) {
  const showViews = config.posts?.showViews !== false;
  const showReading = config.posts?.showReadingTime !== false;

  const meta = [
    `<li class="post-date"><time datetime="${a(post.date.toISOString().slice(0, 10))}">${post.date
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, '/')}</time></li>`,
  ];
  if (showReading) meta.push(`<li class="post-reading">约 ${post.readingTime} 分钟</li>`);
  if (showViews) meta.push(`<li class="post-views">${h(post.viewsDisplay)} 次阅读</li>`);
  if (post.tags.length) {
    meta.push(
      `<li class="post-tags">${post.tags
        .map((t) => `<a href="${a(url(tagPath(t)))}">${h(t)}</a>`)
        .join(', ')}</li>`
    );
  }

  const toc = config.features?.toc ? renderToc(post.headings) : '';
  const topHtml = config.extras?.postTopHtml || '';

  const prevNext = [];
  if (post.prev) {
    prevNext.push(
      `<div class="post-nav-prev">上一篇：<a href="${a(url(post.prev.url))}">${h(post.prev.title)}</a></div>`
    );
  }
  if (post.next) {
    prevNext.push(
      `<div class="post-nav-next">下一篇：<a href="${a(url(post.next.url))}">${h(post.next.title)}</a></div>`
    );
  }

  const relatedHtml = related.length
    ? `<section id="related_posts">
  <h3 class="widget-title">相关文章</h3>
  <ul class="related_articles">
${related
  .map(
    (r) =>
      `    <li><h4><a href="${a(url(r.url))}">${h(r.title)}</a></h4></li>`
  )
  .join('\n')}
  </ul>
</section>`
    : '';

  const content = `      <article class="post post-single">
        <header>
          <h1 class="post-title">${h(post.title)}</h1>
        </header>
        <ul class="post-meta">
          ${meta.join('\n          ')}
        </ul>
        ${post.cover ? `<a class="post-cover single-cover" href="${a(post.cover)}"><img src="${a(post.cover)}" alt="${a(post.title)}" decoding="async"></a>` : ''}
        ${topHtml}
        ${toc}
        <div class="content-detail post-content">
${post.html}
        </div>
${prevNext.length ? `        <div class="post-nav">\n          ${prevNext.join('\n          ')}\n        </div>` : ''}
      </article>
${relatedHtml}`;

  const canonical = canonicalBase ? `${canonicalBase.replace(/\/$/, '')}${post.url}` : '';

  return layout({
    config,
    theme,
    url,
    pageTitle: post.title,
    description: post.summary || post.excerpt || config.description,
    bodyClass: 'single',
    activePath: post.url,
    content,
    sidebar: sidebarHtml,
    canonical,
    ogType: 'article',
    publishedTime: post.date.toISOString(),
  });
}

/* ------------------------------------------------------------------ *
 *  独立页面
 * ------------------------------------------------------------------ */

export function renderStandalonePage({ config, theme, url, page, sidebarHtml, canonicalBase }) {
  const content = `      <article class="post post-page">
        <header>
          <h1 class="post-title">${h(page.title)}</h1>
        </header>
        <div class="content-detail post-content post-content-pages">
${page.html}
        </div>
      </article>`;

  return layout({
    config,
    theme,
    url,
    pageTitle: page.title,
    description: page.summary || config.description,
    bodyClass: 'page',
    activePath: page.url,
    content,
    sidebar: sidebarHtml,
    canonical: canonicalBase ? `${canonicalBase.replace(/\/$/, '')}${page.url}` : '',
  });
}

/* ------------------------------------------------------------------ *
 *  归档页
 * ------------------------------------------------------------------ */

export function renderArchivePage({ config, theme, url, years, sidebarHtml, canonicalBase = '' }) {
  const body = years.length
    ? years
        .map(
          (y) => `      <section class="archive-year" id="y-${y.year}">
        <h2 class="archive-title">${y.year} 年 <span class="count">${y.count} 篇</span></h2>
${y.months
  .map(
    (m) => `        <div class="archive-month" id="${m.key}">
          <h3 class="month-title">${m.month} 月</h3>
          <ul class="archive-list">
${m.posts
  .map(
    (p) =>
      `            <li><span class="archive-date">${String(p.date.getDate()).padStart(2, '0')}</span><a href="${a(
        url(p.url)
      )}">${h(p.title)}</a></li>`
  )
  .join('\n')}
          </ul>
        </div>`
  )
  .join('\n')}
      </section>`
        )
        .join('\n')
    : '<div class="empty-state"><p>还没有文章。</p></div>';

  const content = `      <div class="archive-page">
        <h1 class="post-title">归档</h1>
        <p class="archive-sub">共 ${years.reduce((n, y) => n + y.count, 0)} 篇文章</p>
${body}
      </div>`;

  return layout({
    config,
    theme,
    url,
    pageTitle: '归档',
    description: `${config.title} 的全部文章归档`,
    bodyClass: 'archive',
    activePath: '/archives.html',
    content,
    sidebar: sidebarHtml,
    canonical: canonicalBase ? canonicalBase.replace(/\/$/, '') + '/archives.html' : '',
  });
}

/* ------------------------------------------------------------------ *
 *  标签页
 * ------------------------------------------------------------------ */

export function renderTagsIndex({ config, theme, url, tags, sidebarHtml, canonicalBase = '' }) {
  const content = `      <div class="tags-page">
        <h1 class="post-title">标签</h1>
        <p class="archive-sub">共 ${tags.length} 个标签</p>
        <div class="tagcloud tagcloud-large">
${tags
  .map(
    (t) =>
      `          <a href="${a(url(t.path))}">${h(t.name)} <span class="count">${t.posts.length}</span></a>`
  )
  .join('\n')}
        </div>
      </div>`;

  return layout({
    config,
    theme,
    url,
    pageTitle: '标签',
    bodyClass: 'tags',
    activePath: '/tags/',
    content,
    sidebar: sidebarHtml,
    canonical: canonicalBase ? canonicalBase.replace(/\/$/, '') + '/tags/' : '',
  });
}

export function renderTagPage({ config, theme, url, tag, tagPosts, sidebarHtml, canonicalBase = '' }) {
  const postsHtml = tagPosts.map((p) => renderPostItem(p, { config, url })).join('\n');
  const content = `      <div class="tag-page">
        <h1 class="post-title">标签：${h(tag.name)}</h1>
        <p class="archive-sub">共 ${tagPosts.length} 篇</p>
      </div>
${postsHtml}`;

  return layout({
    config,
    theme,
    url,
    pageTitle: `标签：${tag.name}`,
    bodyClass: 'tag',
    activePath: tag.path,
    content,
    sidebar: sidebarHtml,
    canonical: canonicalBase ? canonicalBase.replace(/\/$/, '') + tag.path : '',
  });
}

/* ------------------------------------------------------------------ *
 *  搜索页 / 404
 * ------------------------------------------------------------------ */

export function renderSearchPage({ config, theme, url, sidebarHtml }) {
  const content = `      <div class="search-page">
        <h1 class="post-title">搜索</h1>
        <form class="search-page-form" id="searchPageForm" role="search">
          <input type="search" id="searchInput" name="q" placeholder="输入关键词…" autocomplete="off">
          <button type="submit">搜索</button>
        </form>
        <p class="search-status" id="searchStatus" hidden></p>
        <div id="searchResults" class="search-results"></div>
      </div>
      <script id="searchIndexUrl" type="application/json">"${a(url('/search.json'))}"</script>`;

  return layout({
    config,
    theme,
    url,
    pageTitle: '搜索',
    bodyClass: 'search',
    activePath: '/search.html',
    content,
    sidebar: sidebarHtml,
    headExtra: '<meta name="robots" content="noindex,follow">',
  });
}

export function render404({ config, theme, url, sidebarHtml }) {
  const content = `      <div class="error-page">
        <h1 class="post-title">404</h1>
        <p>你要找的页面不在这里，可能已经被移动或删除了。</p>
        <p class="more"><a href="${a(url('/'))}">「回到首页」</a></p>
      </div>`;

  return layout({
    config,
    theme,
    url,
    pageTitle: '404',
    bodyClass: 'error404',
    activePath: '',
    content,
    sidebar: sidebarHtml,
    headExtra: '<meta name="robots" content="noindex,follow">',
  });
}
