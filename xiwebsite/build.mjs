/**
 * ============================================================
 *  构建脚本  build.mjs
 * ------------------------------------------------------------
 *  用法：
 *    node build.mjs            构建到 dist/
 *    node build.mjs --drafts   连草稿一起构建
 *    node build.mjs --serve    构建后启动本地预览（改文件自动重建）
 *    node build.mjs --port 4000
 * ============================================================
 */

import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { watch } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import { loadContent, relatedPosts } from './src/content.mjs';
import { buildThemeCss } from './src/theme.mjs';
import { makeUrl, escapeHtml as h, tagFileName } from './src/util.mjs';
import {
  renderArchivePage,
  renderListPage,
  renderPostPage,
  renderSearchPage,
  renderSidebar,
  renderStandalonePage,
  renderTagPage,
  renderTagsIndex,
  render404,
} from './src/render.mjs';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = path.join(ROOT, 'content');
const PUBLIC_DIR = path.join(ROOT, 'public');
const SRC_DIR = path.join(ROOT, 'src');
const DIST_DIR = path.join(ROOT, 'dist');

const argv = process.argv.slice(2);
const FLAGS = {
  drafts: argv.includes('--drafts'),
  serve: argv.includes('--serve'),
  port: Number((argv[argv.indexOf('--port') + 1] || 0)) || 4321,
};

async function loadConfigs() {
  // ESM 模块会被缓存，直接 import 的话 --serve 模式下改了配置也不生效。
  // 加一个随时间变化的查询串强制重新求值。
  const bust = `?v=${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const blog = (await import(pathToFileURL(path.join(ROOT, 'blog.config.mjs')).href + bust)).default;
  const theme = (await import(pathToFileURL(path.join(ROOT, 'theme.config.mjs')).href + bust)).default;
  return { blog, theme };
}

async function writeOut(relPath, contents) {
  const target = path.join(DIST_DIR, relPath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, contents, 'utf8');
}

async function copyPublic() {
  try {
    await cp(PUBLIC_DIR, DIST_DIR, { recursive: true });
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
    await mkdir(DIST_DIR, { recursive: true });
  }
}

/* ------------------------------------------------------------------ *
 *  订阅 / SEO 附属文件
 * ------------------------------------------------------------------ */

function buildFeed({ config, url, posts, base }) {
  const items = posts
    .slice(0, 20)
    .map((p) => {
      const link = base ? base.replace(/\/$/, '') + p.url : url(p.url);
      return `    <item>
      <title>${h(p.title)}</title>
      <link>${h(link)}</link>
      <guid isPermaLink="true">${h(link)}</guid>
      <pubDate>${p.date.toUTCString()}</pubDate>
      <description>${h(p.summary || p.excerpt)}</description>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${h(config.title)}</title>
    <link>${h(base || url('/'))}</link>
    <description>${h(config.description || '')}</description>
    <language>${h(config.lang || 'zh-CN')}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${h((base || url('/')).replace(/\/$/, '') + '/feed.xml')}" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>
`;
}

function buildSitemap({ url, posts, pages, base }) {
  const abs = (p) => (base ? base.replace(/\/$/, '') + p : url(p));
  const entries = [
    { loc: abs('/'), lastmod: posts[0]?.date },
    ...pages.map((p) => ({ loc: abs(p.url), lastmod: p.updated || p.date })),
    ...posts.map((p) => ({ loc: abs(p.url), lastmod: p.updated || p.date })),
    { loc: abs('/archives.html') },
    { loc: abs('/tags/') },
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries
  .map(
    (e) => `  <url>
    <loc>${h(e.loc)}</loc>${e.lastmod ? `\n    <lastmod>${e.lastmod.toISOString().slice(0, 10)}</lastmod>` : ''}
  </url>`
  )
  .join('\n')}
</urlset>
`;
}

function buildSearchIndex({ url, posts }) {
  return JSON.stringify(
    posts
      .filter((p) => !p.hidden)
      .map((p) => ({
        title: p.title,
        url: url(p.url),
        date: p.date.toISOString().slice(0, 10).replace(/-/g, '/'),
        tags: p.tags,
        excerpt: (p.summary || p.excerpt || '').slice(0, 160),
        text: p.plain.slice(0, 4000),
      })),
    null,
    0
  );
}

/* ------------------------------------------------------------------ *
 *  主构建
 * ------------------------------------------------------------------ */

export async function build({ quiet = false } = {}) {
  const t0 = Date.now();
  const { blog: config, theme } = await loadConfigs();

  // 便于模板层读取版式开关（内部字段，以 __ 开头）
  config.__listStyle = theme.layout?.listStyle || 'excerpt';
  config.__sidebarNone = theme.layout?.sidebar === 'none';

  const url = makeUrl(config.basePath);

  if (config.basePath && config.basePath !== '' && !config.basePath.startsWith('/')) {
    throw new Error('blog.config.mjs 里的 basePath 必须以 / 开头，例如 "/myblog"');
  }

  // 规范化站点根地址：如果部署在子目录但 url 里没带子目录，自动补上，
  // 免得 canonical / sitemap / RSS 指向错误地址。
  const bp = String(config.basePath || '').replace(/\/+$/, '');
  let base = String(config.url || '').replace(/\/+$/, '');
  if (base && bp && !base.endsWith(bp)) base += bp;

  const warnings = [];
  if (!base || /example\.(com|org|net)/i.test(base)) {
    warnings.push(
      'blog.config.mjs 里的 url 还是占位地址，RSS / sitemap / canonical 会不正确。部署前请改成你的真实域名。'
    );
  }
  if (bp && !config.url) {
    warnings.push('设置了 basePath 但没有设置 url，建议同时填上完整域名。');
  }

  const data = await loadContent({ contentDir: CONTENT_DIR, config, drafts: FLAGS.drafts, url });

  await rm(DIST_DIR, { recursive: true, force: true });
  await copyPublic();

  // 生成 theme-vars.css
  await writeOut('assets/css/theme-vars.css', buildThemeCss(theme));

  const sidebarHtml = renderSidebar({ config, url, data });

  // ---- 首页 + 分页 ----
  for (const pageData of data.pagedPosts) {
    const html = renderListPage({
      config,
      theme,
      url,
      data,
      pageData,
      activePath: '/',
      sidebarHtml,
      canonicalBase: base,
    });
    const out = pageData.page === 1 ? 'index.html' : `page/${pageData.page}/index.html`;
    await writeOut(out, html);
  }

  // ---- 文章页 ----
  for (const post of data.posts) {
    const rel = relatedPosts(post, data.posts, config.posts?.relatedCount ?? 3);
    const html = renderPostPage({
      config,
      theme,
      url,
      data,
      post,
      related: rel,
      sidebarHtml,
      canonicalBase: base,
    });
    await writeOut(`posts/${post.slug}.html`, html);
  }

  // ---- 独立页面 ----
  for (const page of data.pages) {
    const html = renderStandalonePage({ config, theme, url, page, sidebarHtml, canonicalBase: base });
    await writeOut(`${page.slug}.html`, html);
  }

  // ---- 归档 ----
  await writeOut(
    'archives.html',
    renderArchivePage({ config, theme, url, years: data.years, sidebarHtml, canonicalBase: base })
  );

  // ---- 标签 ----
  if (config.features?.tags) {
    await writeOut(
      'tags/index.html',
      renderTagsIndex({ config, theme, url, tags: data.tags, sidebarHtml, canonicalBase: base })
    );
    for (const tag of data.tags) {
      await writeOut(
        `tags/${tagFileName(tag.name)}`,
        renderTagPage({ config, theme, url, tag, tagPosts: tag.posts, sidebarHtml, canonicalBase: base })
      );
    }
  }

  // ---- 搜索页 / 404 ----
  await writeOut('search.html', renderSearchPage({ config, theme, url, sidebarHtml }));
  await writeOut('404.html', render404({ config, theme, url, sidebarHtml }));

  // ---- 附属文件 ----
  if (config.features?.rss) {
    await writeOut('feed.xml', buildFeed({ config, url, posts: data.posts, base }));
  }
  if (config.features?.sitemap) {
    await writeOut('sitemap.xml', buildSitemap({ url, posts: data.posts, pages: data.pages, base }));
  }
  if (config.features?.search) {
    await writeOut('search.json', buildSearchIndex({ url, posts: data.posts }));
  }

  const sitemapLine = config.features?.sitemap
    ? `Sitemap: ${(base || '').replace(/\/$/, '')}/sitemap.xml`
    : '';
  await writeOut(
    'robots.txt',
    `User-agent: *\nAllow: /\n${sitemapLine}\n`.replace(/\n{2,}/g, '\n')
  );

  // GitHub Pages 需要它来跳过 Jekyll 处理
  await writeOut('.nojekyll', '');

  const ms = Date.now() - t0;
  if (!quiet) {
    console.log(`\n  ✓ 构建完成  ${ms}ms`);
    console.log(`    文章 ${data.posts.length} 篇 · 页面 ${data.pages.length} 个 · 标签 ${data.tags.length} 个`);
    console.log(`    输出目录 dist/ · 配色方案 ${theme.preset} · 列表样式 ${config.__listStyle}`);
    if (warnings.length) {
      console.log('');
      for (const w of warnings) console.log(`  ⚠ ${w}`);
    }
    console.log('');
  }
  return data;
}

/* ------------------------------------------------------------------ *
 *  本地预览服务器
 * ------------------------------------------------------------------ */

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function serve() {
  const server = createServer(async (req, res) => {
    // 只写一次响应头，避免重建窗口期出现 ERR_HTTP_HEADERS_SENT
    const send = (code, type, body) => {
      if (res.headersSent || res.writableEnded) return;
      res.writeHead(code, { 'content-type': type });
      res.end(body);
    };

    try {
      const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let rel = pathname.replace(/^\/+/, '');
      if (rel === '' || rel.endsWith('/')) rel += 'index.html';

      // 依次尝试：文件本身 → 同名目录下的 index.html
      const candidates = [path.join(DIST_DIR, rel), path.join(DIST_DIR, rel, 'index.html')];
      for (const file of candidates) {
        try {
          const body = await readFile(file);
          send(200, MIME[path.extname(file)] || 'application/octet-stream', body);
          return;
        } catch {
          /* 换下一个候选 */
        }
      }

      let notFound = '404 Not Found';
      try {
        notFound = await readFile(path.join(DIST_DIR, '404.html'));
      } catch {
        /* 构建进行中，dist 可能暂时不存在 */
      }
      send(404, MIME['.html'], notFound);
    } catch (err) {
      send(500, 'text/plain; charset=utf-8', '500 ' + err.message);
    }
  });

  server.listen(FLAGS.port, () => {
    console.log(`  本地预览： http://localhost:${FLAGS.port}/`);
    console.log('  修改 content/ public/ src/ 或配置文件后会自动重建（Ctrl+C 退出）\n');
  });

  /* ---- 自动重建 ---- */

  let timer = null;
  let building = false;
  let queued = false;

  async function rebuildNow() {
    // 构建期间又触发了变更 → 记下来，构建完再补一次，避免并发重入
    if (building) {
      queued = true;
      return;
    }
    building = true;
    try {
      await build({ quiet: true });
      console.log(`  ⟳ ${new Date().toLocaleTimeString('zh-CN')} 已重建`);
    } catch (err) {
      console.error('  ✗ 构建失败：', err.message);
    } finally {
      building = false;
      if (queued) {
        queued = false;
        rebuildNow();
      }
    }
  }

  // 产物目录、依赖目录、研究脚本目录都要忽略，
  // 否则"构建 → 写入 dist/ → 触发重建"会变成死循环。
  const IGNORE = /(^|[\\/])(dist|node_modules|\.git|\.research)([\\/]|$)/;
  const WATCHED_EXT = /\.(md|markdown|mjs|cjs|js|css|json|html|svg|png|jpe?g|gif|webp|ico|woff2?|txt|xml)$/i;

  const schedule = (_event, filename) => {
    if (filename) {
      if (IGNORE.test(filename)) return;
      if (!WATCHED_EXT.test(filename)) return;
    }
    clearTimeout(timer);
    timer = setTimeout(rebuildNow, 150);
  };

  for (const dir of [CONTENT_DIR, PUBLIC_DIR, SRC_DIR]) {
    try {
      watch(dir, { recursive: true }, schedule);
    } catch {
      /* 某些平台不支持 recursive，忽略 */
    }
  }

  // 配置文件只监听项目根目录本身（不递归），这样 dist/ 的变动不会回流
  try {
    watch(ROOT, { recursive: false }, schedule);
  } catch {
    /* 忽略 */
  }
}

/* ------------------------------------------------------------------ */

const isMain = process.argv[1] && pathToFileURL(process.argv[1]).href === import.meta.url;
if (isMain) {
  await build();
  if (FLAGS.serve) await serve();
}
