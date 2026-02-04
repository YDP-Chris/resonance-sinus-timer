import React from 'react';

const protocols = [
  {
    id: 'quick',
    name: 'Quick Practice',
    duration: 5 * 60, // 5 minutes
    description: 'Bhramari-style mindful humming',
    details: '5 minutes of guided humming with breathing cues every 30 seconds. Perfect for daily practice.',
    icon: '⚡',
    color: 'bg-blue-50 border-blue-200'
  },
  {
    id: 'intensive',
    name: 'Intensive Protocol',
    duration: 60 * 60, // 60 minutes
    description: 'Extended Eby protocol session',
    details: '60 minutes of continuous humming therapy. Breathing cues every 2 minutes for sustained relief.',
    icon: '🎯',
    color: 'bg-green-50 border-green-200'
  }
];

const ProtocolSelector = ({ selectedProtocol, onSelectProtocol, disabled = false }) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Choose Your Practice</h2>
        <p className="text-gray-600">
          Select a humming protocol based on your available time and needs
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {protocols.map((protocol) => (
          <div
            key={protocol.id}
            onClick={() => !disabled && onSelectProtocol(protocol)}
            className={`
              protocol-card
              ${selectedProtocol?.id === protocol.id ? 'selected' : ''}
              ${protocol.color}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              transition-all duration-200
            `}
            role="button"
            tabIndex={disabled ? -1 : 0}
            aria-label={`Select ${protocol.name} protocol`}
            onKeyDown={(e) => {
              if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
                e.preventDefault();
                onSelectProtocol(protocol);
              }
            }}
          >
            <div className="flex items-start space-x-4">
              <div className="text-3xl flex-shrink-0 mt-1">
                {protocol.icon}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {protocol.name}
                  </h3>
                  <span className="text-sm font-medium text-gray-600 bg-white px-2 py-1 rounded">
                    {protocol.duration >= 3600
                      ? `${protocol.duration / 3600}h`
                      : `${protocol.duration / 60}min`
                    }
                  </span>
                </div>

                <p className="text-sm text-gray-600 mb-3 font-medium">
                  {protocol.description}
                </p>

                <p className="text-xs text-gray-500 leading-relaxed">
                  {protocol.details}
                </p>
              </div>
            </div>

            {selectedProtocol?.id === protocol.id && (
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex items-center text-sm text-resonance-blue">
                  <svg
                    className="w-4 h-4 mr-2 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="font-semibold">Selected</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start space-x-3">
          <div className="text-blue-600 flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-800 mb-1">
              Clinical Foundation
            </h4>
            <p className="text-sm text-blue-700">
              Based on Weitzberg & Lundberg research showing humming increases nasal nitric oxide by 15x,
              providing natural sinus relief through enhanced airflow and reduced inflammation.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProtocolSelector;