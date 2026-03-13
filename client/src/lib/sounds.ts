let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new AudioContext();
  }
  return audioCtx;
}

function playTone(freq: number, duration: number, type: OscillatorType = "sine", volume = 0.08, freqEnd?: number) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    if (freqEnd) {
      osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
    }
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + duration);
  } catch {}
}

export function playClick() {
  playTone(1800, 0.06, "square", 0.04);
  setTimeout(() => playTone(2400, 0.04, "square", 0.03), 30);
}

export function playExpand() {
  playTone(400, 0.15, "sine", 0.06, 800);
}

export function playCollapse() {
  playTone(800, 0.12, "sine", 0.05, 400);
}

export function playToggle() {
  playTone(1200, 0.05, "triangle", 0.05);
  setTimeout(() => playTone(1600, 0.05, "triangle", 0.04), 50);
}

export function playSave() {
  playTone(600, 0.08, "sine", 0.06);
  setTimeout(() => playTone(900, 0.08, "sine", 0.06), 80);
  setTimeout(() => playTone(1200, 0.1, "sine", 0.05), 160);
}

export function playEdit() {
  playTone(1000, 0.06, "triangle", 0.05);
  setTimeout(() => playTone(1400, 0.08, "triangle", 0.04), 60);
}

export function playTabSwitch() {
  playTone(2000, 0.04, "sine", 0.03);
  setTimeout(() => playTone(2600, 0.05, "sine", 0.03), 40);
}

export function playDotChange() {
  playTone(1500, 0.05, "triangle", 0.04, 2000);
}
