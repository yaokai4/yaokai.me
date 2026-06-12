// ============================================================
// data_story.js — 叙事数据：开场 / 对话 / 磁带 / 线索 / 规矩 / 事件 / 结局
// 情感原则：不直说，靠物件与细节。
// ============================================================

// ------------------------------------------------------------
// 开场演出（黑屏字幕组）
// ------------------------------------------------------------
export const CINE_INTRO = [
  { text: '1998 年，南方，雨季。', delay: 2.2 },
  { text: '你叫陈归川，二十九岁，在市博物馆修文物。\n你已经十一年没有回过槐阴县。', delay: 3.4 },
  { text: '三天前，你收到一个没有寄件人的木盒。\n盒子里有一盘磁带、一把生锈的钥匙、半块玉佩，\n和一张被雨水泡皱的合影。', delay: 4.6 },
  { text: '磁带里是父亲的声音。\n那个十七年前抛下你们、传说去盗墓的人。', delay: 3.6 },
  { tape: true, text: '「归川，如果你听见这盘磁带，\n说明你娘……已经替我下来了。」', delay: 4.6 },
  { text: '你给家里挂了七个长途。\n没有人接。', delay: 3 },
  { text: '末班车把你扔在归魂山脚下。\n司机一路没有看过后视镜。\n你数过，上车时乘客是六个，下车时，只有你。', delay: 4.6 },
  { text: '雨没有要停的意思。', delay: 2.4 },
];

// ------------------------------------------------------------
// 第一章标题卡
// ------------------------------------------------------------
export const CHAPTER_CARDS = {
  ch0: { sup: '序章', title: '雨夜归乡', sub: '归魂山 · 1998' },
  ch1: { sup: '第一章', title: '哭嫁村', sub: '「看见红轿，让路。」' },
};

// ------------------------------------------------------------
// 磁带
// ------------------------------------------------------------
export const TAPES = {
  tape_father1: {
    name: '父亲的磁带 · 一',
    lines: [
      '（磁带转动声。很久的沉默。）',
      '「归川。如果你听见这盘磁带，说明你娘……已经替我下来了。」',
      '「不要找我们。把屋子锁好，回城里去。」',
      '（停顿。背景里有滴水声。）',
      '「灶上的钥匙别忘了。你小时候总够不着。」',
      '（咔。）',
    ],
  },
  tape_mother: {
    name: '母亲的留言带',
    lines: [
      '「归川，是娘。」',
      '「饭在锅里，我怕你回来赶不上热乎的。」',
      '「你爸不是他们说的那种人。这句话娘说了十七年，没人信。」',
      '「娘这回下去，是去换他。他撑不住了。」',
      '「别学你爸，有话就说出来。别像他，什么都自己扛，扛到最后，连句对不起都没说利索。」',
      '（长久的空白。然后是收拾碗筷的声音，很轻，像怕吵醒谁。）',
      '「桌上给你留了筷子。」',
      '（咔。）',
    ],
  },
  tape_father2: {
    name: '父亲的磁带 · 二（地窖）',
    lines: [
      '「……测试，测试。今天是腊月十四，归川生日。」',
      '「他今年应该……二十了？墙上的刻度我又添了一道，是猜的。」',
      '「哭嫁村的封皮纸又裂了。沈家的丫头总在祠堂翻族谱，她迟早会翻到那一页。」',
      '「要是真有人下来找我——」',
      '（很长的停顿。）',
      '「希望他先去看看那个村子。先弄明白我们陈家欠了什么，再来恨我。」',
      '（咔。）',
    ],
  },
};

// ------------------------------------------------------------
// 线索
// ------------------------------------------------------------
export const CLUES = {
  clue_photo: {
    name: '泡皱的合影', icon: 'it_paper_torn',
    text: '一家三口在老宅门口。父亲的脸被雨水泡得发白，几乎看不清。照片背面有一行小字：「七岁，归川怕黑。」',
  },
  clue_news: {
    name: '旧报纸', icon: 'it_paper_torn',
    text: '《槐阴晚报》1981 年：「我县破获盗掘古墓案，主犯陈守义在逃。」配图里的人低着头，看不见脸。报纸边缘被人用铅笔写了两个字：「放屁。」',
  },
  clue_bus_ticket: {
    name: '末班车票根', icon: 'it_paper_torn',
    text: '槐阴末班车，1998 年 6 月。票根背面被雨水泡开，露出一行圆珠笔字：「六个人上车，一个人下车。」',
  },
  clue_station_clock: {
    name: '停在子时的钟', icon: 'it_paper_torn',
    text: '废弃车站的挂钟停在 23:47。你记得母亲说过，槐阴的车从不在子时进山，除非车上不是活人。',
  },
  clue_bowls: {
    name: '三副碗筷', icon: 'it_paper_torn',
    text: '堂屋桌上摆着三副碗筷。一副落满灰，像摆了很多年；一副干净；还有一副——碗沿是温的。',
  },
  clue_heights: {
    name: '门框上的刻度', icon: 'it_paper_torn',
    text: '母亲房间的门框上刻着身高。七岁、八岁、九岁……到十二岁就停了。十二岁往上，又有十七道浅浅的新刻痕，间距是猜的，一年一道。',
  },
  clue_rulepaper: {
    name: '白事铺的规矩单', icon: 'it_paper_torn',
    text: '林二叔写的字条：「一、见红轿让路，莫挡道。二、听见哭声莫回应，尤其是身后的。三、婚房里头，白灯莫点。」字写得很用力，纸都划破了。',
  },
  clue_hunshu: {
    name: '婚书残页', icon: 'it_book',
    text: '光绪年间的婚书，烧掉了一半。能认出仪程：「一拜天地，二拜高堂，夫妻对拜。」新娘的名字处被朱砂涂死了，只剩夫家给的称呼：「月娘」。',
  },
  clue_handkerchief: {
    name: '绣帕', icon: 'it_handkerchief',
    text: '帕角绣着一只鸾鸟，针脚细密。鸾鸟翅膀下藏着两个极小的字：「阿鸾」。这是绣帕主人给自己留的名字——嫁出去之后，就没人这么叫她了。',
  },
  clue_genealogy: {
    name: '族谱上的刮痕', icon: 'it_paper_torn',
    text: '祠堂第三块牌位比别的新，漆下面有刮掉重写的痕迹。原刻依稀是「沈氏阿鸾」，现刻是「沈门月娘之位」。连牌位上的名字，都不是她的。',
  },
  clue_sedan: {
    name: '送亲的纸轿', icon: 'it_paper_torn',
    text: '深夜过村的红轿。轿夫是纸的，轿杆压弯了，轿子里坐着的东西很重。活人的婚轿，不会在子时出门。',
  },
  clue_artisan_names: {
    name: '匠名墙',
    icon: 'it_book',
    text: '地窖墙上有两枚被凿掉姓氏的匠名牌：陈守义、陆鹤年。陈家的“盗墓”传闻，也许从一开始就是有人故意钉上去的名字。',
  },
};

// ------------------------------------------------------------
// 规矩（札记里可查）
// ------------------------------------------------------------
export const RULES = {
  rule_sedan: { name: '见红轿，让路', text: '送亲队伍过主路时，不要站在路中央。它们抬的不是你能挡的东西。' },
  rule_sob: { name: '听见哭声，莫回应', text: '尤其是身后传来的。回头、应声，都算回应。' },
  rule_whitelamp: { name: '婚房白灯莫点', text: '红事屋里点白灯，是给死人引路。把你的白纸灯笼收起来——油灯也别太亮。' },
};

// ------------------------------------------------------------
// 对话（节点式）
// node: { sp 说话人, text, opts: [{t 选项文本, next, set 旗标, give, need}] }
// ------------------------------------------------------------
export const DIALOGS = {
  // ---------- 林二叔 ----------
  dlg_linshu: {
    start(g) {
      if (!g.flag('met_linshu')) return 'lin_first';
      if (g.flag('boss_done')) return 'lin_after';
      return 'lin_repeat';
    },
    nodes: {
      lin_first: {
        sp: '林二叔',
        text: '哟，活人。这年头敢走夜路进哭嫁村的活人，不多了。\n……等等，你这眉眼，陈家的？守义的儿子？',
        opts: [
          { t: '您认识我父亲？', next: 'lin_father' },
          { t: '这村子怎么了？', next: 'lin_village' },
        ],
      },
      lin_father: {
        sp: '林二叔',
        text: '认识，怎么不认识。他们都说他盗墓跑了，呸。你爹要是那种人，我这白事铺早关张了。\n——别多问。有些话，说了对你没好处，对我更没好处。',
        opts: [{ t: '……', next: 'lin_rules' }],
      },
      lin_village: {
        sp: '林二叔',
        text: '三十年前这村里嫁出去一顶轿子，没抬到地方。打那以后，这村就只剩「嫁」这一件事了。夜夜都嫁，夜夜都哭。',
        opts: [{ t: '……', next: 'lin_rules' }],
      },
      lin_rules: {
        sp: '林二叔',
        text: '既然来了，把这个拿着。三条规矩，记死了——能不能活着出去，看你守不守得住。\n要香烛灯油，来我摊上买。夜里我不打烊。夜里才开张。',
        set: ['met_linshu'],
        give: ['clue_rulepaper'],
        opts: [{ t: '收下规矩单', next: null, shop: false }],
      },
      lin_repeat: {
        sp: '林二叔',
        text: '规矩都记着吧？红轿让路，哭声莫应，白灯莫点。\n要补点货吗？',
        opts: [
          { t: '看看货（购买）', next: null, shop: true },
          { t: '婚堂的门怎么进？', next: 'lin_gate' },
          { t: '先走了', next: null },
        ],
      },
      lin_gate: {
        sp: '林二叔',
        text: '婚堂锁着，钥匙就是「礼数」。你得拿着她的婚书，她才认你是宾客。\n婚书？绣楼里找去。那姑娘出嫁前在绣楼住了十六年。\n……要我说，你别进去。可你们陈家的人，从来不听劝。',
        opts: [{ t: '记下了', next: null }],
      },
      lin_after: {
        sp: '林二叔',
        text: '（他看着婚堂的方向，半天没说话。）\n……成了？她走了？\n（他往火盆里添了一把纸钱。）\n这村子欠她的。我们都欠。你爹当年想管这事，被四姓的人按住了——这话我可没说过。',
        opts: [
          { t: '看看货（购买）', next: null, shop: true },
          { t: '先走了', next: null },
        ],
      },
    },
  },

  // ---------- 沈秋棠 ----------
  dlg_shen: {
    start(g) {
      if (!g.flag('met_shen')) return 'shen_first';
      if (g.flag('boss_done')) return 'shen_after';
      if (g.flag('clue_genealogy')) return 'shen_name';
      return 'shen_repeat';
    },
    nodes: {
      shen_first: {
        sp: '沈秋棠',
        text: '别动！……哦，是人。\n（她把手电从你脸上移开，扶了扶眼镜。）\n县志馆，沈秋棠。你又是谁？大半夜在祠堂里乱晃。',
        opts: [
          { t: '陈归川。我在找我母亲。', next: 'shen_chen' },
          { t: '你又在干什么？', next: 'shen_work' },
        ],
      },
      shen_chen: {
        sp: '沈秋棠',
        text: '陈家的……守门陈家。\n（她翻开手里的抄本，又合上。）\n我查了三年县志。1968 年到 1971 年，槐阴县的记录是空的，整整三年，像被人裁掉了。你家，我家，白家林家，都在那三年里做过什么。',
        opts: [{ t: '……', next: 'shen_task' }],
      },
      shen_work: {
        sp: '沈秋棠',
        text: '工作。\n（她指了指那排牌位。）\n我沈家的族谱少了一页。撕得很整齐，是自家人撕的。我在对牌位，一个一个对。',
        opts: [{ t: '……', next: 'shen_task' }],
      },
      shen_task: {
        sp: '沈秋棠',
        text: '帮个忙。那排牌位你也去看看——五块，有一块不对。\n历史这东西，写上去的未必是真的，可改过的地方，一定有人心虚。',
        set: ['met_shen'],
        opts: [{ t: '我去看看', next: null }],
      },
      shen_repeat: {
        sp: '沈秋棠',
        text: '牌位看了吗？五块里有一块，漆色不对。\n——别用手抠，用眼睛看。',
        opts: [{ t: '好', next: null }],
      },
      shen_name: {
        sp: '沈秋棠',
        text: '「沈氏阿鸾」……改成了「沈门月娘」。\n（她的声音低下去。）\n我懂了。嫁过去的是「月娘」，死掉的是「月娘」，连牌位都是「月娘」。这样一来，「沈阿鸾」这个人就从来没存在过，自然也就……没死过。\n族谱那页是为她撕的。这就是我们沈家记历史的方式。',
        opts: [
          { t: '如果有人叫回她的名字呢？', next: 'shen_name2' },
        ],
      },
      shen_name2: {
        sp: '沈秋棠',
        text: '名字是人最后一件行李。\n要是你真在婚堂见到她——试试。喊错了别怪我。\n（她在你掌心写了两个字：阿鸾。）',
        set: ['know_truename'],
        opts: [{ t: '记住了', next: null }],
      },
      shen_after: {
        sp: '沈秋棠',
        text: '我把那一页补回去了。用铅笔——馆里规定不能用钢笔改档案。\n「沈阿鸾，生于光绪二十二年，卒年十七。生平：会绣鸾鸟，怕打雷，想去省城看一次戏。」\n生平是我编的。可总得有人给她编一个。',
        opts: [{ t: '……谢谢你。', next: null }],
      },
    },
  },

  // ---------- Boss 战前 ----------
  dlg_boss_intro: {
    start() { return 'b1'; },
    nodes: {
      b1: {
        sp: '？？？',
        text: '（婚堂的烛火一齐转向你，像一排回头的人。）\n（盖头下没有脸。可你分明感觉到，她在看你。）\n「……新郎官？」',
        opts: [
          { t: '我不是。', next: 'b2' },
          { t: '（握紧武器）', next: 'b2' },
        ],
      },
      b2: {
        sp: '无面新娘',
        text: '「他们说，过了门，就有名字。」\n「我等了三十年。轿子还没落地。」\n「拜堂——拜了堂，我就是人了。」',
        opts: [{ t: '（她朝你走来）', next: null }],
      },
    },
  },

  // ---------- Boss 第二阶段·拜堂仪程 ----------
  dlg_boss_ritual: {
    start() { return 'r1'; },
    nodes: {
      r1: {
        sp: '——',
        text: '（红绸缠住你的手腕，把你拽进一段不属于你的记忆：满堂宾客都是纸人，唢呐没有声音。）\n（司仪的纸壳嘴一开一合，在等你喊出仪程。）\n第一拜，拜什么？',
        opts: [
          { t: '一拜天地', next: 'r2', ritual: 1 },
          { t: '一拜高堂', next: 'r_fail', ritual: 0 },
          { t: '夫妻对拜', next: 'r_fail', ritual: 0 },
        ],
      },
      r2: {
        sp: '——',
        text: '（纸人宾客齐齐弯腰。轿子里传出一声很轻的、像是松了口气的呜咽。）\n第二拜呢？',
        opts: [
          { t: '二拜高堂', next: 'r3', ritual: 1 },
          { t: '再拜天地', next: 'r_fail', ritual: 0 },
          { t: '送入洞房', next: 'r_fail', ritual: 0 },
        ],
      },
      r3: {
        sp: '——',
        text: '（高堂的位置上坐着两个纸人，胸口分别贴着「沈」字和一片空白。）\n（她的盖头微微颤动。最后——）',
        opts: [
          { t: '夫妻对拜', next: 'r_ok', ritual: 1 },
          { t: '礼成', next: 'r_fail', ritual: 0 },
        ],
      },
      r_ok: {
        sp: '——',
        text: '（仪程走完了。三十年没走完的三拜，走完了。）\n（红绸松开你的手腕。盖头下传出一个声音，轻得像针落地：）\n「……原来，就这么简单。」',
        opts: [{ t: '（记忆碎裂）', next: null }],
        result: 'ok',
      },
      r_fail: {
        sp: '——',
        text: '（错了。满堂纸人同时转头，唢呐声炸开，红绸绞紧你的喉咙——）',
        opts: [{ t: '（挣脱！）', next: null }],
        result: 'fail',
      },
    },
  },

  // ---------- Boss 第三阶段·抉择 ----------
  dlg_boss_choice: {
    start() { return 'c1'; },
    nodes: {
      c1: {
        sp: '无面新娘',
        text: '（她跪坐在红毯尽头，红衣褪成了旧白。盖头的一角已经脱线。）\n「拜过堂了。」\n「现在……我叫什么？」',
        opts: [
          { t: '（继续攻击）', next: null, choice: 'kill' },
          { t: '「你叫月娘。」', next: 'c_wrong', choice: null },
          { t: '以桃木剑超度她', next: null, choice: 'pacify', needItem: 'peach' },
          { t: '「你叫沈阿鸾。」', next: null, choice: 'name', needFlag: 'know_truename' },
        ],
      },
      c_wrong: {
        sp: '无面新娘',
        text: '「月娘……」\n（她重复了一遍。盖头下，有什么东西碎掉了。）\n「月娘是他们给的。那不是我。」\n（红绸再次竖起，比之前更急、更乱——她不是在攻击，是在哭。）',
        opts: [{ t: '（战斗继续）', next: null }],
        result: 'enrage',
      },
    },
  },

  // ---------- 杂项短对话 ----------
  dlg_gate_locked: {
    start() { return 'g1'; },
    nodes: {
      g1: { sp: '——', text: '婚堂大门紧闭。门缝里渗出唢呐声，断断续续，像吹的人喘不上气。\n（门上贴着字：无婚书者，非宾。）', opts: [{ t: '离开', next: null }] },
    },
  },
};

// ------------------------------------------------------------
// 交互表：props.id → 行为
// type: dialog/tape/clue/pickup/save/clueboard/bench/door/shop/text/custom
// ------------------------------------------------------------
export const INTERACTS = {
  // 序章·末班车 / 废弃车站
  bus_box: { type: 'custom', custom: 'bus_box' },
  bus_passengers: { type: 'custom', custom: 'bus_passengers' },
  bus_rear_seat: { type: 'text', text: '末排座位是湿的。不是雨水，像有人穿着蓑衣坐过很久。' },
  bus_window1: { type: 'text', text: '车窗外是雨幕。玻璃倒影里，座位上好像坐满了人。你回头，车厢是空的。' },
  bus_window2: { type: 'text', text: '车窗裂了一道细缝，雨水从外面往里流。裂缝的形状像一枚倒着的钥匙。' },
  bus_window3: { type: 'text', text: '远处山影压在窗上。你分不清是山，还是车外站着一排披蓑衣的人。' },
  bus_front_door: { type: 'text', text: '车门开着。司机不见了，投币箱里只剩一把潮湿的纸钱。' },
  station_sign: { type: 'text', text: '站牌写着「槐阴县归魂山站」。旧漆下面还有更早的一层字：无名坟。' },
  station_ticket: { type: 'custom', custom: 'station_ticket' },
  station_clock: { type: 'clue', clue: 'clue_station_clock', text: '候车室挂钟停在 23:47，秒针还在抖，像被什么东西按住了。' },
  station_phone: { type: 'custom', custom: 'station_phone' },
  station_bench: { type: 'text', text: '长椅上积着水，水面映出一张很年轻的脸。不是你现在的脸，是你十二岁时的样子。' },
  station_road_marker: { type: 'text', text: '路碑指向山里：「陈家老宅 1.8 公里」。下面有人用刀刻：别回头。' },
  // 序章·山路
  shanlu_paperman: {
    type: 'custom', custom: 'paperman_turn',
    text: '路边立着一个纸人，朝着山下。雨把它泡得佝偻。\n你经过时——它的头慢慢转了过来，朝着山上。\n朝着你要去的方向。',
  },
  shanlu_stele: { type: 'text', text: '半截路碑。刻着「归魂山」三个字，「魂」字被人凿掉了，又被更深地刻回来。' },
  // 老宅
  savepoint: { type: 'save' },
  clueboard: { type: 'clueboard' },
  laozhai_table: { type: 'custom', custom: 'table_bowls' },
  laozhai_bowls: { type: 'custom', custom: 'table_bowls' },
  laozhai_mirror: { type: 'custom', custom: 'mirror_event' },
  laozhai_recorder: { type: 'custom', custom: 'home_recorder' },
  laozhai_paperman: { type: 'custom', custom: 'home_paperman' },
  laozhai_stove: { type: 'custom', custom: 'stove_key' },
  laozhai_jar: { type: 'loot', loot: { money: 12 }, text: '腌菜坛子。坛口的盐霜下压着几张纸钱。' },
  mother_door: {
    type: 'door', flag: 'mother_unlocked', needItem: 'key_mother',
    lockedText: '母亲房间的门锁着。这把锁很新——这个家里唯一新的东西。',
    openText: '灶台里的钥匙打开了锁。门轴没响，有人常给它上油。',
  },
  mother_bed: { type: 'text', text: '被褥叠得方方正正。枕头底下压着一件叠好的男人外套，针脚补了又补。' },
  mother_box: { type: 'custom', custom: 'mother_box' },
  bench: { type: 'bench' },
  father_recorder: { type: 'custom', custom: 'father_recorder' },
  father_jar: { type: 'loot', loot: { money: 8, use: 'oilcan' }, text: '工具间的油壶。父亲的东西总是满的，像随时会回来用。' },
  cellar_hatch: {
    type: 'door2map', to: 'dijiao', spawn: 'default', needItem: 'key_rust',
    lockedText: '柴房地上有一扇木板门，挂着锈锁。木盒里那把生锈的钥匙，应该就是它的。',
    openText: '锈锁咬了几下，开了。一股土腥气从地窖里涌上来。',
  },
  laozhai_well: { type: 'text', text: '井口蒙着木板，压着石头。村里人说，井是不能照夜里的脸的。' },
  laozhai_gate: { type: 'custom', custom: 'laozhai_gate' },
  // 地窖
  cellar_shelf: { type: 'custom', custom: 'cellar_shelf' },
  cellar_jar1: { type: 'loot', loot: { use: 'oilcan' }, text: '陶罐里是灯油，封得很好。' },
  cellar_jar2: { type: 'loot', loot: { money: 10 }, text: '罐底沉着一把铜钱，用红线串着。' },
  cellar_coffin: { type: 'custom', custom: 'cellar_coffin' },
  cellar_tapebox: { type: 'custom', custom: 'cellar_tapebox' },
  artisan_namewall: { type: 'custom', custom: 'artisan_namewall' },
  artisan_plate_chen: { type: 'text', text: '匠名牌缺了一角，只剩「守义」两个字。字不是刻上去的，是后来被人从泥里刮出来的。' },
  artisan_plate_lu: { type: 'text', text: '另一枚匠名牌写着「陆鹤年」。这个名字在槐阴县志里没有出现过。' },
  cellar_stonebeast: { type: 'text', text: '镇墓石兽嘴里塞着一团旧棉布。棉布上有淡淡的录音机油味。' },
  // 哭嫁村
  kj_stall: { type: 'npc' },
  kj_archway: { type: 'text', text: '村口牌坊。「贞节可风」四个字被凿得稀烂，只有「风」字完好。风确实还在。' },
  kj_houseA_table: { type: 'loot', loot: { money: 9 }, text: '桌上摆着喜糖，糖纸都空了。糖是给谁吃掉的？' },
  kj_houseA_paperman: { type: 'custom', custom: 'paperman_house' },
  kj_houseA_jar: { type: 'loot', loot: { use: 'bandage' }, text: '米缸早空了，缸底放着一卷干净的土布。' },
  kj_houseB_bed: { type: 'text', text: '床头放着一双没做完的鞋。鞋样很小，是给孩子做的。' },
  kj_houseB_chest: { type: 'chest', tier: 1, text: '樟木箱。锁早就锈穿了。' },
  kj_houseC_coffin: { type: 'custom', custom: 'kj_coffin' },
  kj_houseC_jar: { type: 'loot', loot: { money: 14 }, text: '塌屋下的瓦罐，雨水泡着几串纸钱。' },
  kj_well: { type: 'custom', custom: 'kj_well' },
  kj_paperman_road: { type: 'custom', custom: 'paperman_house' },
  kj_sedan_idle: { type: 'clue', clue: 'clue_sedan', text: '一顶停在路边的红轿。轿帘垂着，雨打不湿。\n你最好在它动起来之前离开主路。' },
  kj_citang_gate: { type: 'text', text: '祠堂的门虚掩着，里面有手电的光晃动。——有活人。' },
  kj_huntang_gate: { type: 'custom', custom: 'huntang_gate' },
  // 绣楼
  xl_loom: { type: 'custom', custom: 'xl_loom' },
  xl_table: { type: 'custom', custom: 'xl_hunshu' },
  xl_jar: { type: 'loot', loot: { money: 11 }, text: '绣线笸箩。红线用完了，只剩白线。' },
  xl_bridebed: { type: 'custom', custom: 'xl_bridebed' },
  xl_mirror: { type: 'custom', custom: 'xl_mirror' },
  xl_dowrychest: { type: 'chest', tier: 1, text: '嫁妆箱。箱底铺着的红纸已经褪成粉白。' },
  xl_paperman: { type: 'custom', custom: 'paperman_house' },
  // 祠堂
  ct_tablet1: { type: 'custom', custom: 'tablet', n: 1 },
  ct_tablet2: { type: 'custom', custom: 'tablet', n: 2 },
  ct_tablet3: { type: 'custom', custom: 'tablet', n: 3 },
  ct_tablet4: { type: 'custom', custom: 'tablet', n: 4 },
  ct_tablet5: { type: 'custom', custom: 'tablet', n: 5 },
  ct_altar: { type: 'custom', custom: 'ct_altar' },
  ct_chest: { type: 'custom', custom: 'ct_chest' },
  ct_jar: { type: 'loot', loot: { use: 'incense' }, text: '香炉边的罐子，存着几把没烧完的香。' },
  ct_backdoor: {
    type: 'door', flag: 'tomb_open', needFlag: 'ct_tablets_done',
    lockedText: '祠堂后门被供桌顶着。供桌上的牌位还没看完——沈秋棠说，五块里有一块不对。',
    openText: '挪开供桌，后门露出一个向下的洞口。土是新翻的——三十年来，一直有人在走这条路。',
  },
  // 合葬墓
  hz_coffin1: { type: 'custom', custom: 'tomb_coffin', n: 1 },
  hz_coffin2: { type: 'custom', custom: 'tomb_coffin', n: 2 },
  hz_coffin3: { type: 'custom', custom: 'tomb_coffin', n: 3 },
  hz_coffin4: { type: 'custom', custom: 'tomb_coffin', n: 4 },
  hz_mural: { type: 'text', text: '墓壁上画着送亲图：轿子、唢呐、长长的队伍。所有人物的脸都被指甲抠掉了——从里面抠的。' },
  hz_jar1: { type: 'loot', loot: { money: 16 }, text: '陪葬的陶罐。' },
  hz_jar2: { type: 'loot', loot: { use: 'med' }, text: '罐里封着药包，油纸还是干的。' },
  hz_chest: { type: 'chest', tier: 2, text: '一口包铜角的箱子，混在棺材之间，像是后来塞进来的。' },
  // 婚堂
  ht_altar: { type: 'text', text: '香案上的红烛烧了三十年，烛泪堆成了小山。香炉里插着三炷香，只有中间一炷还亮着。' },
  ht_sedan: { type: 'text', text: '就是那顶轿子。轿杆断了一根——它当年没能抬到夫家。' },
  ht_guest1: { type: 'text', text: '赴宴的纸人宾客。胸前贴着「陈」字。' },
  ht_guest2: { type: 'text', text: '赴宴的纸人宾客。胸前贴着「沈」字。' },
  ht_guest3: { type: 'text', text: '赴宴的纸人宾客。胸前贴着「白」字。' },
  ht_guest4: { type: 'text', text: '赴宴的纸人宾客。胸前贴着「林」字。' },
};

// ------------------------------------------------------------
// 事件脚本（触发器 id → 步骤）
// 由 game.js 的 runEvent 解释执行
// ------------------------------------------------------------
export const EVENTS = {
  ev_bus_start: [
    { sub: '末班车停在雨里。司机没有催你下车。事实上，你已经想不起司机的脸。' },
    { tut: 'tut.move' },
    { tut: 'tut.interact' },
    { obj: '检查木盒，然后从前门下车' },
  ],
  ev_bus_passenger_shift: [
    { sfx: 'paper', vol: 0.6 },
    { sub: '座椅皮革轻轻凹下去，又慢慢弹起来。像刚有人站起身。' },
  ],
  ev_station_enter: [
    { sub: '车站早废了。候车室却亮着一盏不该亮的灯。' },
    { obj: '调查废弃车站，确认通往归魂山的路' },
  ],
  ev_station_exit_hint: [
    { sub: '山路就在雨幕另一头。母亲的老宅，在更黑的地方。' },
    { obj: '沿山路回陈家老宅' },
  ],
  ev_shanlu_start: [
    { sub: '雨下得很大。手电的光只够照三步。' },
    { tut: 'tut.move' },
    { obj: '沿山路向上，回陈家老宅' },
  ],
  ev_shanlu_paperman: [
    { sub: '路边好像立着什么东西。' },
    { tut: 'tut.interact' },
  ],
  ev_shanlu_gate: [
    { sub: '老宅的灯笼亮着。十一年了，还亮着。' },
    { sfx: 'sob', vol: 0.5 },
  ],
  ev_laozhai_enter: [
    { sub: '门没锁。门从来不锁——母亲说，怕那个人回来进不了家门。' },
    { obj: '进堂屋看看' },
  ],
  ev_laozhai_hall: [
    { sfx: 'creak' },
    { sub: '桌上摆着饭菜。还冒着一点点热气。' },
    { obj: '调查堂屋（桌子 / 镜子 / 录音机 / 线索墙）' },
  ],
  ev_cellar_enter: [
    { sub: '地窖比记忆里深。墙上有抓痕，是从下往上的。' },
    { obj: '搜索地窖' },
  ],
  ev_cellar_fight: [
    { sfx: 'paper' },
    { sub: '黑暗里传来纸张摩擦的声音——有什么东西站起来了。' },
    { spawnGroup: 'cellar_fight' },
    { tut: 'tut.attack' },
    { tut: 'tut.dodge' },
  ],
  ev_kj_enter: [
    { card: 'ch1' },
    { sub: '村子里家家挂红，门门贴喜。可这村子，三十年没住过活人了。' },
    { obj: '找到进入婚堂的办法（先去村口白事摊问问）' },
  ],
  ev_kj_sedan: [
    { custom: 'sedan_event' },
  ],
  ev_kj_sob: [
    { custom: 'sob_event' },
  ],
  ev_kj_xiulou_hint: [
    { sub: '东南角的小楼挂着红灯。那是绣楼——出嫁前的姑娘住的地方。' },
  ],
  ev_xl_enter: [
    { sub: '绣楼一层。到处都是没绣完的喜帕。' },
    { obj: '搜索绣楼，寻找婚书' },
  ],
  ev_xl_upstairs: [
    { sub: '楼上是婚房。红毯一直铺到床前。\n（你想起规矩单：婚房里头，白灯莫点。）' },
    { tut: 'tut.lamp' },
  ],
  ev_ct_enter: [
    { sub: '祠堂里有手电光。有活人——这村里居然还有活人。' },
  ],
  ev_hz_enter: [
    { sub: '合葬墓。空气又冷又稠，火苗压得很低。' },
    { obj: '穿过合葬墓，从北口直上婚堂' },
    { tut: 'tut.ghost' },
  ],
  ev_hz_shade: [
    { sfx: 'whisper' },
    { sub: '一截红色的衣角从棺材之间飘过去。没有脚步声。' },
  ],
  ev_boss_intro: [
    { custom: 'boss_intro' },
  ],
};

// ------------------------------------------------------------
// 结局文本
// ------------------------------------------------------------
export const ENDINGS = {
  end_kill: {
    title: '镇杀',
    text: [
      '红绸落地的时候，盖头也落了。',
      '盖头下面什么都没有。三十年的怨，散得也快，像一场纸扎的火。',
      '你捡起那双红绣鞋。鞋底干干净净——她终究没能用它走完那条路。',
      '婚堂的烛火一盏一盏熄灭。这一次，是真的熄了。',
      '（沈秋棠后来在县志的空页上写：是夜，村中唢呐声绝。）',
    ],
    flag: 'ending_kill',
  },
  end_pacify: {
    title: '超度',
    text: [
      '桃木剑没有落在她身上，而是落在了红毯上，划出一道送行的线。',
      '你点起香烛，照白事铺教的规矩，把仪程倒着走了一遍——红事不成，那就按白事，送她走。',
      '她在烛光里慢慢坐下，像一个终于等到散席的客人。',
      '「……麻烦你了。」',
      '盖头垂落，里面只剩一捧纸灰，和一百零八枚铜钱。',
      '（林二叔那夜烧了整摊的纸钱。他说不是给她的，是给这村子的。）',
    ],
    flag: 'ending_pacify',
  },
  end_name: {
    title: '往事有名',
    text: [
      '「你叫沈阿鸾。」',
      '满堂的烛火静了一瞬。',
      '「光绪二十二年生，会绣鸾鸟，怕打雷，想去省城看一次戏。」——你把沈秋棠补的那页生平，一个字一个字念给她听。',
      '盖头下传来一声很轻很轻的笑。像绣花针落进棉花里。',
      '「阿鸾……」她跟着念了一遍自己的名字，念得很慢，像怕念错。',
      '红衣化作千百只纸鸾，从婚堂的天窗涌出去，散进雨停了的夜空。',
      '红毯尽头留下一双红绣鞋，和一方叠好的绣帕。',
      '帕角的鸾鸟旁边，多了一行新绣的小字：',
      '「谢君知我名。」',
    ],
    flag: 'ending_name',
  },
  epilogue: [
    '回到老宅，桌上的三副碗筷还在。',
    '你把哭嫁村的事记进札记。父亲磁带里那句话开始有了重量——',
    '「先弄明白我们陈家欠了什么，再来恨我。」',
    '哭嫁村只是第一笔账。',
    '槐阴县志上空白的那三年、四姓祠撕掉的那几页、归魂山底下封着的那扇门……',
    '雨又下起来了。山的更深处，传来隐隐的棺木挪动声。',
  ],
};

// ------------------------------------------------------------
// 目标链
// ------------------------------------------------------------
export const OBJECTIVES = {};

// 教学提示一次性 key 列表（game 内用 t() 取文案）
export const TUTORIAL_KEYS = [
  'tut.move', 'tut.attack', 'tut.dodge', 'tut.heavy', 'tut.lamp',
  'tut.stamina', 'tut.ghost', 'tut.sanity', 'tut.interact',
];
