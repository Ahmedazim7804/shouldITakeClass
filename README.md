# College Attendance Optimizer 🎓

An intelligent system to help college students optimize their attendance while maintaining the required 75% attendance rate, especially useful when college is far away (like a 4-hour round trip).

## Problem Solved

- **Long commute**: 2 hours to college + 2 hours back = 4 hours total travel time
- **Attendance requirement**: Must maintain 75% attendance in each course
- **Schedule changes**: Classes sometimes get rescheduled or cancelled
- **Preference optimization**: Minimize college days and gaps between classes

## Features

✅ **Smart Decision Making**
- Answers "Should I go to college today?" with confidence scores
- Recommends which specific classes to attend
- Considers attendance requirements vs. travel time efficiency

✅ **Attendance Tracking**
- Tracks current attendance percentage for each course
- Predicts future requirements to maintain 75%
- Handles class cancellations that don't count toward attendance

✅ **Schedule Optimization**
- Minimizes time gaps between classes
- Optimizes for minimum college days
- Respects user preferences (max gap tolerance, minimum classes per day)

✅ **Flexible Schedule Management**
- Fixed weekly schedule
- Day-specific overrides for schedule changes
- Holiday and cancellation handling

✅ **Multi-day Planning**
- Analyze upcoming week or month
- Strategic attendance planning
- Risk assessment for each course

## How to Use

### Basic Usage

```typescript
import { DataManager } from './lib/dataManager';
import { CollegeDecisionEngine } from './lib/collegeDecisionEngine';

// Create system
const dataManager = new DataManager();
const engine = new CollegeDecisionEngine(dataManager);

// Add your courses
dataManager.addCourse({
  id: 'CS101',
  name: 'Computer Science',
  requiredAttendancePercentage: 75,
  totalClassesScheduled: 60,
  classesAttended: 42,
  classesCancelled: 3
});

// Set your preferences
dataManager.setPreferences({
  minimizeCollegeDays: true,
  maxGapBetweenClasses: 180, // 3 hours max
  priorityCourses: ['CS101'],
  minimumClassesPerDay: 2
});

// Get today's recommendation
const decision = engine.shouldGoToday();
console.log(decision.summary); // "Yes, go to college. 3 classes recommended."
```

### Setting Up Your Schedule

```typescript
// Weekly schedule
dataManager.setWeeklySchedule({
  monday: [
    { startTime: '09:00', endTime: '10:30', courseId: 'CS101' },
    { startTime: '11:00', endTime: '12:30', courseId: 'MATH201' }
  ],
  tuesday: [
    { startTime: '14:00', endTime: '15:30', courseId: 'PHYS101' }
  ]
  // ... other days
});

// Schedule override for specific date
dataManager.addScheduleOverride({
  date: '2024-01-15',
  classes: [
    { startTime: '10:00', endTime: '11:30', courseId: 'CS101' }
  ],
  reason: 'Rescheduled'
});
```

### Analyzing Attendance

```typescript
// Get attendance status for all courses
const statuses = engine.getAttendanceStatusSummary();
statuses.forEach(status => {
  console.log(`${status.courseName}: ${status.currentPercentage}%`);
  console.log(`Can skip: ${status.canSkip} classes`);
  console.log(`Need: ${status.classesNeededFor75Percent} more classes`);
});

// Analyze a specific day
const analysis = engine.analyzeDay('2024-01-15');
console.log(`Should go: ${analysis.shouldGo}`);
console.log(`Recommended classes: ${analysis.recommendedClasses}`);
console.log(`Reasoning: ${analysis.reasoning}`);
```

## System Components

### 1. **Types** (`types/attendance.ts`)
Complete TypeScript definitions for courses, schedules, preferences, and analysis results.

### 2. **AttendanceCalculator** (`lib/attendanceCalculator.ts`)
- Calculates current attendance percentages
- Predicts future requirements
- Determines which classes are critical for maintaining 75%

### 3. **ScheduleOptimizer** (`lib/scheduleOptimizer.ts`)
- Calculates time gaps between classes
- Optimizes class selection based on preferences
- Determines if a day is worth the travel time

### 4. **DataManager** (`lib/dataManager.ts`)
- Manages courses, schedules, and attendance records
- Handles schedule overrides and cancellations
- Provides data persistence and retrieval

### 5. **CollegeDecisionEngine** (`lib/collegeDecisionEngine.ts`)
- Main decision-making component
- Combines all other components
- Provides high-level analysis and recommendations

## Example Scenarios

### Scenario 1: Good Attendance Student
- Has 87% attendance in most courses
- Can be selective about which days to attend
- System recommends skipping days with large gaps or few classes

### Scenario 2: Critical Attendance Student  
- Has 70% attendance (below 75% requirement)
- Must attend almost every remaining class
- System prioritizes attendance over convenience

### Scenario 3: Schedule with Large Gaps
- Morning class at 9 AM, next class at 3 PM (6-hour gap)
- System may recommend skipping unless classes are critical
- Considers 4-hour travel time vs. time spent at college

## Running the Demo

```bash
# Install dependencies
npm install

# Run the demo
npx tsx lib/demo.ts
```

The demo shows:
- Today's attendance decision
- Course attendance status summary
- Detailed day analysis with reasoning
- Week-ahead planning

## Key Algorithms

### Decision Logic
1. **Must-attend classes**: Below 75% or can't afford to skip any more
2. **Gap analysis**: Calculate time between classes
3. **Efficiency check**: Compare college time vs. travel time (4 hours)
4. **Preference scoring**: Weight factors like minimum classes per day

### Attendance Prediction
```
Required classes = ceil(75% × total_classes_after_semester)
Classes needed = max(0, required_classes - current_attended)
Can skip = total_remaining - classes_needed
```

### Day Optimization
- Start with must-attend classes
- Add optional classes if they improve the day score
- Consider gaps, travel efficiency, and user preferences

## Data You Need to Provide

1. **Fixed Schedule**: Your regular weekly class schedule
2. **Current Attendance**: How many classes you've attended vs. total for each course  
3. **Schedule Changes**: Any day-specific changes or cancellations
4. **Preferences**: Your priorities (gap tolerance, minimum classes per day, etc.)

## Benefits

- **Save time**: Avoid unnecessary trips to college
- **Maintain grades**: Never drop below 75% attendance
- **Reduce stress**: Clear decision-making with confidence scores
- **Plan ahead**: See recommendations for the upcoming week
- **Handle changes**: Easily update for schedule modifications

Perfect for students with long commutes who need to be strategic about their college attendance! 🚀
