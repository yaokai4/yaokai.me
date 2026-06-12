// ============================================================
// ui.js — DOM 界面层（HUD / 对话 / 行囊 / 札记 / 商店 / 结局…）
// 画布只画世界，一切文字界面都在 DOM，移动端友好
// ============================================================
import { t, AudioSys, Assets, Input, SaveSys } from './engine.js';
import { describeItem, RARITIES, CONSUMABLES, ARTIFACTS, EQUIP_SLOTS } from './data_items.js';
import { CLUES, RULES, TAPES } from './data_story.js';
import { CAMPAIGN_CHAPTERS, SKILL_TREES, CAMP_UPGRADES } from './data_campaign.js';

function el(tag, cls, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  return e;
}
function btn(label, cls, fn) {
  const b = el('button', 'btn ' + (cls || ''), label);
  b.addEventListener('click', (e) => { e.stopPropagation(); AudioSys.sfx('ui'); fn && fn(e); });
  return b;
}

export const UI = {
  g: null,
  open: null,        // 当前模态: inventory/journal/dialog/menu/...
  _subT: null, _locT: null, _toastBox: null,
  _tapeTimer: null,
  _cineState: null,

  init(game) {
    this.g = game;
    this.root = document.getElementById('overlay');
    this.hud = document.getElementById('hud');
    this._buildHUD();
    document.getElementById('loading').classList.add('hide');
  },

  isOpen() { return this.open !== null; },

  // ============ HUD ============
  _buildHUD() {
    this.hud.innerHTML = `
      <div id="bars">
        <div class="bar hp"><i></i></div>
        <div class="bar st"><i></i></div>
        <div class="bar sa"><i></i></div>
        <div class="bar oil"><i></i><b>🔥</b></div>
        <div class="bar hazard"><i></i><b></b></div>
      </div>
      <div id="stat2"><span id="moneyLab">🪙 0</span><span id="yinLab"></span></div>
      <div id="objline"></div>
      <div id="questbox"><b>当前调查</b><span></span><small></small></div>
      <div id="loccard"></div>
      <div id="subline"></div>
      <div id="prompt"></div>
      <div id="toasts"></div>
      <div id="bossbar"><label></label><div class="bb"><i></i></div></div>
    `;
    this._toastBox = this.hud.querySelector('#toasts');
  },

  updateHUD() {
    const g = this.g, s = g.pstats;
    const q = (sel) => this.hud.querySelector(sel);
    q('.bar.hp i').style.width = (100 * s.hp / s.maxhp) + '%';
    q('.bar.st i').style.width = (100 * s.stam / s.maxstam) + '%';
    q('.bar.sa i').style.width = (100 * s.san / s.maxsan) + '%';
    q('.bar.oil i').style.width = (100 * s.oil / s.maxoil) + '%';
    const hz = g.map?.def?.hazard;
    const hbar = q('.bar.hazard');
    hbar.style.display = hz ? 'block' : 'none';
    if (hz) {
      q('.bar.hazard i').style.width = (100 * g.hazard.value / g.hazard.max) + '%';
      q('.bar.hazard b').textContent = hz.label;
    }
    q('.bar.sa').classList.toggle('low', s.san < 35);
    q('#moneyLab').textContent = '🪙 ' + g.money;
    const yl = q('#yinLab');
    yl.textContent = s.yin > 0 ? `阴蚀 ${Math.round(s.yin)}` : '';
    yl.className = s.yin >= 50 ? 'bad' : '';
  },

  objective(text) {
    const o = this.hud.querySelector('#objline');
    o.innerHTML = text ? `<em>${t('hud.objective')}</em> ${text}` : '';
    this.refreshQuest();
  },

  refreshQuest() {
    if (!this.hud || !this.g) return;
    const q = this.hud.querySelector('#questbox');
    if (!q) return;
    const text = this.g.objectiveText || '';
    const recent = [...(this.g.questLog || [])].reverse().find((x) => x.type !== '目标');
    q.querySelector('span').textContent = text || '暂无目标';
    q.querySelector('small').textContent = recent ? `${recent.type}：${recent.text}` : '按 L / 记 打开札记查看调查记录';
    q.classList.toggle('show', !!text);
  },

  location(name, sub = '') {
    const c = this.hud.querySelector('#loccard');
    if (!c) return;
    c.innerHTML = `<b>${name}</b>${sub ? `<small>${sub}</small>` : ''}`;
    c.classList.add('show');
    clearTimeout(this._locT);
    this._locT = setTimeout(() => c.classList.remove('show'), 3600);
  },

  sub(text, dur = 3) {
    const s = this.hud.querySelector('#subline');
    s.textContent = text;
    s.classList.add('show');
    clearTimeout(this._subT);
    this._subT = setTimeout(() => s.classList.remove('show'), dur * 1000);
  },

  prompt(text) {
    const p = this.hud.querySelector('#prompt');
    if (text) { p.innerHTML = text; p.classList.add('show'); }
    else p.classList.remove('show');
  },

  toast(text, dur = 2.6) {
    const d = el('div', 'toast', text);
    this._toastBox.appendChild(d);
    requestAnimationFrame(() => d.classList.add('in'));
    setTimeout(() => { d.classList.remove('in'); setTimeout(() => d.remove(), 400); }, dur * 1000);
  },

  bossBar(show, name = '', ratio = 1) {
    const b = this.hud.querySelector('#bossbar');
    b.classList.toggle('show', !!show);
    if (show) {
      b.querySelector('label').textContent = name;
      b.querySelector('.bb i').style.width = (ratio * 100) + '%';
    }
  },

  // ============ 模态框架 ============
  _modal(cls) {
    this.closeModal(true);
    const m = el('div', 'modal ' + (cls || ''));
    this.root.appendChild(m);
    this.root.classList.add('active');
    this._cur = m;
    return m;
  },
  closeModal(silent) {
    if (this._cur) { this._cur.remove(); this._cur = null; }
    this.root.classList.remove('active');
    const was = this.open;
    this.open = null;
    if (!silent && was) AudioSys.sfx('ui');
    if (this.g) this.g.onModalClosed(was);
  },

  // ============ 标题 ============
  title(hasSave) {
    this.open = 'title';
    const m = this._modal('titlebox');
    m.innerHTML = `
      <div class="title-art"><img src="assets/art/title-keyart.png" alt="雨夜中的陈家老宅"></div>
      <div class="title-rain"></div>
      <h1>${t('app.title')}</h1>
      <p class="sub-en">${t('app.subtitle')}</p>
      <p class="tagline">${t('app.tagline')}</p>
      <div class="menu"></div>
      <p class="ver">完整版 · 序章 + 八章 + 终章 · 建议横屏佩戴耳机</p>
    `;
    const menu = m.querySelector('.menu');
    if (hasSave) menu.appendChild(btn(t('menu.continue'), 'primary', () => this.g.continueGame()));
    if (hasSave && SaveSys.listSaves) menu.appendChild(btn('读取存档槽', '', () => this.saveSlots('load')));
    menu.appendChild(btn(t('menu.new'), hasSave ? '' : 'primary', () => {
      if (hasSave && !confirm(t('menu.confirm_new'))) return;
      this.g.startNew();
    }));
    menu.appendChild(btn(t('menu.settings'), '', () => this.settings('title')));
    menu.appendChild(btn(t('menu.about'), '', () => {
      alert(t('about.text'));
    }));
  },

  // ============ 暂停 ============
  pause() {
    this.open = 'pause';
    const m = this._modal('pausebox paper');
    m.appendChild(el('h2', null, t('pause.title')));
    m.appendChild(btn(t('menu.resume'), 'primary wide', () => this.closeModal()));
    m.appendChild(btn(t('ui.inventory') + ' (I)', 'wide', () => this.inventory()));
    m.appendChild(btn(t('ui.journal') + ' (L)', 'wide', () => this.journal()));
    m.appendChild(btn('技能树', 'wide', () => this.skills()));
    m.appendChild(btn('老宅整修', 'wide', () => this.camp()));
    m.appendChild(btn('章节回顾', 'wide', () => this.archive()));
    m.appendChild(btn('手动存档', 'wide', () => this.saveSlots('save')));
    m.appendChild(btn(t('menu.settings'), 'wide', () => this.settings('pause')));
    m.appendChild(btn(t('menu.quit'), 'wide danger', () => { this.closeModal(true); this.g.toTitle(); }));
  },

  saveSlots(mode = 'load') {
    this.open = 'saves';
    const m = this._modal('jbox paper');
    const rows = SaveSys.listSaves ? SaveSys.listSaves() : [{ slot: 'auto', save: SaveSys.loadGame() }];
    m.appendChild(el('h2', null, mode === 'save' ? '手动存档' : '读取存档'));
    m.appendChild(el('p', 'hint', mode === 'save' ? '自动存档会保留。手动槽适合在进墓前、Boss 前、关键选择前保存。' : '选择一个存档继续。'));
    const list = el('div', 'jbody');
    const lab = { auto: '自动存档', slot_1: '手动槽 1', slot_2: '手动槽 2', slot_3: '手动槽 3' };
    for (const row of rows) {
      const s = row.save;
      const d = el('div', 'jentry saveentry');
      const time = s?.time ? new Date(s.time).toLocaleString('zh-CN') : '空';
      d.appendChild(el('h4', null, `${lab[row.slot] || row.slot} <small>${time}</small>`));
      d.appendChild(el('p', null, s ? `${s.objective || '无当前目标'}<br>地点：${s.mapId || '未知'} · 生命 ${Math.round(s.pstats?.hp || 0)}/${Math.round(s.pstats?.maxhp || 100)}` : '这个槽位还没有存档。'));
      const actions = el('div', 'saveactions');
      if (mode === 'save' && row.slot !== 'auto') {
        actions.appendChild(btn(s ? '覆盖此槽' : '存入此槽', 'small primary', () => {
          this.closeModal(true);
          this.g.manualSave(row.slot);
          this.pause();
        }));
      } else if (mode === 'load' && s) {
        actions.appendChild(btn('读取', 'small primary', () => this.g.continueGame(row.slot)));
      }
      if (s) {
        actions.appendChild(btn('导出 JSON', 'small', () => {
          const blob = new Blob([JSON.stringify(s, null, 2)], { type: 'application/json' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `tbt-${row.slot}-${new Date(s.time || Date.now()).toISOString().slice(0, 10)}.json`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          setTimeout(() => URL.revokeObjectURL(url), 500);
        }));
      }
      actions.appendChild(btn('导入 JSON', 'small', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'application/json,.json';
        input.addEventListener('change', async () => {
          const file = input.files?.[0];
          if (!file) return;
          try {
            const imported = JSON.parse(await file.text());
            if (!imported || typeof imported !== 'object') throw new Error('bad save');
            SaveSys.saveGame(imported, row.slot);
            this.toast('存档导入完成。');
            this.saveSlots(mode);
          } catch (err) {
            this.toast('存档导入失败：JSON 无效。');
          }
        }, { once: true });
        input.click();
      }));
      d.appendChild(actions);
      list.appendChild(d);
    }
    m.appendChild(list);
    m.appendChild(btn(t('menu.back'), 'wide', () => mode === 'save' ? this.pause() : this.title(this.g.hasSave())));
  },

  // ============ 设置 ============
  settings(from) {
    this.open = 'settings';
    const g = this.g, s = g.settings;
    const m = this._modal('setbox paper');
    m.appendChild(el('h2', null, t('menu.settings')));
    const mk = (label, key, min, max) => {
      const row = el('div', 'srow');
      row.appendChild(el('label', null, label));
      const inp = el('input');
      inp.type = 'range'; inp.min = min; inp.max = max; inp.step = 0.05; inp.value = s[key];
      inp.addEventListener('input', () => { s[key] = parseFloat(inp.value); g.applySettings(); });
      row.appendChild(inp);
      m.appendChild(row);
    };
    mk(t('set.master'), 'volMaster', 0, 1);
    mk(t('set.music'), 'volMusic', 0, 1);
    mk(t('set.sfx'), 'volSfx', 0, 1);
    mk(t('set.amb'), 'volAmb', 0, 1);
    const mkToggle = (label, key, onLab, offLab) => {
      const row = el('div', 'srow');
      row.appendChild(el('label', null, label));
      const b = btn(s[key] ? onLab : offLab, 'small', () => {
        s[key] = !s[key];
        b.textContent = s[key] ? onLab : offLab;
        g.applySettings();
      });
      row.appendChild(b);
      m.appendChild(row);
    };
    mkToggle(t('set.horror'), 'horrorReduce', t('set.horror.soft'), t('set.horror.std'));
    mkToggle(t('set.shake'), 'shake', t('set.on'), t('set.off'));
    mkToggle('高对比界面', 'highContrast', t('set.on'), t('set.off'));
    mkToggle('减少闪烁', 'reduceFlash', t('set.on'), t('set.off'));
    mkToggle('色弱辅助', 'colorAssist', t('set.on'), t('set.off'));
    mkToggle('自动锁定辅助', 'autoLock', t('set.on'), t('set.off'));
    mkToggle('追逐辅助', 'chaseAssist', t('set.on'), t('set.off'));
    mkToggle('长按改切换', 'holdToggle', t('set.on'), t('set.off'));
    mkToggle('自动拾取', 'autoPickup', t('set.on'), t('set.off'));
    {
      const row = el('div', 'srow');
      row.appendChild(el('label', null, '难度'));
      const opts = [['story', '故事'], ['standard', '标准'], ['deep', '深墓']];
      if (s.keeperUnlocked) opts.push(['keeper', '守门人']);
      const b = btn('', 'small', () => {
        const i = Math.max(0, opts.findIndex((o) => o[0] === s.difficulty));
        s.difficulty = opts[(i + 1) % opts.length][0];
        b.textContent = opts.find((o) => o[0] === s.difficulty)[1];
      });
      b.textContent = opts.find((o) => o[0] === s.difficulty)?.[1] || '标准';
      row.appendChild(b); m.appendChild(row);
    }
    {
      const row = el('div', 'srow');
      row.appendChild(el('label', null, '字幕大小'));
      const inp = el('input');
      inp.type = 'range'; inp.min = 0.85; inp.max = 1.5; inp.step = 0.05; inp.value = s.subtitleScale || 1;
      inp.addEventListener('input', () => { s.subtitleScale = Number(inp.value); g.applySettings(); });
      row.appendChild(inp); m.appendChild(row);
    }
    {
      const codeLabel = (code) => {
        if (!code) return '未绑定';
        return code
          .replace(/^Key/, '')
          .replace(/^Digit/, '')
          .replace('Arrow', '方向')
          .replace('Space', '空格')
          .replace('Escape', 'Esc')
          .replace('Enter', '回车')
          .replace('Tab', 'Tab');
      };
      const actions = [
        ['attack', '攻击'], ['dodge', '闪避'], ['block', '格挡'], ['interact', '调查'],
        ['lamp', '提灯'], ['skill1', '镇邪技'], ['skill2', '秘术'], ['heal', '快捷药'],
        ['switch', '换武器'], ['inventory', '行囊'], ['journal', '札记'], ['pause', '暂停'],
      ];
      const box = el('div', 'keybox');
      box.appendChild(el('h3', null, '键盘改键'));
      box.appendChild(el('p', 'hint', '点击动作按钮后按下新按键。Esc 在等待改键时表示取消。'));
      for (const [action, label] of actions) {
        const row = el('div', 'srow bindrow');
        row.appendChild(el('label', null, label));
        const b = btn(codeLabel(s.keyBindings?.[action] || Input.primaryCode(action)), 'small bindbtn', () => {
          b.textContent = '按一个键...';
          const onKey = (ev) => {
            ev.preventDefault();
            ev.stopPropagation();
            if (ev.code !== 'Escape') {
              s.keyBindings = s.keyBindings || {};
              s.keyBindings[action] = ev.code;
              g.applySettings();
              g.saveSettings();
            }
            window.removeEventListener('keydown', onKey, true);
            this.settings(from);
          };
          window.addEventListener('keydown', onKey, true);
        });
        row.appendChild(b);
        box.appendChild(row);
      }
      box.appendChild(btn('恢复默认键位', 'danger wide', () => {
        s.keyBindings = {};
        g.applySettings();
        g.saveSettings();
        this.settings(from);
      }));
      m.appendChild(box);
    }
    {
      const row = el('div', 'srow');
      row.appendChild(el('label', null, t('set.hints')));
      const opts = [['off', t('set.hints.off')], ['std', t('set.hints.std')], ['strong', t('set.hints.strong')]];
      const b = btn('', 'small', () => {
        const i = opts.findIndex(o => o[0] === s.hints);
        s.hints = opts[(i + 1) % opts.length][0];
        b.textContent = opts.find(o => o[0] === s.hints)[1];
        g.applySettings();
      });
      b.textContent = opts.find(o => o[0] === s.hints)[1];
      row.appendChild(b);
      m.appendChild(row);
    }
    m.appendChild(btn(t('set.reset'), 'danger wide', () => {
      if (confirm(t('set.reset.confirm'))) { g.wipeAll(); }
    }));
    m.appendChild(btn(t('menu.back'), 'primary wide', () => {
      g.saveSettings();
      if (from === 'title') this.title(g.hasSave());
      else this.pause();
    }));
  },

  // ============ 对话 ============
  dialog(def, handlers = {}) {
    this.open = 'dialog';
    const g = this.g;
    const m = this._modal('dlgbox');
    const box = el('div', 'dlg paper');
    m.appendChild(box);
    let lastNode = null;

    const show = (nodeId) => {
      const node = def.nodes[nodeId];
      if (!node) { finish(null); return; }
      lastNode = node;
      if (node.set) for (const f of node.set) g.setFlag(f);
      if (node.give) for (const c of node.give) g.giveClue(c);
      box.innerHTML = '';
      if (node.sp) box.appendChild(el('div', 'speaker', node.sp));
      box.appendChild(el('div', 'dtext', node.text.replace(/\n/g, '<br>')));
      const opts = el('div', 'dopts');
      const avail = (node.opts || []).filter(o => {
        if (o.needItem && !g.hasWeaponBase(o.needItem)) return false;
        if (o.needFlag && !g.flag(o.needFlag)) return false;
        return true;
      });
      for (const o of avail) {
        opts.appendChild(btn(o.t, 'dopt', () => {
          if (o.set) for (const f of o.set) g.setFlag(f);
          if (o.give) for (const c of o.give) g.giveClue(c);
          if (o.choice) { finish(node, o.choice); return; }
          if (o.shop) { finish(node, null, true); return; }
          if (o.next) show(o.next);
          else finish(node);
        }));
      }
      box.appendChild(opts);
    };
    const finish = (node, choice = null, shop = false) => {
      this.closeModal(true);
      if (choice && handlers.onChoice) { handlers.onChoice(choice); return; }
      if (shop && handlers.onShop) { handlers.onShop(); return; }
      if (node && node.result && handlers.onResult) { handlers.onResult(node.result); return; }
      handlers.onClose && handlers.onClose(node);
    };
    show(typeof def.start === 'function' ? def.start(g) : def.start);
  },

  // 简单文本框
  textbox(text, onClose) {
    this.open = 'text';
    const m = this._modal('dlgbox');
    const box = el('div', 'dlg paper');
    box.appendChild(el('div', 'dtext', text.replace(/\n/g, '<br>')));
    const opts = el('div', 'dopts');
    opts.appendChild(btn('……', 'dopt', () => { this.closeModal(true); onClose && onClose(); }));
    box.appendChild(opts);
    m.appendChild(box);
  },

  // ============ 行囊 ============
  inventory() {
    this.open = 'inventory';
    const g = this.g;
    const m = this._modal('invbox paper');
    m.appendChild(el('h2', null, t('ui.inventory')));

    const wrap = el('div', 'invwrap');
    m.appendChild(wrap);
    const left = el('div', 'invleft');
    const right = el('div', 'invright');
    wrap.appendChild(left); wrap.appendChild(right);

    // 装备槽
    const eqRow = el('div', 'eqrow eqgrid');
    const slotNames = Object.fromEntries(EQUIP_SLOTS);
    for (const [slot] of EQUIP_SLOTS) {
      const it = g.equip[slot];
      const s = el('div', 'eqslot' + (it ? ' has' : ''));
      s.innerHTML = `<label>${slotNames[slot]}</label>` + (it ? `<img src="${Assets.url(it.icon)}"><span style="color:${RARITIES[it.rarity].col}">${it.name}</span>` : '<span class="empty">—</span>');
      if (it) s.addEventListener('click', () => showDetail(it, true));
      eqRow.appendChild(s);
    }
    left.appendChild(eqRow);

    // 状态摘要
    const st = g.pstats, agg = g.aggStats;
    left.appendChild(el('div', 'statsum',
      `生命 ${Math.round(st.hp)}/${st.maxhp} · 体力 ${Math.round(st.stam)}/${st.maxstam} · 理智 ${Math.round(st.san)}/${st.maxsan}<br>` +
      `灯油 ${Math.round(st.oil)}/${st.maxoil} · 阴蚀 ${Math.round(st.yin)} · 🪙 ${g.money}`));

    // 物品网格
    const grid = el('div', 'grid');
    left.appendChild(grid);
    const items = g.inventory;
    for (let i = 0; i < Math.max(18, items.length); i++) {
      const cell = el('div', 'cell');
      const it = items[i];
      if (it) {
        cell.classList.add('has');
        cell.style.borderColor = RARITIES[it.rarity].col + '66';
        cell.innerHTML = `<img src="${Assets.url(it.icon)}">` + (it.n > 1 ? `<b>${it.n}</b>` : '');
        cell.addEventListener('click', () => showDetail(it, false));
      }
      grid.appendChild(cell);
    }

    const showDetail = (it, equipped) => {
      right.innerHTML = '';
      const d = describeItem(it);
      right.appendChild(el('h3', null, `<span style="color:${d.col}">${d.title}</span> <small>${d.rarityName}</small>`));
      if (d.desc) right.appendChild(el('p', 'idesc', d.desc));
      for (const l of d.lines) right.appendChild(el('p', 'istat', l));
      if (d.story) right.appendChild(el('p', 'istory', '「' + d.story + '」'));
      // 对比当前
      if (!equipped && (it.kind === 'weapon' || it.kind === 'charm' || it.kind === 'lamp' || it.kind === 'gear')) {
        const slot = it.kind === 'gear' ? it.slot : it.kind;
        const cur = g.equip[slot];
        if (cur && cur.uid !== it.uid) {
          const cd = describeItem(cur);
          right.appendChild(el('p', 'cmp', `${t('ui.compare')}：<span style="color:${cd.col}">${cd.title}</span>`));
        }
        right.appendChild(btn(t('ui.equip'), 'primary wide', () => { g.equipItem(it); this.inventory(); }));
      }
      if (equipped) right.appendChild(el('p', 'cmp', '✓ ' + t('ui.equipped')));
      if (it.kind === 'use') {
        right.appendChild(btn(t('ui.use'), 'primary wide', () => {
          if (g.useItem(it)) this.inventory();
        }));
      }
      if (!equipped && !it.keyItem) {
        right.appendChild(btn(t('ui.drop'), 'danger wide', () => { g.dropItem(it); this.inventory(); }));
      }
    };
    right.appendChild(el('p', 'hint', '点击物品查看与装备。十六个槽位分别承担战斗、探索与风险取舍。'));

    m.appendChild(btn(t('ui.close') + ' (Esc)', 'wide', () => this.closeModal()));
  },

  // ============ 札记 ============
  journal(tab = 'quests') {
    this.open = 'journal';
    const g = this.g;
    const m = this._modal('jbox paper');
    m.appendChild(el('h2', null, t('ui.journal')));
    const tabs = el('div', 'tabs');
    m.appendChild(tabs);
    const body = el('div', 'jbody');
    m.appendChild(body);
    const tabDefs = [
      ['quests', '调查'], ['clues', t('ui.clues')], ['rules', t('ui.rules')],
      ['tapes', t('ui.tapes')], ['arts', t('ui.artifacts')],
    ];
    for (const [k, lab] of tabDefs) {
      const b = btn(lab, 'tab' + (tab === k ? ' on' : ''), () => this.journal(k));
      tabs.appendChild(b);
    }
    if (tab === 'quests') {
      if (!g.questLog?.length) body.appendChild(el('p', 'hint', '暂无线索推进。'));
      for (const q of [...(g.questLog || [])].reverse()) {
        const d = el('div', 'jentry');
        const time = q.t ? new Date(q.t).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }) : '';
        d.appendChild(el('h4', null, `${q.type || '记录'} <small>${time}</small>`));
        d.appendChild(el('p', null, q.text));
        body.appendChild(d);
      }
    } else if (tab === 'clues') {
      if (!g.clues.length) body.appendChild(el('p', 'hint', t('ui.none')));
      for (const cid of g.clues) {
        const c = CLUES[cid];
        if (!c) continue;
        const d = el('div', 'jentry');
        d.appendChild(el('h4', null, c.name));
        d.appendChild(el('p', null, c.text));
        body.appendChild(d);
      }
    } else if (tab === 'rules') {
      if (!g.rules.length) body.appendChild(el('p', 'hint', t('ui.none')));
      for (const rid of g.rules) {
        const r = RULES[rid];
        if (!r) continue;
        const d = el('div', 'jentry rule');
        d.appendChild(el('h4', null, '【规矩】' + r.name));
        d.appendChild(el('p', null, r.text));
        body.appendChild(d);
      }
    } else if (tab === 'tapes') {
      if (!g.tapes.length) body.appendChild(el('p', 'hint', t('ui.none')));
      for (const tid of g.tapes) {
        const tp = TAPES[tid];
        if (!tp) continue;
        const d = el('div', 'jentry');
        d.appendChild(el('h4', null, '📼 ' + tp.name));
        d.appendChild(btn(t('ui.play_tape'), 'small', () => this.tape(tp)));
        body.appendChild(d);
      }
    } else if (tab === 'arts') {
      const keys = Object.keys(g.artifacts);
      if (!keys.length) body.appendChild(el('p', 'hint', t('ui.none')));
      for (const k of keys) {
        const a = ARTIFACTS[k];
        const repaired = g.artifacts[k] === 'repaired';
        const d = el('div', 'jentry');
        d.appendChild(el('h4', null, `${a.name} <small>${repaired ? '✓ ' + t('ui.repaired') : '损坏'}</small>`));
        d.appendChild(el('p', 'hint', `${a.era} · ${a.material} · 出土：${a.found}`));
        d.appendChild(el('p', null, repaired ? a.lore : a.broken));
        if (repaired) d.appendChild(el('p', 'istat', a.gainText));
        body.appendChild(d);
      }
    }
    m.appendChild(btn(t('ui.close') + ' (Esc)', 'wide', () => this.closeModal()));
  },

  // ============ 商店 ============
  shop() {
    this.open = 'shop';
    const g = this.g;
    const m = this._modal('shopbox paper');
    m.appendChild(el('h2', null, '白事铺 · 林二叔'));
    m.appendChild(el('p', 'hint', `🪙 ${t('hud.money')}：${g.money}`));
    const list = el('div', 'shoplist');
    m.appendChild(list);
    for (const key of ['bandage', 'med', 'incense', 'oilcan', 'xiangzhu']) {
      const c = CONSUMABLES[key];
      const row = el('div', 'shoprow');
      row.appendChild(el('img', null, null)).src = Assets.url(c.icon);
      row.appendChild(el('div', 'shopinfo', `<b>${c.name}</b> <em>🪙${c.price}</em><br><small>${c.desc}</small>`));
      row.appendChild(btn(t('ui.buy'), 'small primary', () => {
        if (g.money < c.price) { this.toast(t('ui.shop_no_money')); AudioSys.sfx('error'); return; }
        g.money -= c.price;
        g.addItem('use', key);
        AudioSys.sfx('coin');
        m.querySelector('.hint').textContent = `🪙 ${t('hud.money')}：${g.money}`;
        this.updateHUD();
      }));
      list.appendChild(row);
    }
    m.appendChild(btn(t('ui.close'), 'wide', () => this.closeModal()));
  },

  // ============ 修复工作台 ============
  bench() {
    this.open = 'bench';
    const g = this.g;
    const m = this._modal('shopbox paper');
    m.appendChild(el('h2', null, '父亲的工作台 · 文物修复'));
    m.appendChild(el('p', 'hint', `🪙 ${g.money} ｜ 修复需要纸钱作材料费。修好的东西，会记得你。`));
    const list = el('div', 'shoplist');
    m.appendChild(list);
    const keys = Object.keys(g.artifacts);
    if (!keys.length) list.appendChild(el('p', 'hint', '（还没有可修复的文物。去更深处找找。）'));
    for (const k of keys) {
      const a = ARTIFACTS[k];
      const state = g.artifacts[k];
      const row = el('div', 'shoprow');
      row.appendChild(el('img', null, null)).src = Assets.url(a.icon);
      row.appendChild(el('div', 'shopinfo', `<b>${a.name}</b><br><small>${state === 'repaired' ? a.gainText : a.broken + `（费用 🪙${a.needs.money}）`}</small>`));
      if (state !== 'repaired') {
        row.appendChild(btn(t('ui.repair'), 'small primary', () => {
          if (g.money < a.needs.money) { this.toast(t('ui.shop_no_money')); return; }
          g.money -= a.needs.money;
          g.repairArtifact(k);
          this.bench();
        }));
      } else row.appendChild(el('span', 'okmark', '✓'));
      list.appendChild(row);
    }
    m.appendChild(btn(t('ui.close'), 'wide', () => this.closeModal()));
  },

  // ============ 线索墙（出行） ============
  clueboard() {
    this.open = 'clueboard';
    const g = this.g;
    const m = this._modal('boardbox paper');
    m.appendChild(el('h2', null, '线索墙'));
    m.appendChild(el('p', 'hint', '母亲在墙上钉满了剪报和手绘地图。去哪里？'));
    const list = el('div', 'shoplist');
    m.appendChild(list);
    const dests = [];
    if (g.flag('ch1_unlocked')) dests.push(['kujiacun', '哭嫁村', '手绘地图上被红笔圈了三圈的村子。磁带里说：先去看看那个村子。']);
    for (let ch = 2; ch <= 9; ch++) {
      const d = CAMPAIGN_CHAPTERS[ch];
      if (!d || !g.flag(`ch${ch}_unlocked`) || g.campaign.completed[ch]) continue;
      dests.push([d.mapId, `${d.sup} · ${d.title}`, `${d.summary}。${d.hazard.hint}`]);
    }
    if (!dests.length) list.appendChild(el('p', 'hint', '（线索还不够。先把老宅搜一遍——尤其是地窖。）'));
    for (const [mapId, name, desc] of dests) {
      const row = el('div', 'shoprow');
      row.appendChild(el('div', 'shopinfo', `<b>${name}</b><br><small>${desc}</small>`));
      row.appendChild(btn('出发', 'small primary', () => {
        this.closeModal(true);
        g.travel(mapId);
      }));
      list.appendChild(row);
    }
    m.appendChild(btn(t('ui.close'), 'wide', () => this.closeModal()));
  },

  // ============ 技能树 ============
  skills(active = 'explore') {
    this.open = 'skills';
    const g = this.g;
    const m = this._modal('jbox paper');
    m.appendChild(el('h2', null, `技能树 · 可用点数 ${g.skills.points}`));
    const tabs = el('div', 'tabs');
    for (const tree of Object.values(SKILL_TREES)) {
      tabs.appendChild(btn(tree.name, 'tab' + (active === tree.id ? ' on' : ''), () => this.skills(tree.id)));
    }
    m.appendChild(tabs);
    const body = el('div', 'skillgrid');
    const tree = SKILL_TREES[active];
    for (const node of tree.nodes) {
      const bought = g.skills.bought.includes(node.id);
      const card = el('div', `skillnode tier${node.tier}${bought ? ' bought' : ''}`);
      card.appendChild(el('h4', null, `${node.name} <small>阶 ${node.tier}</small>`));
      card.appendChild(el('p', null, node.desc));
      card.appendChild(btn(bought ? '已习得' : `学习 · ${node.cost} 点`, 'small' + (bought ? '' : ' primary'), () => {
        if (!g.buySkill(node.id)) this.toast('技能点不足，或需要先学习本树前置节点。');
        this.skills(active);
      }));
      body.appendChild(card);
    }
    m.appendChild(body);
    m.appendChild(btn(t('ui.close'), 'wide', () => this.closeModal()));
  },

  // ============ 老宅整修 ============
  camp() {
    this.open = 'camp';
    const g = this.g;
    const m = this._modal('shopbox paper');
    m.appendChild(el('h2', null, '陈家老宅 · 长期成长'));
    m.appendChild(el('p', 'hint', `纸钱 ${g.money}。修房子不是为了漂亮，是为了让活人有地方回来。`));
    const list = el('div', 'shoplist');
    for (const [id, up] of Object.entries(CAMP_UPGRADES)) {
      const done = !!g.campUpgrades[id];
      const row = el('div', 'shoprow');
      row.appendChild(el('div', 'shopinfo', `<b>${up.name}</b> <em>${done ? '已修复' : `纸钱 ${up.cost}`}</em><br><small>${up.desc}</small>`));
      if (!done) row.appendChild(btn('整修', 'small primary', () => {
        if (!g.buyCampUpgrade(id)) this.toast('纸钱不够。');
        this.camp();
      }));
      else row.appendChild(el('span', 'okmark', '✓'));
      list.appendChild(row);
    }
    m.appendChild(list);
    m.appendChild(btn(t('ui.close'), 'wide', () => this.closeModal()));
  },

  // ============ 章节回顾 ============
  archive() {
    this.open = 'archive';
    const g = this.g;
    const m = this._modal('jbox paper');
    m.appendChild(el('h2', null, '调查回顾'));
    const body = el('div', 'jbody');
    body.appendChild(el('div', 'jentry', `<h4>序章 · 雨夜归乡</h4><p>木盒、三副碗筷、母亲的磁带与老宅地窖把你引回槐阴县。</p>`));
    body.appendChild(el('div', 'jentry', `<h4>第一章 · 哭嫁村</h4><p>${g.campaign.completed[1] ? `已完成 · 选择：${g.campaign.choices[1]}` : '调查中'}</p>`));
    for (let ch = 2; ch <= 9; ch++) {
      const d = CAMPAIGN_CHAPTERS[ch];
      const done = g.campaign.completed[ch];
      const e = el('div', 'jentry');
      e.appendChild(el('h4', null, `${d.sup} · ${d.title} ${done ? '<small>✓ 已完成</small>' : ''}`));
      e.appendChild(el('p', null, done ? `${d.summary}。结算路线：${g.campaign.choices[ch] || g.campaign.ending || '最终选择'}` : (g.flag(`ch${ch}_unlocked`) ? d.objective : '尚未解锁')));
      body.appendChild(e);
    }
    m.appendChild(body);
    m.appendChild(btn(t('ui.close'), 'wide', () => this.closeModal()));
  },

  // ============ 磁带 ============
  tape(tp, onDone) {
    this.open = 'tape';
    const m = this._modal('tapebox');
    AudioSys.tapeNoise(true);
    const card = el('div', 'tape paper');
    m.appendChild(card);
    card.innerHTML = `
      <div class="cassette"><div class="reel r1"></div><div class="reel r2"></div><label>${tp.name}</label></div>
      <div class="tlines"></div>
    `;
    const linesBox = card.querySelector('.tlines');
    let i = 0;
    const next = () => {
      if (i < tp.lines.length) {
        const L = el('p', 'tline', tp.lines[i]);
        linesBox.appendChild(L);
        linesBox.scrollTop = linesBox.scrollHeight;
        requestAnimationFrame(() => L.classList.add('in'));
        i++;
        this._tapeTimer = setTimeout(next, 2400);
      } else {
        stopBtn.textContent = t('ui.close');
      }
    };
    const stopBtn = btn(t('tape.stop'), 'wide', () => {
      clearTimeout(this._tapeTimer);
      AudioSys.tapeNoise(false);
      this.closeModal(true);
      onDone && onDone();
    });
    card.appendChild(stopBtn);
    this._tapeTimer = setTimeout(next, 800);
  },

  // ============ 开场演出 ============
  cinematic(slides, onDone) {
    this.open = 'cine';
    const m = this._modal('cinebox');
    const txt = el('div', 'cinetext');
    m.appendChild(txt);
    const skip = btn(t('cine.skip'), 'skipbtn', () => finish());
    m.appendChild(skip);
    let i = 0, timer = null, finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      AudioSys.tapeNoise(false);
      this.closeModal(true);
      onDone && onDone();
    };
    const next = () => {
      if (i >= slides.length) { finish(); return; }
      const s = slides[i++];
      if (s.tape) AudioSys.tapeNoise(true); else AudioSys.tapeNoise(false);
      txt.classList.remove('in');
      setTimeout(() => {
        txt.innerHTML = s.text.replace(/\n/g, '<br>');
        txt.classList.toggle('tapeline', !!s.tape);
        txt.classList.add('in');
      }, 350);
      timer = setTimeout(next, s.delay * 1000 + 400);
    };
    m.addEventListener('click', (e) => { if (e.target === m) { clearTimeout(timer); next(); } });
    next();
  },

  // ============ 章节卡 ============
  chapterCard(card, onDone) {
    const d = el('div', 'chcard');
    d.innerHTML = `<small>${card.sup}</small><h1>${card.title}</h1><p>${card.sub}</p>`;
    document.body.appendChild(d);
    AudioSys.sfx('gong', { vol: 0.6 });
    requestAnimationFrame(() => d.classList.add('in'));
    setTimeout(() => {
      d.classList.remove('in');
      setTimeout(() => { d.remove(); onDone && onDone(); }, 900);
    }, 2800);
  },

  // ============ 死亡 ============
  death(onRespawn) {
    this.open = 'death';
    const m = this._modal('deathbox');
    m.appendChild(el('h1', null, t('death.title')));
    m.appendChild(el('p', null, t('death.hint')));
    setTimeout(() => {
      m.appendChild(btn(t('death.respawn'), 'primary wide', () => { this.closeModal(true); onRespawn(); }));
    }, 1200);
  },

  // ============ 结局 ============
  ending(endDef, epilogue, stats, onDone, finalGame = false) {
    this.open = 'ending';
    const m = this._modal('endbox');
    const inner = el('div', 'endinner');
    m.appendChild(inner);
    inner.appendChild(el('h2', 'endtitle', `${finalGame ? '最终结局' : '章节结算'} · ${endDef.title}`));
    const linesBox = el('div', 'endlines');
    inner.appendChild(linesBox);
    const allLines = [...endDef.text, '— · —', ...epilogue];
    let i = 0;
    const addLine = () => {
      if (i < allLines.length) {
        const p = el('p', 'endline', allLines[i++]);
        linesBox.appendChild(p);
        requestAnimationFrame(() => p.classList.add('in'));
        linesBox.scrollTop = linesBox.scrollHeight;
        setTimeout(addLine, 2300);
      } else showStats();
    };
    const showStats = () => {
      const min = Math.floor(stats.playSec / 60);
      inner.appendChild(el('div', 'endstats',
        `<h3>${finalGame ? '全篇结算' : t('ending.title')}</h3>` +
        `${t('ending.time')} ${min} 分 · ${t('ending.deaths')} ${stats.deaths} · ${t('ending.kills')} ${stats.kills}<br>` +
        `${t('ending.clues')} ${stats.clues} · ${t('ending.yin')} ${stats.yin}`));
      inner.appendChild(el('p', 'tbc', finalGame ? '——《盗墓往事》· 完——' : t('ending.tbc')));
      inner.appendChild(btn(finalGame ? '回到标题' : '回到老宅', 'primary wide', () => { this.closeModal(true); onDone(); }));
    };
    setTimeout(addLine, 600);
    // 提前跳过逐行
    m.addEventListener('click', (e) => {
      if (e.target === m || e.target === inner || e.target.classList.contains('endline')) {
        while (i < allLines.length) {
          const p = el('p', 'endline in', allLines[i++]);
          linesBox.appendChild(p);
        }
      }
    });
  },
};
