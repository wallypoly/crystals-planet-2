# Project Worklog

---

Task ID: 1
Agent: Z.ai Code (main)
Task: 复刻 https://www.moonarqstudio.com/crystals 的内容与设计（Interactive Crystal Atlas / Crystal Library）

Work Log:
- 用 page_reader + agent-browser 抓取并截图原站，提取 ld+json 与 RSC flight 数据，获得全部 17 颗水晶的完整资料（名称、颜色族、palette、轨道 ring/angle/cluster/intensity、intro、keywords、properties、pairingNotes、build/source sizes、grades、82 个变体统计、CTA 文案）
- 下载 17 张 720x720 珠子实拍图到 `public/images/build-your-own/beads/`（保留原站路径）
- 创建数据层 `src/lib/stones-data.ts`（Stone 类型 + STONES 数组 + TOTAL_STONES/TOTAL_VARIANTS）
- 配置 `src/app/layout.tsx`：Cormorant Garamond / Cinzel / Manrope / GFS Didot 四套 Google 字体 + SEO 元数据
- 重写 `src/app/globals.css`：暗色宇宙主题（@layer components 包裹自定义样式）、跑马灯/星野/漂移/连线绘制/面板滑入等动画、桌面椭圆轨道 + 移动端同心圆轨道响应式、自定义滚动条
- 组件化构建：
  - `ticker.tsx` 顶部 WELCOME10 无缝跑马灯
  - `site-header.tsx` 汉堡菜单（shadcn Sheet 抽屉含 4 组导航）、MoonArq 手写体 Logo、中心 CRYSTAL ATLAS 品牌、Cart/Account/Build chips
  - `brand-mark.tsx` 新月+叶片 SVG Logo（useId 防 mask id 冲突）
  - `atlas-map.tsx` 核心交互地图：伪 3D 椭圆轨道（ring 半径/深度缩放/亮度/z-index）、17 节点漂移动画、SVG 渐变星座连线（选中高亮）、滚轮/拖拽旋转（惯性衰减）、键盘左右键旋转、ResizeObserver 驱动的移动端像素级同心圆布局
  - `atlas-detail.tsx` 详情面板：前/后切换+计数、大图+SKU 徽章、palette 驱动的 kicker 配色、规格四宫格、Symbolic Styling / Pairing Ideas、Build CTA
  - `atlas-notes.tsx` Atlas Notes 抽屉（Reference layer 文案 + 指标 + 双按钮）
  - `crystal-atlas.tsx` 编排器：选中态、palette CSS 变量主题联动、Escape 关闭、滚动锁定
  - `page.tsx` 页面组装 + 粘性页脚
- agent-browser 端到端验证并修复的问题：
  1. 珠子图片 404（public 路径不一致）→ 移动文件到 `public/images/build-your-own/beads/`
  2. 节点圆形图壳高度塌陷为 2px（drift span 的 will-change: transform 成为绝对定位包含块）→ drift 改为 absolute inset-0
  3. 详情面板被 ticker 遮挡 → 面板从 fixed 改为 universe 内 absolute（与原站一致从 header 下方开始）
  4. Tailwind v4 未分层自定义 CSS 覆盖工具类（max-sm:hidden 失效）→ 自定义样式包进 @layer components，header 响应式规则移到层外
  5. 拖拽时文字/图片被选中出现蓝色高亮 → user-select:none + -webkit-user-drag:none
  6. pointer capture 导致节点点击失效（click 落到 map）→ 改为移动超过阈值后才 setPointerCapture 的"惰性捕获"策略，拖拽后 200ms 内的 click 也会被忽略防误触
  7. 移动端轨道圈与节点不对齐 → ResizeObserver 测量 map 尺寸，用像素计算同心圆位置，SVG 圈同步尺寸
  8. 页脚不贴底 → 去掉桌面端 universe 的多余 min-height，flex:1 + footer mt-auto 生效
  9. 多次遭遇 Turbopack CSS 陈旧缓存（改 CSS 后浏览器仍用旧规则）→ rm -rf .next 重启解决；还遇到 next/font/google 缓存损坏报错，深度清理后恢复

Stage Summary:
- 已完成 MoonArq Crystal Library 的 1:1 复刻：内容（17 stones / 82 variants、全部编辑文案、真实珠子图）与设计（暗色宇宙轨道、金色衬线排版、交互式星图）均已还原
- 全部交互经浏览器验证：滚轮/拖拽（带惯性）旋转、节点点击详情、前后导航、Atlas Notes、键盘可达性（方向键旋转、Escape 关闭、aria 标签完整）、移动端底部抽屉与拖拽
- 桌面 1280x800 与移动 390x844 截图对比原站高度一致；lint 0 错误；dev.log 无运行时错误
- 关键文件：src/lib/stones-data.ts、src/components/crystal/*（7 个组件）、src/app/page.tsx、globals.css
- 已知注意事项：沙箱内 Turbopack 对 CSS 更新偶发陈旧缓存，遇到"改了没生效"先 rm -rf .next 重启 dev server

---
---
Task ID: 2
Agent: Z.ai Code (cron webDevReview round 2)
Task: QA 回归 + 新功能（搜索筛选 / 收藏夹 / 网格画廊 / 宝石档案）

Work Log:
- QA 回归：17 节点/17 图全部加载、页脚贴底、无控制台错误，Round 1 状态稳定，无需修 bug
- 数据扩展：`stones-data.ts` 每颗石头新增 `hardness`(莫氏硬度)/`chakra`(脉轮)/`birthstone`(诞生月) 三个字段，Stone 接口同步更新
- 新组件 `atlas-dock.tsx`（筛选 Dock，底部玻璃拟态条）：
  - 搜索框：按名称/色系/材质/脉轮/诞生石/关键词/中文名模糊匹配
  - 10 个色系筛选 chips（色点带辉光）+ All + 计数 "N / 17"
  - 视图切换（轨道 ⇄ 网格）、收藏入口按钮（含数量徽章）
  - 桌面 absolute 底部横条；移动端改为标题下方流式布局（搜索全宽 + chips 横向滚动）
- 地图联动：`atlas-map.tsx` 新增 `matchSlugs` prop — 不匹配节点 opacity 0.18 + 灰度化 + pointerEvents none，连线分三档透明度（0.04/0.3/0.5）
- 新组件 `atlas-grid.tsx`（网格画廊视图）：17 张深色玻璃卡片（珠图 + 色系 kicker + 衬线名 + 尺寸/诞生月 + Mohs 徽章 + 心形收藏），逐卡入场动画，空结果态
- 新组件 `favorites-drawer.tsx`（收藏抽屉）：左侧滑入，列表（缩略图/色系/名称/尺寸/硬度）+ Locate（选中并关闭）+ Remove，空态引导文案
- 详情面板：顶部新增心形收藏切换按钮（激活粉色），新增 "STONE PROFILE" 三列规格（Mohs/Chakra/Birthstone）
- 收藏状态：`crystal-atlas.tsx` 管理，localStorage key `atlas-favorites` 持久化；用 queueMicrotask 延迟读取避免 setState-in-effect lint 错误，且防止初始 [] 覆盖已存数据
- 修复的问题：
  1. 网格卡片行高塌陷 56px（auto 行在定高 overflow 容器 + aspect-ratio 内容下异常）→ `grid-auto-rows: max-content`
  2. 网格卡片与左侧标题重叠 → 桌面端 scroll 区 padding-left clamp(0px, 30vw, 440px)
  3. 移除 atlas-grid/favorites-drawer 中失效的 eslint-disable 注释
- 再次踩坑确认：Turbopack 对 CSS 改动极易陈旧缓存（本轮两次），统一用 `pkill next dev + rm -rf .next + 重启` 解决

QA 验证结果（全部通过）：
- 筛选：Purple → 2/17 高亮 15 个变暗；搜索 "tiger" → 3/17；All 复位
- 网格：17 卡渲染正常、卡片点击打开详情（Sunstone）
- 收藏：详情心形切换（激活/取消）+ Dock 徽章 0/1/2 实时联动 + localStorage reload 持久化 + 抽屉 Locate/Remove
- 视图切换往返正常；Escape 关闭所有面板；移动端 Dock 流式布局 + 收藏徽章正常
- lint 0 错误 0 警告；dev.log 0 错误；测试数据已从 localStorage 清理

Stage Summary:
- 新增三大功能模块：搜索/色系筛选（轨道联动变暗）、双视图（轨道/网格画廊）、收藏夹（持久化 + 抽屉管理）
- 详情面板新增 Stone Profile（Mohs 硬度/脉轮/诞生石），信息密度对齐专业宝石图鉴
- 风险/注意：Turbopack CSS 缓存问题依旧（改 CSS 后必须验证是否生效）；收藏功能仅前端本地存储，若后续接 Prisma 可迁移为用户账户数据
- 下一阶段建议：① 节点 hover 快速收藏小按钮 ② 中英文双语（数据里已有中文名 sourceNames）③ 珠子尺寸模拟手链预览器 ④ 分享收藏夹（URL 参数编码）⑤ 页面 title 动态随选中石头更新

---
Task ID: 3
Agent: Z.ai Code (cron webDevReview round 3)
Task: QA 回归 + 新功能（手链工作台 Bracelet Studio / 中英双语 / 分享收藏夹 / 节点快速收藏 / 动态 title / 尺寸比例尺）

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844）：17 节点渲染、详情面板、收藏徽章/localStorage、网格视图、搜索 "tiger"→3/17、移动端轨道与 Dock 全部通过，无控制台错误 → 状态稳定，无需修 bug，进入功能开发
- 新增 `src/lib/i18n.ts`：Lang 类型 + 完整中英 UI 词典（t()）+ STONE_ZH 17 颗水晶的原创中文资料（名称/色系/脉轮/诞生月/介绍/关键词/寓意/搭配）+ CHAKRA_ZH/MONTH_ZH 映射；语言偏好持久化 localStorage key `atlas-lang`
- 新增 `src/lib/bracelet.ts`：Bead/BraceletDesign 类型、5 组灵感预设（交错混色算法）、内圈长度计算、珠数/腕围换算、设计 base64url 编解码（#bd= 哈希）、localStorage 存取（key `atlas-bracelets`，上限 24 条）
- 新增 `src/components/crystal/bracelet-studio.tsx`（手链工作台，全屏弹层）：
  - SVG 手链画布：真实珠子图按圆周切线排布，比例尺随珠数/珠径自适应（周长恒等 Σmm），径向微抖动模拟手工感，珠面高光/描边/投影，点击珠子移除，hover 放大（嵌套 g 防 CSS transform 覆盖 SVG 定位）
  - 珠盘：17 石 chips + 每石 mm 规格 pills + 当前使用数量徽章
  - 控制：5 预设、腕围 15-19cm 选择、Auto-fit 自动补珠（按出现最多珠型填充到腕围）、撤销/清空、旋转滑杆 + 自动旋转开关
  - 统计：珠数 + 内圈长度 cm + 腕围进度条
  - 保存设计（命名 + localStorage）、分享（复制 #bd= 链接）、已保存列表（预览色点/载入/分享/删除）
- crystal-atlas.tsx 编排升级：lang 状态与持久化、studioOpen/studioSeed、URL 解析（?favs= 分享收藏夹 → 写入收藏并清参；#bd= → 解码并自动打开工作台后清哈希）、动态 document.title（选中石头名 + 语言化后缀）、Escape 优先关 Studio
- 组件 i18n 改造：dock（搜索/色系/视图/收藏 aria）、map（节点名/aria/色系中文）、grid（卡片 kicker/月份）、detail（全部标签/中文副标题 EN 小字/CTA "用 X 做手链"）、notes、favorites（含中文文案）；搜索 haystack 追加中文名/中文色系/中文关键词（"紫"→3/17 验证通过）
- 新交互：
  - 节点快速收藏心形 chip（hover 显现、激活常显粉色辉光、hover:none 设备常显、stopPropagation 不触发详情）——注意被左侧文案块遮挡的节点点击会被拦截（与原站一致的空间关系，非 bug）
  - 详情 CTA 不再是死链：preventDefault → 打开手链工作台并预置该石一颗 8mm 珠
  - 详情面板新增 "Bead Size Scale/珠径比例尺"：按 availableMm 渲染渐变色球体比例点
- 新样式（globals.css，约 530 行）：节点心形 chip、选中节点 halo 脉冲环、中文副标题、尺寸比例尺、Dock 语言/宝石按钮、Studio 全套（弹层/画布/珠盘/工具/统计/保存列表 + 1023px/640px 两档响应式，移动端 100dvh 全屏）；reduced-motion 补充 halo/br-spin 停用
- 修复/防坑：
  1. ESLint react-hooks/set-state-in-effect：studio seed 与 saved 载入改 queueMicrotask 延迟
  2. SVG bead hover：CSS transform 会覆盖 transform 属性 → 拆外层定位 g + 内层 .br-bead 缩放 g
  3. agent-browser fill "" 不能清空受控 input → 回归测试时用 Dock 自带 ✕ 清除按钮（UI 路径本身正常）
  4. Turbopack CSS 缓存：本轮改动后统一 rm -rf .next 重启 dev server 验证

QA 验证结果（全部通过）：
- Studio：空态提示 → Violet Dusk 预设 24 珠 17.2cm 渲染正确、珠盘徽章 8/5/4/6 联动、保存 "My Violet" → 列表出现、分享剪出 #bd= 正确编码、Escape 关闭
- 分享链接回放：带 #bd= 重载 → 工作台自动打开并载入 24 珠，URL 哈希被清除，localStorage 不被污染
- 双语：EN⇄中文 全 UI 切换（含 aria 标签 "打开 金虎眼（金色 石材）"），中文搜索 "紫"→3/17，动态 title 中文态 "交互式水晶星图 | 水晶图书馆"、选中态 "Golden Tiger's Eye · 水晶图书馆"
- 快速收藏：节点心形 → localStorage + Dock 徽章 + 粉色激活态联动
- 移动端：Dock 流式布局正常、Studio 全屏弹层画布/珠盘正常
- lint 0 错误 0 警告；dev.log 无运行时错误；测试数据已从 localStorage 清理

Stage Summary:
- 新增四大能力：手链工作台（复刻原站 Build Your Own 概念的可玩实现）、全站中英双语、收藏夹/手链分享链接、节点快速收藏；详情面板新增珠径比例尺、CTA 全部联通工作台
- 收藏与手链均为纯前端 localStorage；如后续接 Prisma 可迁移为用户数据（接口已在 lib/bracelet.ts 收敛，迁移成本低）
- 已知小事项：①节点心形在 Playwright/触屏环境因 hover:none 常显，桌面真实鼠标下为 hover 显现（符合预期）；②沙箱剪贴板读取被权限拒绝（写入正常），分享功能在真实浏览器可用；③中文标题字体走系统字体回退（Google Fonts 未含中文子集，观感可接受）
- 下一阶段建议：①手链导出图片（canvas snapshot）；②Atlas Notes 中 "Guided Bracelet Design" 按钮接工作台预设引导流；③按诞生月/脉轮的 "今日推荐" 水晶；④URL 同步选中石头（?stone=slug）便于分享单颗水晶视图；⑤节点连线按 pairing 关系重连（数据已有 pairingNotes）

---
Task ID: 4
Agent: Z.ai Code (cron webDevReview round 4)
Task: QA 回归 + 新功能（URL 深链接 ?stone= / pairing 搭配连线 / 今日水晶 / 手链导出 PNG / Notes CTA 接线）

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844）：17 节点、详情面板、Studio 预设（Violet Dusk 24 珠 17.2cm）、中文切换 + 动态 title、移动端 Dock/轨道、localStorage 干净、控制台 0 错误 → 状态稳定，无需修 bug，进入功能开发
- 数据层：stones-data.ts 每颗石头新增 `pairs: string[]`（由 pairingNotes 编辑提炼的机器可读伙伴 slug，17 组双向关系）；新增 src/lib/daily.ts（dailyStone：按本地日期哈希轮换，同一天恒定、相邻天不相邻）
- i18n：新增 dailyKicker/dailyCta/dailyAria/dailyBadge、pairHint、shareStone、exportPng/exported/exportHint 双语词条
- 功能 1 — URL 深链接：crystal-atlas.tsx 挂载 microtask 解析 ?stone=slug 自动打开详情；selectedSlug 变化时 history.replaceState 同步/清除参数（不污染历史栈）；详情面板新增"复制本颗水晶链接"按钮（Link2 图标，复制 /?stone=slug，成功打勾反馈）
  - 修复挂载时序 bug：URL 同步 effect 原本在 init microtask 之前运行，会把尚未读取的 ?stone= 参数删掉 → 加 favLoadedRef 守卫，init 消费完参数后再同步
- 功能 2 — pairing 星座连线：atlas-map.tsx 新增 buildPairLines（选中节点 → 各伙伴的渐变虚线，双层动画 pair-draw 入场 + pair-flow 流动），独立 SVG 层 + 独立渐变 defs，金色辉光 drop-shadow；详情面板 Pairing Ideas 重构为可点击行（matchPartner 按 EN/中文名前缀匹配出伙伴 slug，色点 + 虚线下划线 + hover 辉光，点击直达伙伴节点；"Nearly every MoonArq palette" 等非宝石条目保持纯文本）
- 功能 3 — 今日水晶：左上文案区新增 atlas-daily 卡片（珠图 + ✨CRYSTAL OF THE DAY/今日水晶 + 衬线名 + CTA，金色描边玻璃卡，点击打开详情）；地图对应节点自动获得 is-daily 金环辉光 + daily-breathe 呼吸动画 + 左上角 Sparkles 星标 chip（aria/tooltip 齐全）；Atlas Notes 的 "Guided Bracelet Design" 从死链接通 openGuided：按今日水晶色系匹配预设（FAMILY_PRESET 映射 10 色系 → 5 预设）预载工作台并命名 "Guided · X / 今日灵感 · X"；"Build Your Own" 同时接通 openStudio
- 功能 4 — 手链导出 PNG：bracelet-studio.tsx 新增导出按钮（ImageDown 图标，actions 行第 4 位）；实现：克隆 SVG → fetch 同源珠图转 dataURL 内联（带缓存）→ 序列化 → Image 光栅化到 1200x1420 canvas → 径向渐变暗背景 + 金色 kicker + 衬线标题（设计名或 "Bracelet Studio"）+ 统计行（珠数/内圈长度/腕围）→ toBlob 下载；导出中 "…" 与完成 "Saved ✓/已保存 ✓" 状态反馈
- 样式（globals.css 追加约 240 行）：pair 线动画与辉光、每日节点金环/星标/呼吸、atlas-daily 卡（桌面 320px / 移动全宽紧凑双档）、atlas-pair-link 色点+虚线+辉光、分享按钮金色 is-active、reduced-motion 停用 pair-flow/呼吸
- QA 验证（全部通过）：深链接 ?stone=sunstone 直开详情且 URL 保留；关闭详情 URL 清回 /；点击今日卡片开灰月光详情；pair 线从选中节点连向 3 伙伴（截图确认发光虚线）；搭配链接点击白水晶 → 详情与 URL 同步跳转；引导流 → 工作台预载 24 珠午夜烟霞 + 名称"今日灵感 · 灰月光"；导出 PNG 真实下载 1.2MB 卡片图（~/Downloads/moonarq-bracelet-*.png，背景/手链/排版/统计全部正确）；中英双语全量切换；移动端今日卡片紧凑布局与节点星标正常；网格视图 17 卡回归正常；lint 0 错误；dev.log 无错误；测试后 localStorage 已清理

Stage Summary:
- 新增四大功能：?stone= 可分享深链接（含面板一键复制）、pairing 搭配星座连线 + 可点击搭配伙伴、每日水晶（卡片/节点星标/guided 引导流三处联动）、手链设计导出 PNG 分享卡片
- 至此往期建议清单 ①②③④⑤ 全部落地；Atlas Notes 两个 CTA 不再是死链
- 数据层 pairs 字段为编辑内容（原创提炼），后续可用于"搭配推荐"页或推荐算法
- 已知小事项：①导出 PNG 中文字体走 canvas 系统字体（与页面中文回退一致）；②pair 线在筛选变暗时仍显示（视觉上与暗节点叠加，可接受；如需可按 matchSlugs 降透明度）；③浏览器 ~/Downloads 留有一张 QA 导出的测试图片可删
- 下一阶段建议：①按 pairs 做一键"搭档预设"（详情面板加"用这 2 颗做手链"按钮）；②今日水晶支持翻看过去 7 天（dailyStone 接受日期参数已就绪）；③节点标签按缩放/密度智能隐藏（当前左侧少数节点标签与文案区轻微重叠，与原站一致）；④导出卡片加二维码（分享链接）；⑤ Prisma 迁移收藏/设计为账户数据

---
Task ID: 5
Agent: Z.ai Code (cron webDevReview round 5)
Task: QA 回归 + Bug 修复（网格视图 notes 遮挡）+ 新功能（搭档手链 / 本周星图回顾）+ 样式细节（sheen / hero 辉光）

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844）：17 节点渲染、0 裂图、详情面板/URL 深链接/动态 title、筛选（Purple 2/17）、网格视图、收藏（心形/抽屉/徽章/localStorage）、Studio（Violet Dusk 24 珠）、中英双语全部通过；发现 1 个 bug
- 🐛 Bug 修复 — 网格视图下 "ATLAS NOTES/星图笔记" 浮动按钮遮挡右上角卡片（Brazil Amethyst 心形点击被拦截，Playwright 报 "covered by crystal-atlas-notes-toggle"）：
  1. crystal-atlas.tsx：notes toggle 改为 `viewMode === "orbit"` 条件渲染（网格视图不再出现）
  2. AtlasDock onViewMode 包装：切到 grid 时自动 setNotesOpen(false)，避免"面板开着但开关消失"的不一致
- ✨ 功能 1 — 搭档手链（Pair Bracelet）：详情面板 Pairing Ideas 每行末尾新增 "💎2" 金色虚线胶囊按钮（atlas-pair-build，Gem 图标 + "2"）
  - i18n 新增 pairBuildAria（EN "Open Bracelet Studio with this stone and X" / 中文 "带上这颗水晶和X，打开手链工作台"）
  - crystal-atlas.tsx 新增 openPairStudio(selfSlug, partnerSlug)：两颗石各 1 颗 8mm 珠预载 Studio，设计名 "Pair · A + B / 搭档 · A + B"；AtlasDetail 新增 onPairBuild prop
  - 验证：金虎眼详情 → 点击黄塔晶行的 💎2 → Studio 打开 2 珠 + 珠盘徽章各 1 + 名称 "Pair…"；中文 aria 正确
- ✨ 功能 2 — 本周星图（This Week in the Atlas）：Atlas Notes 抽屉新增 7 日回顾条
  - daily.ts 新增 weekStones(days=7)：按日哈希取过去 7 天（含今天）的每日水晶， oldest first；复用现有 dailyStone(date) 日期参数能力
  - atlas-notes.tsx 新增 onVisitStone prop + atlas-week 区块：7 个圆形缩略图（34px、palette 辉光 box-shadow）+ weekday 小字标签（Intl.DateTimeFormat，今天显示 "TODAY/今天" 金色高亮）；逐个入场动画（--w-delay 级联）
  - 点击任一天 → 关闭 Notes 并打开该水晶详情（URL ?stone= 同步）
  - 验证：EN（SAT→TODAY）与中文（周六→今天）两态渲染正确、点击 Uruguay Amethyst 跳转详情且 URL 同步
- 💎 样式细节（globals.css 追加约 190 行）：
  1. 网格卡片 sheen 扫光：atlas-card__media::before 42% 宽斜向高光条，hover 时 0.9s cubic-bezier 扫过（reduced-motion 停用）
  2. 详情主图辉光：atlas-detail-hero::before 底部 3px palette 渐变条（--focus-a/b/c 随选中石头换色）+ hero 外圈 --focus-b 辉光 box-shadow
  3. atlas-pair-build 按钮 hover：背景加深 + 虚线转实线 + 金色辉光 + translateY(-1px)
  4. atlas-week 全套（hint/grid/day/thumb/label/today 态/hover 缩放 + week-in 动画 + reduced-motion 降级）
- 测试数据清理：QA 后 localStorage favorites/lang 已复位

QA 验证结果（全部通过）：
- Bug 回归：网格视图 notes toggle 隐藏（offsetParent null）+ Brazil Amethyst 心形可正常加入/移除（localStorage "aquamarine,brazil-amethyst" → "aquamarine"）
- 搭档手链：EN/中文按钮、Studio 2 珠预载、徽章联动、设计名 "Pair…"
- 本周星图：7 天缩略图 + today 高亮 + 双语标签 + 点击跳详情 + URL 同步
- 详情主图辉光条随 palette 换色（金色石头 → 金色渐变）
- 移动端 390x844 回归正常；lint 0 错误；dev.log 无运行时错误（仅 Next.js allowedDevOrigins 提示，无碍）

Stage Summary:
- 修复 1 个遮挡 bug；新增 2 个功能（搭档手链、本周星图回顾）；3 处样式细节增强
- 上轮建议清单落地情况：①"用这 2 颗做手链" ✅（💎2 按钮）②今日水晶翻看过去 7 天 ✅（Atlas Notes 内）③节点标签智能隐藏 ❌（保留原站空间关系）④导出卡二维码 ❌ ⑤Prisma 迁移 ❌
- 已知小事项：① Studio 仅 2 颗珠时按真实比例两珠相邻渲染（内圈长度恒等 Σmm 的既有设计，视觉上珠子大且紧贴，属预期）；②周回顾与每日水晶共用同一哈希算法，同一天恒定
- 下一阶段建议：①导出 PNG 卡片加二维码（分享 #bd= 链接，可用轻量 QR 实现）；②节点标签密度智能隐藏；③收藏/设计接 Prisma 用户账户；④"本周星图"支持点击展开整周时间线视图（当前为紧凑条）；⑤引导流（guided）可结合 pairs 数据推荐"今日最佳搭档"

---
Task ID: 6
Agent: Z.ai Code (cron webDevReview round 6)
Task: QA 回归 + 新功能（导出卡二维码 / 今日最佳搭档 / 周时间线展开 / 全局 Toast）+ 样式细节（星野视差 / 焦点金环 / 卡片渐变描边）

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844）：17 节点/17 图、每日水晶节点星标、详情面板 + ?stone= 深链接 + 动态 title、搜索 "tiger"→3/17（14 节点变暗）、网格视图 + notes toggle 隐藏、Studio（5 预设/17 珠盘）、Escape 分层关闭、移动端同心圆轨道与堆叠 Dock 全部通过；0 控制台错误、0 裂图、页脚贴底 → 状态稳定无需修 bug，进入功能开发
- 新依赖：`qrcode`（+ @types/qrcode）用于浏览器端生成二维码 dataURL
- 功能 1 — 导出 PNG 卡片加二维码（bracelet-studio.tsx）：
  - exportBraceletPng 新增 shareUrl/qrCaption 参数；handleExport 用 designToHash(beads, name) 生成 #bd= 分享链接
  - QRCode.toDataURL 生成 232px 码图 → 画在卡片右下角（116px，米色圆角底板 + 投影保证可扫描）+ "SCAN TO OPEN/扫码打开" 小字
  - 卡片新增金色细分隔线（footer 上方 440px 渐隐线）；QR 失败静默跳过不阻断导出
  - 实测导出 1.0MB PNG：标题/统计/二维码/说明文字全部正确
- 功能 2 — 今日最佳搭档 Pair of the Day（atlas-notes.tsx + daily.ts）：
  - daily.ts 新增 pairOfDay(date)：今日水晶 + 由日期哈希从其 pairs 编辑搭配图中轮换选出的伙伴，同一天恒定
  - Atlas Notes 新增金色玻璃卡：双珠卡（palette 辉光圆图 + 衬线名 + 色系·关键词 meta）+ 中间虚线链圆环（脉冲动画 + 两侧虚线连线）+ 点击任一珠直达详情 + "Design this pair/设计这套搭档" CTA 直开双人 Studio
  - crystal-atlas 传入 onPairStudio（复用 openPairStudio）
- 功能 3 — 本周星图可展开时间线（atlas-notes.tsx）：
  - 周区块头部新增 "Expand/Collapse timeline" 胶囊切换（ChevronDown 旋转）
  - 展开后 7 行详细列表：右对齐日期列（星期+日期）+ 金色节点点 + 竖向金色渐隐引导线 + 44px 珠图 + 名称 + 色系·关键词 meta + 箭头，逐行级联入场（--tl-delay），TODAY 行金色高亮描边
  - 点击行直达该日水晶详情；紧凑条与展开态互斥渲染
- 功能 4 — 全局 Toast 反馈（use-toast + 已挂载的 radix Toaster）：
  - 收藏变化：crystal-atlas 用 prevFavsRef 基线 diff（首次加载不轰炸），增删都弹双语 toast
  - Studio：保存设计「X」/分享复制成功/导出成功三处 toast；详情面板复制水晶链接 toast
  - 自定义 `.atlas-toast` 暗色玻璃 + 金边样式（覆盖 shadcn 默认白底）；viewport z-index 提到 9999
- 样式细节：
  1. 星野/轨道平面鼠标视差：mousemove rAF 节流写 --par-x/--par-y，starfield ±18px、外轨道 ±26px、内轨道反向 ±14px（景深层次），reduced-motion 时 CSS 变量归零 + JS 不挂监听
  2. 全局金色 focus-visible 光环（1.5px 金色 outline + offset），键盘可达性增强
  3. 网格卡片 hover 金色渐变描边（mask-composite 描边法，opacity 过渡渐显）
  4. reduced-motion 补充：pairday 脉冲/timeline 入场/视差全部停用
- 🐛 本轮修复 bug — 移动端 Pair of the Day 卡片溢出：grid 子项默认 min-width:auto 使 nowrap meta 撑破容器（"Rose Quartz" 被截断推出）→ `.atlas-pairday__stone` 加 min-width:0，name/meta 补 ellipsis；640px 断点珠图缩至 54px、字号 0.94rem，复测完整显示
- i18n：新增 weekExpand/weekCollapse/pairDayKicker/pairDayCta/pairDayAria/pairDayVisit/qrCaption/toastFavAdd/toastFavRemove/toastCopy/toastExport/toastSave 双语 12 条

QA 验证结果（全部通过）：
- Pair of the Day：EN（Gray Moonstone ↔ Rose Quartz + Design this pair）与中文（灰月光 ↔ 粉水晶 + 设计这套搭档）双态渲染正确；CTA → Studio 2 珠预载 + 名称 "Pair · Gray Moonstone + Rose Quartz"；点击珠卡可跳详情
- 周时间线：展开 7 行（SAT Sep 19 → TODAY Sep 25）、TODAY 高亮、COLLAPSE 切换、点击行跳详情；移动端列宽适配正确
- 导出 PNG：真实下载且二维码 + SCAN TO OPEN 渲染正确
- Toast："Aquamarine added to favorites" / "已收藏 绿柱石" 双语弹出，暗玻璃金边样式生效；收藏徽章联动正常
- 视差：mousemove 后 --par-x=0.3333/--par-y=-0.2778 写入生效
- 焦点环：Tab 聚焦后 outline 金色生效；卡片描边 hover opacity 0→1
- 移动端 pairday 修复后完整显示；lint 0 错误 0 警告；dev.log 无运行时错误；测试 localStorage 已清理、QA 导出图已删

Stage Summary:
- 新增四大功能：分享卡片二维码化（扫码即开同款手链）、编辑级「今日最佳搭档」（首次把 pairs 数据产品化为每日内容）、周星图双态（紧凑条 ⇄ 详细时间线）、全站操作 Toast 反馈
- 样式三层增强：环境动效（星野视差）、可用性（键盘金环）、质感（卡片渐变描边）；至此往期建议清单 ①二维码 ④周时间线 ⑤今日最佳搭档 全部落地，②节点标签智能隐藏按既定决策保留原站空间关系
- 已知小事项：①radix toast 默认 5s 自动消失（合理，未改）；②沙箱剪贴板写入正常、读取受限（与往轮一致）；③qrcode 包体积仅影响 client bundle（~15KB gzip），可接受
- 下一阶段建议：①深浅色主题切换（背景任务清单最后一项，需全面变量化改造）；②收藏/设计接 Prisma 用户账户；③pairOfDay 扩展为「一周搭档回顾」或搭配灵感页；④Studio 导出卡片可加珠子清单小图；⑤?stone= 深链接支持 OG meta 动态化（需 SSR 层配合）

---
Task ID: 7
Agent: Z.ai Code (cron webDevReview round 7)
Task: QA 回归 + 🐛 修复桌面端隐藏黑圆 bug + 深浅色主题切换（Daylight Atlas / 晨光图鉴）+ 导出卡珠子清单 + 键盘快捷键浮层

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844）：17 节点/0 裂图/详情+深链接/Studio 5 预设/移动端同心圆全部正常，0 控制台错误 → 状态稳定，进入功能开发
- 🐛 Bug 修复（QA 截图 + elementFromPoint 逐层排查发现）— `.crystal-atlas-mobile-orbits` 只有 max-width:1023px 的 media 规则、缺少基础 `display:none`，导致桌面端三个 SVG circle 以默认黑色 fill 一直渲染（r=46 → 直径 650px 黑色大圆压在标题区）。dark 主题下与背景融为一体不易察觉（Round 1 起潜伏），light 主题开发中彻底暴露 → 基础规则补 `display:none`，dark/light 双主题下均已消除
- ✨ 功能 1 — 深浅色主题切换（背景任务清单最后一项）：
  - 状态：crystal-atlas 管理 theme（"dark"|"light"），localStorage key `atlas-theme` 持久化，effect 写 `document.documentElement.dataset.theme` 使 ticker/header/footer/universe 全站联动
  - Dock 新增 Sun/Moon 切换按钮（aria/title 随目标主题双语变化："Switch to the Daylight Atlas/切换至晨光图鉴"）
  - Light 主题设计「Daylight Atlas 晨光图鉴」：暖纸色渐变背景 + 墨棕文字 + 深金 accent + 白玻璃面板；CTA 反转为墨底米字；starfield 淡出、vignette 减淡、节点米色珠壳 + 柔影、星座连线转深金、dock/detail/notes/favorites/grid/studio/toast/滚动条/selection 全套覆盖（globals.css 追加约 500 行，`html[data-theme="light"]` 前缀层）
  - 主题过渡：主要壳层 background/color/border 0.45s ease 渐变切换
  - 配套改造：page.tsx footer 任意值色类 → 语义类（atlas-footer__inner/__brand/__nav）；BrandLockup → atlas-brand-name/__sub；header 中央品牌/子品牌/汉堡按钮/抽屉 → atlas-header-brand-word / atlas-header-center-mark / atlas-header-subbrand / atlas-burger(-line) / atlas-drawer 语义类，dark 默认 + light 覆盖双份定义
  - 修复 shadcn SheetClose 白色方块（data-[state=open]:bg-secondary）→ `.atlas-drawer > button[data-state]` 透明背景双主题覆盖
- ✨ 功能 2 — 导出 PNG 卡片新增珠子清单条：exportBraceletPng 增加 inventory 参数（按 slug 去重的珠图 + 数量 + palette 色描边），canvas 高度 1420→1490，底部居中一排 30px 圆形裁切珠图 + 金环 + 米色数量徽章；实测 Violet Dusk 24 珠导出清单徽章 8/6/6/4 与珠盘一致
- ✨ 功能 3 — 键盘快捷键：Dock 新增 Keyboard 图标按钮 → 白/暗玻璃浮层（点击外部/Escape 关闭），列出 ←/→ 旋转、↑/↓ 导航、Esc 关闭、/ 聚焦搜索；新增全局 "/" 快捷键聚焦搜索框（输入框内输入 / 不触发，searchRef 传递）
- i18n：themeLightName/themeDarkName/themeToLight/themeToDark/shortcutsHelp/shortcutsTitle/shortcutsRotate/shortcutsNav/shortcutsClose/shortcutsSearch 双语 10 条
- 排查插曲（记录给后续轮次）：light 抽屉 QA 时曾出现"截图黑但 computed/elementFromPoint 正常"的矛盾 → 用 inline 红色背景暴力验证确认为 **headless CDP 截图帧陈旧**（合成层未刷新），代码本身正确；遇到类似"改了没生效"先 rm -rf .next 重启，仍异常时用内联样式强制重绘再截图判断

QA 验证结果（全部通过）：
- 主题：dark→light→dark 双向往返 + reload 持久化（dataset.theme 与 localStorage 一致）；light 下首屏/详情/Notes（含 Pair of the Day 白玻璃卡）/Studio/汉堡抽屉/快捷键浮层/Toast 全套适配；"/" 聚焦搜索 focus-ok；Sun/Moon 图标随主题切换
- 黑圆 bug：dark/light 双主题桌面截图均无黑圆，移动端轨道圈正常
- 导出卡：24 珠 + 珠子清单条（4 类珠数量徽章正确）+ QR + 标题统计完整
- lint 0 错误 0 警告；dev.log 无运行时错误；浏览器 console 无错误；测试 localStorage 已复位（theme=dark、favorites 清空、lang=en）、QA 导出图已删

Stage Summary:
- 背景任务清单中"深浅色主题切换"正式落地，至此清单五项（搜索筛选/百科式档案/收藏夹/多语言/主题切换）全部完成
- 修复一枚从 Round 1 潜伏至今的桌面端隐藏黑圆 bug（light 主题开发的最大价值之一是让暗色下不可见的层积问题现形）
- 新增珠子清单导出与键盘快捷键体系（/ 聚焦 + 浮层说明），操作可达性进一步提升
- 已知小事项：①light 主题下 header 的 SheetHeader 分隔线用任意值类，未逐项覆盖（视觉可接受）；②headless 截图存在帧陈旧假象，真实浏览器不受影响；③主题切换动画为 0.45s 渐变，图片无交叉淡化（切换瞬间珠图不变，观感自然）
- 下一阶段建议：①收藏/设计接 Prisma 用户账户（lib/bracelet.ts 已收敛接口）；②pairOfDay 扩展为搭配灵感页/一周搭档回顾；③?stone= 深链接 OG meta 动态化；④Codex 百科浮层（汇总全部编辑内容 + 硬度/脉轮/诞生月索引）；⑤移动端 light 主题深度走查（本轮抽查 drawer/首屏，可再覆盖 Studio 全屏态）

---
Task ID: 8
Agent: Z.ai Code (cron webDevReview round 8)
Task: QA 回归 + 新功能（Crystal Codex 水晶百科浮层 / 动态 OG metadata / ?codex= 深链接 / Codex 收藏心形）+ 修复中文 intro 回退

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844）：17 节点/18 图 0 裂图、详情面板（Sunstone 14/17 + palette 辉光 + pairing 虚线）、Studio（Violet Dusk 24 珠）、网格 17 卡、dark/light 双主题、移动端同心圆轨道与堆叠 Dock 全部通过；0 控制台错误 → 状态稳定，无需修 bug，进入功能开发
- ✨ 功能 1 — Crystal Codex 水晶百科浮层（本轮主功能，落地往期建议④"Codex 百科浮层"）：
  - 新组件 `src/components/crystal/codex-overlay.tsx`：全屏 scholar 风格浮层（结构对齐 Bracelet Studio：桌面居中玻璃面板 / 移动端 100dvh 全屏）
  - 三个 tab：①Archive 档案 —— 17 张完整档案卡（palette 渐变顶条 + 辉光珠图 + 双语名称 + 编辑部 intro + 关键词 chips + 莫氏硬度可视化条 + 脉轮色点 + 诞生月 + 制作尺寸 + Companions 搭档可点 chips + "View in Atlas" CTA）；②Chakras 脉轮 —— 7 组沿脊柱 Root→Crown 分组（新数据 CHAKRA_ORDER/CHAKRA_META 原创配色 + 渐隐引导线 + 计数徽章 + mini 卡网格）；③Birthstones 诞生石 —— 12 个月格（5 个月有石可点击直达，7 个月虚线空态"No birthstone"）+ 底部"Undated stones"未对应月份水晶 chips 区
  - 百科内搜索：haystack 覆盖 EN/中文名称、色系、材质、脉轮、月份、关键词、properties、中文 intro；排序切换（A–Z locale 感知 zh-Hans / 硬度数值升序）；空结果态
  - i18n 新增 codex* 双语 25 词条；zh 排序用 localeCompare("zh-Hans") 验证生效
  - 修复：中文模式下档案卡 intro 误用 EN 字段 → introOf() 优先 STONE_ZH[slug].intro 回退
  - 收藏心形：CodexOverlay 接收 favorites/onToggleFavorite，卡片右上角心形 chip（激活粉色辉光，复用 atlas-favorites 体系，Toast 联动）
- ✨ 功能 2 — 动态 OG metadata（落地往期建议③"?stone= 深链接 OG 动态化"）：
  - page.tsx 新增 generateMetadata（Next 16 searchParams Promise 签名）：?stone=slug 时 SSR 输出该水晶的 title/description/og:title/og:image/twitter:card；无参数返回 {} 保留 layout 默认
  - layout.tsx 补 metadataBase（消除 Next 警告，OG 图绝对 URL 规范化，支持 NEXT_PUBLIC_SITE_URL 覆盖）
  - curl 实测：/?stone=sunstone → `<title>Sunstone · Crystal Library</title>` + og:image 珠图 + twitter:card summary；默认路由保持原标题
- ✨ 功能 3 — ?codex=1 深链接：crystal-atlas init microtask 消费参数 → 自动打开百科并 history.replaceState 清参（与 ?stone=/?favs=/#bd= 组成完整分享参数体系）
- Dock 新增 BookOpen 百科按钮（Gem 工作台按钮左侧，aria/title 双语）
- 样式（globals.css 追加约 480 行 + light 覆盖 150 行）：
  - Codex 全套：面板/头部金色氛围光、分段式 Mohs track（repeating-linear-gradient 刻度 + palette 色 fill + 辉光）、palette 驱动卡片顶条/chips 边框/hover 描边、chakra 色点渐隐线、月份虚线空态、companion chips、金色 CTA hover 填充、毛玻璃收藏心形
  - 双主题：light 下纸色渐变面板 + 墨字 + 深金 tab/CTA，卡片白玻璃
  - 响应式 1023px 断点：全屏化、intro 隐藏、搜索 order:5 全宽换行；reduced-motion 全套停用
- QA 验证（全部通过）：Codex 档案 17 卡/Mohs 17 条/Companions 51 chips；脉轮 7 组 17 mini；诞生石 12 格 + undated 区；搜索 "moon"→1 卡（Gray Moonstone）；硬度排序首三 Golden Shine Obsidian/Silver Shine Obsidian/Gray Moonstone（5→5.5→6.5）；CTA → 关百科开详情 + URL ?stone=gray-moonstone 同步；收藏心形 → localStorage 写入 + is-active 态；?codex=1 直开且 URL 清参；中文全量（"水晶百科"/"17 颗水晶 · 7 个脉轮 · 5 个月份"/zh 排序/intro 中文）；light 主题全套；移动端全屏布局；Escape 关闭
- 测试后 localStorage 已清理；lint 0 错误 0 警告；dev.log 无运行时错误（metadataBase 警告已修复）

Stage Summary:
- 新增三大能力：水晶百科 Codex（三视图档案/脉轮/诞生石 + 搜索排序 + 收藏联动）、?stone= 分享链接 OG 预览动态化、?codex= 百科深链接；至此往期建议清单③④全部落地
- Mohs 硬度可视化条为全新组件形态（刻度轨道 + 范围填充），详情面板后续可复用
- i18n 结构新增 CHAKRA_ORDER/CHAKRA_META/MONTH_ORDER 导出，供后续脉轮/月份相关功能复用
- 已知小事项：①Codex 与 Studio 同 z-index(80)，同时只能开一个（Escape 优先级 studio > codex，符合直觉）；②诞生石 tab 中 7 个月份为空态（数据事实：17 石仅 5 个月有诞生石）；③档案卡关键词 chips 仍为 EN 原文（zh keywords 在搜索 haystack 中，卡片上未双语化，视觉密度权衡）
- 下一阶段建议：①收藏/设计接 Prisma 用户账户（lib/bracelet.ts 接口已收敛）；②Codex 档案卡增加"脉轮轮盘"或配图可视化；③pairOfDay 扩展为搭配灵感页/一周搭档回顾；④导出卡片/OG 图可用 @vercel/og 或 canvas 生成动态社交卡片；⑤Codex 内可加"按硬度对比"视图（bar chart 全 17 石一屏对比）

---
Task ID: 9
Agent: Z.ai Code (cron webDevReview round 9)
Task: QA 回归 + 新功能（Codex Compare 对比视图 / Week of Pairs 一周搭档回顾 / Prisma 云端收藏库）+ 修复潜在 Toast hydration bug

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844）：17 节点/18 图 0 裂图、详情面板 + ?stone= URL 同步 + 动态 title、搜索 "tiger"→3/17、Codex 4 tab 前状态 17 卡、Studio、dark/light 主题切换往返、移动端同心圆轨道 + 堆叠 Dock + 无横向溢出、页脚贴底、控制台 0 错误 → 状态稳定，无需修 bug，进入功能开发
- 🐛 修复潜在 bug（代码审查发现）— 页面初始加载时若 localStorage 有已存收藏，会误弹 "X added to favorites" Toast（prevFavsRef 基线在 hydration 前被置为 []，随后 setFavorites(stored) 触发 diff）：
  1. 新增 hydratedRef 守卫：Toast diff effect 在 vault 水合完成前直接 return（不记录基线、不弹 Toast）
  2. prevFavsRef 基线改由水合流程写入最终合并结果（merged / 本地列表），首次 diff 必为空
- ✨ 功能 1 — Codex Compare 对比视图（落地 Round 8 建议⑤"按硬度对比 bar chart"）：
  - codex-overlay.tsx 新增第 4 个 tab "Compare/对比"：全部 17 石在同一把 0–10 莫氏硬度尺上一屏对比
  - 结构：共享刻度尺头（Ruler 图标 + 0–10 共 11 个 tick 与轨道刻度对齐）+ 17 个排名行（硬→软）：排名序号 + 珠图（palette 辉光环）+ 名称/色系 + 脉轮色点（title 提示）+ 刻度轨道（repeating-gradient 10 段与 ruler 呼应）+ palette 渐变条（left=min*10%、width=range*10%，cmp-bar-grow scaleX 入场级联）+ 数值标签（min() 防溢出）
  - 每行是按钮：点击关闭百科直达该石详情（URL ?stone= 同步）；Codex 内搜索/空态照常过滤 Compare 行（"moon"→1 行验证）
  - 整图 role="img" + 完整双语 aria-label（列出全部 17 石名称与硬度值）；底部 Hardest/Softest 图例
  - i18n 新增 codexTabCompare/codexCompareHint/codexCompareScale/codexCompareHardest/codexCompareSofter 双语
- ✨ 功能 2 — Week of Pairs 一周搭档回顾（落地 Round 8 建议③"pairOfDay 扩展为一周搭档回顾"）：
  - daily.ts 新增 weekPairs(days=7)：过去 7 天（含今天）的每日搭档，oldest first（复用 pairOfDay 的日期参数能力）
  - Atlas Notes 新增可折叠区块（与 "This week in the atlas" 同款展开/收起交互）：7 行 = 日期块（星期+日期，TODAY 金色高亮）+ 珠图 A + 竖排双行名（A / "+ B"，各自 ellipsis）+ 珠图 B + hover 显现的 Wand 图标
  - 点击行 → 打开手链工作台并预载两珠（复用 onPairStudio），设计名 "Pair · A + B"（实测 "Pair · Citrine Crystal + Sunstone"）
  - i18n 新增 pairsWeekTitle/pairsWeekHint/pairsWeekAria 双语
- ✨ 功能 3 — Prisma 云端收藏库（落地 Round 8 建议①"收藏接 Prisma"，首个后端持久化功能）：
  - schema 新增 Favorite 模型（slug unique + createdAt index），bun run db:push 同步
  - 新 API 路由 src/app/api/favorites/route.ts：GET（列 slug，createdAt asc）/ POST（单加，upsert 幂等）/ DELETE（单删，query 参数）/ PUT（全量替换事务，先删 notIn 再 upsert）；slug 均经 STONES 白名单校验
  - crystal-atlas.tsx 客户端同步：init 时 localStorage 先行（快速渲染）→ 异步 GET /api/favorites → 服务端序优先的并集合并（server createdAt 序 + 本地独有追加）→ 有差异则 setFavorites 并 PUT 回写；无网络/API 失败时静默降级为纯 localStorage（vaultState="local"）
  - toggleFavorite 每次变更 fire-and-forget POST/DELETE 镜像到服务端（失败静默置 "local"）；vaultReadyRef 防止水合完成前的操作竞态
  - FavoritesDrawer 头部新增同步状态徽章 atlas-vault 三态：Cloud "Vault synced/云端已同步"（金）、Loader2 旋转 "Syncing…/同步中"（脉冲）、CloudOff "Saved on this device/已保存在本机"（灰）
- 样式（globals.css 追加约 520 行）：codex-compare 全套（尺/行/条/图例/入场动画）、atlas-weekpairs 全套（行/日期/双行名/动画）、atlas-vault 徽章三态、1023px 断点响应式（ruler 单列、行距压缩、thumb 缩小）、light 主题全覆盖（墨棕/深金双份定义）、reduced-motion 全套停用
- 再遇 Turbopack CSS 陈旧缓存（第 3 轮确认的老问题）：Compare 首次验证时样式全丢，pkill next dev + rm -rf .next + 重启后恢复正常

QA 验证结果（全部通过）：
- Compare：17 行硬→软排序（Aquamarine 7.5–8 → Silver Shine Obsidian 5–5.5）、0–10 刻度尺对齐、行点击 → Codex 关 + Sunstone 详情 + URL 同步、"moon" 搜索 → 1 行、中文全量（海蓝宝/莫氏硬度尺/▲最硬/较软▼/aria 中文串）、light 主题截图验证、移动端断点
- Week of Pairs：7 行 SAT Sep 19 → TODAY Sep 25 高亮、双语（本周搭档回顾/海蓝宝+白冰块/今天）、点击 TUE 行 → Studio 2 珠 + "Pair · Citrine Crystal + Sunstone"、移动端 341px 宽无溢出
- 云端收藏库：心形收藏 → curl 实测 {"slugs":["aquamarine"]}；徽章 "Vault synced"；清空 localStorage + reload → 收藏从服务器恢复且徽章 1；取消收藏 → API 返回 []；vault 三态渲染正确
- Toast hydration bug：加载带收藏页面不再误弹 Toast（基线守卫生效）
- 测试后 localStorage 已清理（favs 清空/lang=en/theme=dark）、服务端 vault 已 PUT 清空；lint 0 错误 0 警告；dev.log 无运行时错误（仅 prisma query 日志）

Stage Summary:
- 新增三大功能：Codex Compare 硬度对比视图（17 石一屏共享刻度尺）、Week of Pairs 一周搭档回顾（Notes 内时间线 + 一键去工作台）、Prisma 云端收藏库（首个后端持久化：API 四端点 + localStorage 离线缓存 + 跨浏览器同步 + 三态同步徽章）
- 修复 1 个潜伏 bug（初始加载误弹收藏 Toast）；新增 i18n 词条 11 组（双语）
- 至此 Round 8 建议清单 ①③⑤ 全部落地；收藏数据仍为单租户共享库设计（无认证），手链设计仍存 localStorage（lib/bracelet.ts 接口已收敛，迁移成本低）
- 已知小事项：①水合窗口期（首次 GET 返回前约百毫秒）内的收藏移除可能被服务端并集"复活"，窗口极小可接受；②PUT 全量替换在多标签页并发时以后写者为准（单租户设计使然）；③Compare 数值标签 left 用 min() 钳制，当前数据 max=8 无溢出风险
- 下一阶段建议：①手链设计同步到 Prisma（Design 模型 + /api/designs，bracelet.ts 已收敛）；②用户账户体系（NextAuth）把收藏/设计升级为多租户；③Compare 视图增加第二维度切换（按诞生月/按脉轮分组着色）；④pairOfDay 与 weekPairs 数据已就绪，可做搭配灵感独立页/月历视图；⑤?stone= 深链接 OG 图可用 @vercel/og 动态生成

---
Task ID: 10
Agent: Z.ai Code (cron webDevReview round 10)
Task: QA 回归 + 新功能（手链设计云端同步 /api/designs / Compare 第二维度着色）

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844，dark/light 双主题）：17 节点/18 图 0 裂图、详情面板 + ?stone= URL 同步、搜索 "tiger"→3/17（slot 层 opacity 0.18 + grayscale 变暗正常）、网格视图、Codex Archive + Compare、Studio（Violet Dusk 24 珠 17.2cm）、浅色主题往返、移动端同心圆轨道全部通过；0 控制台错误 → 状态稳定，无需修 bug，进入功能开发
- 工具备忘：agent-browser 会话在命令间易重置（重开变 about:blank / 截图空白帧陈旧），可靠做法是把 open+wait+eval+screenshot 串联在单条 shell 命令里执行；视口用 `set viewport 390 844`（open 的 --viewport 不生效）；React onClick 对 dispatchEvent 合成事件正常响应，但 Tab/Compare 等按钮要用完整 pointerdown→mousedown→pointerup→mouseup→click 序列 + 命中坐标

- ✨ 功能 1 — 手链设计云端同步（落地 Round 9 建议①，第二个 Prisma 持久化功能）：
  - schema 新增 Design 模型（name / beadsJson / createdAt index），beadsJson 存紧凑 JSON `[["slug",mm],...]`，对 Bead 形状重构免疫；bun run db:push 同步
  - 新 API 路由 src/app/api/designs/route.ts：GET（列表 newest first，解析并校验 beads，坏行跳过）/ POST（创建 + name 截断 24 字符 + slug/mm 白名单校验 + 超过 24 条自动裁剪最旧）/ DELETE（?id=）；curl 实测校验（fake-stone + 非法 mm → 400 invalid beads）
  - bracelet.ts：BraceletDesign 新增可选 id 字段（服务端行 id，同步后回填）+ compactBeads/designSignature（内容签名 = name|slug:mm,slug:mm…，用于本地/服务端去重）
  - bracelet-studio.tsx 同步流程：挂载时 localStorage 先行渲染 → GET /api/designs → 合并（本地序优先 + 服务端独有按签名去重追加）→ 有差异则 setSaved + persist → 本地独有设计逐条 fire-and-forget POST；saveDesign 同步 POST 并从响应回填服务端 id；removeDesign 有 id 时同步 DELETE；vaultState 三态徽章（Cloud/Loader/CloudOff）复用 atlas-vault 样式置于 "Saved designs/已保存的设计" 标签行内（新增 --inline 修饰符样式）
  - 🐛 本轮发现并修复 bug：服务端 GET 返回 beads 为对象数组 {slug,mm,j}，客户端 sanitizeServerBeads 只接受 [slug,mm] 数组形式 → 云端恢复时全部设计被静默丢弃（badge 显示 synced 但列表 0 条）→ 改为两种形式都接受后复测通过
  - 端到端验证：保存 "Cloud Sync Test"（24 珠）→ curl 服务端出现该行；localStorage.clear() + reload → 设计从云端恢复且回写 localStorage；删除 → 服务端 API 返回 []；徽章 EN "Vault synced" / 中文 "云端已同步" 双语正确
- ✨ 功能 2 — Codex Compare 第二维度着色（落地 Round 9 建议③）：
  - 新增三态维度切换 "Color rows by/条带着色维度"：Color（原 palette 渐变条）/ Chakra（条带按 CHAKRA_META 脉轮色）/ Birthstone（条带按新增 MONTH_META 诞生月色轮，无诞生月的条带 is-muted 中性色）
  - 行副标签随维度切换（色系名/脉轮名/月份名或 "No birthstone"）；图例随维度切换：color 保持 Hardest/Softest，chakra 显示 7 个脉轮色点图例，birthstone 显示 5 个有石月份色点图例
  - i18n 新增 codexCompareHintChakra/codexCompareHintMonth/codexDimLabel/codexDimColor/codexDimChakra/codexDimMonth 双语 6 词条 + i18n.ts 导出 MONTH_META（12 个月原创色板）
  - 样式（globals.css 追加约 120 行）：维度选择器胶囊按钮（is-active 金色辉光）、muted 条、图例色点行 + light 主题全套覆盖 + reduced-motion 兼容
  - 验证：三维度切换条带颜色即时更新（Chakra 下 Aquamarine=Throat 青色、Beryl=Heart 绿色；Birthstone 下 10 条 muted + 5 月份图例）；中英双语；light 主题；移动端 390px 选择器换行 fits 无溢出
- 测试数据清理：服务端 favorites/designs 两库清空、localStorage（lang=en/theme=dark/favorites/bracelets）复位

QA 验证结果（全部通过）：
- 设计云同步：保存→服务端出现、清 localStorage→云端恢复、删除→服务端消失、徽章三态 + 双语、桌面/移动渲染正常
- Compare 维度：三态切换 + 条带/副标签/图例联动 + muted 态 + 双语 + light + 移动端适配
- 回归：桌面/移动主流程、筛选、网格、Studio 预设、深浅主题全部无恙；lint 0 错误 0 警告；dev.log 无运行时错误

Stage Summary:
- 新增两大功能：手链设计云端同步（Prisma Design + /api/designs 三端点 + 签名去重合并 + 三态同步徽章，收藏库之后第二个后端持久化功能，至此 Studio 保存的设计跨浏览器/设备可用）、Codex Compare 三维度着色（palette/脉轮/诞生月）
- 修复 1 个本轮引入即被 QA 拦截的 bug（服务端 beads 对象形式被客户端校验丢弃）
- 已知小事项：①Design 为单租户共享库（与 Favorite 同设计，无认证）；②saveDesign 回填 id 用 setState updater 内的 localStorage 写（幂等无害）；③移动端 light 主题 Studio 全屏态只抽查了首屏与徽章（未逐屏走查）
- 下一阶段建议：①用户账户体系（NextAuth）把收藏/设计升级为多租户；②Compare 增加按材质 crystal/stone 分组排序视图；③搭配灵感月历视图（pairOfDay/weekPairs 数据已就绪）；④服务端设计支持导出 JSON/备份接口；⑤?stone= OG 图用 @vercel/og 动态生成

---
Task ID: 11
Agent: Z.ai Code (cron webDevReview round 11)
Task: QA 回归 + 新功能（搭配月历 Almanac / 设计 JSON 备份导出导入 / 收藏搭配建议）+ 修复收藏建议漏配 bug

Work Log:
- QA 回归（agent-browser，桌面 1440x900 + 移动 390x844，dark/light 双主题）：17 节点/0 裂图、详情面板 + ?stone= URL 同步 + 动态 title、搜索 "tiger"→3/17（14 变暗）、网格 17 卡、Codex 4 tab（Archive 截图/Compare 17 行）、Studio（Violet Dusk 24 珠）、主题 dark→light→dark 往返、移动端同心圆轨道 + 无横向溢出全部通过；0 控制台错误 → 状态稳定无需修 bug，进入功能开发
- ✨ 功能 1 — 搭配月历 Almanac（落地 Round 10 建议③"搭配灵感月历"，Codex 第 5 个 tab）：
  - codex-overlay.tsx 新增 "Almanac/月历" tab：pairOfDay 按当月日历逐日铺开，每天卡片 = 日期 + 双珠（各自 palette 色环 + 中间菱形链点）+ 点击整格 → onPairStudio 双珠预载工作台（设计名 "Pair · A + B"）
  - 月导航：‹ › 翻月（monthOffset 状态），翻离当月出现 "回到今天" Undo2 圆钮，月份名双语（MONTH_ORDER/MONTH_ZH）；today 金环 + 内辉光 + 底部金色 TODAY/今天 徽章；周末列（表头+日期格）米金色调；非当月斜纹空位占格
  - Codex 内搜索联动：不匹配日期 is-dimmed（opacity 0.28 + 灰度）而非移除，保留日历形状（"moon"→3 天保留 27 天变暗验证）；aria 全双语（"九月 1：设计 粉水晶 和 绿柱石 的搭档"）
- ✨ 功能 2 — 手链设计 JSON 备份（落地 Round 10 建议④"服务端设计导出/备份"）：
  - bracelet.ts 新增 serializeDesignsBackup（app/kind/version/exportedAt + 紧凑 [slug,mm] 珠数据）/ parseDesignsBackup（slug+mm 白名单校验、空珠条目丢弃、96 条/64 珠上限、损坏 JSON 返回 []）
  - bracelet-studio.tsx "Saved designs" 标题行新增 Backup/Import 胶囊按钮（Download/Upload 图标，saved 为空时导出禁用）+ 隐藏 file input
  - 导出：Blob 下载 `moonarq-bracelet-designs-YYYYMMDD.json` + "Backup downloaded/备份已下载" toast；导入：签名去重合并（容量按 24-现有 余量裁剪）+ 逐条 fire-and-forget POST 云端 + "N designs imported, M skipped/已导入 N 条设计，跳过 M 条" toast；无效文件 "That file doesn't look like a design backup/这个文件看起来不是设计备份" toast
- ✨ 功能 3 — 收藏夹搭配建议 "They pair well/它们很搭"：
  - favorites-drawer.tsx 新增 onPairStudio prop（可选）+ atlas-favsug 区块：计算收藏集合内的编辑搭配对（pairs 图 ∩ 收藏集，无序 key 去重，最多 4 条），每条 chip = 双珠图（palette 辉光）+ 双名 + Link2 图标，点击 → Studio 双珠预载并关闭抽屉？保留抽屉在 Studio 关闭后回到收藏夹（层级合理）
- 🐛 本轮发现并修复 bug — 收藏建议漏配：初版用 `s.slug < p` 字典序去重，但数据中 pairs 图并非严格双向对称（如 blue-tigers-eye 列出 aquamarine 而反向没有），导致这类边被跳过（收藏 海蓝宝+蓝虎眼 时建议区为空）→ 改为 [s.slug, p].sort() 无序 key 去重后正确显示
- 样式（globals.css 追加约 570 行）：Almanac 全套（导航/表头/网格/日期卡/珠对/链点/ Today 徽章/斜纹空位/alm-in 级联入场/hover palette 渐变辉光）、br-backup 胶囊、atlas-favsug 区块；1023px 断点（日格 56px/珠 22px/月名缩小）；light 主题全套覆盖（纸色/白玻璃/深金）；reduced-motion 全套停用
- i18n 新增双语 19 词条：codexTabAlmanac/codexAlmanacHint/almanacPrev/almanacNext/almanacToday/almanacBackToToday/almanacWeekdays(数组)/almanacDayAria/almanacLegend + bkExport/bkExportAria/bkImport/bkImportAria/bkImported/bkInvalid/bkExported + favSugTitle/favSugHint/favSugAria
- 再遇 Turbopack CSS 陈旧缓存（第 4 轮确认）：Almanac 首次验证样式全丢，pkill next dev + rm -rf .next + 重启后恢复；本轮顺带把 dev server 手动重启流程验证为 nohup bun run dev 后台恢复

QA 验证结果（全部通过）：
- 月历：September 2026 / 30 格 + 2 空位 / TODAY 25 金环徽章 / 30 组搭档；点击 25 日 → Studio 2 珠 + "Pair · Gray Moonstone + Rose Quartz"（与 Pair of the Day 同算法恒定）；翻月 → October 2026 + 回今天按钮出现 + Today 徽章消失；回到今天 → September；搜索 "moon" → 3 天保留 27 天变暗；中文（九月/今天/日一二三四五六/aria 中文）；light 主题（纸色/白玻璃/深金徽章）；移动端 390px 无溢出
- 备份：保存 "Backup Test Alpha" → 导出真实下载 1.7KB JSON（结构 app/kind/version/exportedAt/designs 正确）；UI 删除 → 服务端 []；上传该文件 → 列表恢复 + toast "1 design imported" + curl 服务端出现该行（云端同步闭环）；重复导入 → "0 imported, 1 skipped" 去重；坏文件 → bkInvalid toast；QA 文件已删
- 收藏建议：收藏 海蓝宝+蓝虎眼 → "They pair well" 区块出现 1 条 chip（修复后）→ 点击 → Studio 2 珠 + "Pair · Blue Tiger's Eye + Aquamarine"；中文（它们很搭/收藏中的编辑推荐搭档/带上蓝虎眼和海蓝宝去设计手链）
- 清理后回归：17 节点/0 裂图/无溢出；lint 0 错误 0 警告；dev.log 无运行时错误；localStorage（favs/bracelets 清空、lang=en、theme=dark）与服务端 favorites/designs 两库均已清空

Stage Summary:
- 新增三大功能：搭配月历 Almanac（编辑搭档数据产品化为整月日历，与 Pair of the Day/Week of Pairs 同一哈希算法恒定可复现）、手链设计 JSON 备份导出导入（本地+云端闭环，数据可携带）、收藏夹搭配建议（pairs 图谱在个人收藏中的交集推荐）
- 修复 1 个数据对称性假设导致的漏配 bug（无序 key 去重替代字典序）
- 至此 Round 10 建议清单 ③④ 落地；Codex 现为 5 tab（档案/脉轮/诞生石/对比/月历）
- 已知小事项：①月历为"日历恒定搭档"，与 Pair of the Day 共享算法，未来若改哈希需同步；②备份导入在容量满时静默裁剪并在 toast 的 skipped 数中体现；③建议 chip 最多展示 4 条（收藏多于 4 对时无翻页，视觉密度权衡）
- 下一阶段建议：①用户账户体系（NextAuth）升级多租户（历轮遗留）；②Compare 增加"按材质 Crystal/Stone"第 4 维度或分组视图；③月历支持"按日水晶"切换（weekStones 数据就绪，可做双模式月历）；④备份格式 v2 可包含收藏夹一并导出；⑤?stone= OG 图用 @vercel/og 动态生成

---
Task ID: 12
Agent: Z.ai Code (main)
Task: 参考外部仓库 wallypoly/crystal-planet（GitHub）借鉴功能与算法，优化本项目（借鉴不照搬）

Work Log:
- 克隆并通读参考仓库 /tmp/crystal-planet-ref（Vite + TanStack Router 的水晶图库 app，最新提交 "Add mixed-stone bracelets and color-family filtering"），逐文件对比本项目：
  - 已有等价或更强实现（不采纳）：色系筛选 dimming（我们有搜索+色系双通道）、拖拽后抑制误点（atlas-map dragEndRef 已有）、Pairing Ideas 直达工作台（已有 onPairBuild）、保存设计（我们有 Prisma 云同步+备份导出，超集）、Cart 页（收藏抽屉+Studio 已覆盖）
  - 选定 3 个借鉴点：①移动端节点碰撞消解算法（参考 atlas.tsx layoutNodes 的 8 轮 pairwise push-apart）；②贴合度分级 wristSpan（参考的 snug/classic/relaxed 概念）；③混合石材手链 accent 图案（参考 build.tsx 的 accent bead 每第 N 颗）
- ✨ 借鉴 1 — 移动端节点碰撞消解（atlas-map.tsx）：
  - 新增 resolveMobileCollisions()：像素空间 pairwise relaxation，8 轮上限 + 早退；重叠对按 (a.mobileSize+b.mobileSize)*0.46+8 的最小间距互相推开 +1.2px 余量，clamp 在地图边界内（半宽+4px）
  - 接入 computeSlots()：桌面 x/y 不受影响，只作用于 mobileX/mobileY
  - 实测（390x844，6 个旋转角度采样）：17 节点 0 对重叠，最小中心距 60-62px ≥ 算法保证值 ~57px
- ✨ 借鉴 2 — 手链贴合度分级（bracelet.ts + bracelet-studio.tsx）：
  - 新增 WristFit 类型 + wristFit(lengthCm, wristCm)：相对手腕周长的比例判定（<0.97 snug / 0.97–1.06 classic / >1.06 relaxed），比参考的绝对阈值更适配我们可选手腕周长的设计
  - 状态栏新增 br-fit 徽章（三态配色：贴手=琥珀/经典合围=鼠尾草绿/宽松=陶土橙，light 主题各有深色版）+ br-stat__advice 建议行（虚线分隔，双语指引"加珠/减珠"）
  - 🐛 修复边角 case：空手链时 lengthCm=0 → ratio 0 → 误显示"贴手"；改为 beads.length > 0 才渲染徽章与建议
  - .br-stat--wide 网格改为显式 4 列定位（auto auto 1fr auto），消除原 auto-placement 与 target grid-row:1 的歧义
- ✨ 借鉴 3 — Studio 点缀图案（mixed-stone strand builder）：
  - 新增 accentSlug/accentInterval 状态 + applyAccentPattern()：保留珠径 mm，把 i % n === 0 的珠替换为 accent 石（j 重掷），Toast 双语反馈
  - 新区块（灵感预设下方）：石材下拉（17 石双语名称，stoneLabel）+ ×2/×3/×4/×5 间隔胶囊（默认 ×4，对齐参考实现）+ Repeat 图标应用按钮（无石材或空手链时禁用）
  - 实测：20 珠 ×4 → 位置 0/4/8/12/16 全部变 Sunstone；切 ×5 再应用 → 0/5/10/15 变化、其余保留（只替换命中位，符合预期）
- i18n 新增双语 16 词条：fitSnug/fitClassic/fitRelaxed/fitSnugAdvice/fitClassicAdvice/fitRelaxedAdvice/fitAria + accentTitle/accentHint/accentStone/accentNone/accentInterval/accentApply/accentApplied/accentAria
- 样式（globals.css 约 150 行）：br-fit 三态 + br-stat__advice + br-accent 全套（自绘箭头 select/胶囊 step/is-active 金色）+ light 主题 13 条覆盖 + 修正 bar margin
- QA（agent-browser）：桌面 1440x900（地图/详情面板 ?stone= URL 同步/中文标签）、移动 390x844（碰撞消解多角度验证/工作台全览）、dark + light 双主题（新组件两套配色截图验证）、中文全量（点缀图案/贴合度/建议行）；无控制台错误；lint 0 错误；dev.log 无运行时错误
- 测试后已复位：localStorage（lang=en、theme=dark、favors 清空）、页面已重载验证

Stage Summary:
- 从参考仓库借鉴 3 项并完成原创实现：移动端轨道节点永不重叠（碰撞消解）、手链贴合度三态分级 + 建议文案、点缀图案一键铺排（混合石材手链）
- 借鉴原则执行情况：全部为概念/算法借鉴 + 原创代码与文案（双语），未复制参考仓库任何代码或文案；未照搬其 Cart 页/登录/绝对阈值等不适配项
- 观察到但不采纳的参考功能：P2P WebRTC 多人协作（过重，且本项目实时通信规范为 socket.io mini-service，列为远期候选）；stoneNamedIn 文本解析（我们已有结构化 pairs 数据）
- 下一阶段建议：①用户账户体系（NextAuth）升级多租户（历轮遗留首选）；②点缀图案可扩展"双色交替/渐变过渡"模式；③贴合度可结合周长给出建议珠数快捷按钮（如 "+2 珠达标"）；④移动端碰撞消解可在桌面小窗口(<1024px)同源生效；⑤?stone= OG 图用 @vercel/og 动态生成

---
Task ID: 13
Agent: Z.ai Code (main)
Task: 用户反馈"看到一个 issue"→ 全面排查 → 修复移动端轨道节点被屏幕边缘裁切的几何缺陷

Work Log:
- 排查过程：dev.log（仅历史 EADDRINUSE，无运行时错误）、浏览器控制台（0 错误）、桌面地图/Studio/移动端截图逐一走查；确认"今日水晶变化"（White Crystal Cube→Clear Quartz）为日期翻日（9/25→9/26）的确定性算法行为，非 bug
- 🐛 定位真实问题 — 移动端地图边缘节点裁切（agent-browser DOM 精确测量发现）：
  - Kunzite 左侧越界 11px（center x=15.7，width 53.6 → left=-11），Blue Tiger's Eye 右侧仅剩 1px
  - 根因是基座轨道几何而非碰撞算法：外环半径 46%×S(390px)=179.4px + 节点半径 26.8px = 206px > 半宽 195px，极左/极右节点的基础位置天然越界；而 Round 12 引入的 resolveMobileCollisions 只在"发生碰撞被推开"时 clamp，未参与碰撞的节点保留越界基座位
- ✨ 修复（atlas-map.tsx resolveMobileCollisions 末尾新增无条件边界回收 pass）：
  - 全部 17 节点强制 clamp 进 [half, W-half]（half=size/2+4）；y 轴 [half+8, H-half-4]（顶部多留 8px 给 ±7px 漂移动画抬升）
  - 结构性保证：每次 computeSlots 都执行，任何旋转角度下不变量恒成立
- 验证（agent-browser）：初始态 minLeft -11→+4 / minRight 1→4；双向拖拽旋转（+300px / -360px）后 clipped=[] 恒成立、minTop≥12；碰撞消解不受影响（min 59px，0 重叠）；桌面 17 slots 渲染正常（desktop x/y 未触碰）；lint 0 错误
- 截图确认：移动端 390x844 全部 17 节点完整在屏内，分布均匀

Stage Summary:
- 修复 1 个从初版就存在的移动端视觉缺陷（外环极点节点被屏幕边缘裁切），并补全了 Round 12 碰撞消解的边界保证盲区（未碰撞节点不 clamp）
- 排查方法论沉淀：agent-browser getBoundingClientRect + style var 双向比对可区分"样式变量错误"与"渲染偏移"，本轮借此确认变量本身就是越界值、直接定位到几何根因
- 下一阶段建议（沿用 Round 12 + 新增）：①NextAuth 多租户；②点缀图案双色交替模式；③桌面窄窗(<1024px)可复用同一套边界回收（当前桌面轨道数学上不越界，暂无需要）；④?stone= OG 图动态生成

---
Task ID: 14
Agent: Z.ai Code (main)
Task: 用户反馈"还是看到 1 Issue"→ 定位 Next.js DevTools 的 Issue 徽章来源并根除

Work Log:
- 定位：agent-browser 打开页面读取 nextjs-portal shadow DOM —— 本地直连会话 DevTools 面板无 Issues 条目（Route/Bundler/Preferences 正常）；交叉比对 dev.log 发现关键线索：`⚠ Cross origin request detected from preview-chat-0ff31cac-...space-z.ai to /_next/* resource`
- 根因确认：用户预览面板经 `preview-chat-*.space-z.ai` 域名访问，Next.js 16 对未在 allowedDevOrigins 白名单内的源请求 /_next/* 资源会检测告警，并计入 DevTools 指示器的 Issue 计数（=1）；本地 localhost 访问不触发，故 agent-browser 直连看不到
- 修复：next.config.ts 新增 `allowedDevOrigins: ["*.space-z.ai", "space-z.ai"]`（通配覆盖所有预览会话子域名）
- 重启深坑：config 变更必须重启。发现本沙箱进程回收机制——`nohup ... &` 与 `setsid nohup ... & disown` 启动的进程都会随 Bash 工具会话结束被回收（cgroup 级清理）；**可行方案是 `(bun run dev > dev.log 2>&1 &)` 子 shell 后台化**，已跨多条命令验证存活
- 验证：
  1. bun fetch 携带预览 Origin 头请求 / 与 /_next/* → dev.log 无任何 Cross origin 警告（修复前同样请求必现）
  2. agent-browser：0 控制台错误、DevTools shadow DOM 无 "N Issue" 徽章、标题正确、17 节点渲染
  3. 交互回归：点击节点 → Aquamarine, Blue 详情面板正常打开（01/17, BD-AQ-10-R3），Escape 复位
  4. lint 0 错误；测试数据清理（/tmp/co-test.ts 删除）
- 注意：EADDRINUSE 旧日志为重启竞态残留，当前监听唯一（pid 3253）

Stage Summary:
- 根除用户预览面板 "1 Issue" 徽章：allowedDevOrigins 白名单化沙箱预览域名，Next.js 16 跨域检测不再告警
- 沉淀环境知识：dev server 唯一可靠启动方式为子 shell 后台化 `(bun run dev > dev.log 2>&1 &)`；重启必须 pkill + rm -rf .next
- 沉淀调试方法：DevTools Issue 排查需读取 <nextjs-portal> shadow DOM（agent-browser eval 递归遍历），浏览器 console 干净 ≠ 无 Issue
- 用户侧生效方式：刷新预览面板即可（徽章应消失）；若仍显示为 Turbopack 陈旧缓存，强制刷新（Ctrl+Shift+R）
- 下一阶段建议（沿用 Task 13）：①NextAuth 多租户；②点缀图案双色交替；③?stone= OG 动态图；④桌面窄窗边界回收
