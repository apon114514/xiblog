# 见字如面 · 静态博客模板

一个**零依赖**的静态博客模板，视觉与结构参照 [hiwannz.com](https://hiwannz.com/)（该站使用 **Maupassant** 主题）。

Markdown 写稿 → 一条命令生成纯静态 HTML → 扔到任何托管平台即可访问。

- ✅ **不需要 `npm install`** —— 唯一依赖（Markdown 解析器）已内置在 `src/vendor/`
- ✅ **可以直接托管** —— 产物是纯静态文件，GitHub Pages / Vercel / Netlify / Cloudflare Pages / 对象存储都能用
- ✅ **风格可自己改** —— 配色、字体、宽度、版式全部集中在 `theme.config.mjs` 一个文件
- ✅ 内置 7 套配色、站内搜索、RSS、sitemap、标签、归档、目录、分页

---

## 一、快速开始

需要 [Node.js](https://nodejs.org/) 18 或更高版本（本机已装 v24）。

```bash
# 1. 本地预览（会自动打开 http://localhost:4321）
node build.mjs --serve

# 2. 正式构建，产物在 dist/
node build.mjs
```

> 如果你的系统限制了 PowerShell 脚本执行（`npm` 报"禁止运行脚本"），
> 直接使用上面的 `node` 命令即可，本模板完全不需要 npm。

### 三步改成你自己的站

1. 编辑 **`blog.config.mjs`** —— 站点名、副标题、导航、友链、页脚、备案号
2. 编辑 **`theme.config.mjs`** —— 配色、字体、宽度、版式
3. 删掉 `content/posts/` 里的示例文章，写自己的

---

## 二、目录结构

```
.
├── blog.config.mjs        ← 站点信息（标题/导航/友链/页脚…）
├── theme.config.mjs       ← 风格（★ 想换长相就改这个）
├── build.mjs              构建入口
├── content/
│   ├── posts/             文章（Markdown，一个文件一篇）
│   └── pages/             独立页面（如 about.md）
├── public/                原样复制到 dist/ 的静态资源
│   └── assets/
│       ├── css/main.css       版式与组件
│       ├── css/themes.css     7 套内置配色
│       ├── js/site.js         配色切换/搜索/返回顶部
│       └── img/
├── src/                   构建代码（一般不用动）
│   ├── markdown.mjs       Markdown 渲染
│   ├── render.mjs         HTML 模板
│   ├── content.mjs        读取整理文章
│   ├── theme.mjs          生成 CSS 变量
│   ├── frontmatter.mjs    front matter 解析
│   ├── util.mjs           工具函数
│   └── vendor/            内置的 marked（MIT）
├── scripts/
│   ├── new-post.mjs       新建文章
│   └── clean.mjs          清空 dist/
├── dist/                  构建产物（部署这个目录）
└── .github/workflows/     GitHub Pages 自动部署
```

---

## 三、写文章

新建一篇：

```bash
node scripts/new-post.mjs "文章标题" --tags 随笔,生活
```

或者直接在 `content/posts/` 里新建 `.md` 文件：

```markdown
---
title: 文章标题
date: 2026-09-18 21:30
tags: [随笔, 生活]
cover: /assets/img/demo-cover.svg
summary: 列表页显示的摘要，不写会自动截取正文前 120 字
---

正文从这里开始。

<!-- more -->

这行之后的内容只在文章页显示，列表页看不到。
```

支持的 front matter 字段：

| 字段 | 说明 |
| --- | --- |
| `title` | 标题，不填则用文件名 |
| `date` | 日期，决定排序，支持 `2026-09-18` 或 `2026-09-18 21:30` |
| `updated` | 更新时间（可选） |
| `tags` | 标签，`[a, b]` 或分行 `- a` 都可以 |
| `cover` | 封面图；`posts.cover: 'auto'` 时会自动取正文第一张图 |
| `summary` | 摘要 |
| `draft` | `true` 时不发布（加 `--drafts` 参数可强制构建） |
| `hidden` | `true` 时不出现在列表，但页面仍然生成 |
| `views` | 手动指定"阅读次数"，不填会自动生成一个固定占位数字 |
| `slug` | 自定义 URL 文件名 |

Markdown 语法（含表格、任务列表、代码块、引用等）见文章
`content/posts/markdown-cheatsheet.md`。

---

## 四、修改风格 ★

**只需要改 `theme.config.mjs`。**

### 1. 换整套配色（一行）

```js
export default {
  preset: 'sepia',
};
```

内置 7 套：

| preset | 气质 |
| --- | --- |
| `maupassant` | 白底墨字 + 朱红点缀（默认，原站同款） |
| `ink` | 墨白极简，几乎无色 |
| `sepia` | 米黄护眼，适合长文 |
| `ocean` | 青蓝冷静 |
| `forest` | 松绿安静 |
| `plum` | 梅紫文艺 |
| `dark` | 深色 |

站点右下角会有一个 ◐ 按钮，**读者也可以自己切换**，选择记在浏览器里
（不想要就把 `blog.config.mjs` 里的 `features.themeSwitcher` 改成 `false`）。

### 2. 微调单个颜色

```js
colors: {
  accent: '#a9603c',   // 正文链接、翻页高亮
  text: '#444444',     // 正文
  bg: '#FFFFFF',       // 背景
},
```

可用变量：`bg` `bgSoft` `bgCode` `text` `textStrong` `textSoft` `textFaint`
`link` `linkHover` `accent` `accentHover` `border` `borderStrong`
`selectionBg` `selectionText`

### 3. 换字体 / 字号

```js
typography: {
  serifStack: '"Noto Serif SC", "Songti SC", Georgia, serif',  // 标题
  sansStack: '"PingFang SC", "Microsoft YaHei", sans-serif',    // 正文
  baseSize: '15px',
  contentSize: '16px',
  lineHeight: 1.9,
  letterSpacing: '0.6px',
},
```

### 4. 改版式

```js
layout: {
  containerWidth: '1150px',  // 整站宽度（原站 1150px）
  mainWidth: '800px',        // 主栏宽度
  sidebarWidth: '245px',     // 侧栏宽度
  sidebar: 'right',          // 'right' | 'left' | 'none'

  listStyle: 'excerpt',      // 'excerpt' 摘要 | 'card' 卡片 | 'full' 全文
  postAlign: 'left',
  postMaxWidth: '760px',
},
```

- `listStyle: 'card'` —— 首页变成卡片流，封面图变横幅
- `listStyle: 'full'` —— 首页直接显示全文（适合篇篇长文、更新不频繁）
- `sidebar: 'none'` —— 去掉侧栏，正文居中

### 5. 兜底：直接写 CSS

```js
customCss: `
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@400;700&display=swap');
:root { --font-serif: 'Noto Serif SC', var(--font-serif); }
.post-title { letter-spacing: -0.5px; }
`,
```

`customCss` 会追加在样式表最后，优先级最高。

改完重新运行 `node build.mjs` 即可。

---

## 五、部署上线

### 最省事：拖拽上传（不需要 Git、不需要账号）

1. 运行 `node build.mjs`
2. 打开 <https://app.netlify.com/drop>
3. 把 **`dist/` 整个文件夹**拖进去

几秒后就能拿到一个 `xxx.netlify.app` 域名。
Cloudflare Pages 的 "Direct Upload" 同理。

### GitHub Pages（自动构建）

仓库里已经带好了 `.github/workflows/deploy.yml`。
推送到 `main` 后会**自动**执行 `node build.mjs` 并把 `dist/` 发布出去，
不需要你本地构建、也不需要提交 `dist/`。

#### 第 1 步：把代码传到 GitHub

本模板不依赖 `git`，下面三种方式任选：

| 方式 | 适合 | 说明 |
| --- | --- | --- |
| **GitHub Desktop** | 推荐 | 图形界面，装好后 `Add local repository` → `Publish repository` 即可 |
| **Git for Windows** | 熟悉命令行 | 装完后 `git init` → `git add .` → `git commit -m init` → `git remote add origin ...` → `git push -u origin main` |
| **网页上传** | 临时试水 | 仓库页 `Add file → Upload files`，把项目文件夹拖进去 |

> ⚠️ **网页上传的坑**：浏览器拖拽上传**经常会漏掉 `.github` 这类点开头的文件夹**。
> 如果漏了，Actions 永远不会触发。补救办法：
> 在仓库页点 `Add file → Create new file`，文件名一栏直接输入
> `.github/workflows/deploy.yml`（斜杠会自动创建目录），
> 然后把本地这个文件的内容粘进去。

#### 第 2 步：开启 Pages

仓库 **Settings → Pages → Build and deployment → Source** 选 **GitHub Actions**。

这一步**必须先做**。如果跳过，Actions 会在 `configure-pages` 那一步报
`Get Pages site failed`。

#### 第 3 步：触发并查看

推送代码，或到 **Actions** 标签页点 `Deploy to GitHub Pages` → `Run workflow`。
跑完约 30 秒，站点地址在 `deploy` 步骤的 Summary 里，形如
`https://用户名.github.io/仓库名/`。

#### basePath：最容易踩的坑

| 仓库名 | 站点地址 | `basePath` 要填 |
| --- | --- | --- |
| `用户名.github.io` | `https://用户名.github.io/` | `''`（默认，不用改） |
| 其它任意名字 | `https://用户名.github.io/仓库名/` | `'/仓库名'` |

填错的典型症状：**首页能打开，但完全没有样式、图片全裂** —— 因为 CSS 请求打到了
`用户名.github.io/assets/...` 而不是 `用户名.github.io/仓库名/assets/...`。

改完重新推送即可。构建时会自动把 `basePath` 拼到 canonical / sitemap / RSS 上，
不需要你手动改 `url`。

#### 备选：完全不用 Actions

如果你不想碰 CI，也可以让 Pages 直接发布已提交的 `dist/`：

**Settings → Pages → Source** 选 **Deploy from a branch**，
分支选 `main`，文件夹选 **`/dist`**。

这种方式要求 `dist/` 已提交到仓库（本模板默认**不**忽略 `dist/`，所以开箱可用），
且每次改完内容都要在本地跑一次 `node build.mjs` 再推送。

两种方式的区别：Actions 每次都由 GitHub 现场构建，永远和源码同步；
Deploy from a branch 更快、更省额度，但依赖你记得本地构建。

### Vercel / Netlify 连接 Git

仓库里已有 `vercel.json` 和 `netlify.toml`，导入后**无需手动配置**：

| 配置项 | 值 |
| --- | --- |
| Build Command | `node build.mjs` |
| Output Directory | `dist` |
| Install Command | 留空（零依赖） |

### 部署前检查清单

- [ ] `blog.config.mjs` 的 `url` 改成真实域名（否则 RSS / sitemap / canonical 不对，构建时会警告）
- [ ] `basePath` 设置正确（根目录填 `''`，子目录填 `'/子目录'`）
- [ ] 用 GitHub Pages 的话：仓库 **Settings → Pages → Source** 已选 **GitHub Actions**
- [ ] `.github/workflows/deploy.yml` 确实在仓库里（网页上传容易漏掉 `.github`）
- [ ] `footer.icp` 填上备案号（仅中国大陆主机需要）
- [ ] 替换 `public/assets/img/favicon.svg` 为自己的图标

---

## 六、配置项速查

### `blog.config.mjs`

| 配置 | 说明 |
| --- | --- |
| `title` / `description` | 站点名 / 副标题 |
| `url` | 正式域名（用于 RSS、sitemap、canonical） |
| `basePath` | 部署在子目录时填写，如 `'/myblog'` |
| `nav` | 顶部导航数组 |
| `sidebar.search/recent/archive/tags/links/widgets` | 侧栏各小工具开关与内容 |
| `footer.copyright/icp/extra` | 页脚，`{year}` `{author}` 会自动替换 |
| `posts.perPage` | 首页每页文章数 |
| `posts.excerptLength` | 摘要字数 |
| `posts.cover` | `'auto'` / `'frontmatter'` / `'off'` |
| `posts.relatedCount` | 文末相关文章数量，`0` 关闭 |
| `features.rss/sitemap/search/themeSwitcher/backToTop/tags/darkMode/toc` | 功能开关 |
| `extras.headHtml/bodyEndHtml/postTopHtml` | 插入统计代码等自定义 HTML |

### `theme.config.mjs`

见上一节。

---

## 七、常见问题

**Q：必须有 Node.js 吗？**
构建时需要。但你只需要在一台机器上构建一次，把 `dist/` 上传到托管平台即可 —— 托管平台本身不需要 Node。用 GitHub Actions 的话，平台会自动帮你构建。

**Q：`npm` 报"禁止运行脚本"？**
Windows PowerShell 的默认执行策略限制。直接用 `node build.mjs` 就行，本模板不需要 npm。

**Q：文章链接是什么格式？**
文章是 `/posts/<文件名>.html`，独立页面是 `/<文件名>.html`。可以在 front matter 里用 `slug` 自定义。

**Q：静态站怎么统计阅读量？**
不能。`posts.showViews` 显示的固定数字是构建时生成的占位值（同一篇文章每次构建结果相同，看起来稳定）。想显示真实数据，可以用 `extras.postTopHtml` 或 `bodyEndHtml` 接入不蒜子之类的第三方统计。

**Q：支持评论吗？**
模板本身不带。可以用 `extras.bodyEndHtml` 接入 Giscus / Waline / Twikoo —— 它们都是往页面注入一段脚本，和静态站很搭。

**Q：中文标签的 URL 很难看？**
文件名保留中文，但 HTML 里的链接做了百分号编码（`/tags/%E9%9A%8F%E7%AC%94.html`），浏览器地址栏会显示成中文，正常现象。

**Q：怎么本地预览？**
`node build.mjs --serve`，默认 <http://localhost:4321>，改文件自动重建。换端口加 `--port 4000`。

---

## 八、技术说明

- **构建**：Node.js 原生 ESM，零第三方依赖。Markdown 解析使用内置的
  [marked](https://github.com/markedjs/marked)（MIT，已 vendor 到 `src/vendor/`，含许可证）。
- **样式**：CSS 自定义属性 + 原生 CSS，无预处理器、无构建步骤。
- **脚本**：原生 JS，无框架。
- **视觉基准**：参照 [hiwannz.com](https://hiwannz.com/) 使用的
  **Maupassant** 主题（Typecho 原版作者 Cho，WordPress 移植版整理于
  [sdg32/maupassant](https://github.com/sdg32/maupassant)，另有
  [Hugo](https://github.com/JokerQyou/maupassant-hugo) /
  [Hexo](https://github.com/icylogic/maupassant-hexo) /
  [Jekyll](https://github.com/imkarl/maupassant-jekyll) 等多个移植版本）。
  本模板是**独立的静态站实现**，沿用其版式思路与类名结构，未复制其代码。

### 调研时参考过的同类开源项目

| 项目 | Star | 技术栈 | 可借鉴之处 |
| --- | --- | --- | --- |
| [satnaing/astro-paper](https://github.com/satnaing/astro-paper) | 5.0k | Astro | 极简博客的信息架构与 SEO 处理 |
| [cworld1/astro-theme-pure](https://github.com/cworld1/astro-theme-pure) | 1.1k | Astro | 中文博客的配置化约定 |
| [jerryc127/hexo-theme-butterfly](https://github.com/jerryc127/hexo-theme-butterfly) | 8.4k | Hexo | 侧栏小工具与主题配置项设计 |
| [fluid-dev/hexo-theme-fluid](https://github.com/fluid-dev/hexo-theme-fluid) | 8.2k | Hexo | 主题配置文件的组织方式 |
| [dillonzq/LoveIt](https://github.com/dillonzq/LoveIt) | 3.9k | Hugo | 中文排版与配色预设 |
| [cotes2020/jekyll-theme-chirpy](https://github.com/cotes2020/jekyll-theme-chirpy) | 10.3k | Jekyll | 搜索索引与归档页实现 |
| [nunocoracao/blowfish](https://github.com/nunocoracao/blowfish) | 2.9k | Hugo | 多配色方案切换机制 |

本模板同时保留了 Maupassant 的类名结构
（`#header` / `#logo` / `.post-title` / `.post-meta` / `.content-detail` /
`.page-navigator` / `#secondary` / `.widget` / `.widget-title`），
所以网上任何针对 Maupassant 的样式片段，基本都能直接拿来用。

---

## 许可

模板代码：MIT。
示例文章内容仅作演示，可随意删除。
