import React, { useState, useEffect } from 'react';
import { Calendar, Filter, TrendingUp, TrendingDown, CheckCircle, XCircle } from 'lucide-react';
import { AttendanceRecord, Course } from '../types';
import { DataService } from '../utils/dataService';

interface AttendanceHistoryProps {
  courses: Course[];
}

export const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({ courses }) => {
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<AttendanceRecord[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedDateRange, setSelectedDateRange] = useState<string>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAttendanceRecords();
  }, []);

  useEffect(() => {
    filterRecords();
  }, [attendanceRecords, selectedCourse, selectedDateRange]);

  const loadAttendanceRecords = async () => {
    try {
      setIsLoading(true);
      const records = await DataService.getAllAttendanceRecords();
      setAttendanceRecords(records);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterRecords = () => {
    let filtered = [...attendanceRecords];

    // Filter by course
    if (selectedCourse !== 'all') {
      filtered = filtered.filter(record => record.courseId === selectedCourse);
    }

    // Filter by date range
    if (selectedDateRange !== 'all') {
      const today = new Date();
      const daysAgo = selectedDateRange === 'week' ? 7 : selectedDateRange === 'month' ? 30 : 90;
      const cutoffDate = new Date(today.getTime() - (daysAgo * 24 * 60 * 60 * 1000));
      
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= cutoffDate;
      });
    }

    setFilteredRecords(filtered);
  };

  const getCourseName = (courseId: string) => {
    const course = courses.find(c => c.id === courseId);
    return course?.name || 'Unknown Course';
  };

  const getAttendanceStats = () => {
    if (filteredRecords.length === 0) return { total: 0, attended: 0, percentage: 0 };

    const total = filteredRecords.length;
    const attended = filteredRecords.filter(record => record.attended).length;
    const percentage = Math.round((attended / total) * 100);

    return { total, attended, percentage };
  };

  const getCourseStats = () => {
    const courseStats = courses.map(course => {
      const courseRecords = filteredRecords.filter(record => record.courseId === course.id);
      const total = courseRecords.length;
      const attended = courseRecords.filter(record => record.attended).length;
      const percentage = total > 0 ? Math.round((attended / total) * 100) : 0;

      return {
        course,
        total,
        attended,
        percentage
      };
    });

    return courseStats.filter(stat => stat.total > 0);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = getAttendanceStats();
  const courseStats = getCourseStats();

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Attendance History</h2>
        <button
          onClick={loadAttendanceRecords}
          className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Courses</option>
            {courses.map(course => (
              <option key={course.id} value={course.id}>{course.name}</option>
            ))}
          </select>

          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Time</option>
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last 3 Months</option>
          </select>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Total Classes</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-gray-700">Attended</span>
          </div>
          <p className="text-2xl font-bold text-green-600">{stats.attended}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-gray-700">Attendance Rate</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.percentage}%</p>
        </div>
      </div>

      {/* Course Stats */}
      {courseStats.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance by Course</h3>
          <div className="space-y-3">
            {courseStats.map(stat => (
              <div key={stat.course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: stat.course.color }}
                  />
                  <span className="font-medium text-gray-900">{stat.course.name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    {stat.attended}/{stat.total} classes
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    stat.percentage >= 80 ? 'bg-green-100 text-green-700' :
                    stat.percentage >= 60 ? 'bg-amber-100 text-amber-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {stat.percentage}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Records */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Attendance Records</h3>
        {filteredRecords.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No attendance records found for the selected filters.</p>
        ) : (
          <div className="space-y-2">
            {filteredRecords.slice(0, 10).map(record => (
              <div key={record.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  {record.attended ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium text-gray-900">{getCourseName(record.courseId)}</span>
                </div>
                <span className="text-sm text-gray-600">{formatDate(record.date)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}; 