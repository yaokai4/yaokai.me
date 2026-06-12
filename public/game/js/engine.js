// ============================================================
// 《盗墓往事》Tales Beneath the Tomb — engine.js
// 核心引擎：工具 / 事件总线 / 输入 / 音频合成 / 资源 / 存档 / 本地化
// ============================================================

export const TAU = Math.PI * 2;
export const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
export const lerp = (a, b, t) => a + (b - a) * t;
export const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
export const angTo = (ax, ay, bx, by) => Math.atan2(by - ay, bx - ax);

// 角度差，归一化到 [-PI, PI]
export function angDiff(a, b) {
  let d = (b - a) % TAU;
  if (d > Math.PI) d -= TAU;
  if (d < -Math.PI) d += TAU;
  return d;
}

// 可复现随机（mulberry32）
export function makeRng(seed) {
  let s = seed >>> 0;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const pick = (rng, arr) => arr[Math.floor(rng() * arr.length)];
export const rngi = (rng, a, b) => a + Math.floor(rng() * (b - a + 1));

let uidCounter = 1;
export const uid = () => 'u' + (uidCounter++) + '_' + Date.now().toString(36);

// ------------------------------------------------------------
// 事件总线
// ------------------------------------------------------------
export const Bus = {
  _m: new Map(),
  on(ev, fn) {
    if (!this._m.has(ev)) this._m.set(ev, []);
    this._m.get(ev).push(fn);
    return fn;
  },
  off(ev, fn) {
    const l = this._m.get(ev);
    if (l) { const i = l.indexOf(fn); if (i >= 0) l.splice(i, 1); }
  },
  emit(ev, data) {
    const l = this._m.get(ev);
    if (l) for (const fn of l.slice()) fn(data);
  },
};

// ------------------------------------------------------------
// 本地化（所有 UI 文本走 Key；叙事文本在 data_story 中按结构组织）
// ------------------------------------------------------------
const STRINGS = {
  zh: {
    'app.title': '盗墓往事',
    'app.subtitle': 'Tales Beneath the Tomb',
    'app.tagline': '有些人被埋进坟墓，有些往事被埋进活人的心里。',
    'menu.new': '新游戏',
    'menu.continue': '继续往事',
    'menu.settings': '设置',
    'menu.about': '关于',
    'menu.back': '返回',
    'menu.resume': '继续游戏',
    'menu.save': '记录往事（存档）',
    'menu.quit': '回到标题',
    'menu.confirm_new': '已有旧的存档。开始新游戏会覆盖它，确定吗？',
    'menu.yes': '确定',
    'menu.no': '取消',
    'loading': '点灯中…',
    'loading.tip': '戴上耳机，熄掉房间的灯。',
    'set.master': '主音量',
    'set.music': '音乐',
    'set.sfx': '音效',
    'set.amb': '环境音',
    'set.horror': '恐怖强度',
    'set.horror.std': '标准',
    'set.horror.soft': '减弱（降低跳吓与闪烁）',
    'set.hints': '谜题提示',
    'set.hints.off': '无提示',
    'set.hints.std': '标准',
    'set.hints.strong': '强提示',
    'set.shake': '屏幕震动',
    'set.on': '开',
    'set.off': '关',
    'set.lang': '语言',
    'set.joy': '虚拟摇杆大小',
    'set.reset': '清除全部数据',
    'set.reset.confirm': '将删除存档与设置，确定？',
    'about.text': '《盗墓往事》Web 完整版 —— 序章、八个主要章节、终章与七结局。\n\n一款中式恐怖盗墓 ARPG。支持键盘鼠标、手柄与触屏，内置难度、提示和无障碍设置。\n\n本作中的盗墓内容为虚构叙事，不构成任何现实指引；请尊重文物与历史。\n\n美术 / 程序 / 音频合成：TBT 项目组。',
    'hud.objective': '目标',
    'hud.interact': '调查',
    'hud.money': '纸钱',
    'ui.inventory': '行囊',
    'ui.journal': '札记',
    'ui.equip': '装备',
    'ui.use': '使用',
    'ui.drop': '丢弃',
    'ui.close': '关闭',
    'ui.clues': '线索',
    'ui.rules': '规矩',
    'ui.tapes': '磁带',
    'ui.artifacts': '文物',
    'ui.none': '（暂无）',
    'ui.equipped': '已装备',
    'ui.weapon': '主手',
    'ui.charm': '护符',
    'ui.lamp': '灯具',
    'ui.compare': '当前',
    'ui.play_tape': '播放',
    'ui.repair': '修复',
    'ui.repaired': '已修复',
    'ui.need_mat': '缺少材料',
    'ui.buy': '买下',
    'ui.shop_no_money': '纸钱不够。',
    'death.title': '你倒在了黑暗里',
    'death.hint': '魂魄被长明灯接住了。未带回的纸钱散落了一些。',
    'death.respawn': '回到灯下',
    'tape.stop': '停止',
    'cine.skip': '跳过 ▸',
    'tut.move': '移动：WASD / 方向键（手机：左侧摇杆）',
    'tut.attack': '攻击：J 或 鼠标左键（手机：⚔ 键）',
    'tut.dodge': '翻滚：空格 / K（手机：⊙ 键）。翻滚有无敌帧',
    'tut.heavy': '重击：长按攻击蓄力，可打断敌人',
    'tut.lamp': '提灯：F 开关。黑暗会侵蚀理智，但有些东西怕光，也有些东西循光而来',
    'tut.stamina': '体力耗尽时无法攻击与翻滚，注意黄色体力条',
    'tut.ghost': '红衣影这类灵体几乎不吃铁器。试试换上桃木剑（打开行囊 I / 🎒）',
    'tut.sanity': '理智下降时，你看到的东西未必是真的',
    'tut.interact': '靠近发光的物件，按 E 调查（手机：🔍 键）',
    'ending.title': '章节结算',
    'ending.tbc': '下一章已解锁。回到老宅，在线索墙继续调查。',
    'ending.stats': '本次下墓',
    'ending.time': '用时',
    'ending.deaths': '死亡',
    'ending.kills': '击杀',
    'ending.clues': '线索',
    'ending.yin': '阴蚀',
    'rotate.hint': '横屏体验更佳',
    'pause.title': '暂停',
    'saved': '往事已记下。',
  },
  en: {},
};
let LANG = 'zh';
export function setLang(l) { LANG = STRINGS[l] ? l : 'zh'; }
export function t(key) {
  return (STRINGS[LANG] && STRINGS[LANG][key]) || STRINGS.zh[key] || key;
}

// ------------------------------------------------------------
// 输入：键盘 / 鼠标 / 触屏（摇杆与按钮为 DOM 元素，挂在 #touch）
// 动作: attack heavy dodge interact lamp inventory journal pause confirm
// ------------------------------------------------------------
const DEFAULT_KEYMAP = {
  KeyW: 'up', ArrowUp: 'up',
  KeyS: 'down', ArrowDown: 'down',
  KeyA: 'left', ArrowLeft: 'left',
  KeyD: 'right', ArrowRight: 'right',
  KeyJ: 'attack', Enter: 'confirm',
  KeyK: 'dodge', Space: 'dodge',
  KeyQ: 'block',
  KeyE: 'interact',
  KeyF: 'lamp',
  KeyR: 'skill1',
  KeyT: 'skill2',
  KeyH: 'heal',
  KeyC: 'switch',
  KeyX: 'turn',
  KeyZ: 'lock',
  KeyI: 'inventory', Tab: 'inventory',
  KeyL: 'journal',
  Escape: 'pause',
};
const KEYMAP = { ...DEFAULT_KEYMAP };

export const Input = {
  _down: new Set(),
  _pressed: new Set(),
  _joy: { active: false, x: 0, y: 0, id: -1, ox: 0, oy: 0 },
  _btnDown: new Set(),
  _btnPressed: new Set(),
  mouse: { x: 0, y: 0, down: false, clicked: false },
  attackHeld: 0, // 蓄力计时（秒）
  lastDevice: 'kb',
  _padPrev: new Set(),

  init(canvas) {
    window.addEventListener('keydown', (e) => {
      const a = KEYMAP[e.code];
      if (a) {
        e.preventDefault();
        if (!this._down.has(a)) this._pressed.add(a);
        this._down.add(a);
        this.lastDevice = 'kb';
      }
    });
    window.addEventListener('keyup', (e) => {
      const a = KEYMAP[e.code];
      if (a) this._down.delete(a);
    });
    window.addEventListener('blur', () => { this._down.clear(); this._joy.active = false; });

    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        this.mouse.down = true; this.mouse.clicked = true;
        if (!this._down.has('attack')) this._pressed.add('attack');
        this._down.add('attack');
        this.lastDevice = 'kb';
      }
    });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) { this.mouse.down = false; this._down.delete('attack'); }
    });
    canvas.addEventListener('mousemove', (e) => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = (e.clientX - r.left) / r.width;
      this.mouse.y = (e.clientY - r.top) / r.height;
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    this._initTouch();
  },

  _initTouch() {
    const wrap = document.getElementById('touch');
    if (!wrap) return;
    const stick = document.getElementById('joy');
    const knob = document.getElementById('joyknob');
    const self = this;

    function joyMove(t) {
      const r = stick.getBoundingClientRect();
      const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      let dx = t.clientX - cx, dy = t.clientY - cy;
      const max = r.width / 2;
      const len = Math.hypot(dx, dy);
      if (len > max) { dx = dx / len * max; dy = dy / len * max; }
      self._joy.x = dx / max; self._joy.y = dy / max;
      knob.style.transform = `translate(${dx}px,${dy}px)`;
    }
    stick.addEventListener('touchstart', (e) => {
      e.preventDefault();
      self.lastDevice = 'touch';
      const t = e.changedTouches[0];
      self._joy.active = true; self._joy.id = t.identifier;
      joyMove(t);
    }, { passive: false });
    stick.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (const t of e.changedTouches) if (t.identifier === self._joy.id) joyMove(t);
    }, { passive: false });
    const joyEnd = (e) => {
      for (const t of e.changedTouches) if (t.identifier === self._joy.id) {
        self._joy.active = false; self._joy.x = 0; self._joy.y = 0;
        knob.style.transform = 'translate(0,0)';
      }
    };
    stick.addEventListener('touchend', joyEnd);
    stick.addEventListener('touchcancel', joyEnd);

    for (const btn of wrap.querySelectorAll('[data-act]')) {
      const act = btn.dataset.act;
      const down = (e) => {
        e.preventDefault();
        self.lastDevice = 'touch';
        btn.classList.add('on');
        if (!self._down.has(act)) self._pressed.add(act);
        self._down.add(act);
      };
      const end = (e) => { e.preventDefault(); btn.classList.remove('on'); self._down.delete(act); };
      btn.addEventListener('pointerdown', down, { passive: false });
      btn.addEventListener('pointerup', end, { passive: false });
      btn.addEventListener('pointercancel', end, { passive: false });
      btn.addEventListener('pointerleave', end, { passive: false });
      btn.addEventListener('touchstart', down, { passive: false });
      btn.addEventListener('touchend', end, { passive: false });
      btn.addEventListener('touchcancel', end, { passive: false });
    }
  },

  axis() {
    let x = 0, y = 0;
    if (this._down.has('left')) x -= 1;
    if (this._down.has('right')) x += 1;
    if (this._down.has('up')) y -= 1;
    if (this._down.has('down')) y += 1;
    if (this._joy.active) { x = this._joy.x; y = this._joy.y; }
    const len = Math.hypot(x, y);
    if (len > 1) { x /= len; y /= len; }
    return { x, y };
  },
  updateGamepad() {
    const pad = navigator.getGamepads?.()[0];
    if (!pad) return;
    const map = { 0: 'attack', 1: 'dodge', 2: 'interact', 3: 'skill1', 4: 'block', 5: 'switch', 8: 'inventory', 9: 'pause', 12: 'heal', 13: 'lamp' };
    const now = new Set();
    for (const [idx, act] of Object.entries(map)) {
      if (pad.buttons[Number(idx)]?.pressed) {
        now.add(act);
        this._down.add(act);
        if (!this._padPrev.has(act)) this._pressed.add(act);
      } else if (this._padPrev.has(act)) {
        this._down.delete(act);
      }
    }
    const dead = 0.18;
    const x = Math.abs(pad.axes[0] || 0) > dead ? pad.axes[0] : 0;
    const y = Math.abs(pad.axes[1] || 0) > dead ? pad.axes[1] : 0;
    if (x || y) {
      this.lastDevice = 'gamepad';
      this._joy.active = true;
      this._joy.x = x;
      this._joy.y = y;
    } else if (this.lastDevice === 'gamepad') {
      this._joy.active = false;
      this._joy.x = 0;
      this._joy.y = 0;
    }
    this._padPrev = now;
  },
  applyBindings(bindings = {}) {
    for (const key of Object.keys(KEYMAP)) delete KEYMAP[key];
    Object.assign(KEYMAP, DEFAULT_KEYMAP);
    for (const [action, code] of Object.entries(bindings)) {
      for (const key of Object.keys(KEYMAP)) if (KEYMAP[key] === action) delete KEYMAP[key];
      if (code) KEYMAP[code] = action;
    }
  },
  primaryCode(action) {
    return Object.entries(KEYMAP).find(([, a]) => a === action)?.[0] || '';
  },
  down(a) { return this._down.has(a); },
  pressed(a) { return this._pressed.has(a); },
  consume(a) { this._pressed.delete(a); },
  endFrame() { this._pressed.clear(); this.mouse.clicked = false; },
  clearAll() { this._down.clear(); this._pressed.clear(); },
};

// ------------------------------------------------------------
// 音频：全部 WebAudio 合成，无外部文件
// 总线: master -> music / sfx / amb
// ------------------------------------------------------------
export const AudioSys = {
  ctx: null, buses: {}, _noise: null,
  _amb: {}, _musicTimer: null, _musicMood: 'none',
  _heart: { on: false, next: 0, rate: 1 },
  _tape: null,
  unlocked: false,

  init() {
    if (this.ctx) { if (this.ctx.state === 'suspended') this.ctx.resume(); this.unlocked = true; return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    const mk = (parent) => { const g = this.ctx.createGain(); g.connect(parent); return g; };
    this.buses.master = mk(this.ctx.destination);
    this.buses.music = mk(this.buses.master);
    this.buses.sfx = mk(this.buses.master);
    this.buses.amb = mk(this.buses.master);
    // 共享噪声缓冲
    const len = this.ctx.sampleRate * 2;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    this._noise = buf;
    this.unlocked = true;
  },

  setVol(bus, v) { if (this.buses[bus]) this.buses[bus].gain.value = v; },

  _noiseSrc(loop = true) {
    const s = this.ctx.createBufferSource();
    s.buffer = this._noise; s.loop = loop;
    return s;
  },

  // ---------- 环境音层 ----------
  ambient(name, on, vol = 1) {
    if (!this.ctx) return;
    const cur = this._amb[name];
    if (on && cur) { cur.gain.gain.linearRampToValueAtTime(vol * cur.base, this.ctx.currentTime + 1); return; }
    if (!on) {
      if (cur) {
        cur.gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1.2);
        const nodes = cur.nodes;
        setTimeout(() => nodes.forEach(n => { try { n.stop(); } catch (e) {} }), 1500);
        delete this._amb[name];
      }
      return;
    }
    const c = this.ctx, g = c.createGain();
    g.gain.value = 0; g.connect(this.buses.amb);
    const nodes = [];
    let base = 0.5;
    if (name === 'rain') {
      base = 0.55;
      const n = this._noiseSrc(), f = c.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 1600; f.Q.value = 0.4;
      n.connect(f); f.connect(g); n.start(); nodes.push(n);
      const n2 = this._noiseSrc(), f2 = c.createBiquadFilter();
      f2.type = 'highpass'; f2.frequency.value = 5000;
      const g2 = c.createGain(); g2.gain.value = 0.25;
      n2.connect(f2); f2.connect(g2); g2.connect(g); n2.start(); nodes.push(n2);
    } else if (name === 'wind') {
      base = 0.4;
      const n = this._noiseSrc(), f = c.createBiquadFilter();
      f.type = 'lowpass'; f.frequency.value = 320; f.Q.value = 1.4;
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 0.13; lg.gain.value = 160;
      lfo.connect(lg); lg.connect(f.frequency); lfo.start();
      n.connect(f); f.connect(g); n.start(); nodes.push(n, lfo);
    } else if (name === 'drone') {
      base = 0.32;
      for (const [fr, dt] of [[54, 0], [54.7, 0], [108.2, 0]]) {
        const o = c.createOscillator(); o.type = 'sine'; o.frequency.value = fr; o.detune.value = dt;
        const og = c.createGain(); og.gain.value = fr > 100 ? 0.12 : 0.3;
        o.connect(og); og.connect(g); o.start(); nodes.push(o);
      }
    } else if (name === 'drip') {
      base = 0.5;
      const iv = setInterval(() => {
        if (!this._amb[name]) { clearInterval(iv); return; }
        if (Math.random() < 0.4) this.sfx('drip');
      }, 1700);
      nodes.push({ stop() { clearInterval(iv); } });
    } else if (name === 'crickets') {
      base = 0.18;
      const n = this._noiseSrc(), f = c.createBiquadFilter();
      f.type = 'bandpass'; f.frequency.value = 4200; f.Q.value = 18;
      const lfo = c.createOscillator(), lg = c.createGain();
      lfo.frequency.value = 11; lg.gain.value = 0.6;
      const vg = c.createGain(); vg.gain.value = 0.4;
      lfo.connect(lg); lg.connect(vg.gain);
      n.connect(f); f.connect(vg); vg.connect(g); n.start(); lfo.start(); nodes.push(n, lfo);
    }
    g.gain.linearRampToValueAtTime(vol * base, c.currentTime + 2);
    this._amb[name] = { gain: g, nodes, base };
  },

  stopAllAmbient() { for (const k of Object.keys(this._amb)) this.ambient(k, false); },

  // ---------- 音效 ----------
  sfx(name, opt = {}) {
    if (!this.ctx) return;
    const c = this.ctx, now = c.currentTime;
    const out = this.buses.sfx;
    const vol = opt.vol ?? 1;
    const env = (g, a, peak, d) => {
      g.gain.setValueAtTime(0, now);
      g.gain.linearRampToValueAtTime(peak * vol, now + a);
      g.gain.exponentialRampToValueAtTime(0.0001, now + a + d);
    };
    const noiseHit = (fStart, fEnd, dur, peak, type = 'bandpass', q = 1) => {
      const n = this._noiseSrc(false), f = c.createBiquadFilter(), g = c.createGain();
      f.type = type; f.Q.value = q;
      f.frequency.setValueAtTime(fStart, now);
      f.frequency.exponentialRampToValueAtTime(Math.max(40, fEnd), now + dur);
      n.connect(f); f.connect(g); g.connect(out);
      env(g, 0.005, peak, dur);
      n.start(now); n.stop(now + dur + 0.1);
    };
    const tone = (type, f0, f1, dur, peak, dest = out) => {
      const o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, now);
      if (f1 !== f0) o.frequency.exponentialRampToValueAtTime(Math.max(20, f1), now + dur);
      o.connect(g); g.connect(dest);
      env(g, 0.008, peak, dur);
      o.start(now); o.stop(now + dur + 0.1);
      return o;
    };
    switch (name) {
      case 'swing': noiseHit(2400, 300, 0.16, 0.35, 'bandpass', 1.2); break;
      case 'swing_heavy': noiseHit(1400, 120, 0.3, 0.5, 'bandpass', 1); tone('sine', 120, 60, 0.25, 0.25); break;
      case 'hit': noiseHit(900, 150, 0.12, 0.6, 'lowpass'); tone('sine', 160, 70, 0.12, 0.5); break;
      case 'hit_paper': noiseHit(3000, 800, 0.18, 0.55, 'highpass'); break;
      case 'hit_ghost': noiseHit(600, 2400, 0.35, 0.3, 'bandpass', 4); tone('sine', 660, 1320, 0.3, 0.12); break;
      case 'crit': noiseHit(1200, 200, 0.2, 0.7, 'lowpass'); tone('square', 220, 90, 0.18, 0.3); break;
      case 'hurt': tone('sawtooth', 200, 80, 0.25, 0.4); noiseHit(800, 200, 0.2, 0.4, 'lowpass'); break;
      case 'dodge': noiseHit(500, 2000, 0.18, 0.25, 'bandpass', 2); break;
      case 'step': noiseHit(opt.alt ? 700 : 500, 150, 0.07, 0.12, 'lowpass'); break;
      case 'step_wood': noiseHit(300, 90, 0.09, 0.2, 'lowpass'); tone('sine', 90, 60, 0.08, 0.12); break;
      case 'pickup': tone('triangle', 520, 780, 0.12, 0.3); tone('triangle', 780, 1040, 0.1, 0.2); break;
      case 'coin': tone('square', 1800, 1800, 0.05, 0.12); tone('square', 2400, 2400, 0.08, 0.1); break;
      case 'potion': tone('sine', 300, 600, 0.3, 0.25); noiseHit(800, 2000, 0.2, 0.1, 'bandpass', 3); break;
      case 'door': noiseHit(180, 60, 0.5, 0.45, 'lowpass'); tone('sine', 70, 45, 0.4, 0.3); break;
      case 'door_locked': tone('square', 140, 120, 0.1, 0.25); tone('square', 110, 100, 0.12, 0.25); break;
      case 'unlock': tone('square', 900, 600, 0.06, 0.2); noiseHit(2000, 500, 0.12, 0.3, 'bandpass', 2); break;
      case 'creak': tone('sawtooth', 90, 240, 1.2, 0.12); break;
      case 'paper': noiseHit(4000, 1500, 0.25, 0.3, 'highpass'); break;
      case 'bell': {
        for (const [f, p, d] of [[523, 0.3, 2.2], [1308, 0.12, 1.4], [786, 0.08, 1.8]]) {
          const o = c.createOscillator(), g = c.createGain();
          o.type = 'sine'; o.frequency.value = f * (opt.pitch ?? 1);
          o.connect(g); g.connect(out);
          g.gain.setValueAtTime(p * vol, now);
          g.gain.exponentialRampToValueAtTime(0.0001, now + d);
          o.start(now); o.stop(now + d);
        }
        break;
      }
      case 'gong': {
        noiseHit(300, 80, 1.6, 0.4, 'lowpass');
        for (const f of [98, 147, 196.5]) tone('sine', f, f * 0.97, 2.4, 0.22);
        break;
      }
      case 'drip': tone('sine', 1200 + Math.random() * 600, 300, 0.18, 0.15); break;
      case 'thunder': {
        const n = this._noiseSrc(false), f = c.createBiquadFilter(), g = c.createGain();
        f.type = 'lowpass'; f.frequency.setValueAtTime(400, now);
        f.frequency.exponentialRampToValueAtTime(60, now + 2.2);
        n.connect(f); f.connect(g); g.connect(out);
        g.gain.setValueAtTime(0.65 * vol, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 2.4);
        n.start(now); n.stop(now + 2.5);
        break;
      }
      case 'whisper': {
        const n = this._noiseSrc(false), f = c.createBiquadFilter(), g = c.createGain();
        f.type = 'bandpass'; f.Q.value = 6;
        f.frequency.setValueAtTime(900, now);
        f.frequency.linearRampToValueAtTime(1900, now + 0.5);
        f.frequency.linearRampToValueAtTime(700, now + 1.1);
        n.connect(f); f.connect(g); g.connect(out);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.16 * vol, now + 0.3);
        g.gain.linearRampToValueAtTime(0, now + 1.3);
        n.start(now); n.stop(now + 1.4);
        break;
      }
      case 'suona': {
        // 唢呐式刺音（章节/危险 stinger）
        const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
        o.type = 'sawtooth'; f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 2;
        const vib = c.createOscillator(), vg = c.createGain();
        vib.frequency.value = 6.5; vg.gain.value = 14;
        vib.connect(vg); vg.connect(o.frequency);
        o.frequency.setValueAtTime(740, now);
        o.frequency.linearRampToValueAtTime(988, now + 0.35);
        o.frequency.setValueAtTime(988, now + 0.8);
        o.frequency.linearRampToValueAtTime(880, now + 1.3);
        o.connect(f); f.connect(g); g.connect(out);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.22 * vol, now + 0.08);
        g.gain.setValueAtTime(0.22 * vol, now + 1.2);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
        o.start(now); o.stop(now + 1.9); vib.start(now); vib.stop(now + 1.9);
        break;
      }
      case 'stinger': {
        tone('sawtooth', 70, 50, 1.4, 0.4);
        noiseHit(2000, 200, 0.7, 0.3, 'bandpass', 0.8);
        break;
      }
      case 'tape_click': tone('square', 800, 500, 0.04, 0.25); break;
      case 'heartbeat': {
        tone('sine', 58, 40, 0.16, 0.55);
        setTimeout(() => { if (this.ctx) tone('sine', 52, 38, 0.14, 0.4); }, 180);
        break;
      }
      case 'sob': {
        // 远处哭声
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine';
        o.frequency.setValueAtTime(520, now);
        o.frequency.linearRampToValueAtTime(400, now + 0.4);
        o.frequency.linearRampToValueAtTime(480, now + 0.7);
        o.frequency.linearRampToValueAtTime(330, now + 1.4);
        o.connect(g); g.connect(out);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(0.08 * vol, now + 0.2);
        g.gain.linearRampToValueAtTime(0.02 * vol, now + 0.9);
        g.gain.linearRampToValueAtTime(0.07 * vol, now + 1.1);
        g.gain.linearRampToValueAtTime(0, now + 1.8);
        o.start(now); o.stop(now + 1.9);
        break;
      }
      case 'fire': noiseHit(1800, 900, 0.4, 0.18, 'bandpass', 0.7); break;
      case 'zhenxie': {
        // 镇邪一击：铃音 + 气音
        this.sfx('bell', { pitch: 1.5, vol: 0.6 * vol });
        noiseHit(1000, 3500, 0.3, 0.25, 'bandpass', 3);
        break;
      }
      case 'ui': tone('triangle', 660, 660, 0.05, 0.12); break;
      case 'ui_open': tone('triangle', 440, 660, 0.08, 0.15); break;
      case 'error': tone('square', 220, 180, 0.12, 0.18); break;
      default: break;
    }
  },

  // ---------- 生成式配乐 ----------
  music(mood) {
    if (!this.ctx || this._musicMood === mood) return;
    this._musicMood = mood;
    if (this._musicTimer) { clearInterval(this._musicTimer); this._musicTimer = null; }
    if (mood === 'none') return;
    const c = this.ctx;
    const pluck = (freq, vol = 0.2, dur = 1.6) => {
      const now = c.currentTime;
      const o = c.createOscillator(), g = c.createGain(), f = c.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = freq;
      f.type = 'lowpass'; f.frequency.setValueAtTime(freq * 4, now);
      f.frequency.exponentialRampToValueAtTime(freq * 1.2, now + dur);
      o.connect(f); f.connect(g); g.connect(this.buses.music);
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + dur);
      o.start(now); o.stop(now + dur);
    };
    const pad = (freqs, vol = 0.06, dur = 6) => {
      const now = c.currentTime;
      for (const fr of freqs) {
        const o = c.createOscillator(), g = c.createGain();
        o.type = 'sine'; o.frequency.value = fr; o.detune.value = (Math.random() - 0.5) * 8;
        o.connect(g); g.connect(this.buses.music);
        g.gain.setValueAtTime(0, now);
        g.gain.linearRampToValueAtTime(vol, now + dur * 0.4);
        g.gain.linearRampToValueAtTime(0, now + dur);
        o.start(now); o.stop(now + dur);
      }
    };
    const drum = (vol = 0.5) => {
      const now = c.currentTime;
      const o = c.createOscillator(), g = c.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(110, now);
      o.frequency.exponentialRampToValueAtTime(45, now + 0.3);
      o.connect(g); g.connect(this.buses.music);
      g.gain.setValueAtTime(vol, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      o.start(now); o.stop(now + 0.4);
    };
    // 羽调式（悲）音阶
    const scale = [220, 261.6, 293.7, 349.2, 392, 440, 523.3];
    let beat = 0;
    const moods = {
      title: () => {
        if (beat % 4 === 0 && Math.random() < 0.8) pluck(pick(Math.random, scale) / 2, 0.16, 2.4);
        if (beat % 8 === 2) pad([110, 165], 0.05, 7);
      },
      house: () => {
        if (beat % 8 === 0) pad([110, 131, 165], 0.045, 8);
        if (beat % 6 === 3 && Math.random() < 0.5) pluck(pick(Math.random, scale) / 2, 0.1, 2);
      },
      village: () => {
        if (beat % 8 === 0) pad([98, 147], 0.05, 8);
        if (beat % 4 === 1 && Math.random() < 0.45) pluck(pick(Math.random, scale), 0.08, 1.6);
        if (beat % 16 === 9) this.sfx('sob', { vol: 0.4 });
      },
      tomb: () => {
        if (beat % 10 === 0) pad([55, 82.5], 0.07, 10);
        if (beat % 12 === 6 && Math.random() < 0.5) pluck(110, 0.07, 3);
      },
      boss: () => {
        if (beat % 2 === 0) drum(beat % 8 === 0 ? 0.5 : 0.3);
        if (beat % 8 === 4) this.sfx('gong', { vol: 0.35 });
        if (beat % 16 === 8) pad([146.8, 220, 174.6], 0.05, 4);
      },
      sad: () => {
        if (beat % 6 === 0) pad([130.8, 196, 164.8], 0.06, 7);
        if (beat % 6 === 2) pluck(pick(Math.random, [261.6, 293.7, 329.6, 392]), 0.12, 2.6);
      },
    };
    const fn = moods[mood];
    if (!fn) return;
    this._musicTimer = setInterval(() => { beat++; try { fn(); } catch (e) {} }, 500);
  },

  // ---------- 心跳（随状态变化） ----------
  heartbeat(on, rate = 1) {
    this._heart.on = on; this._heart.rate = rate;
  },
  updateHeart(dt) {
    if (!this.ctx || !this._heart.on) return;
    this._heart.next -= dt;
    if (this._heart.next <= 0) {
      this.sfx('heartbeat', { vol: clamp(0.3 + this._heart.rate * 0.3, 0, 0.9) });
      this._heart.next = clamp(1.2 / this._heart.rate, 0.45, 1.6);
    }
  },

  // ---------- 磁带底噪 ----------
  tapeNoise(on) {
    if (!this.ctx) return;
    if (on && !this._tape) {
      const c = this.ctx;
      const n = this._noiseSrc(), f = c.createBiquadFilter(), g = c.createGain();
      f.type = 'highpass'; f.frequency.value = 3000;
      n.connect(f); f.connect(g); g.connect(this.buses.sfx);
      g.gain.value = 0.04;
      const hum = c.createOscillator(), hg = c.createGain();
      hum.frequency.value = 50; hg.gain.value = 0.02;
      hum.connect(hg); hg.connect(this.buses.sfx);
      n.start(); hum.start();
      this._tape = [n, hum];
      this.sfx('tape_click');
    } else if (!on && this._tape) {
      this.sfx('tape_click');
      this._tape.forEach(x => { try { x.stop(); } catch (e) {} });
      this._tape = null;
    }
  },
};

// ------------------------------------------------------------
// 资源：SVG 美术加载为 Image；程序化地表纹理
// ------------------------------------------------------------
export const Assets = {
  _imgs: new Map(),
  _tiles: new Map(),

  load(names, onProgress) {
    let done = 0;
    const jobs = names.map((n) => new Promise((res) => {
      const img = new Image();
      img.onload = () => { this._imgs.set(n, img); done++; onProgress && onProgress(done / names.length); res(); };
      img.onerror = () => {
        console.warn('美术资源缺失，使用纸墨剪影:', n);
        this._imgs.set(n, this._fallback(n));
        done++;
        onProgress && onProgress(done / names.length);
        res();
      };
      img.src = 'assets/art/' + n + '.svg';
    }));
    return Promise.all(jobs);
  },
  img(n) { return this._imgs.get(n) || null; },
  url(n) {
    const img = this._imgs.get(n);
    if (img instanceof HTMLCanvasElement) return img.toDataURL('image/png');
    return 'assets/art/' + n + '.svg';
  },

  _fallback(name) {
    const c = document.createElement('canvas');
    const isTitle = name === 'title_house';
    const isBoss = name.startsWith('boss_');
    const isEnemy = name.startsWith('en_');
    const isItem = name.startsWith('it_');
    const isProp = name.startsWith('pr_');
    c.width = isTitle ? 640 : isBoss ? 96 : isProp ? 72 : 64;
    c.height = isTitle ? 280 : isBoss ? 128 : isProp ? 88 : 64;
    const x = c.getContext('2d');
    const hash = [...name].reduce((a, ch) => (a * 33 + ch.charCodeAt(0)) >>> 0, 2166136261);
    const accent = `hsl(${hash % 36 + (isEnemy || isBoss ? 340 : 28)},${isEnemy || isBoss ? 42 : 24}%,${isItem ? 54 : 38}%)`;
    x.clearRect(0, 0, c.width, c.height);
    if (isTitle) {
      const g = x.createLinearGradient(0, 0, 0, c.height);
      g.addColorStop(0, '#111a1b');
      g.addColorStop(1, '#090807');
      x.fillStyle = g;
      x.fillRect(0, 0, c.width, c.height);
      x.fillStyle = '#191714';
      x.fillRect(130, 115, 380, 150);
      x.fillStyle = '#25211b';
      x.beginPath();
      x.moveTo(85, 125); x.lineTo(320, 45); x.lineTo(555, 125); x.closePath(); x.fill();
      x.fillStyle = '#c28d4c';
      x.fillRect(306, 155, 12, 26);
      return c;
    }
    x.save();
    x.translate(c.width / 2, c.height * 0.72);
    x.fillStyle = 'rgba(0,0,0,0.35)';
    x.beginPath(); x.ellipse(0, 4, c.width * 0.3, c.height * 0.08, 0, 0, TAU); x.fill();
    if (isItem) {
      x.strokeStyle = accent; x.fillStyle = '#24211d'; x.lineWidth = 3;
      x.beginPath();
      x.moveTo(0, -c.height * 0.55);
      x.lineTo(c.width * 0.2, -c.height * 0.12);
      x.lineTo(0, 0);
      x.lineTo(-c.width * 0.2, -c.height * 0.12);
      x.closePath(); x.fill(); x.stroke();
      x.fillStyle = accent; x.fillRect(-3, -c.height * 0.55, 6, c.height * 0.52);
    } else if (isProp) {
      x.fillStyle = '#312a21';
      x.strokeStyle = accent;
      x.lineWidth = 2;
      x.fillRect(-c.width * 0.28, -c.height * 0.5, c.width * 0.56, c.height * 0.5);
      x.strokeRect(-c.width * 0.28, -c.height * 0.5, c.width * 0.56, c.height * 0.5);
      x.beginPath();
      x.moveTo(-c.width * 0.34, -c.height * 0.5);
      x.lineTo(0, -c.height * 0.72);
      x.lineTo(c.width * 0.34, -c.height * 0.5);
      x.stroke();
    } else {
      x.fillStyle = isEnemy || isBoss ? '#171315' : '#24231f';
      x.strokeStyle = accent;
      x.lineWidth = isBoss ? 4 : 2;
      x.beginPath();
      x.ellipse(0, -c.height * 0.5, c.width * 0.16, c.height * 0.13, 0, 0, TAU);
      x.fill(); x.stroke();
      x.beginPath();
      x.moveTo(-c.width * 0.22, -c.height * 0.38);
      x.lineTo(-c.width * 0.3, 0);
      x.lineTo(c.width * 0.3, 0);
      x.lineTo(c.width * 0.22, -c.height * 0.38);
      x.closePath(); x.fill(); x.stroke();
      if (isEnemy || isBoss) {
        x.fillStyle = '#8e2a35';
        x.fillRect(-c.width * 0.07, -c.height * 0.53, c.width * 0.045, 2);
        x.fillRect(c.width * 0.025, -c.height * 0.53, c.width * 0.045, 2);
      }
    }
    x.restore();
    return c;
  },

  // 程序化 32px 地表纹理（4 变体平铺）
  tile(name) {
    if (this._tiles.has(name)) return this._tiles.get(name);
    const S = 32, c = document.createElement('canvas');
    c.width = S * 4; c.height = S;
    const x = c.getContext('2d');
    const rng = makeRng([...name].reduce((a, ch) => a + ch.charCodeAt(0), 7));
    const speck = (col, n, s0 = 1, s1 = 3, alpha = 1) => {
      x.fillStyle = col; x.globalAlpha = alpha;
      for (let i = 0; i < n; i++) {
        const px = rng() * S * 4, py = rng() * S, sz = s0 + rng() * (s1 - s0);
        x.fillRect(px, py, sz, sz);
      }
      x.globalAlpha = 1;
    };
    const base = (col) => { x.fillStyle = col; x.fillRect(0, 0, S * 4, S); };
    switch (name) {
      case 'dirt': base('#2a241d'); speck('#332c22', 90, 1, 3); speck('#1f1a14', 70, 1, 3); speck('#3d342a', 24, 1, 2); break;
      case 'mud': base('#23201a'); speck('#2c2820', 70); speck('#181610', 80, 1, 4); speck('#39322a', 10, 1, 2, 0.6); break;
      case 'grass': base('#222b20'); speck('#2a3526', 80); speck('#1a211a', 70); speck('#34402c', 30, 1, 2); break;
      case 'stone': {
        base('#2b2d2e');
        for (let i = 0; i < 4; i++) {
          x.strokeStyle = '#222425'; x.lineWidth = 1;
          x.strokeRect(i * S + 0.5, 0.5, S - 1, S - 1);
          x.strokeRect(i * S + 4.5, 4.5, S - 9, S - 9);
        }
        speck('#34373a', 50, 1, 2); speck('#1f2122', 40, 1, 2);
        break;
      }
      case 'wood': {
        base('#3a2d20');
        x.strokeStyle = '#2c2218'; x.lineWidth = 1;
        for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(0, i * 4 + 2); x.lineTo(S * 4, i * 4 + 2); x.stroke(); }
        x.strokeStyle = '#241b12';
        for (let i = 0; i < 12; i++) { const px = rng() * S * 4; x.beginPath(); x.moveTo(px, 0); x.lineTo(px, S); x.stroke(); }
        speck('#46382a', 30, 1, 2, 0.7);
        break;
      }
      case 'wood_old': {
        base('#30261c');
        x.strokeStyle = '#241c13'; x.lineWidth = 1;
        for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(0, i * 4 + 2); x.lineTo(S * 4, i * 4 + 2); x.stroke(); }
        speck('#1d160f', 60, 1, 3); speck('#3c3023', 20, 1, 2, 0.7);
        break;
      }
      case 'path': base('#332e25'); speck('#3c362c', 70); speck('#28241d', 60); speck('#45403322', 0); speck('#454033', 16, 1, 2, 0.5); break;
      case 'water': base('#16201f'); speck('#1c2a29', 50, 2, 5, 0.8); speck('#101817', 40, 2, 4); speck('#243634', 14, 1, 3, 0.6); break;
      case 'waterwalk': base('#172422'); speck('#23403b', 42, 1, 6, 0.7); speck('#101817', 32, 2, 5); break;
      case 'carpet': base('#4a1f22'); speck('#56262a', 50); speck('#3c181b', 50); speck('#643037', 14, 1, 2, 0.7); break;
      case 'tomb': base('#26242b'); speck('#2e2c34', 60, 1, 3); speck('#1c1a21', 60, 1, 3); speck('#38353f', 14, 1, 2, 0.6); break;
      case 'cliff': base('#272725'); speck('#34342f', 72, 1, 5); speck('#161715', 40, 2, 6); break;
      case 'flood': base('#24302c'); speck('#30433d', 54, 1, 4); speck('#17211f', 45, 2, 5); break;
      case 'stage': base('#3b2920'); speck('#4a3429', 50, 1, 5); speck('#201710', 42, 1, 4); break;
      case 'inn': base('#302a24'); speck('#3e352d', 52, 1, 4); speck('#211d19', 44, 1, 4); break;
      case 'ancestral': base('#302b27'); speck('#41362f', 36, 1, 4); speck('#1e1b19', 48, 1, 3); break;
      case 'workshop': base('#292724'); speck('#39352f', 58, 1, 3); speck('#1b1a18', 36, 1, 5); break;
      case 'memorypalace': base('#22252c'); speck('#303541', 62, 1, 4); speck('#171820', 44, 1, 5); break;
      case 'voidhall': base('#17171c'); speck('#28252e', 52, 1, 4); speck('#0c0c10', 58, 1, 6); break;
      case 'wall_brick': {
        base('#23282a');
        x.strokeStyle = '#191d1f'; x.lineWidth = 1.5;
        for (let r = 0; r < 4; r++) {
          const y = r * 8 + 0.5;
          x.beginPath(); x.moveTo(0, y); x.lineTo(S * 4, y); x.stroke();
          for (let col = 0; col < 16; col++) {
            const px = col * 8 + (r % 2 ? 4 : 0) + 0.5;
            x.beginPath(); x.moveTo(px, y); x.lineTo(px, y + 8); x.stroke();
          }
        }
        speck('#2b3134', 40, 1, 2, 0.8);
        break;
      }
      case 'wall_wood': {
        base('#241b12');
        x.strokeStyle = '#191209'; x.lineWidth = 2;
        for (let i = 0; i < 16; i++) { x.beginPath(); x.moveTo(i * 8 + 1, 0); x.lineTo(i * 8 + 1, S); x.stroke(); }
        speck('#2e2417', 24, 1, 2, 0.7);
        break;
      }
      case 'wall_tomb': {
        base('#1d1b22');
        x.strokeStyle = '#141218'; x.lineWidth = 1.5;
        for (let r = 0; r < 2; r++) {
          const y = r * 16 + 0.5;
          x.beginPath(); x.moveTo(0, y); x.lineTo(S * 4, y); x.stroke();
          for (let col = 0; col < 8; col++) {
            const px = col * 16 + (r % 2 ? 8 : 0) + 0.5;
            x.beginPath(); x.moveTo(px, y); x.lineTo(px, y + 16); x.stroke();
          }
        }
        speck('#262430', 30, 1, 3, 0.7);
        break;
      }
      case 'wall_cliff': {
        base('#1e201e');
        speck('#30332f', 80, 2, 7);
        speck('#111310', 60, 2, 6);
        break;
      }
      default: base('#222'); break;
    }
    this._tiles.set(name, c);
    return c;
  },
};

// ------------------------------------------------------------
// 存档 / 设置（localStorage）
// ------------------------------------------------------------
const LEGACY_SAVE_KEY = 'tbt_save_v1';
const SAVE_PREFIX = 'tbt_save_v2_';
const SET_KEY = 'tbt_settings_v1';
const SAVE_SLOTS = ['auto', 'slot_1', 'slot_2', 'slot_3'];

export const SaveSys = {
  defaults() {
    return {
      volMaster: 0.8, volMusic: 0.7, volSfx: 0.9, volAmb: 0.8,
      horrorReduce: false, hints: 'std', shake: true, lang: 'zh', joy: 1,
      difficulty: 'standard', subtitleScale: 1, highContrast: false,
      reduceFlash: false, colorAssist: false, autoLock: true,
      chaseAssist: false, holdToggle: false, autoPickup: true,
      keyBindings: {},
    };
  },
  loadSettings() {
    try {
      const s = JSON.parse(localStorage.getItem(SET_KEY) || 'null');
      return Object.assign(this.defaults(), s || {});
    } catch (e) { return this.defaults(); }
  },
  saveSettings(s) { try { localStorage.setItem(SET_KEY, JSON.stringify(s)); } catch (e) {} },
  _slot(slot = 'auto') { return SAVE_SLOTS.includes(slot) ? slot : 'auto'; },
  _key(slot = 'auto') { return SAVE_PREFIX + this._slot(slot); },
  _backupKey(slot = 'auto') { return this._key(slot) + '_bak'; },
  _migrate(save) {
    if (!save || typeof save !== 'object') return null;
    const migrated = { ...save };
    migrated.ver = migrated.ver || 1;
    if (!migrated.questLog && migrated.objective) {
      migrated.questLog = [{ t: migrated.time || Date.now(), type: '目标', text: migrated.objective }];
    }
    if (!migrated.mapVisits) migrated.mapVisits = migrated.mapId ? { [migrated.mapId]: 1 } : {};
    if (!migrated.readStory) migrated.readStory = {};
    if (!migrated.seed) migrated.seed = migrated.time || Date.now();
    migrated.ver = 2;
    return migrated;
  },
  _parse(raw) {
    if (!raw) return null;
    return this._migrate(JSON.parse(raw));
  },
  hasSave(slot = 'auto') {
    try {
      const s = this._slot(slot);
      return !!localStorage.getItem(this._key(s)) || (s === 'auto' && !!localStorage.getItem(LEGACY_SAVE_KEY));
    } catch (e) { return false; }
  },
  anySave() { return this.listSaves().some((s) => !!s.save); },
  saveGame(obj, slot = 'auto') {
    try {
      const key = this._key(slot);
      const prev = localStorage.getItem(key);
      if (prev) localStorage.setItem(this._backupKey(slot), prev);
      localStorage.setItem(key, JSON.stringify({ ...obj, slot: this._slot(slot) }));
      return true;
    } catch (e) { return false; }
  },
  loadGame(slot = 'auto') {
    try {
      const s = this._slot(slot);
      const raw = localStorage.getItem(this._key(s)) || (s === 'auto' ? localStorage.getItem(LEGACY_SAVE_KEY) : null);
      return this._parse(raw);
    } catch (e) {
      try { return this._parse(localStorage.getItem(this._backupKey(slot))); } catch (e2) { return null; }
    }
  },
  listSaves() {
    return SAVE_SLOTS.map((slot) => {
      const save = this.loadGame(slot);
      return { slot, save };
    });
  },
  clearSave(slot = 'auto') {
    try {
      const s = this._slot(slot);
      localStorage.removeItem(this._key(s));
      localStorage.removeItem(this._backupKey(s));
      if (s === 'auto') localStorage.removeItem(LEGACY_SAVE_KEY);
    } catch (e) {}
  },
  clearAll() {
    try {
      for (const s of SAVE_SLOTS) {
        localStorage.removeItem(this._key(s));
        localStorage.removeItem(this._backupKey(s));
      }
      localStorage.removeItem(LEGACY_SAVE_KEY);
      localStorage.removeItem(SET_KEY);
    } catch (e) {}
  },
};
