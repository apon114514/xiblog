/**
 * 读取并整理 content/ 下的文章与页面
 */

import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';

import { parseFrontMatter } from './frontmatter.mjs';
import { createRenderer, excerptByMarker, stripMoreMarker } from './markdown.mjs';
import {
  parseDate,
  stripMarkdown,
  truncate,
  readingTime,
  firstImage,
  monthKey,
  pseudoViews,
  tagPath,
} from './util.mjs';

async function listMarkdownFiles(dir) {
  try {
    const entries = await readdir(dir, { withFileTypes: true });
    return entries
      .filter((e) => e.isFile() && /\.(md|markdown)$/i.test(e.name))
      .map((e) => path.join(dir, e.name));
  } catch (err) {
    if (err.code === 'ENOENT') return [];
    throw err;
  }
}

function toArray(value) {
  if (value == null || value === '') return [];
  if (Array.isArray(value)) return value.map((v) => String(v).trim()).filter(Boolean);
  return String(value)
    .split(/[,，]/)
    .map((v) => v.trim())
    .filter(Boolean);
}

function slugFromFile(file) {
  return path.basename(file).replace(/\.(md|markdown)$/i, '');
}

/**
 * @param {object} options
 * @param {string} options.contentDir  content 目录绝对路径
 * @param {object} options.config      blog.config.mjs 的默认导出
 * @param {boolean} [options.drafts]   是否包含草稿
 * @param {(p:string)=>string} [options.url] 站内路径重写（补 basePath）
 */
export async function loadContent({ contentDir, config, drafts = false, url = (p) => p }) {
  const renderer = createRenderer({ url });
  const perPage = config.posts?.perPage || 5;

  async function build(file, kind) {
    const raw = await readFile(file, 'utf8');
    const { data, content } = parseFrontMatter(raw);
    const slug = String(data.slug || data.permalink || slugFromFile(file)).replace(/^\/+|\/+$/g, '');
    const date = parseDate(data.date) || (await stat(file)).mtime;
    const tags = toArray(data.tags ?? data.tag);
    const categories = toArray(data.categories ?? data.category);

    // 正文中的 <!-- more --> 用来手动指定摘要边界
    const markerExcerpt = excerptByMarker(content);
    const { html, headings } = renderer.render(stripMoreMarker(content));
    const plain = stripMarkdown(stripMoreMarker(content));

    const excerptSource = markerExcerpt != null ? stripMarkdown(markerExcerpt) : plain;
    const excerpt = truncate(excerptSource, config.posts?.excerptLength ?? 120);

    const coverMode = config.posts?.cover || 'auto';
    let cover = '';
    if (coverMode === 'frontmatter') cover = data.cover || '';
    else if (coverMode !== 'off') cover = data.cover || firstImage(content) || '';
    // 封面可能是 /assets/... 这样的站内路径，需要补上 basePath
    if (cover) cover = url(cover);

    const permalink = String(data.permalink || '').trim();

    return {
      kind, // 'post' | 'page'
      file,
      slug,
      title: String(data.title || slug),
      date,
      updated: parseDate(data.updated) || null,
      tags,
      categories,
      cover,
      summary: String(data.summary || data.description || ''),
      draft: data.draft === true || data.published === false,
      hidden: data.hidden === true,
      views: data.views != null ? Number(data.views) : null,
      comments: data.comments !== false,
      markdown: content,
      html,
      headings,
      plain,
      excerpt,
      readingTime: readingTime(stripMarkdown(stripMoreMarker(content), { keepCode: true })),
      // 文章 → /posts/<slug>.html ；页面 → /<slug>.html
      url: permalink || (kind === 'post' ? `/posts/${slug}.html` : `/${slug}.html`),
      monthKey: monthKey(date),
    };
  }

  const postFiles = await listMarkdownFiles(path.join(contentDir, 'posts'));
  const pageFiles = await listMarkdownFiles(path.join(contentDir, 'pages'));

  let posts = [];
  for (const f of postFiles) posts.push(await build(f, 'post'));
  let pages = [];
  for (const f of pageFiles) pages.push(await build(f, 'page'));

  if (!drafts) {
    posts = posts.filter((p) => !p.draft);
    pages = pages.filter((p) => !p.draft);
  }

  // 按日期倒序（新的在前）
  posts.sort((a, b) => b.date - a.date);
  pages.sort((a, b) => a.title.localeCompare(b.title, 'zh-Hans-CN'));

  // 上下篇：列表里前一篇 = 更新的文章
  posts.forEach((p, i) => {
    p.next = posts[i - 1] || null; // 更新的一篇
    p.prev = posts[i + 1] || null; // 更早的一篇
    p.viewsDisplay = p.views != null ? Number(p.views).toLocaleString('en-US') : pseudoViews(p.slug);
  });

  // 标签索引
  const tagMap = new Map();
  for (const p of posts) {
    if (p.hidden) continue;
    for (const t of p.tags) {
      if (!tagMap.has(t)) tagMap.set(t, { name: t, path: tagPath(t), posts: [] });
      tagMap.get(t).posts.push(p);
    }
  }
  const tags = [...tagMap.values()].sort(
    (a, b) => b.posts.length - a.posts.length || a.name.localeCompare(b.name, 'zh-Hans-CN')
  );

  // 按月归档
  const archiveMap = new Map();
  for (const p of posts) {
    if (p.hidden) continue;
    if (!archiveMap.has(p.monthKey)) {
      archiveMap.set(p.monthKey, {
        key: p.monthKey,
        year: p.date.getFullYear(),
        month: p.date.getMonth() + 1,
        posts: [],
      });
    }
    archiveMap.get(p.monthKey).posts.push(p);
  }
  const archives = [...archiveMap.values()].sort((a, b) => (a.key < b.key ? 1 : -1));

  // 归档按年分组，供 /archives.html 使用
  const yearMap = new Map();
  for (const m of archives) {
    if (!yearMap.has(m.year)) yearMap.set(m.year, { year: m.year, count: 0, months: [] });
    const y = yearMap.get(m.year);
    y.months.push(m);
    y.count += m.posts.length;
  }
  const years = [...yearMap.values()].sort((a, b) => b.year - a.year);

  // 分页
  const totalPages = Math.max(1, Math.ceil(posts.filter((p) => !p.hidden).length / perPage));
  const pagedPosts = [];
  for (let i = 0; i < totalPages; i++) {
    pagedPosts.push({
      page: i + 1,
      url: i === 0 ? '/' : `/page/${i + 1}/`,
      posts: posts.filter((p) => !p.hidden).slice(i * perPage, (i + 1) * perPage),
    });
  }

  return { posts, pages, tags, archives, years, pagedPosts, totalPages, perPage };
}

/** 找相关文章：同标签优先，其次时间接近 */
export function relatedPosts(post, posts, limit = 3) {
  if (!limit) return [];
  const scored = posts
    .filter((p) => p !== post && !p.hidden)
    .map((p) => {
      const shared = p.tags.filter((t) => post.tags.includes(t)).length;
      const gap = Math.abs(p.date.getTime() - post.date.getTime()) / 86400000;
      return { p, score: shared * 1000 - gap };
    })
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((s) => s.p);
}
