import { Course, AttendanceRecord, AttendanceStatus, ScheduleOverride, ClassTime } from '../types/attendance';

export class AttendanceCalculator {
  /**
   * Calculate current attendance status for a course
   */
  static calculateAttendanceStatus(course: Course): AttendanceStatus {
    const totalClassesHeld = course.totalClassesScheduled - course.classesCancelled;
    const currentPercentage = totalClassesHeld > 0 ? (course.classesAttended / totalClassesHeld) * 100 : 0;
    
    // Calculate how many classes needed to reach required percentage
    const requiredClasses = Math.ceil((course.requiredAttendancePercentage / 100) * totalClassesHeld);
    const classesNeededFor75Percent = Math.max(0, requiredClasses - course.classesAttended);
    
    // Estimate remaining classes (this would need to be updated with actual schedule)
    const remainingClassesScheduled = course.totalClassesScheduled - totalClassesHeld;
    
    // Calculate how many more classes can be skipped
    const maxSkippableClasses = course.classesAttended - requiredClasses;
    const canSkip = Math.max(0, maxSkippableClasses);
    
    // Determine if at risk (needs to attend most/all remaining classes)
    const futureClassesNeeded = classesNeededFor75Percent;
    const isAtRisk = futureClassesNeeded > remainingClassesScheduled * 0.8; // If need to attend >80% of remaining
    
    return {
      courseId: course.id,
      courseName: course.name,
      classesAttended: course.classesAttended,
      totalClassesHeld,
      currentPercentage: Math.round(currentPercentage * 100) / 100,
      classesNeededFor75Percent,
      remainingClassesScheduled,
      canSkip,
      isAtRisk
    };
  }

  /**
   * Calculate attendance impact of attending vs skipping classes on a given day
   */
  static calculateDayImpact(
    courses: Course[],
    dayClasses: ClassTime[],
    totalRemainingClasses: { [courseId: string]: number }
  ) {
    const impact: { [courseId: string]: any } = {};

    dayClasses.forEach(classTime => {
      const course = courses.find(c => c.id === classTime.courseId);
      if (!course) return;

      const currentStatus = this.calculateAttendanceStatus(course);
      const totalClassesHeld = course.totalClassesScheduled - course.classesCancelled;
      const remainingTotal = totalRemainingClasses[course.id] || 0;

      // Calculate percentage after attending this class
      const afterAttending = ((course.classesAttended + 1) / (totalClassesHeld + 1)) * 100;
      
      // Calculate percentage after skipping this class
      const afterSkipping = (course.classesAttended / (totalClassesHeld + 1)) * 100;

      // Determine if this class is required to maintain 75%
      const requiredClasses = Math.ceil((course.requiredAttendancePercentage / 100) * (totalClassesHeld + remainingTotal));
      const isRequired = course.classesAttended < requiredClasses && 
                        (course.classesAttended + remainingTotal) <= requiredClasses;

      impact[classTime.courseId] = {
        currentPercentage: currentStatus.currentPercentage,
        afterAttending: Math.round(afterAttending * 100) / 100,
        afterSkipping: Math.round(afterSkipping * 100) / 100,
        isRequired
      };
    });

    return impact;
  }

  /**
   * Predict future attendance requirements based on current status and remaining schedule
   */
  static predictFutureRequirements(
    course: Course, 
    remainingClassesInSchedule: number
  ): {
    minimumToAttend: number;
    canSkip: number;
    mustAttendPercentage: number;
  } {
    const totalFutureClasses = course.totalClassesScheduled - course.classesCancelled + remainingClassesInSchedule;
    const requiredClasses = Math.ceil((course.requiredAttendancePercentage / 100) * totalFutureClasses);
    const minimumToAttend = Math.max(0, requiredClasses - course.classesAttended);
    const canSkip = Math.max(0, remainingClassesInSchedule - minimumToAttend);
    const mustAttendPercentage = remainingClassesInSchedule > 0 ? 
      (minimumToAttend / remainingClassesInSchedule) * 100 : 0;

    return {
      minimumToAttend,
      canSkip,
      mustAttendPercentage: Math.round(mustAttendPercentage * 100) / 100
    };
  }

  /**
   * Check if attendance is recoverable (can still reach 75% with remaining classes)
   */
  static isAttendanceRecoverable(
    course: Course, 
    remainingClassesInSchedule: number
  ): boolean {
    const totalFutureClasses = course.totalClassesScheduled - course.classesCancelled + remainingClassesInSchedule;
    const maxPossibleAttended = course.classesAttended + remainingClassesInSchedule;
    const maxPossiblePercentage = (maxPossibleAttended / totalFutureClasses) * 100;
    
    return maxPossiblePercentage >= course.requiredAttendancePercentage;
  }

  /**
   * Get attendance summary for all courses
   */
  static getAttendanceSummary(courses: Course[]): AttendanceStatus[] {
    return courses.map(course => this.calculateAttendanceStatus(course));
  }

  /**
   * Calculate optimal attendance strategy for upcoming classes
   */
  static calculateOptimalStrategy(
    courses: Course[],
    upcomingClasses: ClassTime[],
    remainingClassCounts: { [courseId: string]: number }
  ): {
    mustAttend: string[];
    canSkip: string[];
    recommended: string[];
  } {
    const mustAttend: string[] = [];
    const canSkip: string[] = [];
    const recommended: string[] = [];

    upcomingClasses.forEach(classTime => {
      const course = courses.find(c => c.id === classTime.courseId);
      if (!course) return;

      const future = this.predictFutureRequirements(
        course, 
        remainingClassCounts[course.id] || 0
      );

      if (future.minimumToAttend > future.canSkip) {
        mustAttend.push(classTime.courseId);
      } else if (future.canSkip > future.minimumToAttend * 2) {
        canSkip.push(classTime.courseId);
      } else {
        recommended.push(classTime.courseId);
      }
    });

    return { mustAttend, canSkip, recommended };
  }
}