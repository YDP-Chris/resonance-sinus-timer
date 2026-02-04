class TimerEngine {
  constructor(onUpdate, onComplete, onBreathingCue) {
    this.onUpdate = onUpdate || (() => {});
    this.onComplete = onComplete || (() => {});
    this.onBreathingCue = onBreathingCue || (() => {});

    this.totalDuration = 0; // Total session duration in seconds
    this.remainingTime = 0; // Time remaining in seconds
    this.isRunning = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedTime = 0; // Total time spent paused

    this.intervalId = null;
    this.breathingCueIntervals = [];
    this.protocol = null;
  }

  start(duration, protocol = 'quick') {
    this.totalDuration = duration;
    this.remainingTime = duration;
    this.protocol = protocol;
    this.startTime = Date.now();
    this.pausedTime = 0;
    this.isRunning = true;
    this.isPaused = false;

    // Set up breathing cue intervals based on protocol
    this.setupBreathingCues();

    // Start the main timer
    this.intervalId = setInterval(() => {
      if (!this.isPaused && this.isRunning) {
        this.remainingTime -= 1;

        // Calculate progress
        const progress = ((this.totalDuration - this.remainingTime) / this.totalDuration) * 100;

        // Call update callback
        this.onUpdate({
          remainingTime: this.remainingTime,
          totalDuration: this.totalDuration,
          progress: Math.min(100, Math.max(0, progress)),
          isRunning: this.isRunning,
          isPaused: this.isPaused,
          elapsed: this.totalDuration - this.remainingTime
        });

        // Check for completion
        if (this.remainingTime <= 0) {
          this.complete();
        }
      }
    }, 1000);

    // Initial update
    this.onUpdate({
      remainingTime: this.remainingTime,
      totalDuration: this.totalDuration,
      progress: 0,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      elapsed: 0
    });
  }

  setupBreathingCues() {
    // Clear existing intervals
    this.breathingCueIntervals.forEach(id => clearInterval(id));
    this.breathingCueIntervals = [];

    // Set interval based on protocol
    const cueInterval = this.protocol === 'quick' ? 30 : 120; // 30s for quick, 2min for intensive

    // Schedule breathing cues
    let nextCueTime = cueInterval;
    while (nextCueTime < this.totalDuration) {
      const cueId = setTimeout(() => {
        if (this.isRunning && !this.isPaused) {
          this.onBreathingCue();
        }
      }, nextCueTime * 1000);

      this.breathingCueIntervals.push(cueId);
      nextCueTime += cueInterval;
    }
  }

  pause() {
    if (this.isRunning && !this.isPaused) {
      this.isPaused = true;
      this.onUpdate({
        remainingTime: this.remainingTime,
        totalDuration: this.totalDuration,
        progress: ((this.totalDuration - this.remainingTime) / this.totalDuration) * 100,
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        elapsed: this.totalDuration - this.remainingTime
      });
    }
  }

  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.onUpdate({
        remainingTime: this.remainingTime,
        totalDuration: this.totalDuration,
        progress: ((this.totalDuration - this.remainingTime) / this.totalDuration) * 100,
        isRunning: this.isRunning,
        isPaused: this.isPaused,
        elapsed: this.totalDuration - this.remainingTime
      });
    }
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;

    // Clear main interval
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    // Clear breathing cue intervals
    this.breathingCueIntervals.forEach(id => clearTimeout(id));
    this.breathingCueIntervals = [];

    this.onUpdate({
      remainingTime: this.remainingTime,
      totalDuration: this.totalDuration,
      progress: this.remainingTime === 0 ? 100 : ((this.totalDuration - this.remainingTime) / this.totalDuration) * 100,
      isRunning: false,
      isPaused: false,
      elapsed: this.totalDuration - this.remainingTime
    });
  }

  complete() {
    const wasCompleted = this.remainingTime <= 0;
    this.stop();

    if (wasCompleted) {
      this.onComplete({
        totalDuration: this.totalDuration,
        protocol: this.protocol,
        completedAt: new Date().toISOString(),
        startTime: this.startTime
      });
    }
  }

  reset() {
    this.stop();
    this.remainingTime = 0;
    this.totalDuration = 0;
    this.startTime = null;
    this.pausedTime = 0;
    this.protocol = null;
  }

  // Get current status
  getStatus() {
    return {
      remainingTime: this.remainingTime,
      totalDuration: this.totalDuration,
      progress: this.totalDuration > 0 ? ((this.totalDuration - this.remainingTime) / this.totalDuration) * 100 : 0,
      isRunning: this.isRunning,
      isPaused: this.isPaused,
      elapsed: this.totalDuration - this.remainingTime,
      protocol: this.protocol
    };
  }

  // Format time as MM:SS
  static formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Handle page visibility changes
  handleVisibilityChange() {
    if (document.hidden) {
      // Page is hidden, pause timing precision may be reduced
      this.lastVisibleTime = Date.now();
    } else if (this.lastVisibleTime && this.isRunning && !this.isPaused) {
      // Page is visible again, adjust for any time drift
      const hiddenDuration = Math.floor((Date.now() - this.lastVisibleTime) / 1000);
      if (hiddenDuration > 0 && hiddenDuration < 10) { // Only adjust for small drifts
        this.remainingTime = Math.max(0, this.remainingTime - hiddenDuration);
      }
      this.lastVisibleTime = null;
    }
  }

  // Cleanup
  destroy() {
    this.stop();
  }
}

export default TimerEngine;