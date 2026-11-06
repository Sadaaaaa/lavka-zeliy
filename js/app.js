import {
  INGREDIENTS, mix, rgbCss, matchPercent, isSuccess, starsForAttempts, bestMove, totalDrops,
} from './engine.js';
import { LEVELS } from './levels.js';
import { animalSvg, lockedAnimalSvg, cauldronSvg, bottleSvg, dropSvg, blotSvg } from './animals.js';
import { sounds, setMuted } from './audio.js';

const SAVE_KEY = 'lavka-zeliy:v1';
const TITLE = 'Лавка зелий';
const EMPTY_LIQUID = '#d9d8dc';
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const app = document.getElementById('app');

const save = loadSave();
setMuted(save.muted);

function loadSave() {
  const fallback = { stars: {}, introSeen: false, muted: false };
  try {
    return { ...fallback, ...JSON.parse(localStorage.getItem(SAVE_KEY) || '{}') };
  } catch {
    return fallback;
  }
}

function persist() {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(save));
  } catch {
    // Приватный режим: прогресс просто не сохранится.
  }
}

const isCured = (level) => Boolean(save.stars[level.id]);
const curedCount = () => LEVELS.filter(isCured).length;
const firstOpenIndex = () => {
  const i = LEVELS.findIndex((level) => !isCured(level));
  return i === -1 ? LEVELS.length : i;
};
const furVars = (rgb) => `--fur:${rgbCss(rgb)};--belly:color-mix(in srgb, ${rgbCss(rgb)} 45%, white)`;

function starsText(count) {
  return '★'.repeat(count) + '☆'.repeat(3 - count);
}

function soundButton() {
  return `<button class="btn-icon" data-action="sound" aria-pressed="${!save.muted}"
    aria-label="${save.muted ? 'Включить звук' : 'Выключить звук'}">${save.muted ? 'Звук выкл.' : 'Звук вкл.'}</button>`;
}

// ——— Полка с очередью зверей ———

function renderShelf() {
  const open = firstOpenIndex();
  const title = [...TITLE].map((ch, i) => {
    const letterIndex = [...TITLE.slice(0, i)].filter((c) => c !== ' ').length;
    const level = LEVELS[letterIndex];
    const color = level && isCured(level) ? `style="color:${rgbCss(level.target)}"` : '';
    return ch === ' ' ? ' ' : `<span ${color}>${ch}</span>`;
  }).join('');

  const cards = LEVELS.map((level) => {
    const cured = isCured(level);
    const locked = level.index > open;
    const current = level.index === open;
    const art = locked ? lockedAnimalSvg : animalSvg(level.animal);
    const vars = cured ? `style="${furVars(level.target)}"` : '';
    const caption = locked ? '' : level.name;
    const status = cured ? `<span class="stars" aria-label="Звёзд: ${save.stars[level.id]}">${starsText(save.stars[level.id])}</span>`
      : current ? '<span class="stars next">Твоя очередь</span>' : '';
    return `<button class="portrait ${cured ? 'cured' : ''} ${current ? 'current' : ''}" data-level="${level.index}"
      ${locked ? 'disabled' : ''} ${vars}>
      <span class="portrait-art">${art}</span>
      ${caption ? `<span class="portrait-name">${caption}</span>` : ''}${status}</button>`;
  }).join('');

  const done = curedCount() === LEVELS.length;
  const summary = done
    ? 'Все звери снова цветные! Можно сварить любое зелье ещё раз и собрать все звёзды.'
    : curedCount() === 0
      ? 'Серая хмарь украла у зверей все цвета. Верни их зельями.'
      : `Цвет вернулся к зверям: ${curedCount()} из ${LEVELS.length}.`;

  app.innerHTML = `<main class="shelf">
    <header class="shelf-head">
      <h1 class="title">${title}</h1>
      <p class="summary">${summary}</p>
      ${soundButton()}
    </header>
    <div class="queue">${cards}</div>
    ${save.introSeen ? '' : `<div class="intro" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div class="intro-card">
        <h2 id="intro-title">Над лесом прошла серая хмарь</h2>
        <p>Она забрала цвета у всех волшебных зверей. Теперь они стоят в очереди к твоей лавке.</p>
        <p>Посмотри, какого цвета был зверь, смешай в котле такое же зелье и верни ему цвет.</p>
        <button class="btn primary" data-action="close-intro">Открыть лавку</button>
      </div></div>`}
  </main>`;
}

// ——— Варка зелья ———

let play = null;

function startLevel(index) {
  const level = LEVELS[index];
  play = { level, drops: {}, order: [], attempts: 0, revealed: false, busy: false, done: false };
  renderPlay();
}

// Пузырёк показывает ровно тот цвет, что будет в котле от одной его капли.
const bottleColor = (id) => rgbCss(mix({ [id]: 1 }));

function isHidden(id) {
  return play.level.mystery === id && !play.revealed;
}

function ingredientOf(id) {
  return isHidden(id) ? 'жидкости из загадочного пузырька' : INGREDIENTS[id].genitive;
}

function renderPlay() {
  const { level } = play;
  const bottles = level.available.map((id) => {
    const hidden = isHidden(id);
    const color = bottleColor(id);
    return `<div class="bottle-slot" data-slot="${id}">
      <button class="bottle" data-add="${id}" aria-label="Капнуть: ${hidden ? 'загадочный пузырёк' : INGREDIENTS[id].name}">
        ${bottleSvg(color, hidden)}
        <span class="bottle-name">${hidden ? '???' : INGREDIENTS[id].name}</span>
      </button>
      <button class="minus" data-remove="${id}" aria-label="Убрать каплю" hidden>−<span class="count"></span></button>
    </div>`;
  }).join('');

  app.innerHTML = `<main class="play" id="play">
    <header class="play-head">
      <button class="btn-icon" data-action="shelf">К очереди</button>
      <span class="attempts" id="attempts"></span>
      ${soundButton()}
    </header>
    <section class="patient">
      <div class="animal" id="animal">${animalSvg(level.animal)}</div>
      <div class="bubble">
        <h2>${level.name}</h2>
        <p>${level.says}</p>
        <div class="sample" style="--sample:${rgbCss(level.target)}">${blotSvg}<span>Такой цвет был у меня</span></div>
      </div>
    </section>
    <section class="brew">
      <div class="cauldron" id="cauldron">${cauldronSvg}<div class="falling" id="falling"></div></div>
      <div class="drop-row" id="drop-row" aria-label="Капли в котле"></div>
      <p class="message" id="message" role="status">${level.tip || 'Смешай зелье такого же цвета.'}</p>
    </section>
    <section class="controls" id="controls">
      <div class="bottles">${bottles}</div>
      <div class="actions">
        <button class="btn" data-action="empty" id="empty">Вылить</button>
        <button class="btn primary" data-action="brew" id="brew">Сварить</button>
      </div>
    </section>
  </main>`;
  updatePlay();
}

function updatePlay() {
  const { level, drops, order, attempts } = play;
  const current = mix(drops);
  const total = totalDrops(drops);
  const root = document.getElementById('play');
  root.style.setProperty('--liquid', current ? rgbCss(current) : EMPTY_LIQUID);

  document.getElementById('attempts').textContent = attempts === 0 ? 'Первая варка' : `Варок: ${attempts}`;

  const slots = [];
  for (let i = 0; i < level.capacity; i++) {
    const id = order[i];
    slots.push(id
      ? `<span class="slot filled">${dropSvg(isHidden(id) ? 'var(--ash)' : bottleColor(id))}</span>`
      : `<span class="slot">${dropSvg('transparent')}</span>`);
  }
  document.getElementById('drop-row').innerHTML = slots.join('');

  for (const id of level.available) {
    const slot = app.querySelector(`[data-slot="${id}"]`);
    const count = drops[id] || 0;
    const minus = slot.querySelector('.minus');
    minus.hidden = count === 0;
    minus.querySelector('.count').textContent = count;
    slot.querySelector('.bottle').disabled = total >= level.capacity;
  }
  document.getElementById('brew').disabled = total === 0;
  document.getElementById('empty').disabled = total === 0;
}

function addDrop(id) {
  if (play.busy || totalDrops(play.drops) >= play.level.capacity) return;
  const revealNow = play.level.mystery === id && !play.revealed;
  play.drops[id] = (play.drops[id] || 0) + 1;
  play.order.push(id);
  sounds.drop(play.order.length);
  if (revealNow) {
    play.revealed = true;
    const slot = app.querySelector(`[data-slot="${id}"] .bottle`);
    slot.innerHTML = `${bottleSvg(bottleColor(id), false)}<span class="bottle-name">${INGREDIENTS[id].name}</span>`;
    slot.setAttribute('aria-label', `Капнуть: ${INGREDIENTS[id].name}`);
  }
  animateDrop(id);
  updatePlay();
}

function animateDrop(id) {
  const falling = document.getElementById('falling');
  if (reducedMotion || !falling) return;
  const el = document.createElement('span');
  el.className = 'falling-drop';
  el.innerHTML = dropSvg(bottleColor(id));
  falling.append(el);
  el.addEventListener('animationend', () => el.remove());
}

function removeDrop(id) {
  if (play.busy || !play.drops[id]) return;
  play.drops[id] -= 1;
  if (play.drops[id] === 0) delete play.drops[id];
  play.order.splice(play.order.lastIndexOf(id), 1);
  sounds.pour();
  updatePlay();
}

function emptyCauldron() {
  if (play.busy) return;
  play.drops = {};
  play.order = [];
  sounds.pour();
  updatePlay();
}

function hintText() {
  const { drops, level } = play;
  const move = bestMove(drops, level.target, level.available, level.capacity);
  if (!move) return '';
  if (move.type === 'add') return `Подсказка: добавь каплю ${ingredientOf(move.id)}.`;
  if (move.type === 'remove') return `Подсказка: убери каплю ${ingredientOf(move.id)}.`;
  return `Подсказка: замени каплю ${ingredientOf(move.id)} на каплю ${ingredientOf(move.other)}.`;
}

function brew() {
  if (play.busy || totalDrops(play.drops) === 0) return;
  play.busy = true;
  play.attempts += 1;
  const root = document.getElementById('play');
  root.classList.add('brewing');
  sounds.brew();
  setTimeout(() => {
    root.classList.remove('brewing');
    play.busy = false;
    const current = mix(play.drops);
    if (isSuccess(current, play.level.target)) finishLevel(current);
    else failBrew(current);
  }, reducedMotion ? 150 : 900);
}

function failBrew(current) {
  const percent = matchPercent(current, play.level.target);
  const animal = document.getElementById('animal');
  animal.classList.remove('sneeze');
  void animal.offsetWidth; // перезапуск анимации
  animal.classList.add('sneeze');
  sounds.fail();
  const reaction = percent >= 75 ? 'Совсем близко!' : percent >= 45 ? 'Зверь чихнул. Цвет пока другой.' : 'Зверь принюхался и отвернулся.';
  const hint = play.attempts >= 2 ? ` ${hintText()}` : '';
  document.getElementById('message').textContent = `Совпало ${percent}%. ${reaction}${hint}`;
  updatePlay();
}

function finishLevel(current) {
  const { level, attempts } = play;
  const stars = starsForAttempts(attempts);
  save.stars[level.id] = Math.max(save.stars[level.id] || 0, stars);
  persist();
  play.done = true;
  sounds.success();

  const root = document.getElementById('play');
  root.classList.add('cured');
  document.getElementById('animal').setAttribute('style', furVars(level.target));
  document.getElementById('message').textContent = `Совпало ${matchPercent(current, level.target)}%. Цвет вернулся!`;

  const next = LEVELS[level.index + 1];
  const allCured = curedCount() === LEVELS.length;
  document.getElementById('controls').innerHTML = `<div class="reward">
    <p class="reward-stars" aria-label="Звёзд: ${stars}">${starsText(stars)}</p>
    <p class="reward-text">${allCured ? 'Хмарь ушла: все звери снова цветные!' : stars < 3 ? 'С первой варки будет три звезды.' : 'С первой варки! Лучше не бывает.'}</p>
    <div class="actions">
      <button class="btn" data-level="${level.index}">Ещё раз</button>
      ${next ? `<button class="btn primary" data-level="${next.index}">Следующий зверь</button>`
        : '<button class="btn primary" data-action="shelf">К очереди</button>'}
    </div></div>`;
}

// ——— События ———

app.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target || target.disabled) return;
  const { action, level, add, remove } = target.dataset;
  if (add) addDrop(add);
  else if (remove) removeDrop(remove);
  else if (level !== undefined) startLevel(Number(level));
  else if (action === 'brew') brew();
  else if (action === 'empty') emptyCauldron();
  else if (action === 'shelf') { play = null; renderShelf(); }
  else if (action === 'close-intro') { save.introSeen = true; persist(); renderShelf(); }
  else if (action === 'sound') {
    save.muted = !save.muted;
    setMuted(save.muted);
    persist();
    target.setAttribute('aria-pressed', String(!save.muted));
    target.setAttribute('aria-label', save.muted ? 'Включить звук' : 'Выключить звук');
    target.textContent = save.muted ? 'Звук выкл.' : 'Звук вкл.';
  }
});

// Быстрые нажатия на пузырьки не должны увеличивать страницу в Safari.
document.addEventListener('dblclick', (event) => event.preventDefault());

renderShelf();

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
