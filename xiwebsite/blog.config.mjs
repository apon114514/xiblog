/**
 * ============================================================
 *  站点配置  blog.config.mjs
 * ------------------------------------------------------------
 *  这里放"内容/信息"层面的设置（标题、菜单、友链、备案号……）。
 *  想改"长相"（颜色、字体、宽度、版式）请编辑 theme.config.mjs。
 * ============================================================
 */

export default {
  /* ---------- 基础信息 ---------- */
  lang: 'zh-CN',
  title: '你们好呀。',                       // 站点名（左上角大标题 #logo）
  description: '一个乐乐的博客。',        // 站点副标题（标题下方小字 .description）

  // 部署后的正式地址，用于 RSS / sitemap / 分享卡片。
  // 留空则自动使用相对路径，多数情况下也能正常工作。
  url: 'https://xn--iwx.website',

  // 如果部署在子目录（例如 GitHub Pages 项目站点 https://user.github.io/myblog/），
  // 把这里改成 '/myblog'；部署在域名根目录就保持空字符串。
  basePath: '',

  author: '熙',
  email: '',

  /* ---------- 顶部导航 ---------- */
  // 会自动高亮当前页面。link 支持站内绝对路径（含 basePath 会自动补全）。
  nav: [
    { text: '首页', link: '/' },
    { text: '归档', link: '/archives.html' },
    { text: '标签', link: '/tags/' },
    { text: '关于', link: '/about.html' },
  ],

  /* ---------- 右侧边栏（#secondary） ---------- */
  sidebar: {
    // 站内搜索框
    search: { enabled: true, placeholder: '搜索' },

    // 近期文章
    recent: { enabled: true, title: '近期文章', count: 10 },

    // 按月归档
    archive: { enabled: true, title: '归档', limit: 0 }, // limit: 0 = 全部

    // 标签云
    tags: { enabled: false, title: '标签' },

    // 友链（原站样式用 " / " 分隔）
    links: {
      enabled: true,
      title: '友链',
      separator: ' / ',
      items: [
        { name: '原神', url: 'https://autopatchcn.yuanshen.com/client_app/download/launcher/20260817103614_ioLXDt6rqSXYqxou/pcbackup319/yuanshen_setup_20260817.exe' },
        { name: '绝区零', url: 'https://autopatchcn.juequling.com/package_download/op/client_app/download/20260818165206_9nBEsfLtMMyHtuYZ/zzz_gw_pc/ZenlessZoneZero_setup_202608032156.exe' },
        { name: 'Steam', url: 'https://cdn.fastly.steamstatic.com/client/installer/SteamSetup.exe' },
        
        
      ],
    },

    // 自定义小工具：想加多少个都行，html 里可以直接写 HTML
    widgets: [
      // {
      //   title: '广告',
      //   html: '<a href="https://example.com"><img src="/assets/img/ad.png" alt="ad"></a>',
      // },
    ],
  },

  /* ---------- 页脚 ---------- */
  footer: {
    // 版权文案。{year} 会自动替换成当前年份，{author} 替换成上面的 author。
    copyright: '© {year} {author}',
    // 备案信息（中国大陆主机需要），不需要就留空
    icp: '',
    icpLink: 'https://beian.miit.gov.cn/',
    // 自定义补充说明，比如 "由 xxx 强力驱动"
    extra: '',
  },

  /* ---------- 文章列表 / 文章页 ---------- */
  posts: {
    perPage: 5,              // 首页每页文章数
    excerptLength: 120,       // 摘要字数（0 = 不截断，显示全文）
    cover: 'auto',            // 封面图：'auto' 自动取正文第一张图 | 'frontmatter' 只认 cover 字段 | 'off' 关闭
    showDate: true,
    showViews: false,          // 显示"阅读"次数（静态站无法统计真实阅读量，默认显示占位数字）
    showReadingTime: true,
    showTags: true,
    relatedCount: 3,          // 文末"相关文章"数量，0 = 关闭
  },

  /* ---------- 功能开关 ---------- */
  features: {
    rss: true,               // 生成 /feed.xml
    sitemap: true,           // 生成 /sitemap.xml
    search: true,            // 生成 /search.json 供站内搜索
    themeSwitcher: true,     // 右下角风格切换按钮（读者可切换配色）
    darkMode: true,          // 跟随系统的深色模式
    backToTop: true,         // 返回顶部按钮
    tags: true,              // 生成标签页
    toc: false,              // 文章页显示目录（文章内 h2~h4 达到 3 个以上时出现）
  },

  /* ---------- 其它 ---------- */
  extras: {
    // 追加到 <head>（统计代码、验证 meta 等）
    headHtml: '',
    // 追加到 </body> 之前（比如百度统计、Google Analytics）
    bodyEndHtml: '',
    // 文章正文前的自定义 HTML（比如打赏、公告）
    postTopHtml: '',
  },
};
