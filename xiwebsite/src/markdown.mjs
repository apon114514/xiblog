/**
 * Markdown → HTML
 *
 * 底层使用 vendored 的 marked（MIT，见 src/vendor/），
 * 所以构建时不需要 npm install。这里只做几处站点定制：
 *   · 标题自动生成锚点 id
 *   · 站内绝对路径自动补上 basePath
 *   · 外链自动加 target="_blank" rel="noopener"
 *   · 图片懒加载
 *   · 代码块包一层 .code-block，方便做样式
 */

import { Marked } from './vendor/marked.esm.js';
import { slugify, escapeHtml, escapeAttr } from './util.mjs';

export const MORE_MARKER = /<!--\s*more\s*-->/i;

/**
 * @param {object} options
 * @param {(p:string)=>string} [options.url] 站内链接重写函数
 * @returns {{ html: string, headings: Array<{depth:number,text:string,id:string}> }}
 */
export function createRenderer({ url = (p) => p } = {}) {
  const headings = [];
  const usedIds = new Map();

  function uniqueId(text) {
    let id = slugify(text);
    if (usedIds.has(id)) {
      const n = usedIds.get(id) + 1;
      usedIds.set(id, n);
      id = `${id}-${n}`;
    } else {
      usedIds.set(id, 0);
    }
    return id;
  }

  function rewrite(href) {
    if (!href) return href;
    if (/^(https?:)?\/\//i.test(href) || /^(mailto:|tel:|#|data:)/i.test(href)) return href;
    if (href.startsWith('/')) return url(href);
    return href;
  }

  const marked = new Marked({
    gfm: true,
    breaks: false,
    pedantic: false,
  });

  marked.use({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const plain = text.replace(/<[^>]+>/g, '');
        const id = uniqueId(plain);
        headings.push({ depth, text: plain, id });
        return `<h${depth} id="${escapeAttr(id)}">${text}</h${depth}>\n`;
      },

      code({ text, lang }) {
        const language = (lang || '').split(/\s+/)[0];
        const cls = language ? ` class="language-${escapeAttr(language)}"` : '';
        return (
          `<div class="code-block"${language ? ` data-lang="${escapeAttr(language)}"` : ''}>` +
          `<pre><code${cls}>${escapeHtml(text)}</code></pre></div>\n`
        );
      },

      link({ href, title, tokens }) {
        const text = this.parser.parseInline(tokens);
        const target = rewrite(href);
        const external = /^https?:\/\//i.test(target);
        const attrs = [
          `href="${escapeAttr(target)}"`,
          title ? `title="${escapeAttr(title)}"` : '',
          external ? 'target="_blank" rel="noopener noreferrer"' : '',
        ]
          .filter(Boolean)
          .join(' ');
        return `<a ${attrs}>${text}</a>`;
      },

      image({ href, title, text }) {
        const src = rewrite(href);
        return (
          `<img src="${escapeAttr(src)}" alt="${escapeAttr(text || '')}"` +
          (title ? ` title="${escapeAttr(title)}"` : '') +
          ` loading="lazy" decoding="async">`
        );
      },
    },
  });

  return {
    /** 渲染 Markdown，返回 { html, headings } */
    render(md) {
      headings.length = 0;
      usedIds.clear();
      const html = marked.parse(String(md ?? ''));
      return { html, headings: headings.slice() };
    },
    /** marked 实例，供需要时扩展 */
    marked,
  };
}

/** 渲染行内 Markdown（用于标题等单行场景） */
export function renderInline(md) {
  const m = new Marked({ gfm: true, breaks: false });
  return m.parseInline(String(md ?? ''));
}

/**
 * 取正文中 `<!-- more -->` 之前的部分。
 * 没有标记时返回 null（由调用方按字数截断）。
 */
export function excerptByMarker(md) {
  const parts = String(md ?? '').split(MORE_MARKER);
  return parts.length > 1 ? parts[0] : null;
}

/** 去掉 `<!-- more -->` 标记 */
export function stripMoreMarker(md) {
  return String(md ?? '').replace(new RegExp(MORE_MARKER.source, 'gi'), '');
}
