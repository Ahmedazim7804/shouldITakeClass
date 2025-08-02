import { DataManager } from './dataManager';
import { AttendanceCalculator } from './attendanceCalculator';
import { ScheduleOptimizer } from './scheduleOptimizer';
import { 
  DayAnalysis, 
  DecisionContext, 
  AttendanceStatus,
  ClassTime,
  Course
} from '../types/attendance';

export class CollegeDecisionEngine {
  private dataManager: DataManager;

  constructor(dataManager: DataManager) {
    this.dataManager = dataManager;
  }

  /**
   * Main function: Analyze a specific date and provide complete recommendation
   */
  analyzeDay(date: string): DayAnalysis {
    const context = this.buildDecisionContext(date);
    
    // Get the schedule for this specific date
    const scheduledClasses = this.dataManager.getScheduleForDate(date);
    
    if (scheduledClasses.length === 0) {
      return {
        date,
        scheduledClasses: [],
        shouldGo: false,
        recommendedClasses: [],
        reasoning: ['No classes scheduled for this day'],
        timeGaps: [],
        attendanceImpact: {}
      };
    }

    // Calculate attendance impact for each class
    const attendanceImpact = this.calculateAttendanceImpact(scheduledClasses, context);
    
    // Determine which classes are required for attendance
    const mustAttendClasses = this.findMustAttendClasses(context);
    
    // Optimize class selection based on preferences
    const optimization = ScheduleOptimizer.optimizeClassSelection(
      scheduledClasses,
      mustAttendClasses,
      context.preferences
    );

    // Make the final decision
    const decision = ScheduleOptimizer.shouldGoToCollege(
      scheduledClasses,
      mustAttendClasses,
      context.preferences
    );

    // Calculate time gaps for the recommended classes
    const timeGaps = ScheduleOptimizer.calculateTimeGaps(optimization.selectedClasses);

    // Build comprehensive reasoning
    const reasoning = this.buildReasoning(
      decision,
      optimization,
      attendanceImpact,
      context
    );

    return {
      date,
      scheduledClasses,
      shouldGo: decision.shouldGo,
      recommendedClasses: optimization.selectedClasses.map(c => c.courseId),
      reasoning,
      timeGaps,
      attendanceImpact
    };
  }

  /**
   * Quick answer: Should I go to college today?
   */
  shouldGoToday(): { shouldGo: boolean; confidence: number; summary: string } {
    const today = new Date().toISOString().split('T')[0];
    const analysis = this.analyzeDay(today);
    
    let summary = analysis.shouldGo ? 
      `Yes, go to college. ${analysis.recommendedClasses.length} classes recommended.` :
      `No, stay home. ${analysis.reasoning[0] || 'Not worth the 4-hour travel time.'}.`;

    return {
      shouldGo: analysis.shouldGo,
      confidence: this.calculateConfidenceScore(analysis),
      summary
    };
  }

  /**
   * Analyze multiple upcoming days
   */
  analyzeUpcomingDays(days: number = 7): DayAnalysis[] {
    const analyses: DayAnalysis[] = [];
    const today = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      analyses.push(this.analyzeDay(dateStr));
    }
    
    return analyses;
  }

  /**
   * Get attendance status summary for all courses
   */
  getAttendanceStatusSummary(): AttendanceStatus[] {
    const courses = this.dataManager.getAllCourses();
    return AttendanceCalculator.getAttendanceSummary(courses);
  }

  /**
   * Build decision context for a specific date
   */
  private buildDecisionContext(date: string): DecisionContext {
    const courses = this.dataManager.getAllCourses();
    const daySchedule = this.dataManager.getScheduleForDate(date);
    const attendanceStatuses = AttendanceCalculator.getAttendanceSummary(courses);
    const preferences = this.dataManager.getPreferences();
    
    // Get upcoming schedule for planning
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() + 30); // Look 30 days ahead
    const upcomingSchedule = this.dataManager.getUpcomingSchedule(date, endDate.toISOString().split('T')[0]);

    return {
      date,
      courses,
      daySchedule,
      attendanceStatuses,
      preferences,
      upcomingSchedule
    };
  }

  /**
   * Calculate attendance impact for each class on the given day
   */
  private calculateAttendanceImpact(
    scheduledClasses: ClassTime[], 
    context: DecisionContext
  ): { [courseId: string]: any } {
    const remainingClassCounts: { [courseId: string]: number } = {};
    
    // Calculate remaining classes for each course
    context.courses.forEach(course => {
      const remaining = Math.max(0, course.totalClassesScheduled - 
        (course.classesAttended + course.classesCancelled));
      remainingClassCounts[course.id] = remaining;
    });

    return AttendanceCalculator.calculateDayImpact(
      context.courses,
      scheduledClasses,
      remainingClassCounts
    );
  }

  /**
   * Find classes that are absolutely required for maintaining attendance
   */
  private findMustAttendClasses(context: DecisionContext): string[] {
    const mustAttend: string[] = [];

    context.daySchedule.forEach(classTime => {
      const course = context.courses.find(c => c.id === classTime.courseId);
      if (!course) return;

      const status = AttendanceCalculator.calculateAttendanceStatus(course);
      
      // Must attend if:
      // 1. Already below 75% and need every class
      // 2. Very close to dropping below 75%
      // 3. Can't afford to skip any more classes
      if (status.currentPercentage < course.requiredAttendancePercentage || 
          status.canSkip === 0 || 
          status.isAtRisk) {
        mustAttend.push(classTime.courseId);
      }
    });

    return mustAttend;
  }

  /**
   * Build comprehensive reasoning for the decision
   */
  private buildReasoning(
    decision: { shouldGo: boolean; confidence: number; reasoning: string[] },
    optimization: any,
    attendanceImpact: any,
    context: DecisionContext
  ): string[] {
    const reasoning: string[] = [];

    // Start with the main decision reasoning
    reasoning.push(...decision.reasoning);

    // Add attendance-specific reasoning
    const criticalCourses = Object.keys(attendanceImpact).filter(
      courseId => attendanceImpact[courseId].isRequired
    );

    if (criticalCourses.length > 0) {
      const courseNames = criticalCourses.map(id => {
        const course = context.courses.find(c => c.id === id);
        return course ? course.name : id;
      });
      reasoning.push(`Critical attendance: ${courseNames.join(', ')}`);
    }

    // Add optimization reasoning
    if (optimization.reasoning && optimization.reasoning.length > 0) {
      reasoning.push(...optimization.reasoning);
    }

    // Add travel time consideration
    if (optimization.selectedClasses.length > 0) {
      const totalTime = ScheduleOptimizer.calculateDayDuration(optimization.selectedClasses);
      const efficiency = totalTime / 240; // Compare to 4 hours travel time
      
      if (efficiency < 1) {
        reasoning.push(`Low efficiency: ${Math.round(totalTime / 60 * 10) / 10}h at college vs 4h travel`);
      } else {
        reasoning.push(`Good efficiency: ${Math.round(totalTime / 60 * 10) / 10}h at college for 4h travel`);
      }
    }

    return reasoning;
  }

  /**
   * Calculate confidence score for the decision
   */
  private calculateConfidenceScore(analysis: DayAnalysis): number {
    if (!analysis.shouldGo && analysis.scheduledClasses.length === 0) {
      return 100; // Very confident when no classes
    }

    if (analysis.shouldGo && analysis.recommendedClasses.length === 0) {
      return 20; // Low confidence if should go but no classes recommended
    }

    let confidence = 70; // Base confidence

    // Increase confidence for must-attend classes
    const mustAttendCount = Object.values(analysis.attendanceImpact)
      .filter((impact: any) => impact.isRequired).length;
    confidence += mustAttendCount * 10;

    // Decrease confidence for large gaps
    const maxGap = analysis.timeGaps.length > 0 ? 
      Math.max(...analysis.timeGaps.map(g => g.duration)) : 0;
    if (maxGap > 180) { // More than 3 hours
      confidence -= 15;
    }

    // Adjust for travel efficiency
    if (analysis.recommendedClasses.length > 0) {
      const totalTime = ScheduleOptimizer.calculateDayDuration(
        analysis.scheduledClasses.filter(c => 
          analysis.recommendedClasses.includes(c.courseId)
        )
      );
      const efficiency = totalTime / 240;
      if (efficiency < 0.5) {
        confidence -= 20;
      } else if (efficiency > 1.5) {
        confidence += 10;
      }
    }

    return Math.max(0, Math.min(100, Math.round(confidence)));
  }

  /**
   * Get a summary of all courses and their attendance status
   */
  getCourseSummary(): {
    courseId: string;
    name: string;
    attendancePercentage: number;
    status: 'safe' | 'warning' | 'critical';
    classesCanSkip: number;
    classesNeeded: number;
  }[] {
    const statuses = this.getAttendanceStatusSummary();
    
    return statuses.map(status => ({
      courseId: status.courseId,
      name: status.courseName,
      attendancePercentage: status.currentPercentage,
      status: status.isAtRisk ? 'critical' : 
              status.currentPercentage < 80 ? 'warning' : 'safe',
      classesCanSkip: status.canSkip,
      classesNeeded: status.classesNeededFor75Percent
    }));
  }

  /**
   * Simulate attending/skipping classes and see future impact
   */
  simulateAttendanceDecision(
    date: string, 
    attendedCourseIds: string[]
  ): { [courseId: string]: { newPercentage: number; impact: string } } {
    const result: { [courseId: string]: { newPercentage: number; impact: string } } = {};
    const dayClasses = this.dataManager.getScheduleForDate(date);
    
    dayClasses.forEach(classTime => {
      const course = this.dataManager.getCourse(classTime.courseId);
      if (!course) return;

      const attended = attendedCourseIds.includes(classTime.courseId);
      const newAttended = course.classesAttended + (attended ? 1 : 0);
      const newTotal = course.totalClassesScheduled - course.classesCancelled + 1;
      const newPercentage = (newAttended / newTotal) * 100;

      let impact = 'neutral';
      if (newPercentage < course.requiredAttendancePercentage) {
        impact = 'critical';
      } else if (newPercentage < course.requiredAttendancePercentage + 5) {
        impact = 'warning';
      } else {
        impact = 'safe';
      }

      result[classTime.courseId] = {
        newPercentage: Math.round(newPercentage * 100) / 100,
        impact
      };
    });

    return result;
  }
}