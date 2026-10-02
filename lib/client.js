window.__ModuleLoader__.load({
	id: "dsh-tool-indent",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		//#region \0rolldown/runtime.js
		var __create = Object.create;
		var __defProp = Object.defineProperty;
		var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
		var __getOwnPropNames = Object.getOwnPropertyNames;
		var __getProtoOf = Object.getPrototypeOf;
		var __hasOwnProp = Object.prototype.hasOwnProperty;
		var __copyProps = (to, from, except, desc) => {
			if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
				key = keys[i];
				if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
					get: ((k) => from[k]).bind(null, key),
					enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
				});
			}
			return to;
		};
		var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule || !__hasOwnProp.call(mod, "default") ? __defProp(target, "default", {
			value: mod,
			enumerable: true
		}) : target, mod));
		//#endregion
		let react = require("react");
		react = __toESM(react, 1);
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/index.tsx
		/**
		* dsh-tool-indent — client 半边（浏览器 bundle，由 tsdown 打包成 `lib/client.js`）。
		*
		* 两件事：
		*  1. 注入一条样式规则，调整 UI 里 Tool 调用 / 「思考」折叠行的外观
		*     （缩进、摘要灰度、行间距），并把可调项暴露成 root 上的 CSS 变量；
		*  2. 在 设置 → 工具调用外观 里注册一页滑块，实时改这些变量并持久化到本地。
		*
		* 选择器锚点（都是组件写死的 data-* 契约，不是 CSS Modules 哈希类名，
		* 所以升级 DSH 后不会因为类名变化而失效）：
		*  - `[data-chat-call-id]`    每一次 Tool 调用的行容器（含 PTC 嵌套子调用），
		*                             由 @deepseek-ai/dsh-client-ui-tool 的 ToolCall 设置；
		*  - `[data-disclosure-row]`  折叠行行头（标题 + 摘要 + 图标），由 ui-primitives
		*                             的 DisclosureRow 设置；展开后的正文是它的兄弟节点，
		*                             所以调「灰度」只影响摘要行、不影响展开内容；
		*  - `[data-sample]`          **自带行头**的工具视图（ui-tool 的 bash 采样行
		*                             BashRow 就是它）。这类行没有 data-disclosure-row，
		*                             必须单独列进选择器，否则「运行命令」那一行不生效；
		*  - `[data-variant="think"]` 「思考」行的根（ReasoningRow 设置），
		*                             Tool 行的 variant 只取 bash/read/write/edit/search/
		*                             code/others，不会撞上 think。
		*
		* 样式注入遵循官方约定：模块体插 `style[data-plugin][data-plugin-css]`，
		* 插件禁用/卸载时由 client-modules 的 `removeOwnedStyles()` 自动回收。
		*/
		const PLUGIN_ID = "dsh-tool-indent";
		/** 与官方 packages 一致的 style tag 身份（同一 tag 只插一次）。 */
		const TAG_ID = `${PLUGIN_ID}/tool-indent.css`;
		/** 本地持久化的键（浏览器侧偏好，不写 Host 配置；沿用官方 `dsh.*` 前缀约定）。 */
		const STORAGE_KEY = "dsh.tool-indent.v1";
		const DEFAULTS = {
			indent: 22,
			toolDim: 1,
			thinkDim: 1,
			leading: 0
		};
		const css = `/* dsh-tool-indent — Tool 调用 / 思考行的外观 */
:root {
  /* 缩进量：默认与「思考内容」的缩进同节奏（ReasoningRow 用 22px + 字号增量）。
     设置页会用行内变量覆盖这三个值。 */
  --dsh-tool-indent: calc(22px + var(--dsh-content-font-delta, 0px));
  /* 摘要行浓度：1 = 原样，越小越淡 */
  --dsh-tool-dim: 1;
  --dsh-think-dim: 1;
  /* 行间距增量 */
  --dsh-row-leading: 0px;
}

/* 1) 缩进：每一次 Tool 调用的行容器；PTC 嵌套子调用沿用自带导轨后再叠加，
   因此呈现逐级缩进。整行（含展开后的输出块）一起右移。 */
[data-chat-call-id] {
  margin-left: var(--dsh-tool-indent);
}

/* 2) Tool 摘要灰度：只作用于折叠行头，展开后的正文不受影响。
   行头有两种形态，必须都覆盖：
     a. [data-disclosure-row] —— DisclosureRow 通用行头（多数工具、问题卡）；
     b. [data-sample]        —— 自带行头的 sample 视图。bash 走的就是这条
        （ui-tool 的 BashRow/.CY-8Ka_root），它**没有** data-disclosure-row，
        只写 a 会让「运行命令」这一行的灰度/行间距失效。 */
[data-chat-call-id] [data-disclosure-row],
[data-chat-call-id] [data-sample] {
  opacity: var(--dsh-tool-dim);
}

/* 3) 思考摘要灰度（ReasoningRow 根带 data-variant="think"，用的是通用行头）。 */
[data-variant="think"] [data-disclosure-row] {
  opacity: var(--dsh-think-dim);
}

/* 4) 行间距：加高折叠行头。行头是 align-items:center 的 flex，文字自动居中，
   所以只动高度就能拉开行距，不必碰任何字号/行高。 */
[data-chat-call-id] [data-disclosure-row],
[data-chat-call-id] [data-sample],
[data-variant="think"] [data-disclosure-row] {
  height: calc(24px + var(--dsh-content-font-delta, 0px) + var(--dsh-row-leading));
}
/* 思考行折叠时根节点是固定高 + contain:size（内容不参与撑高），必须同步加高。
   重复属性选择器只是把优先级抬到 (0,2,0) 以上，稳压组件自带规则，无需 !important。 */
[data-variant="think"][data-variant="think"]:not([data-expanded]) {
  height: calc(24px + var(--dsh-content-font-delta, 0px) + var(--dsh-row-leading));
}

/* ===== 设置页（.dti-* 为本插件自有类名，不与 shell 冲突） ===== */
.dti-page {
  box-sizing: border-box;
  max-width: 640px;
  padding: 14px 16px;
  font-size: 12px;
  line-height: 1.6;
}
.dti-page h3 {
  margin: 0 0 4px;
  font-size: 13px;
}
.dti-hint {
  margin: 0 0 14px;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #888);
}
.dti-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 2px 10px;
  align-items: baseline;
  margin-bottom: 8px;
  padding: 10px 12px;
  border: 1px solid var(--dsw-alias-border-l2, #333);
  border-radius: 8px;
}
.dti-label {
  font-weight: 600;
}
.dti-desc {
  grid-column: 1 / -1;
  font-size: 11px;
  color: var(--dsw-alias-label-tertiary, #888);
}
.dti-value {
  font-variant-numeric: tabular-nums;
  color: var(--dsw-alias-label-secondary, #aaa);
  min-width: 56px;
  text-align: right;
}
.dti-input {
  grid-column: 1 / -1;
  width: 100%;
  margin: 4px 0 0;
  accent-color: var(--dsw-alias-brand-primary, #4a9eff);
}
.dti-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.dti-btn {
  padding: 6px 12px;
  font: inherit;
  color: var(--dsw-alias-label-primary, #ddd);
  background: transparent;
  border: 1px solid var(--dsw-alias-border-l2, #444);
  border-radius: 6px;
  cursor: pointer;
}
.dti-btn:hover {
  background: var(--dsw-alias-interactive-bg-hover, rgba(127, 127, 127, 0.12));
}
`;
		function clamp(value, min, max, fallback) {
			return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
		}
		function normalize(raw) {
			return {
				indent: clamp(Number(raw?.indent), 0, 64, DEFAULTS.indent),
				toolDim: clamp(Number(raw?.toolDim), .2, 1, DEFAULTS.toolDim),
				thinkDim: clamp(Number(raw?.thinkDim), .2, 1, DEFAULTS.thinkDim),
				leading: clamp(Number(raw?.leading), -8, 24, DEFAULTS.leading)
			};
		}
		/** 读本地偏好；任何损坏（非法 JSON / 越界值）都退回默认，不让 UI 挂掉。 */
		function readSettings() {
			try {
				return normalize(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "null"));
			} catch {
				return DEFAULTS;
			}
		}
		/** 写本地偏好并立即生效。 */
		function writeSettings(settings) {
			try {
				window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
			} catch {}
			applySettings(settings);
		}
		/**
		* 把偏好写成 `documentElement` 上的行内 CSS 变量。
		* 行内变量优先级高于样式表里的 `:root` 默认值，且不需要重新生成 CSS。
		* @param settings - 已归一化的偏好。
		*/
		function applySettings(settings) {
			const style = document.documentElement.style;
			style.setProperty("--dsh-tool-indent", `calc(${settings.indent}px + var(--dsh-content-font-delta, 0px))`);
			style.setProperty("--dsh-tool-dim", String(settings.toolDim));
			style.setProperty("--dsh-think-dim", String(settings.thinkDim));
			style.setProperty("--dsh-row-leading", `${settings.leading}px`);
		}
		/**
		* 插一次，或**原地刷新**已存在的那一个。
		*
		* 官方 packages 的写法是「已存在就跳过」——它们的 CSS 在一个会话内不会变。
		* 但本插件要走 dev 热重载：bundle 被 HMR 换掉后模块体会重跑，而旧的
		* `<style>` 还在 head 里，若沿用「跳过」就会继续用旧 CSS（改了样式却看不到效果）。
		* 所以这里无脑重写 textContent：幂等，且热重载一定拿到最新规则。
		*/
		if (typeof document !== "undefined") {
			let tag = document.querySelector(`style[data-plugin-css=${JSON.stringify(TAG_ID)}]`);
			if (tag === null) {
				tag = document.createElement("style");
				tag.dataset.plugin = PLUGIN_ID;
				tag.dataset.pluginCss = TAG_ID;
				document.head.appendChild(tag);
			}
			tag.textContent = css;
		}
		/** 模块一落地就按已存偏好生效，页面加载时不会先闪一下默认值。 */
		if (typeof document !== "undefined") applySettings(readSettings());
		/** 一行滑块：标题 + 说明 + 数值 + range 控件。 */
		function SliderRow(props) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dti-row",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dti-label",
						children: props.label
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dti-value",
						children: props.format(props.value)
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
						className: "dti-desc",
						children: props.desc
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("input", {
						className: "dti-input",
						type: "range",
						min: props.min,
						max: props.max,
						step: props.step,
						value: props.value,
						onChange: (event) => props.onChange(Number(event.currentTarget.value))
					})
				]
			});
		}
		/**
		* 设置 → 工具调用外观。
		*
		* 4 个滑块都直接写 root 的 CSS 变量并落 localStorage，所以拖动即时可见，
		* 不需要保存按钮，也不碰 Host 配置文档。
		*/
		function SettingsPage() {
			const [settings, setSettings] = react.useState(readSettings);
			const patch = (change) => {
				const next = normalize({
					...settings,
					...change
				});
				setSettings(next);
				writeSettings(next);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				className: "dti-page",
				children: [
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("h3", { children: "工具调用外观" }),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("p", {
						className: "dti-hint",
						children: "作用于会话里每一次 Tool 调用（bash / pwsh / 查看 / 修改文件 …）与「思考」折叠行。改动立即生效，并保存在本浏览器。"
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SliderRow, {
						label: "缩进",
						desc: "Tool 调用相对正文右移的距离（会随内容字号自动缩放）",
						min: 0,
						max: 64,
						step: 1,
						value: settings.indent,
						format: (value) => `${value}px`,
						onChange: (indent) => patch({ indent })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SliderRow, {
						label: "工具摘要灰度",
						desc: "Tool 折叠行的浓度：越小越淡（展开后的输出不受影响）",
						min: .2,
						max: 1,
						step: .02,
						value: settings.toolDim,
						format: (value) => `${Math.round(value * 100)}%`,
						onChange: (toolDim) => patch({ toolDim })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SliderRow, {
						label: "思考摘要灰度",
						desc: "「思考」折叠行的浓度：越小越淡",
						min: .2,
						max: 1,
						step: .02,
						value: settings.thinkDim,
						format: (value) => `${Math.round(value * 100)}%`,
						onChange: (thinkDim) => patch({ thinkDim })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)(SliderRow, {
						label: "行间距",
						desc: "折叠行的行距增量，负数更紧凑",
						min: -8,
						max: 24,
						step: 1,
						value: settings.leading,
						format: (value) => `${value > 0 ? "+" : ""}${value}px`,
						onChange: (leading) => patch({ leading })
					}),
					/* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
						className: "dti-actions",
						children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: "dti-btn",
							onClick: () => {
								setSettings(DEFAULTS);
								writeSettings(DEFAULTS);
							},
							children: "恢复默认"
						})
					})
				]
			});
		}
		/** 本插件需要的唯一 client 服务：槽位注册表。 */
		const inject = ["slots"];
		/** Loader entry 名（与 package.json name 一致）。 */
		const name = PLUGIN_ID;
		/**
		* 注册 设置 →「工具调用外观」一页。
		* 组件必须作为 `register` 的第二个参数传入（`options.component` 会被忽略），
		* 且必须是 React 组件——settings.section 的渲染方就是 React。
		* @param ctx - client 根上下文。
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.slots.inject("settings.section", () => ctx.slots.register({
				name: "settings.section",
				id: PLUGIN_ID,
				order: 60,
				label: () => "工具调用外观"
			}, SettingsPage)), "dsh-tool-indent: settings section");
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		exports.name = name;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map