// ============================================================
// data_campaign.js - Chapters 2-8, finale, progression and endings.
// The browser edition condenses the full campaign while preserving every
// chapter's theme, signature rule, investigation, boss and moral branch.
// ============================================================

function blank(w, h, ch = ' ') {
  return { w, h, g: Array.from({ length: h }, () => Array(w).fill(ch)) };
}
function fill(m, x, y, w, h, ch) {
  for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) {
    if (i >= 0 && j >= 0 && i < m.w && j < m.h) m.g[j][i] = ch;
  }
}
function room(m, x, y, w, h, wall = '#', floor = '_') {
  fill(m, x, y, w, h, wall);
  fill(m, x + 1, y + 1, w - 2, h - 2, floor);
}
const rows = (m) => m.g.map((r) => r.join(''));

export const CAMPAIGN_CHAPTERS = {
  2: {
    mapId: 'baiguanling',
    sup: '第二章',
    title: '百棺岭',
    subtitle: '「棺木有主，贪念无主。」',
    objective: '辨认背棺人的真棺，穿过悬棺岭',
    summary: '悬棺、旧盗墓队与贪欲',
    palette: { floor: 'cliff', alt: 'dirt', road: 'stone', wall: 'wall_cliff', wood: 'wood_old' },
    ambient: ['wind', 'drip'], music: 'tomb', dark: 0.82,
    hazard: { type: 'rope', label: '绳索', rate: 5.5, hint: '离开石栈道会磨损绳索；绳索归零时会跌回安全点。' },
    puzzle: {
      prompt: '三口悬棺旁各有墓志：一位守山人、一位药师、一位无名盗客。背棺人的腰牌刻着「巡山不入墓」。哪口才属于他？',
      options: ['有金器陪葬的盗客棺', '刻着山川纹、没有随葬品的守山人棺', '放着药臼的药师棺'],
      correct: 1,
      success: '棺盖上的山川纹与腰牌吻合。肉身只是执念，真棺才是他的归处。',
    },
    clue: { id: 'clue_old_team', name: '旧盗墓队合影', text: '照片背面写着五个人的名字，陈守义被墨圈住，赵三醒的名字被反复划掉。' },
    relic: { id: 'relic_rope_knot', name: '守山结', text: '一段磨白的老绳，结法只为救人，不为下墓。' },
    boss: { name: '背棺人', art: 'boss_bearer', hp: 760, speed: 54, damage: 20, style: 'charge', weakness: 'blunt' },
    branches: {
      kill: { label: '击碎肉身', note: '夺下棺中冥器，但惊醒岭上旧魂。', yin: 12 },
      solve: { label: '送真棺归位', note: '背棺人放下了肩上的重量。', mercy: 1 },
      mercy: { label: '焚掉盗契超度', note: '赵三醒第一次承认，当年是他先跑。', mercy: 2 },
    },
  },
  3: {
    mapId: 'chenjingcun',
    sup: '第三章',
    title: '沉井村',
    subtitle: '「水里映出的，不一定是活人。」',
    objective: '调节水位，找出井中孩子失踪的真相',
    summary: '水葬、集体隐瞒与溺亡记忆',
    palette: { floor: 'flood', alt: 'mud', road: 'wood', wall: 'wall_brick', wood: 'wood_old' },
    ambient: ['rain', 'drip'], music: 'sad', dark: 0.76,
    hazard: { type: 'oxygen', label: '气息', rate: 7, hint: '淹水区持续消耗气息；靠近灯台或回到木台可恢复。' },
    puzzle: {
      prompt: '井边有四双童鞋，县志却只记三名溺亡儿童。铜镜里，第四双鞋旁没有倒影。谁被从记录里删掉了？',
      options: ['鞋底绣林字的女孩', '穿草鞋的放牛娃', '没有姓名、鞋码最小的孩子'],
      correct: 2,
      success: '井壁浮出一个乳名：「满满」。被删掉的不是尸体，是一个孩子活过的证明。',
    },
    clue: { id: 'clue_well_children', name: '井壁童谣', text: '“三人下井，四人回家。第四个人，不许叫娘。”最后一行被水泡开，露出白家的印记。' },
    relic: { id: 'relic_child_shoe', name: '无名童鞋', text: '鞋尖补过三次。做鞋的人一直在等孩子长大。' },
    boss: { name: '抱井娘娘', art: 'boss_wellmother', hp: 820, speed: 60, damage: 21, style: 'tide', weakness: 'mirror' },
    branches: {
      kill: { label: '斩断水影', note: '井水退去，却再也映不出村庄。', yin: 10 },
      solve: { label: '用铜镜照出真身', note: '她放开井口，让孩子们先走。', mercy: 1 },
      mercy: { label: '叫回第四个孩子的乳名', note: '水下第一次传来母亲应答孩子的声音。', mercy: 2, name: 1 },
    },
  },
  4: {
    mapId: 'yaxilou',
    sup: '第四章',
    title: '哑戏楼',
    subtitle: '「台上换脸，台下换命。」',
    objective: '按唱词恢复站位，打破换脸伶人的模仿',
    summary: '戏曲、身份、替身与表演',
    palette: { floor: 'stage', alt: 'wood_old', road: 'carpet', wall: 'wall_wood', wood: 'wood' },
    ambient: ['wind'], music: 'opera', dark: 0.73,
    hazard: { type: 'rhythm', label: '锣点', rate: 0, hint: '同一连招重复三次会被戏楼记住，换招或停步可清除模仿。' },
    puzzle: {
      prompt: '残谱写着：“生居东，旦居西，净守北门，丑不入中。”舞台中央该留给谁？',
      options: ['生角', '旦角', '不站任何人，留给死去的替身'],
      correct: 2,
      success: '中央空位亮起一束冷光。那不是缺角，是戏班故意不写进班谱的替身。',
    },
    clue: { id: 'clue_understudy', name: '无名替身戏服', text: '戏服内衬写着十二个不同名字，最后一个只剩“白小”两个字。' },
    relic: { id: 'relic_mask', name: '半张旧脸谱', text: '脸谱背面有汗渍。有人戴着别人的名字，演了一辈子。' },
    boss: { name: '换脸伶人', art: 'boss_actor', hp: 880, speed: 82, damage: 22, style: 'mimic', weakness: 'variety' },
    branches: {
      kill: { label: '焚毁戏服', note: '戏楼安静下来，所有角色都失去了脸。', yin: 12 },
      solve: { label: '按残谱改写站位', note: '换脸伶人再也复制不了你的动作。', mercy: 1 },
      mercy: { label: '把空位留给替身', note: '谢幕时，台上第一次站满了人。', mercy: 2, name: 1 },
    },
  },
  5: {
    mapId: 'wuguiyi',
    sup: '第五章',
    title: '无归驿',
    subtitle: '「住客都在等一条不存在的归路。」',
    objective: '识别死者与活人，结束客栈的一夜循环',
    summary: '时间循环、旅人和无法回家',
    palette: { floor: 'inn', alt: 'dirt', road: 'wood_old', wall: 'wall_wood', wood: 'wood_old' },
    ambient: ['wind', 'rain'], music: 'house', dark: 0.7,
    hazard: { type: 'loop', label: '更次', rate: 2.2, hint: '更次走完会重置房间，但线索、文物与记忆保留。' },
    puzzle: {
      prompt: '十二间客房都有账目，只有十三号房没有钥匙。掌柜每夜仍给它送一碗饭。那间房属于谁？',
      options: ['欠账逃走的商人', '掌柜未能带回家的女儿', '不存在，只是客栈多算了一间'],
      correct: 1,
      success: '饭碗底下刻着一个小名。循环不是为了困住客人，是掌柜不肯让女儿独自上路。',
    },
    clue: { id: 'clue_room13', name: '十三号房账页', text: '账页每一夜都写同一句：“小满一人，饭一碗，不收钱。”' },
    relic: { id: 'relic_room_key', name: '十三号木钥匙', text: '钥匙没有齿，从来打不开门。它只是让送饭的人觉得那扇门还在。' },
    boss: { name: '无归掌柜', art: 'boss_innkeeper', hp: 900, speed: 58, damage: 23, style: 'loop', weakness: 'truth' },
    branches: {
      kill: { label: '砸碎更漏', note: '循环结束，住客却全在天亮前化成了灰。', yin: 10 },
      solve: { label: '分出死者与活人', note: '十二位住客依次结账，走向各自的路。', mercy: 1 },
      mercy: { label: '替掌柜送完最后一碗饭', note: '十三号房开了一瞬，女孩说：“爹，回家吧。”', mercy: 2, name: 1 },
    },
  },
  6: {
    mapId: 'sixingci',
    sup: '第六章',
    title: '四姓祠',
    subtitle: '「祖训写给后人，也写来堵住死人的嘴。」',
    objective: '修复四份族谱，恢复被删除的家族关系',
    summary: '宗族、祖训与历史修改',
    palette: { floor: 'ancestral', alt: 'stone', road: 'carpet', wall: 'wall_brick', wood: 'wood' },
    ambient: ['drone'], music: 'sad', dark: 0.77,
    hazard: { type: 'ancestry', label: '祖训', rate: 0, hint: '错误祭拜会增加阴蚀；对照四份县志后再选择牌位。' },
    puzzle: {
      prompt: '四姓县志都把同一场灾荒归咎于外来流民。只有林家药簿记着：“本地户三百一十七，领药三百九十四。”多出的七十七人是谁？',
      options: ['重复记账', '未入族谱的灾民、佃户与童养媳', '负责修墓的工匠'],
      correct: 1,
      success: '四本记录叠在一起，空白处正好组成七十七个人名。罪证一直藏在彼此矛盾的谎话里。',
    },
    clue: { id: 'clue_77_names', name: '七十七人名册', text: '名字来自药簿、粮册、白事账和修墓工单。没有一份记录完整，合起来才像一段人生。' },
    relic: { id: 'relic_genealogy_core', name: '四姓族谱原页', text: '原页没有鬼神，只有粮食、土地和一群被划去的人。' },
    boss: { name: '四姓祖灵', art: 'boss_ancestors', hp: 1020, speed: 66, damage: 25, style: 'forms', weakness: 'records' },
    branches: {
      kill: { label: '砸碎全部牌位', note: '祖灵散去，连无辜后人的名字也一并碎了。', yin: 15 },
      solve: { label: '以四份记录互证', note: '四种祖灵失去谎言护身，露出凡人的面孔。', mercy: 1 },
      mercy: { label: '把七十七人补入族谱', note: '祠堂里多出七十七声落座的轻响。', mercy: 2, name: 2, genealogy: 1 },
    },
  },
  7: {
    mapId: 'shoumenren',
    sup: '第七章',
    title: '守门人旧墓',
    subtitle: '「别让她下来。」',
    objective: '沿父亲留下的生日刻痕，找回他剥离的记忆',
    summary: '父亲、责任与误解',
    palette: { floor: 'workshop', alt: 'dirt', road: 'stone', wall: 'wall_tomb', wood: 'wood_old' },
    ambient: ['drip'], music: 'sad', dark: 0.68,
    hazard: { type: 'memory', label: '记忆', rate: 1.8, hint: '记忆会缓慢消退；阅读父亲留下的物件可恢复。' },
    puzzle: {
      prompt: '墙上每年都有一道身高刻痕。主角十一岁后不再长高，旁边却仍每年多一道。父亲在量谁？',
      options: ['他在墓里想象长大的儿子', '另一个被困的孩子', '刻痕是守门人的暗号'],
      correct: 0,
      success: '父亲没有见过你长大，只能按县城同龄孩子的平均身高，一年一年往上刻。',
    },
    clue: { id: 'clue_father_wall', name: '十七道生日刻痕', text: '每道旁边都写着礼物：钢笔、球鞋、自行车。没有一件真的送到。' },
    relic: { id: 'relic_toolbox', name: '陈守义的旧工具箱', text: '每件工具都有固定位置。最空的一格，大小正好能放一封信。' },
    boss: { name: '守忆残身', art: 'boss_memory', hp: 720, speed: 70, damage: 20, style: 'memory', weakness: 'keepsake' },
    branches: {
      kill: { label: '斩断残忆', note: '你保住了自己，却让父亲又忘掉一部分往事。', yin: 8 },
      solve: { label: '按生日刻痕唤醒记忆', note: '残身记起了自己为何留在这里。', mercy: 1 },
      mercy: { label: '修好录音机，播放未寄出的道歉', note: '磁带最后没有“对不起”，只有一句：“饭要按时吃。”', mercy: 2, parent: 1 },
    },
  },
  8: {
    mapId: 'zangyigong',
    sup: '第八章',
    title: '葬忆宫',
    subtitle: '「无字碑不是没有名字，是名字被人拿走了。」',
    objective: '穿过倒置墓宫，为万人名墙补回姓名',
    summary: '记忆、历史与集体遗忘',
    palette: { floor: 'memorypalace', alt: 'stone', road: 'tomb', wall: 'wall_tomb', wood: 'wood_old' },
    ambient: ['drone', 'wind'], music: 'tomb', dark: 0.9,
    hazard: { type: 'route', label: '墓向', rate: 0, hint: '每次开门都会改变一条支路；已修复的名字会成为稳定地标。' },
    puzzle: {
      prompt: '万人名墙上，名字按死亡年份排列。唯有白小满同时出现在 1931、1968、1981 与 1998。她究竟是谁？',
      options: ['活了很久的亡魂', '每一代被删去女孩共同留下的名字', '主角童年的幻觉'],
      correct: 1,
      success: '“白小满”不是一个人的原名，是被抹去的女孩们互相借用的名字。她们让最小的那个先记住。',
    },
    clue: { id: 'clue_xiaoman', name: '白小满的真名页', text: '页上没有单一姓名，而是密密麻麻的乳名。最后一行写：“谁还记得，就先叫小满。”' },
    relic: { id: 'relic_name_wall', name: '无名碑拓片', text: '墨拓看似空白，靠近灯火时会浮出成百上千个浅淡指印。' },
    boss: { name: '无名者之门', art: 'boss_nameless_gate', hp: 1160, speed: 72, damage: 27, style: 'echo', weakness: 'names' },
    branches: {
      kill: { label: '强开无名者之门', note: '门开了，所有被压住的声音同时涌出。', yin: 18 },
      solve: { label: '按死亡年份修复名墙', note: '墓宫不再改变已经被叫回名字的路。', mercy: 1 },
      mercy: { label: '让白小满选择自己的名字', note: '她选了“满”字，说这样听起来像一碗盛满的饭。', mercy: 2, name: 3, xiaoman: 1 },
    },
  },
  9: {
    mapId: 'wumingdian',
    sup: '终章',
    title: '无名者',
    subtitle: '「忘掉一件事，和埋掉一个人，有时没有区别。」',
    objective: '面对被埋葬的往事，并决定谁来记住',
    summary: '战斗、辨认、推理与最终选择',
    palette: { floor: 'voidhall', alt: 'memorypalace', road: 'carpet', wall: 'wall_tomb', wood: 'wood_old' },
    ambient: ['drone'], music: 'boss', dark: 0.94,
    hazard: { type: 'identity', label: '姓名', rate: 1.5, hint: '姓名值归零时，界面与地图会失真；靠近名墙可恢复。' },
    puzzle: {
      prompt: '无名者借父亲、母亲和白小满的声音问：封印真正守住的是什么？',
      options: ['县城里所有人的性命', '四大家族的罪证与被害者的名字', '地下的古代邪神'],
      correct: 1,
      success: '门后没有神。只有一段被重复掩埋、终于长成形状的集体遗忘。',
    },
    clue: { id: 'clue_child_night', name: '十七年前的雨夜', text: '真正误入墓宫的是童年的陈归川。父亲破坏封印，只为把孩子抱回家。' },
    relic: { id: 'relic_half_jade', name: '合拢的玉佩', text: '另一半一直在陈守义身上。玉佩合拢时，中间仍留着一道缝。' },
    boss: { name: '无名者', art: 'boss_nameless', hp: 1380, speed: 78, damage: 29, style: 'adaptive', weakness: 'memory' },
  },
};

export const EXTRA_ENEMIES = {
  coffinbearer: { name: '背棺尸', art: 'en_coffinbearer', cls: 'flesh', hp: 112, dmg: 18, speed: 44, size: 19, sense: 300, behavior: 'lunge', lungeSpeed: 250, lungeCd: 3, atkRange: 40, atkCd: 1.7, tier: 2, knockResist: 0.75 },
  facelessguest: { name: '无面宾客', art: 'en_faceless', cls: 'ghost', hp: 84, dmg: 16, speed: 74, size: 14, sense: 320, behavior: 'phase', atkRange: 34, atkCd: 1.4, tier: 2 },
  boneguard: { name: '骨甲尸', art: 'en_boneguard', cls: 'flesh', hp: 148, dmg: 20, speed: 46, size: 18, sense: 280, behavior: 'facefear', atkRange: 38, atkCd: 1.8, tier: 2, knockResist: 0.8 },
  memoryecho: { name: '失忆亡魂', art: 'en_memoryecho', cls: 'ghost', hp: 76, dmg: 14, speed: 68, size: 14, sense: 280, behavior: 'phase', atkRange: 34, atkCd: 1.6, tier: 2, pacifiable: true },
  stitched: { name: '缝尸傀', art: 'en_stitched', cls: 'flesh', hp: 174, dmg: 24, speed: 50, size: 21, sense: 310, behavior: 'lunge', lungeSpeed: 220, atkRange: 44, atkCd: 2, tier: 3, knockResist: 0.85 },
  tombshadow: { name: '墓中影', art: 'en_tombshadow', cls: 'ghost', hp: 102, dmg: 19, speed: 80, size: 15, sense: 360, behavior: 'phase', atkRange: 36, atkCd: 1.25, tier: 3 },
};

export const CHAPTER_LANDMARKS = {
  2: [
    ['倒挂槐树', '山崖边的槐树根朝天，枝条向下扎进雾里。树皮上绑着几十枚断裂的绳结。'],
    ['无主悬棺墙', '一整面崖壁挂满棺木，只有三口没有写姓氏。风从棺缝里穿过，像人在吹口哨。'],
    ['守墓人营地', '营火早灭了，饭盒里还有半块冷硬的馍。有人离开时没有收拾，因为他以为自己马上回来。'],
  ],
  3: [
    ['水下戏台', '木台沉在水面下半尺，台上摆着三张小板凳，第四张被人故意压进淤泥。'],
    ['倒影祠堂', '祠堂在水里的倒影比真实建筑完整，倒影里的牌匾还写着旧村名。'],
    ['枯井童鞋', '井沿排着四双童鞋，雨再大也冲不乱。最小那双鞋尖朝着井里。'],
  ],
  4: [
    ['无声锣鼓架', '锣槌悬在空中，隔几息自己落一下。你听不见声音，只看见灰尘跟着震。'],
    ['挂满空脸的后台', '后台墙上挂着一排没有画完的脸谱，每一张都缺一只眼。'],
    ['替身空位', '舞台中央用白粉画出一个站位，没人站上去，白粉却总被脚印踩乱。'],
  ],
  5: [
    ['十三号门', '走廊尽头多出一扇门。门牌是木纹自然长成的“十三”，不是刻上去的。'],
    ['永远热着的饭', '柜台上摆着一碗饭，饭粒每天少一点，却从不见底。'],
    ['循环山路', '客栈外的山路走十分钟必回到马厩，马槽里永远有一把新草。'],
  ],
  6: [
    ['四门祖先堂', '祖先堂被四道门切开，站在中间时，四姓牌位都会背对你。'],
    ['空白族谱架', '架上有一本族谱没有封皮，翻开每页都是空白，只有边角有指甲印。'],
    ['刑罚室水缸', '水缸里没有水，只有一层灰。灰面上浮着七十七个浅浅的指印。'],
  ],
  7: [
    ['生日刻痕墙', '十七道刻痕按年份排好。每一道旁边，都写着那年父亲想送你的礼物。'],
    ['磁带档案柜', '柜子里一排磁带标签全是“重录”。父亲似乎一生都在重录同一句话。'],
    ['别让她下来', '石门内侧刻着五个字，刻痕歪斜，像刻字的人当时已经握不稳刀。'],
  ],
  8: [
    ['万人名墙', '名字没有按姓氏排，而是按被忘记的顺序排。越靠下的名字越淡。'],
    ['倒置墓宫', '屋顶上也有门槛和脚印。你抬头时，会短暂看见自己走在上面。'],
    ['无字碑林', '每块碑看似空白，靠近灯火时，会浮出一个人留下的物件轮廓。'],
  ],
  9: [
    ['父母影门', '门左边是父亲修过的工具，右边是母亲留下的饭盒。中间没有门闩。'],
    ['童年裂缝', '地面有一道玉佩形状的裂缝，你站上去时，能听见很小的自己在哭。'],
    ['最终名墙', '所有名字都在这里汇合。空白处留着你的名字大小的一格。'],
  ],
};

const ENEMY_SETS = {
  2: ['coffinbearer', 'boneguard', 'tombshadow'],
  3: ['memoryecho', 'stitched', 'redshade'],
  4: ['facelessguest', 'tombshadow', 'paperwalker'],
  5: ['memoryecho', 'facelessguest', 'redshade'],
  6: ['boneguard', 'paperwalker', 'stitched'],
  7: ['memoryecho', 'tombshadow'],
  8: ['memoryecho', 'stitched', 'tombshadow'],
  9: ['memoryecho', 'facelessguest', 'tombshadow'],
};

function buildCampaignMap(chapter) {
  const d = CAMPAIGN_CHAPTERS[chapter];
  const w = chapter === 8 ? 52 : 46;
  const h = chapter === 8 ? 36 : 32;
  const m = blank(w, h);
  fill(m, 0, 0, w, h, '#');
  fill(m, 2, 2, w - 4, h - 4, '.');
  fill(m, Math.floor(w / 2) - 2, 2, 5, h - 4, '=');
  room(m, 4, 6, 13, 10, '#', chapter === 4 || chapter === 5 ? '-' : '_');
  fill(m, 16, 10, Math.floor(w / 2) - 14, 3, '=');
  room(m, w - 17, 15, 13, 10, '#', chapter === 4 || chapter === 5 ? '-' : '_');
  fill(m, Math.floor(w / 2) + 2, 19, Math.floor(w / 2) - 18, 3, '=');
  room(m, Math.floor(w / 2) - 8, 2, 17, 8, '#', chapter === 4 ? ':' : '_');
  fill(m, Math.floor(w / 2) - 2, 9, 5, 4, '=');
  fill(m, Math.floor(w / 2) - 2, h - 2, 5, 1, '=');

  if (chapter === 3) {
    fill(m, 3, 18, 15, 7, ';');
    fill(m, w - 18, 5, 15, 7, ';');
  } else if (chapter === 4) {
    fill(m, 5, 7, 11, 2, ':');
    fill(m, w - 16, 16, 11, 2, ':');
  } else if (chapter === 5) {
    for (let y = 5; y < h - 5; y += 5) fill(m, 8, y, w - 16, 1, '-');
  } else if (chapter === 6) {
    fill(m, 6, 7, 9, 2, ':');
    fill(m, w - 15, 16, 9, 2, ':');
  } else if (chapter >= 8) {
    fill(m, 5, h - 10, 12, 4, ':');
    fill(m, w - 17, 6, 12, 4, ':');
  }

  const mid = Math.floor(w / 2);
  const enemyTypes = ENEMY_SETS[chapter];
  const positions = [[10, 22], [mid - 7, 16], [mid + 7, 13], [w - 10, 26], [8, 12], [w - 9, 9]];
  const enemies = positions.slice(0, chapter === 7 ? 3 : 6).map((p, i) => ({
    type: enemyTypes[i % enemyTypes.length], x: p[0], y: p[1],
  }));

  return {
    name: `${d.sup} · ${d.title}`,
    chapter,
    grid: rows(m),
    tiles: {
      floor: d.palette.floor, alt: d.palette.alt, road: d.palette.road,
      wall: d.palette.wall, wood: d.palette.wood, carpet: 'carpet', water: 'water', tombf: 'tomb',
    },
    wallShade: 0.34, dark: d.dark, ambient: d.ambient, music: d.music,
    spawns: { default: [mid, h - 5], return: [mid, h - 5] },
    enemies,
    boss: d.boss,
    hazard: d.hazard,
    props: [
      { art: 'pr_lamp_eternal', x: mid - 4, y: h - 5, id: 'savepoint', light: [150, 'rgba(230,170,90,0.55)'], solid: 1 },
      { art: 'pr_tablet', x: 9, y: 8, id: `camp_clue_${chapter}`, solid: 1, s: 1.15 },
      { art: chapter === 3 ? 'pr_well' : chapter === 4 ? 'pr_loom' : chapter === 5 ? 'pr_table' : 'pr_clueboard', x: w - 10, y: 19, id: `camp_puzzle_${chapter}`, solid: 1, s: 1.2 },
      { art: chapter === 2 ? 'pr_coffin' : chapter === 7 ? 'pr_box' : 'pr_chest', x: 9, y: 23, id: `camp_relic_${chapter}`, solid: 1, s: 1.1 },
      { art: chapter === 6 ? 'pr_shrine' : chapter === 8 ? 'pr_tablet' : 'pr_gate', x: mid, y: 5.5, id: `camp_seal_${chapter}`, solid: 0, s: 1.5 },
      { art: 'pr_lantern', x: mid - 5, y: 10, light: [115, 'rgba(210,140,80,0.45)'], solid: 0 },
      { art: 'pr_lantern', x: mid + 5, y: 10, light: [115, 'rgba(210,140,80,0.45)'], solid: 0 },
      { art: 'pr_tree', x: 6, y: 6, id: `camp_landmark_${chapter}_0`, solid: 1, s: 1.6 },
      { art: 'pr_tablet', x: w - 7, y: 7, id: `camp_landmark_${chapter}_1`, solid: 1, s: 1.1 },
      { art: 'pr_table', x: mid + 7, y: h - 9, id: `camp_landmark_${chapter}_2`, solid: 1, s: 1.0 },
    ],
    exits: [{ x: mid - 2, y: h - 2, w: 5, h: 1, to: 'laozhai', spawn: 'gate' }],
    triggers: [
      { id: `ev_campaign_enter_${chapter}`, x: mid - 4, y: h - 9, w: 9, h: 5, once: 1 },
      { id: `ev_campaign_boss_${chapter}`, x: mid - 8, y: 8, w: 17, h: 7, once: 1 },
    ],
  };
}

export const CAMPAIGN_MAPS = Object.fromEntries(
  Object.keys(CAMPAIGN_CHAPTERS).map((n) => {
    const chapter = Number(n);
    return [CAMPAIGN_CHAPTERS[chapter].mapId, buildCampaignMap(chapter)];
  }),
);

const TREE_META = {
  explore: { name: '探墓术', names: ['辨土', '听墙', '识水', '看气', '拓印', '寻隙', '护物', '勘方', '留记', '复原', '辨伪', '寻路', '藏锋', '回程', '观山'] },
  melee: { name: '近战术', names: ['稳握', '追身', '破甲', '收势', '借力', '反震', '踏步', '连锋', '断筋', '压棺', '守中', '回气', '重势', '处决', '人器合一'] },
  ward: { name: '镇邪术', names: ['定心', '照影', '铃止', '木印', '铜阵', '退煞', '净灯', '安魂', '照名', '破妄', '镇门', '护伴', '送行', '还愿', '万名归位'] },
  survive: { name: '生存术', names: ['包扎', '节油', '闭气', '轻装', '耐寒', '解毒', '稳步', '藏声', '识药', '回神', '负重', '脱险', '坚韧', '守夜', '绝处逢生'] },
  taboo: { name: '禁忌术', names: ['借阴', '听尸', '吞恐', '黑灯', '血契', '影步', '冥视', '夺魂', '逆香', '替身', '召纸', '开棺', '无名', '葬我', '禁器共鸣'] },
};

function skillEffect(tree, i) {
  const tier = 1 + Math.floor(i / 5);
  const table = {
    explore: [{ lootLuck: 0.03 * tier }, { lampRadius: 0.04 * tier }, { oilEff: 0.03 * tier }],
    melee: [{ dmgPct: 0.035 * tier }, { atkspd: 0.025 * tier }, { maxstam: 4 * tier }],
    ward: [{ vsGhost: 0.05 * tier }, { sanRegen: 0.05 * tier }, { maxsan: 4 * tier }],
    survive: [{ maxhp: 5 * tier }, { def: 1.5 * tier }, { movespd: 0.015 * tier }],
    taboo: [{ dmgPct: 0.055 * tier, yinGain: 0.04 * tier }, { crit: 0.025 * tier, maxsan: -2 * tier }, { vsGhost: 0.08 * tier, maxhp: -2 * tier }],
  };
  return table[tree][i % 3];
}

export const SKILL_TREES = Object.fromEntries(Object.entries(TREE_META).map(([id, meta]) => [
  id,
  {
    id, name: meta.name,
    nodes: meta.names.map((name, i) => ({
      id: `${id}_${i + 1}`, name,
      tier: 1 + Math.floor(i / 5),
      cost: 1 + Math.floor(i / 5),
      effect: skillEffect(id, i),
      desc: i === 14 ? `终极节点：完成${meta.name}的最后一课。` : `强化${meta.name}的探索与战斗收益。`,
    })),
  },
]));

export const CAMP_UPGRADES = {
  toolroom: { name: '工具房', cost: 60, desc: '强化、修理与词缀提取；武器伤害 +8%。', effect: { dmgPct: 0.08 } },
  study: { name: '书房', cost: 55, desc: '开放完整图鉴与族谱回顾；理智上限 +8。', effect: { maxsan: 8 } },
  kitchen: { name: '厨房', cost: 45, desc: '每次出发获得热食增益；生命上限 +10。', effect: { maxhp: 10 } },
  cellar: { name: '地窖', cost: 70, desc: '安全存放禁器；阴蚀获取 -10%。', effect: { yinGain: -0.1 } },
  motherroom: { name: '母亲房间', cost: 40, desc: '整理她留下的线索；理智恢复加快。', effect: { sanRegen: 0.18 } },
  workshop: { name: '父亲工作间', cost: 65, desc: '文物修复费用降低，耐久消耗下降。', effect: { oilEff: 0.08 } },
  courtyard: { name: '院子', cost: 50, desc: '同伴在此聚集；移动速度 +4%。', effect: { movespd: 0.04 } },
};

export const FINAL_ENDINGS = {
  guard: {
    title: '守门人',
    text: ['你接过父亲手里的灯。', '父母沿墓道向上走，没有回头。', '很多年后，墙上又多了一位守门人的生日刻痕。', '最先模糊的，是你自己的名字。'],
  },
  home: {
    title: '归家',
    text: ['你砸开封门，把父母都带回老宅。', '母亲重新热了那桌饭，三副碗筷终于都有人用。', '当天夜里，槐阴县所有镜子里都多出一座不存在的村庄。', '第二天，第一户人家忘了自己死去孩子的名字。'],
  },
  forget: {
    title: '遗忘',
    text: ['你把全部童年记忆填进封印。', '父母活着回到家，父亲修门，母亲烧饭。', '他们礼貌地问你从哪里来。', '桌上仍有三副碗筷，却没人知道第三副是给谁的。'],
  },
  burn: {
    title: '焚墓',
    text: ['你点燃四姓族谱，也点燃了墓宫的封门木。', '亡魂离开时没有欢呼，只有很多人轻轻报出自己的名字。', '槐阴县不得不在天亮后面对祖先留下的账。', '往事没有被洗净，但终于不再被埋。'],
  },
  greed: {
    title: '贪墓',
    text: ['无名者把禁器和财富推到你脚边。', '你没有放下。', '多年后，新墓主人坐在万人名墙前，替每件宝物编造来历。', '他记得所有东西值多少钱，唯独忘了父母的脸。'],
  },
  truth: {
    title: '往事不葬',
    text: ['你把七十七人的名字、白小满选择的名字和四姓原页带回地上。', '父亲还记得怎么修东西，母亲还记得门锁该给谁留。', '县志馆第一次为“没有记录的人”留出整整一册空白。', '空白不是遗忘，是等后来人把名字补完。'],
  },
  none: {
    title: '无人归来',
    text: ['无名者问：如果那一夜被抱回去的孩子不是你呢？', '你终于看见十七年前的墓道。父亲抱出去的，只是一段会长大的记忆。', '真正的陈归川仍躺在门后，手里攥着半块玉。', '老宅桌上的第三副碗筷，从来没有温过。'],
  },
};

export const CAMPAIGN_ART = [
  'boss_bearer', 'boss_wellmother', 'boss_actor', 'boss_innkeeper',
  'boss_ancestors', 'boss_memory', 'boss_nameless_gate', 'boss_nameless',
  'en_coffinbearer', 'en_faceless', 'en_boneguard', 'en_memoryecho',
  'en_stitched', 'en_tombshadow',
];
