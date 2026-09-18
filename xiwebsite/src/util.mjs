/**
 * 通用工具函数（零依赖）
 */

/** 转义 HTML 文本 */
export function escapeHtml(input) {
  return String(input ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 转义 HTML 属性值 */
export const escapeAttr = escapeHtml;

/** 把标题变成 URL 友好的锚点 id（保留中文） */
export function slugify(text) {
  return String(text ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '') || 'section';
}

/** 解析 front matter 里的日期，返回 Date（无效则为 null） */
export function parseDate(value) {
  if (!value) return null;
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : value;
  const raw = String(value).trim();
  // 支持 2026-08-20 / 2026/08/20 / 2026-08-20 10:30 / 2026-08-20T10:30:00
  const m = raw.match(
    /^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[T\s](\d{1,2}):(\d{2})(?::(\d{2}))?)?/
  );
  if (m) {
    const d = new Date(
      Number(m[1]),
      Number(m[2]) - 1,
      Number(m[3]),
      Number(m[4] || 0),
      Number(m[5] || 0),
      Number(m[6] || 0)
    );
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? null : d;
}

const PAD = (n) => String(n).padStart(2, '0');

/** 日期格式化：YYYY MM DD M D 年 月 日 HH mm ss */
export function formatDate(date, pattern = 'YYYY/MM/DD') {
  const d = parseDate(date);
  if (!d) return '';
  const map = {
    YYYY: String(d.getFullYear()),
    MM: PAD(d.getMonth() + 1),
    M: String(d.getMonth() + 1),
    DD: PAD(d.getDate()),
    D: String(d.getDate()),
    HH: PAD(d.getHours()),
    mm: PAD(d.getMinutes()),
    ss: PAD(d.getSeconds()),
  };
  let out = pattern;
  for (const [k, v] of Object.entries(map)) {
    if (k === 'mm' && !/mm/.test(pattern)) continue;
    out = out.split(k).join(v);
  }
  // 中文模式：'YYYY年M月D日'
  out = out.replace(/YYYY年MM月DD日/g, `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`);
  return out;
}

/** ISO 时间字符串，用于 <time datetime> 与 sitemap */
export function isoDate(date) {
  const d = parseDate(date);
  return d ? d.toISOString() : '';
}

/** yyyy-mm 归档键 */
export function monthKey(date) {
  const d = parseDate(date);
  if (!d) return 'unknown';
  return `${d.getFullYear()}-${PAD(d.getMonth() + 1)}`;
}

/**
 * 去掉 Markdown 标记，得到纯文本（用于摘要与搜索索引）
 * @param {string} md
 * @param {{ keepCode?: boolean }} [opts] keepCode=true 时保留代码内容（用于阅读时长估算）
 */
export function stripMarkdown(md, opts = {}) {
  let out = String(md ?? '');
  if (opts.keepCode) {
    // 只脱掉围栏标记，保留代码本身
    out = out.replace(/^[ \t]*(```|~~~)[^\n]*$/gm, ' ');
  } else {
    out = out
      .replace(/```[\s\S]*?```/g, ' ')      // 代码块
      .replace(/~~~[\s\S]*?~~~/g, ' ')
      .replace(/`[^`\n]*`/g, ' ');          // 行内代码
  }
  return out
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')  // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')// 链接保留文字
    .replace(/^\s{0,3}#{1,6}\s+/gm, '')     // 标题
    .replace(/^\s{0,3}>\s?/gm, '')          // 引用
    .replace(/^\s{0,3}([-*+]|\d+\.)\s+/gm, '') // 列表
    .replace(/^\s{0,3}([-*_]\s*){3,}$/gm, ' ') // 分隔线
    .replace(/<\/?[^>]+>/g, ' ')            // 内联 HTML
    .replace(/[*_~]{1,3}/g, '')             // 强调
    .replace(/\|/g, ' ')                    // 表格
    .replace(/\s+/g, ' ')
    .trim();
}

/** 按"字符"截断（中文友好），超出加省略号 */
export function truncate(text, max) {
  const s = String(text ?? '').trim();
  if (!max || max <= 0 || s.length <= max) return s;
  return s.slice(0, max).trimEnd() + '……';
}

/** 估算阅读时长（分钟） */
export function readingTime(text) {
  const s = String(text ?? '');
  const cjk = (s.match(/[\u4e00-\u9fa5\u3040-\u30ff]/g) || []).length;
  const words = (s.replace(/[\u4e00-\u9fa5\u3040-\u30ff]/g, ' ').match(/[A-Za-z0-9]+/g) || []).length;
  const minutes = cjk / 400 + words / 200;
  return Math.max(1, Math.round(minutes));
}

/** 拼接站内 URL，自动带上 basePath 并把反斜杠规范成斜杠 */
export function makeUrl(basePath = '') {
  const base = String(basePath || '').replace(/\/+$/, '');
  return function url(path = '/') {
    let p = String(path || '/');
    if (/^(https?:)?\/\//i.test(p) || p.startsWith('mailto:') || p.startsWith('#') || p.startsWith('data:')) {
      return p;
    }
    if (!p.startsWith('/')) p = '/' + p;
    return base + p;
  };
}

/** 提取 Markdown 里第一张图片的地址 */
export function firstImage(md) {
  const m = String(md ?? '').match(/!\[[^\]]*\]\(\s*([^)\s]+)/);
  return m ? m[1] : '';
}

/** 稳定的伪随机数字，用于"阅读次数"占位显示 */
export function pseudoViews(seed) {
  let h = 2166136261;
  const s = String(seed);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const n = Math.abs(h) % 9000;
  return (n + 600).toLocaleString('en-US');
}

/** 生成面包屑/标签页用的安全文件名 */
export function safeFileName(name) {
  return String(name ?? '')
    .trim()
    .replace(/[\\/:*?"<>|#%&{}$!'@+`=\s]+/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-+|-+$/g, '') || 'tag';
}

/** 标签页的站内路径（文件名保留中文，URL 里做百分号编码） */
export function tagPath(name) {
  return `/tags/${encodeURIComponent(safeFileName(name))}.html`;
}

/** 标签页对应的磁盘文件名 */
export function tagFileName(name) {
  return `${safeFileName(name)}.html`;
}

