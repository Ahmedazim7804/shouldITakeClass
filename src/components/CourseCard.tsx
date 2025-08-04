import React from 'react';
import { Book, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react';
import { Course } from '../types';
import { calculateAttendancePercentage, getAttendanceStatus } from '../utils/attendanceCalculator';

interface CourseCardProps {
  course: Course;
  onEdit: (course: Course) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, onEdit }) => {
  const percentage = calculateAttendancePercentage(course.attendedClasses, course.totalClasses);
  const status = getAttendanceStatus(percentage);

  const getStatusColor = () => {
    switch (status) {
      case 'safe': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'safe': return <CheckCircle className="w-4 h-4" />;
      case 'warning': return <TrendingUp className="w-4 h-4" />;
      case 'critical': return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const required75 = Math.ceil(course.totalClasses * 0.75);
  const classesNeeded = Math.max(0, required75 - course.attendedClasses);

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: course.color }}
          />
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{course.name}</h3>
            <p className="text-sm text-gray-600">{course.code}</p>
          </div>
        </div>
        
        <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor()}`}>
          {getStatusIcon()}
          {status}
        </div>
      </div>

      <div className="space-y-3">
        {/* Attendance Progress Bar */}
        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Attendance</span>
            <span className="text-sm font-bold text-gray-900">{percentage}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${
                status === 'safe' ? 'bg-green-500' : 
                status === 'warning' ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-1 text-xs text-gray-500">
            <span>{course.attendedClasses}/{course.totalClasses} classes</span>
            <span>Need 75%</span>
          </div>
        </div>

        {/* Classes Needed */}
        {classesNeeded > 0 && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Need {classesNeeded} more classes</span> to maintain 75%
            </p>
          </div>
        )}

        {/* Safe Buffer */}
        {status === 'safe' && classesNeeded === 0 && (
          <div className="p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <span className="font-medium">Safe zone!</span> You can skip a few classes if needed
            </p>
          </div>
        )}
      </div>

      <button
        onClick={() => onEdit(course)}
        className="mt-4 w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
      >
        Update Attendance
      </button>
    </div>
  );
};