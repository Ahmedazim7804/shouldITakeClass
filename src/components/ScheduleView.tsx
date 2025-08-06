import React, { useState } from 'react';
import { Clock, MapPin, Plus, Edit3, Trash2 } from 'lucide-react';
import { ClassSchedule, Course } from '../types';

interface ScheduleViewProps {
  schedule: ClassSchedule[];
  courses: Course[];
  onAddClass: () => void;
  onEditClass: (classSchedule: ClassSchedule) => void;
  onDeleteClass: (id: string) => void;
}

export const ScheduleView: React.FC<ScheduleViewProps> = ({
  schedule,
  courses,
  onAddClass,
  onEditClass,
  onDeleteClass
}) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  const getClassesForDay = (day: string) => {
    return schedule
      .filter(cls => cls.day === day)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  const getCourse = (courseId: string) => {
    return courses.find(c => c.id === courseId);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Weekly Schedule</h2>
        <button
          onClick={onAddClass}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Class
        </button>
      </div>

      <div className="grid gap-6">
        {days.map(day => {
          const dayClasses = getClassesForDay(day);
          
          return (
            <div key={day} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">{day}</h3>
              
              {dayClasses.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No classes scheduled</p>
              ) : (
                <div className="space-y-3">
                  {dayClasses.map(cls => {
                    const course = getCourse(cls.courseId);
                    if (!course) return null;

                    return (
                      <div
                        key={cls.id}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <div 
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: course.color }}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900">{course.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {cls.startTime} - {cls.endTime}
                            </span>
                            {cls.location && (
                              <span className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {cls.location}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onEditClass(cls)}
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => onDeleteClass(cls.id)}
                            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};