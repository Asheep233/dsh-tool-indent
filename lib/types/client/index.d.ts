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
/** 本插件需要的唯一 client 服务：槽位注册表。 */
export declare const inject: string[];
/** 只用到 slots 的这两个方法（不引 @deepseek-ai/* 类型，保持零依赖）。 */
interface SlotsService {
    inject(name: string, callback: () => () => void): () => void;
    register(options: Record<string, unknown>, component: unknown): () => void;
}
interface ClientContext {
    slots: SlotsService;
    effect(callback: () => (() => void) | void, label?: string): void;
}
/** Loader entry 名（与 package.json name 一致）。 */
export declare const name = "dsh-tool-indent";
/**
 * 注册 设置 →「工具调用外观」一页。
 * 组件必须作为 `register` 的第二个参数传入（`options.component` 会被忽略），
 * 且必须是 React 组件——settings.section 的渲染方就是 React。
 * @param ctx - client 根上下文。
 */
export declare function apply(ctx: ClientContext): void;
export {};
