import { defineConfig } from 'tsup'
import { readFile, writeFile } from 'node:fs/promises'

// The styling side-effect import, re-attached to the JS entry so importing the
// package pulls it in. tsup concatenates each component's `import './X.css'`
// into dist/index.css but strips the reference from the JS; this points back at
// the package's layered styles.css. ../ is relative to the emitted dist/*.js.
// sideEffects: ["*.css"] (package.json) keeps it from being tree-shaken.
const STYLE_IMPORT = 'import "../styles.css";'

export default defineConfig({
  // Two entries. `index` is the whole design system and carries the stylesheet.
  // `chart` is the pure-data chart palette (no React, no CSS) published at
  // `@connor-adams/designsystem/chart`, so a consumer who only wants the
  // palette does not get the component stylesheet as a side-effect. This is
  // also why STYLE_IMPORT is prepended per-file below instead of via tsup's
  // `banner`, which would apply to every entry and defeat the point.
  entry: ['src/index.ts', 'src/chart.ts'],
  format: ['esm'],
  dts: true,
  clean: true,
  treeshake: true,
  external: ['react', 'react-dom'],
  // Wrap the bundled component CSS in @layer components. Paired with the token
  // base resets in @layer base, this gives the cascade order base < components
  // < unlayered: components beat the base resets (e.g. the form-control
  // `font: inherit`), while consumer styles still override components. The
  // layer is baked into the file rather than applied via `@import ... layer()`,
  // which Next.js's CSS pipeline silently drops.
  async onSuccess() {
    const cssPath = 'dist/index.css'
    const css = await readFile(cssPath, 'utf8')
    if (!css.startsWith('@layer components')) {
      await writeFile(cssPath, `@layer components {\n${css}\n}\n`, 'utf8')
    }
    const jsPath = 'dist/index.js'
    const js = await readFile(jsPath, 'utf8')
    if (!js.startsWith(STYLE_IMPORT)) {
      await writeFile(jsPath, `${STYLE_IMPORT}\n${js}`, 'utf8')
    }
  },
})
