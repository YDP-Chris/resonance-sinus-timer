import React, { useState, useEffect, useRef } from 'react';
import TimerEngine from '../utils/timerEngine';

const SessionTimer = ({
  protocol,
  onSessionComplete,
  onBack,
  audioEngine,
  settings
}) => {
  const [timerState, setTimerState] = useState({
    remainingTime: protocol?.duration || 0,
    totalDuration: protocol?.duration || 0,
    progress: 0,
    isRunning: false,
    isPaused: false,
    elapsed: 0
  });

  const [showBreathingCue, setShowBreathingCue] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [audioError, setAudioError] = useState(null);

  const timerRef = useRef(null);
  const breathingCueTimeoutRef = useRef(null);

  useEffect(() => {
    // Initialize timer engine
    timerRef.current = new TimerEngine(
      (state) => setTimerState(state), // onUpdate
      (completionData) => { // onComplete
        handleSessionComplete(completionData);
      },
      () => { // onBreathingCue
        if (settings?.breathingCuesEnabled !== false) {
          showBreathingCueOverlay();
        }
      }
    );

    // Handle page visibility changes
    const handleVisibilityChange = () => {
      timerRef.current?.handleVisibilityChange();
      audioEngine?.handleVisibilityChange();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      timerRef.current?.destroy();
      audioEngine?.stop();
      if (breathingCueTimeoutRef.current) {
        clearTimeout(breathingCueTimeoutRef.current);
      }
    };
  }, []);

  const showBreathingCueOverlay = () => {
    if (breathingCueTimeoutRef.current) {
      clearTimeout(breathingCueTimeoutRef.current);
    }

    setShowBreathingCue(true);
    breathingCueTimeoutRef.current = setTimeout(() => {
      setShowBreathingCue(false);
    }, 3000); // Show for 3 seconds
  };

  const handleSessionComplete = (completionData) => {
    setIsAudioPlaying(false);
    audioEngine?.stop();
    onSessionComplete(completionData);
  };

  const startSession = async () => {
    if (!sessionStarted) {
      // First start - initialize audio and timer
      const audioStarted = await audioEngine?.start();
      if (!audioStarted && audioEngine?.isAudioSupported()) {
        setAudioError('Unable to start audio. Please check your browser settings and try again.');
        return;
      }

      setIsAudioPlaying(audioStarted);
      timerRef.current?.start(protocol.duration, protocol.id);
      setSessionStarted(true);
    } else if (timerState.isPaused) {
      // Resume paused session
      const audioStarted = await audioEngine?.start();
      setIsAudioPlaying(audioStarted);
      timerRef.current?.resume();
    }
  };

  const pauseSession = () => {
    audioEngine?.stop();
    setIsAudioPlaying(false);
    timerRef.current?.pause();
  };

  const stopSession = () => {
    audioEngine?.stop();
    setIsAudioPlaying(false);
    timerRef.current?.stop();
    setSessionStarted(false);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressColor = () => {
    if (timerState.progress < 25) return 'text-blue-500';
    if (timerState.progress < 50) return 'text-green-500';
    if (timerState.progress < 75) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <button
          onClick={onBack}
          className="mb-4 text-gray-600 hover:text-gray-800 transition-colors flex items-center mx-auto"
          aria-label="Go back to protocol selection"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Protocols
        </button>

        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          {protocol?.name}
        </h2>
        <p className="text-gray-600">
          {protocol?.description} • 130Hz Reference Tone
        </p>
      </div>

      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="timer-display mb-4">
          {formatTime(timerState.remainingTime)}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
          <div
            className={`h-3 rounded-full transition-all duration-1000 ${
              timerState.progress < 25 ? 'bg-blue-500' :
              timerState.progress < 50 ? 'bg-green-500' :
              timerState.progress < 75 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${timerState.progress}%` }}
            role="progressbar"
            aria-valuenow={timerState.progress}
            aria-valuemin="0"
            aria-valuemax="100"
            aria-label={`Session progress: ${Math.round(timerState.progress)}%`}
          />
        </div>

        <p className="text-sm text-gray-600">
          {Math.round(timerState.progress)}% Complete • {formatTime(timerState.elapsed)} elapsed
        </p>
      </div>

      {/* Control Buttons */}
      <div className="flex justify-center space-x-4 mb-8">
        {!timerState.isRunning ? (
          <button
            onClick={startSession}
            className="btn-primary text-lg px-8 py-4"
            disabled={!protocol}
            aria-label="Start session"
          >
            <div className="flex items-center space-x-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              <span>{sessionStarted ? 'Resume' : 'Start Session'}</span>
            </div>
          </button>
        ) : (
          <>
            <button
              onClick={pauseSession}
              className="btn-secondary text-lg px-8 py-4"
              aria-label="Pause session"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span>Pause</span>
              </div>
            </button>

            <button
              onClick={stopSession}
              className="bg-red-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-600 transition-colors focus:ring-4 focus:ring-red-300 focus:outline-none"
              aria-label="Stop session"
            >
              <div className="flex items-center space-x-2">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                </svg>
                <span>Stop</span>
              </div>
            </button>
          </>
        )}
      </div>

      {/* Audio Status */}
      <div className="flex justify-center items-center space-x-4 mb-6">
        <div className="flex items-center space-x-2 text-sm">
          <div className={`w-3 h-3 rounded-full ${
            isAudioPlaying ? 'bg-green-500 animate-pulse-gentle' : 'bg-gray-400'
          }`} />
          <span className="text-gray-600">
            130Hz Tone: {isAudioPlaying ? 'Playing' : 'Stopped'}
          </span>
        </div>

        {audioEngine?.isAudioSupported() && (
          <div className="flex items-center space-x-2">
            <label htmlFor="volume-slider" className="text-sm text-gray-600">
              Volume:
            </label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="100"
              value={Math.round((settings?.volume || 0.3) * 100)}
              onChange={(e) => {
                const volume = parseInt(e.target.value) / 100;
                audioEngine?.setVolume(volume);
                // Save volume setting would be handled by parent component
              }}
              className="w-20"
              aria-label="Audio volume control"
            />
          </div>
        )}
      </div>

      {/* Error Messages */}
      {audioError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-red-800">Audio Error</h4>
              <p className="text-sm text-red-700">{audioError}</p>
            </div>
          </div>
        </div>
      )}

      {!audioEngine?.isAudioSupported() && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <svg className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-semibold text-yellow-800">Audio Not Supported</h4>
              <p className="text-sm text-yellow-700">
                Your browser doesn't support Web Audio API. The timer will still work, but you won't hear the 130Hz reference tone.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">How to Practice</h3>
        <ol className="space-y-2 text-sm text-blue-700">
          <li className="flex items-start space-x-2">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
              1
            </span>
            <span>Find a comfortable seated position with your back straight.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
              2
            </span>
            <span>Close your mouth and hum along with the 130Hz reference tone.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
              3
            </span>
            <span>Breathe in through your nose between hums, as guided by the cues.</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="bg-blue-200 text-blue-800 rounded-full w-5 h-5 flex items-center justify-center text-xs font-semibold flex-shrink-0 mt-0.5">
              4
            </span>
            <span>Continue until the session completes naturally.</span>
          </li>
        </ol>
      </div>

      {/* Breathing Cue Overlay */}
      {showBreathingCue && (
        <div className="breathing-cue">
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">💨 Breathing Cue</div>
            <div>Inhale through your nose, then hum with the tone</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SessionTimer;