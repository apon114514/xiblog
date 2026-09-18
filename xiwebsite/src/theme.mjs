/**
 * 把 theme.config.mjs 编译成 CSS 变量文件（theme-vars.css）
 *
 * 顺序：内置 preset（themes.css 里的 [data-theme]）→ 这里的 :root 覆盖 → customCss
 * 所以你在 theme.config.mjs 里写的任何值都会盖掉 preset，customCss 优先级最高。
 */

const COLOR_VARS = {
  bg: '--bg',
  bgSoft: '--bg-soft',
  bgCode: '--bg-code',
  text: '--text',
  textStrong: '--text-strong',
  textSoft: '--text-soft',
  textFaint: '--text-faint',
  link: '--link',
  linkHover: '--link-hover',
  accent: '--accent',
  accentHover: '--accent-hover',
  border: '--border',
  borderStrong: '--border-strong',
  selectionBg: '--selection-bg',
  selectionText: '--selection-text',
};

const TYPO_VARS = {
  sansStack: '--font-sans',
  serifStack: '--font-serif',
  monoStack: '--font-mono',
  baseSize: '--font-size-base',
  contentSize: '--font-size-content',
  lineHeight: '--line-height-content',
  letterSpacing: '--letter-spacing',
  logoSize: '--font-size-logo',
  titleSize: '--font-size-title',
  widgetSize: '--font-size-widget',
};

function layoutVars(layout = {}) {
  const out = {};
  const map = {
    containerWidth: '--container-width',
    containerPadding: '--container-padding',
    mainWidth: '--main-width',
    sidebarWidth: '--sidebar-width',
    sidebarGap: '--sidebar-gap',
    radius: '--radius',
    postMaxWidth: '--post-max-width',
  };
  for (const [key, cssVar] of Object.entries(map)) {
    if (layout[key] != null && layout[key] !== '') out[cssVar] = layout[key];
  }
  return out;
}

function declarations(vars) {
  return Object.entries(vars)
    .filter(([, v]) => v != null && v !== '')
    .map(([k, v]) => `  ${k}: ${v};`)
    .join('\n');
}

/** 生成 theme-vars.css 内容 */
export function buildThemeCss(theme) {
  const vars = {
    ...Object.fromEntries(
      Object.entries(theme.colors || {}).map(([k, v]) => [COLOR_VARS[k] || `--${k}`, v])
    ),
    ...Object.fromEntries(
      Object.entries(theme.typography || {}).map(([k, v]) => [TYPO_VARS[k] || `--${k}`, v])
    ),
    ...layoutVars(theme.layout),
  };

  const layout = theme.layout || {};
  const behavior = [];

  // 只输出 main.css 真正会读取的变量；
  // 侧栏位置 / 列表样式由 <html> 上的 data-* 属性驱动，见 render.mjs。
  if (layout.sidebarBorder === false) behavior.push('  --sidebar-border: none;');
  if (layout.postAlign) behavior.push(`  --post-align: ${layout.postAlign};`);

  const root = `:root {\n${declarations(vars)}\n${behavior.join('\n')}\n}`.replace(/\n{3,}/g, '\n');

  const custom = String(theme.customCss || '').trim();

  return `/* 由 theme.config.mjs 自动生成，请勿手改；改配置后重新构建即可。 */
${root}

${custom ? `/* ---------- customCss（theme.config.mjs） ---------- */\n${custom}\n` : ''}`;
}

/** 允许的 preset 名单，用于校验 */
export const PRESETS = ['maupassant', 'ink', 'sepia', 'ocean', 'forest', 'plum', 'dark'];
