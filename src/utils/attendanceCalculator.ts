import { Course, ClassSchedule, AttendanceRecord, ScheduleOverride, DayRecommendation } from '../types';

export const calculateAttendancePercentage = (attended: number, total: number): number => {
  if (total === 0) return 100;
  return Math.round((attended / total) * 100);
};

export const getAttendanceStatus = (percentage: number): 'safe' | 'warning' | 'critical' => {
  if (percentage >= 80) return 'safe';
  if (percentage >= 75) return 'warning';
  return 'critical';
};

export const calculateRequiredAttendance = (course: Course, remainingClasses: number): number => {
  const requiredTotal = Math.ceil((course.attendedClasses) / 0.75);
  const currentTotal = course.totalClasses;
  const futureTotal = currentTotal + remainingClasses;
  
  const requiredAttended = Math.ceil(futureTotal * 0.75);
  const stillNeed = Math.max(0, requiredAttended - course.attendedClasses);
  
  return stillNeed;
};

export const canSkipClass = (course: Course, remainingClasses: number): boolean => {
  const currentPercentage = calculateAttendancePercentage(course.attendedClasses, course.totalClasses);
  if (currentPercentage < 75) return false;
  
  // Calculate if skipping one class still keeps us above 75%
  const futureTotal = course.totalClasses + remainingClasses;
  const futurePercentage = (course.attendedClasses / futureTotal) * 100;
  
  return futurePercentage >= 75;
};

export const calculateTimeGaps = (classes: Array<{ startTime: string; endTime: string }>) => {
  if (classes.length <= 1) return [];
  
  const sortedClasses = classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
  const gaps = [];
  
  for (let i = 0; i < sortedClasses.length - 1; i++) {
    const endTime = sortedClasses[i].endTime;
    const nextStartTime = sortedClasses[i + 1].startTime;
    
    const endMinutes = timeToMinutes(endTime);
    const startMinutes = timeToMinutes(nextStartTime);
    const gapMinutes = startMinutes - endMinutes;
    
    if (gapMinutes > 0) {
      gaps.push({
        start: endTime,
        end: nextStartTime,
        duration: minutesToDuration(gapMinutes)
      });
    }
  }
  
  return gaps;
};

export const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const minutesToDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins}min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
};

export const calculateTotalTimeOnCampus = (classes: Array<{ startTime: string; endTime: string }>): string => {
  if (classes.length === 0) return '0min';
  
  const sortedClasses = classes.sort((a, b) => a.startTime.localeCompare(b.startTime));
  const firstClass = sortedClasses[0];
  const lastClass = sortedClasses[sortedClasses.length - 1];
  
  const startMinutes = timeToMinutes(firstClass.startTime);
  const endMinutes = timeToMinutes(lastClass.endTime);
  const totalMinutes = endMinutes - startMinutes;
  
  return minutesToDuration(totalMinutes);
};