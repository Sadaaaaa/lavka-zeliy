import test from 'node:test';
import assert from 'node:assert/strict';
import { mix, isSuccess, matchPercent, bestMove, starsForAttempts, totalDrops, colorDistance } from '../js/engine.js';
import { LEVELS } from '../js/levels.js';

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

test('жёлтый и синий дают зелёный', () => {
  const [r, g, b] = mix({ sun: 1, dew: 1 });
  assert.ok(g > r && g > b, `получилось ${[r, g, b]}`);
});

test('рецепт каждого уровня проходит и укладывается в котёл', () => {
  for (const level of LEVELS) {
    assert.ok(totalDrops(level.recipe) <= level.capacity, level.id);
    assert.ok(Object.keys(level.recipe).every((id) => level.available.includes(id)), level.id);
    assert.equal(matchPercent(mix(level.recipe), level.target), 100, level.id);
  }
});

test('одна капля одного цвета никогда не решает уровень', () => {
  for (const level of LEVELS) {
    for (const id of level.available) {
      assert.ok(!isSuccess(mix({ [id]: 1 }), level.target), `${level.id}: ${id}`);
    }
  }
});

test('цвета зверей заметно отличаются друг от друга', () => {
  for (const a of LEVELS) {
    for (const b of LEVELS) {
      if (a.index < b.index) {
        assert.ok(colorDistance(a.target, b.target) > 10, `${a.id} и ${b.id}`);
      }
    }
  }
});

test('подсказки из пустого набора капель приводят к успеху на большинстве смесей', () => {
  for (const level of LEVELS) {
    const mixes = allMixes(level.available, level.capacity);
    const solved = mixes.filter((start) => {
      let drops = start;
      for (let step = 0; step < 12; step++) {
        if (isSuccess(mix(drops), level.target)) return true;
        const move = bestMove(drops, level.target, level.available, level.capacity);
        if (!move) return false;
        drops = { ...drops };
        if (move.type !== 'add') drops[move.id] -= 1;
        if (move.type === 'add') drops[move.id] = (drops[move.id] || 0) + 1;
        if (move.type === 'swap') drops[move.other] = (drops[move.other] || 0) + 1;
      }
      return false;
    });
    assert.ok(solved.length / mixes.length > 0.9, `${level.id}: ${solved.length}/${mixes.length}`);
  }
});

test('звёзды зависят от числа попыток', () => {
  assert.deepEqual([1, 2, 3, 4, 9].map(starsForAttempts), [3, 2, 2, 1, 1]);
});
