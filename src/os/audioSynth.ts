import type { AudioPreset } from './types';

// Musical scales and chord frequencies for pleasant Web Audio synthesis
const PRESET_SCALES: Record<AudioPreset, number[]> = {
  lofi: [261.63, 311.13, 349.23, 392.0, 466.16, 523.25], // C minor pentatonic
  piano: [293.66, 329.63, 392.0, 440.0, 493.88, 587.33], // D major / warm keys
  ambient: [220.0, 261.63, 329.63, 392.0, 440.0, 523.25], // A minor airy
  synth: [246.94, 293.66, 369.99, 440.0, 493.88, 587.33], // B minor synthwave
  voice: [196.0, 220.0, 246.94, 261.63, 293.66, 220.0], // Warm speech-cadence tones
  rain: [174.61, 207.65, 261.63, 311.13, 349.23, 415.3], // Soft F minor texture
};

class MacAudioSynth {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private timer: number | null = null;
  private step = 0;
  private activePreset: AudioPreset = 'lofi';
  private volume = 0.65;
  private rate = 1;

  private ensureContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this.volume * 0.16;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.volume * 0.16, this.ctx.currentTime, 0.05);
    }
  }

  public setPlaybackRate(rate: number) {
    this.rate = rate;
    if (this.timer !== null) {
      this.start(this.activePreset, this.volume, this.rate);
    }
  }

  public start(preset: AudioPreset, vol = this.volume, rate = this.rate) {
    this.stop();
    this.activePreset = preset;
    this.volume = vol;
    this.rate = rate;

    const ctx = this.ensureContext();
    if (!ctx || !this.masterGain) return;
    this.masterGain.gain.setTargetAtTime(this.volume * 0.16, ctx.currentTime, 0.04);

    const intervalMs = Math.max(180, Math.round((preset === 'voice' ? 280 : 420) / rate));
    this.playStep();
    this.timer = window.setInterval(() => this.playStep(), intervalMs);
  }

  private playStep() {
    if (!this.ctx || !this.masterGain) return;
    const now = this.ctx.currentTime;
    const scale = PRESET_SCALES[this.activePreset] ?? PRESET_SCALES.lofi;
    const pattern = [0, 2, 4, 3, 1, 5, 2, 0];
    const noteIndex = pattern[this.step % pattern.length];
    const freq = scale[noteIndex % scale.length];

    const osc = this.ctx.createOscillator();
    const env = this.ctx.createGain();

    osc.type =
      this.activePreset === 'synth'
        ? 'triangle'
        : this.activePreset === 'piano'
        ? 'sine'
        : 'sine';

    osc.frequency.setValueAtTime(freq, now);
    if (this.activePreset === 'voice') {
      osc.frequency.exponentialRampToValueAtTime(freq * 1.05, now + 0.14);
    }

    const duration = this.activePreset === 'ambient' || this.activePreset === 'rain' ? 0.65 : 0.36;
    env.gain.setValueAtTime(0.001, now);
    env.gain.linearRampToValueAtTime(0.45, now + 0.04);
    env.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(env);
    env.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + duration + 0.02);

    this.step += 1;
  }

  public stop() {
    if (this.timer !== null) {
      window.clearInterval(this.timer);
      this.timer = null;
    }
  }
}

export const macAudioSynth = new MacAudioSynth();
