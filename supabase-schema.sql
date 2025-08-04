-- Create tables for attendance tracking system

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  totalClasses INTEGER NOT NULL,
  attendedClasses INTEGER NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class schedules table
CREATE TABLE IF NOT EXISTS class_schedules (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  day TEXT NOT NULL,
  startTime TEXT NOT NULL,
  endTime TEXT NOT NULL,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE
);

-- Schedule overrides table
CREATE TABLE IF NOT EXISTS schedule_overrides (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  courseId TEXT NOT NULL,
  startTime TEXT,
  endTime TEXT,
  cancelled BOOLEAN DEFAULT FALSE,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE
);

-- Attendance records table
CREATE TABLE IF NOT EXISTS attendance_records (
  id TEXT PRIMARY KEY,
  courseId TEXT NOT NULL,
  date TEXT NOT NULL,
  attended BOOLEAN NOT NULL,
  cancelled BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  FOREIGN KEY (courseId) REFERENCES courses (id) ON DELETE CASCADE
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id TEXT PRIMARY KEY,
  maxGapBetweenClasses INTEGER NOT NULL,
  preferredDaysOff TEXT NOT NULL, -- JSON array
  weatherSensitivity TEXT NOT NULL,
  commuteMode TEXT NOT NULL,
  morningPerson BOOLEAN NOT NULL,
  preferredStudyDays TEXT NOT NULL, -- JSON array
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI learning data table
CREATE TABLE IF NOT EXISTS ai_learning_data (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  attended BOOLEAN NOT NULL,
  weather TEXT NOT NULL,
  dayOfWeek TEXT NOT NULL,
  totalClasses INTEGER NOT NULL,
  gaps INTEGER NOT NULL,
  aiRecommended BOOLEAN NOT NULL,
  actualAttended BOOLEAN NOT NULL,
  confidence INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id TEXT PRIMARY KEY,
  bestAttendanceDays TEXT NOT NULL, -- JSON array
  optimalGapLength INTEGER NOT NULL,
  weatherPreferences TEXT NOT NULL, -- JSON object
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(date);
CREATE INDEX IF NOT EXISTS idx_ai_learning_data_date ON ai_learning_data(date);
CREATE INDEX IF NOT EXISTS idx_class_schedules_day ON class_schedules(day);
CREATE INDEX IF NOT EXISTS idx_schedule_overrides_date ON schedule_overrides(date);

-- Enable Row Level Security (RLS)
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_schedules ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_overrides ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can modify these based on your authentication needs)
CREATE POLICY "Allow public access to courses" ON courses FOR ALL USING (true);
CREATE POLICY "Allow public access to class_schedules" ON class_schedules FOR ALL USING (true);
CREATE POLICY "Allow public access to schedule_overrides" ON schedule_overrides FOR ALL USING (true);
CREATE POLICY "Allow public access to attendance_records" ON attendance_records FOR ALL USING (true);
CREATE POLICY "Allow public access to user_preferences" ON user_preferences FOR ALL USING (true);
CREATE POLICY "Allow public access to ai_learning_data" ON ai_learning_data FOR ALL USING (true);
CREATE POLICY "Allow public access to performance_metrics" ON performance_metrics FOR ALL USING (true); 