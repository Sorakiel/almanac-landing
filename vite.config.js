import { defineConfig } from 'vite';

/**
 * Inlines the built stylesheet into index.html. The page is one screen of
 * CSS (~15 KB gzipped), and a separate render-blocking request cost ~300 ms
 * on Lighthouse's mobile profile — more than the bytes it would save by caching.
 */
function inlineCss() {
  return {
    name: 'inline-css',
    apply: 'build',
    enforce: 'post',
    generateBundle(_, bundle) {
      const html = Object.values(bundle).find((f) => f.fileName === 'index.html');
      if (!html) return;
      for (const [name, file] of Object.entries(bundle)) {
        if (file.type !== 'asset' || !name.endsWith('.css')) continue;
        const tag = new RegExp(`<link[^>]*href="/${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^>]*>`);
        if (!tag.test(html.source)) continue;
        html.source = html.source.replace(tag, () => `<style>${file.source}</style>`);
        delete bundle[name];
      }
    },
  };
}

export default defineConfig({
  plugins: [inlineCss()],
  build: {
    target: 'es2019',
    cssMinify: true,
  },
});
