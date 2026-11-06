// Чистая логика игры: смешивание цветов, сравнение, подсказки, звёзды.
// Без DOM, чтобы проверять в Node (см. tests/).

export const INGREDIENTS = {
  ember: { name: 'Огнецвет', genitive: 'огнецвета', rgb: [232, 44, 66] },
  sun: { name: 'Пыльца', genitive: 'пыльцы', rgb: [255, 214, 30] },
  dew: { name: 'Роса', genitive: 'росы', rgb: [36, 104, 240] },
  milk: { name: 'Молоко', genitive: 'молока', rgb: [252, 250, 245] },
  shade: { name: 'Тень', genitive: 'тени', rgb: [58, 44, 80] },
};

export const SUCCESS_MIN_PERCENT = 90;
const SATURATION_BOOST = 1.3;

export function totalDrops(drops) {
  return Object.values(drops).reduce((sum, n) => sum + n, 0);
}

// Смешиваем как краски, а не как свет: среднее геометрическое каналов даёт
// привычное «жёлтый + синий = зелёный».
export function mix(drops) {
  const total = totalDrops(drops);
  if (total === 0) return null;
  const rgb = [0, 1, 2].map((channel) => {
    let logSum = 0;
    for (const [id, count] of Object.entries(drops)) {
      logSum += count * Math.log(INGREDIENTS[id].rgb[channel]);
    }
    return Math.exp(logSum / total);
  });
  const gray = (rgb[0] + rgb[1] + rgb[2]) / 3;
  return rgb.map((c) => Math.round(clamp(gray + (c - gray) * SATURATION_BOOST, 0, 255)));
}

export function rgbCss(rgb) {
  return `rgb(${rgb[0]} ${rgb[1]} ${rgb[2]})`;
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v));
}

function toLab([r, g, b]) {
  const lin = [r, g, b].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const x = (0.4124 * lin[0] + 0.3576 * lin[1] + 0.1805 * lin[2]) / 0.95047;
  const y = 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
  const z = (0.0193 * lin[0] + 0.1192 * lin[1] + 0.9505 * lin[2]) / 1.08883;
  const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
  return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

export function colorDistance(a, b) {
  const la = toLab(a);
  const lb = toLab(b);
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]);
}

// Проценты, которые видит игрок. Точное совпадение = 100.
export function matchPercent(current, target) {
  if (!current) return 0;
  return Math.round(clamp(100 - colorDistance(current, target) * 2, 0, 100));
}

export function isSuccess(current, target) {
  return matchPercent(current, target) >= SUCCESS_MIN_PERCENT;
}

export function starsForAttempts(attempts) {
  if (attempts <= 1) return 3;
  if (attempts <= 3) return 2;
  return 1;
}

function allMixes(available, capacity) {
  const result = [];
  const walk = (i, left, drops) => {
    if (i === available.length) {
      if (totalDrops(drops) > 0) result.push(drops);
      return;
    }
    for (let n = 0; n <= left; n++) walk(i + 1, left - n, { ...drops, [available[i]]: n });
  };
  walk(0, capacity, {});
  return result;
}

// Следующий шаг подсказки: идём к ближайшей по числу капель подходящей смеси.
// Поэтому подсказки всегда приводят к решению и не застревают.
export function bestMove(drops, target, available, capacity) {
  const stepsTo = (mixture) => available.reduce(
    (sum, id) => sum + Math.abs((mixture[id] || 0) - (drops[id] || 0)), 0,
  );
  const goal = allMixes(available, capacity)
    .filter((mixture) => isSuccess(mix(mixture), target))
    .reduce((best, mixture) => (!best || stepsTo(mixture) < stepsTo(best) ? mixture : best), null);
  if (!goal) return null;

  const change = (id) => (goal[id] || 0) - (drops[id] || 0);
  const add = available.filter((id) => change(id) > 0).sort((a, b) => change(b) - change(a))[0];
  const remove = available.filter((id) => change(id) < 0).sort((a, b) => change(a) - change(b))[0];
  if (add && remove) return { type: 'swap', id: remove, other: add };
  if (add) return { type: 'add', id: add };
  if (remove) return { type: 'remove', id: remove };
  return null;
}
