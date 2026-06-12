// ============================================================
// game.js — 总编排：状态机 / 战斗 / 交互 / 事件 / Boss / 存档 / 结局
// ============================================================
import { clamp, dist, angTo, angDiff, makeRng, Input, AudioSys, SaveSys, t, Bus } from './engine.js';
import { Renderer, VW, VH } from './render.js';
import { GameMap, Player, Enemy, NPC, BossBride, CampaignBoss, Procession, makePickup, TS } from './world.js';
import { MAPS } from './data_world.js';
import {
  WEAPONS, CONSUMABLES, ARTIFACTS, EQUIP_SLOTS, GEAR_BASES,
  makeWeapon, makeCharm, makeLamp, makeUse, makeGear,
  rollDrops, aggregateStats, describeItem, RARITIES,
} from './data_items.js';
import { CINE_INTRO, CHAPTER_CARDS, TAPES, CLUES, RULES, DIALOGS, INTERACTS, EVENTS, ENDINGS } from './data_story.js';
import { UI } from './ui.js';
import { HorrorDirector } from './horror.js';
import { CAMPAIGN_CHAPTERS, CHAPTER_LANDMARKS, SKILL_TREES, CAMP_UPGRADES, FINAL_ENDINGS } from './data_campaign.js';

const rng = makeRng(Date.now() & 0xffff);

export class Game {
  constructor(canvas) {
    this.R = new Renderer(canvas);
    this.state = 'boot'; // boot title play ending
    this.settings = SaveSys.loadSettings();
    this.ui = UI;
    this.director = new HorrorDirector(this);
    this.freezeT = 0;
    this.flickerT = 0;
    this.lampSuppressT = 0;
    this.fade = document.getElementById('fade');
    this._exitCd = 0;
    this._evQueue = [];
    this.boss = null;
    this._resetRun();
  }

  _resetRun() {
    this.flags = {};
    this.inventory = [];
    this.equip = Object.fromEntries(EQUIP_SLOTS.map(([slot]) => [slot, null]));
    this.money = 30;
    this.clues = [];
    this.tapes = [];
    this.rules = [];
    this.artifacts = {}; // id -> 'broken'|'repaired'
    this.counters = { deaths: 0, kills: 0, playSec: 0 };
    this.pstats = {
      hp: 100, maxhp: 100, stam: 100, maxstam: 100, stamCd: 0,
      san: 100, maxsan: 100, oil: 0, maxoil: 100, yin: 0,
    };
    this.aggStats = aggregateStats(this.equip);
    this.map = null; this.mapId = null;
    this.player = null;
    this.boss = null;
    this.objectiveText = '';
    this.questLog = [];
    this.mapVisits = {};
    this.readStory = {};
    this.seed = Date.now() & 0xffffffff;
    this._pendingBossState = null;
    this.respawn = { mapId: 'laozhai', x: 22 * TS, y: 14 * TS };
    this.shownTuts = new Set();
    this.chapter = 0;
    this.campaign = {
      completed: {}, choices: {}, mercy: 0, names: 0, genealogy: 0,
      parent: 0, xiaoman: 0, tabooAccepted: false, publicTruth: false,
    };
    this.skills = { points: 0, bought: [] };
    this.campUpgrades = {};
    this.hazard = { value: 100, max: 100, tick: 0 };
    this._comboHistory = [];
    this._lastCampaignChoice = null;
  }

  // ============ 设置 ============
  applySettings() {
    const s = this.settings;
    AudioSys.setVol('master', s.volMaster);
    AudioSys.setVol('music', s.volMusic);
    AudioSys.setVol('sfx', s.volSfx);
    AudioSys.setVol('amb', s.volAmb);
    this.R.cam.enableShake = s.shake;
    Input.applyBindings(s.keyBindings || {});
    document.documentElement.style.setProperty('--subtitle-scale', String(s.subtitleScale || 1));
    document.body.classList.toggle('high-contrast', !!s.highContrast);
    document.body.classList.toggle('color-assist', !!s.colorAssist);
    document.body.classList.toggle('reduce-flash', !!s.reduceFlash);
  }
  saveSettings() { SaveSys.saveSettings(this.settings); }
  wipeAll() { SaveSys.clearAll(); location.reload(); }
  hasSave() { return SaveSys.anySave ? SaveSys.anySave() : SaveSys.hasSave(); }

  enemyScale() {
    const mode = this.settings.difficulty || 'standard';
    if (mode === 'story') return { hp: 0.72, dmg: 0.62, speed: 0.92 };
    if (mode === 'deep') return { hp: 1.12, dmg: 1.28, speed: 1.08 };
    if (mode === 'keeper') return { hp: 1.28, dmg: 1.45, speed: 1.13 };
    return { hp: 1, dmg: 1, speed: 1 };
  }

  // ============ 旗标 / 物品 / 线索 ============
  flag(f) { return !!this.flags[f]; }
  setFlag(f) { this.flags[f] = true; if (this.map) this.map.refreshDoors(); }

  giveClue(id) {
    if (this.clues.includes(id)) return;
    this.clues.push(id);
    const c = CLUES[id];
    if (c) { this.ui.toast('🔍 线索：' + c.name); AudioSys.sfx('pickup'); }
    if (id === 'clue_genealogy') this.setFlag('clue_genealogy');
  }
  giveRule(id) {
    if (this.rules.includes(id)) return;
    this.rules.push(id);
    const r = RULES[id];
    if (r) this.ui.toast('📜 规矩：' + r.name);
  }
  giveTape(id, autoplay = true) {
    if (!this.tapes.includes(id)) {
      this.tapes.push(id);
      this.ui.toast('📼 磁带：' + TAPES[id].name);
    }
    if (autoplay) this.ui.tape(TAPES[id]);
  }
  giveArtifact(id) {
    if (this.artifacts[id]) return;
    this.artifacts[id] = 'broken';
    this.ui.toast('🏺 文物：' + ARTIFACTS[id].name + '（可在工作台修复）');
    AudioSys.sfx('pickup');
  }
  repairArtifact(id) {
    this.artifacts[id] = 'repaired';
    AudioSys.sfx('potion');
    this.ui.toast('✓ 修复完成：' + ARTIFACTS[id].name);
    this.recompute();
  }

  addItem(kind, key, n = 1) {
    let it = null;
    if (kind === 'use') {
      const exist = this.inventory.find(i => i.kind === 'use' && i.base === key);
      if (exist) { exist.n += n; this.ui.updateHUD(); return exist; }
      it = makeUse(key, n);
    } else if (kind === 'weapon') it = makeWeapon(rng, key);
    else if (kind === 'charm') it = makeCharm(key);
    else if (kind === 'lamp') it = makeLamp(key);
    else if (kind === 'gear') it = makeGear(rng, key);
    if (it) this.inventory.push(it);
    return it;
  }
  addItemObj(it) {
    if (it.kind === 'use') {
      const exist = this.inventory.find(i => i.kind === 'use' && i.base === it.base);
      if (exist) { exist.n += it.n || 1; return; }
    }
    this.inventory.push(it);
  }
  hasWeaponBase(base) {
    if (this.equip.weapon?.base === base) return true;
    return this.inventory.some(i => i.kind === 'weapon' && i.base === base);
  }
  equipItem(it) {
    const slot = it.kind === 'gear' ? it.slot : it.kind;
    if (!EQUIP_SLOTS.some(([id]) => id === slot)) return;
    const cur = this.equip[slot];
    this.inventory = this.inventory.filter(i => i.uid !== it.uid);
    if (cur) this.inventory.push(cur);
    this.equip[slot] = it;
    AudioSys.sfx('pickup');
    this.recompute();
  }
  useItem(it) {
    const def = CONSUMABLES[it.base];
    if (!def) return false;
    const u = def.use, s = this.pstats;
    if (u.hp) { if (s.hp >= s.maxhp) { this.ui.toast('生命已满。'); return false; } s.hp = clamp(s.hp + u.hp, 0, s.maxhp); }
    if (u.san) s.san = clamp(s.san + u.san, 0, s.maxsan);
    if (u.oil) s.oil = clamp(s.oil + u.oil, 0, s.maxoil);
    if (u.candle) {
      this.map.candles.push({ x: this.player.x, y: this.player.y });
      this.ui.toast('你点起一支香烛。');
    }
    AudioSys.sfx('potion');
    it.n--;
    if (it.n <= 0) this.inventory = this.inventory.filter(i => i.uid !== it.uid);
    this.ui.updateHUD();
    return true;
  }
  dropItem(it) {
    this.inventory = this.inventory.filter(i => i.uid !== it.uid);
    if (this.map && this.player) {
      this.map.pickups.push(makePickup(this.player.x + 20, this.player.y + 10, { item: it }));
    }
  }
  recompute() {
    this.aggStats = aggregateStats(this.equip);
    const apply = (stats) => {
      for (const [k, v] of Object.entries(stats || {})) {
        if (k in this.aggStats) this.aggStats[k] += v;
      }
    };
    for (const id of this.skills.bought || []) {
      for (const tree of Object.values(SKILL_TREES)) {
        const node = tree.nodes.find((n) => n.id === id);
        if (node) apply(node.effect);
      }
    }
    for (const id of Object.keys(this.campUpgrades || {})) apply(CAMP_UPGRADES[id]?.effect);
    const s = this.pstats;
    s.maxhp = 100 + (this.aggStats.maxhp || 0) + (this.artifacts.art_tape_deck === 'repaired' ? 20 : 0);
    s.maxstam = 100 + (this.aggStats.maxstam || 0);
    s.maxsan = 100 + (this.aggStats.maxsan || 0) + (this.artifacts.art_genealogy === 'repaired' ? 10 : 0);
    s.hp = clamp(s.hp, 0, s.maxhp);
    s.san = clamp(s.san, 0, s.maxsan);
    this.ui.updateHUD();
  }
  lampDef() {
    const l = this.equip.lamp;
    if (!l) return null;
    const defs = { lamp_oil: 130, lamp_storm: 165, lamp_white: 195 };
    return { stats: { radius: defs[l.base] || 130, drain: l.base === 'lamp_storm' ? 1.25 : l.base === 'lamp_white' ? 1.6 : 1.0, white: l.base === 'lamp_white' ? 1 : 0 } };
  }
  lampRadius() {
    const d = this.lampDef();
    if (!d || !this.player.lampOn || this.pstats.oil <= 0) return 0;
    let r = d.stats.radius * (1 + (this.aggStats.lampRadius || 0));
    if (this.lampSuppressT > 0) r *= 0.45;
    return r;
  }
  addSan(v) {
    this.pstats.san = clamp(this.pstats.san + v, 0, this.pstats.maxsan);
    if (v < 0 && this.pstats.san < 35) this.tutorial('tut.sanity');
  }
  addYin(v) {
    this.pstats.yin = clamp(this.pstats.yin + v, 0, 100);
    if (v > 0) this.ui.toast('阴蚀 +' + v, 1.8);
  }

  tutorial(key) {
    if (this.settings.hints === 'off') return;
    if (this.shownTuts.has(key)) return;
    this.shownTuts.add(key);
    this.ui.toast('💡 ' + t(key), 4.5);
  }

  // ============ 流程 ============
  toTitle() {
    this.state = 'title';
    AudioSys.stopAllAmbient();
    AudioSys.music('title');
    AudioSys.ambient('rain', true, 0.7);
    AudioSys.heartbeat(false);
    this.ui.bossBar(false);
    this.ui.objective('');
    this.ui.title(this.hasSave());
    document.getElementById('touch').classList.remove('show');
  }

  startNew() {
    SaveSys.clearSave('auto');
    this._resetRun();
    this.ui.closeModal(true);
    this.state = 'cine';
    // 开局物品
    const jade = makeCharm('charm_jade'); jade.keyItem = true;
    this.equip.charm = jade;
    this.recompute();
    this.pstats.hp = this.pstats.maxhp;
    this.pstats.stam = this.pstats.maxstam;
    this.pstats.san = this.pstats.maxsan;
    AudioSys.music('none');
    this.ui.cinematic(CINE_INTRO, () => {
      this.ui.chapterCard(CHAPTER_CARDS.ch0, () => {});
      this.gotoMap('bus', 'aisle', true);
      this.setObjective('检查木盒，然后从末班车前门下车');
      this.state = 'play';
      document.getElementById('touch').classList.add('show');
    });
  }

  continueGame(slot = 'auto') {
    let sv = SaveSys.loadGame(slot);
    if (!sv && slot === 'auto' && SaveSys.listSaves) {
      sv = SaveSys.listSaves().find((x) => x.save)?.save || null;
    }
    if (!sv) { this.startNew(); return; }
    this._resetRun();
    Object.assign(this.flags, sv.flags || {});
    this.inventory = sv.inventory || [];
    this.equip = Object.assign(Object.fromEntries(EQUIP_SLOTS.map(([slot]) => [slot, null])), sv.equip || {});
    this.money = sv.money ?? 30;
    this.clues = sv.clues || [];
    this.tapes = sv.tapes || [];
    this.rules = sv.rules || [];
    this.artifacts = sv.artifacts || {};
    this.counters = sv.counters || { deaths: 0, kills: 0, playSec: 0 };
    Object.assign(this.pstats, sv.pstats || {});
    this.objectiveText = sv.objective || '';
    this.questLog = sv.questLog || (this.objectiveText ? [{ t: sv.time || Date.now(), type: '目标', text: this.objectiveText }] : []);
    this.mapVisits = sv.mapVisits || {};
    this.readStory = sv.readStory || {};
    this.seed = sv.seed || this.seed;
    this._pendingBossState = sv.bossState || null;
    this.respawn = sv.respawn || { mapId: 'laozhai', x: 22 * TS, y: 14 * TS };
    this.chapter = sv.chapter || 0;
    this.campaign = Object.assign(this.campaign, sv.campaign || {});
    this.skills = Object.assign(this.skills, sv.skills || {});
    this.campUpgrades = sv.campUpgrades || {};
    this.shownTuts = new Set(sv.tuts || []);
    this.ui.closeModal(true);
    this.recompute();
    this.gotoMap(sv.mapId || 'laozhai', null, true, sv.px, sv.py);
    this.state = 'play';
    document.getElementById('touch').classList.add('show');
    this.ui.objective(this.objectiveText);
  }

  saveGame(toastIt = false, slot = 'auto') {
    if (!this.map) return;
    const sv = {
      ver: 2, mapId: this.mapId,
      px: this.player.x, py: this.player.y,
      pstats: this.pstats, money: this.money,
      flags: this.flags, inventory: this.inventory, equip: this.equip,
      clues: this.clues, tapes: this.tapes, rules: this.rules,
      artifacts: this.artifacts, counters: this.counters,
      objective: this.objectiveText, questLog: this.questLog, mapVisits: this.mapVisits, respawn: this.respawn,
      readStory: this.readStory, seed: this.seed,
      bossState: this.boss ? {
        mapId: this.mapId, hp: this.boss.hp, maxhp: this.boss.maxhp,
        state: this.boss.state, phase: this.boss.phase,
        resolved: !!this.boss.resolved, dead: !!this.boss.dead,
        kneeling: !!this.boss.kneeling, enraged: !!this.boss.enraged,
      } : null,
      chapter: this.chapter, tuts: [...this.shownTuts],
      campaign: this.campaign, skills: this.skills, campUpgrades: this.campUpgrades,
      time: Date.now(),
    };
    SaveSys.saveGame(sv, slot);
    if (toastIt) this.ui.toast('🕯 ' + (slot === 'auto' ? t('saved') : `已存入 ${slot.replace('slot_', '手动槽 ')}`));
  }
  manualSave(slot) {
    this.saveGame(true, slot);
  }
  questNote(text, type = '记录') {
    if (!text) return;
    const last = this.questLog[this.questLog.length - 1];
    if (last && last.text === text && last.type === type) return;
    this.questLog.push({ t: Date.now(), type, text, map: this.mapId });
    if (this.questLog.length > 80) this.questLog.splice(0, this.questLog.length - 80);
    this.ui.refreshQuest?.();
  }

  travel(mapId) {
    this.gotoMap(mapId, 'default');
  }

  gotoMap(id, spawn = 'default', instant = false, px = null, py = null) {
    const def = MAPS[id];
    if (!def) return;
    const doLoad = () => {
      this.mapId = id;
      this.mapVisits[id] = (this.mapVisits[id] || 0) + 1;
      this.map = new GameMap(def, this);
      const sp = def.spawns[spawn] || def.spawns.default;
      const sx = px ?? sp[0] * TS + TS / 2, sy = py ?? sp[1] * TS + TS / 2;
      this.player = this.player || new Player(sx, sy, this);
      this.player.x = sx; this.player.y = sy;
      this.player.state = 'idle';
      this.map.entities.push(this.player);
      // 敌人
      for (const e of (def.enemies || [])) {
        if (e.group) continue; // 事件触发型
        const en = new Enemy(e.type, e.x * TS, e.y * TS, this);
        this.map.entities.push(en);
      }
      // NPC
      for (const n of (def.npcs || [])) {
        this.map.entities.push(new NPC(n.type, n.x * TS, n.y * TS, this));
      }
      // Boss
      this.boss = null;
      if (id === 'huntang' && !this.flag('boss_done')) {
        this.boss = new BossBride(16 * TS, 8 * TS, this);
        this.map.entities.push(this.boss);
      } else if (def.chapter && def.boss && !this.campaign.completed[def.chapter]) {
        this.boss = new CampaignBoss(def.chapter, Math.floor(this.map.w / 2) * TS, 6 * TS, this);
        this.map.entities.push(this.boss);
      }
      if (this.boss && this._pendingBossState?.mapId === id) {
        const bs = this._pendingBossState;
        this.boss.hp = clamp(bs.hp ?? this.boss.hp, 1, this.boss.maxhp);
        this.boss.state = bs.state || this.boss.state;
        this.boss.phase = bs.phase || this.boss.phase;
        this.boss.resolved = !!bs.resolved;
        this.boss.dead = !!bs.dead;
        if ('kneeling' in this.boss) this.boss.kneeling = !!bs.kneeling;
        if ('enraged' in this.boss) this.boss.enraged = !!bs.enraged;
        this._pendingBossState = null;
      }
      this.R.cam.setMapSize(this.map.pw, this.map.ph);
      this.R.cam.snap(this.player.x, this.player.y);
      this.R.darkness = def.dark ?? 0.7;
      this.R.rain = def.rain ? 1 : 0;
      // 声音
      AudioSys.stopAllAmbient();
      for (const a of (def.ambient || [])) AudioSys.ambient(a, true);
      AudioSys.music(def.music || 'none');
      if (this.mapVisits[id] === 1) this.questNote(`抵达：${def.name}`, '地点');
      this.ui.location(def.name, this.mapVisits[id] === 1 ? '新地点' : '再次进入');
      this._exitCd = 0.9;
      this.director.reset();
      this.hazard.value = 100;
      this.hazard.max = 100;
      this.hazard.tick = 0;
      // 安全点登记
      const spProp = this.map.props.find(p => p.id === 'savepoint');
      if (spProp) this.respawn = { mapId: id, x: spProp.px, y: spProp.py + 30 };
      if (!instant) this.saveGame();
      this.ui.updateHUD();
    };
    if (instant) { doLoad(); return; }
    this.fade.classList.add('on');
    setTimeout(() => {
      doLoad();
      setTimeout(() => this.fade.classList.remove('on'), 120);
    }, 320);
  }

  setObjective(txt) {
    this.objectiveText = txt;
    this.ui.objective(txt);
    this.questNote(txt, '目标');
  }

  // ============ 主循环 ============
  update(dt) {
    if (this.state !== 'play') { Input.endFrame(); return; }
    Input.updateGamepad();

    // 模态打开时暂停世界
    if (this.ui.isOpen()) {
      if (Input.pressed('pause') || Input.pressed('cancel')) {
        Input.consume('pause');
        if (['inventory', 'journal', 'shop', 'bench', 'clueboard', 'settings', 'pause', 'skills', 'camp', 'archive', 'saves'].includes(this.ui.open)) this.ui.closeModal();
      }
      Input.endFrame();
      return;
    }

    // 快捷键
    if (Input.pressed('pause')) { Input.consume('pause'); this.ui.pause(); Input.endFrame(); return; }
    if (Input.pressed('inventory')) { Input.consume('inventory'); this.ui.inventory(); Input.endFrame(); return; }
    if (Input.pressed('journal')) { Input.consume('journal'); this.ui.journal(); Input.endFrame(); return; }

    if (this.freezeT > 0) { this.freezeT -= dt; Input.endFrame(); return; }
    if (this.flickerT > 0) this.flickerT -= dt;
    if (this.lampSuppressT > 0) this.lampSuppressT -= dt;

    this.counters.playSec += dt;
    const map = this.map, p = this.player;

    // 实体更新（远处休眠）
    for (const e of map.entities) {
      if (e === p) { e.update(dt, map); continue; }
      if (e.kind === 'enemy' && dist(e.x, e.y, p.x, p.y) > 760) continue;
      e.update(dt, map);
    }
    map.entities = map.entities.filter(e => !e.gone || e === p);

    // 拾取
    for (let i = map.pickups.length - 1; i >= 0; i--) {
      const pk = map.pickups[i];
      const d = dist(pk.x, pk.y, p.x, p.y);
      if (d < 70) { // 磁吸
        pk.x += (p.x - pk.x) * 6 * dt;
        pk.y += (p.y - pk.y) * 6 * dt;
      }
      const pickupNow = this.settings.autoPickup ? d < 24 : (d < 34 && Input.pressed('interact'));
      if (pickupNow) {
        map.pickups.splice(i, 1);
        if (pk.money) {
          this.money += pk.money;
          AudioSys.sfx('coin');
          this.R.floatText(p.x, p.y - 30, '+' + pk.money + ' 纸钱', '#d9c36a', 13);
        } else if (pk.item) {
          this.addItemObj(pk.item);
          AudioSys.sfx('pickup');
          const d2 = describeItem(pk.item);
          this.ui.toast(`获得 <span style="color:${d2.col}">${d2.title}</span>`);
        }
        this.ui.updateHUD();
      }
    }

    // 触发器
    for (const tr of (map.def.triggers || [])) {
      const fid = 'trg_' + this.mapId + '_' + tr.id;
      if (tr.once && this.flag(fid)) continue;
      if (p.x > tr.x * TS && p.x < (tr.x + tr.w) * TS && p.y > tr.y * TS && p.y < (tr.y + tr.h) * TS) {
        if (tr.once) this.setFlag(fid);
        this.runEvent(tr.id);
      }
    }

    // 出口
    if (this._exitCd > 0) this._exitCd -= dt;
    else {
      for (const ex of (map.def.exits || [])) {
        if (p.x > ex.x * TS && p.x < (ex.x + ex.w) * TS && p.y > ex.y * TS && p.y < (ex.y + ex.h) * TS) {
          if (ex.needFlag && !this.flag(ex.needFlag)) {
            this.ui.sub(ex.lockedText || '（现在还不能离开。）', 2.4);
            continue;
          }
          if (this.mapId === 'huntang' && this.boss && this.boss.state !== 'dormant' && !this.flag('boss_done')) {
            this.ui.sub('（门在身后合上了。这一拜，躲不掉。）');
            continue;
          }
          this.gotoMap(ex.to, ex.spawn);
          Input.endFrame();
          return;
        }
      }
    }

    // 交互
    const near = map.nearestInteract(p.x, p.y);
    this._near = near;
    if (near) {
      const label = near.kind === 'npc' ? near.def.name : (INTERACTS[near.id]?.label || '');
      const keyHint = Input.lastDevice === 'touch' ? '查' : 'E';
      this.ui.prompt(`<b>${keyHint}</b> ${t('hud.interact')}${label ? ' · ' + label : ''}`);
      if (Input.pressed('interact')) {
        Input.consume('interact');
        this.interact(near);
      }
    } else this.ui.prompt(null);

    // 理智与黑暗
    this._sanityTick(dt);
    this._campaignHazardTick(dt);
    // 白灯规矩
    this._whiteLampTick(dt);
    // 恐怖导演
    this.director.update(dt);
    // 心跳
    const s = this.pstats;
    const heartOn = s.hp < s.maxhp * 0.35 || s.san < 28 || (this.boss && this.boss.state !== 'dormant' && !this.flag('boss_done'));
    AudioSys.heartbeat(heartOn, 1 + (1 - s.hp / s.maxhp) * 1.1);
    AudioSys.updateHeart(dt);

    // Boss 血条
    if (this.boss && !this.boss.resolved && this.boss.state !== 'dormant') {
      this.ui.bossBar(true, this.boss.name, clamp(this.boss.hp / this.boss.maxhp, 0, 1));
    }

    this.R.sanity = s.san;
    this.ui.updateHUD();
    Input.endFrame();
  }

  _sanityTick(dt) {
    const p = this.player, s = this.pstats;
    let lit = this.lampRadius() > 0;
    if (!lit) {
      for (const pr of this.map.props) {
        if (pr.light && !pr.hidden && dist(pr.px, pr.py, p.x, p.y) < pr.light[0] * 0.85) { lit = true; break; }
      }
      if (!lit) for (const c of this.map.candles) {
        if (dist(c.x, c.y, p.x, p.y) < 80) { lit = true; break; }
      }
    }
    if (this.map.def.safe) lit = true;
    if (lit) this.addSanSilent((0.5 + (this.aggStats.sanRegen || 0)) * dt);
    else this.addSanSilent(-1.15 * dt);
  }
  addSanSilent(v) { this.pstats.san = clamp(this.pstats.san + v, 0, this.pstats.maxsan); }

  _campaignHazardTick(dt) {
    const hz = this.map?.def?.hazard;
    if (!hz) return;
    const p = this.player;
    const tx = Math.floor(p.x / TS), ty = Math.floor(p.y / TS);
    const cell = this.map.cell(tx, ty);
    let drain = 0;
    if (hz.type === 'rope') drain = this.map.isRoad(p.x, p.y) ? -10 : hz.rate;
    else if (hz.type === 'oxygen') drain = cell === ';' ? hz.rate : -14;
    else if (hz.type === 'loop') drain = hz.rate;
    else if (hz.type === 'memory' || hz.type === 'identity') {
      const anchor = this.map.props.some((q) => ['savepoint', `camp_clue_${this.map.def.chapter}`].includes(q.id) && dist(q.px, q.py, p.x, p.y) < 105);
      drain = anchor ? -18 : hz.rate;
    }
    if (this.settings.chaseAssist && drain > 0) drain *= 0.7;
    if (drain !== 0) this.hazard.value = clamp(this.hazard.value - drain * dt, 0, this.hazard.max);
    if (this.hazard.value > 0) return;
    if (hz.type === 'rope') {
      this.ui.sub('（绳索绷断。你在坠落前抓住了上一处石台。）', 3);
      this.player.hurt(22, this.player.x, this.player.y - 60, this);
      this.hazard.value = 55;
      this.player.x = this.respawn.x; this.player.y = this.respawn.y;
    } else if (hz.type === 'oxygen') {
      this.ui.sub('（胸口发紧。火苗缩成一点蓝光。）', 3);
      this.player.hurt(18, this.player.x, this.player.y, this);
      this.hazard.value = 38;
    } else if (hz.type === 'loop') {
      this.ui.sub('（鸡鸣前一刻，客栈又回到了入夜时。）', 3.4);
      this.addSan(-8);
      this.hazard.value = 100;
      this.gotoMap(this.mapId, 'default');
    } else if (hz.type === 'memory') {
      this.ui.sub('（你忘了刚才为何走到这里。）', 3);
      this.addSan(-14);
      this.hazard.value = 58;
    } else if (hz.type === 'identity') {
      this.ui.sub('（界面上的名字短暂变成一片空白。）', 3);
      this.addSan(-18); this.addYin(3);
      this.hazard.value = 48;
    }
  }

  _whiteLampTick(dt) {
    const def = this.map.def;
    if (!def.whiteLampZone || !this.player.lampOn) { this._wlT = 0; return; }
    const ld = this.lampDef();
    if (!ld || !ld.stats.white || this.pstats.oil <= 0) { this._wlT = 0; return; }
    const z = def.whiteLampZone, p = this.player;
    if (p.x > z.x * TS && p.x < (z.x + z.w) * TS && p.y > z.y * TS && p.y < (z.y + z.h) * TS) {
      this._wlT = (this._wlT || 0) + dt;
      if (this._wlT > 2.5) {
        this._wlT = -18; // 冷却
        this.onRuleViolated('rule_whitelamp');
      }
    } else this._wlT = 0;
  }

  // ============ 绘制 ============
  draw(dt) {
    const R = this.R;
    R.begin(dt);
    if (this.state === 'play' || this.state === 'dead') {
      const wob = R.sanityWobble();
      const x = R.ctx;
      x.save();
      x.translate(wob.x, wob.y);
      // 玩家灯光
      const p = this.player;
      const lr = this.lampRadius();
      const flick = this.flickerT > 0 ? 0.45 : 0;
      R.addLight(p.x, p.y - 10, Math.max(85, lr), 1, lr > 0 ? 'rgba(230,170,90,0.42)' : 'rgba(140,160,190,0.18)', 0.07 + flick);
      this.map.draw(R, this);
      // 交互高亮
      if (this._near) {
        const n = this._near;
        const nx = (n.px ?? n.x) + R.cam.ox(), ny = ((n.py ?? n.y) - (n.h ? n.h * 0.35 : 18)) + R.cam.oy();
        x.strokeStyle = `rgba(220,200,150,${0.5 + Math.sin(R.time * 5) * 0.25})`;
        x.lineWidth = 1.5;
        x.beginPath(); x.arc(nx, ny, 10 + Math.sin(R.time * 5) * 2, 0, Math.PI * 2); x.stroke();
      }
      R.updateFx(dt);
      R.drawParts();
      R.drawLighting();
      R.drawFloats();
      x.restore();
      R.drawWeather();
      R.drawPost();
    } else {
      // 标题/演出底色
      R.updateFx(dt);
      R.drawWeather();
      const x = R.ctx;
      const g = x.createRadialGradient(VW / 2, VH * 0.62, 60, VW / 2, VH * 0.62, VH * 0.8);
      g.addColorStop(0, 'rgba(40,36,30,0.45)');
      g.addColorStop(1, 'rgba(0,0,0,0.9)');
      x.fillStyle = g;
      x.fillRect(0, 0, VW, VH);
      R.rain = this.state === 'title' || this.state === 'cine' ? 0.8 : R.rain;
    }
  }

  // ============ 战斗 ============
  meleeHit(player, arc) {
    const wd = player.weaponDef();
    if (!this.equip.weapon) { this.ui.toast('赤手空拳。先找件称手的家伙。'); return; }
    if (this.map?.def?.hazard?.type === 'rhythm') {
      const sig = `${this.equip.weapon.base}:${arc.heavy ? 'H' : arc.combo}`;
      this._comboHistory.push(sig);
      if (this._comboHistory.length > 3) this._comboHistory.shift();
      if (this._comboHistory.length === 3 && this._comboHistory.every((x) => x === sig)) {
        this.addSan(-3);
        this.ui.sub('（戏楼记住了这套动作。换一种节奏！）', 2);
        this._comboHistory.length = 0;
      }
    }
    const agg = this.aggStats;
    let hitAny = false;
    for (const e of this.map.entities) {
      if (e.kind !== 'enemy' && e.kind !== 'boss') continue;
      if (e.dead || e.gone) continue;
      if (player.hitThisSwing.has(e)) continue;
      const d = dist(player.x, player.y, e.x, e.y);
      if (d > arc.range + e.size) continue;
      const a = angTo(player.x, player.y, e.x, e.y);
      if (Math.abs(angDiff(arc.ang, a)) > arc.arc / 2 + 0.25) continue;
      player.hitThisSwing.add(e);
      // 伤害计算
      let dmg = (this.equip.weapon.dmg || wd.dmg) * (1 + (agg.dmgPct || 0));
      if (arc.combo === wd.combo) dmg *= 1.25;
      if (arc.heavy) dmg *= wd.heavyMult;
      const cls = e.def?.cls;
      if (cls === 'paper') dmg *= (wd.vsBonus?.paper || 1) * (1 + (agg.vsPaper || 0));
      if (cls === 'ghost' || e.kind === 'boss') dmg *= (wd.vsBonus?.ghost || 1) * (1 + (agg.vsGhost || 0));
      if (cls === 'flesh') dmg *= (wd.vsBonus?.flesh || 1);
      if (wd.dmgType === 'zhen') dmg *= 1 + (agg.zhenDmg || 0);
      let crit = Math.random() < (wd.crit + (agg.crit || 0));
      if (crit) dmg *= 1.8;
      const res = e.hurt(Math.round(dmg), { ang: a, heavy: arc.heavy, dmgType: wd.dmgType, knock: arc.heavy ? 260 : 150 }, this);
      if (res.dmg > 0) {
        hitAny = true;
        const col = crit ? '#e8b23a' : (res.mult < 0.5 ? '#8a93a8' : '#e8d9b0');
        this.R.floatText(e.x, e.y - 36, (crit ? '暴击 ' : '') + res.dmg, col, crit ? 17 : 14);
        if (res.mult !== undefined && res.mult <= 0.2) {
          this.R.floatText(e.x, e.y - 52, '几乎无效', '#7888a0', 11);
          this.tutorial('tut.ghost');
        }
        if (crit) AudioSys.sfx('crit');
      }
    }
    if (hitAny) {
      this.freezeT = arc.heavy ? 0.085 : 0.045;
      this.R.shake(arc.heavy ? 6 : 3, 0.16);
    }
  }

  onEnemyKilled(e) {
    this.counters.kills++;
    this.R.spawnParts({ x: e.x, y: e.y - 10, n: 16, col: e.def.cls === 'paper' ? '#cfc7b0' : '#94343c', sp: 130, life: 0.8, rect: e.def.cls === 'paper' });
    AudioSys.sfx(e.def.cls === 'paper' ? 'paper' : 'hit_ghost', { vol: 0.9 });
    // 掉落
    const luck = this.aggStats.lootLuck || 0;
    const pool = this.mapId === 'hezangmu' || this.mapId === 'huntang' ? ['shovel', 'knife', 'peach'] : ['shovel', 'knife'];
    const drops = rollDrops(rng, e.def.tier, { luck, weaponPool: pool });
    for (const d of drops) {
      const ox = (Math.random() - 0.5) * 30, oy = (Math.random() - 0.5) * 20;
      if (d.type === 'money') this.map.pickups.push(makePickup(e.x + ox, e.y + oy, { money: d.n }));
      else if (d.type === 'use') this.map.pickups.push(makePickup(e.x + ox, e.y + oy, { item: makeUse(d.key) }));
      else if (d.type === 'weapon') {
        const it = makeWeapon(rng, d.key, { luck, rarity: d.rarity });
        this.map.pickups.push(makePickup(e.x + ox, e.y + oy, { item: it, glow: RARITIES[it.rarity].col + '88' }));
      } else if (d.type === 'gear') {
        const it = makeGear(rng, d.key);
        this.map.pickups.push(makePickup(e.x + ox, e.y + oy, { item: it, glow: RARITIES[it.rarity].col + '88' }));
      }
    }
    // 组队事件检查
    if (e.groupTag) {
      const alive = this.map.entities.some(x => x.kind === 'enemy' && x.groupTag === e.groupTag && !x.dead && !x.gone);
      if (!alive) this.setFlag('grp_' + e.groupTag);
    }
    e.gone = true;
  }

  onPlayerDeath() {
    if (this.state !== 'play') return;
    this.state = 'dead';
    this.counters.deaths++;
    AudioSys.sfx('stinger');
    AudioSys.heartbeat(false);
    this.ui.bossBar(false);
    setTimeout(() => {
      this.ui.death(() => {
        const s = this.pstats;
        s.hp = Math.round(s.maxhp * 0.6);
        s.stam = s.maxstam;
        s.san = Math.max(40, s.san);
        this.money = Math.round(this.money * 0.7);
        this.addYin(5);
        this.state = 'play';
        this.gotoMap(this.respawn.mapId, null, false, this.respawn.x, this.respawn.y);
      });
    }, 900);
  }

  onLampToggle() {}
  onModalClosed() {}

  onPerfectBlock(fromX, fromY) {
    const a = angTo(this.player.x, this.player.y, fromX, fromY);
    for (const e of this.map.entities) {
      if ((e.kind !== 'enemy' && e.kind !== 'boss') || e.dead || e.gone) continue;
      if (dist(e.x, e.y, this.player.x, this.player.y) > 86) continue;
      e.knockx += Math.cos(a) * 240;
      e.knocky += Math.sin(a) * 240;
      if (e.staggerT != null) e.staggerT = Math.max(e.staggerT, 0.45);
    }
  }

  quickHeal() {
    const order = ['bandage', 'med', 'incense', 'oilcan'];
    const it = this.inventory.find((x) => x.kind === 'use' && order.includes(x.base));
    if (!it) { this.ui.toast('没有可快捷使用的药品。'); return false; }
    return this.useItem(it);
  }

  switchWeapon() {
    const idx = this.inventory.findIndex((x) => x.kind === 'weapon');
    if (idx < 0) { this.ui.toast('行囊里没有备用主手。'); return false; }
    const next = this.inventory[idx];
    this.inventory.splice(idx, 1);
    if (this.equip.weapon) this.inventory.push(this.equip.weapon);
    this.equip.weapon = next;
    this.recompute();
    AudioSys.sfx('pickup');
    this.ui.toast('切换主手：' + next.name);
    return true;
  }

  castSkill(slot) {
    const p = this.player;
    const treeHas = (prefix) => (this.skills.bought || []).some((id) => id.startsWith(prefix + '_'));
    if (slot === 1) {
      if (this.pstats.stam < 25) { this.tutorial('tut.stamina'); return; }
      this.pstats.stam -= 25;
      const ward = treeHas('ward');
      const radius = ward ? 145 : 105;
      this.R.spawnParts({ x: p.x, y: p.y - 12, n: 30, col: ward ? '#d7c177' : '#b8ad92', sp: 120, life: 0.7 });
      AudioSys.sfx(ward ? 'zhenxie' : 'bell', { vol: 0.9 });
      for (const e of this.map.entities) {
        if ((e.kind !== 'enemy' && e.kind !== 'boss') || e.dead || e.gone) continue;
        const d = dist(p.x, p.y, e.x, e.y);
        if (d > radius) continue;
        const dmg = ward || e.def?.cls === 'ghost' ? 22 + this.chapter * 2 : 10;
        e.hurt(dmg, { ang: angTo(p.x, p.y, e.x, e.y), heavy: true, dmgType: 'zhen', knock: 240 }, this);
      }
      this.ui.sub(ward ? '镇邪印扩散开去。' : '你敲响铜铃，逼退近身的东西。', 1.8);
    } else {
      if (this.pstats.san < 10) { this.ui.toast('理智不足，无法使用禁忌技。'); return; }
      this.pstats.san -= 10;
      this.addYin(treeHas('taboo') ? 2 : 5);
      this.freezeT = 0.08;
      this.R.shake(8, 0.22);
      this.R.flash('rgba(90,20,70,0.35)', 0.18);
      for (const e of this.map.entities) {
        if ((e.kind !== 'enemy' && e.kind !== 'boss') || e.dead || e.gone) continue;
        if (dist(p.x, p.y, e.x, e.y) < 170) {
          e.hurt(32 + this.pstats.yin * 0.25, { ang: angTo(p.x, p.y, e.x, e.y), heavy: true, dmgType: 'yin', knock: 180 }, this);
        }
      }
      this.ui.sub('阴冷的念头借你的手向外伸了一下。', 2);
    }
  }

  spawnStalker() {
    // 三级事件：黑暗中生成一只红衣影，缓慢逼近
    if (!this.map || this.map.def.safe) return;
    const p = this.player;
    const a = Math.random() * Math.PI * 2;
    const ex = clamp(p.x + Math.cos(a) * 340, 40, this.map.pw - 40);
    const ey = clamp(p.y + Math.sin(a) * 340, 40, this.map.ph - 40);
    if (this.map.collides(ex, ey, 14)) return;
    const e = new Enemy('redshade', ex, ey, this);
    e.aware = true;
    this.map.entities.push(e);
    this.ui.sub('（灯影外，多了一道红。）', 3);
    AudioSys.sfx('stinger', { vol: 0.6 });
  }

  // ============ 事件脚本 ============
  runEvent(id) {
    if (id.startsWith('ev_campaign_enter_')) {
      this._campaignEnter(Number(id.split('_').pop()));
      return;
    }
    if (id.startsWith('ev_campaign_boss_')) {
      this._campaignBossTrigger(Number(id.split('_').pop()));
      return;
    }
    const steps = EVENTS[id];
    if (!steps) return;
    let delay = 0;
    for (const st of steps) {
      setTimeout(() => this._execStep(st), delay * 1000);
      if (st.sub) delay += 2.4;
      else if (st.card) delay += 3.4;
      else if (st.tut) delay += 1.2;
      else delay += 0.15;
    }
  }
  _execStep(st) {
    if (st.sub) this.ui.sub(st.sub, 3.2);
    if (st.obj) this.setObjective(st.obj);
    if (st.tut) this.tutorial(st.tut);
    if (st.sfx) AudioSys.sfx(st.sfx, { vol: st.vol ?? 1 });
    if (st.card) this.ui.chapterCard(CHAPTER_CARDS[st.card], () => {});
    if (st.spawnGroup) this._spawnGroup(st.spawnGroup);
    if (st.custom) this._customEvent(st.custom);
  }
  _spawnGroup(group) {
    if (this.flag('grp_' + group)) return;
    const def = this.map.def;
    for (const e of (def.enemies || [])) {
      if (e.group !== group) continue;
      const en = new Enemy(e.type, e.x * TS, e.y * TS, this);
      en.aware = true;
      en.groupTag = group;
      this.map.entities.push(en);
    }
  }

  _customEvent(name) {
    switch (name) {
      case 'sedan_event': {
        AudioSys.sfx('suona', { vol: 0.9 });
        this.ui.sub('（唢呐声由远及近——红轿来了。）', 2.5);
        setTimeout(() => {
          this.ui.sub('【规矩】见红轿，让路。快离开主路！', 3);
          const pr = new Procession(27 * TS, 2 * TS, 43 * TS, this);
          this.map.entities.push(pr);
        }, 2200);
        break;
      }
      case 'sob_event': {
        AudioSys.sfx('sob', { vol: 1 });
        this.ui.dialog({
          start: () => 's1',
          nodes: {
            s1: {
              sp: '——',
              text: '身后传来哭声。很近，就贴着你的后颈。\n是个女孩的声音，哭一声，停一停，像在等你接话。',
              opts: [
                { t: '回头看看', next: 's_look' },
                { t: '盯着前方，继续走', next: 's_walk' },
              ],
            },
            s_look: {
              sp: '——',
              text: '你回了头。\n路上空空如也。哭声却到了你的正前方——\n「你应了。」',
              opts: [{ t: '！', next: null }],
              result: 'sob_fail',
            },
            s_walk: {
              sp: '——',
              text: '你数着自己的脚步，一步，两步……哭声跟了你十几步，渐渐被雨声盖住了。\n（规矩单上是对的：莫回应。）',
              opts: [{ t: '（继续前进）', next: null }],
              result: 'sob_ok',
            },
          },
        }, {
          onResult: (r) => {
            if (r === 'sob_fail') {
              this.onRuleViolated('rule_sob');
            } else {
              this.addSan(-4);
              this.giveRule('rule_sob');
            }
          },
        });
        break;
      }
      case 'boss_intro': {
        if (this.flag('boss_done') || !this.boss) break;
        AudioSys.music('none');
        this.ui.dialog(DIALOGS.dlg_boss_intro, {
          onClose: () => {
            AudioSys.music('boss');
            AudioSys.sfx('suona', { vol: 1 });
            this.boss.activate();
            this.setFlag('boss_started');
          },
        });
        break;
      }
      case 'paperman_turn': break; // 在交互里处理
      default: break;
    }
  }

  // ============ 规矩违反 ============
  onRuleViolated(ruleId) {
    this.giveRule(ruleId);
    if (ruleId === 'rule_sedan') {
      this.ui.sub('（你挡了它们的路。轿帘，掀开了一条缝。）', 3.2);
      AudioSys.sfx('stinger');
      this.R.flash('rgba(140,20,28,0.5)', 0.2);
      this.player.hurt(14, this.player.x, this.player.y - 40, this);
      this.addYin(10);
      this.addSan(-10);
      this.setFlag('rule_sedan_violated');
      setTimeout(() => this.spawnStalker(), 1200);
    } else if (ruleId === 'rule_sob') {
      this.addYin(6);
      this.addSan(-8);
      this.setFlag('rule_sob_violated');
      AudioSys.sfx('stinger');
      // 哭嫁童伏击
      for (let i = 0; i < 2; i++) {
        const e = new Enemy('weepchild', this.player.x + (Math.random() - 0.5) * 120, this.player.y + (Math.random() - 0.5) * 120, this);
        e.aware = true;
        this.map.entities.push(e);
      }
    } else if (ruleId === 'rule_whitelamp') {
      this.ui.sub('（白灯一照，满屋的影子都站了起来。）', 3.2);
      this.addYin(8);
      AudioSys.sfx('stinger');
      for (let i = 0; i < 2; i++) {
        const e = new Enemy('weepchild', this.player.x + (Math.random() - 0.5) * 140, this.player.y + (Math.random() - 0.5) * 140, this);
        e.aware = true;
        this.map.entities.push(e);
      }
      this.setFlag('rule_whitelamp_violated');
    }
  }
  onProcessionEnd(violated) {
    if (!violated) {
      this.ui.sub('（队伍过去了。你才发现自己一直屏着气。）', 3);
      this.giveRule('rule_sedan');
      this.giveClue('clue_sedan');
    }
  }

  // ============ Boss 流程 ============
  bossRitual() {
    AudioSys.sfx('gong');
    setTimeout(() => {
      this.ui.dialog(DIALOGS.dlg_boss_ritual, {
        onResult: (r) => {
          if (r === 'ok') {
            this.ui.sub('（礼成。她周身的红绸垂落了一瞬——动手！）', 3);
            this.boss.hp -= 90;
            this.boss.staggerT = 2.6;
            this.boss.state = 'chase';
            this.setFlag('ritual_ok');
            AudioSys.sfx('bell');
          } else {
            this.player.hurt(18, this.boss.x, this.boss.y, this);
            this.ui.sub('（礼错了。绸缎勒进你的皮肉。）', 3);
            this.boss.state = 'chase';
          }
          AudioSys.music('boss');
        },
        onClose: () => { this.boss.state = 'chase'; },
      });
    }, 600);
  }

  bossKneel() {
    AudioSys.music('sad');
    setTimeout(() => {
      this.ui.dialog(DIALOGS.dlg_boss_choice, {
        onChoice: (c) => {
          if (c === 'kill') {
            this.boss.kneeling = false;
            this.boss.state = 'chase';
            this.ui.sub('（你举起了武器。她不再躲了。）', 2.5);
            AudioSys.music('boss');
          } else if (c === 'pacify') {
            this.bossResolve('pacify');
          } else if (c === 'name') {
            this.bossResolve('name');
          }
        },
        onResult: (r) => {
          if (r === 'enrage') {
            this.boss.enraged = true;
            this.boss.kneeling = false;
            this.boss.state = 'chase';
            this.boss.hp = Math.min(this.boss.maxhp * 0.45, this.boss.hp + this.boss.maxhp * 0.2);
            AudioSys.music('boss');
            AudioSys.sfx('suona', { vol: 1 });
          }
        },
        onClose: () => { if (this.boss && !this.boss.resolved) { this.boss.state = 'chase'; this.boss.kneeling = false; } },
      });
    }, 800);
  }

  bossResolve(choice) {
    if (!this.boss || this.boss.resolved) return;
    this.boss.resolved = true;
    this.boss.state = 'wait';
    this.setFlag('boss_done');
    this.setFlag('ending_' + choice);
    this.ui.bossBar(false);
    AudioSys.heartbeat(false);
    AudioSys.music('sad');
    // 奖励
    const px = this.player.x, py = this.player.y;
    if (choice === 'kill') {
      const shoe = makeCharm('charm_shoe');
      this.map.pickups.push(makePickup(px + 30, py, { item: shoe, glow: '#d9a440aa' }));
      const w = makeWeapon(rng, 'knife', { rarity: 'mingqi' });
      this.map.pickups.push(makePickup(px - 30, py + 10, { item: w, glow: '#c8746faa' }));
      this.addYin(8);
    } else if (choice === 'pacify') {
      const cs = makeWeapon(rng, 'coinsword', { rarity: 'fine' });
      this.map.pickups.push(makePickup(px + 30, py, { item: cs, glow: '#7fae8eaa' }));
      this.pstats.yin = Math.max(0, this.pstats.yin - 15);
      this.ui.toast('阴蚀 -15');
    } else if (choice === 'name') {
      const shoe = makeCharm('charm_shoe');
      this.map.pickups.push(makePickup(px + 30, py, { item: shoe, glow: '#d9a440aa' }));
      const cs = makeWeapon(rng, 'coinsword', { rarity: 'rare' });
      this.map.pickups.push(makePickup(px - 30, py + 10, { item: cs, glow: '#6f9fc8aa' }));
      this.pstats.yin = Math.max(0, this.pstats.yin - 25);
      this.setFlag('truename_given');
    }
    // 退场演出 -> 第一章结算
    const endKey = choice === 'kill' ? 'end_kill' : choice === 'pacify' ? 'end_pacify' : 'end_name';
    setTimeout(() => {
      this.R.flash('rgba(255,240,220,0.7)', 0.8);
      AudioSys.sfx('bell', { vol: 1 });
      if (this.boss) { this.boss.gone = true; this.boss.dead = true; }
      this.ui.sub('（满堂红烛，次第熄灭。）', 3.5);
    }, 1600);
    setTimeout(() => {
      this.saveGame();
      this.state = 'ending';
      const stats = {
        playSec: this.counters.playSec, deaths: this.counters.deaths,
        kills: this.counters.kills, clues: this.clues.length, yin: Math.round(this.pstats.yin),
      };
      this.ui.ending(ENDINGS[endKey], ENDINGS.epilogue, stats, () => {
        this.state = 'play';
        this.campaign.completed[1] = true;
        this.campaign.choices[1] = choice;
        if (choice === 'name') { this.campaign.mercy += 2; this.campaign.names += 1; }
        else if (choice === 'pacify') this.campaign.mercy += 1;
        this.chapter = Math.max(this.chapter, 2);
        this.skills.points += 3;
        this.setFlag('ch2_unlocked');
        this.gotoMap('laozhai', 'gate');
        this.setObjective('第二章已解锁：在线索墙前往百棺岭');
        this.saveGame(true);
      });
    }, 5200);
  }
  toTitleSoft() {
    // 结局后回标题但保留存档
    this.saveGame();
    this.state = 'title';
    this.toTitle();
  }

  // ============ Chapters 2-8 and finale ============
  _campaignEnter(chapter) {
    const d = CAMPAIGN_CHAPTERS[chapter];
    if (!d) return;
    this.ui.chapterCard({ sup: d.sup, title: d.title, sub: d.subtitle }, () => {});
    this.setObjective(d.objective);
    setTimeout(() => this.ui.sub(`【${d.hazard.label}】${d.hazard.hint}`, 5), 3000);
  }

  _campaignBossTrigger(chapter) {
    if (!this.boss || this.boss.resolved || this.campaign.completed[chapter]) return;
    const key = `camp_boss_intro_${chapter}`;
    if (this.flag(key)) { this.boss.activate(); return; }
    this.setFlag(key);
    const d = CAMPAIGN_CHAPTERS[chapter];
    AudioSys.music('none');
    this.ui.dialog({
      start: 'intro',
      nodes: {
        intro: {
          sp: d.boss.name,
          text: `${d.summary}留下的东西在前方聚成了形。\n${this.flag(`camp_puzzle_ok_${chapter}`) ? '你已经找到它赖以存在的那段谎言。' : '你还没有解开本章核心线索，直接交战会更艰难。'}`,
          opts: [
            { t: '进入战斗', next: null, choice: 'fight' },
            { t: '先退回去调查', next: null, choice: 'leave' },
          ],
        },
      },
    }, {
      onChoice: (choice) => {
        if (choice === 'fight') {
          AudioSys.music('boss');
          AudioSys.sfx(chapter === 4 ? 'gong' : 'stinger', { vol: 0.8 });
          this.boss.activate();
        } else {
          this.player.y += 110;
          delete this.flags[key];
        }
      },
    });
  }

  _campaignInteract(target) {
    const m = target.id.match(/^camp_(\w+)_(\d+)(?:_(\d+))?$/);
    if (!m) return;
    const kind = m[1];
    const chapter = Number(m[2]);
    const landmarkIdx = m[3] == null ? null : Number(m[3]);
    const d = CAMPAIGN_CHAPTERS[chapter];
    if (!d) return;
    if (kind === 'clue') {
      const f = `camp_clue_done_${chapter}`;
      if (this.flag(f)) { this.ui.textbox(`《${d.clue.name}》\n${d.clue.text}`); return; }
      this.setFlag(f);
      CLUES[d.clue.id] = { name: d.clue.name, text: d.clue.text };
      this.ui.textbox(`${d.clue.name}\n\n${d.clue.text}`, () => {
        this.giveClue(d.clue.id);
        this.campaign.names += chapter >= 6 ? 1 : 0;
      });
    } else if (kind === 'relic') {
      const f = `camp_relic_done_${chapter}`;
      if (this.flag(f)) { this.ui.textbox(`（${d.relic.name}已经收进修复箱。）`); return; }
      this.setFlag(f);
      ARTIFACTS[d.relic.id] = {
        name: d.relic.name, icon: chapter % 2 ? 'it_book' : 'it_handkerchief',
        era: chapter === 7 ? '1981-1998' : '年代待考', material: chapter % 2 ? '纸/木' : '织物/金属',
        found: `${d.title}·支墓`, broken: d.relic.text, needs: { money: 18 + chapter * 4 },
        gainText: '修复后，本章隐藏解决路线将更加稳定。',
        lore: `${d.relic.text}\n修复后，物件背后的使用痕迹比它的市场价值更重要。`,
      };
      this.ui.textbox(`${d.relic.name}\n\n${d.relic.text}`, () => this.giveArtifact(d.relic.id));
    } else if (kind === 'puzzle') {
      if (this.flag(`camp_puzzle_ok_${chapter}`)) {
        this.ui.textbox(`（谜题已解。）\n${d.puzzle.success}`);
        return;
      }
      const opts = d.puzzle.options.map((label, i) => ({ t: label, next: null, choice: String(i) }));
      this.ui.dialog({ start: 'q', nodes: { q: { sp: '调查推理', text: d.puzzle.prompt, opts } } }, {
        onChoice: (choice) => {
          const ok = Number(choice) === d.puzzle.correct;
          if (ok) {
            this.setFlag(`camp_puzzle_ok_${chapter}`);
            this.ui.textbox(d.puzzle.success, () => {
              AudioSys.sfx('bell', { vol: 0.6 });
              this.skills.points += 1;
              this.ui.toast('推理完成 · 技能点 +1');
            });
          } else {
            this.addSan(-8);
            this.addYin(2);
            this.ui.textbox('线索彼此对不上。你听见暗处有人替你说出了错误答案。');
          }
        },
      });
    } else if (kind === 'seal') {
      if (this.campaign.completed[chapter]) {
        this.ui.textbox('（这里已经安静下来。回老宅整理下一条线索。）');
        return;
      }
      if (!this.boss) return;
      this._campaignBossTrigger(chapter);
    } else if (kind === 'landmark') {
      const lm = CHAPTER_LANDMARKS[chapter]?.[landmarkIdx];
      if (!lm) return;
      this.ui.textbox(`${lm[0]}\n\n${lm[1]}`, () => {
        this.addSan(-1);
      });
    }
  }

  campaignBossMechanic(boss) {
    const chapter = boss.chapter;
    const d = CAMPAIGN_CHAPTERS[chapter];
    const solved = this.flag(`camp_puzzle_ok_${chapter}`);
    AudioSys.music('none');
    this.ui.dialog({
      start: 'm',
      nodes: {
        m: {
          sp: '——',
          text: solved
            ? `${d.puzzle.success}\n你把调查结果带进战场，${d.boss.name}赖以维持的仪式出现裂缝。`
            : `${d.boss.name}改变了战场。你没有足够线索识破规则，只能硬撑过去。`,
          opts: [{ t: solved ? '利用环境机制反制' : '护住灯火，继续战斗', next: null }],
        },
      },
    }, {
      onClose: () => {
        if (!this.boss || this.boss.resolved) return;
        if (solved) {
          this.boss.hp = Math.max(1, this.boss.hp - this.boss.maxhp * 0.16);
          this.ui.sub('（环境反过来压住了它。）', 2.6);
          AudioSys.sfx('gong', { vol: 0.65 });
        } else {
          this.player.hurt(14 + chapter, this.boss.x, this.boss.y, this);
        }
        this.boss.state = 'chase';
        AudioSys.music('boss');
      },
    });
  }

  campaignBossDecision(boss) {
    const chapter = boss.chapter;
    if (chapter === 9) { this._finalChoice(); return; }
    const d = CAMPAIGN_CHAPTERS[chapter];
    const solved = this.flag(`camp_puzzle_ok_${chapter}`);
    const hasRelic = this.flag(`camp_relic_done_${chapter}`);
    const hasClue = this.flag(`camp_clue_done_${chapter}`);
    const opts = [{ t: d.branches.kill.label, next: null, choice: 'kill' }];
    if (solved) opts.push({ t: d.branches.solve.label, next: null, choice: 'solve' });
    if (solved && hasRelic && hasClue) opts.push({ t: d.branches.mercy.label, next: null, choice: 'mercy' });
    this.ui.dialog({
      start: 'c',
      nodes: {
        c: {
          sp: d.boss.name,
          text: '它的形体已经维持不住。战斗可以结束，但如何结束，会留下不同的东西。',
          opts,
        },
      },
    }, { onChoice: (choice) => this.resolveCampaignBoss(chapter, choice) });
  }

  resolveCampaignBoss(chapter, choice) {
    const d = CAMPAIGN_CHAPTERS[chapter];
    const branch = d.branches[choice];
    if (!branch || !this.boss) return;
    this.boss.resolved = true;
    this.boss.gone = true;
    this.boss.dead = true;
    this.ui.bossBar(false);
    AudioSys.heartbeat(false);
    AudioSys.music('sad');
    this.campaign.completed[chapter] = true;
    this.campaign.choices[chapter] = choice;
    this.campaign.mercy += branch.mercy || 0;
    this.campaign.names += branch.name || 0;
    this.campaign.genealogy += branch.genealogy || 0;
    this.campaign.parent += branch.parent || 0;
    this.campaign.xiaoman += branch.xiaoman || 0;
    if (branch.yin) this.addYin(branch.yin);
    this.skills.points += choice === 'mercy' ? 4 : 3;
    this.money += 30 + chapter * 12;

    const rewardWeapons = ['luoyang', 'mirror', 'miaodao', 'crossbow', 'ruler', 'nail', 'bell'];
    const weaponKey = rewardWeapons[Math.max(0, chapter - 2) % rewardWeapons.length];
    const reward = makeWeapon(rng, weaponKey, { rarity: choice === 'mercy' ? 'guqi' : 'rare' });
    this.addItemObj(reward);
    const gearKey = Object.keys(GEAR_BASES)[chapter % Object.keys(GEAR_BASES).length];
    this.addItemObj(makeGear(rng, gearKey));

    const next = chapter + 1;
    this.chapter = Math.max(this.chapter, next);
    if (next <= 9) this.setFlag(`ch${next}_unlocked`);
    this.ui.textbox(`${d.sup} · ${d.title}\n\n${branch.note}\n\n获得：${reward.name}\n技能点 +${choice === 'mercy' ? 4 : 3}`, () => {
      this.gotoMap('laozhai', 'gate');
      const nd = CAMPAIGN_CHAPTERS[next];
      this.setObjective(nd ? `${nd.sup}已解锁：在线索墙前往${nd.title}` : '回到老宅整理往事');
      this.saveGame(true);
    });
  }

  _finalChoice() {
    const truthReady = this.campaign.mercy >= 10 && this.campaign.names >= 7
      && this.campaign.genealogy > 0 && this.campaign.parent > 0
      && this.campaign.xiaoman > 0 && !this.campaign.tabooAccepted;
    const noneReady = this.counters.deaths >= 3 && this.pstats.yin >= 55 && this.clues.includes('clue_child_night');
    const opts = [
      { t: '接替父亲，成为守门人', next: null, choice: 'guard' },
      { t: '强行带父母回家', next: null, choice: 'home' },
      { t: '交出全部童年记忆', next: null, choice: 'forget' },
      { t: '焚毁墓宫，公开一切', next: null, choice: 'burn' },
      { t: '接受无名者的禁器与财富', next: null, choice: 'greed' },
    ];
    if (truthReady) opts.push({ t: '叫回所有名字，让往事不再下葬', next: null, choice: 'truth' });
    if (noneReady) opts.push({ t: '承认自己只是墓中长大的记忆', next: null, choice: 'none' });
    this.ui.dialog({
      start: 'f',
      nodes: {
        f: {
          sp: '无名者',
          text: '父亲的灯快灭了。母亲站在门外。万人名墙在等一句话。\n你只能决定谁离开、谁留下，以及这段历史要不要被人看见。',
          opts,
        },
      },
    }, { onChoice: (choice) => this._finishFinalEnding(choice) });
  }

  _finishFinalEnding(choice) {
    if (choice === 'greed') this.campaign.tabooAccepted = true;
    if (choice === 'burn' || choice === 'truth') this.campaign.publicTruth = true;
    this.campaign.completed[9] = true;
    this.campaign.ending = choice;
    this.setFlag('game_completed');
    this.settings.keeperUnlocked = true;
    this.saveSettings();
    this.state = 'ending';
    const stats = {
      playSec: this.counters.playSec, deaths: this.counters.deaths,
      kills: this.counters.kills, clues: this.clues.length, yin: Math.round(this.pstats.yin),
    };
    this.ui.ending(FINAL_ENDINGS[choice], [], stats, () => {
      this.saveGame();
      this.toTitle();
    }, true);
  }

  buySkill(id) {
    if (this.skills.bought.includes(id)) return false;
    let found = null, tree = null;
    for (const tdef of Object.values(SKILL_TREES)) {
      const n = tdef.nodes.find((x) => x.id === id);
      if (n) { found = n; tree = tdef; break; }
    }
    if (!found || this.skills.points < found.cost) return false;
    const boughtInTree = this.skills.bought.filter((x) => x.startsWith(tree.id + '_')).length;
    if (found.tier === 2 && boughtInTree < 5) return false;
    if (found.tier === 3 && boughtInTree < 10) return false;
    this.skills.points -= found.cost;
    this.skills.bought.push(id);
    if (tree.id === 'taboo') {
      this.campaign.tabooAccepted = true;
      this.addYin(2);
    }
    this.recompute();
    this.saveGame();
    return true;
  }

  buyCampUpgrade(id) {
    const up = CAMP_UPGRADES[id];
    if (!up || this.campUpgrades[id] || this.money < up.cost) return false;
    this.money -= up.cost;
    this.campUpgrades[id] = true;
    this.recompute();
    this.saveGame();
    return true;
  }

  // ============ 交互调度 ============
  interact(target) {
    if (target.kind === 'npc') {
      const dlg = DIALOGS[target.def.dialog];
      if (dlg) {
        this.ui.dialog(dlg, {
          onShop: () => this.ui.shop(),
          onClose: () => {},
        });
      }
      return;
    }
    if (target.id?.startsWith('camp_')) {
      this._campaignInteract(target);
      return;
    }
    const def = INTERACTS[target.id];
    if (!def) return;
    const F = 'itx_' + this.mapId + '_' + target.id; // 一次性标记
    switch (def.type) {
      case 'text': this.ui.textbox(def.text); break;
      case 'save':
        this.pstats.hp = this.pstats.maxhp;
        this.pstats.san = clamp(this.pstats.san + 25, 0, this.pstats.maxsan);
        this.respawn = { mapId: this.mapId, x: target.px, y: target.py + 30 };
        this.saveGame(true);
        AudioSys.sfx('bell', { vol: 0.6 });
        break;
      case 'clueboard': this.ui.clueboard(); break;
      case 'bench': this.ui.bench(); break;
      case 'npc': {
        const npc = this.map.entities.find(e => e.kind === 'npc');
        if (npc) this.interact(npc);
        else this.ui.dialog(DIALOGS.dlg_linshu, { onShop: () => this.ui.shop() });
        break;
      }
      case 'clue':
        this.ui.textbox(def.text, () => this.giveClue(def.clue));
        break;
      case 'loot': {
        if (this.flag(F)) { this.ui.textbox('（已经搜过了。）'); break; }
        this.setFlag(F);
        this.ui.textbox(def.text, () => {
          if (def.loot.money) { this.money += def.loot.money; AudioSys.sfx('coin'); this.ui.toast('🪙 +' + def.loot.money); }
          if (def.loot.use) { this.addItem('use', def.loot.use); this.ui.toast('获得 ' + CONSUMABLES[def.loot.use].name); AudioSys.sfx('pickup'); }
          this.ui.updateHUD();
        });
        break;
      }
      case 'chest': {
        if (this.flag(F)) { this.ui.textbox('（空了。）'); break; }
        this.setFlag(F);
        AudioSys.sfx('unlock');
        this.ui.textbox(def.text, () => {
          const luck = this.aggStats.lootLuck || 0;
          this.money += 10 + Math.floor(Math.random() * 15) * def.tier;
          const it = makeWeapon(rng, def.tier >= 2 ? (Math.random() < 0.4 ? 'peach' : 'knife') : (Math.random() < 0.5 ? 'shovel' : 'knife'), { luck: luck + def.tier * 0.2 });
          this.map.pickups.push(makePickup(target.px, target.py + 26, { item: it, glow: RARITIES[it.rarity].col + '88' }));
          if (def.tier >= 2) {
            this.map.pickups.push(makePickup(target.px + 24, target.py + 30, { item: makeLamp('lamp_storm'), glow: '#7fae8e88' }));
          }
          AudioSys.sfx('coin');
          this.ui.updateHUD();
        });
        break;
      }
      case 'door': {
        if (this.flag(def.flag)) { this.ui.textbox('（门开着。）'); break; }
        const ok = def.needItem ? this.flag(def.needItem) : (def.needFlag ? this.flag(def.needFlag) : true);
        if (ok) {
          AudioSys.sfx('unlock');
          this.ui.textbox(def.openText, () => {
            this.setFlag(def.flag);
            AudioSys.sfx('door');
          });
        } else {
          AudioSys.sfx('door_locked');
          this.ui.textbox(def.lockedText);
        }
        break;
      }
      case 'door2map': {
        const ok = def.needItem ? this.flag(def.needItem) : true;
        if (ok) {
          if (!this.flag(F)) {
            this.setFlag(F);
            AudioSys.sfx('unlock');
            this.ui.textbox(def.openText, () => this.gotoMap(def.to, def.spawn));
          } else this.gotoMap(def.to, def.spawn);
        } else {
          AudioSys.sfx('door_locked');
          this.ui.textbox(def.lockedText);
        }
        break;
      }
      case 'custom': this._customInteract(def, target, F); break;
      default: break;
    }
  }

  _customInteract(def, target, F) {
    const C = def.custom;
    switch (C) {
      case 'bus_box': {
        if (this.flag(F)) {
          this.ui.textbox('木盒已经打开。盒底还留着湿木头的气味，像刚从土里挖出来。');
          break;
        }
        this.setFlag(F);
        this.ui.textbox('你蹲在车厢地板上，打开那只没有寄件人的木盒。\n里面是半块玉佩、一把生锈的钥匙、一盘父亲的磁带、泡皱的合影和一张旧报纸。\n车厢灯忽明忽暗。你数了数座位——空座比刚才少了一个。', () => {
          this.setFlag('key_rust');
          this.giveClue('clue_photo');
          this.giveClue('clue_news');
          this.giveClue('clue_bus_ticket');
          this.giveTape('tape_father1', true);
          this.questNote('木盒打开：生锈钥匙、父亲磁带、合影与旧报纸已经收好。', '物证');
          this.setObjective('从末班车前门下车，穿过废弃车站上山');
          AudioSys.sfx('unlock');
        });
        break;
      }
      case 'bus_passengers': {
        this.ui.textbox('这一排座位的坐垫全是凹下去的。\n你把手按上去，冷得像墓砖。\n靠窗的位置有一道水印，形状像戴斗笠的人刚刚站起来。', () => {
          this.addSan(-4);
          AudioSys.sfx('whisper', { vol: 0.45 });
        });
        break;
      }
      case 'station_ticket': {
        if (this.flag(F)) { this.ui.textbox('售票窗口里空空的。玻璃后面那张脸，没有再出现。'); break; }
        this.setFlag(F);
        this.ui.textbox('售票窗口的玻璃后面贴着退色价目表。\n你刚低头看票价，玻璃里忽然多出一张女人的脸。\n她嘴唇动了动，像在说：「别让他们知道你回来了。」', () => {
          this.addSan(-6);
          AudioSys.sfx('stinger', { vol: 0.55 });
          this.R.flash('rgba(180,200,230,0.18)', 0.12);
        });
        break;
      }
      case 'station_phone': {
        if (this.flag(F)) { this.ui.textbox('电话听筒挂好了。你没有再拨家里的号码。'); break; }
        this.setFlag(F);
        this.ui.textbox('公共电话没有插线。你还是拿起听筒，拨了母亲的号码。\n忙音响了三声，忽然接通。\n听筒那头，是你母亲年轻时哄你睡觉的歌声。\n唱到一半，她停下：\n「归川，别回头。」', () => {
          this.addSan(-8);
          this.setObjective('离开车站，沿湿路进入归魂山');
          AudioSys.sfx('sob', { vol: 0.5 });
        });
        break;
      }
      case 'paperman_turn': {
        if (this.flag(F)) { this.ui.textbox('（纸人还朝着山上。你不想再看它的脸。）'); break; }
        this.setFlag(F);
        AudioSys.sfx('paper');
        this.ui.textbox(def.text, () => { this.addSan(-6); AudioSys.sfx('whisper'); });
        break;
      }
      case 'table_bowls': {
        this.ui.textbox(this.flag(F)
          ? '三副碗筷还在。你没有动它们。'
          : '桌上摆着三副碗筷。\n一副落满了灰。一副干净。\n你伸手碰了碰第三副的碗沿——\n是温的。', () => {
          if (!this.flag(F)) {
            this.setFlag(F);
            this.giveClue('clue_bowls');
            this.addSan(-5);
            this.setObjective('搜索老宅：厨房灶台 / 母亲房间 / 父亲工作间 / 柴房');
          }
        });
        break;
      }
      case 'mirror_event': {
        if (this.flag(F)) { this.ui.textbox('镜面蒙着灰。你没有再擦第二次。'); break; }
        this.setFlag(F);
        this.ui.textbox('你抹开镜上的灰。\n镜子里，堂屋的门口站着一个人影，蓑衣斗笠，往下滴水。\n——你猛地回头。\n门口没有人。只有门槛上一摊真实的水渍。', () => {
          AudioSys.sfx('stinger');
          this.R.flash('rgba(180,200,230,0.3)', 0.12);
          this.addSan(-10);
          setTimeout(() => this.ui.sub('（你再看镜子时，镜中的你——还没有回过头。）', 4), 1500);
        });
        break;
      }
      case 'home_recorder': {
        if (!this.flag(F) && this.tapes.includes('tape_father1')) {
          this.setFlag(F);
          this.ui.textbox('老录音机摆在堂屋北墙下，磁头被擦得很亮。\n你把父亲那盘磁带按进去。\n按键落下的一瞬间，屋外的雨声停了半拍。', () => {
            this.ui.tape(TAPES.tape_father1, () => {
              this.setFlag('home_paperman_revealed');
              this.map.refreshDoors();
              this.R.flash('rgba(0,0,0,0.65)', 0.18);
              this.R.shake(9, 0.45);
              AudioSys.sfx('paper', { vol: 0.9 });
              this.addSan(-7);
              this.ui.sub('（堂屋东厢门边，多了一个刚扎好的纸人。）', 4);
              this.setObjective('调查突然出现的纸人，再搜索厨房和母亲房间');
            });
          });
        } else if (this.tapes.length) this.ui.journal('tapes');
        else this.ui.textbox('一台老录音机。仓里是空的。');
        break;
      }
      case 'home_paperman': {
        if (this.flag(F)) { this.ui.textbox('纸人烧焦的黑印还在门槛上。它的头发是一缕真人的白发。'); break; }
        this.setFlag(F);
        this.ui.textbox('纸人站在东厢门口，脸上没有五官，只贴着一张很小的红纸：\n「替归川守门。」\n你伸手去揭红纸，纸人的脖子「咔」地一声向你弯下来。\n它贴在你耳边，用母亲的声音说：\n「饭凉了。」', () => {
          target.hidden = true;
          AudioSys.sfx('stinger', { vol: 0.75 });
          this.R.spawnParts({ x: target.px, y: target.py - 22, n: 22, col: '#d8cfb8', sp: 120, life: 0.9, rect: true, up: 60 });
          this.R.flash('rgba(140,20,30,0.25)', 0.15);
          this.addSan(-11);
          this.setObjective('搜索厨房灶台，找到母亲房间钥匙');
        });
        break;
      }
      case 'stove_key': {
        if (this.flag('key_mother')) { this.ui.textbox('灶膛冷了。锅里的饭，你没忍心倒掉。'); break; }
        this.ui.textbox('锅里温着饭。灶膛里没火，可锅是温的。\n你探手进灶膛——指尖碰到一个铁盒。\n盒里是一把黄铜钥匙，和一张字条：「饭做好了。钥匙在老地方。——娘」', () => {
          this.setFlag('key_mother');
          this.ui.toast('🔑 获得：母亲房间的钥匙');
          AudioSys.sfx('unlock');
          this.setObjective('打开母亲的房间（东厢北屋）');
        });
        break;
      }
      case 'mother_box': {
        if (this.flag(F)) { this.ui.textbox('木匣空了。绒布上还留着磁带的压痕。'); break; }
        this.setFlag(F);
        this.ui.textbox('床头的木匣没有上锁。\n里面铺着红绒布，端端正正放着一盘磁带。\n标签上是母亲的字：「给归川」。', () => {
          this.giveClue('clue_heights');
          this.giveTape('tape_mother');
          this.setObjective('用生锈的钥匙打开柴房的地窖（西南角）');
        });
        break;
      }
      case 'father_recorder': {
        if (this.artifacts.art_tape_deck) { this.ui.textbox('父亲的录音机。修复它的零件还摊在桌上，像一句没说完的话。'); break; }
        this.ui.textbox('工作台上摊着一台拆开的录音机，皮带断了。\n旁边压着一张纸，写满了被划掉的句子：\n「归川，爸……」「对不……」「等你长大就……」\n每一句都没写完。', () => {
          this.giveArtifact('art_tape_deck');
        });
        break;
      }
      case 'cellar_shelf': {
        if (this.flag('got_shovel')) { this.ui.textbox('工具架上空出了两个位置——铲子和灯。都跟着你了。'); break; }
        this.setFlag('got_shovel');
        this.ui.textbox('工具架擦得很干净。\n一把工兵铲挂在正中，木柄上刻着一个「守」字。\n旁边是一盏油灯，灯芯剪得整整齐齐，像随时等人来取。', () => {
          const sh = makeWeapon(rng, 'shovel', { rarity: 'common' });
          this.equip.weapon ? this.addItemObj(sh) : (this.equip.weapon = sh);
          const lp = makeLamp('lamp_oil');
          this.equip.lamp ? this.addItemObj(lp) : (this.equip.lamp = lp);
          this.pstats.oil = 80;
          this.player.lampOn = true;
          this.recompute();
          this.ui.toast('⛏ 装备：工兵铲 ｜ 🏮 装备：老油灯');
          AudioSys.sfx('pickup');
          this.tutorial('tut.lamp');
        });
        break;
      }
      case 'cellar_coffin': {
        if (this.flag(F)) { this.ui.textbox('空棺。你把盖子推回去了。'); break; }
        this.setFlag(F);
        this.ui.textbox('地窖深处停着一口薄皮棺材。\n你撬开一条缝——里面是空的。\n棺底用指甲刻着一个字：「替」。', () => {
          this.addSan(-6);
          this.addYin(2);
          this.giveArtifact('art_bronze_mirror');
          this.ui.sub('（棺底压着一面残破的铜镜。你把它收了起来。）', 3);
        });
        break;
      }
      case 'cellar_tapebox': {
        if (this.flag(F)) { this.ui.textbox('铁盒空了。'); break; }
        this.setFlag(F);
        this.ui.textbox('墙根的铁盒里码着一排磁带，全都发了霉，只有一盘是干燥的——\n像是不久前才有人来换过防潮纸。\n标签上写着：「腊月十四」。', () => {
          this.giveTape('tape_father2');
          this.setFlag('ch1_unlocked');
          this.setObjective('回堂屋查看线索墙，前往哭嫁村');
        });
        break;
      }
      case 'artisan_namewall': {
        if (this.flag('artisan_names_restored')) {
          this.ui.textbox('匠名墙上，两枚名牌已经归位：陈守义、陆鹤年。\n墙缝里渗出的水不再像血。');
          break;
        }
        const dlg = {
          start: 'pick',
          nodes: {
            pick: {
              sp: '匠名墙',
              text: '地窖墙上嵌着一排匠名牌，只有两枚被人凿掉了姓氏。\n墙边有两块缺角的木牌：一块剩「守义」，一块剩「鹤年」。\n要把它们按什么顺序放回去？',
              opts: [
                { t: '陈守义在左，陆鹤年在右', choice: 'right' },
                { t: '陆守义在左，陈鹤年在右', choice: 'wrong' },
                { t: '先不动', next: null },
              ],
            },
          },
        };
        this.ui.dialog(dlg, {
          onChoice: (choice) => {
            if (choice === 'right') {
              this.setFlag('artisan_names_restored');
              this.giveClue('clue_artisan_names');
              this.questNote('地窖匠名墙复原：陈守义不是盗墓贼，而是被写进封门工程的匠人。', '真相');
              this.setObjective('搜索地窖深处的铁盒，寻找父亲留下的第二盘磁带');
              AudioSys.sfx('unlock');
              this.ui.sub('（墙后传来木楔松开的声音。）', 3);
            } else {
              this.addSan(-4);
              AudioSys.sfx('door_locked');
              this.ui.sub('（名字放错了。墙里的水声变成了磨牙声。）', 3);
            }
          },
        });
        break;
      }
      case 'laozhai_gate': {
        this.ui.textbox(this.flag('ch1_unlocked')
          ? '院门外的夜雨连成了线。要出发，去堂屋的线索墙选路。'
          : '院门外是漆黑的山路。\n你不知道娘去了哪座墓——先把老宅搜一遍，她一定留了话。');
        break;
      }
      case 'paperman_house': {
        AudioSys.sfx('paper');
        if (Math.random() < 0.3 && !this.map.def.safe) {
          this.ui.textbox('一个陪嫁的纸人。你凑近看它的脸——\n它没有脸。可它的头，正缓缓向你转过来。', () => {
            const e = new Enemy('paperwalker', target.px + 10, target.py + 20, this);
            e.aware = true;
            this.map.entities.push(e);
            target.hidden = true;
            AudioSys.sfx('stinger', { vol: 0.7 });
          });
        } else {
          this.ui.textbox('一个陪嫁的纸人，红衣金冠。\n它的手心朝上，像在讨什么东西。\n你没有给。');
          this.addSan(-3);
        }
        break;
      }
      case 'kj_coffin': {
        if (this.flag(F)) { this.ui.textbox('（棺盖合得严严实实。）'); break; }
        this.setFlag(F);
        this.ui.textbox('塌屋里停着一口没下葬的棺。\n棺前的长明灯早就干了。你把棺盖挪开一条缝——\n里面整整齐齐码着一套陪葬，没有人。', () => {
          this.money += 22; AudioSys.sfx('coin');
          this.ui.toast('🪙 +22');
          this.addYin(3);
          this.ui.sub('（拿了死人的东西，记得烧香还礼。）', 3);
        });
        break;
      }
      case 'kj_well': {
        this.ui.textbox('井沿结着青苔。往下看，水面映出你的脸——\n你的脸旁边，还有半张别人的脸。\n你没有再看第二眼。', () => { this.addSan(-5); AudioSys.sfx('sob', { vol: 0.6 }); });
        break;
      }
      case 'xl_loom': {
        if (this.flag('has_handkerchief')) { this.ui.textbox('绣架空了。线头还留着，像一句话断在半截。'); break; }
        this.setFlag('has_handkerchief');
        this.ui.textbox('绣架上绷着一方没绣完的帕子：一只鸾鸟，少一只眼睛。\n你把它取下来时，整座绣楼的木头同时「吱呀」了一声——\n像很多人同时倚上了栏杆。', () => {
          this.giveClue('clue_handkerchief');
          AudioSys.sfx('stinger', { vol: 0.6 });
          for (let i = 0; i < 3; i++) {
            const e = new Enemy('weepchild', target.px + (Math.random() - 0.5) * 160, target.py + 60 + Math.random() * 60, this);
            e.aware = true;
            this.map.entities.push(e);
          }
          this.ui.sub('（哭声从四面围了上来。）', 3);
        });
        break;
      }
      case 'xl_hunshu': {
        if (this.flag('has_hunshu')) { this.ui.textbox('（婚书你已经收好了。）'); break; }
        this.setFlag('has_hunshu');
        this.ui.textbox('妆台上压着半页婚书，烧去了一半。\n「一拜天地，二拜高堂，夫妻对拜」——仪程还认得清。\n新娘名讳处，被朱砂涂得死黑。', () => {
          this.giveClue('clue_hunshu');
          this.setObjective('婚书到手了。去主路北端的婚堂大门');
        });
        break;
      }
      case 'xl_bridebed': {
        this.ui.textbox('婚床的帐子放着。床上摆着一套叠好的嫁衣，三十年没人动过。\n枕头是双人的，只有一边有睡痕。', () => this.addSan(-4));
        break;
      }
      case 'xl_mirror': {
        if (this.flag(F)) { this.ui.textbox('铜镜照旧蒙着红布。你没有再掀。'); break; }
        this.setFlag(F);
        this.ui.textbox('梳妆的铜镜上盖着红布。\n你掀开一角——镜子里的婚房是亮着的，红烛高烧，人影攒动。\n你放下红布。身后的婚房，又黑又空。', () => { this.addSan(-8); AudioSys.sfx('suona', { vol: 0.4 }); });
        break;
      }
      case 'tablet': {
        const texts = {
          1: '「沈公讳延年之位」。漆色沉旧，香灰积得厚。',
          2: '「沈母李氏之位」。牌位前供着一对小鞋。',
          4: '「沈公讳秉文之位」。边角磕损，是常被挪动的痕迹。',
          5: '「沈门历代宗亲之位」。最大的一块，最旧。',
        };
        if (def.n === 3) {
          if (this.flag('clue_genealogy')) { this.ui.textbox('「沈门月娘之位」。刮痕在烛光下像一道没愈合的疤。'); break; }
          this.ui.textbox('「沈门月娘之位」。\n漆色比别的牌位新。你侧过头借着烛光看——\n漆面下有刮掉重刻的痕迹。原来的字依稀是：\n「沈氏阿鸾」。', () => {
            this.giveClue('clue_genealogy');
            this.setFlag('ct_tablets_done');
            this.setObjective('把发现告诉祠堂里的沈秋棠');
            AudioSys.sfx('whisper');
          });
        } else {
          this.ui.textbox(texts[def.n] || '一块普通的牌位。');
        }
        break;
      }
      case 'ct_altar': {
        this.ui.textbox('供桌上的香炉积灰半寸，唯独正中三个香脚是新的。\n这祠堂三十年没人祭祖，却一直有人上香。');
        break;
      }
      case 'ct_chest': {
        if (this.flag('ct_chest_done')) { this.ui.textbox('（樟木箱空了，箱底的符纸你留在了原处。）'); break; }
        this.setFlag('ct_chest_done');
        AudioSys.sfx('unlock');
        this.ui.textbox('供桌下压着一口樟木箱，贴着褪色的封条：「陈」。\n——是陈家的东西，封在沈家祠堂。\n箱里垫着朱砂符纸，躺着一柄桃木剑。', () => {
          const pj = makeWeapon(rng, 'peach', { rarity: 'fine' });
          this.map.pickups.push(makePickup(target.px, target.py + 26, { item: pj, glow: '#7fae8e88' }));
          this.addItem('use', 'xiangzhu', 2);
          this.ui.toast('获得 香烛 ×2');
          this.tutorial('tut.ghost');
        });
        break;
      }
      case 'tomb_coffin': {
        if (this.flag(F)) { this.ui.textbox('（这口棺你撬过了。）'); break; }
        this.setFlag(F);
        if (def.n === 2) {
          this.ui.textbox('这口棺比别的新。你撬开棺盖——\n棺里没有人，只有一件叠好的红衣。\n红衣下面，压着一面冰凉的东西——', () => {
            const e = new Enemy('redshade', target.px, target.py + 50, this);
            e.aware = true;
            this.map.entities.push(e);
            AudioSys.sfx('stinger');
            this.giveArtifact('art_genealogy');
            this.ui.sub('（红衣立了起来。）', 2.5);
          });
        } else {
          this.ui.textbox('合葬的薄棺。你恭敬地撬开一条缝。\n陪葬不多：几枚铜钱，一把木梳，一包没开封的胭脂。\n都是给「出嫁」准备的。', () => {
            this.money += 12 + Math.floor(Math.random() * 10);
            AudioSys.sfx('coin');
            this.addYin(2);
            this.ui.updateHUD();
          });
        }
        break;
      }
      case 'huntang_gate': {
        if (this.flag('huntang_open')) { this.ui.textbox('（婚堂的门开着。唢呐声停了——里面在等你。）'); break; }
        if (this.flag('has_hunshu')) {
          AudioSys.sfx('unlock');
          this.ui.textbox('你把婚书残页贴在门缝上。\n纸页无风自燃，烧出一个完整的「囍」字。\n门闩在里面自己滑开了。\n——它认了你这个「宾客」。', () => {
            this.setFlag('huntang_open');
            AudioSys.sfx('door');
            this.setObjective('进入婚堂（也可先从祠堂后门下合葬墓，绕到婚堂背后）');
          });
        } else {
          this.ui.dialog(DIALOGS.dlg_gate_locked, {});
          this.setObjective('找到婚书（绣楼）——或先去祠堂打听');
        }
        break;
      }
      default: break;
    }
  }
}
