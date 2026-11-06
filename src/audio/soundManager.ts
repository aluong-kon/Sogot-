/**
 * SOGOT Sound Manager
 * 100% Procedural Web Audio & Speech Synthesis
 * Zero external audio dependencies / 404s
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientGain: GainNode | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.8;
  private ambientSource: AudioNode | null = null;
  private isSpeechEnabled: boolean = true;
  private micStream: MediaStream | null = null;
  private micAnalyser: AnalyserNode | null = null;
  private micAudioContext: AudioContext | null = null;
  private micListenerId: number | null = null;

  constructor() {
    // AudioContext will be initialized on first user interaction
  }

  private initContext(): AudioContext {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
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
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  public setSpeechEnabled(enabled: boolean) {
    this.isSpeechEnabled = enabled;
  }

  /**
   * Play the traditional SOGOT Call:
   * "SOGOT!" (Caller: Player 1)
   */
  public playCall1(onEnd?: () => void) {
    this.initContext();
    this.playVocalSynthesizedSogot(1);

    if (this.isSpeechEnabled && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Sogot!');
        utterance.rate = 1.05;
        utterance.pitch = 1.25;
        utterance.volume = this.volume;
        utterance.onend = () => onEnd?.();
        utterance.onerror = () => onEnd?.();
        window.speechSynthesis.speak(utterance);
        return;
      } catch {
        // Fallback to procedural formant synthesis
      }
    }
    setTimeout(() => onEnd?.(), 650);
  }

  /**
   * Play the traditional SOGOT Response:
   * "SOGOT! SOGOT!" (Responders: Player 2 / Field)
   */
  public playCall2(onEnd?: () => void) {
    this.initContext();
    this.playVocalSynthesizedSogot(2);

    if (this.isSpeechEnabled && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance('Sogot! Sogot!');
        utterance.rate = 1.15;
        utterance.pitch = 1.4;
        utterance.volume = this.volume;
        utterance.onend = () => onEnd?.();
        utterance.onerror = () => onEnd?.();
        window.speechSynthesis.speak(utterance);
        return;
      } catch {
        // Fallback
      }
    }
    setTimeout(() => onEnd?.(), 1100);
  }

  /**
   * Procedural Formant Vocal Synthesizer for "SOH-GOHT!"
   * Simulates throat formant filters and energetic youth vocal timbre
   */
  private playVocalSynthesizedSogot(repetitions = 1) {
    const ctx = this.initContext();
    if (this.isMuted) return;

    for (let rep = 0; rep < repetitions; rep++) {
      const delay = rep * 0.45;
      const startTime = ctx.currentTime + delay;

      // Vocal cords oscillator (sawtooth/pulse with pitch modulation)
      const osc = ctx.createOscillator();
      osc.type = 'sawtooth';
      const pitchBase = rep === 0 ? 210 : 255;
      osc.frequency.setValueAtTime(pitchBase, startTime);
      osc.frequency.exponentialRampToValueAtTime(pitchBase * 1.35, startTime + 0.12);
      osc.frequency.exponentialRampToValueAtTime(pitchBase * 0.9, startTime + 0.32);

      // Formant filters (O and OH vowel spectrum)
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.setValueAtTime(500, startTime);
      f1.Q.setValueAtTime(4.0, startTime);

      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.setValueAtTime(950, startTime);
      f2.Q.setValueAtTime(5.0, startTime);

      const vocalGain = ctx.createGain();
      vocalGain.gain.setValueAtTime(0.0001, startTime);
      vocalGain.gain.linearRampToValueAtTime(0.35 * this.volume, startTime + 0.04);
      vocalGain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.36);

      osc.connect(f1);
      osc.connect(f2);
      f1.connect(vocalGain);
      f2.connect(vocalGain);
      vocalGain.connect(this.masterGain!);

      osc.start(startTime);
      osc.stop(startTime + 0.38);
    }
  }

  /**
   * Crisp Wooden Stick Strike / Impact Sound
   * Dual physical resonant frequencies (wood body + snap)
   */
  public playWoodHit(intensity = 1.0) {
    const ctx = this.initContext();
    if (this.isMuted) return;

    const t = ctx.currentTime;
    const power = Math.max(0.3, Math.min(1.5, intensity));

    // Transient snap (burst noise)
    const bufferSize = ctx.sampleRate * 0.05;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.15));
    }

    const noiseSource = ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.setValueAtTime(2400, t);
    noiseFilter.Q.setValueAtTime(3.0, t);

    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.6 * power, t);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

    noiseSource.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);
    noiseSource.start(t);

    // Resonant wooden body tone
    const woodOsc = ctx.createOscillator();
    woodOsc.type = 'triangle';
    woodOsc.frequency.setValueAtTime(780, t);
    woodOsc.frequency.exponentialRampToValueAtTime(420, t + 0.15);

    const woodGain = ctx.createGain();
    woodGain.gain.setValueAtTime(0.7 * power, t);
    woodGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    woodOsc.connect(woodGain);
    woodGain.connect(this.masterGain!);
    woodOsc.start(t);
    woodOsc.stop(t + 0.2);

    // Deep wood thump
    const subOsc = ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(220, t);
    subOsc.frequency.exponentialRampToValueAtTime(70, t + 0.12);

    const subGain = ctx.createGain();
    subGain.gain.setValueAtTime(0.4 * power, t);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain!);
    subOsc.start(t);
    subOsc.stop(t + 0.15);
  }

  /**
   * Stick Lift / Flick Sound
   */
  public playLiftSound() {
    const ctx = this.initContext();
    if (this.isMuted) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(280, t);
    osc.frequency.exponentialRampToValueAtTime(840, t + 0.14);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.18);
  }

  /**
   * Dirt / Earth Landing Sound
   */
  public playDirtThud(strength = 1.0) {
    const ctx = this.initContext();
    if (this.isMuted) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(45, t + 0.16);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4 * strength, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.2);
  }

  /**
   * Cheering / Celebration Audio
   */
  public playCrowdCheer(huge = false) {
    const ctx = this.initContext();
    if (this.isMuted) return;

    const t = ctx.currentTime;
    const duration = huge ? 2.5 : 1.4;

    // Resonant noise applause
    const bufferSize = Math.floor(ctx.sampleRate * duration);
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    for (let i = 0; i < bufferSize; i++) {
      const progress = i / bufferSize;
      const envelope = Math.sin(progress * Math.PI) * (1 - progress * 0.4);
      data[i] = (Math.random() * 2 - 1) * envelope;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, t);
    filter.Q.setValueAtTime(1.8, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    noise.start(t);

    // Whistle chime
    if (huge) {
      const whistle = ctx.createOscillator();
      whistle.type = 'sine';
      whistle.frequency.setValueAtTime(1800, t + 0.1);
      whistle.frequency.exponentialRampToValueAtTime(2600, t + 0.4);

      const whistleGain = ctx.createGain();
      whistleGain.gain.setValueAtTime(0.001, t);
      whistleGain.gain.linearRampToValueAtTime(0.2, t + 0.15);
      whistleGain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

      whistle.connect(whistleGain);
      whistleGain.connect(this.masterGain!);
      whistle.start(t + 0.1);
      whistle.stop(t + 0.65);
    }
  }

  /**
   * Traditional South Sudanese "Carry the Player / Kuoc" Celebration Audio
   * Polyrhythmic handclaps, joyous celebratory whistles, and victory callouts
   */
  public playCarryCelebration(playerName = 'Champion') {
    const ctx = this.initContext();
    if (this.isMuted) return;

    const t = ctx.currentTime;

    // 1. Polyrhythmic handclapping rhythm (5 claps in syncopation)
    const clapTimes = [0, 0.22, 0.44, 0.58, 0.82, 1.05, 1.28, 1.5, 1.72];
    clapTimes.forEach((delay) => {
      const clapT = t + delay;
      const bufferSize = Math.floor(ctx.sampleRate * 0.04);
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400 + Math.random() * 300, clapT);
      filter.Q.setValueAtTime(2.5, clapT);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.5, clapT);
      gain.gain.exponentialRampToValueAtTime(0.01, clapT + 0.045);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain!);
      noise.start(clapT);
    });

    // 2. Rising celebratory pitch
    const cheer = ctx.createOscillator();
    cheer.type = 'triangle';
    cheer.frequency.setValueAtTime(320, t + 0.3);
    cheer.frequency.exponentialRampToValueAtTime(980, t + 1.2);

    const cheerGain = ctx.createGain();
    cheerGain.gain.setValueAtTime(0.001, t + 0.3);
    cheerGain.gain.linearRampToValueAtTime(0.35, t + 0.6);
    cheerGain.gain.exponentialRampToValueAtTime(0.001, t + 1.8);

    cheer.connect(cheerGain);
    cheerGain.connect(this.masterGain!);
    cheer.start(t + 0.3);
    cheer.stop(t + 1.85);

    // 3. Speech synthesis shout
    if (this.isSpeechEnabled && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(`Carry! Carry ${playerName}! Three uncaught strikes!`);
        utterance.rate = 1.15;
        utterance.pitch = 1.35;
        utterance.volume = this.volume;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback
      }
    }
  }

  /**
   * Catch / Elimination Sound ("Aww / Ohhh!")
   */
  public playCatchOutSound() {
    const ctx = this.initContext();
    if (this.isMuted) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(380, t);
    osc.frequency.linearRampToValueAtTime(190, t + 0.45);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + 0.52);
  }

  /**
   * Countdown Beep for Call-and-Response Strike Window
   */
  public playCountdownBeep(isFinal = false) {
    const ctx = this.initContext();
    if (this.isMuted) return;

    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(isFinal ? 880 : 520, t);

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.28, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + (isFinal ? 0.35 : 0.18));

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(t);
    osc.stop(t + (isFinal ? 0.38 : 0.2));
  }

  /**
   * Ambient Outdoor Savannah Breeze & Crickets
   */
  public startSavannahAmbience() {
    if (this.ambientSource) return;
    const ctx = this.initContext();

    const bufferSize = ctx.sampleRate * 2.0;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0.0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      // Pinkish noise
      data[i] = (lastOut + 0.02 * white) / 1.02;
      lastOut = data[i];
      data[i] *= 0.12;
    }

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(600, ctx.currentTime);

    this.ambientGain = ctx.createGain();
    this.ambientGain.gain.setValueAtTime(0.08 * this.volume, ctx.currentTime);

    noise.connect(filter);
    filter.connect(this.ambientGain);
    this.ambientGain.connect(this.masterGain!);
    noise.start();
    this.ambientSource = noise;
  }

  public stopSavannahAmbience() {
    if (this.ambientSource) {
      try {
        (this.ambientSource as AudioScheduledSourceNode).stop();
      } catch {
        // Ignore
      }
      this.ambientSource = null;
    }
  }

  /**
   * Optional Live Microphone Recording & Shout Detection
   * Lets players physically shout "SOGOT!" to trigger the response or strike!
   */
  public async initMicrophoneListener(onShoutDetected: () => void, sensitivity = 5): Promise<boolean> {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        return false;
      }

      this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.micAudioContext = new AudioCtx();
      const micSource = this.micAudioContext.createMediaStreamSource(this.micStream);
      this.micAnalyser = this.micAudioContext.createAnalyser();
      this.micAnalyser.fftSize = 256;
      micSource.connect(this.micAnalyser);

      const bufferLength = this.micAnalyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const threshold = 160 - sensitivity * 10; // 60 to 150 range

      let lastTriggerTime = 0;

      const checkVolume = () => {
        if (!this.micAnalyser) return;
        this.micAnalyser.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const average = sum / bufferLength;

        const now = Date.now();
        if (average > threshold && now - lastTriggerTime > 1500) {
          lastTriggerTime = now;
          onShoutDetected();
        }

        this.micListenerId = requestAnimationFrame(checkVolume);
      };

      checkVolume();
      return true;
    } catch {
      return false;
    }
  }

  public stopMicrophoneListener() {
    if (this.micListenerId) {
      cancelAnimationFrame(this.micListenerId);
      this.micListenerId = null;
    }
    if (this.micStream) {
      this.micStream.getTracks().forEach((track) => track.stop());
      this.micStream = null;
    }
    if (this.micAudioContext) {
      this.micAudioContext.close().catch(() => {});
      this.micAudioContext = null;
    }
    this.micAnalyser = null;
  }
}

export const soundManager = new SoundManager();
