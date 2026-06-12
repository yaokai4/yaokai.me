// ============================================================
// world.js — 地图运行时 / 玩家 / 敌人 AI / Boss / 送亲队列
// ============================================================
import { TAU, clamp, lerp, dist, angTo, angDiff, makeRng, pick, Assets, AudioSys, Input } from './engine.js';
import { TILESET, ENEMY_DEFS, NPC_DEFS } from './data_world.js';
import { WEAPONS } from './data_items.js';

export const TS = 32; // 瓦片尺寸

// ------------------------------------------------------------
// 地图运行时
// ------------------------------------------------------------
export class GameMap {
  constructor(def, game) {
    this.def = def;
    this.game = game;
    this.grid = def.grid;
    this.h = def.grid.length;
    this.w = Math.max(...def.grid.map(r => r.length));
    this.pw = this.w * TS; this.ph = this.h * TS;
    this.entities = [];
    this.pickups = [];
    this.props = [];
    this.candles = [];
    this._prerender();
    this._initProps();
  }

  cell(tx, ty) {
    if (tx < 0 || ty < 0 || tx >= this.w || ty >= this.h) return ' ';
    const row = this.grid[ty];
    return tx < row.length ? row[tx] : ' ';
  }
  tileSolid(tx, ty) {
    const c = TILESET[this.cell(tx, ty)];
    return !c || c.solid;
  }
  isRoad(px, py) {
    const c = TILESET[this.cell(Math.floor(px / TS), Math.floor(py / TS))];
    return !!(c && c.road);
  }

  // 圆形碰撞体 vs 瓦片 + 实体道具
  collides(px, py, r) {
    const x0 = Math.floor((px - r) / TS), x1 = Math.floor((px + r) / TS);
    const y0 = Math.floor((py - r) / TS), y1 = Math.floor((py + r) / TS);
    for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
      if (this.tileSolid(tx, ty)) {
        // 圆 vs 瓦片 AABB
        const cx = clamp(px, tx * TS, tx * TS + TS), cy = clamp(py, ty * TS, ty * TS + TS);
        if ((px - cx) ** 2 + (py - cy) ** 2 < r * r) return true;
      }
    }
    for (const p of this.props) {
      if (!p.solid || p.hidden) continue;
      const cx = clamp(px, p.bx0, p.bx1), cy = clamp(py, p.by0, p.by1);
      if ((px - cx) ** 2 + (py - cy) ** 2 < r * r) return true;
    }
    return false;
  }

  moveCircle(e, dx, dy) {
    if (dx !== 0 && !this.collides(e.x + dx, e.y, e.size)) e.x += dx;
    else if (dx !== 0) { // 贴墙滑动微调
      const sub = Math.sign(dx) * 0.5;
      let moved = 0;
      while (Math.abs(moved) < Math.abs(dx) && !this.collides(e.x + sub, e.y, e.size)) { e.x += sub; moved += sub; }
    }
    if (dy !== 0 && !this.collides(e.x, e.y + dy, e.size)) e.y += dy;
    else if (dy !== 0) {
      const sub = Math.sign(dy) * 0.5;
      let moved = 0;
      while (Math.abs(moved) < Math.abs(dy) && !this.collides(e.x, e.y + sub, e.size)) { e.y += sub; moved += sub; }
    }
    e.x = clamp(e.x, e.size, this.pw - e.size);
    e.y = clamp(e.y, e.size, this.ph - e.size);
  }

  _prerender() {
    const cv = document.createElement('canvas');
    cv.width = this.pw; cv.height = this.ph;
    const x = cv.getContext('2d');
    const T = this.def.tiles;
    const rng = makeRng(this.w * 131 + this.h * 17);
    x.fillStyle = '#05060a';
    x.fillRect(0, 0, this.pw, this.ph);
    for (let ty = 0; ty < this.h; ty++) {
      for (let tx = 0; tx < this.w; tx++) {
        const ch = this.cell(tx, ty);
        const td = TILESET[ch];
        if (!td) continue;
        let tname = null;
        if (ch === '#') tname = T.wall;
        else if (td.tile === 'floor') tname = T.floor;
        else if (td.tile === 'alt') tname = T.alt;
        else if (td.tile === 'road') tname = T.road;
        else if (td.tile === 'water') tname = 'water';
        else if (td.tile === 'waterwalk') tname = 'waterwalk';
        else if (td.tile === 'wood') tname = T.wood;
        else if (td.tile === 'carpet') tname = 'carpet';
        else if (td.tile === 'tombf') tname = 'tomb';
        if (!tname) continue;
        const src = Assets.tile(tname);
        const v = Math.floor(rng() * 4);
        x.drawImage(src, v * TS, 0, TS, TS, tx * TS, ty * TS, TS, TS);
        if (ch === '#') {
          // 墙体压暗 + 底边高光，做出体积感
          x.fillStyle = `rgba(0,0,0,${this.def.wallShade ?? 0.35})`;
          x.fillRect(tx * TS, ty * TS, TS, TS);
          if (!this.tileSolid(tx, ty + 1)) {
            x.fillStyle = 'rgba(0,0,0,0.5)';
            x.fillRect(tx * TS, ty * TS + TS - 5, TS, 5);
          }
          if (!this.tileSolid(tx, ty - 1)) {
            x.fillStyle = 'rgba(255,255,255,0.05)';
            x.fillRect(tx * TS, ty * TS, TS, 2);
          }
        } else if (ch === '~') {
          x.fillStyle = 'rgba(20,40,45,0.35)';
          x.fillRect(tx * TS, ty * TS, TS, TS);
        }
      }
    }
    // 非墙瓦片接缝阴影（墙投影）
    for (let ty = 0; ty < this.h; ty++) {
      for (let tx = 0; tx < this.w; tx++) {
        if (this.cell(tx, ty) === '#' || this.tileSolid(tx, ty)) continue;
        if (this.tileSolid(tx, ty - 1)) {
          const g = x.createLinearGradient(0, ty * TS, 0, ty * TS + 14);
          g.addColorStop(0, 'rgba(0,0,0,0.55)'); g.addColorStop(1, 'rgba(0,0,0,0)');
          x.fillStyle = g;
          x.fillRect(tx * TS, ty * TS, TS, 14);
        }
      }
    }
    this.groundCv = cv;
  }

  _initProps() {
    for (const p of (this.def.props || [])) {
      const img = Assets.img(p.art);
      const s = p.s || 1;
      const w = (img ? img.width : 32) * s, h = (img ? img.height : 32) * s;
      const px = p.x * TS, py = p.y * TS;
      const prop = {
        ...p, img, px, py, w, h,
        // 碰撞盒：取脚部
        bx0: px - w * 0.4, bx1: px + w * 0.4,
        by0: py - h * 0.16, by1: py + h * 0.2,
        hidden: !!p.initialHidden,
      };
      if (p.doorFlag && this.game.flag(p.doorFlag)) prop.hidden = true;
      if (p.showFlag && !this.game.flag(p.showFlag)) prop.hidden = true;
      if (p.hideFlag && this.game.flag(p.hideFlag)) prop.hidden = true;
      this.props.push(prop);
    }
  }

  refreshDoors() {
    for (const p of this.props) {
      p.hidden = !!p.initialHidden;
      if (p.doorFlag && this.game.flag(p.doorFlag)) p.hidden = true;
      if (p.showFlag && !this.game.flag(p.showFlag)) p.hidden = true;
      if (p.hideFlag && this.game.flag(p.hideFlag)) p.hidden = true;
    }
  }

  nearestInteract(px, py, rad = 52) {
    let best = null, bd = rad;
    for (const p of this.props) {
      if (!p.id || p.hidden) continue;
      const d = dist(px, py, p.px, p.py - p.h * 0.2);
      if (d < bd) { bd = d; best = p; }
    }
    for (const e of this.entities) {
      if (e.kind === 'npc' && !e.dead) {
        const d = dist(px, py, e.x, e.y);
        if (d < bd) { bd = d; best = e; }
      }
    }
    return best;
  }

  draw(R, game) {
    const x = R.ctx, ox = R.cam.ox(), oy = R.cam.oy();
    // 地面（仅可见区域）
    const sx = clamp(R.cam.x - 480, 0, this.pw), sy = clamp(R.cam.y - 270, 0, this.ph);
    x.drawImage(this.groundCv, sx, sy, 960, 540, Math.round(sx + ox), Math.round(sy + oy), 960, 540);
    this._drawSceneAtmosphere(x, ox, oy, R, 'back');

    // 道具光源
    for (const p of this.props) {
      if (p.light && !p.hidden) R.addLight(p.px, p.py - p.h * 0.3, p.light[0], 0.9, p.light[1], 0.06);
    }
    for (const c of this.candles) R.addLight(c.x, c.y - 6, 80, 0.85, 'rgba(230,170,90,0.5)', 0.1);

    // y 排序绘制：道具 + 实体 + 拾取物
    const drawables = [];
    for (const p of this.props) if (!p.hidden) drawables.push({ y: p.py + p.h * 0.18, fn: () => this._drawProp(x, p, ox, oy, R) });
    for (const e of this.entities) if (!e.gone) drawables.push({ y: e.y, fn: () => e.draw(x, ox, oy, R, game) });
    for (const pk of this.pickups) drawables.push({ y: pk.y, fn: () => this._drawPickup(x, pk, ox, oy, R) });
    for (const c of this.candles) drawables.push({ y: c.y, fn: () => this._drawCandle(x, c, ox, oy, R) });
    drawables.sort((a, b) => a.y - b.y);
    for (const d of drawables) d.fn();
    this._drawSceneAtmosphere(x, ox, oy, R, 'front');
  }

  _drawSceneAtmosphere(x, ox, oy, R, layer) {
    const id = this.game.mapId;
    const t = R.time;
    if (layer === 'front') {
      x.save();
      if (id === 'shanlu' || id === 'station') {
        for (let i = 0; i < 5; i++) {
          const yy = 70 + i * 88 + Math.sin(t * 0.5 + i) * 12;
          const drift = ((t * 18 + i * 137) % 260) - 130;
          const g = x.createLinearGradient(0, yy, 960, yy + 20);
          g.addColorStop(0, 'rgba(120,135,135,0)');
          g.addColorStop(0.5, id === 'shanlu' ? 'rgba(128,138,130,0.09)' : 'rgba(150,165,170,0.075)');
          g.addColorStop(1, 'rgba(120,135,135,0)');
          x.fillStyle = g;
          x.fillRect(drift - 120, yy, 1200, 26);
        }
      }
      if (id === 'dijiao' || id === 'hezangmu') {
        for (let i = 0; i < 4; i++) {
          const yy = 120 + i * 78 + Math.sin(t * 0.7 + i) * 10;
          x.fillStyle = `rgba(90,92,105,${0.045 + i * 0.008})`;
          x.fillRect(-40 + Math.sin(t + i) * 32, yy, 1040, 18);
        }
      }
      if (id === 'laozhai' && this.game.flag('home_paperman_revealed')) {
        const a = 0.16 + Math.sin(t * 3.4) * 0.05;
        x.fillStyle = `rgba(140,20,30,${a})`;
        x.beginPath(); x.ellipse(710 + Math.sin(t * 1.1) * 8, 210, 95, 42, -0.3, 0, TAU); x.fill();
      }
      x.restore();
      return;
    }

    x.save();
    x.translate(ox, oy);
    if (id === 'bus') {
      const w = this.pw, h = this.ph;
      const glow = x.createLinearGradient(0, 60, w, 210);
      glow.addColorStop(0, 'rgba(30,42,50,0.55)');
      glow.addColorStop(0.5, 'rgba(120,150,165,0.08)');
      glow.addColorStop(1, 'rgba(20,24,28,0.62)');
      x.fillStyle = glow;
      x.fillRect(64, 88, w - 128, h - 150);
      x.strokeStyle = 'rgba(210,220,220,0.08)';
      x.lineWidth = 2;
      for (let i = 0; i < 7; i++) {
        const xx = 110 + i * 110;
        x.beginPath(); x.moveTo(xx, 78); x.lineTo(xx + Math.sin(t + i) * 12, 178); x.stroke();
      }
      x.fillStyle = 'rgba(0,0,0,0.42)';
      x.fillRect(72, 96, w - 144, 22);
      x.fillStyle = 'rgba(160,180,190,0.08)';
      x.fillRect(100, 130, w - 220, 18);
    } else if (id === 'station') {
      x.fillStyle = 'rgba(0,0,0,0.34)';
      x.fillRect(120, 96, 880, 38);
      x.fillRect(110, 480, 650, 18);
      for (let i = 0; i < 7; i++) {
        x.fillStyle = `rgba(110,130,135,${0.08 + (i % 2) * 0.04})`;
        x.beginPath();
        x.ellipse(360 + i * 62, 565 + Math.sin(t + i) * 3, 42, 8, 0, 0, TAU);
        x.fill();
      }
      x.strokeStyle = 'rgba(180,190,190,0.08)';
      for (let i = 0; i < 5; i++) {
        x.beginPath(); x.moveTo(260 + i * 120, 180); x.lineTo(240 + i * 120, 510); x.stroke();
      }
    } else if (id === 'shanlu') {
      x.fillStyle = 'rgba(0,0,0,0.26)';
      for (let i = 0; i < 13; i++) {
        const yy = i * 105 + 40;
        x.beginPath();
        x.ellipse(420 + Math.sin(i) * 36, yy, 92, 12, -0.08, 0, TAU);
        x.fill();
      }
      x.strokeStyle = 'rgba(160,170,145,0.08)';
      x.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const y = 150 + i * 70;
        x.beginPath(); x.moveTo(350, y); x.lineTo(490, y + 24); x.stroke();
      }
    } else if (id === 'laozhai') {
      x.fillStyle = 'rgba(0,0,0,0.34)';
      x.fillRect(360, 58, 640, 22);
      x.fillRect(64, 58, 270, 22);
      x.fillRect(1024, 58, 310, 22);
      x.fillRect(1024, 536, 310, 18);
      x.fillRect(64, 608, 260, 16);
      x.strokeStyle = 'rgba(201,164,92,0.12)';
      x.lineWidth = 2;
      for (const [x0, y0, x1, y1] of [[380, 330, 990, 330], [996, 320, 1260, 560], [80, 340, 330, 340]]) {
        x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
      }
      x.fillStyle = 'rgba(80,35,28,0.08)';
      x.fillRect(384, 76, 608, 240);
    } else if (id === 'dijiao') {
      x.strokeStyle = 'rgba(90,82,70,0.22)';
      x.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const x0 = 80 + (i * 71) % 610;
        const y0 = 70 + (i * 43) % 430;
        x.beginPath();
        x.moveTo(x0, y0);
        x.lineTo(x0 + 16, y0 + 21);
        x.lineTo(x0 + 6, y0 + 48);
        x.stroke();
      }
      x.fillStyle = 'rgba(120,100,80,0.07)';
      x.beginPath(); x.ellipse(610, 390, 190, 28, 0.1, 0, TAU); x.fill();
    }
    x.restore();
  }

  _drawProp(x, p, ox, oy, R) {
    const px = p.px + ox, py = p.py + oy;
    // 投影
    x.fillStyle = 'rgba(0,0,0,0.35)';
    x.beginPath();
    x.ellipse(px, py + p.h * 0.17, p.w * 0.32, p.h * 0.09, 0, 0, TAU);
    x.fill();
    if (p.img) {
      let sway = 0;
      if (p.art === 'pr_lantern') sway = Math.sin(R.time * 1.7 + p.px) * 0.06;
      if (sway) {
        x.save(); x.translate(px, py - p.h * 0.5); x.rotate(sway);
        x.drawImage(p.img, -p.w / 2, -p.h * 0.5, p.w, p.h);
        x.restore();
      } else {
        x.drawImage(p.img, px - p.w / 2, py - p.h * 0.8, p.w, p.h);
      }
    } else {
      x.fillStyle = '#555'; x.fillRect(px - 12, py - 24, 24, 24);
    }
  }

  _drawPickup(x, pk, ox, oy, R) {
    const bob = Math.sin(R.time * 3 + pk.seed) * 3;
    const px = pk.x + ox, py = pk.y + oy + bob;
    x.fillStyle = 'rgba(0,0,0,0.3)';
    x.beginPath(); x.ellipse(px, pk.y + oy + 8, 9, 3.5, 0, 0, TAU); x.fill();
    const img = Assets.img(pk.icon);
    // 稀有度光圈
    if (pk.glow) {
      const g = x.createRadialGradient(px, py - 8, 2, px, py - 8, 18);
      g.addColorStop(0, pk.glow); g.addColorStop(1, 'rgba(0,0,0,0)');
      x.fillStyle = g;
      x.beginPath(); x.arc(px, py - 8, 18, 0, TAU); x.fill();
    }
    if (img) x.drawImage(img, px - 12, py - 20, 24, 24);
    else { x.fillStyle = '#dca'; x.fillRect(px - 6, py - 14, 12, 12); }
  }

  _drawCandle(x, c, ox, oy, R) {
    const px = c.x + ox, py = c.y + oy;
    x.fillStyle = '#d8cfb8';
    x.fillRect(px - 2, py - 10, 4, 10);
    const fl = 2 + Math.sin(R.time * 12 + c.x) * 1;
    x.fillStyle = '#ffcf7a';
    x.beginPath(); x.ellipse(px, py - 12, 2, fl + 2, 0, 0, TAU); x.fill();
  }
}

// ------------------------------------------------------------
// 实体基类
// ------------------------------------------------------------
export class Entity {
  constructor(x, y) {
    this.x = x; this.y = y;
    this.size = 12;
    this.hp = 10; this.maxhp = 10;
    this.dead = false; this.gone = false;
    this.flashT = 0;
    this.kind = 'entity';
    this.knockx = 0; this.knocky = 0;
  }
  applyKnock(map, dt) {
    if (Math.abs(this.knockx) > 1 || Math.abs(this.knocky) > 1) {
      map.moveCircle(this, this.knockx * dt, this.knocky * dt);
      this.knockx *= Math.pow(0.0001, dt);
      this.knocky *= Math.pow(0.0001, dt);
    }
  }
  drawShadow(x, px, py, w = 12) {
    x.fillStyle = 'rgba(0,0,0,0.4)';
    x.beginPath(); x.ellipse(px, py + 3, w, w * 0.36, 0, 0, TAU); x.fill();
  }
}

// ------------------------------------------------------------
// 玩家
// ------------------------------------------------------------
export class Player extends Entity {
  constructor(x, y, game) {
    super(x, y);
    this.game = game;
    this.kind = 'player';
    this.size = 11;
    this.face = { x: 0, y: 1 };
    this.walkT = 0; this.moving = false;
    this.state = 'idle'; // idle walk attack dodge hurt dead
    this.stateT = 0;
    this.combo = 0; this.comboWindow = 0;
    this.attackArc = null; // {ang, t, dur, heavy}
    this.dodgeDir = { x: 0, y: 1 };
    this.iframes = 0;
    this.lampOn = true;
    this.stepT = 0;
    this.chargeT = 0; this.charging = false;
    this.hitThisSwing = new Set();
    this.guardT = 0;
    this.skillCd = [0, 0];
  }

  get stats() { return this.game.pstats; }

  weaponDef() {
    const w = this.game.equip.weapon;
    return w ? WEAPONS[w.base] : WEAPONS.shovel;
  }

  update(dt, map) {
    const g = this.game;
    const st = this.stats;
    this.stateT += dt;
    if (this.iframes > 0) this.iframes -= dt;
    if (this.comboWindow > 0) this.comboWindow -= dt; else this.combo = 0;
    this.guardT = Math.max(0, this.guardT - dt);
    this.skillCd[0] = Math.max(0, this.skillCd[0] - dt);
    this.skillCd[1] = Math.max(0, this.skillCd[1] - dt);

    if (this.state === 'dead') return;

    // ---- 攻击蓄力检测 ----
    const wd = this.weaponDef();
    const agg = g.aggStats;
    const atkSpd = wd.speed * (1 + agg.atkspd);

    if (this.state === 'idle' || this.state === 'walk') {
      if (Input.pressed('turn')) {
        Input.consume('turn');
        this.face.x *= -1; this.face.y *= -1;
      }
      if (Input.pressed('switch')) {
        Input.consume('switch');
        g.switchWeapon();
      }
      if (Input.pressed('heal')) {
        Input.consume('heal');
        g.quickHeal();
      }
      if (Input.pressed('skill1') && this.skillCd[0] <= 0) {
        Input.consume('skill1');
        g.castSkill(1);
        this.skillCd[0] = 7;
      }
      if (Input.pressed('skill2') && this.skillCd[1] <= 0) {
        Input.consume('skill2');
        g.castSkill(2);
        this.skillCd[1] = 11;
      }
      if (Input.down('block') && st.stam > 0) {
        if (this.state !== 'guard') this.guardT = 0.18;
        this.state = 'guard';
        this.moving = false;
        st.stam = Math.max(0, st.stam - 5 * dt);
        return;
      }
      // 移动
      const ax = Input.axis();
      this.moving = (ax.x !== 0 || ax.y !== 0);
      if (this.moving) {
        const spd = 150 * (1 + agg.movespd) * (st.stam <= 0 ? 0.7 : 1);
        map.moveCircle(this, ax.x * spd * dt, ax.y * spd * dt);
        const fl = Math.hypot(ax.x, ax.y);
        this.face.x = ax.x / fl; this.face.y = ax.y / fl;
        this.walkT += dt;
        this.stepT -= dt;
        if (this.stepT <= 0) {
          this.stepT = 0.34;
          if (!agg.quiet) AudioSys.sfx(map.def.tiles.floor === 'wood' ? 'step_wood' : 'step', { alt: Math.random() > 0.5, vol: 0.5 });
        }
        this.state = 'walk';
      } else this.state = 'idle';

      // 翻滚
      if (Input.pressed('dodge') && st.stam >= 22) {
        Input.consume('dodge');
        st.stam -= 22; st.stamCd = 0.7;
        this.state = 'dodge'; this.stateT = 0;
        this.iframes = 0.3;
        const d = this.moving ? Input.axis() : this.face;
        const dl = Math.hypot(d.x, d.y) || 1;
        this.dodgeDir = { x: d.x / dl, y: d.y / dl };
        AudioSys.sfx('dodge');
      }
      // 攻击（按下开始蓄力，松开或短按出招）
      if (Input.down('attack') && st.stam > 0) {
        this.charging = true;
        this.chargeT += dt;
        if (this.chargeT > 0.85) { this._doAttack(map, true); }
      } else if (this.charging) {
        this._doAttack(map, this.chargeT > 0.45);
      }
    } else if (this.state === 'guard') {
      if (!Input.down('block') || st.stam <= 0) { this.state = 'idle'; this.stateT = 0; }
    } else if (this.state === 'dodge') {
      const spd = 330 * (1 + agg.dodgeRange);
      map.moveCircle(this, this.dodgeDir.x * spd * dt, this.dodgeDir.y * spd * dt);
      if (this.stateT > 0.26) { this.state = 'idle'; this.stateT = 0; }
    } else if (this.state === 'attack') {
      const a = this.attackArc;
      if (a) {
        a.t += dt * atkSpd;
        // 攻击期间小幅前移
        if (a.t < a.dur * 0.5) map.moveCircle(this, this.face.x * 60 * dt, this.face.y * 60 * dt);
        if (a.t >= a.dur * 0.35 && !a.hitDone) {
          a.hitDone = true;
          this.game.meleeHit(this, a);
        }
        if (a.t >= a.dur) {
          this.attackArc = null;
          this.state = 'idle'; this.stateT = 0;
          this.comboWindow = 0.9;
        }
      } else { this.state = 'idle'; }
    } else if (this.state === 'hurt') {
      if (this.stateT > 0.32) { this.state = 'idle'; this.stateT = 0; }
    }

    this.applyKnock(map, dt);

    // 灯火消耗
    const lampDef = g.lampDef();
    if (this.lampOn && lampDef) {
      st.oil -= lampDef.stats.drain * dt * (1 - clamp(agg.oilEff, 0, 0.6)) * 0.55;
      if (st.oil <= 0) { st.oil = 0; this.lampOn = false; g.ui.toast('灯油尽了。'); AudioSys.sfx('fire'); }
    }
    if (Input.pressed('lamp')) {
      Input.consume('lamp');
      if (!lampDef) g.ui.toast('没有灯具。');
      else if (st.oil <= 0) { g.ui.toast('没有灯油了。'); AudioSys.sfx('error'); }
      else { this.lampOn = !this.lampOn; AudioSys.sfx('fire'); g.onLampToggle(); }
    }

    // 体力回复
    if (st.stamCd > 0) st.stamCd -= dt;
    else st.stam = clamp(st.stam + 38 * dt, 0, st.maxstam);
  }

  _doAttack(map, heavy) {
    const st = this.stats, wd = this.weaponDef();
    this.charging = false; this.chargeT = 0;
    const cost = heavy ? wd.stamCost * 1.7 : wd.stamCost;
    if (st.stam < cost * 0.5) { this.game.tutorial('tut.stamina'); return; }
    st.stam = Math.max(0, st.stam - cost); st.stamCd = 0.55;
    // 鼠标朝向
    if (Input.lastDevice === 'kb' && Input.mouse.down || Input.mouse.clicked) {
      // 使用鼠标位置定向（屏幕中心为玩家近似）
    }
    this.combo = (this.combo % wd.combo) + 1;
    this.state = 'attack'; this.stateT = 0;
    this.hitThisSwing.clear();
    this.attackArc = {
      ang: Math.atan2(this.face.y, this.face.x),
      t: 0, dur: heavy ? 0.5 : 0.32,
      heavy, combo: this.combo,
      range: wd.range + (heavy ? 14 : 0),
      arc: wd.arc + (heavy ? 0.5 : 0),
      hitDone: false,
    };
    AudioSys.sfx(heavy ? 'swing_heavy' : 'swing', { vol: 0.8 });
  }

  hurt(dmg, fromX, fromY, game) {
    if (this.iframes > 0 || this.state === 'dead') return false;
    if (this.state === 'guard' && this.stats.stam > 0) {
      const perfect = this.guardT > 0;
      this.stats.stam = Math.max(0, this.stats.stam - (perfect ? 5 : 18));
      AudioSys.sfx(perfect ? 'zhenxie' : 'hit');
      game.R.shake(perfect ? 5 : 2, 0.14);
      game.R.floatText(this.x, this.y - 38, perfect ? '完美格挡' : '格挡', perfect ? '#e8b23a' : '#c9c2ae', perfect ? 16 : 13);
      if (perfect) {
        game.onPerfectBlock(fromX, fromY);
        this.iframes = 0.28;
        return false;
      }
      dmg *= 0.28;
    }
    const def = game.aggStats.def || 0;
    const real = Math.max(1, Math.round(dmg * (1 - clamp(def / (def + 60), 0, 0.6))));
    const st = this.stats;
    st.hp -= real;
    this.iframes = 0.55;
    this.state = 'hurt'; this.stateT = 0;
    const a = angTo(fromX, fromY, this.x, this.y);
    this.knockx = Math.cos(a) * 220; this.knocky = Math.sin(a) * 220;
    AudioSys.sfx('hurt');
    game.R.shake(7, 0.3);
    game.R.flash('rgba(120,20,25,0.5)', 0.18);
    game.R.spawnParts({ x: this.x, y: this.y - 10, n: 8, col: '#7d2330', sp: 90, life: 0.5 });
    if (st.hp <= 0) { st.hp = 0; this.state = 'dead'; game.onPlayerDeath(); }
    return true;
  }

  _drawHeroFigure(x, R, game) {
    const step = this.moving ? Math.sin(this.walkT * 11) : 0;
    const hurt = this.state === 'hurt';
    const guard = this.state === 'guard';
    const attack = this.state === 'attack' || !!this.attackArc;
    const lampOn = this.lampOn && game.pstats.oil > 0;
    x.lineCap = 'round';
    x.lineJoin = 'round';

    // legs and muddy boots
    x.strokeStyle = '#141318';
    x.lineWidth = 5;
    x.beginPath();
    x.moveTo(-5, 5); x.lineTo(-7 - step * 1.2, 18);
    x.moveTo(6, 5); x.lineTo(8 + step * 1.2, 18);
    x.stroke();
    x.strokeStyle = '#2b2219';
    x.lineWidth = 7;
    x.beginPath();
    x.moveTo(-8 - step, 18); x.lineTo(-14 - step, 19);
    x.moveTo(8 + step, 18); x.lineTo(14 + step, 19);
    x.stroke();

    // long waxed coat
    const coatGrad = x.createLinearGradient(0, -19, 0, 15);
    coatGrad.addColorStop(0, hurt ? '#493039' : '#26252b');
    coatGrad.addColorStop(0.48, '#171920');
    coatGrad.addColorStop(1, '#101116');
    x.fillStyle = coatGrad;
    x.strokeStyle = '#5b4a31';
    x.lineWidth = 1.4;
    x.beginPath();
    x.moveTo(-11, -10);
    x.quadraticCurveTo(-15, 1, -12, 15);
    x.lineTo(0, 19);
    x.lineTo(12, 15);
    x.quadraticCurveTo(15, 1, 11, -10);
    x.quadraticCurveTo(0, -18, -11, -10);
    x.closePath();
    x.fill(); x.stroke();

    // belt, satchel and jade charm
    x.fillStyle = '#5a3925';
    x.fillRect(-11, 1, 22, 4);
    x.strokeStyle = '#8d6f3e';
    x.lineWidth = 2;
    x.beginPath(); x.moveTo(-12, -8); x.lineTo(11, 11); x.stroke();
    x.fillStyle = '#293a32';
    x.beginPath(); x.roundRect?.(5, 6, 9, 9, 2);
    if (!x.roundRect) x.rect(5, 6, 9, 9);
    x.fill();
    x.fillStyle = '#6fb08b';
    x.beginPath(); x.ellipse(-2, 4, 2.8, 3.8, 0, 0, TAU); x.fill();

    // arms: one protects the chest, one carries lamp/weapon
    x.strokeStyle = '#1a1a20';
    x.lineWidth = guard ? 7 : 5.5;
    x.beginPath();
    x.moveTo(-10, -6); x.quadraticCurveTo(-17, 1, -14, 7 + step * 0.4);
    x.moveTo(10, -6); x.quadraticCurveTo(attack ? 22 : 17, attack ? -2 : 1, attack ? 23 : 14, attack ? -10 : 7 - step * 0.4);
    x.stroke();
    if (lampOn) {
      x.strokeStyle = '#80613a';
      x.lineWidth = 2;
      x.beginPath(); x.moveTo(-14, 7); x.lineTo(-19, 14); x.stroke();
      const g = x.createRadialGradient(-22, 15, 2, -22, 15, 19);
      g.addColorStop(0, 'rgba(255,198,94,0.78)');
      g.addColorStop(0.52, 'rgba(217,137,56,0.22)');
      g.addColorStop(1, 'rgba(217,137,56,0)');
      x.fillStyle = g;
      x.beginPath(); x.arc(-22, 15, 19, 0, TAU); x.fill();
      x.fillStyle = '#6b4828';
      x.fillRect(-25, 11, 7, 10);
      x.fillStyle = '#d8b46b';
      x.fillRect(-24, 13, 5, 5);
    }

    // head, wet hair, tired face
    x.fillStyle = '#b89a78';
    x.beginPath(); x.ellipse(0, -20, 7.2, 8.2, 0, 0, TAU); x.fill();
    x.fillStyle = '#171318';
    x.beginPath();
    x.moveTo(-7, -22);
    x.quadraticCurveTo(-2, -31, 7, -23);
    x.quadraticCurveTo(4, -25, 2, -19);
    x.quadraticCurveTo(-4, -22, -7, -18);
    x.closePath();
    x.fill();
    x.strokeStyle = hurt ? '#b64a52' : '#2b2525';
    x.lineWidth = 1.2;
    x.beginPath(); x.moveTo(-3.5, -19); x.lineTo(-1.2, -18.6); x.moveTo(3.5, -19); x.lineTo(1.2, -18.6); x.stroke();
    x.strokeStyle = '#6f2530';
    x.beginPath(); x.moveTo(-2, -15); x.quadraticCurveTo(0, -14, 3, -15); x.stroke();

    // weapon/readable combat pose
    const weaponKey = game.equip.weapon?.base || 'shovel';
    if (game.equip.weapon) {
      x.save();
      x.translate(attack ? 24 : 15, attack ? -10 : 5);
      x.rotate(attack ? -0.82 : -0.25);
      x.strokeStyle = weaponKey === 'peach' ? '#8a4b3b' : '#756c5c';
      x.lineWidth = weaponKey === 'peach' ? 3 : 4;
      x.beginPath(); x.moveTo(0, 13); x.lineTo(0, -18); x.stroke();
      x.fillStyle = weaponKey === 'peach' ? '#b06a4c' : '#9a9a88';
      x.beginPath();
      x.moveTo(-5, -18); x.lineTo(5, -18); x.lineTo(2, -28); x.lineTo(-2, -28);
      x.closePath(); x.fill();
      x.restore();
    }

    if (guard) {
      x.strokeStyle = 'rgba(201,164,92,0.65)';
      x.lineWidth = 2;
      x.beginPath(); x.arc(0, -6, 18, -2.4, 0.4); x.stroke();
    }
  }

  draw(x, ox, oy, R, game) {
    const px = this.x + ox, py = this.y + oy;
    this.drawShadow(x, px, py, 11);
    // 选择朝向贴图
    let img, flip = false;
    if (Math.abs(this.face.x) > Math.abs(this.face.y)) {
      img = Assets.img('pc_side'); flip = this.face.x < 0;
    } else img = Assets.img(this.face.y < 0 ? 'pc_back' : 'pc_front');
    const bob = this.moving ? Math.sin(this.walkT * 11) * 1.8 : Math.sin(R.time * 1.8) * 0.7;
    const lean = this.state === 'dodge' ? 0.5 : (this.state === 'attack' ? 0.16 : 0);
    x.save();
    x.translate(px, py - 17 + bob);
    if (flip) x.scale(-1, 1);
    x.rotate(lean * (this.state === 'dodge' ? (this.dodgeDir.x >= 0 ? 1 : -1) : 1));
    if (this.iframes > 0 && Math.floor(R.time * 20) % 2) x.globalAlpha = 0.5;
    if (img) {
      x.globalAlpha *= 0.22;
      x.drawImage(img, -16, -22, 32, 44);
      x.globalAlpha = (this.iframes > 0 && Math.floor(R.time * 20) % 2) ? 0.5 : 1;
    }
    this._drawHeroFigure(x, R, game);
    x.restore();
    x.globalAlpha = 1;
    if (this.state === 'guard') {
      x.strokeStyle = this.guardT > 0 ? '#e8b23a' : '#b8ad92';
      x.lineWidth = 3;
      x.beginPath();
      x.arc(px + this.face.x * 10, py - 14 + this.face.y * 5, 15, -1.1, 1.1);
      x.stroke();
    }

    // 攻击弧光
    const a = this.attackArc;
    if (a && a.t < a.dur * 0.7) {
      const prog = a.t / (a.dur * 0.7);
      const sweep = a.arc;
      const start = a.ang - sweep / 2 + sweep * prog * 0.8;
      x.save();
      x.translate(px, py - 8);
      x.globalAlpha = 0.75 * (1 - prog);
      const grad = x.createRadialGradient(0, 0, a.range * 0.3, 0, 0, a.range);
      const col = a.heavy ? '200,120,60' : '210,200,170';
      grad.addColorStop(0, `rgba(${col},0)`);
      grad.addColorStop(0.8, `rgba(${col},0.7)`);
      grad.addColorStop(1, `rgba(${col},0)`);
      x.fillStyle = grad;
      x.beginPath();
      x.moveTo(0, 0);
      x.arc(0, 0, a.range, start, start + sweep * 0.45);
      x.closePath();
      x.fill();
      // 武器残影
      const wimg = Assets.img(WEAPONS[game.equip.weapon?.base || 'shovel'].icon);
      if (wimg) {
        const wa = start + sweep * 0.25;
        x.globalAlpha = 1 - prog * 0.7;
        x.translate(Math.cos(wa) * a.range * 0.6, Math.sin(wa) * a.range * 0.6);
        x.rotate(wa + Math.PI / 4);
        x.drawImage(wimg, -12, -12, 24, 24);
      }
      x.restore();
      x.globalAlpha = 1;
    }
    // 蓄力提示
    if (this.charging && this.chargeT > 0.3) {
      const k = clamp((this.chargeT - 0.3) / 0.55, 0, 1);
      x.strokeStyle = `rgba(220,160,80,${0.4 + k * 0.5})`;
      x.lineWidth = 2;
      x.beginPath(); x.arc(px, py - 14, 16 + k * 6, -Math.PI / 2, -Math.PI / 2 + k * TAU); x.stroke();
    }
  }
}

// ------------------------------------------------------------
// 敌人
// ------------------------------------------------------------
export class Enemy extends Entity {
  constructor(type, x, y, game) {
    super(x, y);
    this.kind = 'enemy';
    this.type = type;
    this.def = ENEMY_DEFS[type];
    this.game = game;
    const scale = game.enemyScale?.() || { hp: 1, dmg: 1, speed: 1 };
    this.hp = this.maxhp = Math.round(this.def.hp * scale.hp);
    this.damage = Math.round(this.def.dmg * scale.dmg);
    this.size = this.def.size;
    this.speed = this.def.speed * scale.speed;
    this.state = 'idle'; // idle chase windup strike tired
    this.stateT = 0;
    this.atkCd = 0;
    this.alpha = 1;
    this.phase = Math.random() * TAU;
    this.aware = false;
    this.wanderA = Math.random() * TAU;
    this.visFactor = 1; // 红衣影显形程度
    this.staggerT = 0;
  }

  update(dt, map) {
    if (this.dead) { this.gone = true; return; }
    const g = this.game, p = g.player;
    this.stateT += dt;
    if (this.atkCd > 0) this.atkCd -= dt;
    if (this.flashT > 0) this.flashT -= dt;
    if (this.staggerT > 0) { this.staggerT -= dt; this.applyKnock(map, dt); return; }

    const d = dist(this.x, this.y, p.x, p.y);
    if (!this.aware && d < this.def.sense && p.state !== 'dead') {
      this.aware = true;
      if (this.def.cls === 'ghost') AudioSys.sfx('whisper', { vol: 0.7 });
      else AudioSys.sfx('paper', { vol: 0.6 });
    }

    // 红衣影显形度：靠灯与铜铃
    if (this.def.behavior === 'phase') {
      const lit = p.lampOn && d < g.lampRadius() + 40;
      const bell = g.aggStats.revealGhost > 0;
      const target = (lit || bell) ? 1 : 0.35 + 0.3 * Math.sin(this.phase + g.R.time * 1.3);
      this.visFactor = lerp(this.visFactor, target, 1 - Math.pow(0.05, dt));
    }

    if (!this.aware || p.state === 'dead') {
      // 游荡
      this.wanderA += (Math.random() - 0.5) * dt * 3;
      map.moveCircle(this, Math.cos(this.wanderA) * this.speed * 0.25 * dt, Math.sin(this.wanderA) * this.speed * 0.25 * dt);
      this.applyKnock(map, dt);
      return;
    }

    const aToP = angTo(this.x, this.y, p.x, p.y);
    let spd = this.speed;

    // 行为
    if (this.def.behavior === 'facefear') {
      // 被注视减速：玩家朝向与「玩家→敌」方向同向 = 被看见
      const facing = Math.atan2(p.face.y, p.face.x);
      const seen = Math.abs(angDiff(facing, angTo(p.x, p.y, this.x, this.y))) < 1.0;
      spd *= seen ? 0.22 : 1.75;
      this.watched = seen;
    } else if (this.def.behavior === 'phase') {
      spd *= 0.4 + this.visFactor * 0.8;
    }

    if (this.state === 'windup') {
      if (this.stateT > (this.windupDur || 0.45)) {
        this.state = 'strike'; this.stateT = 0;
        // 判定
        const dd = dist(this.x, this.y, p.x, p.y);
        if (this.type === 'bearer' && this.lunging) {
          // 突进在 strike 期间持续
        } else if (dd < this.def.atkRange + p.size + 6) {
          p.hurt(this.damage, this.x, this.y, g);
        }
        AudioSys.sfx(this.def.cls === 'ghost' ? 'hit_ghost' : 'swing', { vol: 0.7 });
      }
    } else if (this.state === 'strike') {
      if (this.lunging) {
        map.moveCircle(this, Math.cos(this.lungeA) * this.def.lungeSpeed * dt, Math.sin(this.lungeA) * this.def.lungeSpeed * dt);
        if (dist(this.x, this.y, p.x, p.y) < this.size + p.size + 4 && !this.lungeHit) {
          this.lungeHit = true;
          p.hurt(this.damage, this.x, this.y, g);
        }
        if (this.stateT > 0.42) { this.lunging = false; this.state = 'tired'; this.stateT = 0; }
      } else if (this.stateT > 0.2) { this.state = 'chase'; this.stateT = 0; }
    } else if (this.state === 'tired') {
      if (this.stateT > 0.9) { this.state = 'chase'; this.stateT = 0; }
    } else {
      // chase / circle
      this.state = 'chase';
      let mvA = aToP;
      if (this.def.behavior === 'circle' && d < 130 && this.atkCd > 0) {
        mvA = aToP + Math.PI / 2 * (this.phase > Math.PI ? 1 : -1);
      }
      if (d > this.def.atkRange * 0.7) {
        map.moveCircle(this, Math.cos(mvA) * spd * dt, Math.sin(mvA) * spd * dt);
      }
      // 起手
      if (this.atkCd <= 0 && d < (this.type === 'bearer' ? 150 : this.def.atkRange + 14)) {
        this.state = 'windup'; this.stateT = 0;
        this.atkCd = this.def.atkCd + Math.random() * 0.5;
        if (this.type === 'bearer' && d > 60) {
          this.lunging = true; this.lungeHit = false;
          this.lungeA = aToP;
          this.windupDur = 0.55;
        } else {
          this.lunging = false;
          this.windupDur = this.def.cls === 'ghost' ? 0.5 : 0.4;
        }
      }
    }
    this.applyKnock(map, dt);
  }

  hurt(dmg, opt, game) {
    if (this.dead) return { died: false, dmg: 0 };
    // 灵体减伤
    let mult = 1;
    if (this.def.cls === 'ghost') {
      if (opt.dmgType === 'zhen') mult = 1;
      else mult = this.visFactor > 0.7 ? 0.45 : 0.12;
    }
    const real = Math.max(1, Math.round(dmg * mult));
    this.hp -= real;
    this.flashT = 0.12;
    this.aware = true;
    const kb = (opt.knock || 160) * (1 - (this.def.knockResist || 0));
    this.knockx = Math.cos(opt.ang) * kb; this.knocky = Math.sin(opt.ang) * kb;
    if (opt.heavy) this.staggerT = 0.5;
    if (this.def.cls === 'paper') {
      game.R.spawnParts({ x: this.x, y: this.y - 12, n: 10, col: '#cfc7b0', sp: 110, life: 0.7, rect: true, up: 60 });
      AudioSys.sfx('hit_paper');
    } else if (this.def.cls === 'ghost') {
      game.R.spawnParts({ x: this.x, y: this.y - 12, n: 8, col: '#a33c3c', sp: 70, life: 0.6 });
      AudioSys.sfx(opt.dmgType === 'zhen' ? 'zhenxie' : 'hit_ghost');
    } else {
      game.R.spawnParts({ x: this.x, y: this.y - 12, n: 8, col: '#6d2530', sp: 90, life: 0.5 });
      AudioSys.sfx('hit');
    }
    if (this.hp <= 0) {
      this.dead = true;
      game.onEnemyKilled(this);
      return { died: true, dmg: real, mult };
    }
    return { died: false, dmg: real, mult };
  }

  _drawMonsterFigure(x, R, h, w) {
    const t = R.time + this.phase;
    const k = this.state === 'windup' ? clamp(this.stateT / (this.windupDur || 0.45), 0, 1) : 0;
    x.lineCap = 'round';
    x.lineJoin = 'round';
    if (this.type === 'paperwalker') {
      x.fillStyle = '#d8cfb8';
      x.strokeStyle = this.watched ? '#8e2a35' : '#6f6655';
      x.lineWidth = 2;
      x.beginPath();
      x.moveTo(-w * 0.34, -h * 0.45);
      x.lineTo(w * 0.30, -h * 0.42);
      x.lineTo(w * 0.26 + Math.sin(t * 9) * 1.5, h * 0.28);
      x.lineTo(-w * 0.28 + Math.cos(t * 7) * 1.5, h * 0.30);
      x.closePath();
      x.fill(); x.stroke();
      x.strokeStyle = '#9a2c36';
      x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(0, -h * 0.44); x.lineTo(0, h * 0.25); x.stroke();
      x.fillStyle = '#171318';
      x.beginPath(); x.ellipse(0, -h * 0.52, w * 0.22, h * 0.15, 0, 0, TAU); x.fill();
      x.fillStyle = this.watched ? '#c43b42' : '#3a2026';
      x.fillRect(-w * 0.08, -h * 0.55, w * 0.05, 2.2);
      x.fillRect(w * 0.04, -h * 0.55, w * 0.05, 2.2);
      x.strokeStyle = '#b8ad92';
      x.lineWidth = 3;
      x.beginPath();
      x.moveTo(-w * 0.23, -h * 0.25); x.quadraticCurveTo(-w * 0.5, -h * 0.06, -w * 0.28, h * 0.04);
      x.moveTo(w * 0.23, -h * 0.25); x.quadraticCurveTo(w * 0.5, -h * 0.06, w * 0.28, h * 0.04);
      x.stroke();
    } else if (this.type === 'bearer') {
      x.strokeStyle = '#594735';
      x.lineWidth = 5;
      x.beginPath(); x.moveTo(-w * 0.58, -h * 0.48); x.lineTo(w * 0.58, -h * 0.38); x.stroke();
      x.fillStyle = '#c9bea2';
      x.strokeStyle = '#7f6f5c';
      x.lineWidth = 2;
      for (const sx of [-0.24, 0.24]) {
        x.beginPath();
        x.ellipse(w * sx, -h * 0.45, w * 0.17, h * 0.12, 0, 0, TAU);
        x.fill(); x.stroke();
        x.beginPath();
        x.moveTo(w * sx - w * 0.14, -h * 0.32);
        x.lineTo(w * sx + w * 0.15, -h * 0.30);
        x.lineTo(w * sx + w * 0.12, h * 0.24);
        x.lineTo(w * sx - w * 0.16, h * 0.22);
        x.closePath();
        x.fill(); x.stroke();
        x.strokeStyle = '#4a382e';
        x.lineWidth = 3;
        x.beginPath(); x.moveTo(w * sx - w * 0.08, h * 0.22); x.lineTo(w * sx - w * 0.16, h * 0.43);
        x.moveTo(w * sx + w * 0.08, h * 0.22); x.lineTo(w * sx + w * 0.16, h * 0.43); x.stroke();
        x.strokeStyle = '#7f6f5c';
        x.lineWidth = 2;
      }
      if (k > 0) {
        x.fillStyle = `rgba(150,36,45,${0.18 + k * 0.22})`;
        x.beginPath(); x.ellipse(0, -h * 0.2, w * 0.62, h * 0.46, 0, 0, TAU); x.fill();
      }
    } else if (this.type === 'weepchild') {
      x.fillStyle = '#e2d8bd';
      x.strokeStyle = '#7e6e5a';
      x.lineWidth = 1.8;
      x.beginPath(); x.ellipse(0, -h * 0.42, w * 0.22, h * 0.16, 0, 0, TAU); x.fill(); x.stroke();
      x.beginPath();
      x.moveTo(-w * 0.25, -h * 0.29);
      x.lineTo(w * 0.25, -h * 0.29);
      x.lineTo(w * 0.17, h * 0.26);
      x.lineTo(-w * 0.18, h * 0.26);
      x.closePath(); x.fill(); x.stroke();
      x.fillStyle = '#8e2a35';
      x.fillRect(-w * 0.09, -h * 0.45, w * 0.055, 2);
      x.fillRect(w * 0.035, -h * 0.45, w * 0.055, 2);
      x.strokeStyle = '#d8cfb8';
      x.lineWidth = 2.4;
      x.beginPath();
      x.moveTo(-w * 0.18, -h * 0.18); x.quadraticCurveTo(-w * 0.48, -h * 0.02 + Math.sin(t * 4) * 4, -w * 0.3, h * 0.14);
      x.moveTo(w * 0.18, -h * 0.18); x.quadraticCurveTo(w * 0.48, -h * 0.02 + Math.cos(t * 4) * 4, w * 0.3, h * 0.14);
      x.stroke();
      x.fillStyle = 'rgba(210,195,160,0.55)';
      x.fillRect(-w * 0.42, h * 0.02 + Math.sin(t * 6) * 4, 5, 8);
      x.fillRect(w * 0.36, h * 0.06 + Math.cos(t * 5) * 4, 5, 8);
    } else if (this.type === 'redshade' || this.def.cls === 'ghost') {
      const g = x.createLinearGradient(0, -h * 0.65, 0, h * 0.35);
      g.addColorStop(0, 'rgba(137,35,48,0.86)');
      g.addColorStop(0.55, 'rgba(78,20,34,0.62)');
      g.addColorStop(1, 'rgba(42,13,22,0.05)');
      x.fillStyle = g;
      x.beginPath();
      x.moveTo(-w * 0.26, -h * 0.45);
      x.quadraticCurveTo(-w * 0.5, -h * 0.1, -w * 0.28 + Math.sin(t * 2) * 3, h * 0.28);
      x.quadraticCurveTo(0, h * 0.18 + Math.sin(t * 3) * 5, w * 0.28 + Math.cos(t * 2) * 3, h * 0.28);
      x.quadraticCurveTo(w * 0.48, -h * 0.08, w * 0.25, -h * 0.45);
      x.quadraticCurveTo(0, -h * 0.62, -w * 0.26, -h * 0.45);
      x.closePath();
      x.fill();
      x.fillStyle = '#0b090d';
      x.beginPath(); x.ellipse(0, -h * 0.45, w * 0.18, h * 0.16, 0, 0, TAU); x.fill();
      x.strokeStyle = 'rgba(210,75,86,0.75)';
      x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(-w * 0.08, -h * 0.46); x.lineTo(w * 0.08, -h * 0.46); x.stroke();
    } else {
      x.fillStyle = '#241f20';
      x.strokeStyle = '#8e2a35';
      x.lineWidth = 2;
      x.beginPath();
      x.ellipse(0, -h * 0.35, w * 0.24, h * 0.16, 0, 0, TAU);
      x.fill(); x.stroke();
      x.beginPath();
      x.moveTo(-w * 0.25, -h * 0.22); x.lineTo(w * 0.25, -h * 0.22); x.lineTo(w * 0.18, h * 0.25); x.lineTo(-w * 0.18, h * 0.25);
      x.closePath(); x.fill(); x.stroke();
    }
  }

  draw(x, ox, oy, R) {
    const px = this.x + ox, py = this.y + oy;
    let alpha = 1;
    if (this.def.behavior === 'phase') alpha = clamp(this.visFactor, 0.15, 1);
    this.drawShadow(x, px, py, this.size * 0.9);
    const img = Assets.img(this.def.art);
    const bob = Math.sin(R.time * 3 + this.phase) * 2;
    const flutter = this.def.cls === 'paper' ? Math.sin(R.time * 7 + this.phase) * 0.05 : 0;
    x.save();
    x.translate(px, py - 18 + bob);
    x.rotate(flutter);
    x.globalAlpha = alpha;
    if (this.state === 'windup') {
      // 起手前倾 + 泛红
      const k = this.stateT / (this.windupDur || 0.45);
      x.rotate((k * 0.2) * (this.x < this.game.player.x ? 1 : -1));
      x.filter = 'brightness(1.3)';
    }
    if (this.flashT > 0) x.filter = 'brightness(2.2)';
    const h = this.size * 3.4, w = h * 0.72;
    if (img) {
      x.globalAlpha = alpha * 0.2;
      x.drawImage(img, -w / 2, -h * 0.55, w, h);
      x.globalAlpha = alpha;
    }
    this._drawMonsterFigure(x, R, h, w);
    x.filter = 'none';
    x.restore();
    x.globalAlpha = 1;
    // 血条
    if (this.aware && this.hp < this.maxhp) {
      x.fillStyle = 'rgba(0,0,0,0.6)';
      x.fillRect(px - 15, py - this.size * 2.7, 30, 4);
      x.fillStyle = '#8e2a35';
      x.fillRect(px - 15, py - this.size * 2.7, 30 * (this.hp / this.maxhp), 4);
    }
    // 被注视提示（纸行者瞳孔）
    if (this.watched && this.def.behavior === 'facefear') {
      x.fillStyle = 'rgba(150,30,30,0.85)';
      x.beginPath(); x.arc(px, py - this.size * 3 - 6, 2.2, 0, TAU); x.fill();
    }
  }
}

// ------------------------------------------------------------
// NPC
// ------------------------------------------------------------
export class NPC extends Entity {
  constructor(type, x, y, game) {
    super(x, y);
    this.kind = 'npc';
    this.type = type;
    this.def = NPC_DEFS[type];
    this.game = game;
    this.size = 11;
    this.id = 'npc_' + type;
    this.phase = Math.random() * TAU;
  }
  update() {}
  draw(x, ox, oy, R) {
    const px = this.x + ox, py = this.y + oy;
    this.drawShadow(x, px, py, 10);
    const img = Assets.img(this.def.art);
    const bob = Math.sin(R.time * 1.6 + this.phase) * 1;
    if (img) x.drawImage(img, px - 16, py - 40 + bob, 32, 44);
    const d = dist(px - ox, py - oy, this.game.player.x, this.game.player.y);
    if (d < 110) {
      x.font = '12px "Kaiti SC","STKaiti",serif';
      x.textAlign = 'center';
      x.fillStyle = 'rgba(0,0,0,0.7)';
      x.fillText(this.def.name, px + 1, py - 47);
      x.fillStyle = '#d8cfb8';
      x.fillText(this.def.name, px, py - 48);
      x.textAlign = 'left';
    }
  }
}

// ------------------------------------------------------------
// 飘动红绸弹幕（Boss 用）
// ------------------------------------------------------------
export class Silk extends Entity {
  constructor(x, y, ang, spd, game) {
    super(x, y);
    this.kind = 'silk';
    this.vx = Math.cos(ang) * spd; this.vy = Math.sin(ang) * spd;
    this.life = 2.2; this.game = game;
    this.size = 7;
    this.trail = [];
  }
  update(dt, map) {
    this.life -= dt;
    this.x += this.vx * dt; this.y += this.vy * dt;
    this.trail.push({ x: this.x, y: this.y });
    if (this.trail.length > 8) this.trail.shift();
    if (this.life <= 0 || map.collides(this.x, this.y, 4)) { this.gone = true; return; }
    const p = this.game.player;
    if (p.iframes <= 0 && dist(this.x, this.y, p.x, p.y) < this.size + p.size) {
      p.hurt(11, this.x, this.y, this.game);
      this.gone = true;
    }
  }
  draw(x, ox, oy) {
    x.strokeStyle = 'rgba(160,30,40,0.85)';
    x.lineWidth = 4; x.lineCap = 'round';
    x.beginPath();
    for (let i = 0; i < this.trail.length; i++) {
      const t = this.trail[i];
      if (i === 0) x.moveTo(t.x + ox, t.y + oy - 10);
      else x.lineTo(t.x + ox, t.y + oy - 10);
    }
    x.stroke();
    x.lineWidth = 1;
  }
}

// ------------------------------------------------------------
// Boss · 无面新娘
// 阶段: intro → p1 → ritual(对话) → p2 → kneel(抉择) → enrage? → 死亡/退场
// ------------------------------------------------------------
export class BossBride extends Entity {
  constructor(x, y, game) {
    super(x, y);
    this.kind = 'boss';
    this.game = game;
    this.size = 16;
    this.maxhp = 620; this.hp = this.maxhp;
    this.state = 'dormant';
    this.stateT = 0;
    this.atkCd = 2;
    this.phase = 1;
    this.kneeling = false;
    this.resolved = false;
    this.ribbon = null; // 横扫预警 {ang,t}
    this.name = '无面新娘 · 「月娘」';
  }

  activate() { this.state = 'chase'; this.stateT = 0; }

  update(dt, map) {
    if (this.dead || this.resolved) { return; }
    const g = this.game, p = g.player;
    this.stateT += dt;
    if (this.flashT > 0) this.flashT -= dt;
    if (this.state === 'dormant' || this.state === 'wait') return;
    if (this.atkCd > 0) this.atkCd -= dt;

    // 阶段切换
    if (this.phase === 1 && this.hp <= this.maxhp * 0.55) {
      this.phase = 2;
      this.state = 'wait';
      g.bossRitual();
      return;
    }
    if (this.phase === 2 && this.hp <= this.maxhp * 0.22 && !this.kneeling) {
      this.kneeling = true;
      this.state = 'wait';
      g.bossKneel();
      return;
    }

    const d = dist(this.x, this.y, p.x, p.y);
    const aToP = angTo(this.x, this.y, p.x, p.y);

    if (this.state === 'chase') {
      const spd = this.enraged ? 96 : 64;
      map.moveCircle(this, Math.cos(aToP) * spd * dt, Math.sin(aToP) * spd * dt);
      if (this.atkCd <= 0) {
        const roll = Math.random();
        if (d < 90 && roll < 0.5) {
          this.state = 'sweep'; this.stateT = 0;
          this.ribbon = { ang: aToP, t: 0 };
          this.atkCd = this.enraged ? 1.6 : 2.4;
        } else if (roll < 0.8) {
          this.state = 'volley'; this.stateT = 0;
          this.atkCd = this.enraged ? 2.2 : 3.2;
        } else if (this.phase >= 2 || this.enraged) {
          this.state = 'summon'; this.stateT = 0;
          this.atkCd = 6;
        } else {
          this.state = 'volley'; this.stateT = 0;
          this.atkCd = 3;
        }
      }
    } else if (this.state === 'sweep') {
      // 红绸横扫：0.55s 预警后扇形判定
      if (this.ribbon) this.ribbon.t += dt;
      if (this.stateT > 0.55 && !this.sweepDone) {
        this.sweepDone = true;
        AudioSys.sfx('swing_heavy');
        g.R.shake(6, 0.2);
        if (d < 120 && Math.abs(angDiff(this.ribbon.ang, aToP)) < 1.2 && p.iframes <= 0) {
          p.hurt(this.enraged ? 24 : 18, this.x, this.y, g);
        }
      }
      if (this.stateT > 0.85) { this.state = 'chase'; this.stateT = 0; this.sweepDone = false; this.ribbon = null; }
    } else if (this.state === 'volley') {
      // 绸缎弹幕
      if (this.stateT > 0.4 && !this.volleyDone) {
        this.volleyDone = true;
        const n = this.enraged ? 7 : 5;
        for (let i = 0; i < n; i++) {
          const a = aToP + (i - (n - 1) / 2) * 0.3;
          map.entities.push(new Silk(this.x, this.y - 12, a, 200, g));
        }
        AudioSys.sfx('paper', { vol: 0.9 });
      }
      if (this.stateT > 0.8) { this.state = 'chase'; this.stateT = 0; this.volleyDone = false; }
    } else if (this.state === 'summon') {
      if (this.stateT > 0.6 && !this.sumDone) {
        this.sumDone = true;
        AudioSys.sfx('suona', { vol: 0.7 });
        for (let i = 0; i < 2; i++) {
          const a = Math.random() * TAU;
          const e = new Enemy('weepchild', this.x + Math.cos(a) * 80, this.y + Math.sin(a) * 80, g);
          e.aware = true;
          map.entities.push(e);
        }
        g.ui.sub('（她在唤她的送亲童子。）');
      }
      if (this.stateT > 1.2) { this.state = 'chase'; this.stateT = 0; this.sumDone = false; }
    }
    this.applyKnock(map, dt);
  }

  hurt(dmg, opt, game) {
    if (this.dead || this.resolved || this.state === 'dormant' || this.state === 'wait') return { died: false, dmg: 0 };
    let mult = 1;
    if (opt.dmgType === 'zhen') mult = 1.35;
    const real = Math.max(1, Math.round(dmg * mult));
    this.hp -= real;
    this.flashT = 0.1;
    game.R.spawnParts({ x: this.x, y: this.y - 20, n: 8, col: '#b03040', sp: 90, life: 0.6, rect: true });
    AudioSys.sfx('hit_ghost');
    if (this.hp <= 0) {
      this.hp = 1; // 击杀路线由 game.bossResolve 处理
      game.bossResolve('kill');
    }
    return { died: false, dmg: real, mult };
  }

  draw(x, ox, oy, R) {
    const px = this.x + ox, py = this.y + oy;
    this.drawShadow(x, px, py, 16);
    // 红绸预警线
    if (this.ribbon) {
      const k = clamp(this.ribbon.t / 0.55, 0, 1);
      x.save();
      x.translate(px, py - 10);
      x.rotate(this.ribbon.ang);
      x.fillStyle = `rgba(170,30,40,${0.15 + k * 0.3})`;
      x.beginPath();
      x.moveTo(0, 0); x.arc(0, 0, 120, -0.6, 0.6); x.closePath();
      x.fill();
      x.restore();
    }
    const img = Assets.img('boss_bride');
    const hover = Math.sin(R.time * 1.7) * 3;
    x.save();
    x.translate(px, py - 34 + hover);
    if (this.flashT > 0) x.filter = 'brightness(2)';
    if (this.kneeling && !this.enraged) { x.translate(0, 14); x.scale(1, 0.82); }
    const sway = Math.sin(R.time * 0.9) * 0.04;
    x.rotate(sway);
    if (img) x.drawImage(img, -30, -42, 60, 88);
    x.filter = 'none';
    x.restore();
    // 拖尾纸钱
    if (Math.random() < 0.1 && !this.kneeling) {
      R.spawnParts({ x: this.x + (Math.random() - 0.5) * 30, y: this.y - 30, n: 1, col: '#cfc7b0', sp: 12, life: 1.6, rect: true, grav: 40, up: -10 });
    }
  }
}

// ------------------------------------------------------------
// Chapters 2-8 and finale use a configurable two-stage boss.
// Each boss is weakened by its chapter investigation and always reaches a
// decision phase instead of being only a larger health bar.
// ------------------------------------------------------------
export class CampaignBoss extends Entity {
  constructor(chapter, x, y, game) {
    super(x, y);
    this.kind = 'boss';
    this.chapter = chapter;
    this.game = game;
    this.def = game.map.def.boss;
    const scale = game.enemyScale?.() || 1;
    this.maxhp = Math.round(this.def.hp * scale.hp);
    this.hp = this.maxhp;
    this.damage = Math.round(this.def.damage * scale.dmg);
    this.size = chapter === 9 ? 25 : 20;
    this.speed = this.def.speed * scale.speed;
    this.name = this.def.name;
    this.state = 'dormant';
    this.stateT = 0;
    this.atkCd = 1.8;
    this.phase = 1;
    this.resolved = false;
    this.decisionShown = false;
    this.volleyDone = false;
    this.summonDone = false;
  }

  activate() {
    if (this.resolved) return;
    this.state = 'chase';
    this.stateT = 0;
  }

  update(dt, map) {
    if (this.resolved || this.dead || this.state === 'dormant' || this.state === 'wait') return;
    const g = this.game, p = g.player;
    this.stateT += dt;
    if (this.flashT > 0) this.flashT -= dt;
    if (this.atkCd > 0) this.atkCd -= dt;

    if (this.phase === 1 && this.hp <= this.maxhp * 0.55) {
      this.phase = 2;
      this.state = 'wait';
      g.campaignBossMechanic(this);
      return;
    }
    if (!this.decisionShown && this.hp <= this.maxhp * 0.16) {
      this.decisionShown = true;
      this.state = 'wait';
      g.campaignBossDecision(this);
      return;
    }

    const d = dist(this.x, this.y, p.x, p.y);
    const a = angTo(this.x, this.y, p.x, p.y);
    if (this.state === 'chase') {
      const orbit = this.def.style === 'mimic' || this.def.style === 'echo';
      const ma = orbit && d < 150 ? a + Math.PI / 2 : a;
      if (d > 58) map.moveCircle(this, Math.cos(ma) * this.speed * dt, Math.sin(ma) * this.speed * dt);
      if (this.atkCd <= 0) {
        const r = Math.random();
        this.state = r < 0.46 ? 'windup' : r < 0.82 ? 'volley' : 'summon';
        this.stateT = 0;
        this.volleyDone = false;
        this.summonDone = false;
        this.atkCd = this.phase === 2 ? 1.65 : 2.3;
      }
    } else if (this.state === 'windup') {
      if (this.stateT > 0.55) {
        if (d < 92) p.hurt(this.damage, this.x, this.y, g);
        else {
          map.moveCircle(this, Math.cos(a) * 260 * dt, Math.sin(a) * 260 * dt);
        }
      }
      if (this.stateT > 0.82) { this.state = 'chase'; this.stateT = 0; }
    } else if (this.state === 'volley') {
      if (!this.volleyDone && this.stateT > 0.42) {
        this.volleyDone = true;
        const n = this.phase === 2 ? 7 : 5;
        for (let i = 0; i < n; i++) {
          map.entities.push(new Silk(this.x, this.y - 18, a + (i - (n - 1) / 2) * 0.24, 210 + this.chapter * 4, g));
        }
        AudioSys.sfx(this.chapter === 4 ? 'gong' : 'stinger', { vol: 0.55 });
      }
      if (this.stateT > 0.9) { this.state = 'chase'; this.stateT = 0; }
    } else if (this.state === 'summon') {
      if (!this.summonDone && this.stateT > 0.55) {
        this.summonDone = true;
        const pool = this.chapter >= 7 ? ['memoryecho', 'tombshadow'] : ['paperwalker', 'redshade'];
        for (let i = 0; i < 2; i++) {
          const aa = Math.random() * TAU;
          const e = new Enemy(pool[i % pool.length], this.x + Math.cos(aa) * 82, this.y + Math.sin(aa) * 82, g);
          e.aware = true;
          map.entities.push(e);
        }
        g.ui.sub('（它借来被遗忘者的影子。）', 2.2);
      }
      if (this.stateT > 1.1) { this.state = 'chase'; this.stateT = 0; }
    }
    this.applyKnock(map, dt);
  }

  hurt(dmg, opt, game) {
    if (this.resolved || this.state === 'dormant' || this.state === 'wait') return { died: false, dmg: 0, mult: 0 };
    const solved = game.flag(`camp_puzzle_ok_${this.chapter}`);
    let mult = solved ? 1 : 0.42;
    if (opt.dmgType === 'zhen' && ['mirror', 'memory', 'names', 'truth'].includes(this.def.weakness)) mult *= 1.35;
    if (opt.dmgType === this.def.weakness) mult *= 1.25;
    const real = Math.max(1, Math.round(dmg * mult));
    this.hp -= real;
    this.flashT = 0.12;
    game.R.spawnParts({ x: this.x, y: this.y - 24, n: 10, col: '#8e3845', sp: 100, life: 0.65, rect: this.chapter === 4 });
    AudioSys.sfx(opt.dmgType === 'zhen' ? 'zhenxie' : 'hit_ghost');
    if (this.hp <= 0) {
      this.hp = 1;
      this.state = 'wait';
      this.decisionShown = true;
      game.campaignBossDecision(this, true);
    }
    return { died: false, dmg: real, mult };
  }

  draw(x, ox, oy, R) {
    const px = this.x + ox, py = this.y + oy;
    this.drawShadow(x, px, py, this.size);
    const img = Assets.img(this.def.art);
    const hover = Math.sin(R.time * 1.5 + this.chapter) * 4;
    x.save();
    x.translate(px, py - this.size * 1.7 + hover);
    if (this.flashT > 0) x.filter = 'brightness(2)';
    if (this.state === 'windup') {
      x.scale(1.1, 0.92);
      x.globalAlpha = 0.85 + Math.sin(R.time * 24) * 0.12;
    }
    if (img) x.drawImage(img, -this.size * 1.35, -this.size * 1.8, this.size * 2.7, this.size * 3.6);
    x.filter = 'none';
    x.restore();
    if (this.phase === 2 && Math.random() < 0.12) {
      R.spawnParts({ x: this.x, y: this.y - 30, n: 1, col: '#b7ad96', sp: 20, life: 1.4, rect: true, grav: 30, up: -8 });
    }
  }
}

// ------------------------------------------------------------
// 红轿送亲队列（规则事件）
// ------------------------------------------------------------
export class Procession extends Entity {
  constructor(roadX, fromY, toY, game) {
    super(roadX, fromY);
    this.kind = 'procession';
    this.game = game;
    this.toY = toY;
    this.speed = 95;
    this.size = 1; // 不参与普通碰撞
    this.checked = false;
    this.violated = false;
  }
  update(dt, map) {
    this.y += this.speed * dt;
    const p = this.game.player;
    // 玩家站在主路上且队伍接近 → 违反规矩
    if (!this.violated && Math.abs(p.y - this.y) < 70 && map.isRoad(p.x, p.y)) {
      this.violated = true;
      this.game.onRuleViolated('rule_sedan');
    }
    if (this.y > this.toY) {
      this.gone = true;
      this.game.onProcessionEnd(this.violated);
    }
  }
  draw(x, ox, oy, R) {
    const px = this.x + ox, py = this.y + oy;
    const sedan = Assets.img('pr_sedan');
    const bearer = Assets.img('en_bearer');
    const sway = Math.sin(R.time * 5) * 2;
    // 前后轿夫
    for (const [dx, dy] of [[-20, -34], [20, -34], [-20, 26], [20, 26]]) {
      x.save();
      x.translate(px + dx, py + dy + sway * 0.5);
      x.globalAlpha = 0.95;
      if (bearer) x.drawImage(bearer, -14, -40, 28, 46);
      x.restore();
    }
    x.save();
    x.translate(px, py + sway);
    if (sedan) x.drawImage(sedan, -30, -58, 60, 64);
    x.restore();
    x.globalAlpha = 1;
    R.addLight(this.x, this.y - 20, 110, 0.7, 'rgba(200,50,40,0.5)', 0.08);
  }
}

// ------------------------------------------------------------
// 掉落物
// ------------------------------------------------------------
export function makePickup(x, y, data) {
  // data: {money} | {item}
  const seed = Math.random() * TAU;
  if (data.money) return { x, y, seed, money: data.money, icon: 'it_money' };
  return { x, y, seed, item: data.item, icon: data.item.icon, glow: data.glow || null };
}
