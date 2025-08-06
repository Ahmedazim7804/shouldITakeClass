import { Course, ClassSchedule, ScheduleOverride, DayRecommendation } from '../types';
import { 
  calculateAttendancePercentage, 
  getAttendanceStatus, 
  canSkipClass, 
  calculateTimeGaps, 
  calculateTotalTimeOnCampus 
} from './attendanceCalculator';

export const generateDayRecommendation = (
  date: string,
  courses: Course[],
  schedule: ClassSchedule[],
  overrides: ScheduleOverride[]
): DayRecommendation => {
  const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' });
  
  // Get today's classes considering overrides
  const todaysClasses = schedule
    .filter(cls => cls.day === dayOfWeek)
    .map(cls => {
      const override = overrides.find(ov => ov.date === date && ov.courseId === cls.courseId);
      if (override?.cancelled) return null;
      
      return {
        ...cls,
        startTime: override?.startTime || cls.startTime,
        endTime: override?.endTime || cls.endTime,
        location: override?.location || cls.location
      };
    })
    .filter(Boolean) as ClassSchedule[];

  if (todaysClasses.length === 0) {
    return {
      shouldGo: false,
      reason: "No classes scheduled for today",
      recommendedClasses: [],
      totalTimeOnCampus: '0min',
      gaps: [],
      attendanceImpact: []
    };
  }

  // Analyze each course's attendance situation
  const attendanceAnalysis = todaysClasses.map(cls => {
    const course = courses.find(c => c.id === cls.courseId)!;
    const currentPercentage = calculateAttendancePercentage(course.attendedClasses, course.totalClasses);
    const newPercentage = calculateAttendancePercentage(course.attendedClasses + 1, course.totalClasses + 1);
    
    return {
      courseId: cls.courseId,
      courseName: course.name,
      classSchedule: cls,
      currentPercentage,
      newPercentage,
      status: getAttendanceStatus(currentPercentage),
      canSkip: canSkipClass(course, 10) // Assuming 10 remaining classes as estimate
    };
  });

  // Determine critical classes (must attend)
  const criticalClasses = attendanceAnalysis.filter(
    analysis => analysis.status === 'critical' || !analysis.canSkip
  );

  // If any critical classes, recommend going
  if (criticalClasses.length > 0) {
    const recommendedClassSchedules = attendanceAnalysis
      .filter(analysis => !analysis.canSkip || analysis.status !== 'safe')
      .map(analysis => analysis.classSchedule);

    const gaps = calculateTimeGaps(recommendedClassSchedules);
    const totalTime = calculateTotalTimeOnCampus(recommendedClassSchedules);

    // Check if gaps are too long (more than 2 hours)
    const longGaps = gaps.filter(gap => {
      const gapMinutes = parseInt(gap.duration.replace(/\D/g, ''));
      return gapMinutes > 120;
    });

    let shouldGo = true;
    let reason = `You have ${criticalClasses.length} critical class(es) that need attendance.`;

    // If there are long gaps, suggest optimization
    if (longGaps.length > 0 && recommendedClassSchedules.length > 1) {
      const safeToSkip = attendanceAnalysis.filter(a => a.canSkip && a.status === 'safe');
      if (safeToSkip.length > 0) {
        reason += ` Consider skipping some safe classes to avoid long gaps.`;
      }
    }

    return {
      shouldGo,
      reason,
      recommendedClasses: recommendedClassSchedules.map(cls => cls.courseId),
      totalTimeOnCampus: totalTime,
      gaps,
      attendanceImpact: attendanceAnalysis.map(a => ({
        courseId: a.courseId,
        currentPercentage: a.currentPercentage,
        newPercentage: a.newPercentage,
        status: a.status
      }))
    };
  }

  // All classes are safe to skip
  const gaps = calculateTimeGaps(todaysClasses);
  const totalTime = calculateTotalTimeOnCampus(todaysClasses);
  
  // Check if it's worth going based on gaps
  const hasLongGaps = gaps.some(gap => {
    const gapMinutes = parseInt(gap.duration.replace(/\D/g, ''));
    return gapMinutes > 120;
  });

  if (hasLongGaps && todaysClasses.length > 1) {
    return {
      shouldGo: false,
      reason: "All classes are safe to skip and you have long gaps between classes. Consider staying home.",
      recommendedClasses: [],
      totalTimeOnCampus: totalTime,
      gaps,
      attendanceImpact: attendanceAnalysis.map(a => ({
        courseId: a.courseId,
        currentPercentage: a.currentPercentage,
        newPercentage: a.newPercentage,
        status: a.status
      }))
    };
  }

  return {
    shouldGo: true,
    reason: "Good day to attend - reasonable gaps and will boost your attendance.",
    recommendedClasses: todaysClasses.map(cls => cls.courseId),
    totalTimeOnCampus: totalTime,
    gaps,
    attendanceImpact: attendanceAnalysis.map(a => ({
      courseId: a.courseId,
      currentPercentage: a.currentPercentage,
      newPercentage: a.newPercentage,
      status: a.status
    }))
  };
};