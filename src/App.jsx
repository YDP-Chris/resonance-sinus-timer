import React, { useState, useEffect, useRef } from 'react';
import ProtocolSelector from './components/ProtocolSelector';
import SessionTimer from './components/SessionTimer';
import SessionComplete from './components/SessionComplete';
import HistoryView from './components/HistoryView';
import AudioEngine from './utils/audioEngine';
import StorageEngine from './utils/storageEngine';

const AppState = {
  LANDING: 'landing',
  PROTOCOL_SELECTION: 'protocol_selection',
  SESSION: 'session',
  COMPLETION: 'completion',
  HISTORY: 'history'
};

function App() {
  const [currentState, setCurrentState] = useState(AppState.LANDING);
  const [selectedProtocol, setSelectedProtocol] = useState(null);
  const [completedSession, setCompletedSession] = useState(null);
  const [settings, setSettings] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [streak, setStreak] = useState(null);
  const [stats, setStats] = useState(null);

  const audioEngineRef = useRef(null);
  const storageEngineRef = useRef(null);

  useEffect(() => {
    // Initialize engines
    audioEngineRef.current = new AudioEngine();
    storageEngineRef.current = new StorageEngine();

    // Load initial data
    loadUserData();

    // Set initial state based on whether user has sessions
    const initialSessions = storageEngineRef.current.getSessions();
    if (initialSessions.length === 0) {
      setCurrentState(AppState.LANDING);
    } else {
      setCurrentState(AppState.PROTOCOL_SELECTION);
    }

    // Cleanup on unmount
    return () => {
      audioEngineRef.current?.destroy();
    };
  }, []);

  const loadUserData = () => {
    const storage = storageEngineRef.current;
    const userSettings = storage.getSettings();
    const userSessions = storage.getSessions();
    const userStreak = storage.getStreak();
    const userStats = storage.getSessionStats();

    setSettings(userSettings);
    setSessions(userSessions);
    setStreak(userStreak);
    setStats(userStats);

    // Set audio volume from settings
    if (audioEngineRef.current && userSettings.volume !== undefined) {
      audioEngineRef.current.setVolume(userSettings.volume);
    }
  };

  const handleProtocolSelect = (protocol) => {
    setSelectedProtocol(protocol);
    setCurrentState(AppState.SESSION);
  };

  const handleSessionComplete = (sessionData) => {
    // Save session to storage
    const storage = storageEngineRef.current;
    const savedSession = storage.saveSession({
      protocol: sessionData.protocol,
      duration: sessionData.totalDuration,
      completedDuration: sessionData.totalDuration,
      completed: true,
      startTime: sessionData.startTime,
      completedAt: sessionData.completedAt
    });

    setCompletedSession(savedSession);

    // Reload user data to get updated stats and streak
    loadUserData();

    setCurrentState(AppState.COMPLETION);
  };

  const handleVolumeChange = (volume) => {
    const storage = storageEngineRef.current;
    const updatedSettings = storage.saveSettings({ volume });
    setSettings(updatedSettings);
    audioEngineRef.current?.setVolume(volume);
  };

  const handleExportData = () => {
    const storage = storageEngineRef.current;
    const exportData = storage.exportData();

    if (exportData) {
      // Create and download file
      const blob = new Blob([exportData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `resonance-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleStartNew = () => {
    setSelectedProtocol(null);
    setCompletedSession(null);
    setCurrentState(AppState.PROTOCOL_SELECTION);
  };

  const handleBackToProtocols = () => {
    setSelectedProtocol(null);
    setCurrentState(AppState.PROTOCOL_SELECTION);
  };

  const handleViewHistory = () => {
    setCurrentState(AppState.HISTORY);
  };

  const handleBackFromHistory = () => {
    setCurrentState(AppState.PROTOCOL_SELECTION);
  };

  const handleGetStarted = () => {
    setCurrentState(AppState.PROTOCOL_SELECTION);
  };

  // Landing page for first-time users
  const renderLanding = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center px-4">
      <div className="w-full max-w-4xl text-center">
        <div className="mb-8">
          <h1 className="text-5xl md:text-7xl font-bold text-gray-800 mb-6">
            Resonance
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-4">
            Science-backed sinus relief through guided humming
          </p>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">
            Experience natural relief from chronic sinusitis using clinically-proven 130Hz frequency therapy.
            No devices needed • Evidence-based protocols • Immediate results
          </p>
        </div>

        <div className="mb-12">
          <button
            onClick={handleGetStarted}
            className="btn-primary text-2xl px-12 py-6"
          >
            Get Started
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="text-3xl mb-4">🧬</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Clinically Proven</h3>
            <p className="text-sm text-gray-600">
              Based on Weitzberg & Lundberg research showing humming increases nasal nitric oxide by 15x
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="text-3xl mb-4">⚡</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Fast Relief</h3>
            <p className="text-sm text-gray-600">
              Quick 5-minute sessions provide immediate sinus drainage and enhanced breathing
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
            <div className="text-3xl mb-4">📱</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Simple & Free</h3>
            <p className="text-sm text-gray-600">
              Works on any device with audio. No downloads, accounts, or expensive equipment needed
            </p>
          </div>
        </div>

        <div className="p-6 bg-blue-50 rounded-xl border border-blue-200 max-w-2xl mx-auto">
          <h3 className="text-lg font-semibold text-blue-800 mb-3">How It Works</h3>
          <p className="text-sm text-blue-700 text-left">
            Humming at the optimal 130Hz frequency creates vibrations that increase nitric oxide production
            in your sinuses by up to 15 times normal levels. This natural antimicrobial compound promotes
            drainage, reduces inflammation, and enhances overall sinus health through targeted resonance therapy.
          </p>
        </div>
      </div>
    </div>
  );

  const renderCurrentState = () => {
    switch (currentState) {
      case AppState.LANDING:
        return renderLanding();

      case AppState.PROTOCOL_SELECTION:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full py-8">
              <ProtocolSelector
                selectedProtocol={selectedProtocol}
                onSelectProtocol={handleProtocolSelect}
              />

              {sessions.length > 0 && (
                <div className="text-center mt-8">
                  <button
                    onClick={handleViewHistory}
                    className="btn-secondary"
                  >
                    View Session History
                  </button>
                </div>
              )}
            </div>
          </div>
        );

      case AppState.SESSION:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full py-8">
              <SessionTimer
                protocol={selectedProtocol}
                onSessionComplete={handleSessionComplete}
                onBack={handleBackToProtocols}
                audioEngine={audioEngineRef.current}
                settings={{
                  ...settings,
                  onVolumeChange: handleVolumeChange
                }}
              />
            </div>
          </div>
        );

      case AppState.COMPLETION:
        return (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="w-full py-8">
              <SessionComplete
                sessionData={completedSession}
                onStartNew={handleStartNew}
                onViewHistory={handleViewHistory}
                streak={streak}
                stats={stats}
              />
            </div>
          </div>
        );

      case AppState.HISTORY:
        return (
          <div className="min-h-screen bg-gray-50 py-8 px-4">
            <HistoryView
              sessions={sessions}
              stats={stats}
              onBack={handleBackFromHistory}
              onExportData={handleExportData}
            />
          </div>
        );

      default:
        return renderLanding();
    }
  };

  return (
    <div className="App">
      {renderCurrentState()}
    </div>
  );
}

export default App;
