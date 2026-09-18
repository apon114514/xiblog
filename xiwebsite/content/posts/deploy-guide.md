---
title: 把博客托管上线
date: 2026-08-14 16:40
tags: [教程, 部署]
summary: GitHub Pages、Vercel、Netlify、Cloudflare Pages，以及最省事的"拖拽上传"。
---

构建产物是纯静态文件，放在 `dist/` 目录。怎么托管都行，下面按"省事程度"排序。

<!-- more -->

## 最省事：拖拽上传

1. 本地运行 `node build.mjs`
2. 打开 [Netlify Drop](https://app.netlify.com/drop)
3. 把整个 `dist/` 文件夹拖进去

十几秒后就会给你一个 `xxx.netlify.app` 的域名。不需要账号，不需要 Git，不需要命令行。

同理还有 Cloudflare Pages 的 "Direct Upload"。

## 推荐：GitHub Pages

仓库里已经带好了 `.github/workflows/deploy.yml`，推上去就会自动构建并部署。

1. 在 GitHub 新建一个仓库，把本项目所有文件传上去
2. 仓库 **Settings → Pages → Source** 选 **GitHub Actions**
3. 推一次代码，等 Actions 跑完

然后注意一个坑：

> **如果你的仓库名不是 `<你的用户名>.github.io`，站点会挂在子路径下**，地址形如
> `https://用户名.github.io/仓库名/`。
> 这时必须修改 `blog.config.mjs`：
>
> ```js
> basePath: '/仓库名',
> ```
>
> 否则 CSS 和图片全部 404。

如果是 `<用户名>.github.io` 这种仓库，`basePath` 保持空字符串就好。

## Vercel / Netlify 连 Git

仓库里已经有 `vercel.json` 和 `netlify.toml`，导入仓库后**不需要手动配置**：

| 项 | 值 |
| --- | --- |
| Build Command | `node build.mjs` |
| Output Directory | `dist` |
| Node 版本 | ≥ 18 |

Vercel 国内访问通常比 GitHub Pages 快一些；Netlify 免费额度也很够用。Cloudflare Pages 同样支持，配置照抄。

## 自定义域名

在托管平台绑定域名后：

1. 把 `blog.config.mjs` 里的 `url` 改成正式域名（RSS 和 sitemap 会用到）
2. 域名挂在根目录 → `basePath: ''`
3. 域名挂在子目录 → `basePath: '/子目录'`

## 国内主机的备案

如果放在中国大陆的服务器/虚拟主机上，需要 ICP 备案。备案号填在：

```js
footer: {
  icp: '京ICP备00000000号-1',
  icpLink: 'https://beian.miit.gov.cn/',
},
```

页脚会自动带上链接。

## 构建产物里有什么

```
dist/
├── index.html            首页
├── page/2/index.html     分页
├── posts/*.html          文章
├── about.html            独立页面
├── archives.html         归档
├── tags/                 标签
├── search.html           搜索
├── 404.html              找不到页面
├── feed.xml              RSS 订阅
├── sitemap.xml           站点地图
├── robots.txt
├── search.json           站内搜索索引
└── assets/               CSS / JS / 图片
```

全部是静态文件，任何支持静态托管的服务都能用，包括对象存储 + CDN。
