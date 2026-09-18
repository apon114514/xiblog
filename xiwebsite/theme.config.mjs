/**
 * ============================================================
 *  风格配置  theme.config.mjs
 * ------------------------------------------------------------
 *  ★ 想换博客长相，改这个文件就够了 ★
 *
 *  三种改法，由浅入深：
 *    1. 换 preset          —— 一行切换整套配色
 *    2. 改下面任意一个值    —— 覆盖单个变量（颜色/字号/宽度/版式）
 *    3. 直接写 CSS         —— customCss 里随便写，会追加到最后
 *
 *  可用的 CSS 变量名见 public/assets/css/main.css 顶部的 :root 列表。
 * ============================================================
 */

export default {
  /* ---------- 1. 配色方案 ---------- */
  // 内置方案（见 public/assets/css/themes.css）：
  //   'maupassant' 原站同款 · 白底墨字朱红点缀（默认）
  //   'ink'        墨白极简 · 几乎无色
  //   'sepia'      米黄护眼 · 适合长文阅读
  //   'ocean'      青蓝冷静
  //   'forest'     松绿安静
  //   'plum'       梅紫文艺
  //   'dark'       深色
  preset: 'plum',

  /* ---------- 2. 变量覆盖 ---------- */
  // 颜色：任何 CSS 颜色值都可以（hex / rgb / hsl / var(...)）
  colors: {
    // accent: '#C83C23',      // 主强调色（正文链接、翻页高亮）
    // link: '#6E7173',        // 普通链接颜色
    // text: '#444444',        // 正文颜色
    // textStrong: '#555555',  // 标题颜色
    // textSoft: '#999999',    // 次要文字（日期、说明）
    // bg: '#FFFFFF',          // 页面背景
  },

  /* ---------- 3. 字体与排版 ---------- */
  typography: {
    // 字体栈。中文优先，其次西文，最后兜底。
    // 想用思源宋体/霞鹜文楷，在这里加字体名即可（配合 customCss 里的 @font-face 或 CDN）。
    sansStack:
      '"Helvetica Neue", Arial, "Hiragino Sans GB", "STHeiti", "Microsoft YaHei", "WenQuanYi Micro Hei", SimSun, sans-serif',
    // 标题/站点名用的衬线字体栈
    serifStack:
      '"ff-tisa-web-pro", Cambria, "Times New Roman", Georgia, Times, "Songti SC", "SimSun", serif',
    monoStack: 'Menlo, Monaco, Consolas, "Lucida Console", "Courier New", monospace',

    baseSize: '14px',      // 全局基准字号
    contentSize: '15px',   // 正文段落字号
    lineHeight: 1.75,      // 正文行高
    letterSpacing: '0.4px',// 正文字间距（中文排版习惯留一点）
    logoSize: '50px',      // 站点名（#logo）字号
    titleSize: '25px',     // 文章标题字号
    widgetSize: '16px',    // 侧栏小工具标题字号
  },

  /* ---------- 4. 版式与布局 ---------- */
  layout: {
    containerWidth: '1150px', // 整站内容宽度（原站 1150px）
    containerPadding: '60px', // 内容区左右内边距
    mainWidth: '800px',       // 主栏宽度
    sidebarWidth: '245px',    // 侧栏宽度
    sidebarGap: '35px',       // 侧栏左内边距（原站用 border-left + 35px）
    sidebarBorder: true,      // 侧栏左侧是否显示竖线
    radius: '2px',            // 圆角

    // 文章列表样式：
    //   'excerpt' 标题 + 摘要 + 「阅读全文」（原站样式，默认）
    //   'card'    卡片式，带封面大图
    //   'full'    首页直接显示全文
    listStyle: 'excerpt',

    // 侧栏位置：'right' | 'left' | 'none'
    sidebar: 'right',

    // 文章页排版
    postAlign: 'left',        // 'left' | 'center'
    postMaxWidth: '760px',    // 文章正文最大宽度
  },

  /* ---------- 5. 任意自定义 CSS ---------- */
  // 会和主样式一起注入到生成的 theme-vars.css 里（在最后，优先级最高）。
  customCss: `
/* 例如：换一套中文字体
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
:root { --font-serif: 'Noto Serif SC', var(--font-serif); }
*/
`,
};
