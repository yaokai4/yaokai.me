// ============================================================
// data_world.js — 敌人定义 / 地图定义
// 地图用「矩形雕刻」构建：先填充，再开房间、走廊、门洞
// 字符: ' '虚空 '#'墙 '.'主地面 ','次地面 '='道路 '~'水 '-'木地板 ':'红毯 '_'墓砖
// ============================================================
import { CAMPAIGN_MAPS, EXTRA_ENEMIES, CAMPAIGN_ART } from './data_campaign.js';
import { WEAPONS, GEAR_BASES, CHARMS, LAMPS, CONSUMABLES, ARTIFACTS } from './data_items.js';

export const TILESET = {
  ' ': { tile: null, solid: true },
  '#': { tile: 'wall', solid: true },
  '.': { tile: 'floor', solid: false },
  ',': { tile: 'alt', solid: false },
  '=': { tile: 'road', solid: false, road: true },
  '~': { tile: 'water', solid: true },
  ';': { tile: 'waterwalk', solid: false },
  '-': { tile: 'wood', solid: false },
  ':': { tile: 'carpet', solid: false },
  '_': { tile: 'tombf', solid: false },
};

// ------------------------------------------------------------
// 敌人
// cls: paper 纸扎 / ghost 灵体 / flesh 血肉
// ------------------------------------------------------------
export const ENEMY_DEFS = {
  paperwalker: {
    name: '纸行者', art: 'en_paperwalker', cls: 'paper',
    hp: 32, dmg: 9, speed: 88, size: 13, sense: 240,
    behavior: 'facefear', // 被注视时减速，背对时加速
    atkRange: 30, atkCd: 1.1, tier: 1,
    lore: '烧给死人的仆役。你看它时它是纸，你不看它时——别不看它。',
  },
  bearer: {
    name: '纸轿夫', art: 'en_bearer', cls: 'paper',
    hp: 76, dmg: 15, speed: 52, size: 17, sense: 260,
    behavior: 'lunge', lungeSpeed: 300, lungeCd: 2.6,
    atkRange: 38, atkCd: 1.6, tier: 1, knockResist: 0.6,
    lore: '抬轿的纸人，肩上压着看不见的分量。它们始终保持着抬轿的姿势，哪怕轿子早就没了。',
  },
  weepchild: {
    name: '哭嫁童', art: 'en_weepchild', cls: 'paper',
    hp: 24, dmg: 7, speed: 148, size: 11, sense: 300,
    behavior: 'circle', atkRange: 26, atkCd: 0.9, tier: 1,
    lore: '撒纸钱开路的童子。哭声是从纸壳里传出来的，可纸壳里应该是空的。',
  },
  redshade: {
    name: '红衣影', art: 'en_redshade', cls: 'ghost',
    hp: 78, dmg: 17, speed: 66, size: 15, sense: 340,
    behavior: 'phase', // 隐现漂移
    atkRange: 34, atkCd: 1.5, tier: 2,
    lore: '一截没有脸的红衣裳。铁器穿过它就像穿过一口冷气。桃木与铜钱是它的旧仇。',
  },
  ...EXTRA_ENEMIES,
};

export const NPC_DEFS = {
  linshu: { name: '林二叔', art: 'npc_lin', dialog: 'dlg_linshu' },
  shen: { name: '沈秋棠', art: 'npc_shen', dialog: 'dlg_shen' },
};

// ------------------------------------------------------------
// 地图构建器
// ------------------------------------------------------------
function blank(w, h, ch = ' ') {
  return { w, h, g: Array.from({ length: h }, () => Array(w).fill(ch)) };
}
function F(m, x, y, w, h, ch) { // 填充
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    if (i >= 0 && j >= 0 && i < m.w && j < m.h) m.g[j][i] = ch;
  }
}
function R(m, x, y, w, h, wall = '#', floor = '.') { // 房间：外墙+内地板
  F(m, x, y, w, h, wall);
  F(m, x + 1, y + 1, w - 2, h - 2, floor);
}
function rows(m) { return m.g.map(r => r.join('')); }

// ------------------------------------------------------------
// 序章 · 末班车（34 x 18）
// ------------------------------------------------------------
function buildBus() {
  const m = blank(34, 18);
  F(m, 0, 0, 34, 18, '#');
  R(m, 2, 3, 30, 12, '#', '-');
  F(m, 29, 11, 3, 3, '-');                   // 前门
  F(m, 4, 5, 24, 8, '-');                    // 过道
  F(m, 30, 13, 2, 1, '-');                   // 出口
  return {
    name: '序章 · 槐阴末班车',
    grid: rows(m),
    tiles: { floor: 'wood_old', alt: 'wood_old', road: 'path', wall: 'wall_wood', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.36, dark: 0.68, rain: 1,
    ambient: ['rain'], music: 'none',
    spawns: { default: [6, 10], aisle: [6, 10] },
    enemies: [],
    props: [
      { art: 'pr_bus_window', x: 5, y: 4.2, id: 'bus_window1', solid: 0, s: 1.05 },
      { art: 'pr_bus_window', x: 12, y: 4.2, id: 'bus_window2', solid: 0, s: 1.05 },
      { art: 'pr_bus_window', x: 20, y: 4.2, id: 'bus_window3', solid: 0, s: 1.05 },
      { art: 'pr_bus_seat', x: 7, y: 7.2, id: 'bus_rear_seat', solid: 1, s: 1.1 },
      { art: 'pr_bus_seat', x: 14, y: 7.2, solid: 1, s: 1.1 },
      { art: 'pr_bus_seat', x: 21, y: 7.2, solid: 1, s: 1.1 },
      { art: 'pr_bus_seat', x: 9, y: 12.2, solid: 1, s: 1.1 },
      { art: 'pr_bus_seat', x: 17, y: 12.2, id: 'bus_passengers', solid: 1, s: 1.1 },
      { art: 'pr_box', x: 4.7, y: 11.2, id: 'bus_box', solid: 1, s: 0.78 },
      { art: 'pr_bus_door', x: 30.6, y: 12.9, id: 'bus_front_door', solid: 0, s: 1.2, light: [110, 'rgba(180,210,240,0.24)'] },
    ],
    exits: [{ x: 30, y: 13, w: 2, h: 1, to: 'station', spawn: 'bus', needFlag: 'itx_bus_bus_box', lockedText: '木盒还在座位下。你知道自己不能空着手下车。' }],
    triggers: [
      { id: 'ev_bus_start', x: 4, y: 8, w: 8, h: 5, once: 1 },
      { id: 'ev_bus_passenger_shift', x: 13, y: 6, w: 9, h: 8, once: 1 },
    ],
  };
}

// ------------------------------------------------------------
// 序章 · 废弃车站（38 x 24）
// ------------------------------------------------------------
function buildStation() {
  const m = blank(38, 24);
  F(m, 0, 0, 38, 24, '#');
  R(m, 4, 4, 30, 13, '#', '.');               // 候车室
  F(m, 18, 16, 5, 1, '.');                    // 南门
  F(m, 12, 17, 16, 5, '=');                   // 站前湿路
  F(m, 18, 22, 4, 1, '=');                    // 去山路
  F(m, 1, 10, 3, 4, '=');                     // 巴士落客处
  return {
    name: '序章 · 废弃车站',
    grid: rows(m),
    tiles: { floor: 'dirt', alt: 'grass', road: 'path', wall: 'wall_brick', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.38, dark: 0.72, rain: 1,
    ambient: ['rain', 'wind'], music: 'none',
    spawns: { default: [6, 12], bus: [5, 12] },
    enemies: [],
    props: [
      { art: 'pr_station_sign', x: 19, y: 4.2, id: 'station_sign', solid: 0, s: 1.4 },
      { art: 'pr_ticket_booth', x: 10, y: 7.2, id: 'station_ticket', solid: 1, s: 1.2 },
      { art: 'pr_clock', x: 22, y: 6.2, id: 'station_clock', solid: 0, s: 0.9 },
      { art: 'pr_phone', x: 28.5, y: 9.4, id: 'station_phone', solid: 1, s: 0.9 },
      { art: 'pr_wet_seat', x: 16, y: 12, id: 'station_bench', solid: 1, s: 1.15 },
      { art: 'pr_lantern', x: 20.5, y: 16.6, light: [120, 'rgba(224,140,80,0.42)'], solid: 0 },
      { art: 'pr_tablet', x: 26, y: 18.3, id: 'station_road_marker', solid: 1, s: 0.85 },
    ],
    exits: [
      { x: 18, y: 22, w: 4, h: 1, to: 'shanlu', spawn: 'south' },
      { x: 1, y: 11, w: 1, h: 2, to: 'bus', spawn: 'aisle' },
    ],
    triggers: [
      { id: 'ev_station_enter', x: 5, y: 10, w: 9, h: 6, once: 1 },
      { id: 'ev_station_exit_hint', x: 16, y: 17, w: 8, h: 5, once: 1 },
    ],
  };
}

// ------------------------------------------------------------
// 序章 · 雨夜山路（26 x 42）
// ------------------------------------------------------------
function buildShanlu() {
  const m = blank(26, 42);
  F(m, 0, 0, 26, 42, '#');          // 密林
  F(m, 10, 36, 6, 6, ','); F(m, 11, 30, 5, 7, ','); // 南端草地起点
  F(m, 11, 4, 4, 36, '=');          // 主路北上
  F(m, 7, 22, 6, 4, ',');           // 西侧小空地（纸人）
  F(m, 15, 12, 6, 4, ',');          // 东侧小空地（旧路碑）
  F(m, 11, 2, 4, 2, '=');           // 北出口
  return {
    name: '归魂山 · 雨夜山路',
    grid: rows(m),
    tiles: { floor: 'dirt', alt: 'grass', road: 'path', wall: 'grass', wood: 'wood', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.55, dark: 0.6, rain: 1,
    ambient: ['rain', 'wind'], music: 'none',
    spawns: { default: [13, 39], south: [13, 39], station: [13, 39] },
    enemies: [],
    props: [
      { art: 'pr_tree', x: 8, y: 8, s: 2.2, solid: 0 },
      { art: 'pr_tree', x: 18, y: 18, s: 1.8, solid: 0 },
      { art: 'pr_tree', x: 6, y: 30, s: 2.0, solid: 0 },
      { art: 'pr_tree', x: 19, y: 33, s: 1.6, solid: 0 },
      { art: 'pr_paperman', x: 9, y: 23, id: 'shanlu_paperman', solid: 1 },
      { art: 'pr_tablet', x: 17, y: 13, id: 'shanlu_stele', solid: 1 },
      { art: 'pr_lantern', x: 12, y: 5, light: [120, 'rgba(224,120,80,0.5)'], solid: 0 },
      { art: 'pr_lantern', x: 15, y: 5, light: [120, 'rgba(224,120,80,0.5)'], solid: 0 },
    ],
    exits: [{ x: 11, y: 2, w: 4, h: 1, to: 'laozhai', spawn: 'gate' }],
    triggers: [
      { id: 'ev_shanlu_start', x: 9, y: 35, w: 8, h: 4, once: 1 },
      { id: 'ev_shanlu_paperman', x: 7, y: 20, w: 8, h: 7, once: 1 },
      { id: 'ev_shanlu_gate', x: 10, y: 6, w: 6, h: 4, once: 1 },
    ],
  };
}

// ------------------------------------------------------------
// 陈家老宅（44 x 30）—— 营地
// ------------------------------------------------------------
function buildLaozhai() {
  const m = blank(44, 30);
  R(m, 1, 1, 42, 28, '#', '.');               // 院墙与院子（泥地）
  R(m, 12, 2, 20, 9, '#', '-');               // 堂屋
  F(m, 20, 10, 4, 1, '-');                    // 堂屋门洞
  R(m, 2, 2, 10, 9, '#', '-');                // 厨房
  F(m, 11, 6, 1, 2, '-');                     // 厨房门洞
  R(m, 32, 2, 10, 9, '#', '-');               // 母亲房间
  F(m, 32, 6, 1, 2, '-');                     // 母亲房门洞（上锁 prop）
  R(m, 32, 17, 10, 9, '#', '-');              // 父亲工作间
  F(m, 32, 20, 1, 2, '-');                    // 工作间门洞
  R(m, 2, 19, 8, 8, '#', '-');                // 柴房（地窖口）
  F(m, 9, 22, 1, 2, '-');                     // 柴房门洞
  F(m, 20, 28, 4, 1, '.');                    // 南大门
  F(m, 14, 14, 3, 3, ',');                    // 院中草
  F(m, 24, 18, 4, 3, ',');
  return {
    name: '槐阴县 · 陈家老宅',
    grid: rows(m),
    tiles: { floor: 'dirt', alt: 'grass', road: 'path', wall: 'wall_wood', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.32, dark: 0.62, rain: 1,
    ambient: ['rain'], music: 'house', safe: 1,
    spawns: { default: [22, 14], gate: [22, 26], cellar: [6, 22], board: [18, 6] },
    enemies: [],
    props: [
      // 堂屋
      { art: 'pr_lamp_eternal', x: 14, y: 4, id: 'savepoint', light: [150, 'rgba(230,170,90,0.55)'], solid: 1 },
      { art: 'pr_table', x: 21.5, y: 6, id: 'laozhai_table', solid: 1, s: 1.4 },
      { art: 'pr_bowls', x: 22, y: 5.6, id: 'laozhai_bowls', solid: 0, s: 0.9 },
      { art: 'pr_clueboard', x: 18, y: 3.2, id: 'clueboard', solid: 0 },
      { art: 'pr_mirror', x: 28, y: 3.2, id: 'laozhai_mirror', solid: 0 },
      { art: 'pr_recorder', x: 25, y: 3.4, id: 'laozhai_recorder', solid: 0, s: 0.8 },
      { art: 'pr_paperman', x: 30, y: 8.2, id: 'laozhai_paperman', solid: 1, s: 1.0, showFlag: 'home_paperman_revealed' },
      // 厨房
      { art: 'pr_stove', x: 4.5, y: 4, id: 'laozhai_stove', solid: 1 },
      { art: 'pr_jar', x: 8, y: 4, id: 'laozhai_jar', solid: 1, s: 0.9 },
      // 母亲房间
      { art: 'pr_door', x: 32, y: 6.6, id: 'mother_door', solid: 1, doorFlag: 'mother_unlocked' },
      { art: 'pr_bed', x: 36, y: 4, id: 'mother_bed', solid: 1, s: 1.3 },
      { art: 'pr_box', x: 39.5, y: 4.2, id: 'mother_box', solid: 1, s: 0.9 },
      // 父亲工作间
      { art: 'pr_table', x: 36, y: 19.5, id: 'bench', solid: 1, s: 1.2, bench: 1 },
      { art: 'pr_recorder', x: 39.5, y: 19.6, id: 'father_recorder', solid: 1, s: 0.9 },
      { art: 'pr_jar', x: 34, y: 24, id: 'father_jar', solid: 1, s: 0.8 },
      // 柴房 / 地窖
      { art: 'pr_cellardoor', x: 5, y: 23.5, id: 'cellar_hatch', solid: 0 },
      // 院子
      { art: 'pr_well', x: 15, y: 15, id: 'laozhai_well', solid: 1 },
      { art: 'pr_tree', x: 26, y: 17.5, s: 2.0, solid: 1 },
      { art: 'pr_gate', x: 21.9, y: 27.4, id: 'laozhai_gate', solid: 0, s: 1.5 },
      { art: 'pr_lantern', x: 19, y: 10.5, light: [130, 'rgba(224,140,80,0.5)'], solid: 0 },
      { art: 'pr_lantern', x: 25, y: 10.5, light: [130, 'rgba(224,140,80,0.5)'], solid: 0 },
    ],
    exits: [],
    triggers: [
      { id: 'ev_laozhai_enter', x: 18, y: 22, w: 8, h: 5, once: 1 },
      { id: 'ev_laozhai_hall', x: 19, y: 7, w: 6, h: 4, once: 1 },
    ],
  };
}

// ------------------------------------------------------------
// 老宅地窖（24 x 18）
// ------------------------------------------------------------
function buildDijiao() {
  const m = blank(24, 18);
  R(m, 1, 1, 14, 9, '#', '_');
  R(m, 9, 8, 14, 9, '#', '_');
  F(m, 10, 9, 4, 1, '_'); // 连通
  return {
    name: '陈家老宅 · 地窖',
    grid: rows(m),
    tiles: { floor: 'tomb', alt: 'tomb', road: 'tomb', wall: 'wall_tomb', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.3, dark: 0.88,
    ambient: ['drone', 'drip'], music: 'tomb',
    spawns: { default: [3, 3] },
    enemies: [
      { type: 'paperwalker', x: 18, y: 12, group: 'cellar_fight' },
      { type: 'paperwalker', x: 20, y: 14, group: 'cellar_fight' },
    ],
    props: [
      { art: 'pr_shelf', x: 6, y: 3.2, id: 'cellar_shelf', solid: 1 },
      { art: 'pr_jar', x: 11, y: 3.5, id: 'cellar_jar1', solid: 1, s: 0.9 },
      { art: 'pr_jar', x: 12.5, y: 3.7, id: 'cellar_jar2', solid: 1, s: 0.8 },
      { art: 'pr_coffin', x: 17, y: 10.6, id: 'cellar_coffin', solid: 1 },
      { art: 'pr_box', x: 20.5, y: 14.5, id: 'cellar_tapebox', solid: 1, s: 0.9 },
      { art: 'pr_namewall', x: 13.5, y: 8.2, id: 'artisan_namewall', solid: 1, s: 1.1 },
      { art: 'pr_nameplate', x: 16.2, y: 9.2, id: 'artisan_plate_chen', solid: 0, s: 0.7 },
      { art: 'pr_nameplate', x: 18.0, y: 9.2, id: 'artisan_plate_lu', solid: 0, s: 0.7 },
      { art: 'pr_stonebeast', x: 21.2, y: 11.2, id: 'cellar_stonebeast', solid: 1, s: 0.9 },
      { art: 'pr_candlestand', x: 3, y: 7.5, light: [110, 'rgba(224,150,80,0.5)'], solid: 1 },
    ],
    exits: [{ x: 2, y: 1, w: 2, h: 1, to: 'laozhai', spawn: 'cellar' }],
    triggers: [
      { id: 'ev_cellar_enter', x: 2, y: 2, w: 5, h: 4, once: 1 },
      { id: 'ev_cellar_fight', x: 10, y: 9, w: 6, h: 5, once: 1 },
    ],
  };
}

// ------------------------------------------------------------
// 第一章 · 哭嫁村（54 x 46）
// ------------------------------------------------------------
function buildKujiacun() {
  const m = blank(54, 46);
  F(m, 1, 1, 52, 44, ',');                    // 村域草地
  F(m, 0, 0, 54, 1, '#'); F(m, 0, 45, 54, 1, '#');
  F(m, 0, 0, 1, 46, '#'); F(m, 53, 0, 1, 46, '#');
  F(m, 25, 2, 4, 42, '=');                    // 主路（贯穿南北）
  F(m, 8, 20, 17, 3, '=');                    // 西横路
  F(m, 29, 30, 16, 3, '=');                   // 东横路（往绣楼）
  // 西侧民居 A（可进）
  R(m, 6, 8, 12, 9, '#', '-'); F(m, 11, 16, 2, 1, '-');
  // 西侧民居 B（可进）
  R(m, 4, 26, 11, 8, '#', '-'); F(m, 14, 29, 1, 2, '-');
  // 东侧民居 C（塌了一半，开放）
  F(m, 33, 8, 10, 7, '-'); F(m, 33, 8, 10, 1, '#'); F(m, 33, 8, 1, 7, '#'); F(m, 42, 8, 1, 4, '#');
  // 绣楼外墙（东南，入口在西侧）
  R(m, 44, 27, 9, 9, '#', '-'); F(m, 44, 30, 1, 2, '-');
  // 祠堂前坪（北端西侧）
  F(m, 12, 3, 10, 6, '.');
  // 婚堂大门（北端，主路尽头）
  F(m, 24, 1, 6, 2, '.');
  // 水塘
  F(m, 36, 18, 8, 5, '~');
  return {
    name: '第一章 · 哭嫁村',
    grid: rows(m),
    tiles: { floor: 'path', alt: 'grass', road: 'path', wall: 'wall_brick', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.35, dark: 0.74,
    ambient: ['wind', 'crickets'], music: 'village',
    spawns: { default: [27, 42], south: [27, 42], fromXiulou: [42, 31], fromCitang: [17, 6], fromHuntang: [27, 4] },
    enemies: [
      { type: 'paperwalker', x: 22, y: 14 },
      { type: 'paperwalker', x: 31, y: 24 },
      { type: 'paperwalker', x: 12, y: 36 },
      { type: 'paperwalker', x: 40, y: 36 },
      { type: 'bearer', x: 27, y: 18 },
      { type: 'bearer', x: 16, y: 21.5 },
      { type: 'weepchild', x: 35, y: 31.5 },
    ],
    props: [
      // 村口
      { art: 'pr_archway', x: 27, y: 41, s: 2.2, solid: 0, id: 'kj_archway' },
      { art: 'pr_stall', x: 31.5, y: 39.5, id: 'kj_stall', solid: 1 },
      { art: 'pr_lamp_eternal', x: 23.5, y: 39.5, id: 'savepoint', light: [150, 'rgba(230,170,90,0.55)'], solid: 1 },
      { art: 'pr_lantern', x: 25, y: 40.5, light: [140, 'rgba(200,60,40,0.45)'], solid: 0 },
      { art: 'pr_lantern', x: 29, y: 40.5, light: [140, 'rgba(200,60,40,0.45)'], solid: 0 },
      // 民居 A
      { art: 'pr_table', x: 10, y: 11, id: 'kj_houseA_table', solid: 1 },
      { art: 'pr_paperman', x: 15, y: 12, id: 'kj_houseA_paperman', solid: 1 },
      { art: 'pr_jar', x: 8, y: 14.5, id: 'kj_houseA_jar', solid: 1, s: 0.9 },
      // 民居 B
      { art: 'pr_bed', x: 7, y: 28.5, id: 'kj_houseB_bed', solid: 1, s: 1.2 },
      { art: 'pr_chest', x: 11.5, y: 31.5, id: 'kj_houseB_chest', solid: 1 },
      // 民居 C（半塌）
      { art: 'pr_coffin', x: 37, y: 11, id: 'kj_houseC_coffin', solid: 1 },
      { art: 'pr_jar', x: 40.5, y: 13, id: 'kj_houseC_jar', solid: 1, s: 0.85 },
      // 散景
      { art: 'pr_tree', x: 20, y: 28, s: 2.4, solid: 1 },
      { art: 'pr_tree', x: 45, y: 12, s: 2.0, solid: 1 },
      { art: 'pr_tree', x: 8, y: 42, s: 1.7, solid: 1 },
      { art: 'pr_well', x: 32, y: 21, id: 'kj_well', solid: 1 },
      { art: 'pr_paperman', x: 24, y: 30, id: 'kj_paperman_road', solid: 1 },
      { art: 'pr_sedan', x: 27, y: 9, id: 'kj_sedan_idle', solid: 1, s: 1.3 },
      // 祠堂入口（北西）
      { art: 'pr_shrine', x: 17, y: 3.6, id: 'kj_citang_gate', solid: 0, s: 1.6 },
      // 婚堂大门（北中，需婚书）
      { art: 'pr_gate', x: 26.9, y: 1.8, id: 'kj_huntang_gate', solid: 1, s: 1.6, doorFlag: 'huntang_open' },
      // 绣楼入口标记
      { art: 'pr_lantern', x: 44.5, y: 29.5, light: [120, 'rgba(200,60,40,0.5)'], solid: 0 },
    ],
    exits: [
      { x: 25, y: 44, w: 4, h: 1, to: 'laozhai', spawn: 'gate' },
      { x: 44, y: 30, w: 1, h: 2, to: 'xiulou', spawn: 'default' },
      { x: 16, y: 3, w: 3, h: 1, to: 'citang', spawn: 'default' },
      { x: 26, y: 1, w: 2, h: 1, to: 'huntang', spawn: 'default', needFlag: 'huntang_open' },
    ],
    triggers: [
      { id: 'ev_kj_enter', x: 24, y: 38, w: 7, h: 5, once: 1 },
      { id: 'ev_kj_sedan', x: 25, y: 24, w: 6, h: 4, once: 1 },   // 红轿事件
      { id: 'ev_kj_sob', x: 25, y: 12, w: 8, h: 5, once: 1 },     // 哭声事件
      { id: 'ev_kj_xiulou_hint', x: 40, y: 29, w: 5, h: 5, once: 1 },
    ],
    rules: ['rule_sedan', 'rule_sob'],
  };
}

// ------------------------------------------------------------
// 绣楼（28 x 26）—— 一层厅 + 阁楼婚房
// ------------------------------------------------------------
function buildXiulou() {
  const m = blank(28, 26);
  R(m, 1, 9, 18, 16, '#', '-');               // 一层大厅
  F(m, 1, 14, 1, 2, '-');                     // 西入口
  R(m, 12, 1, 15, 12, '#', '-');              // 阁楼婚房（东北）
  F(m, 14, 12, 2, 1, '-');                    // 楼梯口连通
  F(m, 13, 13, 4, 4, '-');                    // 楼梯平台
  F(m, 20, 3, 6, 8, ':');                     // 婚房红毯
  return {
    name: '哭嫁村 · 绣楼',
    grid: rows(m),
    tiles: { floor: 'path', alt: 'grass', road: 'path', wall: 'wall_wood', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.3, dark: 0.84,
    ambient: ['wind'], music: 'tomb',
    spawns: { default: [3, 15] },
    enemies: [
      { type: 'bearer', x: 10, y: 18 },
      { type: 'paperwalker', x: 15, y: 21 },
    ],
    props: [
      { art: 'pr_loom', x: 5, y: 12, id: 'xl_loom', solid: 1 },
      { art: 'pr_table', x: 11, y: 14.5, id: 'xl_table', solid: 1 },
      { art: 'pr_jar', x: 4, y: 21.5, id: 'xl_jar', solid: 1, s: 0.9 },
      { art: 'pr_candlestand', x: 8, y: 10.8, light: [110, 'rgba(224,150,80,0.5)'], solid: 1 },
      // 阁楼婚房
      { art: 'pr_bed', x: 23.5, y: 4, id: 'xl_bridebed', solid: 1, s: 1.3 },
      { art: 'pr_mirror', x: 18, y: 2.6, id: 'xl_mirror', solid: 0 },
      { art: 'pr_chest', x: 14, y: 4, id: 'xl_dowrychest', solid: 1 },
      { art: 'pr_paperman', x: 21, y: 9, id: 'xl_paperman', solid: 1 },
      { art: 'pr_candlestand', x: 25.5, y: 8.5, light: [100, 'rgba(200,60,40,0.55)'], solid: 1 },
    ],
    exits: [{ x: 1, y: 14, w: 1, h: 2, to: 'kujiacun', spawn: 'fromXiulou' }],
    triggers: [
      { id: 'ev_xl_enter', x: 2, y: 13, w: 5, h: 4, once: 1 },
      { id: 'ev_xl_upstairs', x: 13, y: 9, w: 5, h: 4, once: 1 },
    ],
    rules: ['rule_whitelamp'],
    whiteLampZone: { x: 12, y: 1, w: 15, h: 12 },
  };
}

// ------------------------------------------------------------
// 祠堂（30 x 22）
// ------------------------------------------------------------
function buildCitang() {
  const m = blank(30, 22);
  R(m, 3, 2, 24, 18, '#', '-');
  F(m, 13, 20, 4, 1, '-');                    // 南入口
  F(m, 8, 4, 14, 2, ':');                     // 牌位前红毯
  F(m, 26, 9, 1, 3, '-');                     // 东后门 → 合葬墓
  return {
    name: '哭嫁村 · 四姓祠分祠',
    grid: rows(m),
    tiles: { floor: 'path', alt: 'grass', road: 'path', wall: 'wall_wood', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.3, dark: 0.78,
    ambient: ['wind'], music: 'sad',
    spawns: { default: [15, 18], fromTomb: [25, 10] },
    enemies: [],
    props: [
      { art: 'pr_tablet', x: 9, y: 3.4, id: 'ct_tablet1', solid: 1 },
      { art: 'pr_tablet', x: 12, y: 3.4, id: 'ct_tablet2', solid: 1 },
      { art: 'pr_tablet', x: 15, y: 3.4, id: 'ct_tablet3', solid: 1 },
      { art: 'pr_tablet', x: 18, y: 3.4, id: 'ct_tablet4', solid: 1 },
      { art: 'pr_tablet', x: 21, y: 3.4, id: 'ct_tablet5', solid: 1 },
      { art: 'pr_candlestand', x: 7, y: 6, light: [120, 'rgba(224,150,80,0.5)'], solid: 1 },
      { art: 'pr_candlestand', x: 23, y: 6, light: [120, 'rgba(224,150,80,0.5)'], solid: 1 },
      { art: 'pr_table', x: 15, y: 7.5, id: 'ct_altar', solid: 1, s: 1.3 },
      { art: 'pr_chest', x: 5.5, y: 16.5, id: 'ct_chest', solid: 1 },
      { art: 'pr_jar', x: 24, y: 17, id: 'ct_jar', solid: 1, s: 0.9 },
      { art: 'pr_door', x: 26, y: 10.4, id: 'ct_backdoor', solid: 1, doorFlag: 'tomb_open' },
    ],
    npcs: [{ type: 'shen', x: 17, y: 9 }],
    exits: [
      { x: 13, y: 20, w: 4, h: 1, to: 'kujiacun', spawn: 'fromCitang' },
      { x: 26, y: 9, w: 1, h: 3, to: 'hezangmu', spawn: 'default', needFlag: 'tomb_open' },
    ],
    triggers: [{ id: 'ev_ct_enter', x: 12, y: 16, w: 7, h: 4, once: 1 }],
  };
}

// ------------------------------------------------------------
// 地下合葬墓（44 x 24）
// ------------------------------------------------------------
function buildHezangmu() {
  const m = blank(44, 24);
  R(m, 1, 9, 12, 7, '#', '_');                // 入口墓道
  R(m, 11, 4, 12, 17, '#', '_');              // 中室
  F(m, 12, 11, 2, 3, '_');                    // 连通1
  R(m, 21, 8, 13, 9, '#', '_');               // 耳室（棺）
  F(m, 22, 11, 2, 3, '_');                    // 连通2
  R(m, 32, 2, 11, 20, '#', '_');              // 后室（出口向北）
  F(m, 33, 11, 2, 2, '_');                    // 连通3
  F(m, 36, 2, 3, 1, '_');                     // 北出口洞
  return {
    name: '哭嫁村 · 地下合葬墓',
    grid: rows(m),
    tiles: { floor: 'tomb', alt: 'tomb', road: 'tomb', wall: 'wall_tomb', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.28, dark: 0.92,
    ambient: ['drone', 'drip'], music: 'tomb',
    spawns: { default: [3, 12], fromHuntang: [37, 4] },
    enemies: [
      { type: 'paperwalker', x: 16, y: 8 },
      { type: 'paperwalker', x: 18, y: 17 },
      { type: 'bearer', x: 27, y: 12 },
      { type: 'redshade', x: 15, y: 13, group: 'tomb_shade1' },
      { type: 'redshade', x: 37, y: 12, group: 'tomb_shade2' },
      { type: 'weepchild', x: 30, y: 14 },
    ],
    props: [
      { art: 'pr_coffin', x: 25, y: 10.5, id: 'hz_coffin1', solid: 1 },
      { art: 'pr_coffin', x: 29, y: 13.5, id: 'hz_coffin2', solid: 1 },
      { art: 'pr_coffin', x: 25, y: 14.8, id: 'hz_coffin3', solid: 1 },
      { art: 'pr_coffin', x: 36, y: 17, id: 'hz_coffin4', solid: 1 },
      { art: 'pr_tablet', x: 16, y: 5.2, id: 'hz_mural', solid: 1 },
      { art: 'pr_jar', x: 13, y: 19, id: 'hz_jar1', solid: 1, s: 0.9 },
      { art: 'pr_jar', x: 40, y: 19.5, id: 'hz_jar2', solid: 1, s: 0.85 },
      { art: 'pr_chest', x: 39.5, y: 6, id: 'hz_chest', solid: 1 },
      { art: 'pr_candlestand', x: 34, y: 9.5, light: [90, 'rgba(160,200,160,0.35)'], solid: 1 },
    ],
    exits: [
      { x: 1, y: 11, w: 1, h: 3, to: 'citang', spawn: 'fromTomb' },
      { x: 36, y: 2, w: 3, h: 1, to: 'huntang', spawn: 'fromTomb' },
    ],
    triggers: [
      { id: 'ev_hz_enter', x: 2, y: 10, w: 5, h: 5, once: 1 },
      { id: 'ev_hz_shade', x: 12, y: 10, w: 6, h: 6, once: 1 },
    ],
  };
}

// ------------------------------------------------------------
// 婚堂（32 x 28）—— Boss 战场
// ------------------------------------------------------------
function buildHuntang() {
  const m = blank(32, 28);
  R(m, 3, 2, 26, 24, '#', '-');
  F(m, 14, 26, 4, 1, '-');                    // 南门
  F(m, 14, 4, 4, 18, ':');                    // 中央红毯
  F(m, 6, 6, 4, 3, ':'); F(m, 22, 6, 4, 3, ':'); // 侧席
  return {
    name: '哭嫁村 · 婚堂',
    grid: rows(m),
    tiles: { floor: 'path', alt: 'grass', road: 'path', wall: 'wall_brick', wood: 'wood_old', carpet: 'carpet', water: 'water', tombf: 'tomb' },
    wallShade: 0.3, dark: 0.8,
    ambient: [], music: 'sad',
    spawns: { default: [16, 24], fromTomb: [16, 24] },
    enemies: [],
    props: [
      { art: 'pr_table', x: 16, y: 4.5, id: 'ht_altar', solid: 1, s: 1.5 },
      { art: 'pr_candlestand', x: 11, y: 5, light: [120, 'rgba(200,60,40,0.5)'], solid: 1 },
      { art: 'pr_candlestand', x: 21, y: 5, light: [120, 'rgba(200,60,40,0.5)'], solid: 1 },
      { art: 'pr_candlestand', x: 8, y: 18, light: [110, 'rgba(224,150,80,0.45)'], solid: 1 },
      { art: 'pr_candlestand', x: 24, y: 18, light: [110, 'rgba(224,150,80,0.45)'], solid: 1 },
      { art: 'pr_paperman', x: 7, y: 7.5, id: 'ht_guest1', solid: 1 },
      { art: 'pr_paperman', x: 9, y: 7.8, id: 'ht_guest2', solid: 1 },
      { art: 'pr_paperman', x: 23, y: 7.5, id: 'ht_guest3', solid: 1 },
      { art: 'pr_paperman', x: 25, y: 7.8, id: 'ht_guest4', solid: 1 },
      { art: 'pr_sedan', x: 25, y: 21, id: 'ht_sedan', solid: 1, s: 1.4 },
    ],
    exits: [{ x: 14, y: 26, w: 4, h: 1, to: 'kujiacun', spawn: 'fromHuntang' }],
    triggers: [{ id: 'ev_boss_intro', x: 13, y: 16, w: 6, h: 5, once: 1 }],
    rules: ['rule_whitelamp'],
    whiteLampZone: { x: 3, y: 2, w: 26, h: 24 },
    bossArena: { x: 4, y: 3, w: 24, h: 22 },
  };
}

export const MAPS = {
  bus: buildBus(),
  station: buildStation(),
  shanlu: buildShanlu(),
  laozhai: buildLaozhai(),
  dijiao: buildDijiao(),
  kujiacun: buildKujiacun(),
  xiulou: buildXiulou(),
  citang: buildCitang(),
  hezangmu: buildHezangmu(),
  huntang: buildHuntang(),
  ...CAMPAIGN_MAPS,
};

const ITEM_ART = [...new Set([
  ...Object.values(WEAPONS).map((x) => x.icon),
  ...Object.values(GEAR_BASES).map((x) => x.icon),
  ...Object.values(CHARMS).map((x) => x.icon),
  ...Object.values(LAMPS).map((x) => x.icon),
  ...Object.values(CONSUMABLES).map((x) => x.icon),
  ...Object.values(ARTIFACTS).map((x) => x.icon),
])];

// 预加载美术清单
export const ART_LIST = [
  'pc_front', 'pc_back', 'pc_side',
  'npc_lin', 'npc_shen', 'npc_mother',
  'en_paperwalker', 'en_bearer', 'en_redshade', 'en_weepchild',
  'boss_bride',
  'pr_paperman', 'pr_sedan', 'pr_table', 'pr_mirror', 'pr_recorder', 'pr_box',
  'pr_coffin', 'pr_lantern', 'pr_archway', 'pr_tree', 'pr_tablet', 'pr_chest',
  'pr_well', 'pr_shrine', 'pr_candlestand', 'pr_bed', 'pr_loom', 'pr_stove',
  'pr_jar', 'pr_clueboard', 'pr_lamp_eternal', 'pr_door', 'pr_gate', 'pr_stall',
  'pr_shelf', 'pr_cellardoor', 'pr_bus_window', 'pr_bus_seat', 'pr_bus_door',
  'pr_station_sign', 'pr_ticket_booth', 'pr_clock', 'pr_phone', 'pr_wet_seat',
  'pr_bowls', 'pr_namewall', 'pr_nameplate', 'pr_stonebeast',
  'it_tape', 'it_key', 'it_money', 'it_handkerchief', 'it_book',
  ...ITEM_ART,
  'title_house',
  ...CAMPAIGN_ART,
];
