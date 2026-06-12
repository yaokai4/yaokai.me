// ============================================================
// render.js — 相机 / 光照 / 天气 / 粒子 / 后期
// 逻辑分辨率 960x540，按窗口等比缩放
// ============================================================
import { clamp, lerp, TAU } from './engine.js';

export const VW = 960, VH = 540;

export class Camera {
  constructor() {
    this.x = 0; this.y = 0;
    this.tx = 0; this.ty = 0;
    this.shakeT = 0; this.shakeAmt = 0;
    this.mapW = 2000; this.mapH = 2000;
    this.enableShake = true;
  }
  setMapSize(w, h) { this.mapW = w; this.mapH = h; }
  follow(x, y, dt, lookX = 0, lookY = 0) {
    this.tx = x + lookX * 36; this.ty = y + lookY * 36;
    const k = 1 - Math.pow(0.0012, dt);
    this.x = lerp(this.x, this.tx, k);
    this.y = lerp(this.y, this.ty, k);
    this.clampToMap();
    if (this.shakeT > 0) this.shakeT -= dt;
  }
  snap(x, y) { this.x = this.tx = x; this.y = this.ty = y; this.clampToMap(); }
  clampToMap() {
    if (this.mapW > VW) this.x = clamp(this.x, VW / 2, this.mapW - VW / 2);
    else this.x = this.mapW / 2;
    if (this.mapH > VH) this.y = clamp(this.y, VH / 2, this.mapH - VH / 2);
    else this.y = this.mapH / 2;
  }
  shake(amt, dur = 0.25) {
    if (!this.enableShake) return;
    this.shakeAmt = Math.max(this.shakeAmt, amt); this.shakeT = Math.max(this.shakeT, dur);
  }
  // 世界 -> 屏幕偏移
  ox() {
    let o = VW / 2 - this.x;
    if (this.shakeT > 0) o += (Math.random() - 0.5) * this.shakeAmt * 2;
    return Math.round(o);
  }
  oy() {
    let o = VH / 2 - this.y;
    if (this.shakeT > 0) o += (Math.random() - 0.5) * this.shakeAmt * 2;
    return Math.round(o);
  }
}

// 粒子
class Particle {
  constructor(o) { Object.assign(this, o); this.t = 0; }
}

export class Renderer {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.cam = new Camera();
    this.scale = 1;
    // 光照遮罩
    this.lightCv = document.createElement('canvas');
    this.lightCv.width = VW / 2; this.lightCv.height = VH / 2; // 半分辨率，柔和且省性能
    this.lightCtx = this.lightCv.getContext('2d');
    this.lights = [];
    this.darkness = 0; // 0 白天 ~ 1 全黑
    // 粒子与飘字
    this.parts = [];
    this.floats = [];
    // 天气
    this.rain = 0; // 0~1
    this._rainDrops = [];
    // 后期
    this.sanity = 100;
    this.flashT = 0; this.flashCol = '#fff';
    this.time = 0;
    this._grain = this._makeGrain();
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const w = window.innerWidth, h = window.innerHeight;
    const s = Math.min(w / VW, h / VH);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.scale = s;
    this.canvas.width = Math.round(VW * s * dpr);
    this.canvas.height = Math.round(VH * s * dpr);
    this.canvas.style.width = Math.round(VW * s) + 'px';
    this.canvas.style.height = Math.round(VH * s) + 'px';
    this.ctx.setTransform(s * dpr, 0, 0, s * dpr, 0, 0);
    this.ctx.imageSmoothingEnabled = true;
  }

  _makeGrain() {
    const c = document.createElement('canvas');
    c.width = 240; c.height = 135;
    const x = c.getContext('2d');
    const id = x.createImageData(240, 135);
    for (let i = 0; i < id.data.length; i += 4) {
      const v = Math.random() * 255;
      id.data[i] = id.data[i + 1] = id.data[i + 2] = v;
      id.data[i + 3] = 18;
    }
    x.putImageData(id, 0, 0);
    return c;
  }

  begin(dt) {
    this.time += dt;
    const x = this.ctx;
    x.fillStyle = '#06070a';
    x.fillRect(0, 0, VW, VH);
    this.lights.length = 0;
  }

  addLight(wx, wy, r, intensity = 1, color = null, flicker = 0) {
    this.lights.push({ x: wx, y: wy, r, i: intensity, c: color, f: flicker });
  }

  // ---------- 粒子 ----------
  spawnParts(opt) {
    const n = opt.n || 6;
    for (let i = 0; i < n; i++) {
      const a = opt.ang != null ? opt.ang + (Math.random() - 0.5) * (opt.spread ?? 1.2) : Math.random() * TAU;
      const sp = (opt.sp ?? 80) * (0.5 + Math.random() * 0.8);
      this.parts.push(new Particle({
        x: opt.x, y: opt.y,
        vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - (opt.up ?? 30),
        life: (opt.life ?? 0.5) * (0.7 + Math.random() * 0.6),
        size: (opt.size ?? 3) * (0.6 + Math.random() * 0.8),
        col: opt.col || '#caa',
        grav: opt.grav ?? 220,
        rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 8,
        rect: opt.rect || false,
      }));
    }
    if (this.parts.length > 400) this.parts.splice(0, this.parts.length - 400);
  }

  floatText(wx, wy, txt, col = '#e8d9b0', size = 15) {
    this.floats.push({ x: wx, y: wy, txt, col, size, t: 0, life: 0.9 });
    if (this.floats.length > 30) this.floats.shift();
  }

  updateFx(dt) {
    for (let i = this.parts.length - 1; i >= 0; i--) {
      const p = this.parts[i];
      p.t += dt;
      if (p.t >= p.life) { this.parts.splice(i, 1); continue; }
      p.vy += p.grav * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.rot += p.vr * dt;
    }
    for (let i = this.floats.length - 1; i >= 0; i--) {
      const f = this.floats[i];
      f.t += dt; f.y -= 36 * dt;
      if (f.t >= f.life) this.floats.splice(i, 1);
    }
    if (this.flashT > 0) this.flashT -= dt;
    // 雨滴池
    if (this.rain > 0) {
      const want = Math.floor(120 * this.rain);
      while (this._rainDrops.length < want) {
        this._rainDrops.push({ x: Math.random() * VW, y: Math.random() * VH, sp: 600 + Math.random() * 400, l: 10 + Math.random() * 14 });
      }
      if (this._rainDrops.length > want) this._rainDrops.length = want;
      for (const d of this._rainDrops) {
        d.y += d.sp * dt; d.x -= d.sp * 0.12 * dt;
        if (d.y > VH) { d.y = -20; d.x = Math.random() * (VW + 100); }
      }
    } else this._rainDrops.length = 0;
  }

  drawParts() {
    const x = this.ctx, ox = this.cam.ox(), oy = this.cam.oy();
    for (const p of this.parts) {
      const a = 1 - p.t / p.life;
      x.globalAlpha = a;
      x.fillStyle = p.col;
      if (p.rect) {
        x.save();
        x.translate(p.x + ox, p.y + oy);
        x.rotate(p.rot);
        x.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        x.restore();
      } else {
        x.beginPath();
        x.arc(p.x + ox, p.y + oy, p.size * a + 0.5, 0, TAU);
        x.fill();
      }
    }
    x.globalAlpha = 1;
  }

  drawFloats() {
    const x = this.ctx, ox = this.cam.ox(), oy = this.cam.oy();
    x.textAlign = 'center';
    for (const f of this.floats) {
      const a = 1 - (f.t / f.life) ** 2;
      x.globalAlpha = a;
      x.font = `bold ${f.size}px "Kaiti SC","STKaiti",serif`;
      x.fillStyle = '#000';
      x.fillText(f.txt, f.x + ox + 1, f.y + oy + 1);
      x.fillStyle = f.col;
      x.fillText(f.txt, f.x + ox, f.y + oy);
    }
    x.globalAlpha = 1;
    x.textAlign = 'left';
  }

  // ---------- 光照 ----------
  drawLighting() {
    if (this.darkness <= 0.01) return;
    const lc = this.lightCtx, w = this.lightCv.width, h = this.lightCv.height;
    const k = 0.5; // 半分辨率系数
    lc.globalCompositeOperation = 'source-over';
    lc.clearRect(0, 0, w, h);
    lc.fillStyle = `rgba(2,3,6,${this.darkness})`;
    lc.fillRect(0, 0, w, h);
    lc.globalCompositeOperation = 'destination-out';
    const ox = this.cam.ox(), oy = this.cam.oy();
    for (const L of this.lights) {
      const fl = L.f ? 1 + Math.sin(this.time * 13 + L.x) * L.f + Math.sin(this.time * 31) * L.f * 0.5 : 1;
      const r = L.r * fl * k;
      const cx = (L.x + ox) * k, cy = (L.y + oy) * k;
      if (cx < -r || cy < -r || cx > w + r || cy > h + r) continue;
      const g = lc.createRadialGradient(cx, cy, r * 0.15, cx, cy, r);
      g.addColorStop(0, `rgba(255,255,255,${clamp(L.i, 0, 1)})`);
      g.addColorStop(0.7, `rgba(255,255,255,${clamp(L.i * 0.5, 0, 1)})`);
      g.addColorStop(1, 'rgba(255,255,255,0)');
      lc.fillStyle = g;
      lc.beginPath(); lc.arc(cx, cy, r, 0, TAU); lc.fill();
    }
    const x = this.ctx;
    x.drawImage(this.lightCv, 0, 0, w, h, 0, 0, VW, VH);
    // 暖色光晕（叠加层）
    x.globalCompositeOperation = 'overlay';
    for (const L of this.lights) {
      if (!L.c) continue;
      const fl = L.f ? 1 + Math.sin(this.time * 13 + L.x) * L.f : 1;
      const cx = L.x + ox, cy = L.y + oy;
      const g = x.createRadialGradient(cx, cy, 4, cx, cy, L.r * 0.8 * fl);
      g.addColorStop(0, L.c);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      x.globalAlpha = 0.5;
      x.fillStyle = g;
      x.beginPath(); x.arc(cx, cy, L.r * 0.8 * fl, 0, TAU); x.fill();
    }
    x.globalAlpha = 1;
    x.globalCompositeOperation = 'source-over';
  }

  // ---------- 天气与后期 ----------
  drawWeather() {
    if (this.rain > 0) {
      const x = this.ctx;
      x.strokeStyle = 'rgba(170,190,210,0.28)';
      x.lineWidth = 1;
      x.beginPath();
      for (const d of this._rainDrops) {
        x.moveTo(d.x, d.y);
        x.lineTo(d.x - d.l * 0.12, d.y + d.l);
      }
      x.stroke();
    }
  }

  flash(col = '#fff', dur = 0.12) { this.flashT = dur; this.flashCol = col; }

  drawPost() {
    const x = this.ctx;
    // 闪光（雷电等）
    if (this.flashT > 0) {
      x.globalAlpha = clamp(this.flashT * 6, 0, 0.85);
      x.fillStyle = this.flashCol;
      x.fillRect(0, 0, VW, VH);
      x.globalAlpha = 1;
    }
    // 理智扭曲
    const sanK = clamp(1 - this.sanity / 100, 0, 1);
    if (sanK > 0.35) {
      const a = (sanK - 0.35) * 0.5;
      x.globalAlpha = a * (0.5 + 0.5 * Math.sin(this.time * 2.3));
      x.fillStyle = '#3d1f2e';
      x.globalCompositeOperation = 'overlay';
      x.fillRect(0, 0, VW, VH);
      x.globalCompositeOperation = 'source-over';
      x.globalAlpha = 1;
    }
    // 暗角
    const vg = x.createRadialGradient(VW / 2, VH / 2, VH * (0.55 - sanK * 0.18), VW / 2, VH / 2, VH * 0.95);
    vg.addColorStop(0, 'rgba(0,0,0,0)');
    vg.addColorStop(1, `rgba(0,0,0,${0.45 + sanK * 0.3})`);
    x.fillStyle = vg;
    x.fillRect(0, 0, VW, VH);
    // 胶片颗粒
    x.globalAlpha = 0.5;
    x.drawImage(this._grain, Math.floor(Math.random() * -8), Math.floor(Math.random() * -8), VW + 16, VH + 16);
    x.globalAlpha = 1;
  }

  // 理智抖动的画布平移（在 world 绘制外层调用）
  sanityWobble() {
    const sanK = clamp(1 - this.sanity / 100, 0, 1);
    if (sanK <= 0.5) return { x: 0, y: 0 };
    const m = (sanK - 0.5) * 6;
    return {
      x: Math.sin(this.time * 1.7) * m,
      y: Math.cos(this.time * 2.3) * m * 0.6,
    };
  }
}
