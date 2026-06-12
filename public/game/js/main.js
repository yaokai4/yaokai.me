// ============================================================
// main.js — 启动 / 资源预载 / 主循环
// ============================================================
import { Input, AudioSys, Assets, SaveSys, setLang } from './engine.js';
import { ART_LIST } from './data_world.js';
import { Game } from './game.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game');
const loadingBar = document.querySelector('#loading .lbar i');
const loadingBox = document.getElementById('loading');

async function boot() {
  setLang('zh');
  Input.init(canvas);

  await Assets.load(ART_LIST, (p) => {
    if (loadingBar) loadingBar.style.width = Math.round(p * 100) + '%';
  });

  const game = new Game(canvas);
  window.TBT = game; // 调试入口
  UI.init(game);
  game.applySettings();

  // 首次手势解锁音频
  const unlock = () => {
    AudioSys.init();
    game.applySettings();
    if (game.state === 'title') {
      AudioSys.music('title');
      AudioSys.ambient('rain', true, 0.7);
    }
  };
  window.addEventListener('pointerdown', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });

  game.toTitle();

  // 竖屏提示
  const rotateHint = document.getElementById('rotate');
  const checkOrient = () => {
    const portrait = window.innerHeight > window.innerWidth * 1.2;
    rotateHint.classList.toggle('show', portrait);
  };
  window.addEventListener('resize', checkOrient);
  checkOrient();

  // 主循环：固定步长更新 + rAF 渲染
  let last = performance.now();
  let acc = 0;
  const STEP = 1 / 60;
  function frame(now) {
    let dt = (now - last) / 1000;
    last = now;
    if (dt > 0.25) dt = 0.25; // 后台切回防爆
    acc += dt;
    let n = 0;
    while (acc >= STEP && n < 5) {
      game.update(STEP);
      acc -= STEP;
      n++;
    }
    game.draw(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

boot().catch(err => {
  console.error(err);
  if (loadingBox) loadingBox.innerHTML = '<p style="color:#c66">加载失败：' + (err && err.message) + '</p>';
});
