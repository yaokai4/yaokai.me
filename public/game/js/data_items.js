// ============================================================
// data_items.js — 装备模板 / 稀有度 / 词缀 / 掉落生成 / 消耗品 / 文物
// 伤害类型: slash 斩 / blunt 钝 / pierce 穿 / zhen 镇邪 / yin 阴气 / fire 火
// ============================================================
import { uid, pick, rngi } from './engine.js';

export const RARITIES = {
  broken:  { name: '残破', col: '#8a8578', w: 0, affixes: [0, 0], mult: 0.8 },
  common:  { name: '普通', col: '#c9c2ae', w: 46, affixes: [0, 1], mult: 1.0 },
  fine:    { name: '精制', col: '#7fae8e', w: 30, affixes: [1, 1], mult: 1.1 },
  rare:    { name: '稀有', col: '#6f9fc8', w: 16, affixes: [1, 2], mult: 1.22 },
  mizhuan: { name: '秘传', col: '#b08fc9', w: 6,  affixes: [2, 3], mult: 1.38 },
  guqi:    { name: '古器', col: '#c49a67', w: 2.5, affixes: [2, 3], mult: 1.48 },
  mingqi:  { name: '冥器', col: '#c8746f', w: 2,  affixes: [3, 3], mult: 1.55 },
  taboo:   { name: '禁器', col: '#a34f75', w: 0.7, affixes: [3, 4], mult: 1.72 },
  legend:  { name: '传说', col: '#e0b84f', w: 0.25, affixes: [4, 4], mult: 1.9 },
  unique:  { name: '唯一', col: '#d9a440', w: 0,  affixes: [0, 0], mult: 1.0 },
};

export const EQUIP_SLOTS = [
  ['weapon', '主手'], ['offhand', '副手'], ['head', '头部'], ['mask', '面具'],
  ['coat', '上衣'], ['wrist', '护腕'], ['belt', '腰带'], ['shoes', '鞋'],
  ['necklace', '项链'], ['ring1', '戒指一'], ['ring2', '戒指二'], ['charm', '护符'],
  ['lamp', '灯具'], ['tool', '探墓工具'], ['back', '背部法器'], ['relic', '随身古物'],
];

// ------------------------------------------------------------
// 武器模板
// combo: 每段 {dmg 倍率, arc 弧度, range, t 前摇, rec 收招}
// ------------------------------------------------------------
export const WEAPONS = {
  shovel: {
    name: '工兵铲', icon: 'it_shovel', type: 'weapon',
    dmgType: 'blunt', dmg: 13, speed: 1.0, stamCost: 17, weight: 'mid',
    crit: 0.06, range: 52, arc: 1.9,
    desc: '陈家工坊打的旧铲。铲过土，也挡过命。对纸扎与木器有撕裂之效。',
    story: '铲柄上刻着一个「守」字，刻痕很深，像是怕被磨掉。',
    combo: 3, heavyMult: 2.1, heavyBreak: true,
    vsBonus: { paper: 1.4 },
  },
  knife: {
    name: '解手短刀', icon: 'it_knife', type: 'weapon',
    dmgType: 'slash', dmg: 9, speed: 1.45, stamCost: 12, weight: 'light',
    crit: 0.16, range: 42, arc: 1.5,
    desc: '又快又轻。砍重甲像砍石头，但砍布、纸、绳，干脆利落。',
    story: '刀鞘里塞着半张当票，当的是一只银镯。',
    combo: 3, heavyMult: 1.7, dashBonus: 1.5,
    vsBonus: { paper: 1.2, human: 1.25 },
  },
  peach: {
    name: '桃木剑', icon: 'it_peach', type: 'weapon',
    dmgType: 'zhen', dmg: 8, speed: 1.15, stamCost: 14, weight: 'light',
    crit: 0.08, range: 50, arc: 1.7,
    desc: '雷击桃木所制。打不动活人，却是阴物的克星。',
    story: '剑身上的符是用朱砂混着某人的血画的。写符的人手很稳。',
    combo: 3, heavyMult: 1.9,
    vsBonus: { ghost: 3.2, paper: 1.5, flesh: 0.5 },
  },
  coinsword: {
    name: '铜钱剑', icon: 'it_coinsword', type: 'weapon',
    dmgType: 'zhen', dmg: 12, speed: 1.0, stamCost: 16, weight: 'mid',
    crit: 0.08, range: 56, arc: 1.8,
    desc: '一百零八枚开元通宝以红线编成。挥动时铮然作响，邪祟退避。',
    story: '林二叔说：钱压百邪，不是因为钱贵，是因为钱上过手，沾着人间气。',
    combo: 3, heavyMult: 2.0, waveAttack: true,
    vsBonus: { ghost: 2.6, paper: 1.6, flesh: 0.7 },
  },
  luoyang: {
    name: '洛阳铲', icon: 'it_luoyang', type: 'weapon',
    dmgType: 'pierce', dmg: 18, speed: 0.76, stamCost: 22, weight: 'heavy',
    crit: 0.05, range: 76, arc: 1.1, combo: 3, heavyMult: 2.35,
    desc: '长柄直刺，破甲出色。游戏化探墓工具，不提供现实盗掘方法。',
    story: '铲头沾着不同颜色的旧土，父亲把每一层都标了日期。',
    vsBonus: { flesh: 1.2 },
  },
  miaodao: {
    name: '旧苗刀', icon: 'it_miaodao', type: 'weapon',
    dmgType: 'slash', dmg: 16, speed: 1.18, stamCost: 18, weight: 'mid',
    crit: 0.12, range: 66, arc: 1.75, combo: 4, heavyMult: 2.0,
    desc: '中长距离连击武器，节奏越稳越利。',
    story: '刀背刻着戏班的锣点，不像兵器，倒像一段没有唱完的谱。',
  },
  ruler: {
    name: '镇门铁尺', icon: 'it_ruler', type: 'weapon',
    dmgType: 'blunt', dmg: 14, speed: 0.96, stamCost: 15, weight: 'mid',
    crit: 0.04, range: 48, arc: 1.55, combo: 3, heavyMult: 1.85,
    desc: '守势稳，受击硬直低，适合反打机关守卫与活人。',
    story: '尺上没有刻度，只有一道道门宽。',
  },
  nail: {
    name: '镇墓钉', icon: 'it_nail', type: 'weapon',
    dmgType: 'pierce', dmg: 24, speed: 0.68, stamCost: 25, weight: 'heavy',
    crit: 0.08, range: 38, arc: 1.0, combo: 2, heavyMult: 2.6,
    desc: '近距离爆发极高，重击对大型尸类造成更长硬直。',
    story: '钉身写着“镇”字，背面却刻着一个人的小名。',
    vsBonus: { flesh: 1.35 },
  },
  shotgun: {
    name: '双管猎枪', icon: 'it_shotgun', type: 'weapon',
    dmgType: 'pierce', dmg: 30, speed: 0.58, stamCost: 24, weight: 'heavy',
    crit: 0.05, range: 110, arc: 0.72, combo: 2, heavyMult: 1.7,
    desc: '远距离高爆发，声响会惊动更远的敌人；对灵体效果有限。',
    story: '枪托缠着防潮布。赵三醒说这东西救过他，也害死过人。',
    vsBonus: { ghost: 0.35, flesh: 1.4 },
  },
  crossbow: {
    name: '折叠手弩', icon: 'it_crossbow', type: 'weapon',
    dmgType: 'pierce', dmg: 20, speed: 0.72, stamCost: 17, weight: 'mid',
    crit: 0.16, range: 118, arc: 0.45, combo: 2, heavyMult: 2.0,
    desc: '安静的远程武器，装填慢，背刺与弱点命中收益高。',
    story: '弩槽里卡着一小片红纸，不知是喜帖还是符。',
  },
  mirror: {
    name: '照煞铜镜', icon: 'it_mirror_weapon', type: 'weapon',
    dmgType: 'zhen', dmg: 11, speed: 1.0, stamCost: 14, weight: 'light',
    crit: 0.08, range: 82, arc: 0.85, combo: 3, heavyMult: 1.8,
    desc: '让灵体显形并反照阴气，使用过久会损耗理智。',
    story: '镜里的人总比你慢半拍，除非它想先动。',
    vsBonus: { ghost: 2.8 },
  },
  bell: {
    name: '安魂法铃', icon: 'it_bell_weapon', type: 'weapon',
    dmgType: 'zhen', dmg: 10, speed: 1.25, stamCost: 13, weight: 'light',
    crit: 0.06, range: 74, arc: 2.4, combo: 3, heavyMult: 1.75,
    desc: '范围镇邪与打断，也会吸引循声而来的东西。',
    story: '铃舌上缠着头发。林二叔不肯说是谁的。',
    vsBonus: { ghost: 2.5, paper: 1.4 },
  },
  banner: {
    name: '招魂幡', icon: 'it_banner', type: 'weapon',
    dmgType: 'yin', dmg: 22, speed: 0.82, stamCost: 19, weight: 'mid',
    crit: 0.12, range: 88, arc: 2.1, combo: 3, heavyMult: 2.15,
    desc: '高阴蚀的区域控制禁器。越接近黑暗，威力越强。',
    story: '幡面没有字。每次展开，都会多一个湿手印。',
    vsBonus: { ghost: 1.8, flesh: 1.15 },
  },
};

export const GEAR_BASES = {
  clothhood: { name: '防尘头巾', icon: 'it_headcloth', slot: 'head', rarity: 'common', stats: { maxhp: 6, def: 1 } },
  operamask: { name: '旧戏脸', icon: 'it_mask', slot: 'mask', rarity: 'rare', stats: { crit: 0.05, maxsan: -5 } },
  waxcoat: { name: '油蜡外衣', icon: 'it_coat', slot: 'coat', rarity: 'fine', stats: { def: 4, oilEff: 0.05 } },
  cordwrist: { name: '结绳护腕', icon: 'it_wrist', slot: 'wrist', rarity: 'fine', stats: { atkspd: 0.04, maxstam: 5 } },
  toolbelt: { name: '陈家工具腰带', icon: 'it_belt', slot: 'belt', rarity: 'rare', stats: { lootLuck: 0.08, def: 2 } },
  silentshoe: { name: '软底夜行鞋', icon: 'it_boots', slot: 'shoes', rarity: 'fine', stats: { movespd: 0.05, quiet: 1 } },
  namechain: { name: '名牌项链', icon: 'it_necklace', slot: 'necklace', rarity: 'rare', stats: { maxsan: 9 } },
  bronzering: { name: '墓主铜戒', icon: 'it_ring', slot: 'ring1', rarity: 'rare', stats: { dmgPct: 0.06, yinGain: 0.05 } },
  wardring: { name: '朱砂指环', icon: 'it_ring_zhu', slot: 'ring2', rarity: 'fine', stats: { vsGhost: 0.1 } },
  ropekit: { name: '旧绳工具包', icon: 'it_rope', slot: 'tool', rarity: 'fine', stats: { maxstam: 8, movespd: 0.02 } },
  soulbanner: { name: '折叠引魂幡', icon: 'it_backbanner', slot: 'back', rarity: 'mizhuan', stats: { vsGhost: 0.18, maxsan: -6 } },
  pocketwatch: { name: '停摆怀表', icon: 'it_watch', slot: 'relic', rarity: 'unique', stats: { dodgeRange: 0.12, sanRegen: 0.1 } },
};

// 护符
export const CHARMS = {
  charm_zhu: {
    name: '朱砂平安符', icon: 'it_charm', type: 'charm',
    desc: '白事街求来的符。求的人多了，灵不灵另说，心安。',
    stats: { sanRegen: 0.35 },
  },
  charm_jade: {
    name: '半块玉佩', icon: 'it_jade', type: 'charm', fixed: 'unique',
    desc: '木盒里的半块玉。断口很旧。另一半在谁身上？',
    stats: { maxhp: 15, sanRegen: 0.2 }, keyItem: true,
  },
  charm_bell: {
    name: '守夜人的铜铃', icon: 'it_bell', type: 'charm', fixed: 'unique',
    desc: '让隐去之物显形。摇铃的人走了，铃还记得自己的差事。',
    story: '一名守墓人连续摇铃三十七年。村民说他死后，铃声又响了七天。',
    stats: { revealGhost: 1, zhenDmg: 0.15, sanCost: 5 },
  },
  charm_shoe: {
    name: '月娘的红绣鞋', icon: 'it_shoe', type: 'charm', fixed: 'unique',
    desc: '鞋底几乎没磨过——她没能穿着它走出那个村子。',
    story: '穿戴者脚步无声，闪避更远。但停下太久，会听见有人在哭。',
    stats: { dodgeRange: 0.3, quiet: 1 },
  },
};

// 灯具
export const LAMPS = {
  lamp_oil: {
    name: '老油灯', icon: 'it_lamp', type: 'lamp',
    desc: '陈家地窖里的油灯。灯芯剪得很齐，像是常有人打理。',
    stats: { radius: 130, drain: 1.0 },
  },
  lamp_storm: {
    name: '马灯', icon: 'it_lamp2', type: 'lamp',
    desc: '矿上用的防风马灯，雨夜也压不灭。',
    stats: { radius: 165, drain: 1.25 },
  },
  lamp_white: {
    name: '白纸灯笼', icon: 'it_lantern_w', type: 'lamp',
    desc: '送葬用的白灯笼。照得远，但有些场合，万万点不得。',
    stats: { radius: 195, drain: 1.6, white: 1 },
  },
};

// 消耗品
export const CONSUMABLES = {
  bandage: { name: '绷带', icon: 'it_bandage', type: 'use', price: 18, desc: '止血用。裹紧点。', use: { hp: 35 } },
  med: { name: '金疮药', icon: 'it_med', type: 'use', price: 40, desc: '林家的方子，疼，但管用。', use: { hp: 70 } },
  incense: { name: '安神香', icon: 'it_incense', type: 'use', price: 25, desc: '点上一炷，心里那些影子会退一退。', use: { san: 40 } },
  oilcan: { name: '灯油', icon: 'it_oil', type: 'use', price: 15, desc: '一壶清亮的灯油。黑暗里的命。', use: { oil: 50 } },
  xiangzhu: { name: '香烛', icon: 'it_candle', type: 'use', price: 12, desc: '超度亡魂用。也能在原地留一点光。', use: { candle: 1 } },
};

// 文物（修复后给永久增益）
export const ARTIFACTS = {
  art_bronze_mirror: {
    name: '残破铜镜', icon: 'it_mirror',
    era: '约清中期', material: '青铜',
    found: '陈家老宅·地窖',
    broken: '镜面氧化开裂，镜钮缺失。',
    needs: { money: 30 },
    gain: { revealFake: 1 },
    gainText: '理智低时，能看穿一部分幻象（假敌人显出灰白色）。',
    lore: '镜背铭文：「见日之光，长毋相忘。」是汉镜的仿款。修复后镜面仍有一道裂痕，照人时，裂痕正好落在眉心。',
  },
  art_genealogy: {
    name: '撕去的族谱页', icon: 'it_paper_torn',
    era: '民国抄本', material: '皮纸',
    found: '四姓祠·族谱阁（残页流落哭嫁村）',
    broken: '纸页撕裂，名讳处被墨涂去。',
    needs: { money: 20 },
    gain: { maxsan: 10 },
    gainText: '理智上限 +10。有些事，知道了反而踏实。',
    lore: '拼合后能辨认出一行小字：「沈氏女，名阿鸾，许陈氏，未行而殁。」后面一句被人用指甲划掉了。',
  },
  art_tape_deck: {
    name: '父亲的录音机', icon: 'it_recorder',
    era: '1981 年产', material: '塑料/金属',
    found: '陈家老宅·父亲工作间',
    broken: '皮带老化，磁头脏污。',
    needs: { money: 25 },
    gain: { maxhp: 20 },
    gainText: '生命上限 +20。修好它的那个下午，你想起了一些事。',
    lore: '型号是「燕舞牌」。卡仓里还卡着半盘磁带，标签上是父亲的字：「给归川——勿听」。',
  },
};

// ------------------------------------------------------------
// 词缀（前缀 + 后缀）
// stat 键: dmg%, crit, atkspd, vsGhost, vsPaper, maxhp, maxstam, maxsan,
// def, dodgeRange, movespd, oilEff, lampRadius, sanRegen, lootLuck, yinGain
// ------------------------------------------------------------
export const PREFIXES = [
  { id: 'p_heavy', name: '沉重的', w: 10, stats: { dmgPct: [0.1, 0.2] }, neg: { atkspd: -0.08 } },
  { id: 'p_sharp', name: '锋利的', w: 10, stats: { crit: [0.06, 0.12] } },
  { id: 'p_swift', name: '轻快的', w: 10, stats: { atkspd: [0.08, 0.16] } },
  { id: 'p_zhen', name: '镇煞的', w: 7, stats: { vsGhost: [0.2, 0.4] } },
  { id: 'p_guan', name: '破棺的', w: 7, stats: { vsPaper: [0.2, 0.45] } },
  { id: 'p_oil', name: '浸油的', w: 6, stats: { oilEff: [0.15, 0.3] } },
  { id: 'p_old', name: '有年头的', w: 8, stats: { lootLuck: [0.08, 0.18] } },
  { id: 'p_blood', name: '见过血的', w: 5, stats: { dmgPct: [0.16, 0.28] }, neg: { maxsan: -8 } },
  { id: 'p_warm', name: '焐热的', w: 7, stats: { sanRegen: [0.15, 0.35] } },
  { id: 'p_stout', name: '结实的', w: 9, stats: { maxhp: [10, 22] } },
];

export const SUFFIXES = [
  { id: 's_soul', name: '之安魂', w: 8, stats: { vsGhost: [0.15, 0.35] } },
  { id: 's_step', name: '之疾步', w: 9, stats: { movespd: [0.06, 0.12] } },
  { id: 's_lamp', name: '之蓄灯', w: 8, stats: { lampRadius: [0.1, 0.22] } },
  { id: 's_breath', name: '之吐纳', w: 9, stats: { maxstam: [12, 25] } },
  { id: 's_calm', name: '之定心', w: 8, stats: { maxsan: [8, 18] } },
  { id: 's_shadow', name: '之潜行', w: 6, stats: { dodgeRange: [0.12, 0.25] } },
  { id: 's_greed', name: '之贪冥', w: 4, stats: { dmgPct: [0.2, 0.32] }, neg: { yinGain: 0.3 }, cursed: true },
  { id: 's_echo', name: '之回响', w: 5, stats: { crit: [0.05, 0.1], atkspd: [0.05, 0.1] } },
  { id: 's_root', name: '之扎根', w: 7, stats: { def: [3, 8] } },
  { id: 's_dusk', name: '之掌灯', w: 6, stats: { sanRegen: [0.1, 0.25], lampRadius: [0.06, 0.12] } },
];

// ------------------------------------------------------------
// 唯一装备（固定词缀）
// ------------------------------------------------------------
export const UNIQUES = {
  uq_shoe: { base: 'charm_shoe', kind: 'charm' },
  uq_bell: { base: 'charm_bell', kind: 'charm' },
  uq_jade: { base: 'charm_jade', kind: 'charm' },
};

// ------------------------------------------------------------
// 掉落生成
// ------------------------------------------------------------
function rollRarity(rng, luckBonus = 0) {
  const entries = Object.entries(RARITIES).filter(([, r]) => r.w > 0);
  let total = 0;
  const ws = entries.map(([k, r]) => {
    let w = r.w;
    if (k === 'rare' || k === 'mizhuan' || k === 'mingqi') w *= (1 + luckBonus);
    total += w;
    return [k, w];
  });
  let roll = rng() * total;
  for (const [k, w] of ws) { roll -= w; if (roll <= 0) return k; }
  return 'common';
}

function rollAffix(rng, pool, exclude) {
  const cands = pool.filter(a => !exclude.has(a.id));
  if (!cands.length) return null;
  let total = 0; for (const a of cands) total += a.w;
  let roll = rng() * total;
  for (const a of cands) { roll -= a.w; if (roll <= 0) return a; }
  return cands[0];
}

export function makeWeapon(rng, baseKey, opt = {}) {
  const base = WEAPONS[baseKey];
  if (!base) return null;
  const rarity = opt.rarity || rollRarity(rng, opt.luck || 0);
  const R = RARITIES[rarity];
  const it = {
    uid: uid(), kind: 'weapon', base: baseKey, rarity,
    name: base.name, icon: base.icon,
    dmg: Math.round(base.dmg * R.mult),
    affixes: [],
  };
  const nAff = rngi(rng, R.affixes[0], R.affixes[1]);
  const used = new Set();
  for (let i = 0; i < nAff; i++) {
    const pool = (i === 0 && rng() < 0.55) ? PREFIXES : (rng() < 0.5 ? PREFIXES : SUFFIXES);
    const af = rollAffix(rng, pool, used);
    if (!af) break;
    used.add(af.id);
    const stats = {};
    for (const [k, range] of Object.entries(af.stats)) {
      stats[k] = Array.isArray(range)
        ? Math.round((range[0] + rng() * (range[1] - range[0])) * 100) / 100
        : range;
    }
    it.affixes.push({ id: af.id, name: af.name, stats, neg: af.neg || null, cursed: !!af.cursed });
  }
  // 名称拼装
  const pre = it.affixes.find(a => a.id.startsWith('p_'));
  const suf = it.affixes.find(a => a.id.startsWith('s_'));
  it.name = (pre ? pre.name : '') + base.name + (suf ? suf.name : '');
  return it;
}

export function makeCharm(key) {
  const c = CHARMS[key];
  return { uid: uid(), kind: 'charm', base: key, rarity: c.fixed || 'fine', name: c.name, icon: c.icon, affixes: [] };
}
export function makeLamp(key) {
  const c = LAMPS[key];
  return { uid: uid(), kind: 'lamp', base: key, rarity: 'common', name: c.name, icon: c.icon, affixes: [] };
}
export function makeUse(key, n = 1) {
  const c = CONSUMABLES[key];
  return { uid: uid(), kind: 'use', base: key, rarity: 'common', name: c.name, icon: c.icon, n, affixes: [] };
}
export function makeGear(rng, key) {
  const g = GEAR_BASES[key];
  if (!g) return null;
  const rarity = g.rarity || rollRarity(rng);
  return {
    uid: uid(), kind: 'gear', base: key, slot: g.slot, rarity,
    name: g.name, icon: g.icon, affixes: [],
  };
}

// 敌人掉落表：返回掉落描述数组 [{type:'money'|'item', ...}]
export function rollDrops(rng, tier, opt = {}) {
  const out = [];
  // 纸钱
  if (rng() < 0.8) out.push({ type: 'money', n: rngi(rng, 2, 6) * tier });
  // 消耗品
  if (rng() < 0.22) out.push({ type: 'use', key: pick(rng, ['bandage', 'oilcan', 'incense', 'xiangzhu']) });
  // 装备
  const gearChance = (opt.boss ? 1 : 0.1) + (opt.luck || 0) * 0.1;
  if (rng() < gearChance) {
    const keys = opt.weaponPool || ['shovel', 'knife'];
    out.push({ type: 'weapon', key: pick(rng, keys), luck: opt.luck || 0, rarity: opt.rarity });
  }
  if (rng() < (opt.boss ? 0.75 : 0.055) + (opt.luck || 0) * 0.04) {
    out.push({ type: 'gear', key: pick(rng, Object.keys(GEAR_BASES)) });
  }
  return out;
}

// 装备聚合属性（武器 + 护符 + 词缀）
export function aggregateStats(equip) {
  const agg = {
    dmgPct: 0, crit: 0, atkspd: 0, vsGhost: 0, vsPaper: 0,
    maxhp: 0, maxstam: 0, maxsan: 0, def: 0, dodgeRange: 0,
    movespd: 0, oilEff: 0, lampRadius: 0, sanRegen: 0, lootLuck: 0, yinGain: 0,
    revealGhost: 0, revealFake: 0, quiet: 0, zhenDmg: 0,
  };
  const apply = (stats, sign = 1) => {
    if (!stats) return;
    for (const [k, v] of Object.entries(stats)) {
      if (k in agg) agg[k] += v * sign;
    }
  };
  for (const [slot] of EQUIP_SLOTS) {
    const it = equip[slot];
    if (!it) continue;
    if (it.kind === 'charm') apply(CHARMS[it.base]?.stats);
    if (it.kind === 'gear') apply(GEAR_BASES[it.base]?.stats);
    for (const af of (it.affixes || [])) { apply(af.stats); apply(af.neg); }
  }
  return agg;
}

export function describeItem(it) {
  // 返回 {title, rarityName, col, lines[], story}
  const lines = [];
  let baseDef = null, story = '';
  if (it.kind === 'weapon') {
    baseDef = WEAPONS[it.base];
    lines.push(`伤害 ${it.dmg}（${dmgTypeName(baseDef.dmgType)}） · 攻速 ${baseDef.speed.toFixed(2)} · 暴击 ${Math.round(baseDef.crit * 100)}%`);
    lines.push(`体力消耗 ${baseDef.stamCost} · ${weightName(baseDef.weight)}`);
    if (baseDef.vsBonus) {
      const parts = [];
      if (baseDef.vsBonus.ghost) parts.push(`对灵体 ×${baseDef.vsBonus.ghost}`);
      if (baseDef.vsBonus.paper) parts.push(`对纸扎 ×${baseDef.vsBonus.paper}`);
      if (baseDef.vsBonus.flesh && baseDef.vsBonus.flesh < 1) parts.push(`对血肉 ×${baseDef.vsBonus.flesh}`);
      if (baseDef.vsBonus.human) parts.push(`对活人 ×${baseDef.vsBonus.human}`);
      if (parts.length) lines.push(parts.join(' · '));
    }
  } else if (it.kind === 'charm') {
    baseDef = CHARMS[it.base];
    if (baseDef.stats) {
      const s = baseDef.stats;
      if (s.maxhp) lines.push(`生命上限 +${s.maxhp}`);
      if (s.sanRegen) lines.push(`理智缓慢回复 +${s.sanRegen}`);
      if (s.revealGhost) lines.push('隐形之物显形');
      if (s.zhenDmg) lines.push(`镇邪伤害 +${Math.round(s.zhenDmg * 100)}%`);
      if (s.dodgeRange) lines.push(`闪避距离 +${Math.round(s.dodgeRange * 100)}%`);
      if (s.quiet) lines.push('移动无声（不易引来循声之物）');
      if (s.sanCost) lines.push(`代价：理智上限 -${s.sanCost}`);
    }
  } else if (it.kind === 'lamp') {
    baseDef = LAMPS[it.base];
    lines.push(`照明范围 ${baseDef.stats.radius} · 耗油 ×${baseDef.stats.drain}`);
    if (baseDef.stats.white) lines.push('⚠ 白灯。某些场合不可点。');
  } else if (it.kind === 'use') {
    baseDef = CONSUMABLES[it.base];
    const u = baseDef.use;
    if (u.hp) lines.push(`恢复生命 ${u.hp}`);
    if (u.san) lines.push(`恢复理智 ${u.san}`);
    if (u.oil) lines.push(`补充灯油 ${u.oil}`);
    if (u.candle) lines.push('放置一支长燃的香烛（光源/超度）');
  } else if (it.kind === 'gear') {
    baseDef = GEAR_BASES[it.base];
    for (const [k, v] of Object.entries(baseDef.stats || {})) lines.push(`${statName(k)} ${fmtStat(k, v)}`);
  }
  for (const af of (it.affixes || [])) {
    for (const [k, v] of Object.entries(af.stats)) lines.push(`${statName(k)} ${fmtStat(k, v)}`);
    if (af.neg) for (const [k, v] of Object.entries(af.neg)) lines.push(`⚠ ${statName(k)} ${fmtStat(k, v)}`);
  }
  story = baseDef?.story || '';
  return {
    title: it.name + (it.n > 1 ? ` ×${it.n}` : ''),
    rarityName: RARITIES[it.rarity]?.name || '',
    col: RARITIES[it.rarity]?.col || '#ccc',
    lines, desc: baseDef?.desc || '', story,
  };
}

function dmgTypeName(t) {
  return { slash: '斩', blunt: '钝', pierce: '穿', zhen: '镇邪', yin: '阴气', fire: '火' }[t] || t;
}
function weightName(w) { return { light: '轻型', mid: '中型', heavy: '重型' }[w] || w; }
function statName(k) {
  return {
    dmgPct: '伤害', crit: '暴击率', atkspd: '攻击速度', vsGhost: '对灵体伤害', vsPaper: '对纸扎伤害',
    maxhp: '生命上限', maxstam: '体力上限', maxsan: '理智上限', def: '防御', dodgeRange: '闪避距离',
    movespd: '移动速度', oilEff: '灯油效率', lampRadius: '照明范围', sanRegen: '理智回复',
    lootLuck: '掉落运气', yinGain: '阴蚀积累',
  }[k] || k;
}
function fmtStat(k, v) {
  const pct = ['dmgPct', 'crit', 'atkspd', 'vsGhost', 'vsPaper', 'dodgeRange', 'movespd', 'oilEff', 'lampRadius', 'lootLuck', 'yinGain'];
  if (pct.includes(k)) return (v >= 0 ? '+' : '') + Math.round(v * 100) + '%';
  return (v >= 0 ? '+' : '') + v;
}
