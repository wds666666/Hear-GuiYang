import test from 'node:test';
import assert from 'node:assert/strict';
import { isAndroid, isWeChat } from '../src/wechat-gate.js';

test('detects WeChat and Android from UA', () => {
  assert.equal(isWeChat('Mozilla/5.0 MicroMessenger/8.0.49 Language/zh_CN'), true);
  assert.equal(isWeChat('Mozilla/5.0 (iPhone) Safari/604.1'), false);
  assert.equal(isAndroid('Linux; Android 13; Pixel 7 MicroMessenger/8.0'), true);
  assert.equal(isAndroid('iPhone OS 17_0 MicroMessenger/8.0.49'), false);
});
