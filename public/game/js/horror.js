// ============================================================
// horror.js — 恐怖导演系统（HorrorDirector）
// 原则：安静 → 小异常 → 平静 → 升级。不连续轰炸，安全区低烈度。
// ============================================================
import { AudioSys, pick, clamp } from './engine.js';

export class HorrorDirector {
  constructor(game) {
    this.g = game;
    this.cooldown = 22;        // 距下一次事件
    this.lastLevel = 0;
    this.recent = [];          // 最近事件 id，去重
    this.idleT = 0;            // 玩家停留计时
    this.lastPos = { x: 0, y: 0 };
  }

  reset() { this.cooldown = 20 + Math.random() * 14; this.idleT = 0; }

  update(dt) {
    const g = this.g;
    if (g.state !== 'play' || !g.map) return;
    const p = g.player;

    // 停留检测
    const moved = Math.hypot(p.x - this.lastPos.x, p.y - this.lastPos.y);
    this.lastPos = { x: p.x, y: p.y };
    this.idleT = moved < 4 * dt * 60 ? this.idleT + dt : 0;

    this.cooldown -= dt * this._tension();
    if (this.cooldown > 0) return;

    const ev = this._pickEvent();
    if (ev) {
      this.fire(ev);
      this.recent.push(ev);
      if (this.recent.length > 4) this.recent.shift();
    }
    // 高强度后留更长的安静
    const base = this.lastLevel >= 3 ? 50 : this.lastLevel === 2 ? 34 : 22;
    this.cooldown = base * (0.7 + Math.random() * 0.7);
  }

  // 紧张系数：理智低、阴蚀高、黑暗中 → 事件更频繁
  _tension() {
    const g = this.g;
    let k = 1;
    if (g.pstats.san < 55) k += 0.5;
    if (g.pstats.san < 30) k += 0.6;
    if (g.pstats.yin >= 40) k += 0.4;
    if (!g.player.lampOn) k += 0.35;
    if (g.map?.def.safe) k *= 0.35;
    if (this.idleT > 8) k += 0.4; // 站着不动，它就来看你
    return k;
  }

  _pickEvent() {
    const g = this.g;
    const safe = !!g.map.def.safe;
    const soft = g.settings.horrorReduce;
    const sanLow = g.pstats.san < 50;
    const pool = [];
    const add = (id, w) => { if (!this.recent.includes(id)) pool.push([id, w]); };

    // 一级：不确定
    add('steps', 3); add('flicker', 3); add('creak', 3); add('whisper1', 2);
    if (g.map.def.rain) add('thunder_far', 2);
    // 二级：明确异常
    if (!safe) { add('name_call', sanLow ? 3 : 1); add('sob_far', 2); add('paper_rustle', 2); }
    if (safe) add('home_anomaly', 1.2);
    // 三级：威胁（减弱模式 / 安全区不出）
    if (!safe && !soft) {
      if (this.lastLevel < 2) { /* 刚平静过才允许 */
        add('lights_low', sanLow ? 1.6 : 0.8);
        if (g.pstats.yin >= 30) add('shade_stalk', 1.0);
      }
    }
    if (!pool.length) return null;
    let total = 0; for (const [, w] of pool) total += w;
    let r = Math.random() * total;
    for (const [id, w] of pool) { r -= w; if (r <= 0) return id; }
    return pool[0][0];
  }

  fire(id) {
    const g = this.g;
    switch (id) {
      case 'steps': {
        this.lastLevel = 1;
        let n = 0;
        const iv = setInterval(() => {
          AudioSys.sfx('step', { alt: n % 2 === 0, vol: 0.35 });
          if (++n > 4) clearInterval(iv);
        }, 360);
        g.ui.sub('（身后多出半拍脚步声。）', 2.6);
        break;
      }
      case 'flicker': {
        this.lastLevel = 1;
        g.flickerT = 1.2;
        AudioSys.sfx('fire', { vol: 0.5 });
        break;
      }
      case 'creak': this.lastLevel = 1; AudioSys.sfx('creak', { vol: 0.7 }); break;
      case 'whisper1': this.lastLevel = 1; AudioSys.sfx('whisper', { vol: 0.5 }); break;
      case 'thunder_far': {
        this.lastLevel = 1;
        AudioSys.sfx('thunder', { vol: 0.4 });
        g.R.flash('rgba(180,200,230,0.25)', 0.1);
        break;
      }
      case 'name_call': {
        this.lastLevel = 2;
        AudioSys.sfx('whisper', { vol: 0.8 });
        g.ui.sub('「……归川。」', 3);
        g.addSan(-4);
        break;
      }
      case 'sob_far': {
        this.lastLevel = 2;
        AudioSys.sfx('sob', { vol: 0.8 });
        g.ui.sub('（哭声。分不清方向。）', 3);
        break;
      }
      case 'paper_rustle': {
        this.lastLevel = 2;
        AudioSys.sfx('paper', { vol: 0.9 });
        g.ui.sub('（纸张窸窣，像有人在你耳边翻书。）', 3);
        g.addSan(-2);
        break;
      }
      case 'home_anomaly': {
        this.lastLevel = 2;
        const lines = [
          '（桌上的筷子，换了个方向。）',
          '（檐下的灯笼自己转了半圈。）',
          '（你听见里屋有人轻轻放下碗。）',
          '（地上有一行湿脚印，到墙根就没了。）',
        ];
        g.ui.sub(pick(Math.random, lines), 3.4);
        AudioSys.sfx('creak', { vol: 0.5 });
        break;
      }
      case 'lights_low': {
        this.lastLevel = 3;
        g.lampSuppressT = 6;
        g.ui.sub('（火苗忽然伏低——有东西在借你的光走路。）', 3.2);
        AudioSys.sfx('stinger', { vol: 0.5 });
        g.addSan(-5);
        break;
      }
      case 'shade_stalk': {
        this.lastLevel = 3;
        g.spawnStalker();
        break;
      }
      default: break;
    }
  }
}
