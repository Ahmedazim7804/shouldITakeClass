import { 
  Course, 
  ClassTime, 
  WeeklySchedule, 
  UserPreferences, 
  ScheduleOverride,
  AttendanceRecord
} from '../types/attendance';
import { DataManager } from './dataManager';
import { CollegeDecisionEngine } from './collegeDecisionEngine';

/**
 * Example courses for a typical college student
 */
export const exampleCourses: Course[] = [
  {
    id: 'CS101',
    name: 'Introduction to Computer Science',
    requiredAttendancePercentage: 75,
    totalClassesScheduled: 60, // Semester total
    classesAttended: 42,
    classesCancelled: 3
  },
  {
    id: 'MATH201',
    name: 'Calculus II',
    requiredAttendancePercentage: 75,
    totalClassesScheduled: 45,
    classesAttended: 30,
    classesCancelled: 1
  },
  {
    id: 'PHYS101',
    name: 'Physics I',
    requiredAttendancePercentage: 75,
    totalClassesScheduled: 50,
    classesAttended: 35,
    classesCancelled: 2
  },
  {
    id: 'ENG102',
    name: 'English Literature',
    requiredAttendancePercentage: 75,
    totalClassesScheduled: 40,
    classesAttended: 28,
    classesCancelled: 1
  },
  {
    id: 'LAB101',
    name: 'Physics Lab',
    requiredAttendancePercentage: 80, // Labs often have higher requirements
    totalClassesScheduled: 25,
    classesAttended: 18,
    classesCancelled: 0
  }
];

/**
 * Example weekly schedule
 */
export const exampleWeeklySchedule: WeeklySchedule = {
  monday: [
    {
      startTime: '09:00',
      endTime: '10:30',
      courseId: 'CS101',
      location: 'Room 101'
    },
    {
      startTime: '11:00',
      endTime: '12:30',
      courseId: 'MATH201',
      location: 'Room 205'
    },
    {
      startTime: '14:00',
      endTime: '15:30',
      courseId: 'PHYS101',
      location: 'Room 301'
    }
  ],
  tuesday: [
    {
      startTime: '10:00',
      endTime: '11:30',
      courseId: 'ENG102',
      location: 'Room 150'
    },
    {
      startTime: '15:00',
      endTime: '17:00',
      courseId: 'LAB101',
      location: 'Physics Lab'
    }
  ],
  wednesday: [
    {
      startTime: '09:00',
      endTime: '10:30',
      courseId: 'CS101',
      location: 'Room 101'
    },
    {
      startTime: '11:00',
      endTime: '12:30',
      courseId: 'MATH201',
      location: 'Room 205'
    }
  ],
  thursday: [
    {
      startTime: '10:00',
      endTime: '11:30',
      courseId: 'ENG102',
      location: 'Room 150'
    },
    {
      startTime: '14:00',
      endTime: '15:30',
      courseId: 'PHYS101',
      location: 'Room 301'
    }
  ],
  friday: [
    {
      startTime: '09:00',
      endTime: '10:30',
      courseId: 'CS101',
      location: 'Room 101'
    },
    {
      startTime: '13:00',
      endTime: '14:30',
      courseId: 'MATH201',
      location: 'Room 205'
    }
  ],
  saturday: [],
  sunday: []
};

/**
 * Example user preferences
 */
export const examplePreferences: UserPreferences = {
  minimizeCollegeDays: true,
  maxGapBetweenClasses: 180, // 3 hours maximum gap
  priorityCourses: ['LAB101', 'CS101'], // Lab and CS are priorities
  minimumClassesPerDay: 2 // Don't go for just one class
};

/**
 * Example schedule overrides for specific dates
 */
export const exampleScheduleOverrides: ScheduleOverride[] = [
  {
    date: '2024-01-15',
    classes: [
      {
        startTime: '10:00',
        endTime: '11:30',
        courseId: 'CS101',
        location: 'Room 101'
      },
      {
        startTime: '14:00',
        endTime: '15:30',
        courseId: 'MATH201',
        location: 'Room 205'
      }
    ],
    reason: 'Rescheduled due to instructor availability'
  },
  {
    date: '2024-01-20',
    classes: [], // No classes - holiday
    reason: 'Martin Luther King Jr. Day - No classes'
  }
];

/**
 * Example attendance records
 */
export const exampleAttendanceRecords: AttendanceRecord[] = [
  {
    date: '2024-01-08',
    courseId: 'CS101',
    attended: true,
    reason: 'Regular attendance'
  },
  {
    date: '2024-01-08',
    courseId: 'MATH201',
    attended: false,
    reason: 'Skipped due to long gap'
  },
  {
    date: '2024-01-09',
    courseId: 'LAB101',
    attended: true,
    reason: 'Priority class'
  },
  {
    date: '2024-01-10',
    courseId: 'CS101',
    attended: true
  },
  {
    date: '2024-01-12',
    courseId: 'PHYS101',
    attended: false,
    cancelled: true,
    reason: 'Class cancelled by instructor'
  }
];

/**
 * Set up a complete example system
 */
export function createExampleSystem(): CollegeDecisionEngine {
  const dataManager = new DataManager();
  
  // Add courses
  exampleCourses.forEach(course => dataManager.addCourse(course));
  
  // Set weekly schedule
  dataManager.setWeeklySchedule(exampleWeeklySchedule);
  
  // Set preferences
  dataManager.setPreferences(examplePreferences);
  
  // Add schedule overrides
  exampleScheduleOverrides.forEach(override => 
    dataManager.addScheduleOverride(override)
  );
  
  // Add attendance records
  exampleAttendanceRecords.forEach(record => 
    dataManager.addAttendanceRecord(record)
  );
  
  return new CollegeDecisionEngine(dataManager);
}

/**
 * Demo scenarios to test different situations
 */
export const demoScenarios = {
  /**
   * Student with good attendance - should be selective
   */
  goodAttendanceStudent: {
    courses: [
      {
        id: 'CS101',
        name: 'Computer Science',
        requiredAttendancePercentage: 75,
        totalClassesScheduled: 40,
        classesAttended: 35,
        classesCancelled: 1
      },
      {
        id: 'MATH201',
        name: 'Mathematics',
        requiredAttendancePercentage: 75,
        totalClassesScheduled: 40,
        classesAttended: 32,
        classesCancelled: 0
      }
    ],
    preferences: {
      minimizeCollegeDays: true,
      maxGapBetweenClasses: 120,
      priorityCourses: ['CS101'],
      minimumClassesPerDay: 2
    }
  },

  /**
   * Student with critical attendance - must attend everything
   */
  criticalAttendanceStudent: {
    courses: [
      {
        id: 'CS101',
        name: 'Computer Science',
        requiredAttendancePercentage: 75,
        totalClassesScheduled: 40,
        classesAttended: 28, // 70% - below requirement!
        classesCancelled: 0
      },
      {
        id: 'MATH201',
        name: 'Mathematics',
        requiredAttendancePercentage: 75,
        totalClassesScheduled: 40,
        classesAttended: 30, // Exactly 75%
        classesCancelled: 0
      }
    ],
    preferences: {
      minimizeCollegeDays: true,
      maxGapBetweenClasses: 240, // Will tolerate larger gaps due to necessity
      priorityCourses: [],
      minimumClassesPerDay: 1 // Will go for even one critical class
    }
  },

  /**
   * Day with bad schedule (large gaps)
   */
  badScheduleDay: [
    {
      startTime: '09:00',
      endTime: '10:30',
      courseId: 'CS101',
      location: 'Room 101'
    },
    {
      startTime: '15:00', // 4.5 hour gap!
      endTime: '16:30',
      courseId: 'MATH201',
      location: 'Room 205'
    }
  ],

  /**
   * Day with good schedule (compact)
   */
  goodScheduleDay: [
    {
      startTime: '09:00',
      endTime: '10:30',
      courseId: 'CS101',
      location: 'Room 101'
    },
    {
      startTime: '11:00',
      endTime: '12:30',
      courseId: 'MATH201',
      location: 'Room 205'
    },
    {
      startTime: '13:30',
      endTime: '15:00',
      courseId: 'PHYS101',
      location: 'Room 301'
    }
  ]
};

/**
 * Test different decision scenarios
 */
export function runExampleScenarios() {
  const engine = createExampleSystem();
  
  console.log('=== College Attendance Decision System Demo ===\n');
  
  // Test today's decision
  console.log('1. Should I go to college today?');
  const todayDecision = engine.shouldGoToday();
  console.log(`Decision: ${todayDecision.shouldGo ? 'GO' : 'STAY HOME'}`);
  console.log(`Confidence: ${todayDecision.confidence}%`);
  console.log(`Summary: ${todayDecision.summary}\n`);
  
  // Test specific date analysis
  console.log('2. Detailed analysis for Monday (2024-01-15):');
  const mondayAnalysis = engine.analyzeDay('2024-01-15');
  console.log(`Should go: ${mondayAnalysis.shouldGo}`);
  console.log(`Recommended classes: ${mondayAnalysis.recommendedClasses.join(', ')}`);
  console.log('Reasoning:');
  mondayAnalysis.reasoning.forEach(reason => console.log(`  - ${reason}`));
  
  if (mondayAnalysis.timeGaps.length > 0) {
    console.log('Time gaps:');
    mondayAnalysis.timeGaps.forEach(gap => 
      console.log(`  - ${gap.start} to ${gap.end} (${Math.round(gap.duration / 60 * 10) / 10}h)`)
    );
  }
  console.log('');
  
  // Test course summary
  console.log('3. Course attendance summary:');
  const courseSummary = engine.getCourseSummary();
  courseSummary.forEach(course => {
    console.log(`${course.name}: ${course.attendancePercentage}% (${course.status.toUpperCase()})`);
    console.log(`  Can skip: ${course.classesCanSkip} classes`);
    console.log(`  Need: ${course.classesNeeded} more classes`);
  });
  console.log('');
  
  // Test upcoming week
  console.log('4. Upcoming week analysis:');
  const upcomingWeek = engine.analyzeUpcomingDays(7);
  upcomingWeek.forEach(day => {
    console.log(`${day.date}: ${day.shouldGo ? 'GO' : 'SKIP'} - ${day.recommendedClasses.length} classes`);
  });
}

/**
 * Export everything for easy importing
 */
export {
  exampleCourses,
  exampleWeeklySchedule,
  examplePreferences,
  exampleScheduleOverrides,
  exampleAttendanceRecords
};