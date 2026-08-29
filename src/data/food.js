// 美食标签固定在贵阳中心，避开甲秀楼与青云市集的 marker。
export const foodMarker = {
  id: 'guiyang-food', name: '贵阳美食', icon: '食', color: '#d1552f',
  lat: 26.5810, lng: 106.7080, pixel: { x: 509, y: 2021 }, markerClass: 'sound-marker--food',
  description: '冰浆、烙锅、酸汤火锅——在贵阳，声音里最先冒出来的往往是锅气。',
  image: '/assets/images/posters/food/luoguo.jpg',
};

export const foods = [
  {
    id: 'bingjiang', name: '冰浆', tag: '街头甜品',
    description: '现打的糯米冰浆，加一勺红豆或芒果，是贵阳人夏天的第一口凉。',
    audio: { status: 'ready', src: '/assets/audio/food/bingjiang.mp3' },
    vlog: {
      status: 'ready',
      src: '/assets/video/food/bingjiang.mp4',
      poster: '/assets/images/posters/food/bingjiang.jpg',
    },
  },
  {
    id: 'luoguo', name: '烙锅', tag: '夜宵主场',
    description: '中间凸起的黑砂锅，肉片与素菜贴上去，油香顺着锅沿一路滑下来。',
    audio: { status: 'ready', src: '/assets/audio/food/luoguo.mp3' },
    vlog: {
      status: 'ready',
      src: '/assets/video/food/luoguo.mp4',
      poster: '/assets/images/posters/food/luoguo.jpg',
    },
  },
  {
    id: 'suantang-hotpot', name: '贵州酸汤火锅', tag: '一桌人的仪式',
    description: '红酸汤翻滚，配折耳根蘸水，是贵州味道里最直接的那一味。',
    audio: { status: 'ready', src: '/assets/audio/food/suantang-hotpot.mp3' },
    vlog: {
      status: 'ready',
      src: '/assets/video/food/suantang-hotpot.mp4',
      poster: '/assets/images/posters/food/suantang-hotpot.jpg',
    },
  },
];
