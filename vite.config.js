import { defineConfig } from 'vite';

const isolationHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  // 部署到 GitHub Pages 项目页：https://wds666666.github.io/Hear-GuiYang/
  base: '/Hear-GuiYang/',
  server: { host: '127.0.0.1', port: 5173, headers: isolationHeaders },
  preview: { host: '127.0.0.1', port: 4173, headers: isolationHeaders },
  build: { target: 'es2020', chunkSizeWarningLimit: 2200 },
});
