// Короткие звуки, синтезированные на лету: своих аудиофайлов в игре нет.
let context = null;
let muted = false;

export function setMuted(value) {
  muted = value;
}

function ctx() {
  if (!context) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function tone(freq, start, duration, { type = 'sine', gain = 0.16, slideTo } = {}) {
  const ac = ctx();
  if (!ac || muted) return;
  const t = ac.currentTime + start;
  const osc = ac.createOscillator();
  const amp = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + duration);
  amp.gain.setValueAtTime(gain, t);
  amp.gain.exponentialRampToValueAtTime(0.001, t + duration);
  osc.connect(amp).connect(ac.destination);
  osc.start(t);
  osc.stop(t + duration);
}

export const sounds = {
  drop(step = 0) {
    tone(620 + step * 50, 0, 0.14, { slideTo: 1100 + step * 60 });
  },
  pour() {
    tone(420, 0, 0.2, { slideTo: 180, type: 'triangle' });
  },
  brew() {
    [0, 0.14, 0.3, 0.44].forEach((t, i) => tone(180 + i * 45, t, 0.12, { type: 'triangle', slideTo: 340 + i * 40 }));
  },
  success() {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.11, 0.32, { type: 'triangle', gain: 0.17 }));
  },
  fail() {
    tone(300, 0, 0.26, { type: 'triangle', slideTo: 190 });
  },
};
