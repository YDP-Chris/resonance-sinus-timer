import React, { useState } from 'react';

const HistoryView = ({ sessions, stats, onBack, onExportData }) => {
  const [showExportSuccess, setShowExportSuccess] = useState(false);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (seconds) => {
    if (seconds >= 3600) {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${minutes}m`;
    } else {
      const minutes = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }
  };

  const handleExport = () => {
    try {
      if (onExportData) {
        onExportData();
        setShowExportSuccess(true);
        setTimeout(() => setShowExportSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const groupSessionsByDate = (sessions) => {
    const grouped = {};
    sessions.forEach(session => {
      const date = new Date(session.date).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(session);
    });
    return grouped;
  };

  const groupedSessions = groupSessionsByDate(sessions || []);
  const sortedDates = Object.keys(groupedSessions).sort((a, b) => new Date(b) - new Date(a));

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 transition-colors flex items-center"
            aria-label="Go back"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">Session History</h1>
        </div>

        <button
          onClick={handleExport}
          className="btn-secondary"
          aria-label="Export session data"
        >
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Export Data</span>
          </div>
        </button>
      </div>

      {showExportSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 8.707 7.621a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0z" clipRule="evenodd" />
            </svg>
            <span className="text-green-800 font-medium">Data exported successfully!</span>
          </div>
        </div>
      )}

      {/* Stats Overview */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {stats.totalSessions}
            </div>
            <div className="text-sm text-gray-600">Total Sessions</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {formatDuration(stats.totalTime)}
            </div>
            <div className="text-sm text-gray-600">Total Practice Time</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-2xl font-bold text-purple-600 mb-1">
              {stats.currentStreak}
            </div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border border-gray-200">
            <div className="text-2xl font-bold text-orange-600 mb-1">
              {stats.completionRate}%
            </div>
            <div className="text-sm text-gray-600">Completion Rate</div>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions && sessions.length > 0 ? (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800">
                  {formatDate(date)}
                </h3>
                <p className="text-sm text-gray-600">
                  {groupedSessions[date].length} session{groupedSessions[date].length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {groupedSessions[date].map((session, index) => (
                  <div key={session.id || index} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="text-2xl">
                        {session.protocol === 'quick' ? '⚡' : '🎯'}
                      </div>

                      <div>
                        <div className="font-medium text-gray-800">
                          {session.protocol === 'quick' ? 'Quick Practice' : 'Intensive Protocol'}
                        </div>
                        <div className="text-sm text-gray-600">
                          {formatTime(session.date)} • {formatDuration(session.duration || session.completedDuration || 0)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {session.completed ? (
                        <div className="flex items-center space-x-2 text-green-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 8.707 7.621a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Completed</span>
                        </div>
                      ) : (
                        <div className="flex items-center space-x-2 text-yellow-600">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Incomplete</span>
                        </div>
                      )}

                      <div className="text-sm text-gray-500">
                        130Hz
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 text-gray-300">📊</div>
          <h3 className="text-xl font-semibold text-gray-600 mb-2">
            No Sessions Yet
          </h3>
          <p className="text-gray-500 mb-6">
            Complete your first humming session to start tracking your progress.
          </p>
          <button
            onClick={onBack}
            className="btn-primary"
          >
            Start Your First Session
          </button>
        </div>
      )}

      {/* Additional Stats */}
      {sessions && sessions.length > 0 && (
        <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
          <h3 className="text-lg font-semibold text-blue-800 mb-4">Progress Insights</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <div className="font-medium text-blue-700 mb-1">Recent Activity</div>
              <div className="text-blue-600">
                {stats?.weeklySessions || 0} sessions this week • {stats?.monthlySessions || 0} sessions this month
              </div>
            </div>
            <div>
              <div className="font-medium text-blue-700 mb-1">Practice Patterns</div>
              <div className="text-blue-600">
                Average session: {formatDuration(stats?.averageSessionLength || 0)}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HistoryView;