---
title: Markdown 写作速查
date: 2026-07-21 09:05
tags: [教程, 写作]
summary: 这个模板支持的 Markdown 语法一览，附带 front matter 字段说明。
---

写文章就是写 Markdown。这一篇把常用语法和支持的扩展都列一遍，方便随时回来查。

<!-- more -->

## Front matter

文件开头用 `---` 包起来的部分是文章元信息：

```yaml
---
title: 文章标题
date: 2026-07-21 09:05
tags: [标签一, 标签二]
cover: /assets/img/demo-cover.svg
summary: 列表页和搜索结果里显示的摘要
draft: false
---

正文从这里开始。
```

支持的字段：

| 字段 | 说明 |
| --- | --- |
| `title` | 标题，留空则用文件名 |
| `date` | 日期，决定排序；支持 `2026-07-21` 或 `2026-07-21 09:05` |
| `updated` | 更新时间，可选 |
| `tags` | 标签，`[a, b]` 或分行 `- a` 两种写法都行 |
| `categories` | 分类，可选 |
| `cover` | 封面图地址；`posts.cover: 'auto'` 时会自动取正文第一张图 |
| `summary` | 摘要，留空自动截取正文前 120 字 |
| `draft` | `true` 时不参与构建（除非加 `--drafts`） |
| `hidden` | `true` 时不出现在列表里，但页面仍然生成 |
| `views` | 手动指定"阅读次数"，留空则生成一个固定占位数字 |
| `slug` / `permalink` | 自定义 URL 文件名 |
| `comments` | 预留字段，静态站默认无评论 |

## 手动控制摘要

在正文里插入 `<!-- more -->`，它之前的内容就是摘要：

```markdown
第一段会被当成摘要显示在列表页。

<!-- more -->

后面的内容只在文章页出现。
```

## 基础语法

**加粗**、*斜体*、~~删除线~~、`行内代码`。

```markdown
**加粗**  *斜体*  ~~删除线~~  `行内代码`
```

链接和图片：

```markdown
[链接文字](https://example.com)
![图片说明](/assets/img/demo-cover.svg)
```

站外链接会自动加上 `target="_blank"`，站内绝对路径会自动补上 `basePath`。

## 列表与引用

- 无序列表
- 第二项
  - 嵌套一层也没问题

1. 有序列表
2. 第二项

> 引用块。
> 可以写多行。
>
> 还能分段。

## 代码块

用三个反引号包起来，写上语言名就会显示在右上角：

````markdown
```js
const theme = 'sepia';
console.log(`当前配色：${theme}`);
```
````

渲染结果：

```js
const theme = 'sepia';
console.log(`当前配色：${theme}`);
```

## 表格

```markdown
| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| a | b | c |
```

| 左对齐 | 居中 | 右对齐 |
| :--- | :---: | ---: |
| a | b | c |

## 任务列表

- [x] 已经做完的事
- [ ] 还没做的事

## 分隔线

三个或更多短横线：

```markdown
---
```

---

## 直接写 HTML

Markdown 里可以直接嵌 HTML，模板不会过滤：

```html
<div style="padding:12px;border:1px solid #ddd;border-radius:4px">
  自定义区块
</div>
```

<div style="padding:12px;border:1px solid #ddd;border-radius:4px">
  自定义区块，就像这样。
</div>

## 标题会自动生成锚点

所有 `##` 及以上的标题都会生成 `id`，可以直接 `#标题名` 跳转。开启 `features.toc` 后，文章页会自动在顶部生成目录。
