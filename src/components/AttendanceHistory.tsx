import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Edit2, Save, X, CheckCircle, XCircle } from 'lucide-react';
import { Course, AttendanceRecord } from '../types';
import { DataService } from '../utils/dataService';

interface AttendanceHistoryProps {
  courses: Course[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ courses }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingRecord, setEditingRecord] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    loadAttendanceHistory();
  }, []);

  const loadAttendanceHistory = async () => {
    try {
      setLoading(true);
      const records = await DataService.getAllAttendanceRecords();
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAttendance = async (recordId: string, attended: boolean) => {
    try {
      const record = attendanceRecords.find(r => r.id === recordId);
      if (!record) return;

      const updatedRecord = { ...record, attended };
      await DataService.updateAttendanceRecord(updatedRecord);

      // Update the course attendance count
      const course = courses.find(c => c.id === record.courseId);
      if (course) {
        const wasAttended = record.attended;
        let newAttendedCount = course.attendedClasses;
        
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
      }

      // Update local state
      setAttendanceRecords(records => 
        records.map(r => r.id === recordId ? updatedRecord : r)
      );
      setEditingRecord(null);
    } catch (error) {
      console.error('Error updating attendance:', error);
      alert('Failed to update attendance. Please try again.');
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('Are you sure you want to delete this attendance record?')) return;

    try {
      const record = attendanceRecords.find(r => r.id === recordId);
      if (!record) return;

      await DataService.deleteAttendanceRecord(recordId);

      // Update course attendance count if record was marked as attended
      if (record.attended) {
        const course = courses.find(c => c.id === record.courseId);
        if (course) {
          const updatedCourse = {
            ...course,
            attendedClasses: Math.max(0, course.attendedClasses - 1)
          };
          await DataService.saveCourse(updatedCourse);
        }
      }

      // Update local state
      setAttendanceRecords(records => records.filter(r => r.id !== recordId));
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      alert('Failed to delete attendance record. Please try again.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course ? `${course.name} (${course.code})` : 'Unknown Course';
  };

  const getCourseColor = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.color || '#6B7280';
  };

  // Filter records by selected month
  const filteredRecords = attendanceRecords.filter(record => 
    record.date.startsWith(selectedMonth)
  );

  // Sort records by date (newest first)
  const sortedRecords = filteredRecords.sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Group records by date
  const groupedRecords = sortedRecords.reduce((groups, record) => {
    const date = record.date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(record);
    return groups;
  }, {} as Record<string, AttendanceRecord[]>);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>
        
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {Object.keys(groupedRecords).length === 0 ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No attendance records found</h3>
          <p className="text-gray-600">
            No attendance records found for {new Date(selectedMonth + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedRecords).map(([date, records]) => (
            <div key={date} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                {formatDate(date)}
              </h3>
              
              <div className="space-y-3">
                {records.map(record => (
                  <div
                    key={record.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      record.attended 
                        ? 'bg-green-50 border-green-200' 
                        : record.cancelled 
                        ? 'bg-gray-50 border-gray-200'
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-4 h-4 rounded-full"
                          style={{ backgroundColor: getCourseColor(record.courseId) }}
                        />
                        <span className="font-medium text-gray-900">
                          {getCourseName(record.courseId)}
                        </span>
                        
                        {editingRecord === record.id ? (
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleUpdateAttendance(record.id, true)}
                              className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Attended
                            </button>
                            <button
                              onClick={() => handleUpdateAttendance(record.id, false)}
                              className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                            >
                              <XCircle className="w-4 h-4" />
                              Missed
                            </button>
                            <button
                              onClick={() => setEditingRecord(null)}
                              className="flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                            record.attended 
                              ? 'bg-green-100 text-green-700'
                              : record.cancelled
                              ? 'bg-gray-100 text-gray-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {record.attended ? (
                              <>
                                <CheckCircle className="w-3 h-3" />
                                Attended
                              </>
                            ) : record.cancelled ? (
                              <>
                                <Clock className="w-3 h-3" />
                                Cancelled
                              </>
                            ) : (
                              <>
                                <XCircle className="w-3 h-3" />
                                Missed
                              </>
                            )}
                          </span>
                        )}
                      </div>

                      {editingRecord !== record.id && !record.cancelled && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingRecord(record.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRecord(record.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm"
                          >
                            <X className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-blue-50 p-4 rounded-lg">
        <p className="text-sm text-blue-700">
          💡 <strong>Tip:</strong> You can edit past attendance records to keep your data accurate. 
          Changes will automatically update your course attendance percentages.
        </p>
      </div>
    </div>
  );
}; 