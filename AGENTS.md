# Agent 约束

改代码前先读 [README.md](README.md) 和现有实现，做最小改动。不要重写能工作的模块。

## 高斯场景：默认不许动

除非用户**明确**要求改高斯加载或视角，否则不要改：

- `src/splat/create-viewer.js`（Viewer 参数、PLY 加载、排序、自动 framing 回退）
- `src/splat/controls.js`、`src/splat/bounds.js`、`src/splat/ply-cache.js`
- 已有景点在 `src/data/spots.js` 里的 `splat.up`、`splat.camera`

换新 PLY 时：把文件放到 `public/assets/splats/`，只更新该景点的 `splat` 数据，并按 [docs/splat-camera.md](docs/splat-camera.md) 人工标定初始视角。不要为了“看起来差不多”去改查看器。

## 其它

- 媒体路径只走 `public/assets/`，运行时禁止 `/ref/`。
- 没有真实素材就保持 `unavailable` / 占位，不造假可播内容。
- 坐标是 WGS84；高德底图才转 GCJ-02。
- 不要顺手重构、不要加框架、不要加后端。
