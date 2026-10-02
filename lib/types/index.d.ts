/**
 * dsh-tool-indent — host 半边。
 *
 * 这是一个「浏览器专属 UI 插件」：样式注入全部发生在 client bundle 里，
 * host 侧没有任何行为、服务依赖或工具，只提供 Loader 需要的入口模块
 * （与官方 `@deepseek-ai/dsh-client-ui-tool/lib/index.js` 同形态）。
 */
/** Loader entry 名（与 package.json name 一致）。 */
export declare const name = "dsh-tool-indent";
/** Host 侧无操作：本插件的全部效果由 `./client` 在浏览器里完成。 */
export declare function apply(): void;
