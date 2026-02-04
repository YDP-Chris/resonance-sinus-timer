import React, { useEffect } from 'react';

const SessionComplete = ({
  sessionData,
  onStartNew,
  onViewHistory,
  streak,
  stats
}) => {
  useEffect(() => {
    // Celebrate completion with a small animation delay
    const timer = setTimeout(() => {
      // Could trigger confetti or other celebration animation here
    }, 500);

    return () => clearTimeout(timer);
  }, []);

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

  const getEncouragementMessage = () => {
    if (streak?.currentStreak === 1) {
      return "Great start! You've completed your first session.";
    } else if (streak?.currentStreak <= 3) {
      return "Building momentum! Keep up the great work.";
    } else if (streak?.currentStreak <= 7) {
      return "Fantastic progress! You're developing a healthy habit.";
    } else if (streak?.currentStreak <= 14) {
      return "Outstanding dedication! Your sinuses thank you.";
    } else if (streak?.currentStreak <= 30) {
      return "Incredible consistency! You're a humming therapy champion.";
    } else {
      return "Legendary commitment! You've mastered the art of sinus relief.";
    }
  };

  const isNewStreak = sessionData && streak?.currentStreak > 1;
  const isNewRecord = sessionData && streak?.currentStreak === streak?.longestStreak;

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* Celebration Header */}
      <div className="mb-8">
        <div className="text-6xl mb-4 animate-bounce">
          🎉
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Session Complete!
        </h1>
        <p className="text-xl text-gray-600">
          {getEncouragementMessage()}
        </p>
      </div>

      {/* Session Summary */}
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6 border-2 border-green-200">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Duration */}
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {formatDuration(sessionData?.totalDuration || 0)}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Session Duration
            </div>
          </div>

          {/* Protocol */}
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {sessionData?.protocol === 'quick' ? '⚡' : '🎯'}
            </div>
            <div className="text-sm text-gray-600 font-medium">
              {sessionData?.protocol === 'quick' ? 'Quick Practice' : 'Intensive Protocol'}
            </div>
          </div>

          {/* Frequency */}
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              130Hz
            </div>
            <div className="text-sm text-gray-600 font-medium">
              Reference Tone
            </div>
          </div>
        </div>
      </div>

      {/* Streak Information */}
      {streak && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-6 mb-6 border-2 border-blue-200">
          <div className="flex items-center justify-center space-x-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-1">
                {streak.currentStreak}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Current Streak
                {isNewStreak && (
                  <span className="inline-block ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    +1
                  </span>
                )}
              </div>
            </div>

            <div className="text-4xl text-gray-400">
              🔥
            </div>

            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-1">
                {streak.longestStreak}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Best Streak
                {isNewRecord && (
                  <span className="inline-block ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    NEW!
                  </span>
                )}
              </div>
            </div>
          </div>

          {isNewRecord && streak.currentStreak > 1 && (
            <div className="mt-4 p-3 bg-green-100 rounded-lg">
              <div className="flex items-center justify-center space-x-2 text-green-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.293l-3-3a1 1 0 00-1.414 1.414L10.586 9.5 8.707 7.621a1 1 0 00-1.414 1.414l3 3a1 1 0 001.414 0z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">New personal record!</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Progress Stats */}
      {stats && (
        <div className="bg-gray-50 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-gray-700">
                {stats.totalSessions}
              </div>
              <div className="text-xs text-gray-600">Total Sessions</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">
                {formatDuration(stats.totalTime)}
              </div>
              <div className="text-xs text-gray-600">Total Time</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">
                {stats.completionRate}%
              </div>
              <div className="text-xs text-gray-600">Completion Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-700">
                {stats.weeklySessions}
              </div>
              <div className="text-xs text-gray-600">This Week</div>
            </div>
          </div>
        </div>
      )}

      {/* Clinical Benefits Reminder */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8 border border-blue-200">
        <h3 className="text-lg font-semibold text-blue-800 mb-3">
          What You Just Accomplished
        </h3>
        <div className="text-left space-y-2 text-sm text-blue-700">
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>Increased nasal nitric oxide production by up to 15x</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>Enhanced sinus ventilation and drainage</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>Promoted natural antimicrobial activity in nasal passages</span>
          </div>
          <div className="flex items-start space-x-3">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <span>Supported overall respiratory health through targeted frequency therapy</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onStartNew}
          className="btn-primary text-lg px-8 py-4"
          aria-label="Start a new session"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
            <span>Start New Session</span>
          </div>
        </button>

        <button
          onClick={onViewHistory}
          className="btn-secondary text-lg px-8 py-4"
          aria-label="View session history"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
            </svg>
            <span>View History</span>
          </div>
        </button>
      </div>

      {/* Next Session Suggestion */}
      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          💡 For Best Results
        </h4>
        <p className="text-sm text-gray-600">
          {sessionData?.protocol === 'quick'
            ? 'Try practicing 2-3 times daily for consistent sinus relief. Consider the Intensive Protocol for acute symptoms.'
            : 'Daily intensive sessions can provide significant relief. Supplement with Quick Practice sessions as needed.'
          }
        </p>
      </div>
    </div>
  );
};

export default SessionComplete;