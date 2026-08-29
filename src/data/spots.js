// status: ready 表示该地实拍/实录素材，placeholder 表示通用占位环境音，unavailable 表示尚未采集。
const ambience = { status: 'placeholder', src: '/assets/audio/guiyang-ambience.wav' };
const noVlog = { status: 'unavailable', src: null, poster: null };
const unavailableSplat = { status: 'unavailable', src: null };

const rec = (slug) => ({ status: 'ready', src: `/assets/audio/${slug}.mp3` });
const clip = (slug) => ({
  status: 'ready',
  src: `/assets/video/${slug}.mp4`,
  poster: `/assets/images/posters/${slug}.jpg`,
});

export const spots = [
  {
    id: 'jiaxiu-tower', order: 1, name: '甲秀楼', icon: '楼', color: '#c96332', lat: 26.5717, lng: 106.7214,
    pixel: { x: 2669, y: 4272 },
    description: '南明河上的明清古楼，翠微园拱桥与涵碧亭相映，是贵阳的城市地标。',
    image: '/assets/images/posters/spots/jiaxiu-tower.jpg', imageCredit: 'Vlog 抽帧',
    audio: rec('spots/jiaxiu-tower'), vlog: clip('spots/jiaxiu-tower'),
    splat: {
      status: 'ready', src: '/assets/splats/jiaxiu-tower.ply', up: [0, 0, 1],
      camera: { position: [-0.032, -3.2568, 3.2412], yaw: 0.092, pitch: -0.26 },
    },
  },
  {
    id: 'qianling-mountain', order: 2, name: '黔灵山', icon: '山', color: '#39795b', lat: 26.5986, lng: 106.6917,
    pixel: { x: 2771, y: 3509 },
    description: '城中山林公园，猕猴、弘福寺与黔灵湖共生，可半日登高望远。',
    image: '/assets/images/qianling-mountain.jpg', imageCredit: '本地占位图',
    audio: ambience, vlog: noVlog,
    splat: {
      status: 'ready', src: '/assets/splats/qianling-mountain.ply', up: [0, 0, 1],
      camera: { position: [-0.1818, -2.6152, 5.4354], yaw: -3.504, pitch: -0.82 },
    },
    subSpots: [
      {
        id: 'hongfu-temple', name: '弘福寺', icon: '寺', lat: 26.5952, lng: 106.6938,
        description: '山腰的明代古刹，钟声与香火在林间散开。',
        image: '/assets/images/qianling-mountain.jpg', audio: ambience, vlog: noVlog,
      },
      {
        id: 'qianling-lake', name: '黔灵湖', icon: '湖', lat: 26.5961, lng: 106.6875,
        description: '山谷中的人工湖，环湖步道是清晨最安静的一段。',
        image: '/assets/images/qianling-mountain.jpg', audio: ambience, vlog: noVlog,
      },
      {
        id: 'macaque-trail', name: '猕猴九曲径', icon: '径', lat: 26.5978, lng: 106.6952,
        description: '通往山顶的九曲径，沿途猕猴成群，走走停停要看它们脸色。',
        image: '/assets/images/qianling-mountain.jpg', audio: ambience, vlog: noVlog,
      },
      {
        id: 'xiangwang-ridge', name: '象王岭', icon: '岭', lat: 26.6015, lng: 106.6925,
        description: '黔灵山主峰一带，登顶可俯瞰整座贵阳城。',
        image: '/assets/images/qianling-mountain.jpg', audio: ambience, vlog: noVlog,
      },
    ],
  },
  {
    id: 'qingyun-market', order: 3, name: '青云市集', icon: '集', color: '#bd477f', lat: 26.5665, lng: 106.7159,
    pixel: { x: 2371, y: 4437 },
    illustratedMap: { src: '/assets/images/maps/qingyun-illustrated.jpg', width: 1200, height: 725 },
    description: '南明区青云路市集，复古霓虹、贵州小吃与文创小店，夜里最热闹。',
    image: '/assets/images/posters/qingyun-market/main.jpg', imageCredit: 'Vlog 抽帧',
    audio: rec('qingyun-market/main'), vlog: clip('qingyun-market/main'),
    splat: {
      status: 'ready', src: '/assets/splats/qingyun-market.ply', up: [0, 1, 0],
      camera: { position: [2.7626, 0.5873, 1.2972], yaw: 1.0540, pitch: 0.0200 },
    },
    subSpots: [
      {
        id: 'main', name: '市集主街', icon: '街', lat: 26.5668, lng: 106.7156,
        pixel: { x: 498, y: 399 },
        description: '霓虹招牌下的主街，人潮、小吃与吆喝挤在一起。',
        image: '/assets/images/posters/qingyun-market/main.jpg',
        audio: rec('qingyun-market/main'), vlog: clip('qingyun-market/main'),
      },
      {
        id: 'cafe', name: '咖啡厅', icon: '咖', lat: 26.5661, lng: 106.7164,
        pixel: { x: 1106, y: 350 },
        description: '市集里的咖啡厅，磨豆与蒸汽声隔开了街上的喧闹。',
        image: '/assets/images/posters/qingyun-market/cafe.jpg',
        audio: rec('qingyun-market/cafe'), vlog: clip('qingyun-market/cafe'),
      },
      {
        id: 'piano', name: '钢琴角', icon: '琴', lat: 26.5670, lng: 106.7166,
        pixel: { x: 528, y: 275 },
        description: '街角的公共钢琴，路人坐下随手弹的几个小节。',
        image: '/assets/images/posters/qingyun-market/piano.jpg',
        audio: rec('qingyun-market/piano'), vlog: clip('qingyun-market/piano'),
      },
      {
        id: 'silver', name: '银饰', icon: '银', lat: 26.5664, lng: 106.7160,
        pixel: { x: 916, y: 477 },
        description: '闹市里的银饰摊，敲击声混进人流的嘈杂。',
        image: '/assets/images/posters/ayunduocang/silver-street.jpg',
        audio: rec('ayunduocang/silver-street'), vlog: clip('ayunduocang/silver-street'),
      },
    ],
  },
  {
    id: 'ayunduocang', order: 4, name: '阿云朵仓', icon: '艺', color: '#7254a3', lat: 26.6397, lng: 106.6466,
    pixel: { x: 1397, y: 3392 },
    illustratedMap: { src: '/assets/images/maps/ayunduocang-illustrated.jpg', width: 1200, height: 1200 },
    description: '观山湖区文创社区，咖啡、手作与现场演出在旧空间里重新生长。',
    image: '/assets/images/posters/ayunduocang/greenbelt.jpg', imageCredit: 'Vlog 抽帧',
    audio: rec('ayunduocang/greenbelt'), vlog: clip('ayunduocang/greenbelt'),
    splat: {
      status: 'ready', src: '/assets/splats/ayunduocang.ply', up: [-1, 0, 0],
      camera: { position: [0.7929, 2.9277, 1.5983], yaw: 0.6, pitch: -0.112 },
    },
    subSpots: [
      {
        id: 'grill-house', name: '烤肉店', icon: '烤', lat: 26.6403, lng: 106.6462,
        pixel: { x: 679, y: 520 },
        description: '烤盘滋滋作响，夜里最先热闹起来的一角。',
        image: '/assets/images/posters/ayunduocang/grill-house.jpg',
        audio: rec('ayunduocang/grill-house'), vlog: clip('ayunduocang/grill-house'),
      },
      {
        id: 'bbq-stall', name: '烧烤摊', icon: '烧', lat: 26.6400, lng: 106.6473,
        pixel: { x: 639, y: 454 },
        description: '露天烧烤摊的炭火与吆喝，贵阳夏夜的标准配置。',
        image: '/assets/images/posters/ayunduocang/bbq-stall.jpg',
        audio: rec('ayunduocang/bbq-stall'), vlog: clip('ayunduocang/bbq-stall'),
      },
      {
        id: 'greenbelt', name: '绿化带', icon: '绿', lat: 26.6392, lng: 106.6476,
        pixel: { x: 691, y: 896 },
        description: '仓区外围的绿化带，虫鸣与远处人声混在一起。',
        image: '/assets/images/posters/ayunduocang/greenbelt.jpg',
        audio: rec('ayunduocang/greenbelt'), vlog: clip('ayunduocang/greenbelt'),
      },
      {
        id: 'silver-shop', name: '银饰店', icon: '银', lat: 26.6390, lng: 106.6461,
        pixel: { x: 587, y: 310 },
        description: '银锤敲打的清脆声，苗银在灯下一点点成形。',
        image: '/assets/images/posters/ayunduocang/silver-shop.jpg',
        audio: rec('ayunduocang/silver-shop'), vlog: clip('ayunduocang/silver-shop'),
      },
      {
        id: 'dining-bar', name: '餐吧', icon: '餐', lat: 26.6401, lng: 106.6455,
        pixel: { x: 641, y: 626 },
        description: '餐吧的杯盏与谈笑，是文创社区的深夜客厅。',
        image: '/assets/images/posters/ayunduocang/dining-bar.jpg',
        audio: rec('ayunduocang/dining-bar'), vlog: clip('ayunduocang/dining-bar'),
      },
      {
        id: 'accessory-shop', name: '饰品店', icon: '饰', lat: 26.6396, lng: 106.6469,
        pixel: { x: 492, y: 392 },
        description: '挑挑拣拣的饰品店，细碎的翻找声与试戴。',
        image: '/assets/images/posters/ayunduocang/accessory-shop.jpg',
        audio: rec('ayunduocang/accessory-shop'), vlog: clip('ayunduocang/accessory-shop'),
      },
      {
        id: 'skate-plaza', name: '滑板广场', icon: '板', lat: 26.6388, lng: 106.6469,
        pixel: { x: 566, y: 730 },
        description: '板轮碾过水泥地的滚动声，年轻人的主场。',
        image: '/assets/images/ayunduocang.jpg', audio: ambience, vlog: noVlog,
      },
    ],
  },
  {
    id: 'guizhou-museum', order: 5, name: '贵州博物馆', icon: '博', color: '#a33d68', lat: 26.6513, lng: 106.6389,
    pixel: { x: 1752, y: 3051 },
    description: '收藏贵州历史、民族与自然记忆，在一座馆里读懂多彩贵州。',
    image: '/assets/images/posters/spots/guizhou-museum.jpg', imageCredit: 'Vlog 抽帧',
    audio: rec('spots/guizhou-museum'), vlog: clip('spots/guizhou-museum'),
    splat: {
      status: 'ready', src: '/assets/splats/guizhou-museum.ply', up: [0, 0, 1],
      camera: { position: [-1.2712, 0.6646, 0.7474], yaw: -2.396, pitch: -0.308 },
    },
  },
  {
    id: 'qingyan-ancient-town', order: 6, name: '青岩古镇', icon: '镇', color: '#a77a25', lat: 26.3378, lng: 106.6856,
    description: '明清军事古镇，石板街巷、城墙与小吃共同保存着花溪南郊的旧时光。',
    image: '/assets/images/qingyan-ancient-town.jpg', imageCredit: '本地占位图',
    audio: ambience, vlog: noVlog, splat: unavailableSplat,
  },
  {
    id: 'huaxi-park', order: 7, name: '花溪公园', icon: '花', color: '#258b82', lat: 26.4344, lng: 106.6736,
    description: '沿花溪河展开的园林湿地，十里河滩与坝上桥在春日最盛。',
    image: '/assets/images/huaxi-park.jpg', imageCredit: '本地占位图',
    audio: ambience, vlog: noVlog, splat: unavailableSplat,
  },
  {
    id: 'tianhetan', order: 8, name: '天河潭', icon: '潭', color: '#397ba1', lat: 26.3914, lng: 106.6278,
    description: '喀斯特水上石林，溶洞暗河与碧水相连，可乘船也可沿峡谷步行。',
    image: '/assets/images/tianhetan.jpg', imageCredit: '本地占位图',
    audio: ambience, vlog: noVlog, splat: unavailableSplat,
  },
  {
    id: 'huangguoshu-waterfall', order: 9, name: '黄果树瀑布', icon: '瀑', color: '#168384', lat: 25.9922, lng: 105.6678,
    description: '中国最大的瀑布群之一，自贵阳向西约两小时，在水雾与轰鸣中感受山河。',
    image: '/assets/images/huangguoshu-waterfall.jpg', imageCredit: '本地占位图',
    audio: ambience, vlog: noVlog,
    splat: {
      status: 'ready', src: '/assets/splats/huangguoshu-waterfall.ply', up: [0, -1, 0],
      camera: { position: [1.4695, -4.2715, -0.201], yaw: -4.5298, pitch: -0.4042 },
    },
  },
  {
    id: 'minzu-museum', order: 10, name: '贵州省民族博物馆', icon: '民', color: '#3f6fa8', lat: 26.5745, lng: 106.7115,
    description: '以贵州十七个世居民族的服饰、银饰与节庆为主线，夜里门前是另一种城市声音。',
    image: '/assets/images/posters/spots/minzu-museum.jpg', imageCredit: 'Vlog 抽帧',
    audio: rec('spots/minzu-museum'), vlog: clip('spots/minzu-museum'), splat: unavailableSplat,
  },
];

export function getSpot(id) {
  return spots.find((spot) => spot.id === id);
}

export function hasSubMap(spot) {
  return Boolean(spot?.subSpots?.length);
}

export function getSubSpot(spot, subId) {
  return spot?.subSpots?.find((sub) => sub.id === subId);
}
