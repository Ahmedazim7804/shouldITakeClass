export interface Course {
  id: string;
  name: string;
  code: string;
  totalClasses: number;
  attendedClasses: number;
  color: string;
}

export interface ClassSchedule {
  id: string;
  courseId: string;
  day: string;
  startTime: string;
  endTime: string;
  location?: string;
}

export interface AttendanceRecord {
  id: string;
  courseId: string;
  date: string;
  attended: boolean;
  cancelled?: boolean;
}

export interface ScheduleOverride {
  id: string;
  date: string;
  courseId: string;
  startTime?: string;
  endTime?: string;
  cancelled?: boolean;
  location?: string;
}

export interface DayRecommendation {
  shouldGo: boolean;
  reason: string;
  recommendedClasses: string[];
  totalTimeOnCampus: string;
  gaps: Array<{
    start: string;
    end: string;
    duration: string;
  }>;
  attendanceImpact: Array<{
    courseId: string;
    currentPercentage: number;
    newPercentage: number;
    status: 'safe' | 'warning' | 'critical';
  }>;
  confidence: number; // AI confidence score 0-100
  aiInsights: string[]; // AI-generated insights
  weatherImpact?: {
    condition: string;
    recommendation: string;
  };
  travelTimeImpact?: {
    estimatedTime: string;
    trafficLevel: 'low' | 'medium' | 'high';
  };
}

export interface UserPreferences {
  maxGapBetweenClasses: number; // in minutes
  preferredDaysOff: string[];
  weatherSensitivity: 'low' | 'medium' | 'high';
  commuteMode: 'car' | 'public' | 'bike' | 'walk';
  studyPatterns: {
    morningPerson: boolean;
    preferredStudyDays: string[];
  };
}

export interface AILearningData {
  historicalAttendance: Array<{
    date: string;
    attended: boolean;
    weather: string;
    dayOfWeek: string;
    totalClasses: number;
    gaps: number;
  }>;
  performanceMetrics: {
    bestAttendanceDays: string[];
    optimalGapLength: number;
    weatherPreferences: Record<string, number>;
  };
}