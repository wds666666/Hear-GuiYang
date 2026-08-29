# 新 PLY 必须自己调初始视角

高斯场景的进入朝向**不是**自动算好的观景位。加载完成后如果没有 `splat.camera`，查看器只会把相机放到点云中心、`yaw/pitch = 0`，这一帧通常是钻进模型内部或对着一片空。

每个新的 `.ply` 都要人工走进去、找到观感最好的起点，再把参数写回数据。不要改加载器和控制器去“猜”一个通用视角。

## 改哪里

只改 `src/data/spots.js` 对应景点的 `splat`：

```js
splat: {
  status: 'ready',
  src: '/assets/splats/your-scene.ply',
  up: [0, 0, 1],           // 点云竖直轴，猜错会让拖拽变成 roll
  camera: {
    position: [x, y, z],
    yaw: 0,
    pitch: 0,
  },
},
```

PLY 放到 `public/assets/splats/`，路径不要指向 `ref/`。

## 怎么调

1. 先写入一个能进场景的 `up` 和粗略 `camera`（可先抄同类型场景，或用中心点占位）。
2. `npm run dev`，进入该景点的 3D 页。
3. 拖动转向，`W A S D` 移动，空格 / `C` 升降，找到进入时最舒服的位置。
4. 点右侧「复制参数」，或按 `P`。剪贴板（或控制台）会给出可粘贴的 `up` / `camera`。
5. 粘回 `spots.js`，刷新确认第一眼就是刚才那一帧。
6. `R` 或「回到起点」应回到同一视角。

`up` 必须和点云几何一致。现有值以 `tests/spots.test.js` 里固化的实测轴为准；新场景测完后把期望值补进该测试。

## 不要动

- `src/splat/create-viewer.js` 的 Viewer 构造参数、PLY 加载、排序、framing 回退
- `src/splat/controls.js` 的第一人称控制
- 已调好的其它景点 `splat.up` / `splat.camera`

加载器只负责读数据里的视角。观景效果属于内容，调数据，不调引擎。
