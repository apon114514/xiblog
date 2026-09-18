---
title: 关于
date: 2026-01-01 00:00
summary: 关于这个站点，以及关于我。
---

## 关于这个站

这里是一个私人博客。写点技术笔记，也写点没什么用的胡思乱想。

本站由**纯静态**方式生成：Markdown 写稿，本地构建成 HTML，托管在静态服务上。没有数据库，没有后台，没有追踪脚本。

## 关于我

一个还在学着把话说清楚的人。

- 主业：写代码
- 副业：写字
- 爱好：把上面两件事都搞复杂

## 联系

如果你想聊点什么，欢迎发邮件：

> your@email.com

*（记得把这里换成你自己的邮箱。）*

## 关于友链

友链列表在 `blog.config.mjs` 的 `sidebar.links.items` 里，格式很简单：

```js
links: {
  enabled: true,
  title: '友链',
  separator: ' / ',
  items: [
    { name: '朋友的名字', url: 'https://example.com' },
  ],
},
```

## 版权

除特别注明外，本站文章采用 [CC BY-NC-SA 4.0](https://creativecommons.org/licenses/by-nc-sa/4.0/deed.zh) 许可协议。转载请注明出处。
