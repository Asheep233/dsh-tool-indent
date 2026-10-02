import type { UserConfig } from 'tsdown'

/** 必须与 package.json 的 name 一致：browser 端按 id 注册到 __ModuleLoader__。 */
const PLUGIN_ID = 'dsh-tool-indent'

/**
 * 运行时由 shell 提供的模块 —— 就是浏览器端冻结静态表（`staticModules`）的全部
 * 可解析键：react / react-dom / @deepseek-ai/cordis / @deepseek-ai/dsh-client-store /
 * @deepseek-ai/dsh-client-ui-slots / @deepseek-ai/dsh-client-ui-primitives /
 * @deepseek-ai/dsh-client-ui-dockkit。这些必须保持 external —— 打成
 * `require("react")` 交给静态表解析；一旦被内联进 bundle，就会出现第二份 React，
 * hooks 立刻报错。
 * ⚠️ 静态表里没有裸 `cordis`，也没有 `@deepseek-ai/dsh-client-runtime/client`：
 * 那些要声明 `dsh.client.inject` 才拿得到，别往这个列表里加。
 */
const CLIENT_EXTERNALS = [
  'react',
  'react/jsx-runtime',
  'react-dom',
  'react-dom/client',
  '@deepseek-ai/cordis',
  '@deepseek-ai/dsh-client-store',
  '@deepseek-ai/dsh-client-ui-slots',
  '@deepseek-ai/dsh-client-ui-primitives',
]

/**
 * 浏览器半边打包成单文件 `lib/client.js`，外壳是 client-modules 约定的
 * `window.__ModuleLoader__.load({ id, factory })`，与官方 packages
 * （如 @deepseek-ai/dsh-client-ui-tool）产物同形。
 */
const clientBundle: UserConfig = {
  entry: { client: 'src/client/index.tsx' },
  outDir: 'lib',
  format: 'cjs',
  platform: 'browser',
  dts: false,
  sourcemap: true,
  clean: false,
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV ?? 'production'),
  },
  deps: {
    neverBundle: CLIENT_EXTERNALS,
  },
  outputOptions: {
    entryFileNames: 'client.js',
    banner: 'window.__ModuleLoader__.load({ id: ' + JSON.stringify(PLUGIN_ID) + ', factory: (require) => {',
    footer: 'return module.exports; } });',
    intro: 'var module = { exports: {} }; var exports = module.exports;',
    codeSplitting: false,
  },
}

export default [clientBundle] satisfies UserConfig[]

