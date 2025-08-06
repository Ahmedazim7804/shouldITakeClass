import React, { useState } from 'react';
import { X, Settings } from 'lucide-react';
import { UserPreferences } from '../types';

interface PreferencesFormProps {
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
  onClose: () => void;
}

export const PreferencesForm: React.FC<PreferencesFormProps> = ({
  preferences,
  onSave,
  onClose
}) => {
  const [formData, setFormData] = useState<UserPreferences>(preferences);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="w-5 h-5" />
            AI Preferences
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Gap Preferences */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maximum Gap Between Classes (minutes)
            </label>
            <input
              type="number"
              value={formData.maxGapBetweenClasses}
              onChange={(e) => setFormData({
                ...formData,
                maxGapBetweenClasses: parseInt(e.target.value) || 120
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              min="30"
              max="480"
            />
            <p className="text-xs text-gray-500 mt-1">
              AI will suggest skipping classes if gaps exceed this duration
            </p>
          </div>

          {/* Preferred Days Off */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preferred Days Off
            </label>
            <div className="grid grid-cols-2 gap-2">
              {days.map(day => (
                <label key={day} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.preferredDaysOff.includes(day)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({
                          ...formData,
                          preferredDaysOff: [...formData.preferredDaysOff, day]
                        });
                      } else {
                        setFormData({
                          ...formData,
                          preferredDaysOff: formData.preferredDaysOff.filter(d => d !== day)
                        });
                      }
                    }}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{day}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Weather Sensitivity */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Weather Sensitivity
            </label>
            <select
              value={formData.weatherSensitivity}
              onChange={(e) => setFormData({
                ...formData,
                weatherSensitivity: e.target.value as 'low' | 'medium' | 'high'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="low">Low - Weather doesn't affect decisions</option>
              <option value="medium">Medium - Consider weather for long commutes</option>
              <option value="high">High - Avoid travel in bad weather</option>
            </select>
          </div>

          {/* Commute Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Primary Commute Mode
            </label>
            <select
              value={formData.commuteMode}
              onChange={(e) => setFormData({
                ...formData,
                commuteMode: e.target.value as 'car' | 'public' | 'bike' | 'walk'
              })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="car">Car</option>
              <option value="public">Public Transport</option>
              <option value="bike">Bike</option>
              <option value="walk">Walk</option>
            </select>
          </div>

          {/* Study Patterns */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-700">Study Patterns</h3>
            
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.studyPatterns.morningPerson}
                onChange={(e) => setFormData({
                  ...formData,
                  studyPatterns: {
                    ...formData.studyPatterns,
                    morningPerson: e.target.checked
                  }
                })}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">I'm a morning person</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preferred Study Days
              </label>
              <div className="grid grid-cols-2 gap-2">
                {days.map(day => (
                  <label key={day} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.studyPatterns.preferredStudyDays.includes(day)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFormData({
                            ...formData,
                            studyPatterns: {
                              ...formData.studyPatterns,
                              preferredStudyDays: [...formData.studyPatterns.preferredStudyDays, day]
                            }
                          });
                        } else {
                          setFormData({
                            ...formData,
                            studyPatterns: {
                              ...formData.studyPatterns,
                              preferredStudyDays: formData.studyPatterns.preferredStudyDays.filter(d => d !== day)
                            }
                          });
                        }
                      }}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{day}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
            >
              Save Preferences
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};