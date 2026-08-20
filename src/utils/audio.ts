// Soft ambient audio synthesizer using Web Audio API for cozy Ghibli atmosphere

class AmbientSoundEngine {
  private ctx: AudioContext | null = null;
  private rainNode: AudioNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;
  private activeMelodyNodes: AudioNode[] = [];

  public init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
  }

  public play() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    if (this.isPlaying) return;

    // Create pink noise for gentle rain shower
    const bufferSize = this.ctx.sampleRate * 2;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
      b6 = white * 0.115926;
    }

    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = buffer;
    noiseSource.loop = true;

    // Filter to warm rain frequency
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 850;

    this.gainNode = this.ctx.createGain();
    this.gainNode.gain.setValueAtTime(0.01, this.ctx.currentTime);
    this.gainNode.gain.exponentialRampToValueAtTime(0.18, this.ctx.currentTime + 1.5);

    noiseSource.connect(filter);
    filter.connect(this.gainNode);
    this.gainNode.connect(this.ctx.destination);

    noiseSource.start();
    this.rainNode = noiseSource;
    this.isPlaying = true;
  }

  public stop() {
    if (!this.ctx || !this.isPlaying) return;
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(this.gainNode.gain.value, this.ctx.currentTime);
      this.gainNode.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        if (this.rainNode) {
          try {
            (this.rainNode as AudioBufferSourceNode).stop();
          } catch {
            // ignore
          }
          this.rainNode.disconnect();
          this.rainNode = null;
        }
        this.isPlaying = false;
      }, 500);
    } else {
      this.isPlaying = false;
    }
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.stop();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }

  // Play peaceful Ghibli piano chime progression (pentatonic & lyrical)
  public playGhibliChime(noteIndex = 0) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const scale = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25]; // C D E G A C D E
    const freq = scale[noteIndex % scale.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1400, this.ctx.currentTime);

    gain.gain.setValueAtTime(0.001, this.ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.15, this.ctx.currentTime + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 1.6);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + 1.8);
  }

  // Play a full synthesized Ghibli sunset acoustic piece (approx 15-20s)
  public playGhibliMelody(onEnd?: () => void) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const chords = [
      [349.23, 440.00, 523.25, 659.25], // Fmaj7
      [392.00, 493.88, 587.33, 698.46], // G7
      [329.63, 392.00, 493.88, 587.33], // Em7
      [220.00, 261.63, 329.63, 440.00], // Am
      [293.66, 349.23, 440.00, 523.25], // Dm7
      [261.63, 329.63, 392.00, 523.25]  // Cmaj7
    ];

    const startTime = this.ctx.currentTime;
    let step = 0;

    chords.forEach((chord, chordIdx) => {
      chord.forEach((freq, noteIdx) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const filter = this.ctx!.createBiquadFilter();

        osc.type = noteIdx === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, startTime + chordIdx * 2.2 + noteIdx * 0.18);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, startTime + chordIdx * 2.2);

        const noteStart = startTime + chordIdx * 2.2 + noteIdx * 0.18;
        gain.gain.setValueAtTime(0.0001, noteStart);
        gain.gain.linearRampToValueAtTime(0.09, noteStart + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, noteStart + 2.0);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(noteStart);
        osc.stop(noteStart + 2.1);
      });
      step++;
    });

    if (onEnd) {
      setTimeout(onEnd, chords.length * 2200);
    }
  }

  // Play decoded base64 audio
  public async playBase64Audio(base64Data: string, mimeType = 'audio/mp3') {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    try {
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const audioBuffer = await this.ctx.decodeAudioData(bytes.buffer);
      const source = this.ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(this.ctx.destination);
      source.start();
      return source;
    } catch (e) {
      console.warn('Audio decoding fallback to HTMLAudioElement:', e);
      const audio = new Audio(`data:${mimeType};base64,${base64Data}`);
      await audio.play();
    }
  }
}

export const ambientAudio = new AmbientSoundEngine();
