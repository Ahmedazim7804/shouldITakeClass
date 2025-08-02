export interface Course {
  id: string;
  name: string;
  requiredAttendancePercentage: number; // e.g., 75 for 75%
  totalClassesScheduled: number;
  classesAttended: number;
  classesCancelled: number; // Classes that were cancelled (don't count toward total)
}

export interface ClassTime {
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  courseId: string;
  location?: string;
}

export interface DaySchedule {
  day: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  classes: ClassTime[];
}

export interface WeeklySchedule {
  [key: string]: ClassTime[]; // day name -> classes
}

export interface ScheduleOverride {
  date: string; // "2024-01-15" (ISO date string)
  classes: ClassTime[];
  reason?: string; // "rescheduled", "extra class", etc.
}

export interface AttendanceRecord {
  date: string;
  courseId: string;
  attended: boolean;
  cancelled?: boolean; // If the class was cancelled
  reason?: string;
}

export interface UserPreferences {
  minimizeCollegeDays: boolean;
  maxGapBetweenClasses: number; // in minutes, e.g., 180 for 3 hours
  priorityCourses: string[]; // Course IDs that are more important
  minimumClassesPerDay: number; // Don't go for less than X classes
}

export interface DayAnalysis {
  date: string;
  scheduledClasses: ClassTime[];
  shouldGo: boolean;
  recommendedClasses: string[]; // Course IDs to attend
  reasoning: string[];
  timeGaps: {
    start: string;
    end: string;
    duration: number; // in minutes
  }[];
  attendanceImpact: {
    [courseId: string]: {
      currentPercentage: number;
      afterAttending: number;
      afterSkipping: number;
      isRequired: boolean; // Must attend to maintain 75%
    };
  };
}

export interface AttendanceStatus {
  courseId: string;
  courseName: string;
  classesAttended: number;
  totalClassesHeld: number; // Excludes cancelled classes
  currentPercentage: number;
  classesNeededFor75Percent: number;
  remainingClassesScheduled: number;
  canSkip: number; // How many more classes can be skipped while maintaining 75%
  isAtRisk: boolean; // True if close to dropping below 75%
}

export interface DecisionContext {
  date: string;
  courses: Course[];
  daySchedule: ClassTime[];
  attendanceStatuses: AttendanceStatus[];
  preferences: UserPreferences;
  upcomingSchedule: ScheduleOverride[]; // For planning ahead
}