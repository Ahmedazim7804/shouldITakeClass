import React from 'react';
import { Calendar, Clock, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { DayRecommendation, Course } from '../types';
import { AIInsights } from './AIInsights';

interface DashboardProps {
  recommendation: DayRecommendation;
  courses: Course[];
  selectedDate: string;
}

export const Dashboard: React.FC<DashboardProps> = ({ recommendation, courses, selectedDate }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50';
      case 'warning': return 'text-amber-600 bg-amber-50';
      case 'critical': return 'text-red-600 bg-red-50';
    }
  };

  const getStatusIcon = (status: 'safe' | 'warning' | 'critical') => {
    switch (status) {
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <Clock className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">College Attendance Optimizer</h1>
        <p className="text-gray-600 flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4" />
          {formatDate(selectedDate)}
        </p>
      </div>

      {/* Main Recommendation Card */}
      <div className={`p-6 rounded-xl border-2 ${
        recommendation.shouldGo 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200' 
          : 'bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200'
      }`}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${
            recommendation.shouldGo ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'
          }`}>
            {recommendation.shouldGo ? <TrendingUp className="w-6 h-6" /> : <Calendar className="w-6 h-6" />}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {recommendation.shouldGo ? '✅ Go to College' : '🏠 Stay Home'}
            </h2>
            <p className="text-gray-700 text-lg leading-relaxed">{recommendation.reason}</p>
            
            {recommendation.shouldGo && (
              <div className="mt-4 flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  Total time: {recommendation.totalTimeOnCampus}
                </span>
                <span>Classes: {recommendation.recommendedClasses.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gaps Information */}
      {recommendation.gaps.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Time Gaps Between Classes
          </h3>
          <div className="space-y-2">
            {recommendation.gaps.map((gap, index) => {
              const isLongGap = parseInt(gap.duration.replace(/\D/g, '')) > 120;
              return (
                <div key={index} className={`p-3 rounded-lg ${
                  isLongGap ? 'bg-amber-50 border border-amber-200' : 'bg-gray-50'
                }`}>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700">
                      {gap.start} - {gap.end}
                    </span>
                    <span className={`font-medium ${
                      isLongGap ? 'text-amber-600' : 'text-gray-600'
                    }`}>
                      {gap.duration}
                      {isLongGap && ' ⚠️'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Attendance Impact */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Attendance Impact
        </h3>
        <div className="space-y-3">
          {recommendation.attendanceImpact.map(impact => {
            const course = courses.find(c => c.id === impact.courseId);
            if (!course) return null;

            return (
              <div key={impact.courseId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="font-medium text-gray-900">{course.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {impact.currentPercentage}% → {impact.newPercentage}%
                  </span>
                  <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    getStatusColor(impact.status)
                  }`}>
                    {getStatusIcon(impact.status)}
                    {impact.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* AI Insights */}
      <AIInsights recommendation={recommendation} />
    </div>
  );
};