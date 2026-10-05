/**
 * SWEET BIRTHDAY AUDIO ENGINE
 * - Section-based background music synthesis with smooth cross-fading
 * - Interactive action SFX (chimes, pops, unwraps, candle blows, sparkles)
 * - User custom audio upload/file support
 */

class BirthdayAudioEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.musicGain = null;
    this.sfxGain = null;
    this.isMuted = false;
    this.isPlaying = false;
    this.volume = 0.8;
    this.currentTrackIndex = -1;
    this.customAudioElement = null;
    this.isCustomAudioMode = false;
    this.customAudioSource = null;
    this.activeNodes = [];
    this.schedulerTimer = null;

    // Track metadata
    this.tracks = [
      {
        id: 'hero',
        name: 'Sweet Music Box Lullaby',
        label: 'Section 1 • Entrance Melody',
        scale: [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25], // C major pentatonic
        bpm: 76,
        type: 'musicbox'
      },
      {
        id: 'memories',
        name: 'Nostalgic Rhodes & Warm Chords',
        label: 'Section 2 • Memory Lane',
        scale: [220.00, 261.63, 293.66, 329.63, 392.00, 440.00, 523.25], // A minor / C
        bpm: 68,
        type: 'rhodes'
      },
      {
        id: 'cake',
        name: 'Joyful Birthday Melody',
        label: 'Section 3 • Make a Wish',
        scale: [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25], // Happy birthday scale
        bpm: 96,
        type: 'celebration'
      },
      {
        id: 'vault',
        name: 'Intimate Heartstrings',
        label: 'Section 4 • Love Vault',
        scale: [196.00, 246.94, 293.66, 329.63, 392.00, 493.88, 587.33], // G major romantic
        bpm: 62,
        type: 'strings'
      },
      {
        id: 'balloons',
        name: 'Playful Starlight Plucks',
        label: 'Section 5 • Balloon Garden',
        scale: [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25], // D major bright
        bpm: 104,
        type: 'plucks'
      },
      {
        id: 'finale',
        name: 'Cosmic Serenade & Celebration',
        label: 'Section 6 • Grand Finale',
        scale: [261.63, 329.63, 392.00, 493.88, 523.25, 659.25, 783.99], // Cmaj7/9 cosmic
        bpm: 82,
        type: 'cosmic'
      }
    ];
  }

  // Initialize Web Audio Context after user gesture
  init() {
    if (this.ctx) return;
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    this.musicGain = this.ctx.createGain();
    this.musicGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
    this.musicGain.connect(this.masterGain);

    this.sfxGain = this.ctx.createGain();
    this.sfxGain.gain.setValueAtTime(0.9, this.ctx.currentTime);
    this.sfxGain.connect(this.masterGain);
  }

  resume() {
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Set Master Volume (0.0 to 1.0)
  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setTargetAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime, 0.05);
    }
    if (this.customAudioElement) {
      this.customAudioElement.volume = this.isMuted ? 0 : this.volume;
    }
  }

  // Toggle Mute
  toggleMute() {
    this.isMuted = !this.isMuted;
    this.setVolume(this.volume);
    return this.isMuted;
  }

  // Switch Track for a Section with smooth crossfade
  switchSectionTrack(sectionIndex) {
    if (sectionIndex === this.currentTrackIndex && this.isPlaying) return;
    if (sectionIndex < 0 || sectionIndex >= this.tracks.length) return;

    this.currentTrackIndex = sectionIndex;
    const track = this.tracks[sectionIndex];

    // Update UI labels if available
    const labelEl = document.getElementById('current-section-label');
    const nameEl = document.getElementById('current-track-name');
    if (labelEl) labelEl.textContent = track.label;
    if (nameEl) nameEl.textContent = track.name;

    if (!this.isPlaying) return;

    if (this.isCustomAudioMode) {
      return; // In custom audio mode, user track continues
    }

    // Smoothly stop existing synthesized sequence and start new one
    this.stopSynthesizer();
    this.startSynthesizerTrack(track);
  }

  start() {
    this.init();
    this.resume();
    this.isPlaying = true;

    if (this.isCustomAudioMode && this.customAudioElement) {
      this.customAudioElement.play().catch(e => console.log('Custom play deferred:', e));
    } else {
      if (this.currentTrackIndex < 0) this.currentTrackIndex = 0;
      this.startSynthesizerTrack(this.tracks[this.currentTrackIndex]);
    }
  }

  pause() {
    this.isPlaying = false;
    this.stopSynthesizer();
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
  }

  togglePlayPause() {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  stopSynthesizer() {
    if (this.schedulerTimer) {
      clearInterval(this.schedulerTimer);
      this.schedulerTimer = null;
    }
    // Fade out active nodes gracefully
    const now = this.ctx ? this.ctx.currentTime : 0;
    this.activeNodes.forEach(node => {
      try {
        if (node.gain) {
          node.gain.setTargetAtTime(0, now, 0.2);
        }
        setTimeout(() => {
          try { node.stop(); node.disconnect(); } catch (e) {}
        }, 300);
      } catch (e) {}
    });
    this.activeNodes = [];
  }

  // Procedural Music Arranger per Section
  startSynthesizerTrack(track) {
    if (!this.ctx || !this.isPlaying) return;

    let step = 0;
    const stepInterval = (60 / track.bpm) * 500; // 8th note interval in ms

    // Procedural sequence patterns depending on section
    const playStep = () => {
      if (!this.isPlaying || this.isCustomAudioMode) return;

      const scale = track.scale;
      const t = this.ctx.currentTime;

      // Section specific musical styles
      if (track.type === 'musicbox') {
        // Melodic sparkle music box
        if (step % 2 === 0) {
          const noteIndex = (step * 3 + Math.floor(step / 4)) % scale.length;
          this.playBellNote(scale[noteIndex], 0.12, 1.2, 'sine');
        }
        if (step % 8 === 0) {
          this.playBellNote(scale[0] / 2, 0.15, 2.0, 'triangle');
        }
      } else if (track.type === 'rhodes') {
        // Warm nostalgic Rhodes chords & slow arpeggio
        if (step % 4 === 0) {
          const root = scale[step % scale.length] / 2;
          this.playWarmChord([root, root * 1.25, root * 1.5], 0.1, 2.5);
        }
        if (step % 2 === 1) {
          const highNote = scale[(step * 2) % scale.length];
          this.playBellNote(highNote, 0.08, 0.9, 'sine');
        }
      } else if (track.type === 'celebration') {
        // Joyful, bouncy birthday waltz/theme
        const chordPattern = [0, 2, 4, 3, 2, 0];
        const note = scale[chordPattern[step % chordPattern.length]];
        this.playBellNote(note, 0.15, 0.8, 'triangle');
        if (step % 3 === 0) {
          this.playBassNote(scale[0] / 2, 0.18, 0.4);
        }
      } else if (track.type === 'strings') {
        // Deep intimate romantic pad & gentle piano
        if (step % 8 === 0) {
          const base = scale[(step / 8) % 4] / 2;
          this.playWarmChord([base, base * 1.2, base * 1.5], 0.12, 3.8);
        }
        if (step % 3 === 0) {
          this.playBellNote(scale[Math.floor(Math.random() * scale.length)], 0.07, 1.6, 'sine');
        }
      } else if (track.type === 'plucks') {
        // Playful pizzicato / marimba bounce
        const pluckIndex = [0, 4, 2, 5, 1, 3, 6, 2][step % 8];
        this.playPluckNote(scale[pluckIndex], 0.14, 0.4);
        if (step % 4 === 0) {
          this.playBassNote(scale[0] / 2, 0.15, 0.35);
        }
      } else if (track.type === 'cosmic') {
        // Grand finale cosmic arpeggio & majestic shimmer
        const cosmicIndex = (step * 2) % scale.length;
        this.playBellNote(scale[cosmicIndex] * (step % 4 === 0 ? 1.5 : 1), 0.1, 1.5, 'sine');
        if (step % 8 === 0) {
          this.playWarmChord([scale[0] / 2, scale[2] / 2, scale[4]], 0.15, 4.0);
        }
      }

      step++;
    };

    // Immediate first beat
    playStep();
    this.schedulerTimer = setInterval(playStep, stepInterval);
  }

  // Instrument: Bell / Music Box tone
  playBellNote(freq, volume = 0.1, duration = 1.0, type = 'sine') {
    if (!this.ctx || !this.musicGain) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
    this.activeNodes.push(osc);
  }

  // Instrument: Warm Pad Chord
  playWarmChord(freqs, volume = 0.08, duration = 2.0) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;

    freqs.forEach(freq => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume / freqs.length, now + 0.4);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.musicGain);

      osc.start(now);
      osc.stop(now + duration + 0.1);
      this.activeNodes.push(osc);
    });
  }

  // Instrument: Bouncy pluck / marimba
  playPluckNote(freq, volume = 0.12, duration = 0.35) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  // Instrument: Soft Bass Note
  playBassNote(freq, volume = 0.15, duration = 0.4) {
    if (!this.ctx || !this.musicGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    gain.gain.setValueAtTime(volume, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.musicGain);

    osc.start(now);
    osc.stop(now + duration + 0.05);
  }

  /* ===================================================================
     INTERACTIVE ACTION SOUND EFFECTS (SFX)
     =================================================================== */

  // Sparkle chime on bubble or card reveal
  playSparkleSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C pentatonic high
    notes.forEach((freq, i) => {
      const delay = i * 0.06;
      setTimeout(() => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.18, now + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.6);

        osc.connect(gain);
        gain.connect(this.sfxGain);

        osc.start(now);
        osc.stop(now + 0.65);
      }, delay * 1000);
    });
  }

  // Balloon pop sound (punch + burst)
  playBalloonPopSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;

    // 1. Low punch
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);

    osc.connect(oscGain);
    oscGain.connect(this.sfxGain);
    osc.start(now);
    osc.stop(now + 0.16);

    // 2. White noise burst for latex snap
    const bufferSize = this.ctx.sampleRate * 0.08;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const noiseFilter = this.ctx.createBiquadFilter();
    noiseFilter.type = 'highpass';
    noiseFilter.frequency.setValueAtTime(800, now);

    const noiseGain = this.ctx.createGain();
    noiseGain.gain.setValueAtTime(0.35, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    whiteNoise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.sfxGain);

    whiteNoise.start(now);
    whiteNoise.stop(now + 0.09);

    // 3. Playful reward chime after pop
    setTimeout(() => this.playSparkleSound(), 80);
  }

  // Candle blow out sound (gentle breath puff + magical chime)
  playCandleBlowSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const bufferSize = this.ctx.sampleRate * 0.4;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(450, now);
    filter.Q.setValueAtTime(1.5, now);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(now);
    noise.stop(now + 0.42);

    // Chime
    setTimeout(() => {
      this.playBellNote(880, 0.15, 1.2, 'sine');
      this.playBellNote(1320, 0.12, 1.5, 'triangle');
    }, 200);
  }

  // Flip polaroid card sound
  playCardFlipSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(640, now + 0.15);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(now);
    osc.stop(now + 0.2);
  }

  // Unwrap gift box sound
  playUnwrapSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;

    const chords = [392.00, 523.25, 659.25, 783.99, 1046.50];
    chords.forEach((note, idx) => {
      setTimeout(() => {
        this.playBellNote(note, 0.16, 0.9, 'triangle');
      }, idx * 70);
    });
  }

  // Hug sent sound (heartfelt warm chord)
  playHugSound() {
    this.init();
    if (!this.ctx || this.isMuted) return;
    this.playWarmChord([261.63, 329.63, 392.00, 523.25], 0.2, 1.8);
    this.playSparkleSound();
  }

  // Custom User Audio File Handler
  loadCustomAudio(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (!this.customAudioElement) {
      this.customAudioElement = new Audio();
      this.customAudioElement.loop = true;
    }
    this.customAudioElement.src = url;
    this.isCustomAudioMode = true;
    this.stopSynthesizer();

    if (this.isPlaying) {
      this.customAudioElement.play().catch(e => console.log('Play err:', e));
    }
  }

  setProceduralMode() {
    this.isCustomAudioMode = false;
    if (this.customAudioElement) {
      this.customAudioElement.pause();
    }
    if (this.isPlaying) {
      this.switchSectionTrack(this.currentTrackIndex >= 0 ? this.currentTrackIndex : 0);
    }
  }
}

// Global instance
window.audioEngine = new BirthdayAudioEngine();
