---
title: 如何修改博客风格
date: 2026-09-02 10:15
tags: [教程, 主题]
cover: /assets/img/demo-cover-2.svg
summary: 换配色、换字体、换宽度、换列表样式 —— 全部集中在 theme.config.mjs 一个文件里。
---

这个模板刻意把"内容"和"长相"分开了：

- `blog.config.mjs` 管**内容**：标题、副标题、导航、友链、页脚
- `theme.config.mjs` 管**长相**：颜色、字体、字号、宽度、版式

改风格只需要动第二个文件。

<!-- more -->

## 一、换配色：改一行

```js
// theme.config.mjs
export default {
  preset: 'sepia',   // ← 只改这里
};
```

内置 7 套配色：

| preset | 气质 | 适合 |
| --- | --- | --- |
| `maupassant` | 白底墨字 + 朱红 | 默认，原站同款 |
| `ink` | 几乎无色 | 极简、技术向 |
| `sepia` | 米黄 | 长文阅读、护眼 |
| `ocean` | 青蓝 | 冷静、理性 |
| `forest` | 松绿 | 安静、自然 |
| `plum` | 梅紫 | 文艺 |
| `dark` | 深色 | 夜间 |

想固定用某套配色，就写在上面；想**让读者自己切**，保持 `features.themeSwitcher: true`，右下角会出现一个 ◐ 按钮，选择结果记在浏览器本地。

## 二、微调单个变量

预设不满意的地方，逐个覆盖就行：

```js
export default {
  preset: 'maupassant',
  colors: {
    accent: '#a9603c',     // 正文链接、翻页高亮
    link: '#6E7173',       // 普通链接
    text: '#444444',       // 正文
    bg: '#FFFFFF',         // 背景
  },
};
```

可用的颜色变量：`bg` `bgSoft` `bgCode` `text` `textStrong` `textSoft` `textFaint` `link` `linkHover` `accent` `accentHover` `border` `borderStrong` `selectionBg` `selectionText`。

## 三、换字体

```js
typography: {
  serifStack: '"Noto Serif SC", "Songti SC", Georgia, serif',
  sansStack: '"PingFang SC", "Microsoft YaHei", sans-serif',
  baseSize: '15px',
  contentSize: '16px',
  lineHeight: 1.9,
  letterSpacing: '0.6px',
},
```

想用网络字体，把 `@import` 写进 `customCss`：

```js
customCss: `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
:root { --font-serif: 'Noto Serif SC', var(--font-serif); }
`,
```

## 四、改版式

```js
layout: {
  containerWidth: '1150px',  // 整站宽度
  mainWidth: '800px',        // 主栏宽度
  sidebarWidth: '245px',     // 侧栏宽度
  sidebar: 'right',          // 'right' | 'left' | 'none'

  listStyle: 'excerpt',      // 'excerpt' 摘要 | 'card' 卡片 | 'full' 全文
},
```

- `listStyle: 'card'` 会给每篇文章加边框和圆角，封面图变成大片横幅
- `listStyle: 'full'` 首页直接铺全文，适合写得少、篇篇是长文的人
- `sidebar: 'none'` 彻底去掉侧栏，正文居中

## 五、最后的兜底

如果上面都不够，`customCss` 里可以写任意 CSS，它会追加在样式表最后，优先级最高：

```js
customCss: `
.post-title { letter-spacing: -0.5px; }
#logo { font-weight: 900; }
`,
```

改完运行 `node build.mjs` 重新生成即可。
