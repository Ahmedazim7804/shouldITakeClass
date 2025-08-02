import { 
  Course, 
  ClassTime, 
  WeeklySchedule, 
  ScheduleOverride, 
  AttendanceRecord, 
  UserPreferences 
} from '../types/attendance';

export class DataManager {
  private courses: Course[] = [];
  private weeklySchedule: WeeklySchedule = {};
  private scheduleOverrides: ScheduleOverride[] = [];
  private attendanceRecords: AttendanceRecord[] = [];
  private preferences: UserPreferences = {
    minimizeCollegeDays: true,
    maxGapBetweenClasses: 180, // 3 hours
    priorityCourses: [],
    minimumClassesPerDay: 2
  };

  /**
   * Course Management
   */
  addCourse(course: Course): void {
    const existingIndex = this.courses.findIndex(c => c.id === course.id);
    if (existingIndex >= 0) {
      this.courses[existingIndex] = course;
    } else {
      this.courses.push(course);
    }
  }

  getCourse(courseId: string): Course | undefined {
    return this.courses.find(c => c.id === courseId);
  }

  getAllCourses(): Course[] {
    return [...this.courses];
  }

  updateCourseAttendance(courseId: string, attended: number, total: number, cancelled: number = 0): boolean {
    const course = this.getCourse(courseId);
    if (!course) return false;

    course.classesAttended = attended;
    course.totalClassesScheduled = total;
    course.classesCancelled = cancelled;
    return true;
  }

  /**
   * Schedule Management
   */
  setWeeklySchedule(schedule: WeeklySchedule): void {
    this.weeklySchedule = { ...schedule };
  }

  addDayToSchedule(day: string, classes: ClassTime[]): void {
    this.weeklySchedule[day.toLowerCase()] = [...classes];
  }

  getWeeklySchedule(): WeeklySchedule {
    return { ...this.weeklySchedule };
  }

  getDaySchedule(day: string): ClassTime[] {
    return [...(this.weeklySchedule[day.toLowerCase()] || [])];
  }

  /**
   * Schedule Override Management
   */
  addScheduleOverride(override: ScheduleOverride): void {
    // Remove existing override for the same date
    this.scheduleOverrides = this.scheduleOverrides.filter(
      o => o.date !== override.date
    );
    this.scheduleOverrides.push(override);
  }

  removeScheduleOverride(date: string): boolean {
    const initialLength = this.scheduleOverrides.length;
    this.scheduleOverrides = this.scheduleOverrides.filter(o => o.date !== date);
    return this.scheduleOverrides.length < initialLength;
  }

  getScheduleOverride(date: string): ScheduleOverride | undefined {
    return this.scheduleOverrides.find(o => o.date === date);
  }

  getAllScheduleOverrides(): ScheduleOverride[] {
    return [...this.scheduleOverrides];
  }

  /**
   * Get the actual schedule for a specific date
   * (considers both weekly schedule and overrides)
   */
  getScheduleForDate(date: string): ClassTime[] {
    // Check for override first
    const override = this.getScheduleOverride(date);
    if (override) {
      return [...override.classes];
    }

    // Fall back to weekly schedule
    const dayOfWeek = this.getDayOfWeek(date);
    return this.getDaySchedule(dayOfWeek);
  }

  /**
   * Get day of week from date string
   */
  private getDayOfWeek(dateString: string): string {
    const date = new Date(dateString);
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[date.getDay()];
  }

  /**
   * Attendance Record Management
   */
  addAttendanceRecord(record: AttendanceRecord): void {
    // Remove existing record for same date and course
    this.attendanceRecords = this.attendanceRecords.filter(
      r => !(r.date === record.date && r.courseId === record.courseId)
    );
    this.attendanceRecords.push(record);

    // Update course attendance count
    this.updateCourseFromAttendanceRecords();
  }

  getAttendanceRecords(courseId?: string, startDate?: string, endDate?: string): AttendanceRecord[] {
    let records = [...this.attendanceRecords];

    if (courseId) {
      records = records.filter(r => r.courseId === courseId);
    }

    if (startDate) {
      records = records.filter(r => r.date >= startDate);
    }

    if (endDate) {
      records = records.filter(r => r.date <= endDate);
    }

    return records;
  }

  markClassCancelled(date: string, courseId: string, reason?: string): void {
    this.addAttendanceRecord({
      date,
      courseId,
      attended: false,
      cancelled: true,
      reason: reason || 'Class cancelled'
    });
  }

  /**
   * Update course attendance numbers based on attendance records
   */
  private updateCourseFromAttendanceRecords(): void {
    for (const course of this.courses) {
      const records = this.getAttendanceRecords(course.id);
      
      const attended = records.filter(r => r.attended && !r.cancelled).length;
      const cancelled = records.filter(r => r.cancelled).length;
      const totalHeld = records.filter(r => !r.cancelled).length;

      course.classesAttended = attended;
      course.classesCancelled = cancelled;
      // Note: totalClassesScheduled should be set separately as it includes future classes
    }
  }

  /**
   * Preferences Management
   */
  setPreferences(preferences: Partial<UserPreferences>): void {
    this.preferences = { ...this.preferences, ...preferences };
  }

  getPreferences(): UserPreferences {
    return { ...this.preferences };
  }

  updatePreference<K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ): void {
    this.preferences[key] = value;
  }

  /**
   * Utility Methods
   */
  
  /**
   * Get all unique course IDs from the schedule
   */
  getAllScheduledCourseIds(): string[] {
    const courseIds = new Set<string>();
    
    // From weekly schedule
    Object.values(this.weeklySchedule).forEach(dayClasses => {
      dayClasses.forEach(classTime => courseIds.add(classTime.courseId));
    });

    // From overrides
    this.scheduleOverrides.forEach(override => {
      override.classes.forEach(classTime => courseIds.add(classTime.courseId));
    });

    return Array.from(courseIds);
  }

  /**
   * Get upcoming schedule for a date range
   */
  getUpcomingSchedule(startDate: string, endDate: string): ScheduleOverride[] {
    const upcoming: ScheduleOverride[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const schedule = this.getScheduleForDate(dateStr);
      
      if (schedule.length > 0) {
        upcoming.push({
          date: dateStr,
          classes: schedule,
          reason: 'scheduled'
        });
      }
    }

    return upcoming;
  }

  /**
   * Export all data for backup/sharing
   */
  exportData(): {
    courses: Course[];
    weeklySchedule: WeeklySchedule;
    scheduleOverrides: ScheduleOverride[];
    attendanceRecords: AttendanceRecord[];
    preferences: UserPreferences;
  } {
    return {
      courses: [...this.courses],
      weeklySchedule: { ...this.weeklySchedule },
      scheduleOverrides: [...this.scheduleOverrides],
      attendanceRecords: [...this.attendanceRecords],
      preferences: { ...this.preferences }
    };
  }

  /**
   * Import data from backup
   */
  importData(data: {
    courses?: Course[];
    weeklySchedule?: WeeklySchedule;
    scheduleOverrides?: ScheduleOverride[];
    attendanceRecords?: AttendanceRecord[];
    preferences?: UserPreferences;
  }): void {
    if (data.courses) this.courses = [...data.courses];
    if (data.weeklySchedule) this.weeklySchedule = { ...data.weeklySchedule };
    if (data.scheduleOverrides) this.scheduleOverrides = [...data.scheduleOverrides];
    if (data.attendanceRecords) this.attendanceRecords = [...data.attendanceRecords];
    if (data.preferences) this.preferences = { ...this.preferences, ...data.preferences };
  }

  /**
   * Clear all data (useful for testing or reset)
   */
  clearAllData(): void {
    this.courses = [];
    this.weeklySchedule = {};
    this.scheduleOverrides = [];
    this.attendanceRecords = [];
    this.preferences = {
      minimizeCollegeDays: true,
      maxGapBetweenClasses: 180,
      priorityCourses: [],
      minimumClassesPerDay: 2
    };
  }
}