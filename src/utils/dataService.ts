import { db } from './database';
import { Course, ClassSchedule, ScheduleOverride, UserPreferences, AILearningData, AttendanceRecord } from '../types';

export class DataService {
  // Course operations
  static async getAllCourses(): Promise<Course[]> {
    try {
      return await db.getAllCourses();
    } catch (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
  }

  static async saveCourse(course: Course): Promise<void> {
    try {
      const existingCourse = await db.getCourseById(course.id);
      if (existingCourse) {
        await db.updateCourse(course);
      } else {
        await db.insertCourse(course);
      }
    } catch (error) {
      console.error('Error saving course:', error);
      throw new Error('Failed to save course');
    }
  }

  static async deleteCourse(id: string): Promise<void> {
    try {
      await db.deleteCourse(id);
    } catch (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  }

  // Class schedule operations
  static async getAllClassSchedules(): Promise<ClassSchedule[]> {
    try {
      return await db.getAllClassSchedules();
    } catch (error) {
      console.error('Error fetching class schedules:', error);
      return [];
    }
  }

  static async getClassSchedulesByDay(day: string): Promise<ClassSchedule[]> {
    try {
      return await db.getClassSchedulesByDay(day);
    } catch (error) {
      console.error('Error fetching class schedules for day:', error);
      return [];
    }
  }

  static async saveClassSchedule(schedule: ClassSchedule): Promise<void> {
    try {
      const existingSchedules = await db.getAllClassSchedules();
      const existing = existingSchedules.find(s => s.id === schedule.id);
      
      if (existing) {
        await db.updateClassSchedule(schedule);
      } else {
        await db.insertClassSchedule(schedule);
      }
    } catch (error) {
      console.error('Error saving class schedule:', error);
      throw new Error('Failed to save class schedule');
    }
  }

  static async deleteClassSchedule(id: string): Promise<void> {
    try {
      await db.deleteClassSchedule(id);
    } catch (error) {
      console.error('Error deleting class schedule:', error);
      throw new Error('Failed to delete class schedule');
    }
  }

  // Schedule overrides operations
  static async getAllScheduleOverrides(): Promise<ScheduleOverride[]> {
    try {
      return await db.getAllScheduleOverrides();
    } catch (error) {
      console.error('Error fetching schedule overrides:', error);
      return [];
    }
  }

  static async getScheduleOverridesByDate(date: string): Promise<ScheduleOverride[]> {
    try {
      return await db.getScheduleOverridesByDate(date);
    } catch (error) {
      console.error('Error fetching schedule overrides for date:', error);
      return [];
    }
  }

  static async saveScheduleOverride(override: ScheduleOverride): Promise<void> {
    try {
      await db.insertScheduleOverride(override);
    } catch (error) {
      console.error('Error saving schedule override:', error);
      throw new Error('Failed to save schedule override');
    }
  }

  // Attendance records operations
  static async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    try {
      return await db.getAllAttendanceRecords();
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
  }

  static async getAttendanceRecordsByDate(date: string): Promise<AttendanceRecord[]> {
    try {
      return await db.getAttendanceRecordsByDate(date);
    } catch (error) {
      console.error('Error fetching attendance records for date:', error);
      return [];
    }
  }

  static async saveAttendanceRecord(record: AttendanceRecord): Promise<void> {
    try {
      await db.insertAttendanceRecord(record);
    } catch (error) {
      console.error('Error saving attendance record:', error);
      throw new Error('Failed to save attendance record');
    }
  }

  static async updateAttendanceRecord(record: AttendanceRecord): Promise<void> {
    try {
      await db.updateAttendanceRecord(record);
    } catch (error) {
      console.error('Error updating attendance record:', error);
      throw new Error('Failed to update attendance record');
    }
  }

  static async deleteAttendanceRecord(id: string): Promise<void> {
    try {
      await db.deleteAttendanceRecord(id);
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      throw new Error('Failed to delete attendance record');
    }
  }

  // User preferences operations
  static async getUserPreferences(): Promise<UserPreferences | null> {
    try {
      return await db.getUserPreferences();
    } catch (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
  }

  static async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    try {
      await db.saveUserPreferences(preferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  // AI Learning data operations
  static async getAllAILearningData(): Promise<AILearningData['historicalAttendance']> {
    try {
      const data = await db.getAllAILearningData();
      return data.map(record => ({
        date: record.date,
        attended: record.attended,
        weather: record.weather,
        dayOfWeek: record.dayOfWeek,
        totalClasses: record.totalClasses,
        gaps: record.gaps
      }));
    } catch (error) {
      console.error('Error fetching AI learning data:', error);
      return [];
    }
  }

  static async saveAILearningData(data: {
    date: string;
    attended: boolean;
    weather: string;
    dayOfWeek: string;
    totalClasses: number;
    gaps: number;
    aiRecommended: boolean;
    actualAttended: boolean;
    confidence: number;
  }): Promise<void> {
    try {
      await db.insertAILearningData(data);
    } catch (error) {
      console.error('Error saving AI learning data:', error);
      throw new Error('Failed to save AI learning data');
    }
  }

  // Performance metrics operations
  static async getPerformanceMetrics(): Promise<AILearningData['performanceMetrics'] | null> {
    try {
      return await db.getPerformanceMetrics();
    } catch (error) {
      console.error('Error fetching performance metrics:', error);
      return null;
    }
  }

  static async savePerformanceMetrics(metrics: AILearningData['performanceMetrics']): Promise<void> {
    try {
      await db.savePerformanceMetrics(metrics);
    } catch (error) {
      console.error('Error saving performance metrics:', error);
      throw new Error('Failed to save performance metrics');
    }
  }

  // AI Learning data for analysis
  static async getAILearningDataForAnalysis(): Promise<AILearningData> {
    try {
      return await db.getAILearningDataForAnalysis();
    } catch (error) {
      console.error('Error fetching AI learning data for analysis:', error);
      return {
        historicalAttendance: [],
        performanceMetrics: {
          bestAttendanceDays: ['Monday', 'Tuesday', 'Wednesday'],
          optimalGapLength: 90,
          weatherPreferences: { sunny: 0.9, cloudy: 0.7, rainy: 0.3 }
        }
      };
    }
  }

  // Utility methods
  static async initializeDefaultData(): Promise<void> {
    try {
      // Check if we have any data
      const courses = await this.getAllCourses();
      const preferences = await this.getUserPreferences();

      // If no courses exist, load sample data
      if (courses.length === 0) {
        const sampleCourses: Course[] = [
          {
            id: '1',
            name: 'Data Structures & Algorithms',
            code: 'CS201',
            totalClasses: 40,
            attendedClasses: 32,
            color: '#3B82F6'
          },
          {
            id: '2',
            name: 'Database Management Systems',
            code: 'CS301',
            totalClasses: 40,
            attendedClasses: 30,
            color: '#10B981'
          },
          {
            id: '3',
            name: 'Operating Systems',
            code: 'CS302',
            totalClasses: 40,
            attendedClasses: 28,
            color: '#F59E0B'
          },
          {
            id: '4',
            name: 'Computer Networks',
            code: 'CS401',
            totalClasses: 40,
            attendedClasses: 32,
            color: '#EF4444'
          },
          {
            id: '5',
            name: 'Software Engineering Lab',
            code: 'CS303L',
            totalClasses: 40,
            attendedClasses: 35,
            color: '#8B5CF6'
          }
        ];

        for (const course of sampleCourses) {
          await this.saveCourse(course);
        }

        const sampleSchedule: ClassSchedule[] = [
          { id: '1', courseId: '1', day: 'Monday', startTime: '09:00', endTime: '10:30', location: 'Room 101' },
          { id: '2', courseId: '2', day: 'Monday', startTime: '11:00', endTime: '12:30', location: 'Room 205' },
          { id: '3', courseId: '3', day: 'Tuesday', startTime: '10:00', endTime: '11:30', location: 'Room 301' },
          { id: '4', courseId: '4', day: 'Tuesday', startTime: '14:00', endTime: '15:30', location: 'Room 102' },
          { id: '5', courseId: '1', day: 'Wednesday', startTime: '09:00', endTime: '10:30', location: 'Room 101' },
          { id: '6', courseId: '2', day: 'Thursday', startTime: '11:00', endTime: '12:30', location: 'Room 205' },
          { id: '7', courseId: '3', day: 'Friday', startTime: '10:00', endTime: '11:30', location: 'Room 301' },
          { id: '8', courseId: '5', day: 'Wednesday', startTime: '14:00', endTime: '17:00', location: 'Lab 1' },
          { id: '9', courseId: '4', day: 'Friday', startTime: '14:00', endTime: '15:30', location: 'Room 102' },
        ];

        for (const schedule of sampleSchedule) {
          await this.saveClassSchedule(schedule);
        }

        // Add sample attendance records for the past few weeks
        const sampleAttendanceRecords: AttendanceRecord[] = [
          // Week 1
          { id: 'att1', courseId: '1', date: '2024-01-15', attended: true, cancelled: false },
          { id: 'att2', courseId: '2', date: '2024-01-15', attended: true, cancelled: false },
          { id: 'att3', courseId: '3', date: '2024-01-16', attended: true, cancelled: false },
          { id: 'att4', courseId: '4', date: '2024-01-16', attended: false, cancelled: false },
          { id: 'att5', courseId: '1', date: '2024-01-17', attended: true, cancelled: false },
          { id: 'att6', courseId: '2', date: '2024-01-18', attended: true, cancelled: false },
          { id: 'att7', courseId: '3', date: '2024-01-19', attended: false, cancelled: false },
          
          // Week 2
          { id: 'att8', courseId: '1', date: '2024-01-22', attended: true, cancelled: false },
          { id: 'att9', courseId: '2', date: '2024-01-22', attended: true, cancelled: false },
          { id: 'att10', courseId: '3', date: '2024-01-23', attended: true, cancelled: false },
          { id: 'att11', courseId: '4', date: '2024-01-23', attended: true, cancelled: false },
          { id: 'att12', courseId: '1', date: '2024-01-24', attended: true, cancelled: false },
          { id: 'att13', courseId: '2', date: '2024-01-25', attended: false, cancelled: false },
          { id: 'att14', courseId: '3', date: '2024-01-26', attended: true, cancelled: false },
          
          // Week 3
          { id: 'att15', courseId: '1', date: '2024-01-29', attended: true, cancelled: false },
          { id: 'att16', courseId: '2', date: '2024-01-29', attended: true, cancelled: false },
          { id: 'att17', courseId: '3', date: '2024-01-30', attended: true, cancelled: false },
          { id: 'att18', courseId: '4', date: '2024-01-30', attended: false, cancelled: false },
          { id: 'att19', courseId: '1', date: '2024-01-31', attended: true, cancelled: false },
          { id: 'att20', courseId: '2', date: '2024-02-01', attended: true, cancelled: false },
          { id: 'att21', courseId: '3', date: '2024-02-02', attended: true, cancelled: false },
        ];

        for (const record of sampleAttendanceRecords) {
          await this.saveAttendanceRecord(record);
        }

        // Add sample AI learning data
        const sampleAILearningData = [
          {
            date: '2024-01-15',
            attended: true,
            weather: 'sunny',
            dayOfWeek: 'Monday',
            totalClasses: 5,
            gaps: 90,
            aiRecommended: true,
            actualAttended: true,
            confidence: 85
          },
          {
            date: '2024-01-16',
            attended: false,
            weather: 'rainy',
            dayOfWeek: 'Tuesday',
            totalClasses: 5,
            gaps: 180,
            aiRecommended: false,
            actualAttended: false,
            confidence: 75
          },
          {
            date: '2024-01-17',
            attended: true,
            weather: 'cloudy',
            dayOfWeek: 'Wednesday',
            totalClasses: 5,
            gaps: 60,
            aiRecommended: true,
            actualAttended: true,
            confidence: 90
          },
          {
            date: '2024-01-18',
            attended: true,
            weather: 'sunny',
            dayOfWeek: 'Thursday',
            totalClasses: 5,
            gaps: 120,
            aiRecommended: true,
            actualAttended: true,
            confidence: 80
          },
          {
            date: '2024-01-19',
            attended: false,
            weather: 'rainy',
            dayOfWeek: 'Friday',
            totalClasses: 5,
            gaps: 240,
            aiRecommended: false,
            actualAttended: false,
            confidence: 85
          }
        ];

        for (const data of sampleAILearningData) {
          await this.saveAILearningData(data);
        }
      }

      // If no preferences exist, set default preferences
      if (!preferences) {
        const defaultPreferences: UserPreferences = {
          maxGapBetweenClasses: 120,
          preferredDaysOff: ['Sunday'],
          weatherSensitivity: 'medium',
          commuteMode: 'car',
          studyPatterns: {
            morningPerson: true,
            preferredStudyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          }
        };
        await this.saveUserPreferences(defaultPreferences);
      }
    } catch (error) {
      console.error('Error initializing default data:', error);
    }
  }

  static async closeDatabase(): Promise<void> {
    try {
      await db.close();
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }
} 