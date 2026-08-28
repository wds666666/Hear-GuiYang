const audio = { status: 'ready', src: '/assets/audio/guiyang-ambience.wav' };
const vlog = { status: 'unavailable', src: null };
const unavailableSplat = { status: 'unavailable', src: null };

export const spots = [
  {
    id: 'jiaxiu-tower', order: 1, name: '甲秀楼', icon: '楼', color: '#c96332', lat: 26.5717, lng: 106.7214,
    description: '南明河上的明清古楼，翠微园拱桥与涵碧亭相映，是贵阳的城市地标。',
    image: '/assets/images/jiaxiu-tower.jpg', imageCredit: '本地占位图', audio, vlog,
    splat: {
      status: 'ready', src: '/assets/splats/jiaxiu-tower.ply', up: [0, 0, 1],
      camera: { position: [-0.032, -3.2568, 3.2412], yaw: 0.092, pitch: -0.26 },
    },
  },
  {
    id: 'qianling-mountain', order: 2, name: '黔灵山', icon: '山', color: '#39795b', lat: 26.5986, lng: 106.6917,
    description: '城中山林公园，猕猴、弘福寺与黔灵湖共生，可半日登高望远。',
    image: '/assets/images/qianling-mountain.jpg', imageCredit: '本地占位图', audio, vlog,
    splat: {
      status: 'ready', src: '/assets/splats/qianling-mountain.ply', up: [0, 0, 1],
      camera: { position: [-0.1818, -2.6152, 5.4354], yaw: -3.504, pitch: -0.82 },
    },
  },
  {
    id: 'qingyun-market', order: 3, name: '青云市集', icon: '集', color: '#bd477f', lat: 26.5665, lng: 106.7159,
    description: '南明区青云路市集，复古霓虹、贵州小吃与文创小店，夜里最热闹。',
    image: '/assets/images/qingyun-market.jpg', imageCredit: '本地占位图', audio, vlog, splat: unavailableSplat,
  },
  {
    id: 'ayunduocang', order: 4, name: '阿云朵仓', icon: '艺', color: '#7254a3', lat: 26.6397, lng: 106.6466,
    description: '观山湖区文创社区，咖啡、手作与现场演出在旧空间里重新生长。',
    image: '/assets/images/ayunduocang.jpg', imageCredit: '本地占位图', audio, vlog, splat: unavailableSplat,
  },
  {
    id: 'guizhou-museum', order: 5, name: '贵州博物馆', icon: '博', color: '#a33d68', lat: 26.6513, lng: 106.6389,
    description: '收藏贵州历史、民族与自然记忆，在一座馆里读懂多彩贵州。',
    image: '/assets/images/guizhou-museum.jpg', imageCredit: '本地占位图', audio, vlog,
    splat: {
      status: 'ready', src: '/assets/splats/guizhou-museum.ply', up: [0, 0, 1],
      camera: { position: [-1.2712, 0.6646, 0.7474], yaw: -2.396, pitch: -0.308 },
    },
  },
  {
    id: 'qingyan-ancient-town', order: 6, name: '青岩古镇', icon: '镇', color: '#a77a25', lat: 26.3378, lng: 106.6856,
    description: '明清军事古镇，石板街巷、城墙与小吃共同保存着花溪南郊的旧时光。',
    image: '/assets/images/qingyan-ancient-town.jpg', imageCredit: '本地占位图', audio, vlog, splat: unavailableSplat,
  },
  {
    id: 'huaxi-park', order: 7, name: '花溪公园', icon: '花', color: '#258b82', lat: 26.4344, lng: 106.6736,
    description: '沿花溪河展开的园林湿地，十里河滩与坝上桥在春日最盛。',
    image: '/assets/images/huaxi-park.jpg', imageCredit: '本地占位图', audio, vlog, splat: unavailableSplat,
  },
  {
    id: 'tianhetan', order: 8, name: '天河潭', icon: '潭', color: '#397ba1', lat: 26.3914, lng: 106.6278,
    description: '喀斯特水上石林，溶洞暗河与碧水相连，可乘船也可沿峡谷步行。',
    image: '/assets/images/tianhetan.jpg', imageCredit: '本地占位图', audio, vlog, splat: unavailableSplat,
  },
  {
    id: 'huangguoshu-waterfall', order: 9, name: '黄果树瀑布', icon: '瀑', color: '#168384', lat: 25.9922, lng: 105.6678,
    description: '中国最大的瀑布群之一，自贵阳向西约两小时，在水雾与轰鸣中感受山河。',
    image: '/assets/images/huangguoshu-waterfall.jpg', imageCredit: '本地占位图', audio, vlog,
    splat: {
      status: 'ready', src: '/assets/splats/huangguoshu-waterfall.ply', up: [0, -1, 0],
      camera: { position: [1.4695, -4.2715, -0.201], yaw: -4.5298, pitch: -0.4042 },
    },
  },
];

export function getSpot(id) {
  return spots.find((spot) => spot.id === id);
}
