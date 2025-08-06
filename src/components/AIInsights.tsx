import React from 'react';
import { Brain, TrendingUp, Cloud, Navigation, Clock } from 'lucide-react';
import { DayRecommendation } from '../types';

interface AIInsightsProps {
  recommendation: DayRecommendation;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ recommendation }) => {
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600 bg-green-50';
    if (confidence >= 60) return 'text-blue-600 bg-blue-50';
    if (confidence >= 40) return 'text-amber-600 bg-amber-50';
    return 'text-red-600 bg-red-50';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 80) return 'High Confidence';
    if (confidence >= 60) return 'Good Confidence';
    if (confidence >= 40) return 'Moderate Confidence';
    return 'Low Confidence';
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold text-gray-900">AI Insights</h3>
        <span className={`ml-auto px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(recommendation.confidence)}`}>
          {getConfidenceLabel(recommendation.confidence)} ({recommendation.confidence}%)
        </span>
      </div>

      <div className="space-y-4">
        {/* AI Generated Insights */}
        {recommendation.aiInsights.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Pattern Analysis
            </h4>
            <div className="space-y-2">
              {recommendation.aiInsights.map((insight, index) => (
                <div key={index} className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-purple-800">{insight}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Weather Impact */}
        {recommendation.weatherImpact && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Cloud className="w-4 h-4" />
              Weather Impact
            </h4>
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-blue-900 capitalize">
                  {recommendation.weatherImpact.condition}
                </span>
              </div>
              <p className="text-sm text-blue-800">{recommendation.weatherImpact.recommendation}</p>
            </div>
          </div>
        )}

        {/* Travel Time Impact */}
        {recommendation.travelTimeImpact && (
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Navigation className="w-4 h-4" />
              Travel Conditions
            </h4>
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-green-900">
                  Estimated Time: {recommendation.travelTimeImpact.estimatedTime}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  recommendation.travelTimeImpact.trafficLevel === 'high' ? 'bg-red-100 text-red-700' :
                  recommendation.travelTimeImpact.trafficLevel === 'medium' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {recommendation.travelTimeImpact.trafficLevel} traffic
                </span>
              </div>
              <p className="text-sm text-green-800">
                {recommendation.travelTimeImpact.trafficLevel === 'high' 
                  ? 'Heavy traffic expected - consider leaving earlier or rescheduling'
                  : recommendation.travelTimeImpact.trafficLevel === 'medium'
                  ? 'Moderate traffic - normal travel time expected'
                  : 'Light traffic - good time to travel'
                }
              </p>
            </div>
          </div>
        )}

        {/* Confidence Explanation */}
        <div className="pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            AI confidence is based on historical patterns, attendance requirements, schedule optimization, and external factors.
            {recommendation.confidence < 60 && ' Consider manual review for this recommendation.'}
          </p>
        </div>
      </div>
    </div>
  );
};