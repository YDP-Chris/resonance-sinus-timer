class StorageEngine {
  constructor() {
    this.SESSIONS_KEY = 'resonance_sessions';
    this.SETTINGS_KEY = 'resonance_settings';
    this.STREAK_KEY = 'resonance_streak';
    this.MAX_SESSIONS = 100;
    this.RETENTION_MONTHS = 6;
  }

  // Session Management
  saveSession(sessionData) {
    try {
      const sessions = this.getSessions();

      const session = {
        id: this.generateUUID(),
        date: new Date().toISOString(),
        ...sessionData,
        timestamp: Date.now()
      };

      sessions.unshift(session); // Add to beginning

      // Trim to max sessions and retention period
      const trimmedSessions = this.trimSessions(sessions);

      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(trimmedSessions));

      // Update streak
      this.updateStreak(session);

      return session;
    } catch (error) {
      console.error('Failed to save session:', error);
      this.handleStorageError(error);
      return null;
    }
  }

  getSessions() {
    try {
      const sessions = localStorage.getItem(this.SESSIONS_KEY);
      return sessions ? JSON.parse(sessions) : [];
    } catch (error) {
      console.error('Failed to get sessions:', error);
      return [];
    }
  }

  trimSessions(sessions) {
    // Sort by timestamp (newest first)
    sessions.sort((a, b) => b.timestamp - a.timestamp);

    // Keep only recent sessions within retention period
    const retentionCutoff = Date.now() - (this.RETENTION_MONTHS * 30 * 24 * 60 * 60 * 1000);
    const recentSessions = sessions.filter(session => session.timestamp > retentionCutoff);

    // Limit to max sessions
    return recentSessions.slice(0, this.MAX_SESSIONS);
  }

  // Streak Management
  updateStreak(session) {
    try {
      const streak = this.getStreak();
      const today = new Date().toDateString();
      const sessionDate = new Date(session.date).toDateString();

      if (sessionDate === today) {
        if (!streak.lastSessionDate || streak.lastSessionDate !== today) {
          // First session today
          if (this.isConsecutiveDay(streak.lastSessionDate, today)) {
            streak.currentStreak += 1;
          } else {
            streak.currentStreak = 1;
          }

          streak.lastSessionDate = today;
          streak.longestStreak = Math.max(streak.longestStreak, streak.currentStreak);
        }
      }

      localStorage.setItem(this.STREAK_KEY, JSON.stringify(streak));
    } catch (error) {
      console.error('Failed to update streak:', error);
    }
  }

  getStreak() {
    try {
      const streak = localStorage.getItem(this.STREAK_KEY);
      return streak ? JSON.parse(streak) : {
        currentStreak: 0,
        longestStreak: 0,
        lastSessionDate: null
      };
    } catch (error) {
      console.error('Failed to get streak:', error);
      return { currentStreak: 0, longestStreak: 0, lastSessionDate: null };
    }
  }

  isConsecutiveDay(lastDate, currentDate) {
    if (!lastDate) return false;

    const last = new Date(lastDate);
    const current = new Date(currentDate);
    const diffTime = Math.abs(current - last);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays === 1;
  }

  // Settings Management
  saveSettings(settings) {
    try {
      const currentSettings = this.getSettings();
      const updatedSettings = { ...currentSettings, ...settings };
      localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Failed to save settings:', error);
      this.handleStorageError(error);
      return this.getSettings();
    }
  }

  getSettings() {
    try {
      const settings = localStorage.getItem(this.SETTINGS_KEY);
      return settings ? JSON.parse(settings) : {
        volume: 0.3,
        breathingCuesEnabled: true,
        defaultProtocol: 'quick',
        theme: 'light',
        lastSession: null
      };
    } catch (error) {
      console.error('Failed to get settings:', error);
      return {
        volume: 0.3,
        breathingCuesEnabled: true,
        defaultProtocol: 'quick',
        theme: 'light',
        lastSession: null
      };
    }
  }

  // Statistics
  getSessionStats() {
    const sessions = this.getSessions();
    const streak = this.getStreak();

    const totalSessions = sessions.length;
    const totalTime = sessions.reduce((sum, session) =>
      sum + (session.completedDuration || session.duration || 0), 0
    );

    const completedSessions = sessions.filter(s => s.completed).length;
    const completionRate = totalSessions > 0 ? (completedSessions / totalSessions) * 100 : 0;

    // Weekly stats (last 7 days)
    const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
    const weeklySessions = sessions.filter(s => s.timestamp > weekAgo);

    // Monthly stats (last 30 days)
    const monthAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    const monthlySessions = sessions.filter(s => s.timestamp > monthAgo);

    return {
      totalSessions,
      totalTime,
      completionRate: Math.round(completionRate),
      currentStreak: streak.currentStreak,
      longestStreak: streak.longestStreak,
      weeklySessions: weeklySessions.length,
      monthlySessions: monthlySessions.length,
      averageSessionLength: totalSessions > 0 ? Math.round(totalTime / totalSessions) : 0
    };
  }

  // Data Export
  exportData() {
    try {
      const data = {
        sessions: this.getSessions(),
        settings: this.getSettings(),
        streak: this.getStreak(),
        exportDate: new Date().toISOString(),
        version: '1.0'
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Failed to export data:', error);
      return null;
    }
  }

  // Data Import
  importData(jsonString) {
    try {
      const data = JSON.parse(jsonString);

      if (data.sessions) {
        localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(data.sessions));
      }

      if (data.settings) {
        localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(data.settings));
      }

      if (data.streak) {
        localStorage.setItem(this.STREAK_KEY, JSON.stringify(data.streak));
      }

      return true;
    } catch (error) {
      console.error('Failed to import data:', error);
      return false;
    }
  }

  // Error Handling
  handleStorageError(error) {
    if (error.name === 'QuotaExceededError') {
      console.warn('Storage quota exceeded, cleaning up old sessions');
      this.cleanupOldData();
    }
  }

  cleanupOldData() {
    try {
      const sessions = this.getSessions();
      const recentSessions = sessions.slice(0, Math.floor(this.MAX_SESSIONS / 2));
      localStorage.setItem(this.SESSIONS_KEY, JSON.stringify(recentSessions));
    } catch (error) {
      console.error('Failed to cleanup old data:', error);
    }
  }

  // Utility Functions
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  formatDuration(seconds) {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    } else {
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  }

  // Check storage availability
  isStorageAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (error) {
      return false;
    }
  }

  // Clear all data
  clearAllData() {
    try {
      localStorage.removeItem(this.SESSIONS_KEY);
      localStorage.removeItem(this.SETTINGS_KEY);
      localStorage.removeItem(this.STREAK_KEY);
      return true;
    } catch (error) {
      console.error('Failed to clear data:', error);
      return false;
    }
  }
}

export default StorageEngine;