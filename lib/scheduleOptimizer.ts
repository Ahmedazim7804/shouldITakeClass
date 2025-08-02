import { ClassTime, UserPreferences, DayAnalysis } from '../types/attendance';

export class ScheduleOptimizer {
  /**
   * Calculate time gaps between classes on a given day
   */
  static calculateTimeGaps(classes: ClassTime[]): {
    start: string;
    end: string;
    duration: number;
  }[] {
    if (classes.length <= 1) return [];

    // Sort classes by start time
    const sortedClasses = [...classes].sort((a, b) => 
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    );

    const gaps = [];
    for (let i = 0; i < sortedClasses.length - 1; i++) {
      const currentEnd = sortedClasses[i].endTime;
      const nextStart = sortedClasses[i + 1].startTime;
      
      const gapDuration = this.timeToMinutes(nextStart) - this.timeToMinutes(currentEnd);
      
      if (gapDuration > 0) {
        gaps.push({
          start: currentEnd,
          end: nextStart,
          duration: gapDuration
        });
      }
    }

    return gaps;
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   */
  static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Convert minutes to time string (HH:MM)
   */
  static minutesToTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  /**
   * Calculate the total time spent at college for a day (from first class to last class)
   */
  static calculateDayDuration(classes: ClassTime[]): number {
    if (classes.length === 0) return 0;
    if (classes.length === 1) {
      return this.timeToMinutes(classes[0].endTime) - this.timeToMinutes(classes[0].startTime);
    }

    const sortedClasses = [...classes].sort((a, b) => 
      this.timeToMinutes(a.startTime) - this.timeToMinutes(b.startTime)
    );

    const firstClassStart = this.timeToMinutes(sortedClasses[0].startTime);
    const lastClassEnd = this.timeToMinutes(sortedClasses[sortedClasses.length - 1].endTime);

    return lastClassEnd - firstClassStart;
  }

  /**
   * Check if a day's schedule violates user preferences
   */
  static violatesPreferences(
    classes: ClassTime[], 
    preferences: UserPreferences
  ): {
    violatesGapLimit: boolean;
    violatesMinimumClasses: boolean;
    maxGapDuration: number;
    reasons: string[];
  } {
    const gaps = this.calculateTimeGaps(classes);
    const maxGap = gaps.length > 0 ? Math.max(...gaps.map(g => g.duration)) : 0;
    const violatesGapLimit = maxGap > preferences.maxGapBetweenClasses;
    const violatesMinimumClasses = classes.length < preferences.minimumClassesPerDay;

    const reasons = [];
    if (violatesGapLimit) {
      reasons.push(`Gap of ${Math.round(maxGap / 60 * 10) / 10} hours exceeds limit of ${Math.round(preferences.maxGapBetweenClasses / 60 * 10) / 10} hours`);
    }
    if (violatesMinimumClasses) {
      reasons.push(`Only ${classes.length} classes, minimum is ${preferences.minimumClassesPerDay}`);
    }

    return {
      violatesGapLimit,
      violatesMinimumClasses,
      maxGapDuration: maxGap,
      reasons
    };
  }

  /**
   * Calculate a score for how "good" a day is based on preferences
   * Higher score = better day
   */
  static calculateDayScore(
    classes: ClassTime[], 
    preferences: UserPreferences,
    mustAttendClasses: string[] = []
  ): number {
    if (classes.length === 0) return 0;

    let score = 0;

    // Base score for number of classes
    score += classes.length * 10;

    // Bonus for must-attend classes
    const mustAttendCount = classes.filter(c => mustAttendClasses.includes(c.courseId)).length;
    score += mustAttendCount * 20;

    // Penalty for gaps
    const gaps = this.calculateTimeGaps(classes);
    const totalGapTime = gaps.reduce((sum, gap) => sum + gap.duration, 0);
    score -= totalGapTime / 60; // Subtract 1 point per hour of gap

    // Large penalty for violating gap limit
    const maxGap = gaps.length > 0 ? Math.max(...gaps.map(g => g.duration)) : 0;
    if (maxGap > preferences.maxGapBetweenClasses) {
      score -= 50;
    }

    // Penalty for being below minimum classes
    if (classes.length < preferences.minimumClassesPerDay) {
      score -= 30;
    }

    // Bonus for priority courses
    const priorityCount = classes.filter(c => preferences.priorityCourses.includes(c.courseId)).length;
    score += priorityCount * 5;

    return Math.round(score * 10) / 10;
  }

  /**
   * Find the optimal subset of classes to attend on a day
   * considering attendance requirements and preferences
   */
  static optimizeClassSelection(
    allDayClasses: ClassTime[],
    mustAttendClasses: string[],
    preferences: UserPreferences
  ): {
    selectedClasses: ClassTime[];
    skippedClasses: ClassTime[];
    score: number;
    reasoning: string[];
  } {
    const mustAttend = allDayClasses.filter(c => mustAttendClasses.includes(c.courseId));
    const optional = allDayClasses.filter(c => !mustAttendClasses.includes(c.courseId));

    // Always include must-attend classes
    let bestSelection = [...mustAttend];
    let bestScore = this.calculateDayScore(bestSelection, preferences, mustAttendClasses);
    let reasoning = [`Including ${mustAttend.length} required classes`];

    // Try adding optional classes one by one, keeping the best combination
    const remainingOptional = [...optional];
    
    while (remainingOptional.length > 0) {
      let bestAddition: ClassTime | null = null;
      let bestNewScore = bestScore;

      // Try adding each remaining optional class
      for (const optionalClass of remainingOptional) {
        const testSelection = [...bestSelection, optionalClass];
        const testScore = this.calculateDayScore(testSelection, preferences, mustAttendClasses);
        
        if (testScore > bestNewScore) {
          bestNewScore = testScore;
          bestAddition = optionalClass;
        }
      }

      // If we found a good addition, add it
      if (bestAddition && bestNewScore > bestScore) {
        bestSelection.push(bestAddition);
        bestScore = bestNewScore;
        remainingOptional.splice(remainingOptional.indexOf(bestAddition), 1);
        
        // Check if this creates any preference violations
        const violations = this.violatesPreferences(bestSelection, preferences);
        if (violations.violatesGapLimit || violations.violatesMinimumClasses) {
          reasoning.push(`Added ${bestAddition.courseId} despite ${violations.reasons.join(', ')}`);
        } else {
          reasoning.push(`Added optional class ${bestAddition.courseId}`);
        }
      } else {
        // No more beneficial additions
        break;
      }
    }

    const skippedClasses = allDayClasses.filter(c => 
      !bestSelection.some(selected => selected.courseId === c.courseId)
    );

    if (skippedClasses.length > 0) {
      reasoning.push(`Skipping ${skippedClasses.length} classes: ${skippedClasses.map(c => c.courseId).join(', ')}`);
    }

    return {
      selectedClasses: bestSelection,
      skippedClasses,
      score: bestScore,
      reasoning
    };
  }

  /**
   * Analyze if it's worth going to college on a specific day
   */
  static shouldGoToCollege(
    dayClasses: ClassTime[],
    mustAttendClasses: string[],
    preferences: UserPreferences
  ): {
    shouldGo: boolean;
    confidence: number; // 0-100
    reasoning: string[];
  } {
    if (dayClasses.length === 0) {
      return {
        shouldGo: false,
        confidence: 100,
        reasoning: ['No classes scheduled']
      };
    }

    const mustAttendCount = dayClasses.filter(c => mustAttendClasses.includes(c.courseId)).length;
    
    // Must go if there are required classes
    if (mustAttendCount > 0) {
      return {
        shouldGo: true,
        confidence: 100,
        reasoning: [`${mustAttendCount} required classes to maintain attendance`]
      };
    }

    // No required classes, evaluate based on preferences
    const optimized = this.optimizeClassSelection(dayClasses, mustAttendClasses, preferences);
    const violations = this.violatesPreferences(optimized.selectedClasses, preferences);

    let shouldGo = true;
    let confidence = 70;
    const reasoning = [];

    // Check minimum classes threshold
    if (optimized.selectedClasses.length < preferences.minimumClassesPerDay) {
      shouldGo = false;
      confidence = 80;
      reasoning.push(`Only ${optimized.selectedClasses.length} classes, below minimum of ${preferences.minimumClassesPerDay}`);
    }

    // Check gap violations
    if (violations.violatesGapLimit) {
      shouldGo = false;
      confidence = 85;
      reasoning.push(`Time gaps too large: ${violations.reasons.join(', ')}`);
    }

    // Consider travel time (4 hours total)
    const totalCollegeTime = this.calculateDayDuration(optimized.selectedClasses);
    if (totalCollegeTime < 240) { // Less than 4 hours
      confidence -= 20;
      reasoning.push(`Only ${Math.round(totalCollegeTime / 60 * 10) / 10} hours at college vs 4 hours travel time`);
    }

    // If going despite issues, explain why
    if (shouldGo && (violations.violatesGapLimit || violations.violatesMinimumClasses)) {
      reasoning.push('Going anyway due to attendance requirements or priority courses');
    }

    return {
      shouldGo,
      confidence: Math.max(0, Math.min(100, confidence)),
      reasoning
    };
  }
}