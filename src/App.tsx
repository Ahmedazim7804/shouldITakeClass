import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, BarChart3, Settings } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { CourseCard } from './components/CourseCard';
import { CourseForm } from './components/CourseForm';
import { ScheduleView } from './components/ScheduleView';
import { ScheduleForm } from './components/ScheduleForm';
import { PreferencesForm } from './components/PreferencesForm';
import { Course, ClassSchedule, ScheduleOverride, UserPreferences, AILearningData } from './types';
import { AIDecisionEngine } from './utils/aiDecisionEngine';

function App() {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'courses' | 'schedule'>('dashboard');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [schedule, setSchedule] = useState<ClassSchedule[]>([]);
  const [overrides, setOverrides] = useState<ScheduleOverride[]>([]);
  const [preferences, setPreferences] = useState<UserPreferences>({
    maxGapBetweenClasses: 120,
    preferredDaysOff: ['Sunday'],
    weatherSensitivity: 'medium',
    commuteMode: 'car',
    studyPatterns: {
      morningPerson: true,
      preferredStudyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
    }
  });
  const [learningData] = useState<AILearningData>({
    historicalAttendance: [],
    performanceMetrics: {
      bestAttendanceDays: ['Monday', 'Tuesday', 'Wednesday'],
      optimalGapLength: 90,
      weatherPreferences: { sunny: 0.9, cloudy: 0.7, rainy: 0.3 }
    }
  });
  const [recommendation, setRecommendation] = useState<any>(null);
  
  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [editingClass, setEditingClass] = useState<ClassSchedule | undefined>();

  // Load sample data on first load
  useEffect(() => {
    const sampleCourses: Course[] = [
      {
        id: '1',
        name: 'Data Structures & Algorithms',
        code: 'CS201',
        totalClasses: 45, // More realistic for a full semester
        attendedClasses: 35,
        color: '#3B82F6'
      },
      {
        id: '2',
        name: 'Database Management Systems',
        code: 'CS301',
        totalClasses: 42,
        attendedClasses: 30,
        color: '#10B981'
      },
      {
        id: '3',
        name: 'Operating Systems',
        code: 'CS302',
        totalClasses: 40,
        attendedClasses: 28,
        color: '#F59E0B'
      },
      {
        id: '4',
        name: 'Computer Networks',
        code: 'CS401',
        totalClasses: 38,
        attendedClasses: 32,
        color: '#EF4444'
      },
      {
        id: '5',
        name: 'Software Engineering Lab',
        code: 'CS303L',
        totalClasses: 24, // Lab courses typically have fewer classes
        attendedClasses: 20,
        color: '#8B5CF6'
      }
    ];

    const sampleSchedule: ClassSchedule[] = [
      { id: '1', courseId: '1', day: 'Monday', startTime: '09:00', endTime: '10:30', location: 'Room 101' },
      { id: '2', courseId: '2', day: 'Monday', startTime: '11:00', endTime: '12:30', location: 'Room 205' },
      { id: '3', courseId: '3', day: 'Tuesday', startTime: '10:00', endTime: '11:30', location: 'Room 301' },
      { id: '4', courseId: '4', day: 'Tuesday', startTime: '14:00', endTime: '15:30', location: 'Room 102' },
      { id: '5', courseId: '1', day: 'Wednesday', startTime: '09:00', endTime: '10:30', location: 'Room 101' },
      { id: '6', courseId: '2', day: 'Thursday', startTime: '11:00', endTime: '12:30', location: 'Room 205' },
      { id: '7', courseId: '3', day: 'Friday', startTime: '10:00', endTime: '11:30', location: 'Room 301' },
    ];

    setCourses(sampleCourses);
    setSchedule(sampleSchedule);
  }, []);

  // Generate AI-enhanced recommendation
  useEffect(() => {
    const generateRecommendation = async () => {
      const aiEngine = new AIDecisionEngine(learningData, preferences);
      const rec = await aiEngine.generateEnhancedRecommendation(selectedDate, courses, schedule, overrides);
      setRecommendation(rec);
    };

    if (courses.length > 0) {
      generateRecommendation();
    }
  }, [selectedDate, courses, schedule, overrides, preferences, learningData]);

  const handleSaveCourse = (courseData: Omit<Course, 'id'>) => {
    if (editingCourse) {
      setCourses(courses.map(c => c.id === editingCourse.id ? { ...courseData, id: editingCourse.id } : c));
    } else {
      const newCourse = { ...courseData, id: Date.now().toString() };
      setCourses([...courses, newCourse]);
    }
    setShowCourseForm(false);
    setEditingCourse(undefined);
  };

  const handleSaveClass = (classData: Omit<ClassSchedule, 'id'>) => {
    if (editingClass) {
      setSchedule(schedule.map(c => c.id === editingClass.id ? { ...classData, id: editingClass.id } : c));
    } else {
      const newClass = { ...classData, id: Date.now().toString() };
      setSchedule([...schedule, newClass]);
    }
    setShowScheduleForm(false);
    setEditingClass(undefined);
  };

  const handleDeleteClass = (id: string) => {
    setSchedule(schedule.filter(c => c.id !== id));
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleEditClass = (classSchedule: ClassSchedule) => {
    setEditingClass(classSchedule);
    setShowScheduleForm(true);
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
  ] as const;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl shadow-sm border border-gray-200">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    currentTab === tab.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Date Selector for Dashboard */}
        {currentTab === 'dashboard' && (
          <div className="mb-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Date
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowPreferencesForm(true)}
                className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                <Settings className="w-4 h-4" />
                AI Settings
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {currentTab === 'dashboard' && recommendation && (
          <Dashboard 
            recommendation={recommendation} 
            courses={courses} 
            selectedDate={selectedDate}
          />
        )}

        {currentTab === 'courses' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Courses</h2>
              <button
                onClick={() => setShowCourseForm(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Add Course
              </button>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2">
              {courses.map(course => (
                <CourseCard
                  key={course.id}
                  course={course}
                  onEdit={handleEditCourse}
                />
              ))}
            </div>

            {courses.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No courses added yet. Add your first course to get started!</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'schedule' && (
          <ScheduleView
            schedule={schedule}
            courses={courses}
            onAddClass={() => setShowScheduleForm(true)}
            onEditClass={handleEditClass}
            onDeleteClass={handleDeleteClass}
          />
        )}

        {/* Forms */}
        {showCourseForm && (
          <CourseForm
            course={editingCourse}
            onSave={handleSaveCourse}
            onClose={() => {
              setShowCourseForm(false);
              setEditingCourse(undefined);
            }}
          />
        )}

        {showScheduleForm && (
          <ScheduleForm
            classSchedule={editingClass}
            courses={courses}
            onSave={handleSaveClass}
            onClose={() => {
              setShowScheduleForm(false);
              setEditingClass(undefined);
            }}
          />
        )}

        {showPreferencesForm && (
          <PreferencesForm
            preferences={preferences}
            onSave={(newPreferences) => {
              setPreferences(newPreferences);
              setShowPreferencesForm(false);
            }}
            onClose={() => setShowPreferencesForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;