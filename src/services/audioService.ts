import { SoundType, AudioSettings } from '../types/phonics';

class AudioService {
  private audioCtx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private synth: SpeechSynthesis | null = null;
  private voices: SpeechSynthesisVoice[] = [];
  private isMuted: boolean = false;
  private settings: AudioSettings = {
    voiceSpeed: 0.82,     // Toddler pacing: slow, clear, articulate
    voicePitch: 1.08,     // Warm, friendly, slightly elevated
    sfxVolume: 0.9,
    speechVolume: 1.0,
    selectedVoiceName: null,
  };

  // Speech listener callbacks for visual mouth sync
  private speechStartListeners: Set<() => void> = new Set();
  private speechEndListeners: Set<() => void> = new Set();

  constructor() {
    if (typeof window !== 'undefined') {
      // Lazy init for SpeechSynthesis
      if ('speechSynthesis' in window) {
        this.synth = window.speechSynthesis;
        this.loadVoices();
        if (this.synth.onvoiceschanged !== undefined) {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  /**
   * Unlock and initialize Web Audio API on first user gesture
   */
  private initAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioContextClass();
      this.sfxGain = this.audioCtx.createGain();
      this.sfxGain.gain.setValueAtTime(this.settings.sfxVolume, this.audioCtx.currentTime);
      this.sfxGain.connect(this.audioCtx.destination);
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  private loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0 && this.synth) {
      this.voices = this.synth.getVoices();
    }
    return this.voices.filter(v => v.lang.startsWith('en'));
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.sfxGain && this.audioCtx && newSettings.sfxVolume !== undefined) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.settings.sfxVolume, this.audioCtx.currentTime);
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.audioCtx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.settings.sfxVolume, this.audioCtx.currentTime);
    }
    if (this.isMuted && this.synth) {
      this.synth.cancel();
    }
    return this.isMuted;
  }

  public onSpeechStart(callback: () => void) {
    this.speechStartListeners.add(callback);
    return () => this.speechStartListeners.delete(callback);
  }

  public onSpeechEnd(callback: () => void) {
    this.speechEndListeners.add(callback);
    return () => this.speechEndListeners.delete(callback);
  }

  private notifySpeechStart() {
    this.speechStartListeners.forEach(cb => cb());
  }

  private notifySpeechEnd() {
    this.speechEndListeners.forEach(cb => cb());
  }

  /**
   * High quality speech synthesizer tuned for toddlers
   */
  public speak(text: string, options?: { interrupt?: boolean; delayMs?: number }): Promise<void> {
    return new Promise((resolve) => {
      if (this.isMuted || !this.synth) {
        resolve();
        return;
      }

      const shouldInterrupt = options?.interrupt ?? true;
      if (shouldInterrupt) {
        this.synth.cancel();
        this.notifySpeechEnd();
      }

      const executeSpeak = () => {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = this.settings.voiceSpeed;
        utterance.pitch = this.settings.voicePitch;
        utterance.volume = this.settings.speechVolume;

        // Choose best natural English voice
        const enVoices = this.getAvailableVoices();
        let chosenVoice: SpeechSynthesisVoice | undefined;

        if (this.settings.selectedVoiceName) {
          chosenVoice = enVoices.find(v => v.name === this.settings.selectedVoiceName);
        }

        if (!chosenVoice) {
          // Priority to natural, warm sounding voices
          const preferredNames = [
            'Samantha', 'Daniel', 'Karen', 'Victoria', 'Moira', 'Google US English', 'Natural'
          ];
          for (const name of preferredNames) {
            chosenVoice = enVoices.find(v => v.name.includes(name));
            if (chosenVoice) break;
          }
          if (!chosenVoice && enVoices.length > 0) {
            chosenVoice = enVoices[0];
          }
        }

        if (chosenVoice) {
          utterance.voice = chosenVoice;
        }

        utterance.onstart = () => {
          this.notifySpeechStart();
        };

        utterance.onend = () => {
          this.notifySpeechEnd();
          resolve();
        };

        utterance.onerror = () => {
          this.notifySpeechEnd();
          resolve();
        };

        this.synth?.speak(utterance);
      };

      if (options?.delayMs && options.delayMs > 0) {
        setTimeout(executeSpeak, options.delayMs);
      } else {
        executeSpeak();
      }
    });
  }

  /**
   * Dedicated helper for pronouncing single letter phonemes
   */
  public async speakPhoneme(phonemeSpoken: string): Promise<void> {
    await this.speak(phonemeSpoken, { interrupt: true });
  }

  /**
   * Speaks the phoneme sound followed by the full word (e.g., "Mmmm... monkey!")
   */
  public async speakPhonemeAndWord(phoneme: string, word: string): Promise<void> {
    // E.g. "Mmmm... monkey!"
    const phrase = `${phoneme}... ${word}!`;
    await this.speak(phrase, { interrupt: true });
  }

  public async speakPraise(): Promise<void> {
    const praises = ['Yay!', 'Super!', 'Hooray!', 'Wonderful!', 'Look at that!', 'Great tapping!'];
    const randomPraise = praises[Math.floor(Math.random() * praises.length)];
    await this.speak(randomPraise, { interrupt: false, delayMs: 150 });
  }

  // ==========================================
  // PROCEDURAL WEB AUDIO SFX ENGINE
  // ==========================================

  public playPop() {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      const now = ctx.currentTime;
      osc.frequency.setValueAtTime(450, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.12);

      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);

      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.13);
    } catch {
      // Ignore audio failure
    }
  }

  public playBoing() {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const now = ctx.currentTime;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(480, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(280, now + 0.3);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain || ctx.destination);

      osc.start(now);
      osc.stop(now + 0.36);
    } catch {
      // Ignore
    }
  }

  public playChime() {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5 major triad
      const now = ctx.currentTime;

      notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + index * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.3, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.5);

        osc.connect(gain);
        gain.connect(this.sfxGain || ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.55);
      });
    } catch {
      // Ignore
    }
  }

  public playSparkle() {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const freqs = [1046.5, 1318.5, 1567.98, 2093.0]; // C6, E6, G6, C7
      const now = ctx.currentTime;

      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + idx * 0.06;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.2, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

        osc.connect(gain);
        gain.connect(this.sfxGain || ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + 0.36);
      });
    } catch {
      // Ignore
    }
  }

  public playFanfare() {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const notes = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.14 }, // G5
        { f: 1046.5, d: 0.4 },  // C6
      ];
      const now = ctx.currentTime;
      let offset = 0;

      notes.forEach(({ f, d }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const startTime = now + offset;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, startTime);

        gain.gain.setValueAtTime(0.35, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + d);

        osc.connect(gain);
        gain.connect(this.sfxGain || ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + d + 0.05);

        offset += d * 0.75;
      });
    } catch {
      // Ignore
    }
  }

  /**
   * Plays character and object sound effects tailored to toddlers
   */
  public playSoundEffect(type: SoundType) {
    if (this.isMuted) return;
    try {
      const ctx = this.initAudioContext();
      const now = ctx.currentTime;

      switch (type) {
        case 'pop':
          this.playPop();
          break;
        case 'chime':
          this.playChime();
          break;
        case 'boing':
          this.playBoing();
          break;
        case 'sparkle':
        case 'twinkle':
          this.playSparkle();
          break;
        case 'fanfare':
          this.playFanfare();
          break;

        case 'monkey': {
          // Playful monkey chatter chirp
          for (let i = 0; i < 3; i++) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const start = now + i * 0.12;

            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(600 + i * 80, start);
            osc.frequency.linearRampToValueAtTime(950 + i * 50, start + 0.08);

            gain.gain.setValueAtTime(0.2, start);
            gain.gain.exponentialRampToValueAtTime(0.01, start + 0.1);

            osc.connect(gain);
            gain.connect(this.sfxGain || ctx.destination);

            osc.start(start);
            osc.stop(start + 0.11);
          }
          break;
        }

        case 'slurp': {
          // Liquid bubbly glug
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(200, now);
          osc.frequency.linearRampToValueAtTime(600, now + 0.25);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.32);
          break;
        }

        case 'squeak': {
          // Mouse high squeak
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(1400, now);
          osc.frequency.linearRampToValueAtTime(2200, now + 0.08);
          osc.frequency.linearRampToValueAtTime(1600, now + 0.16);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.18);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.2);
          break;
        }

        case 'bite':
        case 'crunch': {
          // Crisp bite
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(320, now);
          osc.frequency.exponentialRampToValueAtTime(90, now + 0.12);
          gain.gain.setValueAtTime(0.4, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.16);
          break;
        }

        case 'shimmer': {
          // Warm shimmering bell
          this.playSparkle();
          break;
        }

        case 'hiss': {
          // Snake soft gentle hiss (high frequency sine warble)
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(1800, now);
          osc.frequency.linearRampToValueAtTime(1400, now + 0.25);
          gain.gain.setValueAtTime(0.12, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.32);
          break;
        }

        case 'baa': {
          // Sheep baa gentle bleat
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.linearRampToValueAtTime(270, now + 0.25);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.36);
          break;
        }

        case 'slide': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(300, now);
          osc.frequency.exponentialRampToValueAtTime(650, now + 0.2);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.26);
          break;
        }

        case 'tap': {
          this.playPop();
          break;
        }

        case 'snap': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'square';
          osc.frequency.setValueAtTime(450, now);
          osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.11);
          break;
        }

        case 'cosmic': {
          // Astronaut cosmic swoop
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(400, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.35);
          gain.gain.setValueAtTime(0.25, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.42);
          break;
        }

        case 'arrow': {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(180, now);
          osc.frequency.linearRampToValueAtTime(700, now + 0.15);
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
          osc.connect(gain);
          gain.connect(this.sfxGain || ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
          break;
        }

        default:
          this.playPop();
      }
    } catch {
      // Ignore
    }
  }
}

export const audioService = new AudioService();
