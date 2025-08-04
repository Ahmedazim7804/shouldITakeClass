import { supabase } from './supabase';
import { Course, ClassSchedule, ScheduleOverride, UserPreferences, AILearningData, AttendanceRecord } from '../types';

// Database schema types
export interface DatabaseSchema {
  courses: Course;
  class_schedules: ClassSchedule;
  schedule_overrides: ScheduleOverride;
  attendance_records: AttendanceRecord;
  user_preferences: UserPreferences & { id: string };
  ai_learning_data: {
    id: string;
    date: string;
    attended: boolean;
    weather: string;
    dayOfWeek: string;
    totalClasses: number;
    gaps: number;
    aiRecommended: boolean;
    actualAttended: boolean;
    confidence: number;
  };
  performance_metrics: {
    id: string;
    bestAttendanceDays: string;
    optimalGapLength: number;
    weatherPreferences: string; // JSON string
  };
}

// Supabase-based database class
export class AttendanceDatabase {
  constructor() {
    // No initialization needed for Supabase
  }

  // Course operations
  async getAllCourses(): Promise<Course[]> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name');
    
    if (error) {
      console.error('Error fetching courses:', error);
      return [];
    }
    
    return data || [];
  }

  async getCourseById(id: string): Promise<Course | undefined> {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      console.error('Error fetching course:', error);
      return undefined;
    }
    
    return data || undefined;
  }

  async insertCourse(course: Course): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .insert(course);
    
    if (error) {
      console.error('Error inserting course:', error);
      throw new Error('Failed to insert course');
    }
  }

  async updateCourse(course: Course): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .update(course)
      .eq('id', course.id);
    
    if (error) {
      console.error('Error updating course:', error);
      throw new Error('Failed to update course');
    }
  }

  async deleteCourse(id: string): Promise<void> {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting course:', error);
      throw new Error('Failed to delete course');
    }
  }

  // Class schedule operations
  async getAllClassSchedules(): Promise<ClassSchedule[]> {
    const { data, error } = await supabase
      .from('class_schedules')
      .select('*')
      .order('day')
      .order('startTime');
    
    if (error) {
      console.error('Error fetching class schedules:', error);
      return [];
    }
    
    return data || [];
  }

  async getClassSchedulesByDay(day: string): Promise<ClassSchedule[]> {
    const { data, error } = await supabase
      .from('class_schedules')
      .select('*')
      .eq('day', day)
      .order('startTime');
    
    if (error) {
      console.error('Error fetching class schedules for day:', error);
      return [];
    }
    
    return data || [];
  }

  async insertClassSchedule(schedule: ClassSchedule): Promise<void> {
    const { error } = await supabase
      .from('class_schedules')
      .insert(schedule);
    
    if (error) {
      console.error('Error inserting class schedule:', error);
      throw new Error('Failed to insert class schedule');
    }
  }

  async updateClassSchedule(schedule: ClassSchedule): Promise<void> {
    const { error } = await supabase
      .from('class_schedules')
      .update(schedule)
      .eq('id', schedule.id);
    
    if (error) {
      console.error('Error updating class schedule:', error);
      throw new Error('Failed to update class schedule');
    }
  }

  async deleteClassSchedule(id: string): Promise<void> {
    const { error } = await supabase
      .from('class_schedules')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting class schedule:', error);
      throw new Error('Failed to delete class schedule');
    }
  }

  // Schedule overrides operations
  async getAllScheduleOverrides(): Promise<ScheduleOverride[]> {
    const { data, error } = await supabase
      .from('schedule_overrides')
      .select('*')
      .order('date');
    
    if (error) {
      console.error('Error fetching schedule overrides:', error);
      return [];
    }
    
    return data || [];
  }

  async getScheduleOverridesByDate(date: string): Promise<ScheduleOverride[]> {
    const { data, error } = await supabase
      .from('schedule_overrides')
      .select('*')
      .eq('date', date);
    
    if (error) {
      console.error('Error fetching schedule overrides for date:', error);
      return [];
    }
    
    return data || [];
  }

  async insertScheduleOverride(override: ScheduleOverride): Promise<void> {
    const { error } = await supabase
      .from('schedule_overrides')
      .insert(override);
    
    if (error) {
      console.error('Error inserting schedule override:', error);
      throw new Error('Failed to insert schedule override');
    }
  }

  // Attendance records operations
  async getAllAttendanceRecords(): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching attendance records:', error);
      return [];
    }
    
    return data || [];
  }

  async getAttendanceRecordsByDate(date: string): Promise<AttendanceRecord[]> {
    const { data, error } = await supabase
      .from('attendance_records')
      .select('*')
      .eq('date', date);
    
    if (error) {
      console.error('Error fetching attendance records for date:', error);
      return [];
    }
    
    return data || [];
  }

  async insertAttendanceRecord(record: AttendanceRecord): Promise<void> {
    const { error } = await supabase
      .from('attendance_records')
      .insert(record);
    
    if (error) {
      console.error('Error inserting attendance record:', error);
      throw new Error('Failed to insert attendance record');
    }
  }

  // User preferences operations
  async getUserPreferences(): Promise<UserPreferences | null> {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching user preferences:', error);
      return null;
    }
    
    if (!data) return null;

    return {
      maxGapBetweenClasses: data.maxGapBetweenClasses,
      preferredDaysOff: JSON.parse(data.preferredDaysOff),
      weatherSensitivity: data.weatherSensitivity as 'low' | 'medium' | 'high',
      commuteMode: data.commuteMode as 'car' | 'public' | 'bike' | 'walk',
      studyPatterns: {
        morningPerson: data.morningPerson,
        preferredStudyDays: JSON.parse(data.preferredStudyDays)
      }
    };
  }

  async saveUserPreferences(preferences: UserPreferences): Promise<void> {
    const preferencesData = {
      id: 'default',
      maxGapBetweenClasses: preferences.maxGapBetweenClasses,
      preferredDaysOff: JSON.stringify(preferences.preferredDaysOff),
      weatherSensitivity: preferences.weatherSensitivity,
      commuteMode: preferences.commuteMode,
      morningPerson: preferences.studyPatterns.morningPerson,
      preferredStudyDays: JSON.stringify(preferences.studyPatterns.preferredStudyDays)
    };

    const { error } = await supabase
      .from('user_preferences')
      .upsert(preferencesData);
    
    if (error) {
      console.error('Error saving user preferences:', error);
      throw new Error('Failed to save user preferences');
    }
  }

  // AI Learning data operations
  async getAllAILearningData(): Promise<DatabaseSchema['ai_learning_data'][]> {
    const { data, error } = await supabase
      .from('ai_learning_data')
      .select('*')
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching AI learning data:', error);
      return [];
    }
    
    return data || [];
  }

  async getAILearningDataByDateRange(startDate: string, endDate: string): Promise<DatabaseSchema['ai_learning_data'][]> {
    const { data, error } = await supabase
      .from('ai_learning_data')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });
    
    if (error) {
      console.error('Error fetching AI learning data by date range:', error);
      return [];
    }
    
    return data || [];
  }

  async insertAILearningData(data: Omit<DatabaseSchema['ai_learning_data'], 'id'>): Promise<void> {
    const learningData = {
      id: Date.now().toString(),
      ...data
    };

    const { error } = await supabase
      .from('ai_learning_data')
      .insert(learningData);
    
    if (error) {
      console.error('Error inserting AI learning data:', error);
      throw new Error('Failed to insert AI learning data');
    }
  }

  // Performance metrics operations
  async getPerformanceMetrics(): Promise<AILearningData['performanceMetrics'] | null> {
    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      console.error('Error fetching performance metrics:', error);
      return null;
    }
    
    if (!data) return null;

    return {
      bestAttendanceDays: JSON.parse(data.bestAttendanceDays),
      optimalGapLength: data.optimalGapLength,
      weatherPreferences: JSON.parse(data.weatherPreferences)
    };
  }

  async savePerformanceMetrics(metrics: AILearningData['performanceMetrics']): Promise<void> {
    const metricsData = {
      id: 'default',
      bestAttendanceDays: JSON.stringify(metrics.bestAttendanceDays),
      optimalGapLength: metrics.optimalGapLength,
      weatherPreferences: JSON.stringify(metrics.weatherPreferences)
    };

    const { error } = await supabase
      .from('performance_metrics')
      .upsert(metricsData);
    
    if (error) {
      console.error('Error saving performance metrics:', error);
      throw new Error('Failed to save performance metrics');
    }
  }

  // Utility methods
  async close(): Promise<void> {
    // No need to close Supabase connection
  }

  // Get AI learning data for analysis
  async getAILearningDataForAnalysis(): Promise<AILearningData> {
    const historicalData = await this.getAllAILearningData();
    const mappedData = historicalData.map(record => ({
      date: record.date,
      attended: record.attended,
      weather: record.weather,
      dayOfWeek: record.dayOfWeek,
      totalClasses: record.totalClasses,
      gaps: record.gaps
    }));

    const performanceMetrics = await this.getPerformanceMetrics() || {
      bestAttendanceDays: ['Monday', 'Tuesday', 'Wednesday'],
      optimalGapLength: 90,
      weatherPreferences: { sunny: 0.9, cloudy: 0.7, rainy: 0.3 }
    };

    return {
      historicalAttendance: mappedData,
      performanceMetrics
    };
  }
}

// Export singleton instance
export const db = new AttendanceDatabase(); 