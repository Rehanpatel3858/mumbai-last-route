// Dynamic Web Audio Synth Engine - mumbai-last-route
// Generates rain, city rumble, footsteps, thunder, dynamic music, and SFX procedurally in real-time.

let ctx: AudioContext | null = null;

// Gain Nodes for volume control
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let ambienceGain: GainNode | null = null;

// Audio Configuration States
let masterVol = 0.6;
let musicVol = 0.5;
let sfxVol = 0.6;
let ambienceVol = 0.5;

let musicEnabled = true;
let sfxEnabled = true;
let ambienceEnabled = true;

// Active Synthesized Sources
let rainNode1: AudioBufferSourceNode | null = null;
let rainNode2: AudioBufferSourceNode | null = null;
let cityRumbleNode: AudioBufferSourceNode | null = null;
let rainGain1: GainNode | null = null;
let rainGain2: GainNode | null = null;
let cityRumbleGain: GainNode | null = null;

// Music Sequencer States
let seqTimerId: number | null = null;
let currentStep = 0;
let nextNoteTime = 0;
const scheduleAheadTime = 0.1; // seconds
const tempo = 110; // BPM
const stepDuration = 60 / tempo / 4; // 16th notes
let isMusicPlaying = false;
let currentFloodLevel = 10;
let isPlayerInSafeZone = false;

// Shared Noise Buffer (reused to avoid memory leaks)
let noiseBuffer: AudioBuffer | null = null;

// Setup AudioContext and node tree
function ensure(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    try {
      const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      ctx = new AC();
      
      // Node Graph
      masterGain = ctx.createGain();
      musicGain = ctx.createGain();
      sfxGain = ctx.createGain();
      ambienceGain = ctx.createGain();

      masterGain.gain.setValueAtTime(masterVol, ctx.currentTime);
      musicGain.gain.setValueAtTime(musicEnabled ? musicVol : 0, ctx.currentTime);
      sfxGain.gain.setValueAtTime(sfxEnabled ? sfxVol : 0, ctx.currentTime);
      ambienceGain.gain.setValueAtTime(ambienceEnabled ? ambienceVol : 0, ctx.currentTime);

      musicGain.connect(masterGain);
      sfxGain.connect(masterGain);
      ambienceGain.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Create reusable 2-second noise buffer
      const sampleRate = ctx.sampleRate;
      const bufferLen = sampleRate * 2.0;
      noiseBuffer = ctx.createBuffer(1, bufferLen, sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferLen; i++) {
        data[i] = Math.random() * 2 - 1;
      }
    } catch (e) {
      console.warn('Web Audio init failed:', e);
      ctx = null;
    }
  }
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }
  return ctx;
}

export function resumeAudio() {
  ensure();
}

// ---------------- Settings APIs ----------------

export function setVolume(type: 'master' | 'music' | 'sfx' | 'ambience', val: number) {
  ensure();
  const c = ctx;
  if (!c) return;

  const t = c.currentTime;
  switch (type) {
    case 'master':
      masterVol = val;
      masterGain?.gain.setTargetAtTime(val, t, 0.05);
      break;
    case 'music':
      musicVol = val;
      if (musicEnabled) musicGain?.gain.setTargetAtTime(val, t, 0.05);
      break;
    case 'sfx':
      sfxVol = val;
      if (sfxEnabled) sfxGain?.gain.setTargetAtTime(val, t, 0.05);
      break;
    case 'ambience':
      ambienceVol = val;
      if (ambienceEnabled) ambienceGain?.gain.setTargetAtTime(val, t, 0.05);
      break;
  }
}

export function setToggle(type: 'music' | 'sfx' | 'ambience', enabled: boolean) {
  ensure();
  const c = ctx;
  if (!c) return;

  const t = c.currentTime;
  switch (type) {
    case 'music':
      musicEnabled = enabled;
      musicGain?.gain.setTargetAtTime(enabled ? musicVol : 0, t, 0.05);
      break;
    case 'sfx':
      sfxEnabled = enabled;
      sfxGain?.gain.setTargetAtTime(enabled ? sfxVol : 0, t, 0.05);
      break;
    case 'ambience':
      ambienceEnabled = enabled;
      ambienceGain?.gain.setTargetAtTime(enabled ? ambienceVol : 0, t, 0.05);
      break;
  }
}

// Getters to restore settings state in UI
export function getAudioState() {
  return {
    masterVol,
    musicVol,
    sfxVol,
    ambienceVol,
    musicEnabled,
    sfxEnabled,
    ambienceEnabled,
  };
}

// ---------------- Synthesizer Helpers ----------------

type ToneOpts = {
  freq: number;
  dur?: number;
  type?: OscillatorType;
  vol?: number;
  attack?: number;
  release?: number;
  sweepTo?: number;
  dest?: AudioNode;
};

function tone(o: ToneOpts) {
  const c = ensure();
  if (!c) return;
  
  const destNode = o.dest ?? sfxGain;
  if (!destNode) return;

  const now = c.currentTime;
  const osc = c.createOscillator();
  const g = c.createGain();

  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, now);
  if (o.sweepTo) osc.frequency.exponentialRampToValueAtTime(Math.max(1, o.sweepTo), now + (o.dur ?? 0.2));

  const vol = o.vol ?? 0.3;
  const atk = o.attack ?? 0.005;
  const rel = o.release ?? 0.08;

  g.gain.setValueAtTime(0.0001, now);
  g.gain.linearRampToValueAtTime(vol, now + atk);
  g.gain.setValueAtTime(vol, now + (o.dur ?? 0.2));
  g.gain.exponentialRampToValueAtTime(0.0001, now + (o.dur ?? 0.2) + rel);

  osc.connect(g);
  g.connect(destNode);
  
  osc.start(now);
  osc.stop(now + (o.dur ?? 0.2) + rel + 0.02);
}

// Generates a short filtered noise burst
function noiseSfx(dur: number, vol = 0.2, filterFreq = 1200, type: BiquadFilterType = 'lowpass') {
  const c = ensure();
  if (!c || !noiseBuffer || !sfxGain) return;

  const now = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;

  const filter = c.createBiquadFilter();
  filter.type = type;
  filter.frequency.setValueAtTime(filterFreq, now);

  const gainNode = c.createGain();
  gainNode.gain.setValueAtTime(vol, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(sfxGain);

  src.start(now);
  src.stop(now + dur + 0.02);
}

// ---------------- Ambience Synthesizer ----------------

export function startRain() {
  const c = ensure();
  if (!c || !noiseBuffer || !ambienceGain) return;

  if (rainNode1) return; // already playing

  const t = c.currentTime;

  // Soft rain layer (highpassed noise)
  rainNode1 = c.createBufferSource();
  rainNode1.buffer = noiseBuffer;
  rainNode1.loop = true;
  const rainFilter1 = c.createBiquadFilter();
  rainFilter1.type = 'highpass';
  rainFilter1.frequency.setValueAtTime(1400, t);
  rainGain1 = c.createGain();
  rainGain1.gain.setValueAtTime(0.045, t); // Reduced by 45%
  rainNode1.connect(rainFilter1);
  rainFilter1.connect(rainGain1);
  rainGain1.connect(ambienceGain);
  rainNode1.start(t);

  // Heavy storm texture layer (bandpassed noise)
  rainNode2 = c.createBufferSource();
  rainNode2.buffer = noiseBuffer;
  rainNode2.loop = true;
  const rainFilter2 = c.createBiquadFilter();
  rainFilter2.type = 'bandpass';
  rainFilter2.frequency.setValueAtTime(800, t);
  rainGain2 = c.createGain();
  rainGain2.gain.setValueAtTime(0.01, t); // Reduced by 50%
  rainNode2.connect(rainFilter2);
  rainFilter2.connect(rainGain2);
  rainGain2.connect(ambienceGain);
  rainNode2.start(t);

  // City rumble (lowpass noise + low drone)
  cityRumbleNode = c.createBufferSource();
  cityRumbleNode.buffer = noiseBuffer;
  cityRumbleNode.loop = true;
  const rumbleFilter = c.createBiquadFilter();
  rumbleFilter.type = 'lowpass';
  rumbleFilter.frequency.setValueAtTime(150, t);
  cityRumbleGain = c.createGain();
  cityRumbleGain.gain.setValueAtTime(0.05, t);
  cityRumbleNode.connect(rumbleFilter);
  rumbleFilter.connect(cityRumbleGain);
  cityRumbleGain.connect(ambienceGain);
  cityRumbleNode.start(t);
  
  updateAmbienceLayers();
}

export function stopRain() {
  try {
    rainNode1?.stop();
    rainNode2?.stop();
    cityRumbleNode?.stop();
  } catch {}
  rainNode1 = null;
  rainNode2 = null;
  cityRumbleNode = null;
}

function updateAmbienceLayers() {
  const c = ctx;
  if (!c) return;

  const t = c.currentTime;
  const floodRatio = currentFloodLevel / 100;

  // Rain gains increase with flood levels (reduced scaled values)
  // Soft rain goes from 0.045 to 0.085
  rainGain1?.gain.setTargetAtTime(0.045 + floodRatio * 0.04, t, 0.5);
  // Heavy rain texture goes from 0.01 to 0.10
  rainGain2?.gain.setTargetAtTime(0.01 + floodRatio * 0.09, t, 0.5);
  // City rumble drops to zero as city floods and goes silent
  cityRumbleGain?.gain.setTargetAtTime(Math.max(0, 0.05 * (1 - floodRatio * 1.2)), t, 0.5);
}

// ---------------- Footsteps ----------------

export function playFootstep(flood: number, sprinting: boolean) {
  const c = ensure();
  if (!c || !sfxGain) return;

  const now = c.currentTime;
  const volume = sprinting ? 0.35 : 0.22;
  const pitchVariation = 0.9 + Math.random() * 0.25; // timing/pitch variety

  // 1. Shoe impact (low thud)
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(110 * pitchVariation, now);
  osc.frequency.exponentialRampToValueAtTime(30, now + 0.06);

  g.gain.setValueAtTime(volume * 0.5, now);
  g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

  osc.connect(g);
  g.connect(sfxGain);
  osc.start(now);
  osc.stop(now + 0.08);

  // 2. Splash (noise burst)
  // Low flood -> short crisp wet splash
  // High flood -> longer, heavier slosh
  const splashDur = 0.06 + (flood / 100) * 0.14;
  const splashVol = volume * (0.4 + (flood / 100) * 0.8);
  const filterCutoff = Math.max(400, 1600 - (flood / 100) * 1000); // lower cutoff (deeper) as flood increases

  noiseSfx(splashDur, splashVol, filterCutoff * pitchVariation, 'bandpass');
}

export function playEffort(intensity: 'walk' | 'sprint' | 'deep') {
  const c = ensure();
  if (!c || !noiseBuffer || !sfxGain || !sfxEnabled) return;

  const now = c.currentTime;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;

  const filter = c.createBiquadFilter();
  filter.type = 'bandpass';

  const gainNode = c.createGain();

  let dur = 0.15;
  let vol = 0.05;
  let freqStart = 700;
  let freqEnd = 400;

  if (intensity === 'sprint') {
    dur = 0.22;
    vol = 0.09;
    freqStart = 500;
    freqEnd = 300;
  } else if (intensity === 'deep') {
    dur = 0.3;
    vol = 0.12;
    freqStart = 400;
    freqEnd = 250;
    // Add a low voice hum for water exertion
    tone({ freq: 85, dur: 0.18, type: 'triangle', vol: 0.08, release: 0.1 });
  }

  // Add random pitch pitchVariation
  const pv = 0.9 + Math.random() * 0.2;
  filter.frequency.setValueAtTime(freqStart * pv, now);
  filter.frequency.exponentialRampToValueAtTime(freqEnd * pv, now + dur);

  gainNode.gain.setValueAtTime(vol, now);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, now + dur);

  src.connect(filter);
  filter.connect(gainNode);
  gainNode.connect(sfxGain);

  src.start(now);
  src.stop(now + dur + 0.02);
}

export function playHeartbeat() {
  const c = ensure();
  if (!c || !sfxGain || !sfxEnabled) return;
  const now = c.currentTime;
  
  // Double-beat "lub-dub" low sine thump
  tone({ freq: 65, dur: 0.12, type: 'sine', vol: 0.28, release: 0.1 });
  setTimeout(() => {
    tone({ freq: 55, dur: 0.16, type: 'sine', vol: 0.26, release: 0.12 });
  }, 180);
}

// ---------------- Thunder & Lightning ----------------

export function triggerLightningThunder() {
  const c = ensure();
  if (!c) return;

  // Delayed thunder rumble to simulate distance
  const distanceDelay = 0.2 + Math.random() * 1.1; 
  
  setTimeout(() => {
    const c2 = ensure();
    if (!c2 || !sfxGain) return;

    const t = c2.currentTime;
    
    // Choose thunder variation
    const thunderType = Math.random();
    let vol = 0.25;
    let dur = 1.8;
    let cutoff = 250;

    if (thunderType < 0.2) {
      // Strong close thunder
      vol = 0.45;
      dur = 2.8;
      cutoff = 380;
      // Add heavy sharp crack
      tone({ freq: 80, dur: 0.15, type: 'sawtooth', vol: 0.2, release: 0.2 });
    } else if (thunderType < 0.6) {
      // Medium thunder
      vol = 0.28;
      dur = 2.0;
      cutoff = 220;
    } else {
      // Distant rumble
      vol = 0.16;
      dur = 3.5;
      cutoff = 100;
    }

    // Synthesize low-frequency thunder rumble
    const rumble = c2.createOscillator();
    const rumbleGain = c2.createGain();
    rumble.type = 'triangle';
    rumble.frequency.setValueAtTime(45, t);
    rumble.frequency.linearRampToValueAtTime(20, t + dur);

    rumbleGain.gain.setValueAtTime(vol * 0.5, t);
    rumbleGain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    rumble.connect(rumbleGain);
    rumbleGain.connect(sfxGain);
    rumble.start(t);
    rumble.stop(t + dur + 0.1);

    // Filtered noise tail
    if (noiseBuffer) {
      const src = c2.createBufferSource();
      src.buffer = noiseBuffer;
      const filt = c2.createBiquadFilter();
      filt.type = 'lowpass';
      filt.frequency.setValueAtTime(cutoff, t);
      const ng = c2.createGain();
      ng.gain.setValueAtTime(vol, t);
      ng.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      
      src.connect(filt);
      filt.connect(ng);
      ng.connect(sfxGain);
      src.start(t);
      src.stop(t + dur + 0.1);
    }
  }, distanceDelay * 1000);
}

// ---------------- Dynamic Synth Sequencer ----------------

export function setFloodLevel(level: number) {
  currentFloodLevel = level;
  updateAmbienceLayers();
}

function playNote(freq: number, type: OscillatorType, dur: number, vol: number, time: number) {
  const c = ctx;
  if (!c || !musicGain) return;

  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, time);

  g.gain.setValueAtTime(0.0001, time);
  g.gain.linearRampToValueAtTime(vol, time + 0.02);
  g.gain.setValueAtTime(vol, time + dur - 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, time + dur);

  osc.connect(g);
  g.connect(musicGain);
  osc.start(time);
  osc.stop(time + dur + 0.05);
}

// Scheduler for procedural music tracks
function scheduler() {
  const c = ctx;
  if (!c) return;

  while (nextNoteTime < c.currentTime + scheduleAheadTime) {
    scheduleStep(currentStep, nextNoteTime);
    nextNoteTime += stepDuration;
    currentStep = (currentStep + 1) % 16;
  }
}

// Bhairavi-inspired dark/emergency industrial notes (C Minor / Db Tension)
// Bass line (Tense drone)
const bassScale = [65.41, 65.41, 69.30, 65.41, 58.27, 58.27, 65.41, 65.41]; // C2, Db2, C2, Bb1
// Arpeggios (Tension Arp)
const arpScale = [130.81, 155.56, 196.00, 207.65, 277.18, 311.13, 261.63, 196.00]; // C3, Eb3, G3, Ab3, Db4...

function scheduleStep(step: number, time: number) {
  // 1. Dark Bass Drone (Pulsing every 4 steps - quarter note beats)
  if (step % 4 === 0) {
    const bassIdx = Math.floor(step / 4) % bassScale.length;
    let freq = bassScale[bassIdx];
    if (isPlayerInSafeZone) {
      freq = 65.41; // Rest on peaceful C major drone in safe zone
    }
    // Deep heavy triangle drone
    const vol = isPlayerInSafeZone ? 0.08 : 0.16;
    playNote(freq, 'triangle', stepDuration * 3.8, vol, time);
  }

  if (isPlayerInSafeZone) {
    // Peace/relieving motif (calm, slow notes)
    if (step === 0) {
      playNote(261.63, 'sine', stepDuration * 6, 0.04, time); // C4
    } else if (step === 8) {
      playNote(329.63, 'sine', stepDuration * 6, 0.04, time); // E4 (Major third!)
    }
    return; // Skip tension arps and alerts
  }

  // 2. Rhythmic Arpeggiator (Medium flood level >30%)
  if (currentFloodLevel > 30) {
    const playArp = (currentFloodLevel > 70) ? (step % 2 === 0) : (step % 4 === 0);
    if (playArp) {
      const note = arpScale[step % arpScale.length];
      const vol = (currentFloodLevel > 70) ? 0.05 : 0.035;
      playNote(note, 'sine', stepDuration * 1.5, vol, time);
    }
  }

  // 3. Emergency Ticking Pulse (High flood level >70%)
  if (currentFloodLevel > 70) {
    if (step % 4 === 2) {
      // 8th note emergency alert tick
      playNote(880, 'square', 0.03, 0.02, time);
    }
  }

  // 4. Critical Alarm Siren (Critical flood level >90%)
  if (currentFloodLevel > 90) {
    if (step === 0 || step === 8) {
      // Slow sweeps (Siren)
      const c = ctx;
      if (c && musicGain) {
        const osc = c.createOscillator();
        const g = c.createGain();
        osc.type = 'sawtooth';
        
        const duration = stepDuration * 7.5;
        osc.frequency.setValueAtTime(440, time);
        osc.frequency.exponentialRampToValueAtTime(660, time + duration * 0.5);
        osc.frequency.exponentialRampToValueAtTime(440, time + duration);

        g.gain.setValueAtTime(0.0001, time);
        g.gain.linearRampToValueAtTime(0.015, time + 0.1);
        g.gain.exponentialRampToValueAtTime(0.0001, time + duration);

        osc.connect(g);
        g.connect(musicGain);
        osc.start(time);
        osc.stop(time + duration + 0.05);
      }
    }
  }
}

export function startMusic() {
  const c = ensure();
  if (!c || isMusicPlaying) return;

  isMusicPlaying = true;
  isPlayerInSafeZone = false;
  currentStep = 0;
  nextNoteTime = c.currentTime;

  // Run scheduler loop
  seqTimerId = window.setInterval(scheduler, 50);
}

export function stopMusic() {
  if (seqTimerId !== null) {
    clearInterval(seqTimerId);
    seqTimerId = null;
  }
  isMusicPlaying = false;
}

export function enterSafeZone() {
  isPlayerInSafeZone = true;
}

export function stopAllGameplaySounds() {
  stopRain();
  stopMusic();
}

// ---------------- Game State Events ----------------

export const sfx = {
  click() {
    tone({ freq: 660, dur: 0.06, type: 'square', vol: 0.18, sweepTo: 880 });
  },
  hover() {
    tone({ freq: 880, dur: 0.03, type: 'sine', vol: 0.08 });
  },
  rescue() {
    // Radio beep + optimistic confirmation chord
    tone({ freq: 600, dur: 0.05, type: 'square', vol: 0.15 });
    setTimeout(() => {
      tone({ freq: 523.25, dur: 0.12, type: 'triangle', vol: 0.22 }); // C5
      tone({ freq: 659.25, dur: 0.12, type: 'triangle', vol: 0.22 }); // E5
      tone({ freq: 783.99, dur: 0.16, type: 'triangle', vol: 0.22 }); // G5
    }, 55);
  },
  warning() {
    tone({ freq: 440, dur: 0.18, type: 'sawtooth', vol: 0.18, sweepTo: 220 });
  },
  alarm() {
    tone({ freq: 740, dur: 0.22, type: 'square', vol: 0.2 });
    setTimeout(() => tone({ freq: 560, dur: 0.22, type: 'square', vol: 0.2 }), 240);
    setTimeout(() => tone({ freq: 740, dur: 0.22, type: 'square', vol: 0.2 }), 480);
  },
  electric() {
    noiseSfx(0.22, 0.28, 2200, 'highpass');
    tone({ freq: 180, dur: 0.18, type: 'sawtooth', vol: 0.18, sweepTo: 90 });
  },
  hazard() {
    tone({ freq: 280, dur: 0.15, type: 'square', vol: 0.2, sweepTo: 120 });
  },
  gameover() {
    stopAllGameplaySounds();
    // Heavy warning sound + rain / failure drone
    tone({ freq: 220, dur: 0.4, type: 'sawtooth', vol: 0.26, sweepTo: 80 });
    setTimeout(() => tone({ freq: 110, dur: 0.6, type: 'sawtooth', vol: 0.28, sweepTo: 55 }), 350);
    setTimeout(() => noiseSfx(1.2, 0.22, 400), 200);
  },
  victory() {
    stopAllGameplaySounds();
    // Heroic arpeggio progression
    tone({ freq: 261.63, dur: 0.16, type: 'triangle', vol: 0.2 }); // C4
    setTimeout(() => tone({ freq: 329.63, dur: 0.16, type: 'triangle', vol: 0.2 }), 150); // E4
    setTimeout(() => tone({ freq: 392.00, dur: 0.16, type: 'triangle', vol: 0.2 }), 300); // G4
    setTimeout(() => tone({ freq: 523.25, dur: 0.3, type: 'triangle', vol: 0.25 }), 450); // C5
    setTimeout(() => tone({ freq: 659.25, dur: 0.5, type: 'sine', vol: 0.2 }), 600); // E5
  },
  thunder() {
    // Basic fallback thunder (triggerLightningThunder handles detailed procedural)
    noiseSfx(0.8, 0.35, 300);
  },
  saved() {
    // Satisfying escrow tone
    tone({ freq: 880, dur: 0.14, type: 'triangle', vol: 0.22 });
    setTimeout(() => tone({ freq: 1318.51, dur: 0.22, type: 'triangle', vol: 0.22 }), 120);
  },
};
