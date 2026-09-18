/**
 * 新建一篇文章：
 *   node scripts/new-post.mjs "文章标题"
 *   node scripts/new-post.mjs "文章标题" --tags 随笔,生活
 */

import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const POSTS_DIR = path.join(ROOT, 'content', 'posts');

const args = process.argv.slice(2);
const title = args.find((a) => !a.startsWith('--'));

if (!title) {
  console.error('\n用法： node scripts/new-post.mjs "文章标题" [--tags 标签1,标签2]\n');
  process.exit(1);
}

const tagsIdx = args.indexOf('--tags');
const tags = tagsIdx >= 0 && args[tagsIdx + 1] ? args[tagsIdx + 1] : '';
const tagList = tags ? tags.split(/[,，]/).map((t) => t.trim()).filter(Boolean) : [];

function slugify(text) {
  const s = text
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '');
  return s || 'post-' + Date.now();
}

function now() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`;
}

const slug = slugify(title);
const file = path.join(POSTS_DIR, `${slug}.md`);

try {
  await access(file);
  console.error(`\n文件已存在： content/posts/${slug}.md\n`);
  process.exit(1);
} catch {
  /* 不存在，可以创建 */
}

const body = `---
title: ${title}
date: ${now()}
tags: [${tagList.join(', ')}]
# cover: /assets/img/demo-cover.svg   # 封面图，可留空（写 'auto' 时自动取正文第一张图）
# summary: 列表页显示的摘要，留空则自动截取正文
# draft: true                         # 草稿不会出现在站点上
---

在这里开始写正文。

<!-- more -->

## 二级标题

普通段落。**加粗**、*斜体*、~~删除线~~、\`行内代码\`。

> 引用一段话。

- 列表项一
- 列表项二

\`\`\`js
console.log('代码块');
\`\`\`
`;

await mkdir(POSTS_DIR, { recursive: true });
await writeFile(file, body, 'utf8');

console.log(`\n  ✓ 已创建 content/posts/${slug}.md`);
console.log('    写完运行： node build.mjs\n');
