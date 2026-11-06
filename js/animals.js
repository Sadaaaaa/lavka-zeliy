// Оригинальные звери игры в виде SVG. Цвет задают CSS-переменные --fur и --belly.
const O = 'class="ol"'; // контур цветом шерсти
const F = 'class="fur ol"';
const B = 'class="belly ol"';
const INK = 'class="ink"'; // тёмная заливка без контура

const ear = (d) => `<path ${F} d="${d}"/>`;

const SPECIES = {
  fox: {
    back: ear('M52 92 L44 28 L96 62 Z') + ear('M148 92 L156 28 L104 62 Z') +
      `<path ${INK} d="M45 34 L52 48 L62 42 Z M155 34 L148 48 L138 42 Z"/>`,
    front: `<path ${B} d="M50 112 C70 100 90 104 100 120 C110 104 130 100 150 112 C142 142 120 156 100 156 C80 156 58 142 50 112 Z"/>`,
    nose: 'small',
  },
  frog: {
    back: `<circle ${F} cx="66" cy="62" r="24"/><circle ${F} cx="134" cy="62" r="24"/>`,
    eyes: 'top',
    mouth: 'wide',
  },
  cat: {
    back: ear('M56 82 L52 36 L92 60 Z') + ear('M144 82 L148 36 L108 60 Z'),
    front: `<path ${INK} d="M100 62 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1 Z"/>` +
      '<path class="line" d="M40 112 L68 116 M40 128 L68 124 M160 112 L132 116 M160 128 L132 124"/>',
    nose: 'small',
  },
  hare: {
    back: `<path ${F} d="M68 80 C52 40 56 6 72 6 C90 6 92 44 88 74 Z"/><path ${F} d="M132 80 C148 40 144 6 128 6 C110 6 108 44 112 74 Z"/>` +
      `<path ${B} d="M72 66 C64 42 66 20 73 20 C81 20 82 44 80 66 Z"/><path ${B} d="M128 66 C136 42 134 20 127 20 C119 20 118 44 120 66 Z"/>`,
    nose: 'small',
    teeth: true,
  },
  owl: {
    back: ear('M58 74 L46 34 L88 58 Z') + ear('M142 74 L154 34 L112 58 Z'),
    front: `<circle ${B} cx="74" cy="100" r="24"/><circle ${B} cx="126" cy="100" r="24"/>` +
      `<path ${INK} d="M92 116 L108 116 L100 132 Z"/>`,
    mouth: 'none',
  },
  hedgehog: {
    back: `<path ${F} d="M36 118 L22 104 L38 94 L24 74 L46 72 L38 50 L60 56 L60 32 L80 46 L90 22 L102 44 L118 24 L124 48 L146 34 L144 58 L166 52 L156 74 L178 78 L162 94 L178 106 L164 118 Z"/>`,
    front: `<ellipse ${B} cx="100" cy="128" rx="34" ry="22"/>`,
    nose: 'big',
  },
  mouse: {
    back: `<circle ${F} cx="52" cy="60" r="36"/><circle ${F} cx="148" cy="60" r="36"/>` +
      `<circle ${B} cx="52" cy="60" r="22"/><circle ${B} cx="148" cy="60" r="22"/>`,
    front: '<path class="line" d="M46 118 L72 122 M46 134 L72 130 M154 118 L128 122 M154 134 L128 130"/>',
    nose: 'small',
  },
  bear: {
    back: `<circle ${F} cx="58" cy="60" r="22"/><circle ${F} cx="142" cy="60" r="22"/>` +
      `<circle ${B} cx="58" cy="60" r="11"/><circle ${B} cx="142" cy="60" r="11"/>`,
    front: `<ellipse ${B} cx="100" cy="128" rx="30" ry="22"/>`,
    nose: 'big',
  },
  foal: {
    back: `<path ${F} d="M100 58 L92 6 L114 56 Z"/>` + ear('M58 78 L44 44 L82 56 Z') + ear('M142 78 L156 44 L118 56 Z'),
    front: `<path ${F} d="M74 58 C88 42 118 42 130 60 C118 54 112 72 100 62 C92 74 82 58 74 58 Z"/>` +
      `<ellipse ${B} cx="100" cy="134" rx="26" ry="18"/>`,
    nose: 'nostrils',
  },
  deer: {
    back: '<path class="line thick" d="M66 62 C60 44 48 40 40 22 M56 48 L34 46 M134 62 C140 44 152 40 160 22 M144 48 L166 46 M50 36 L62 20 M150 36 L138 20"/>' +
      ear('M52 92 L18 76 L52 70 Z') + ear('M148 92 L182 76 L148 70 Z'),
    front: `<circle ${B} cx="70" cy="74" r="5"/><circle ${B} cx="130" cy="74" r="5"/><circle ${B} cx="100" cy="62" r="5"/>` +
      `<ellipse ${B} cx="100" cy="134" rx="24" ry="16"/>`,
    nose: 'small',
  },
  whale: {
    back: `<path ${F} d="M34 110 C10 92 8 72 22 60 C34 72 44 80 54 88 Z"/><path ${F} d="M166 110 C190 92 192 72 178 60 C166 72 156 80 146 88 Z"/>` +
      '<path class="line" d="M100 54 V28 M100 34 C92 22 82 22 76 28 M100 34 C108 22 118 22 124 28"/>',
    front: `<path ${B} d="M46 130 C70 160 130 160 154 130 C130 142 70 142 46 130 Z"/>` +
      '<path class="line" d="M84 150 V140 M100 153 V142 M116 150 V140"/>',
    mouth: 'none',
  },
  dragon: {
    back: `<path ${F} d="M50 100 C18 96 6 68 12 44 L30 58 L38 38 L52 58 L62 76 Z"/><path ${F} d="M150 100 C182 96 194 68 188 44 L170 58 L162 38 L148 58 L138 76 Z"/>` +
      `<path ${B} d="M68 66 C62 44 66 30 76 22 C80 38 84 50 90 60 Z"/><path ${B} d="M132 66 C138 44 134 30 124 22 C120 38 116 50 110 60 Z"/>`,
    front: `<ellipse ${B} cx="100" cy="132" rx="32" ry="20"/>` +
      '<path class="line" d="M84 150 L88 158 L92 150 M108 150 L112 158 L116 150"/>',
    nose: 'nostrils',
  },
};

function eyes(kind) {
  const [lx, rx, y] = kind === 'top' ? [66, 134, 62] : [74, 126, 100];
  return `<g class="eyes-sad"><path class="line thick" d="M${lx - 10} ${y + 2} q10 8 20 0 M${rx - 10} ${y + 2} q10 8 20 0"/></g>
    <g class="eyes-happy"><circle ${INK} cx="${lx}" cy="${y}" r="9"/><circle ${INK} cx="${rx}" cy="${y}" r="9"/>
    <circle class="spark" cx="${lx + 3}" cy="${y - 3}" r="3"/><circle class="spark" cx="${rx + 3}" cy="${y - 3}" r="3"/></g>`;
}

function muzzle(sp) {
  let out = '';
  if (sp.nose === 'small') out += `<path ${INK} d="M93 120 h14 l-7 8 Z"/>`;
  if (sp.nose === 'big') out += `<ellipse ${INK} cx="100" cy="118" rx="10" ry="7"/>`;
  if (sp.nose === 'nostrils') out += `<circle ${INK} cx="90" cy="130" r="3.5"/><circle ${INK} cx="110" cy="130" r="3.5"/>`;
  if (sp.teeth) out += `<path class="tooth ol" d="M93 137 h14 v10 h-14 Z"/>`;
  const my = sp.nose === 'nostrils' ? 140 : 130;
  if (sp.mouth === 'wide') {
    out += '<path class="line mouth-sad" d="M64 138 Q100 118 136 138"/><path class="line mouth-happy" d="M60 118 Q100 158 140 118"/>';
  } else if (sp.mouth !== 'none') {
    out += `<path class="line mouth-sad" d="M88 ${my + 6} Q100 ${my - 4} 112 ${my + 6}"/><path class="line mouth-happy" d="M86 ${my} Q100 ${my + 12} 114 ${my}"/>`;
  }
  return out;
}

export function animalSvg(id) {
  const sp = SPECIES[id];
  const head = id === 'whale'
    ? `<ellipse ${F} cx="100" cy="108" rx="66" ry="56"/>`
    : `<ellipse ${F} cx="100" cy="106" rx="58" ry="52"/>`;
  return `<svg class="animal-svg" viewBox="0 0 200 180" aria-hidden="true"><g filter="url(#sketch)">
    ${sp.back}${head}${sp.front || ''}${eyes(sp.eyes)}${muzzle(sp)}
    <g class="cheeks"><circle cx="58" cy="124" r="9"/><circle cx="142" cy="124" r="9"/></g></g></svg>`;
}

export const lockedAnimalSvg = `<svg class="animal-svg" viewBox="0 0 200 180" aria-hidden="true"><g filter="url(#sketch)">
  <ellipse class="ghost" cx="100" cy="100" rx="58" ry="52"/><text class="ghost-mark" x="100" y="122" text-anchor="middle">?</text></g></svg>`;

export const cauldronSvg = `<svg class="cauldron-svg" viewBox="0 0 280 190" aria-hidden="true"><g filter="url(#sketch)">
  <path class="pot" d="M26 62 C22 136 62 176 140 176 C218 176 258 136 254 62 Z"/>
  <path class="pot" d="M70 170 L54 188 M210 170 L226 188"/>
  <path class="pot-handle" d="M22 76 C2 74 2 112 28 110 M258 76 C278 74 278 112 252 110"/>
  <ellipse class="liquid" cx="140" cy="62" rx="118" ry="44"/>
  <ellipse class="rim" cx="140" cy="62" rx="124" ry="48"/>
  </g>
  <g class="bubbles"><circle cx="100" cy="66" r="9"/><circle cx="168" cy="54" r="7"/><circle cx="136" cy="78" r="5"/></g>
</svg>`;

export function bottleSvg(colorCss, mystery) {
  const glass = mystery ? 'var(--ash)' : colorCss;
  return `<svg class="bottle-svg" viewBox="0 0 80 96" aria-hidden="true"><g filter="url(#sketch)">
    <path class="cork" d="M31 4 h18 v14 h-18 Z"/>
    <path class="glass-fill" style="fill:${glass}" d="M18 48 C8 58 8 88 24 90 H56 C72 88 72 58 62 48 Z"/>
    <path class="glass" d="M33 18 V36 C22 44 8 56 10 74 C12 88 22 92 40 92 C58 92 68 88 70 74 C72 56 58 44 47 36 V18 Z"/>
    ${mystery ? '<text class="mystery-mark" x="40" y="80" text-anchor="middle">?</text>' : ''}
  </g></svg>`;
}

export const dropSvg = (color) => `<svg viewBox="0 0 24 30" aria-hidden="true"><path style="fill:${color}" stroke="var(--graphite)" stroke-width="2" d="M12 2 C18 11 22 15 22 20 A10 9 0 0 1 2 20 C2 15 6 11 12 2 Z"/></svg>`;

export const blotSvg = `<svg class="blot-svg" viewBox="0 0 120 110" aria-hidden="true">
  <path class="blot" d="M60 6 C74 2 80 18 94 16 C112 16 116 34 108 46 C102 56 118 64 112 80 C106 96 88 88 78 96 C66 106 50 108 38 98 C28 90 10 96 6 78 C2 64 14 56 12 44 C10 28 22 14 38 16 C46 16 50 8 60 6 Z"/>
</svg>`;
