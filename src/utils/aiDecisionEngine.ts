import { Course, ClassSchedule, DayRecommendation, UserPreferences, AILearningData } from '../types';
import { generateDayRecommendation } from './decisionEngine';
import { DataService } from './dataService';

export class AIDecisionEngine {
  private preferences: UserPreferences;

  constructor(preferences: UserPreferences) {
    this.preferences = preferences;
  }

  async generateEnhancedRecommendation(
    date: string,
    courses: Course[],
    schedule: ClassSchedule[],
    overrides: any[]
  ): Promise<DayRecommendation> {
    // Get learning data from database
    const learningData = await DataService.getAILearningDataForAnalysis();
    
    // Get base recommendation
    const baseRecommendation = generateDayRecommendation(date, courses, schedule, overrides);
    
    // Enhanced AI decision with 75% requirement consideration
    const enhancedDecision = await this.generateSmartAttendanceDecision(date, courses, schedule, learningData);
    
    // Get AI insights
    const aiInsights = await this.generateAIInsights(date, courses, schedule, baseRecommendation, learningData);
    const confidence = this.calculateConfidence(baseRecommendation, date, learningData);
    const weatherImpact = await this.getWeatherImpact(date);
    const travelTimeImpact = await this.getTravelTimeImpact(date);

    return {
      ...baseRecommendation,
      shouldGo: enhancedDecision.shouldGo,
      reason: enhancedDecision.reason,
      confidence,
      aiInsights,
      weatherImpact,
      travelTimeImpact,
      attendanceImpact: enhancedDecision.attendanceImpact
    };
  }

  private async generateSmartAttendanceDecision(
    date: string,
    courses: Course[],
    schedule: ClassSchedule[],
    learningData: AILearningData
  ) {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const todaysClasses = schedule.filter(cls => cls.day === dayOfWeek);
    
    if (todaysClasses.length === 0) {
      return {
        shouldGo: false,
        reason: "No classes scheduled for today. Perfect day to rest or catch up on assignments!",
        attendanceImpact: []
      };
    }

    // Calculate current semester progress (assuming 16-week semester)
    const semesterWeeks = 16;
    const currentWeek = this.getCurrentSemesterWeek();
    const remainingWeeks = Math.max(0, semesterWeeks - currentWeek);

    // Analyze each course's attendance situation
    const attendanceAnalysis = todaysClasses.map(classSchedule => {
      const course = courses.find(c => c.id === classSchedule.courseId);
      if (!course) return null;

      const currentPercentage = (course.attendedClasses / course.totalClasses) * 100;
      const requiredPercentage = 75;
      
      // Calculate minimum classes needed to maintain 75%
      const totalExpectedClasses = course.totalClasses;
      const minRequiredClasses = Math.ceil(totalExpectedClasses * 0.75);
      const classesCanMiss = totalExpectedClasses - minRequiredClasses;
      const alreadyMissed = course.totalClasses - course.attendedClasses;
      const classesLeftToMiss = Math.max(0, classesCanMiss - alreadyMissed);
      
      // Estimate remaining classes in semester
      const classesPerWeek = this.getClassesPerWeekForCourse(course.id, schedule);
      const estimatedRemainingClasses = Math.max(0, classesPerWeek * remainingWeeks);
      
      let status: 'safe' | 'warning' | 'critical';
      let newPercentage = currentPercentage;
      
      if (currentPercentage < 65) {
        status = 'critical';
      } else if (currentPercentage < 75) {
        status = 'warning';
      } else if (classesLeftToMiss <= 2) {
        status = 'warning';
      } else {
        status = 'safe';
      }

      // Calculate impact of attending vs not attending
      if (course.attendedClasses + 1 <= course.totalClasses) {
        newPercentage = ((course.attendedClasses + 1) / course.totalClasses) * 100;
      }

      return {
        courseId: course.id,
        courseName: course.name,
        currentPercentage: Math.round(currentPercentage * 100) / 100,
        newPercentage: Math.round(newPercentage * 100) / 100,
        status,
        classesLeftToMiss,
        estimatedRemainingClasses,
        mustAttend: status === 'critical' || (status === 'warning' && classesLeftToMiss <= 1)
      };
    }).filter(Boolean);

    // Decision logic
    const criticalCourses = attendanceAnalysis.filter(a => a.status === 'critical');
    const warningCourses = attendanceAnalysis.filter(a => a.status === 'warning');
    const mustAttendCourses = attendanceAnalysis.filter(a => a.mustAttend);

    let shouldGo = false;
    let reason = "";

    if (mustAttendCourses.length > 0) {
      shouldGo = true;
      const criticalCourseNames = mustAttendCourses.map(c => c.courseName).join(', ');
      reason = `Critical attendance situation! You must attend ${criticalCourseNames} to maintain 75% attendance. Missing these classes could jeopardize your eligibility.`;
    } else if (criticalCourses.length > 0) {
      shouldGo = true;
      reason = `You have ${criticalCourses.length} course(s) with critical attendance levels (<65%). Recommended to attend to improve your standing.`;
    } else if (warningCourses.length > 0) {
      // Apply additional factors for warning cases
      const gapOptimization = this.analyzeGapOptimization(todaysClasses, courses);
      const historicalPattern = this.analyzeHistoricalPattern(dayOfWeek, learningData);
      
      if (gapOptimization.hasLongGaps && gapOptimization.safeToSkipSome) {
        shouldGo = false;
        reason = `While some courses need attention, you have long gaps (${gapOptimization.longestGap}) between classes. Consider attending only critical classes or rescheduling.`;
      } else if (historicalPattern.confidence > 0.7 && historicalPattern.usually === 'skip') {
        shouldGo = false;
        reason = `Based on your attendance pattern, you typically skip ${dayOfWeek}s. Your attendance levels allow some flexibility.`;
      } else {
        shouldGo = true;
        reason = `Some courses need attention for 75% compliance. Recommended to attend to stay on track.`;
      }
    } else {
      // All courses are safe - apply optimization logic
      const gapOptimization = this.analyzeGapOptimization(todaysClasses, courses);
      const weatherFactor = await this.getWeatherImpact(date);
      const travelFactor = await this.getTravelTimeImpact(date);
      
      if (gapOptimization.hasLongGaps && gapOptimization.totalGapTime > 240) {
        shouldGo = false;
        reason = `All courses have safe attendance levels (75%+). You have ${Math.round(gapOptimization.totalGapTime/60)}+ hours of gaps. Consider skipping to optimize your time.`;
      } else if (this.preferences.weatherSensitivity === 'high' && 
                 (weatherFactor.condition === 'rainy' || weatherFactor.condition === 'stormy')) {
        shouldGo = false;
        reason = `Attendance levels are safe across all courses. Bad weather and 2-hour commute make staying home optimal today.`;
      } else {
        shouldGo = true;
        reason = `Good day to attend! Attendance levels are healthy and schedule is well-optimized.`;
      }
    }

    return {
      shouldGo,
      reason,
      attendanceImpact: attendanceAnalysis.map(a => ({
        courseId: a.courseId,
        currentPercentage: a.currentPercentage,
        newPercentage: a.newPercentage,
        status: a.status
      }))
    };
  }

  private getCurrentSemesterWeek(): number {
    // Simple calculation - in a real app, this would be configurable
    const semesterStart = new Date('2024-01-15'); // Adjust based on actual semester start
    const today = new Date();
    const weeksDiff = Math.floor((today.getTime() - semesterStart.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, Math.min(16, weeksDiff + 1));
  }

  private getClassesPerWeekForCourse(courseId: string, schedule: ClassSchedule[]): number {
    return schedule.filter(s => s.courseId === courseId).length;
  }

  private analyzeGapOptimization(todaysClasses: ClassSchedule[], courses: Course[]) {
    const gaps = this.calculateTimeGaps(todaysClasses);
    const longestGap = gaps.reduce((max, gap) => {
      const duration = this.parseGapDuration(gap.duration);
      return duration > max ? duration : max;
    }, 0);

    const totalGapTime = gaps.reduce((total, gap) => total + this.parseGapDuration(gap.duration), 0);
    const hasLongGaps = longestGap > this.preferences.maxGapBetweenClasses;

    // Check if we have courses safe to skip
    const safeCourses = todaysClasses.filter(classSchedule => {
      const course = courses.find(c => c.id === classSchedule.courseId);
      if (!course) return false;
      const percentage = (course.attendedClasses / course.totalClasses) * 100;
      return percentage >= 80; // Safe margin above 75%
    });

    return {
      hasLongGaps,
      longestGap: `${Math.floor(longestGap/60)}h ${longestGap%60}min`,
      totalGapTime,
      safeToSkipSome: safeCourses.length > 0
    };
  }

  // Record AI decision and actual attendance for learning
  async recordDecision(
    date: string,
    aiRecommended: boolean,
    actualAttended: boolean,
    confidence: number,
    weather: string = 'unknown'
  ): Promise<void> {
    try {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
      const courses = await DataService.getAllCourses();
      const schedule = await DataService.getAllClassSchedules();
      
      // Calculate gaps
      const todaysClasses = schedule.filter(cls => cls.day === dayOfWeek);
      const gaps = this.calculateTimeGaps(todaysClasses);
      const totalGaps = gaps.reduce((sum, gap) => sum + this.parseGapDuration(gap.duration), 0);

      await DataService.saveAILearningData({
        date,
        attended: actualAttended,
        weather,
        dayOfWeek,
        totalClasses: courses.length,
        gaps: totalGaps,
        aiRecommended,
        actualAttended,
        confidence
      });

      // Update performance metrics based on this decision
      await this.updatePerformanceMetrics(date, aiRecommended, actualAttended, dayOfWeek);
    } catch (error) {
      console.error('Error recording AI decision:', error);
    }
  }

  private async generateAIInsights(
    date: string,
    courses: Course[],
    schedule: ClassSchedule[],
    baseRecommendation: DayRecommendation,
    learningData: AILearningData
  ): Promise<string[]> {
    const insights: string[] = [];
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });

    // Attendance health check
    const attendanceIssues = courses.filter(course => {
      const percentage = (course.attendedClasses / course.totalClasses) * 100;
      return percentage < 75;
    });

    if (attendanceIssues.length > 0) {
      insights.push(`⚠️ ${attendanceIssues.length} course(s) below 75% attendance requirement`);
    }

    // Pattern-based insights
    const historicalPattern = this.analyzeHistoricalPattern(dayOfWeek, learningData);
    if (historicalPattern.confidence > 0.7) {
      insights.push(`📊 Based on your history, you typically ${historicalPattern.usually} on ${dayOfWeek}s`);
    }

    // Gap optimization insights
    if (baseRecommendation.gaps.length > 0) {
      const longGaps = baseRecommendation.gaps.filter(gap => 
        this.parseGapDuration(gap.duration) > this.preferences.maxGapBetweenClasses
      );
      
      if (longGaps.length > 0) {
        insights.push(`⏰ You have ${longGaps.length} gap(s) longer than your preferred ${this.preferences.maxGapBetweenClasses} minutes`);
        
        // Suggest optimization
        const optimizationSuggestion = this.suggestGapOptimization(baseRecommendation, courses);
        if (optimizationSuggestion) {
          insights.push(optimizationSuggestion);
        }
      }
    }

    // Semester progress insight
    const currentWeek = this.getCurrentSemesterWeek();
    const remainingWeeks = Math.max(0, 16 - currentWeek);
    insights.push(`📅 Week ${currentWeek}/16 of semester (${remainingWeeks} weeks remaining)`);

    // Workload balancing
    const workloadInsight = this.analyzeWorkloadBalance(date, courses);
    if (workloadInsight) {
      insights.push(workloadInsight);
    }

    return insights;
  }

  private calculateConfidence(recommendation: DayRecommendation, date: string, learningData: AILearningData): number {
    let confidence = 70; // Base confidence

    // Increase confidence for critical attendance situations
    const criticalCourses = recommendation.attendanceImpact.filter(impact => impact.status === 'critical');
    confidence += criticalCourses.length * 15;

    // Decrease confidence for complex gap situations
    const longGaps = recommendation.gaps.filter(gap => this.parseGapDuration(gap.duration) > 120);
    confidence -= longGaps.length * 10;

    // Historical pattern confidence
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    const historicalPattern = this.analyzeHistoricalPattern(dayOfWeek, learningData);
    confidence += historicalPattern.confidence * 20;

    // Weather certainty
    confidence += 5; // Weather prediction confidence

    return Math.max(0, Math.min(100, confidence));
  }

  private async getWeatherImpact(date: string) {
    // In a real implementation, this would call a weather API
    // For now, we'll simulate weather impact
    const mockWeatherConditions = ['sunny', 'rainy', 'cloudy', 'stormy'];
    const condition = mockWeatherConditions[Math.floor(Math.random() * mockWeatherConditions.length)];
    
    let recommendation = '';
    if (this.preferences.weatherSensitivity === 'high') {
      switch (condition) {
        case 'rainy':
        case 'stormy':
          recommendation = 'Consider staying home due to bad weather and long commute';
          break;
        case 'sunny':
          recommendation = 'Great weather for commuting to college';
          break;
        default:
          recommendation = 'Weather is acceptable for travel';
      }
    }

    return { condition, recommendation };
  }

  private async getTravelTimeImpact(date: string) {
    // In a real implementation, this would call Google Maps API or similar
    // Simulate traffic conditions
    const hour = new Date(date).getHours();
    let trafficLevel: 'low' | 'medium' | 'high' = 'medium';
    let estimatedTime = '2 hours';

    if (hour >= 7 && hour <= 9) {
      trafficLevel = 'high';
      estimatedTime = '2.5-3 hours';
    } else if (hour >= 17 && hour <= 19) {
      trafficLevel = 'high';
      estimatedTime = '2.5-3 hours';
    } else if (hour >= 10 && hour <= 16) {
      trafficLevel = 'low';
      estimatedTime = '1.5-2 hours';
    }

    return { estimatedTime, trafficLevel };
  }

  private enhanceReasonWithAI(baseReason: string, insights: string[], weatherImpact?: any): string {
    let enhancedReason = baseReason;

    if (weatherImpact?.recommendation) {
      enhancedReason += ` ${weatherImpact.recommendation}.`;
    }

    if (insights.length > 0) {
      enhancedReason += ` AI insights: ${insights[0]}.`;
    }

    return enhancedReason;
  }

  private analyzeHistoricalPattern(dayOfWeek: string, learningData: AILearningData) {
    const dayData = learningData.historicalAttendance.filter(
      record => record.dayOfWeek === dayOfWeek
    );

    if (dayData.length < 3) {
      return { confidence: 0, usually: 'attend' };
    }

    const attendanceRate = dayData.filter(d => d.attended).length / dayData.length;
    return {
      confidence: Math.min(dayData.length / 10, 1), // More data = higher confidence
      usually: attendanceRate > 0.6 ? 'attend' : 'skip'
    };
  }

  private suggestGapOptimization(recommendation: DayRecommendation, courses: Course[]): string | null {
    const safeCourses = recommendation.attendanceImpact.filter(
      impact => impact.status === 'safe' && impact.currentPercentage > 80
    );

    if (safeCourses.length > 0) {
      const course = courses.find(c => c.id === safeCourses[0].courseId);
      return `💡 Consider skipping ${course?.name} (${safeCourses[0].currentPercentage}% attendance) to reduce gaps`;
    }

    return null;
  }

  private analyzeAttendanceTrend(courses: Course[]) {
    const needsAttention = courses.filter(course => {
      const percentage = (course.attendedClasses / course.totalClasses) * 100;
      return percentage < 80; // Need attention if below 80%
    });

    return { needsAttention };
  }

  private analyzeWorkloadBalance(date: string, courses: Course[]): string | null {
    const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
    
    // Simple workload analysis - in real app, this could integrate with calendar/assignment data
    if (this.preferences.studyPatterns.preferredStudyDays.includes(dayOfWeek)) {
      return '📚 This aligns with your preferred study schedule';
    }

    return null;
  }

  private parseGapDuration(duration: string): number {
    const hours = duration.match(/(\d+)h/);
    const minutes = duration.match(/(\d+)min/);
    
    let totalMinutes = 0;
    if (hours) totalMinutes += parseInt(hours[1]) * 60;
    if (minutes) totalMinutes += parseInt(minutes[1]);
    
    return totalMinutes;
  }

  private calculateTimeGaps(schedules: ClassSchedule[]): Array<{ start: string; end: string; duration: string }> {
    if (schedules.length < 2) return [];

    const sortedSchedules = schedules.sort((a, b) => 
      new Date(`2000-01-01 ${a.startTime}`).getTime() - new Date(`2000-01-01 ${b.startTime}`).getTime()
    );

    const gaps = [];
    for (let i = 0; i < sortedSchedules.length - 1; i++) {
      const current = sortedSchedules[i];
      const next = sortedSchedules[i + 1];
      
      const gapStart = current.endTime;
      const gapEnd = next.startTime;
      
      const startTime = new Date(`2000-01-01 ${gapStart}`);
      const endTime = new Date(`2000-01-01 ${gapEnd}`);
      const gapMinutes = (endTime.getTime() - startTime.getTime()) / (1000 * 60);
      
      const hours = Math.floor(gapMinutes / 60);
      const minutes = gapMinutes % 60;
      const duration = `${hours}h ${minutes}min`;
      
      gaps.push({ start: gapStart, end: gapEnd, duration });
    }

    return gaps;
  }

  private async updatePerformanceMetrics(
    date: string, 
    aiRecommended: boolean, 
    actualAttended: boolean, 
    dayOfWeek: string
  ): Promise<void> {
    try {
      const currentMetrics = await DataService.getPerformanceMetrics();
      if (!currentMetrics) return;

      // Update best attendance days based on actual attendance
      if (actualAttended && !currentMetrics.bestAttendanceDays.includes(dayOfWeek)) {
        currentMetrics.bestAttendanceDays.push(dayOfWeek);
      }

      // Update weather preferences (simplified - in real app would track actual weather)
      // For now, just keep existing preferences

      // Save updated metrics
      await DataService.savePerformanceMetrics(currentMetrics);
    } catch (error) {
      console.error('Error updating performance metrics:', error);
    }
  }
}