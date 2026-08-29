// 声音实验室素材：AI 想象音轨（import-media.mjs 产出的 wav）
// 与真实采集（复用 public/assets 里已有的 mp3，不重复拷贝）。

export const aiSounds = [
  { id: 'dong-drum-tower-ambience', name: '侗寨鼓楼环境音', tag: '30 秒', src: '/assets/audio/lab/ai/dong-drum-tower-ambience.wav' },
  { id: 'dong-grand-song', name: '侗族大歌 · 鼓楼吟唱', tag: '30 秒', src: '/assets/audio/lab/ai/dong-grand-song.wav' },
  { id: 'dong-carpentry', name: '侗族木构营造木工声', tag: '17 秒', src: '/assets/audio/lab/ai/dong-carpentry.wav' },
  { id: 'ansun-opera-gongs', name: '安顺地戏锣鼓', tag: '15 秒', src: '/assets/audio/lab/ai/ansun-opera-gongs.wav' },
  { id: 'miaoling-morning', name: '苗岭清晨环境音', tag: '30 秒', src: '/assets/audio/lab/ai/miaoling-morning.wav' },
  { id: 'miao-lusheng-mangtong', name: '苗族芦笙芒筒合奏', tag: '18 秒', src: '/assets/audio/lab/ai/miao-lusheng-mangtong.wav' },
  { id: 'miao-silver-forging', name: '苗族银饰锻制', tag: '16 秒', src: '/assets/audio/lab/ai/miao-silver-forging.wav' },
  { id: 'miao-flying-song', name: '苗族飞歌 · 山谷女声', tag: '20 秒', src: '/assets/audio/lab/ai/miao-flying-song.wav' },
  { id: 'guizhou-forest-village', name: '贵州山林村寨基底', tag: '20 秒', src: '/assets/audio/lab/ai/guizhou-forest-village.wav' },
  { id: 'guizhou-batik-workshop', name: '贵州蜡染坊环境音', tag: '30 秒', src: '/assets/audio/lab/ai/guizhou-batik-workshop.wav' },
];

export const realSounds = [
  { id: 'jiaxiu-tower', name: '甲秀楼 · 夜色水声', tag: '现场', src: '/assets/audio/spots/jiaxiu-tower.mp3' },
  { id: 'minzu-museum', name: '民族博物馆 · 夜间城市', tag: '现场', src: '/assets/audio/spots/minzu-museum.mp3' },
  { id: 'guizhou-museum', name: '贵州省博物馆 · 馆内', tag: '现场', src: '/assets/audio/spots/guizhou-museum.mp3' },
  { id: 'qingyun-main', name: '青云集市 · 市声', tag: '现场', src: '/assets/audio/qingyun-market/main.mp3' },
  { id: 'qingyun-cafe', name: '青云集市 · 咖啡厅', tag: '现场', src: '/assets/audio/qingyun-market/cafe.mp3' },
  { id: 'qingyun-piano', name: '青云集市 · 钢琴角', tag: '现场', src: '/assets/audio/qingyun-market/piano.mp3' },
  { id: 'ayun-greenbelt', name: '阿云朵仓 · 绿化带', tag: '现场', src: '/assets/audio/ayunduocang/greenbelt.mp3' },
  { id: 'ayun-silver-shop', name: '阿云朵仓 · 银饰店', tag: '现场', src: '/assets/audio/ayunduocang/silver-shop.mp3' },
  { id: 'food-bingjiang', name: '街头冰浆 · 打浆声', tag: '现场', src: '/assets/audio/food/bingjiang.mp3' },
  { id: 'food-luoguo', name: '夜市烙锅 · 油爆声', tag: '现场', src: '/assets/audio/food/luoguo.mp3' },
];
