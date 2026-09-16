import { SoundType, AudioSettings } from '../types/phonics';
import { getAudioEntry, getRandomPraiseAudioId } from '../data/audioManifest';
import { getCvcWordAudioUrl, getCvcSentenceAudioUrl } from '../data/cvcAudioManifest';

export interface PlayVoiceOptions {
  interrupt?: boolean;
  delayMs?: number;
  rate?: number;
  lang?: string;
}

class AudioService {
  private audioCtx: AudioContext | null = null;
  private sfxGain: GainNode | null = null;
  private isMuted: boolean = false;
  private settings: AudioSettings = {
    voiceSpeed: 0.75,     // Calm, unhurried British toddler pacing matching Oxford
    voicePitch: 1.0,      // Natural pitch
    sfxVolume: 0.9,
    speechVolume: 1.0,
    selectedVoiceName: null,
  };

  // Remote audio state & memory cache for preloaded assets
  private currentAudioElement: HTMLAudioElement | null = null;
  private audioCache: Map<string, HTMLAudioElement> = new Map();

  // Speech listener callbacks for visual mouth sync (used by CharacterMilo)
  private speechStartListeners: Set<() => void> = new Set();
  private speechEndListeners: Set<() => void> = new Set();
  private busyChangeListeners: Set<(busy: boolean) => void> = new Set();
  private isBusy: boolean = false;

  constructor() {
    // 100% Pre-recorded AI & Oxford audio pipeline.
    // Browser native SpeechSynthesis is strictly disabled per project architecture.
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

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    // Deprecated: SpeechSynthesis is disabled per project architecture
    return [];
  }

  public getSettings(): AudioSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<AudioSettings>) {
    this.settings = { ...this.settings, ...newSettings };
    if (this.sfxGain && this.audioCtx && newSettings.sfxVolume !== undefined) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.settings.sfxVolume, this.audioCtx.currentTime);
    }
    if (this.currentAudioElement && newSettings.speechVolume !== undefined) {
      this.currentAudioElement.volume = this.settings.speechVolume;
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.audioCtx && this.sfxGain) {
      this.sfxGain.gain.setValueAtTime(this.isMuted ? 0 : this.settings.sfxVolume, this.audioCtx.currentTime);
    }
    if (this.isMuted) {
      this.stopVoice();
    }
    return this.isMuted;
  }

  public onSpeechStart(callback: () => void): () => void {
    this.speechStartListeners.add(callback);
    return () => {
      this.speechStartListeners.delete(callback);
    };
  }

  public onSpeechEnd(callback: () => void): () => void {
    this.speechEndListeners.add(callback);
    return () => {
      this.speechEndListeners.delete(callback);
    };
  }

  public isBusyPlaying(): boolean {
    return this.isBusy;
  }

  public onBusyChange(callback: (busy: boolean) => void): () => void {
    this.busyChangeListeners.add(callback);
    return () => {
      this.busyChangeListeners.delete(callback);
    };
  }

  public setBusy(busy: boolean) {
    if (this.isBusy !== busy) {
      this.isBusy = busy;
      this.busyChangeListeners.forEach(cb => cb(busy));
    }
  }

  private notifySpeechStart() {
    this.setBusy(true);
    this.speechStartListeners.forEach(cb => cb());
  }

  private notifySpeechEnd() {
    this.setBusy(false);
    this.speechEndListeners.forEach(cb => cb());
  }

  // ==========================================
  // SEMANTIC VOICE AUDIO (PHASE 1 ABSTRACTION)
  // ==========================================

  /**
   * Play voice audio via semantic audio ID (e.g. "word.monkey", "phoneme.m")
   *
   * 1. Looks up entry in central audioManifest.
   * 2. Oxford authentic audio takes precedence for phonemes and authentic recordings.
   * 3. Pre-recorded AI audio (Coral British RP matching Oxford tone & pace) with Cloudinary CDN backing for all others.
   * 4. Triggers speech lifecycle listeners so visual animations (Milo mouth) sync perfectly.
   */
  public async playVoice(audioId: string, options?: PlayVoiceOptions): Promise<void> {
    if (this.isMuted) return;

    // Special case for random praise
    const resolvedId = audioId === 'praise.random' ? getRandomPraiseAudioId() : audioId;
    const entry = getAudioEntry(resolvedId);

    if (!entry) {
      if (audioId.startsWith('word.')) {
        return this.playRemoteVoice(`/audio/words/${audioId}.mp3`, audioId.replace(/^word\.[a-z]-?/, ''), options);
      }
      console.warn(`[AudioService] Audio asset not found for "${audioId}". Browser speech-synthesis is strictly disabled.`);
      return;
    }

    const shouldInterrupt = options?.interrupt ?? true;
    if (shouldInterrupt) {
      this.stopRemoteAudio();
    }

    if (entry.url) {
      return this.playRemoteVoice(entry.url, entry.fallbackText, options);
    }
  }

  /**
   * Play pre-recorded audio URL (100% pre-recorded Oxford or AI Cloudinary asset)
   */
  private playRemoteVoice(url: string, fallbackText?: string, options?: PlayVoiceOptions): Promise<void> {
    return new Promise((resolve) => {
      const execute = () => {
        try {
          let audio = this.audioCache.get(url);
          if (!audio) {
            audio = new Audio(url);
            this.audioCache.set(url, audio);
          } else {
            audio.currentTime = 0;
          }

          audio.volume = this.settings.speechVolume;
          audio.muted = this.isMuted;
          this.currentAudioElement = audio;

          const onStart = () => {
            this.notifySpeechStart();
          };

          const onFinish = () => {
            audio.removeEventListener('play', onStart);
            audio.removeEventListener('ended', onFinish);
            audio.removeEventListener('error', onError);
            this.notifySpeechEnd();
            this.currentAudioElement = null;
            resolve();
          };

          const onError = (err?: Event) => {
            audio.removeEventListener('play', onStart);
            audio.removeEventListener('ended', onFinish);
            audio.removeEventListener('error', onError);
            if (this.currentAudioElement === audio) {
              this.currentAudioElement = null;
              this.notifySpeechEnd();
            }
            console.warn(`[AudioService] Failed to play audio asset: ${url} (${fallbackText || 'voice'})`, err);
            resolve();
          };

          audio.addEventListener('play', onStart, { once: true });
          audio.addEventListener('ended', onFinish, { once: true });
          audio.addEventListener('error', onError, { once: true });

          const playPromise = audio.play();
          if (playPromise !== undefined) {
            playPromise.catch((err: unknown) => {
              if (err instanceof DOMException && err.name === 'AbortError') {
                audio.removeEventListener('play', onStart);
                audio.removeEventListener('ended', onFinish);
                audio.removeEventListener('error', onError);
                resolve();
                return;
              }
              onError();
            });
          }
        } catch (err) {
          console.warn(`[AudioService] Error initializing audio: ${url} (${fallbackText || 'voice'})`, err);
          resolve();
        }
      };

      if (options?.delayMs && options.delayMs > 0) {
        setTimeout(execute, options.delayMs);
      } else {
        execute();
      }
    });
  }

  /**
   * Play authentic British English sound from Oxford Dictionary dataset
   * @param symbol IPA or sound symbol (e.g. "m", "æ", "dʒ", "p")
   * @param kind "isolation" (pure phoneme) or "words" (example word)
   */
  public async playOxfordSound(
    symbol: string,
    kind: 'isolation' | 'words' = 'isolation',
    options?: PlayVoiceOptions
  ): Promise<void> {
    if (this.isMuted) return;
    const filename = `${encodeURIComponent(symbol)}_${kind}.mp3`;
    const url = `/audio/${filename}`;
    const fallbackText = kind === 'isolation' ? `Sound ${symbol}` : symbol;
    return this.playRemoteVoice(url, fallbackText, options);
  }

  /**
   * Play pedagogical blend: authentic Oxford isolated phoneme sound,
   * followed by a calm toddler breath pause, then the word spoken in British English.
   * e.g. /m/... Monkey!
   */
  public async playPhonemeWordBlend(
    phonemeAudioId: string,
    wordAudioId: string,
    fallbackWordText?: string
  ): Promise<void> {
    if (this.isMuted) return;

    this.setBusy(true);
    try {
      // 1. Play authentic Oxford isolated phoneme sound
      await this.playVoice(phonemeAudioId, { interrupt: true });

      // 2. Short breath pause for toddler comprehension
      await new Promise((resolve) => setTimeout(resolve, 200));

      // 3. Play the authentic / slow AI-generated word audio asset
      const wordEntry = getAudioEntry(wordAudioId);
      if (wordEntry?.url) {
        await this.playVoice(wordAudioId, { interrupt: false });
      } else {
        const cleanWord = (fallbackWordText || wordAudioId).replace(/^word\.[a-z]-?/, '');
        const cvcUrl = getCvcWordAudioUrl(cleanWord);
        await this.playRemoteVoice(cvcUrl, cleanWord, { interrupt: false });
      }
    } finally {
      this.setBusy(false);
    }
  }

  /**
   * Sequential CVC Blending for the Sound Train:
   * Plays each phoneme one-by-one with highlight callback, pauses, then speaks the blended word.
   * Uses authentic Oxford phonemes and trimmed AI CVC words with zero browser speech-synthesis.
   */
  public async playSequentialBlend(
    phonemeAudioIds: string[],
    wordAudioId?: string,
    fallbackWordText?: string,
    onHighlight?: (index: number) => void
  ): Promise<void> {
    if (this.isMuted) return;

    this.setBusy(true);
    try {
      // 1. Play each phoneme sequentially with crisp 100ms pacing
      for (let i = 0; i < phonemeAudioIds.length; i++) {
        onHighlight?.(i);
        this.playBoing();
        await this.playVoice(phonemeAudioIds[i], { interrupt: true });
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      onHighlight?.(-1);
      await new Promise((resolve) => setTimeout(resolve, 150));

      // 2. Play the final blended whole word
      const cleanWord = (fallbackWordText || wordAudioId || '').toLowerCase().replace(/^(word|cvc)\./, '');
      if (cleanWord) {
        const cvcUrl = getCvcWordAudioUrl(cleanWord);
        try {
          await this.playRemoteVoice(cvcUrl, cleanWord, { interrupt: false });
          return;
        } catch {
          // Fall through
        }
      }

      // Audio Manifest entry (e.g. word.p-pan)
      if (wordAudioId) {
        const wordEntry = getAudioEntry(wordAudioId);
        if (wordEntry?.url) {
          await this.playVoice(wordAudioId, { interrupt: false });
          return;
        }
      }
    } finally {
      this.setBusy(false);
    }
  }

  /**
   * Play blended CVC word with zero-latency local audio or Cloudinary fallback
   * @param wordId Word identifier (e.g. "sat", "pin", "cat")
   * @param fallbackWordText Spoken word fallback
   */
  public async playCvcWord(wordId: string, fallbackWordText?: string): Promise<void> {
    if (this.isMuted) return;
    const cleanId = wordId.toLowerCase().replace(/^(word|cvc)\./, '');
    const url = getCvcWordAudioUrl(cleanId);
    const text = fallbackWordText || cleanId;
    return this.playRemoteVoice(url, text, { interrupt: true });
  }

  /**
   * Play slow, articulate British English sentence reading
   * @param wordId Word identifier (e.g. "sat", "pin", "cat")
   * @param fallbackSentenceText Sentence text for fallback
   */
  public async playSentence(wordId: string, fallbackSentenceText?: string): Promise<void> {
    if (this.isMuted) return;
    const cleanId = wordId.toLowerCase().replace(/^(sentence|word|cvc)\./, '');
    const url = getCvcSentenceAudioUrl(cleanId);
    const text = fallbackSentenceText || cleanId;
    return this.playRemoteVoice(url, text, { interrupt: true });
  }

  /**
   * Stop only remote audio element
   */
  private stopRemoteAudio() {
    if (this.currentAudioElement) {
      try {
        this.currentAudioElement.pause();
        this.currentAudioElement.currentTime = 0;
      } catch {
        // Ignore
      }
      this.currentAudioElement = null;
    }
  }

  /**
   * Stop any currently playing voice audio
   */
  public stopVoice() {
    this.stopRemoteAudio();
    this.notifySpeechEnd();
  }

  /**
   * Preload audio assets into memory cache ahead of interaction
   */
  public async preload(audioIds: string[]): Promise<void> {
    if (typeof window === 'undefined') return;

    for (const id of audioIds) {
      const entry = getAudioEntry(id);
      if (entry?.url && !this.audioCache.has(entry.url)) {
        try {
          const audio = new Audio();
          audio.preload = 'auto';
          audio.src = entry.url;
          audio.load();
          this.audioCache.set(entry.url, audio);
        } catch {
          // Preload error is non-fatal
        }
      }
    }
  }

  // ==========================================
  // SPEECH SYNTHESIS ENGINE (FALLBACK / CORE)
  // ==========================================

  /**
   * High quality speech synthesizer tuned for toddlers with British English default
   */
  /**
   * Spoken audio helper: Per project architecture, browser native SpeechSynthesis is
   * completely disabled. This attempts to match text against pre-recorded AI / Oxford
   * audio entries or CVC words. Never invokes window.speechSynthesis.
   */
  public async speak(
    text: string,
    options?: { interrupt?: boolean; delayMs?: number; rate?: number; lang?: string }
  ): Promise<void> {
    if (this.isMuted) return;
    const clean = text.toLowerCase().trim();

    // 1. Check CVC word
    const cvcUrl = getCvcWordAudioUrl(clean);
    if (cvcUrl) {
      return this.playRemoteVoice(cvcUrl, text, options);
    }

    // 2. Check curriculum word ID format
    const wordEntry = getAudioEntry(`word.${clean}`);
    if (wordEntry?.url) {
      return this.playRemoteVoice(wordEntry.url, text, options);
    }

    console.warn(`[AudioService] speak() was called with "${text}", but browser SpeechSynthesis is strictly disabled per project architecture.`);
  }

  /**
   * Dedicated helper for pronouncing single letter phonemes (backward-compatible)
   */
  public async speakPhoneme(phonemeSpoken: string): Promise<void> {
    const clean = phonemeSpoken.toLowerCase().replace(/[^a-z]/g, '');
    if (clean) {
      await this.playVoice(`phoneme.${clean}`);
    }
  }

  /**
   * Speaks the phoneme sound followed by the full word (backward-compatible)
   */
  public async speakPhonemeAndWord(phoneme: string, word: string): Promise<void> {
    const cleanP = phoneme.toLowerCase().replace(/[^a-z]/g, '');
    const cleanW = word.toLowerCase().trim();
    if (cleanP) {
      await this.playPhonemeWordBlend(`phoneme.${cleanP}`, `word.${cleanW}`, cleanW);
    }
  }

  /**
   * Spoken encouragement praise (backward-compatible)
   */
  public async speakPraise(): Promise<void> {
    await this.playVoice('praise.random', { interrupt: false, delayMs: 150 });
  }

  // ==========================================
  // PROCEDURAL WEB AUDIO SFX ENGINE
  // ==========================================

  /**
   * Clean alias for playing procedural SFX
   */
  public playSfx(type: SoundType) {
    this.playSoundEffect(type);
  }

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
export const audioManager = audioService;
