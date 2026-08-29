# 听见贵阳实施计划

> 本文是早期实施记录，部分条目已过时。当前架构、运行方式和目录以仓库根目录 [README.md](../README.md) 为准。新 PLY 的初始视角见 [splat-camera.md](./splat-camera.md)。

## 1. 项目目标

构建一个轻量的文旅 Web 应用：

1. 首页展示贵阳及周边景点的写实经纬度地图。
2. 鼠标悬停或键盘聚焦景点标记时，展示景点图片和简介并且自动播放声音。
3. 点击景点后进入详情页，展示三个内容入口：
   - 播放景点声音；
   - 播放 Vlog；
   - 进入 3D Gaussian Splat 场景。
4. 没有真实内容的入口统一显示“素材准备中”，不伪造可用内容。
5. 所有图片、音频和 PLY 均保存在正式项目资源目录，运行时不得读取 `ref/`。

## 2. 已确认需求

### 地图

- 采用最新版 `ref/地图显示/index.html` 的写实地图方案，不使用旧版手绘滤镜。
- 默认底图：高德地图。
- 备选底图：OpenStreetMap。
- 景点原始坐标使用 WGS84。
- 高德底图使用 GCJ-02，因此需要复用 `w2g()` 坐标转换。
- 用户切换底图时，所有 marker 坐标必须同步转换。

### 景点

首版共 9 个景点：

1. 甲秀楼
2. 黔灵山
3. 青云市集
4. 阿云朵仓
5. 贵州博物馆
6. 青岩古镇
7. 花溪公园
8. 天河潭
9. 黄果树瀑布

景点坐标和简介参考：`ref/地图显示/index.html:28-38`。

### 3D Gaussian Splat

当前有 4 个真实场景：

| 景点 | 正式资源路径 | 默认视角 |
| --- | --- | --- |
| 黄果树瀑布 | `/assets/splats/huangguoshu-waterfall.ply` | 使用参考项目预设 |
| 黔灵山 | `/assets/splats/qianling-mountain.ply` | 自动 framing |
| 甲秀楼 | `/assets/splats/jiaxiu-tower.ply` | 自动 framing |
| 贵州博物馆 | `/assets/splats/guizhou-museum.ply` | 自动 framing |

黄果树相机参数：

```js
{
  position: [1.4695, -4.2715, -0.201],
  yaw: -4.5298,
  pitch: -0.4042,
}
```

其余 5 个景点保留完整 3D 入口，但进入统一“素材准备中”状态。

### 本地媒体

- 音频：当前使用 `/assets/audio/guiyang-ambience.wav` 作为本地占位环境音。
- Vlog：当前没有视频素材，所有景点显示统一占位状态。
- 图片：9 张图片均已保存到 `/public/assets/images/`。
- 甲秀楼、黔灵山图片来自 Wikimedia Commons；其余当前为本地占位图片，后续可直接替换同名文件。

## 3. 推荐技术栈

- Vite
- 原生 ES Modules
- Leaflet 1.9.4
- Three.js
- `@mkkellogg/gaussian-splats-3d`
- Node.js 内建 `node:test`

不需要：

- React/Vue；
- 后端服务；
- 数据库；
- 用户系统；
- 状态管理框架。

## 4. 路由

使用 hash 路由，兼容普通静态托管：

```text
#/                         地图首页
#/spot/:id                 景点详情
#/spot/:id/splat           3D Gaussian Splat 查看器
```

未知路由或不存在的景点 ID 返回 `#/`。

## 5. 实施顺序

### 阶段一：基础应用

1. 完成 `src/main.js`。
2. 完成 `src/router.js`。
3. 在 `src/data/spots.js` 建立 9 个景点的唯一数据源。
4. 引入全局样式和设计 token。
5. 执行 `npm install` 生成 `package-lock.json`。

注意：本次会话运行 `npm install` 时被安全策略拦截，需要用户显式批准。

### 阶段二：地图首页

1. 将 `ref/地图显示/index.html:40-54` 的 `w2g()` 迁移到 `src/map/china-coordinates.js`。
2. 在 `src/map/create-map.js` 初始化 Leaflet：
   - 默认高德；
   - OSM 备选；
   - 高德图层设置 `crossOrigin: true`；
   - 图层切换时更新 marker 坐标。
3. 创建自定义圆形 marker 和声音波纹 hover 效果。
4. 使用 `bindTooltip()` 构建 hover/focus 预览卡。
5. marker click 导航到 `#/spot/:id`。
6. 实现桌面左侧景点列表和移动端底部横向列表。
7. 地图瓦片加载失败时，景点列表仍然可导航。

### 阶段三：景点详情

1. 显示本地封面、名称、简介和返回地图按钮。
2. 创建三个媒体入口：声音、Vlog、3D。
3. 音频使用原生 `<audio controls>`。
4. 离开页面时暂停并重置音频。
5. Vlog 统一显示“素材准备中”。
6. 3D 根据 `spot.splat.status` 决定进入查看器或占位状态。

### 阶段四：高斯查看器

1. 复制并调整：
   - `ref/splat-viewer/src/controls.js` → `src/splat/controls.js`
   - `ref/splat-viewer/src/bounds.js` → `src/splat/bounds.js`
2. 从 `ref/splat-viewer/src/main.js:118-277` 抽取：
   - Three.js renderer；
   - Y-down 相机；
   - GaussianSplats3D Viewer 参数；
   - PLY 加载进度；
   - 自动 framing；
   - 清晰首帧排序；
   - 加载错误状态。
3. `splat-page.js` 动态导入查看器，避免地图首屏加载大型 3D JavaScript。
4. 黄果树在加载前应用预设相机。
5. 其余三个场景通过 `measureScene()` 自动 framing。
6. 离开查看器时必须：
   - 取消 `requestAnimationFrame`；
   - 移除 resize/keydown 监听；
   - 调用 `await viewer.dispose()`；
   - 释放 renderer；
   - 移除 canvas。

### 阶段五：测试与验收

1. `npm test`
   - 9 个景点 ID 唯一；
   - 路由解析正确；
   - 媒体状态合法；
   - 声明的本地文件存在；
   - 4 个 PLY 映射正确；
   - `src/` 中不存在 `/ref/` 运行时路径。
2. `npm run build`
3. 搜索生产构建：

```bash
rg '/ref/' src dist
```

结果必须为空。

4. 浏览器验收：
   - 高德/OSM 切换后 marker 位置准确；
   - hover 和键盘 focus 均显示预览；
   - 9 个景点详情可进入；
   - 本地音频可播放且离页停止；
   - 5 个缺失场景显示统一占位；
   - 4 个真实 PLY 从 `/assets/splats/` 加载；
   - 黄果树相机预设正确；
   - 返回地图后 GPU 不继续占用；
   - 桌面和移动端均无水平溢出。

## 6. 当前进度（2026-08-29 交接）

### 已完成

- 根目录 Vite 应用骨架已恢复：`package.json`、`package-lock.json`、`vite.config.js`、`index.html`。
- `.gitignore` 和 `.gitattributes` 已配置；PLY 被标记为 binary。
- 4 个 PLY 已从 `ref/3dGS` 复制到 `public/assets/splats/`，不是软链接，运行时路径均为 `/assets/splats/...`。
- 9 张本地占位图片已恢复到 `public/assets/images/`。
- 本地占位音频已恢复到 `public/assets/audio/guiyang-ambience.wav`。
- 9 个景点的唯一数据源已实现：`src/data/spots.js`。
- hash 路由已实现：地图、景点详情、3D 场景和非法路由回退。
- 写实 Leaflet 地图已实现：高德/OSM 双底图、WGS84/GCJ-02 坐标切换、9 个 marker、景点列表、hover/focus 预览。
- 地图 hover/focus 自动播放本地声音，离开时停止并复位。
- 景点详情页已实现：封面、简介、声音播放器、Vlog 占位、3D 入口/占位。
- Gaussian Splat 查看器已实现：4 个本地 PLY、加载进度、黄果树固定相机、其余场景自动 framing、FPS/点数、第一人称控制。
- 查看器离页清理已实现：取消动画帧、移除控制器事件、调用 viewer/renderer dispose。
- 桌面与移动端样式已实现：`src/styles/`。
- 自动化测试已实现并通过：共 5 项，覆盖路由、景点数量、ID 唯一性、本地资源、4 个 PLY 和禁止 `/ref/` 运行时引用。
- `npm install` 已成功，0 个已知漏洞。

### 当前阻塞

- `npm run build` 尚未通过，但失败原因不是已发现的代码语法错误：原项目位于 macOS Desktop 的 File Provider 云同步目录，多个刚写入的源码被标记为 `compressed,dataless`；Vite 并行读取时报 `Operation timed out (os error 60)`。
- 已尝试 `brctl download`、顺序读取和 File Provider 状态检查，系统未物化源码。
- 因此用户要求将完整项目目录移动到非云盘路径 `/Users/dsw/workspace/now/pro/Hear‑GuiYang` 后继续。

### 移动后必须立即执行

```bash
cd '/Users/dsw/workspace/now/pro/Hear‑GuiYang'
npm test
npm run build
rg '/ref/' src dist
npm run dev
```

然后完成浏览器验收：

1. 地图首页、9 个 marker 和景点列表。
2. marker/list hover 与键盘 focus 显示预览并自动播放声音，离开停止。
3. 高德/OSM 切换后 marker 坐标对齐。
4. 9 个详情页和三类媒体入口。
5. 黄果树、甲秀楼、黔灵山、贵州博物馆四个高斯场景。
6. 黄果树默认相机正确；其余三个自动 framing。
7. 返回地图后无持续 WebGL/事件监听资源占用。
8. 桌面与移动端无水平溢出。

### 后续建议检查

- `src/pages/spot-page.js` 的右下角序号目前由景点 ID 长度生成，只是装饰值；建议改为数据中的真实顺序字段。
- 浏览器自动播放受浏览器策略约束：首次没有用户交互时 `audio.play()` 可能被拒绝；列表 hover 通常需要先有一次点击。应在浏览器验收中确认并按需要增加“开启声音”按钮。
- 本地图片当前均为占位图，后续可以直接替换同名文件而无需改代码。
- `docs/IMPLEMENTATION_PLAN.md` 早期章节中若有“未实现”的旧措辞，以本节最新状态为准。

## 7. 新 AI 的第一步

不要重写现有实现。先在新路径运行测试与构建，根据真实编译错误做最小修复；构建通过后再启动浏览器验收。核心代码已经存在于：

1. `src/data/spots.js`
2. `src/router.js`
3. `src/main.js`
4. `src/map/`
5. `src/pages/`
6. `src/splat/`
7. `src/styles/`
8. `tests/`

