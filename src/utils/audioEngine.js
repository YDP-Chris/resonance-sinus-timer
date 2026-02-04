class AudioEngine {
  constructor() {
    this.audioContext = null;
    this.oscillator = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.volume = 0.3; // Default volume at 30%
    this.frequency = 130; // 130Hz for sinus relief
  }

  async initialize() {
    try {
      // Create audio context with better browser compatibility
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();

      // Handle suspended context (required for mobile browsers)
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      return false;
    }
  }

  async start() {
    if (!this.audioContext) {
      const initialized = await this.initialize();
      if (!initialized) return false;
    }

    try {
      // Stop any existing oscillator
      this.stop();

      // Create oscillator and gain node
      this.oscillator = this.audioContext.createOscillator();
      this.gainNode = this.audioContext.createGain();

      // Configure oscillator
      this.oscillator.type = 'sine';
      this.oscillator.frequency.setValueAtTime(this.frequency, this.audioContext.currentTime);

      // Configure gain
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

      // Connect nodes
      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      // Start oscillator
      this.oscillator.start(this.audioContext.currentTime);
      this.isPlaying = true;

      return true;
    } catch (error) {
      console.error('Audio start failed:', error);
      return false;
    }
  }

  stop() {
    if (this.oscillator && this.isPlaying) {
      try {
        this.oscillator.stop(this.audioContext.currentTime);
      } catch (error) {
        // Oscillator might already be stopped
        console.warn('Oscillator stop warning:', error);
      }
      this.oscillator = null;
      this.isPlaying = false;
    }
  }

  setVolume(volume) {
    // Volume should be between 0 and 1
    this.volume = Math.max(0, Math.min(1, volume));

    if (this.gainNode && this.isPlaying) {
      // Smooth volume transition
      this.gainNode.gain.exponentialRampToValueAtTime(
        this.volume || 0.001, // Avoid zero for exponential ramp
        this.audioContext.currentTime + 0.1
      );
    }
  }

  getVolume() {
    return this.volume;
  }

  isAudioSupported() {
    return !!(window.AudioContext || window.webkitAudioContext);
  }

  getFrequency() {
    return this.frequency;
  }

  // Handle page visibility changes
  handleVisibilityChange() {
    if (document.hidden && this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    } else if (!document.hidden && this.audioContext && this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
  }

  // Clean up resources
  destroy() {
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
  }
}

export default AudioEngine;