/**
 * 极简 YAML front matter 解析器（够用就好，零依赖）
 *
 * 支持：
 *   ---
 *   title: 标题
 *   date: 2026-08-20 10:30
 *   tags: [随笔, 生活]
 *   tags:
 *     - 随笔
 *     - 生活
 *   draft: false
 *   views: 1200
 *   ---
 */

function stripQuotes(v) {
  const s = v.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1);
  }
  return s;
}

function parseScalar(raw) {
  const v = raw.trim();
  if (v === '') return '';
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (/^-?\d+$/.test(v)) return Number(v);
  if (/^-?\d*\.\d+$/.test(v)) return Number(v);
  if (v.startsWith('[') && v.endsWith(']')) {
    return v
      .slice(1, -1)
      .split(',')
      .map((x) => stripQuotes(x))
      .filter((x) => x !== '');
  }
  return stripQuotes(v);
}

/**
 * @param {string} raw 文件原文
 * @returns {{ data: Record<string, any>, content: string }}
 */
export function parseFrontMatter(raw) {
  const text = String(raw ?? '').replace(/^\uFEFF/, '');
  const match = text.match(/^\s*---\r?\n([\s\S]*?)\r?\n---\s*(?:\r?\n|$)/);
  if (!match) return { data: {}, content: text };

  const data = {};
  const lines = match[1].split(/\r?\n/);
  let currentKey = null;

  for (const line of lines) {
    if (!line.trim() || /^\s*#/.test(line)) continue;

    // 列表项：  - value
    const listItem = line.match(/^\s*-\s+(.*)$/);
    if (listItem && currentKey) {
      if (!Array.isArray(data[currentKey])) data[currentKey] = [];
      data[currentKey].push(parseScalar(listItem[1]));
      continue;
    }

    const kv = line.match(/^([A-Za-z0-9_\-$.]+)\s*:\s*(.*)$/);
    if (kv) {
      const key = kv[1];
      const rest = kv[2];
      currentKey = key;
      data[key] = rest.trim() === '' ? '' : parseScalar(rest);
      continue;
    }

    // 多行字符串续行
    if (currentKey && typeof data[currentKey] === 'string') {
      data[currentKey] += ' ' + line.trim();
    }
  }

  return { data, content: text.slice(match[0].length) };
}
