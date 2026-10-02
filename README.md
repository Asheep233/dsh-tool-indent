# dsh-tool-indent

[![ci](https://github.com/Asheep233/dsh-tool-indent/actions/workflows/ci.yml/badge.svg)](https://github.com/Asheep233/dsh-tool-indent/actions/workflows/ci.yml)
[![license: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)

给 DSH Web GUI 里**所有 Tool 调用**加统一左缩进的浏览器专属 UI 插件，
并附带一页设置，可调 Tool / 「思考」摘要行的**缩进、灰度、行间距**。

```
助手正文 ……
  ▸ bash   cargo test            ← 缩进 + 摘要灰度 + 行间距，都可调
  ◇ 思考   dev_build_plugin requires DSH_CHECKOUT…
  ▸ read   src/main.rs
助手正文 ……
```

设置位置：**设置 → 工具调用外观**（四个滑块，拖动即时生效，自动保存在本浏览器）。

```bash
dsh plugin --profile web add github:Asheep233/dsh-tool-indent
```

| 滑块 | CSS 变量 | 默认 |
| --- | --- | --- |
| 缩进 | `--dsh-tool-indent` | `calc(22px + 字号增量)` |
| 工具摘要灰度 | `--dsh-tool-dim` | `1`（100%） |
| 思考摘要灰度 | `--dsh-think-dim` | `1`（100%） |
| 行间距 | `--dsh-row-leading` | `0px` |

## 原理

| 环节 | 做法 |
| --- | --- |
| Tool 调用锚点 | `[data-chat-call-id]` —— ui-tool 的 `ToolCall` 给每一次调用的行容器打的两个稳定属性之一（含 PTC 嵌套子调用） |
| 摘要行锚点 | `[data-disclosure-row]` —— ui-primitives 的 `DisclosureRow` 给折叠行**行头**打的属性；展开后的正文是它的兄弟节点，所以「灰度」只影响摘要行、不影响展开内容 |
| 思考行锚点 | `[data-variant="think"]` —— `ReasoningRow` 的根。Tool 行的 variant 只取 `bash/read/write/edit/search/code/others`，不会撞上 `think` |
| 为什么不用类名 | 上面都是组件写死的 `data-*` 契约；CSS Modules 的哈希类名（`ztWv_q_callRow`、`o3BgMG_row`）随版本变化，不能挂 |
| 注入方式 | client 半边在模块体里插 `style[data-plugin][data-plugin-css]`，与官方 packages 完全同构；插件禁用/卸载时由 client-modules 的 `removeOwnedStyles()` 按 `data-plugin` 自动回收 |
| 生效位置 | 会话正文（含子代理面板等一切走 `conversation.chat.node` 的地方）。**不含**右侧「轨迹」表格视图——那是 `<tr>` 时间线，缩进无意义 |
| 宿主半边 | 空 `apply()`（本插件零 host 行为），只为 Loader 提供入口模块 |

实际生效的 CSS 只有四条：

```css
:root { --dsh-tool-indent: calc(22px + var(--dsh-content-font-delta, 0px));
        --dsh-tool-dim: 1; --dsh-think-dim: 1; --dsh-row-leading: 0px; }

[data-chat-call-id] { margin-left: var(--dsh-tool-indent); }
[data-chat-call-id] [data-disclosure-row] { opacity: var(--dsh-tool-dim);
  height: calc(24px + var(--dsh-content-font-delta, 0px) + var(--dsh-row-leading)); }
[data-variant="think"] [data-disclosure-row] { opacity: var(--dsh-think-dim);
  height: calc(24px + var(--dsh-content-font-delta, 0px) + var(--dsh-row-leading)); }
[data-variant="think"][data-variant="think"]:not([data-expanded]) { height: calc(24px + var(--dsh-content-font-delta, 0px) + var(--dsh-row-leading)); }
```

（最后一条是必须的：思考行折叠时根节点是固定高 + `contain: size`，内容不参与撑高。）

## 设置页怎么工作

- 组件作为 `ctx.slots.register(options, Component)` 的**第二个参数**传入，
  options 里放 `name: 'settings.section'` / `id` / `order` / `label`。
  ⚠️ 官方 `register(options, component)` 只读第二个参数：写 `options.component` 会被丢弃。
- 组件是普通 React 组件，`react` 与 `react/jsx-runtime` 由 shell 的冻结静态表
  （PLATFORM_MODULES）提供——**必须保持 external**，一旦被打进 bundle 就会出现
  第二份 React，hooks 立刻报错。
- 持久化走 `localStorage`（键 `dsh.tool-indent.v1`，沿用官方 `dsh.*` 前缀约定），不写 Host 配置文档：
  这是「本浏览器的观感偏好」，不涉及模型/会话行为，所以不需要 revision-fenced 的配置写入。
- 变量写在 `document.documentElement.style` 上（行内优先级高于样式表），
  模块一落地就按已存值应用，页面加载不会先闪默认值。

## 目录

```
src/index.ts          host 半边（空 apply）
src/client/index.tsx  client 半边（样式注入 + 设置页 React 组件）
cordis.patch.yml      bundle 补丁层：向组合插入 id=dsh-tool-indent 的 entry
tsdown.config.ts      浏览器 bundle（__ModuleLoader__ 外壳 + React 保持 external）
scripts/build.sh      自包含构建（不依赖 dsh 源码 checkout）
lib/                  **构建产物，已入库**（DSH 运行时直接吃 lib/client.js；
                      同生态惯例，见 dsh-external/dsh-vision-toolkit）
```

## 构建

```bash
bash scripts/build.sh        # = tsc(host) + tsc(client 类型) + tsdown(client bundle)
```

首次会 `npm install` 本目录的 devDependencies（typescript / tsdown / @types/react），
对 `@deepseek-ai/*` **零运行时依赖**，所以不需要 dsh 源码 checkout。

`lib/` 是入库的：这样 `github:Asheep233/dsh-tool-indent` 装下来即可直接用，
不需要在安装方跑构建。改完 `src/` 记得重新构建并提交 `lib/`。

## 安装 / 卸载

从 GitHub 装进某个 profile（和生态里其它插件一样）：

```bash
dsh plugin --profile web add github:Asheep233/dsh-tool-indent#v0.1.0
```

本地开发时用 junction 直连（当前 `web` profile 就是这么装的）：

```bash
# 重新装配（改完代码后重建 + 重载当前进程内的插件）
bash scripts/build.sh
# 注入器环境内：dev_reload_package dsh-tool-indent

# 卸载：从 profile 的 bundles 与 dependencies 里删掉 dsh-tool-indent，再删 junction
#   ~/.dsh/profiles/web/node_modules/dsh-tool-indent
```

## 不用设置页也能调

覆盖同一个 CSS 变量即可（浏览器控制台、自定义样式皆可）：

```css
:root {
  --dsh-tool-indent: 32px;
  --dsh-tool-dim: 0.6;
  --dsh-think-dim: 0.75;
  --dsh-row-leading: 4px;
}
```

> 注：嵌套子调用（PTC）本身位于 `subCalls`（已有 22px margin + 8px padding 导轨），
> 因此会呈现逐级缩进，深度越大越靠右。想要「只有顶层调用缩进」，把
> `src/client/index.tsx` 里的选择器换成
> `[data-slot="conversation.chat.node"] > [data-chat-call-id]` 再重新构建。

## 兼容性

- 依赖的契约：`data-chat-call-id` / `data-disclosure-row` / `data-variant="think"`、
  `dsh.client.platform=web`、`window.__ModuleLoader__.load({id, factory})`、
  `style[data-plugin]` 回收、`register(options, Component)`。
  升级后若某个锚点改名，只需改上面那几条选择器。
- 若发现「设置里没有这一页」：确认插件在 设置 → 插件 里启用，并硬刷新页面
  （bundle 变更后老页面需重载）。
