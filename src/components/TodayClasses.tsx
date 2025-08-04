import React, { useState, useEffect } from 'react';
import { Clock, MapPin, CheckCircle, XCircle, Calendar } from 'lucide-react';
import { Course, ClassSchedule, AttendanceRecord } from '../types';
import { DataService } from '../utils/dataService';

interface TodayClassesProps {
  courses: Course[];
  selectedDate: string;
  onAttendanceUpdate: () => void;
}

interface ClassWithAttendance extends ClassSchedule {
  course: Course;
  attendanceRecord?: AttendanceRecord;
}

export const TodayClasses: React.FC<TodayClassesProps> = ({ 
  courses, 
  selectedDate, 
  onAttendanceUpdate 
}) => {
  const [todayClasses, setTodayClasses] = useState<ClassWithAttendance[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTodayClasses();
  }, [selectedDate, courses]);

  const loadTodayClasses = async () => {
    try {
      setLoading(true);
      const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      const schedule = await DataService.getClassSchedulesByDay(dayOfWeek);
      const attendanceRecords = await DataService.getAttendanceRecordsByDate(selectedDate);

      const classesWithAttendance: ClassWithAttendance[] = schedule.map(classSchedule => {
        const course = courses.find(c => c.id === classSchedule.courseId);
        const attendanceRecord = attendanceRecords.find(
          record => record.courseId === classSchedule.courseId
        );

        return {
          ...classSchedule,
          course: course!,
          attendanceRecord
        };
      }).filter(c => c.course); // Filter out classes without matching courses

      // Sort by start time
      classesWithAttendance.sort((a, b) => 
        new Date(`2000-01-01 ${a.startTime}`).getTime() - new Date(`2000-01-01 ${b.startTime}`).getTime()
      );

      setTodayClasses(classesWithAttendance);
    } catch (error) {
      console.error('Error loading today\'s classes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAttendanceChange = async (classSchedule: ClassWithAttendance, attended: boolean) => {
    try {
      const existingRecord = classSchedule.attendanceRecord;
      
      if (existingRecord) {
        // Update existing record
        await DataService.updateAttendanceRecord({
          ...existingRecord,
          attended
        });
      } else {
        // Create new record
        const newRecord: AttendanceRecord = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          courseId: classSchedule.courseId,
          date: selectedDate,
          attended,
          cancelled: false
        };
        await DataService.saveAttendanceRecord(newRecord);
      }

      // Update course attendance count
      const course = classSchedule.course;
      const currentAttended = course.attendedClasses;
      const wasAttended = existingRecord?.attended || false;
      
      let newAttendedCount = currentAttended;
      if (attended && !wasAttended) {
        newAttendedCount += 1;
      } else if (!attended && wasAttended) {
        newAttendedCount -= 1;
      }

      const updatedCourse = {
        ...course,
        attendedClasses: Math.max(0, newAttendedCount)
      };

      await DataService.saveCourse(updatedCourse);
      
      // Refresh the data
      await loadTodayClasses();
      onAttendanceUpdate();
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01 ${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const getAttendanceStatus = (classItem: ClassWithAttendance) => {
    if (classItem.attendanceRecord?.cancelled) {
      return 'cancelled';
    }
    if (classItem.attendanceRecord) {
      return classItem.attendanceRecord.attended ? 'attended' : 'missed';
    }
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'attended': return 'bg-green-50 border-green-200';
      case 'missed': return 'bg-red-50 border-red-200';
      case 'cancelled': return 'bg-gray-50 border-gray-200';
      default: return 'bg-blue-50 border-blue-200';
    }
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const selectedDateFormatted = new Date(selectedDate).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (todayClasses.length === 0) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          {isToday ? "Today's Classes" : `Classes for ${selectedDateFormatted}`}
        </h3>
        <div className="text-center py-8">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {isToday ? "No classes scheduled for today!" : "No classes scheduled for this date."}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            {isToday ? "Enjoy your free day! 🎉" : "Looks like you have a free day on this date."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Calendar className="w-5 h-5" />
        {isToday ? "Today's Classes" : `Classes for ${selectedDateFormatted}`}
      </h3>
      
      <div className="space-y-4">
        {todayClasses.map((classItem) => {
          const status = getAttendanceStatus(classItem);
          const attendancePercentage = Math.round(
            (classItem.course.attendedClasses / classItem.course.totalClasses) * 100
          );

          return (
            <div
              key={classItem.id}
              className={`p-4 rounded-lg border-2 transition-all ${getStatusColor(status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: classItem.course.color }}
                    />
                    <h4 className="font-semibold text-gray-900">
                      {classItem.course.name}
                    </h4>
                    <span className="text-sm text-gray-500">
                      ({classItem.course.code})
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatTime(classItem.startTime)} - {formatTime(classItem.endTime)}
                    </span>
                    {classItem.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {classItem.location}
                      </span>
                    )}
                  </div>

                  <div className="mt-2 text-sm">
                    <span className={`font-medium ${
                      attendancePercentage >= 75 ? 'text-green-600' : 
                      attendancePercentage >= 65 ? 'text-amber-600' : 'text-red-600'
                    }`}>
                      Current Attendance: {attendancePercentage}%
                    </span>
                    <span className="text-gray-500 ml-2">
                      ({classItem.course.attendedClasses}/{classItem.course.totalClasses})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {status === 'cancelled' ? (
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">Cancelled</span>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAttendanceChange(classItem, true)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                          status === 'attended'
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-600'
                        }`}
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Attended</span>
                      </button>
                      
                      <button
                        onClick={() => handleAttendanceChange(classItem, false)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
                          status === 'missed'
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-red-100 hover:text-red-600'
                        }`}
                      >
                        <XCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">Missed</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> Mark your attendance for each class. The AI will learn from your patterns to provide better recommendations!
        </p>
      </div>
    </div>
  );
};