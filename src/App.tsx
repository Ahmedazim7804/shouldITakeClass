import React, { useState, useEffect } from 'react';
import { Calendar, BookOpen, BarChart3, Settings, History, LogOut, User } from 'lucide-react';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { CourseCard } from './components/CourseCard';
import { CourseForm } from './components/CourseForm';
import { ScheduleView } from './components/ScheduleView';
import { ScheduleForm } from './components/ScheduleForm';
import { PreferencesForm } from './components/PreferencesForm';
import { AttendanceHistory } from './components/AttendanceHistory';
import { TodayClasses } from './components/TodayClasses';
import { Course, ClassSchedule, ScheduleOverride, UserPreferences, AttendanceRecord } from './types';
import { AIDecisionEngine } from './utils/aiDecisionEngine';
import { DataService } from './utils/dataService';
import { supabase } from './utils/supabase';

function App() {
  const [user, setUser] = useState<any>(null);
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'courses' | 'schedule' | 'history' | 'today'>('today');
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
  const [recommendation, setRecommendation] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Form states
  const [showCourseForm, setShowCourseForm] = useState(false);
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [showPreferencesForm, setShowPreferencesForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [editingClass, setEditingClass] = useState<ClassSchedule | undefined>();

  // Authentication check on startup
  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        await initializeApp();
      } else {
        setIsLoading(false);
      }
    };
    checkUser();
  }, []);

  const handleAuthSuccess = async (authenticatedUser: any) => {
    setUser(authenticatedUser);
    await initializeApp();
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Reset app state
    setCourses([]);
    setSchedule([]);
    setOverrides([]);
    setRecommendation(null);
    setCurrentTab('today');
  };

  // Initialize data on first load
  const initializeApp = async () => {
    try {
      setIsLoading(true);
      
      // Initialize default data if needed
      await DataService.initializeDefaultData();
      
      // Load data from database
      const [dbCourses, dbSchedule, dbPreferences] = await Promise.all([
        DataService.getAllCourses(),
        DataService.getAllClassSchedules(),
        DataService.getUserPreferences()
      ]);

      setCourses(dbCourses);
      setSchedule(dbSchedule);
      
      if (dbPreferences) {
        setPreferences(dbPreferences);
      }
    } catch (error) {
      console.error('Error initializing app:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate AI-enhanced recommendation
  useEffect(() => {
    const generateRecommendation = async () => {
      if (courses.length === 0 || isLoading || !user) return;

      try {
        const aiEngine = new AIDecisionEngine(preferences);
        const rec = await aiEngine.generateEnhancedRecommendation(selectedDate, courses, schedule, overrides);
        setRecommendation(rec);
      } catch (error) {
        console.error('Error generating recommendation:', error);
      }
    };

    generateRecommendation();
  }, [selectedDate, courses, schedule, overrides, preferences, isLoading, user]);

  const handleSaveCourse = async (courseData: Omit<Course, 'id'>) => {
    try {
      if (editingCourse) {
        const updatedCourse = { ...courseData, id: editingCourse.id };
        await DataService.saveCourse(updatedCourse);
        setCourses(courses.map(c => c.id === editingCourse.id ? updatedCourse : c));
      } else {
        const newCourse = { ...courseData, id: Date.now().toString() };
        await DataService.saveCourse(newCourse);
        setCourses([...courses, newCourse]);
      }
      setShowCourseForm(false);
      setEditingCourse(undefined);
    } catch (error) {
      console.error('Error saving course:', error);
      alert('Failed to save course. Please try again.');
    }
  };

  const handleSaveClass = async (classData: Omit<ClassSchedule, 'id'>) => {
    try {
      if (editingClass) {
        const updatedClass = { ...classData, id: editingClass.id };
        await DataService.saveClassSchedule(updatedClass);
        setSchedule(schedule.map(c => c.id === editingClass.id ? updatedClass : c));
      } else {
        const newClass = { ...classData, id: Date.now().toString() };
        await DataService.saveClassSchedule(newClass);
        setSchedule([...schedule, newClass]);
      }
      setShowScheduleForm(false);
      setEditingClass(undefined);
    } catch (error) {
      console.error('Error saving class schedule:', error);
      alert('Failed to save class schedule. Please try again.');
    }
  };

  const handleDeleteClass = async (id: string) => {
    try {
      await DataService.deleteClassSchedule(id);
      setSchedule(schedule.filter(c => c.id !== id));
    } catch (error) {
      console.error('Error deleting class schedule:', error);
      alert('Failed to delete class schedule. Please try again.');
    }
  };

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowCourseForm(true);
  };

  const handleEditClass = (classSchedule: ClassSchedule) => {
    setEditingClass(classSchedule);
    setShowScheduleForm(true);
  };

  const handleSavePreferences = async (newPreferences: UserPreferences) => {
    try {
      await DataService.saveUserPreferences(newPreferences);
      setPreferences(newPreferences);
      setShowPreferencesForm(false);
    } catch (error) {
      console.error('Error saving preferences:', error);
      alert('Failed to save preferences. Please try again.');
    }
  };

  const handleRecordAttendance = async (attended: boolean) => {
    if (!recommendation) return;

    try {
      const aiEngine = new AIDecisionEngine(preferences);
      await aiEngine.recordDecision(
        selectedDate,
        recommendation.shouldGo,
        attended,
        recommendation.confidence,
        recommendation.weatherImpact?.condition || 'unknown'
      );

      // Update course attendance counts and save attendance records
      const updatedCourses = courses.map(course => {
        const impact = recommendation.attendanceImpact.find((imp: any) => imp.courseId === course.id);
        if (impact && attended) {
          return { ...course, attendedClasses: course.attendedClasses + 1 };
        }
        return course;
      });

      // Save updated courses
      for (const course of updatedCourses) {
        await DataService.saveCourse(course);
      }
      setCourses(updatedCourses);

      // Save attendance records for each course that had classes today
      const dayOfWeek = new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long' });
      const todaysClasses = schedule.filter(cls => cls.day === dayOfWeek);
      
      for (const classSchedule of todaysClasses) {
        const attendanceRecord: AttendanceRecord = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          courseId: classSchedule.courseId,
          date: selectedDate,
          attended: attended,
          cancelled: false
        };
        
        await DataService.saveAttendanceRecord(attendanceRecord);
      }

      alert(`Attendance recorded: ${attended ? 'Attended' : 'Skipped'}. AI will learn from this decision.`);
    } catch (error) {
      console.error('Error recording attendance:', error);
      alert('Failed to record attendance. Please try again.');
    }
  };

  const refreshData = async () => {
    const dbCourses = await DataService.getAllCourses();
    setCourses(dbCourses);
  };

  // Show auth screen if not logged in
  if (!user) {
    return <Auth onAuthSuccess={handleAuthSuccess} />;
  }

  const tabs = [
    { id: 'today', label: "Today's Classes", icon: Calendar },
    { id: 'dashboard', label: 'AI Dashboard', icon: BarChart3 },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'schedule', label: 'Schedule', icon: Calendar },
    { id: 'history', label: 'History', icon: History },
  ] as const;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your attendance data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header with User Info */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">College Attendance Optimizer</h1>
            <p className="text-gray-600">Smart attendance tracking powered by AI</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-gray-600">
              <User className="w-4 h-4" />
              <span className="text-sm">{user.email}</span>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </div>
        </div>

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

        {/* Date Selector for Dashboard and Today */}
        {(currentTab === 'dashboard' || currentTab === 'today') && (
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
              {currentTab === 'dashboard' && (
                <button
                  onClick={() => setShowPreferencesForm(true)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                >
                  <Settings className="w-4 h-4" />
                  AI Settings
                </button>
              )}
            </div>
          </div>
        )}

        {/* Content */}
        {currentTab === 'today' && (
          <TodayClasses 
            courses={courses}
            selectedDate={selectedDate}
            onAttendanceUpdate={refreshData}
          />
        )}

        {currentTab === 'dashboard' && recommendation && (
          <div className="space-y-6">
            <Dashboard 
              recommendation={recommendation} 
              courses={courses} 
              selectedDate={selectedDate}
            />
            
            {/* Attendance Recording */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Record Your Decision</h3>
              <div className="flex gap-4">
                <button
                  onClick={() => handleRecordAttendance(true)}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  ✅ I Attended
                </button>
                <button
                  onClick={() => handleRecordAttendance(false)}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  ❌ I Skipped
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Recording your actual decision helps the AI learn and improve its recommendations.
              </p>
            </div>
          </div>
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

        {currentTab === 'history' && (
          <AttendanceHistory courses={courses} />
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
            onSave={handleSavePreferences}
            onClose={() => setShowPreferencesForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;