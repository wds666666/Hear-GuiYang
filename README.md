# 听见贵阳

贵阳文旅地图：在写实地图上悬停试听，点进景点看声音 / Vlog / 3D 高斯场景。纯前端静态站，可部署到 GitHub Pages。

## 本地运行

```bash
npm install
npm run dev      # http://127.0.0.1:5173/Hear-GuiYang/
npm test
npm run build
```

资源一律走 `public/assets/`，运行时不得引用 `ref/`。`vite.config.js` 的 `base` 是 `/Hear-GuiYang/`（GitHub Pages 项目页）。

## 用户怎么走

```text
首页地图 ──悬停──► 预览卡 + 环境声
         ──点击景点──► 无小地图：详情三卡（声音 / Vlog / 3D）
                      有小地图：二级地图 → 角落详情 或 整区 3D
         ──点击「贵阳美食」──► 右侧抽屉，默认自动播 Vlog
```

有二级地图的景点：青云市集、阿云朵仓、黔灵山。高斯场景目前 6 个：甲秀楼、黔灵山、阿云朵仓、贵州博物馆、黄果树、青云市集。

## 技术架构

无框架。Vite + 原生 ES Module，hash 路由，数据驱动页面。

```text
index.html
  └─ src/main.js                 样式入口 + 路由分发
       ├─ src/router.js           hash → { page, id, subId }
       ├─ src/data/spots.js      景点 / 小景点 / 媒体 / splat.camera
       ├─ src/data/food.js        美食专题
       ├─ src/assets.js          给路径补上 BASE_URL
       ├─ src/map/               Leaflet 地图 + WGS84↔GCJ-02
       ├─ src/pages/             地图 / 详情 / 小地图 / 高斯页
       ├─ src/components/        三卡、美食抽屉、占位、预览
       └─ src/splat/             PLY 缓存 + 高斯查看器（勿轻易改）
```

### 路由

| Hash | 页面 |
| --- | --- |
| `#/` | 贵阳地图 |
| `#/spot/:id` | 景点详情（有 `subSpots` 的会立刻跳到小地图） |
| `#/spot/:id/map` | 二级小地图 |
| `#/spot/:id/sub/:subId` | 小景点详情 |
| `#/spot/:id/splat` | 3D Gaussian Splat |
| 其它 | 回 `#/` |

### 地图

`src/map/create-map.js`：Leaflet 1.9，默认高德地图、OpenStreetMap 备选（高德瓦片失败则自动切 OSM）。景点坐标是 WGS84；高德底图用 `wgs84ToGcj02`。切底图时地图中心与 marker 同步换算。悬停走 Leaflet tooltip，点击走 `navigate`。

美食是 `extraMarkers`，不进景点列表，点开 `createFoodPanel`。

### 媒体

景点与小景点共用 `experience-cards.js`：声音、Vlog、3D 三张卡。`status` 为 `unavailable` 时显示「素材准备中」，不造假入口。美食抽屉点开后默认播 Vlog；mp3 是 mp4 音轨，视频与「只听声音」互斥，避免回声。

### 3D 高斯

`src/splat/create-viewer.js` 用 Three.js + `@mkkellogg/gaussian-splats-3d`。PLY 经 `ply-cache.js`（内存 + Cache Storage）再交给 viewer。初始朝向只读 `spots.js` 里的 `splat.up` 和 `splat.camera`。

**加载方式、相机控制和默认视角不要在业务改动里顺手改。** 换新 PLY 时只改数据层的相机参数，步骤见 [docs/splat-camera.md](docs/splat-camera.md)。

### 样式与测试

样式在 `src/styles/`，token 在 `tokens.css`。测试是 Node 内建 `node:test`：路由、景点完整性、本地文件是否存在、splat `up` 轴。不引入测试框架。

## 目录

```text
public/assets/     图片、音频、视频、PLY
src/               应用代码（见上）
docs/              实施记录与高斯视角手册
tests/             node:test
```

给后续开发者和 Agent 的硬约束写在 [AGENTS.md](AGENTS.md)。早期实施笔记在 [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md)，以本 README 和当前代码为准。
