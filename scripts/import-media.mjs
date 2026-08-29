#!/usr/bin/env node
// 把 ref/ 下的真实录制素材与 3dGS 场景导入 public/assets/，统一改为 ASCII slug 命名。
// ref/ 不进版本库且运行时不可读，所以数据层只引用本脚本产出的文件。
import { execFile } from 'node:child_process';
import { copyFile, mkdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { promisify } from 'node:util';

const run = promisify(execFile);
const root = resolve(import.meta.dirname, '..');
const recordings = resolve(root, 'ref/音频以及vlog/听见贵阳-素材/真实录制');
const aiImagine = resolve(root, 'ref/音频以及vlog/听见贵阳-素材/AI想象');
const publicDir = resolve(root, 'public');

// [来源目录, 源文件主名, slug]
const clips = [
  ['甲秀楼（8.28晚）', '甲秀楼（8.28晚）', 'spots/jiaxiu-tower'],
  ['贵州省博物馆', '贵州省博物馆', 'spots/guizhou-museum'],
  ['民族博物馆(夜间城市环境）8.28', '民族博物馆(夜间城市环境）8.28', 'spots/minzu-museum'],

  ['青云集市-8.28', '青云集市-8.28', 'qingyun-market/main'],
  ['青云集市咖啡厅-8.28', '青云集市咖啡厅-8.28', 'qingyun-market/cafe'],
  ['青云集市钢琴角8,28', '青云集市钢琴角8,28', 'qingyun-market/piano'],

  ['阿云朵仓烤肉店8.28', '阿云朵仓烤肉店8.28', 'ayunduocang/grill-house'],
  ['阿云朵仓烧烤摊8.28', '阿云朵仓烧烤摊8.28', 'ayunduocang/bbq-stall'],
  ['阿云朵仓绿化带', '阿云朵仓绿化带', 'ayunduocang/greenbelt'],
  ['阿云朵仓银饰店8.28', '阿云朵仓银饰店8.28', 'ayunduocang/silver-shop'],
  ['阿云朵仓闹市中的银饰-8.28', '闹市中的银饰-8.28', 'ayunduocang/silver-street'],
  ['阿云朵仓餐吧8.28', '阿云朵仓餐吧8.28', 'ayunduocang/dining-bar'],
  ['阿云朵仓饰品店8.28', '阿云朵仓饰品店8.28', 'ayunduocang/accessory-shop'],

  ['美食-冰浆-8.28', '冰浆-8.28', 'food/bingjiang'],
  ['美食-烙锅-8.29', '烙锅-8.29', 'food/luoguo'],
  ['美食-贵州酸汤火锅2.28', '贵州酸汤火锅2.28', 'food/suantang-hotpot'],
];

const splats = [['ref/3dGS/阿云朵仓.ply', 'assets/splats/ayunduocang.ply']];

// AI 想象音轨：整段 wav 拷入 lab 目录，供地图页「声音实验室」融合播放。
// [源文件主名, slug]
const aiClips = [
  ['侗寨鼓楼环境音_30秒', 'dong-drum-tower-ambience'],
  ['侗族大歌_鼓楼氛围吟唱_30秒', 'dong-grand-song'],
  ['侗族木构营造木工声_17秒', 'dong-carpentry'],
  ['安顺地戏锣鼓_15秒', 'ansun-opera-gongs'],
  ['苗岭清晨环境音_30秒', 'miaoling-morning'],
  ['苗族芦笙芒筒合奏_18秒', 'miao-lusheng-mangtong'],
  ['苗族银饰锻制_16秒', 'miao-silver-forging'],
  ['苗族飞歌_山谷女声吟唱_20秒', 'miao-flying-song'],
  ['贵州山林村寨环境基底_20秒', 'guizhou-forest-village'],
  ['贵州蜡染坊环境音_加强版_30秒', 'guizhou-batik-workshop'],
];

async function ensureDir(file) {
  await mkdir(dirname(file), { recursive: true });
}

async function copyInto(from, to) {
  if (!existsSync(from)) return false;
  await ensureDir(to);
  await copyFile(from, to);
  return true;
}

async function extractPoster(video, poster) {
  await ensureDir(poster);
  const { stdout } = await run('ffprobe', [
    '-v', 'error', '-show_entries', 'format=duration',
    '-of', 'default=noprint_wrappers=1:nokey=1', video,
  ]);
  const duration = Number.parseFloat(stdout.trim()) || 0;
  // 开头常是举起相机的抖动帧，取靠前但已稳定的一帧。
  const at = duration > 4 ? Math.min(duration * 0.25, 6) : duration / 2;
  await run('ffmpeg', [
    '-y', '-loglevel', 'error', '-ss', at.toFixed(2), '-i', video,
    '-frames:v', '1', '-vf', 'scale=960:-2', '-q:v', '4', poster,
  ]);
}

async function main() {
  const missing = [];
  let audioCount = 0;
  let videoCount = 0;
  let posterCount = 0;
  let labCount = 0;

  for (const [folder, base, slug] of clips) {
    const srcAudio = resolve(recordings, folder, `${base}.mp3`);
    const srcVideo = resolve(recordings, folder, `${base}.mp4`);
    const outAudio = resolve(publicDir, `assets/audio/${slug}.mp3`);
    const outVideo = resolve(publicDir, `assets/video/${slug}.mp4`);
    const outPoster = resolve(publicDir, `assets/images/posters/${slug}.jpg`);

    if (await copyInto(srcAudio, outAudio)) audioCount += 1;
    else missing.push(`${folder}/${base}.mp3`);

    if (await copyInto(srcVideo, outVideo)) {
      videoCount += 1;
      await extractPoster(outVideo, outPoster);
      posterCount += 1;
    } else {
      missing.push(`${folder}/${base}.mp4`);
    }
  }

  for (const [base, slug] of aiClips) {
    const outWav = resolve(publicDir, `assets/audio/lab/ai/${slug}.wav`);
    if (await copyInto(resolve(aiImagine, `${base}.wav`), outWav)) labCount += 1;
    else missing.push(`AI想象/${base}.wav`);
  }

  for (const [from, to] of splats) {
    const target = resolve(publicDir, to);
    if (existsSync(target) && (await stat(target)).size > 0) continue;
    if (!(await copyInto(resolve(root, from), target))) missing.push(from);
  }

  console.log(`audio ${audioCount} · video ${videoCount} · poster ${posterCount} · lab ${labCount} · splat ${splats.length}`);
  if (missing.length) console.warn(`缺失素材（保持“素材准备中”占位）：\n  ${missing.join('\n  ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
