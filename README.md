# College Attendance Optimizer

A smart attendance tracking application that helps students optimize their college attendance while maintaining the required 75% attendance rate. The app uses AI algorithms to provide intelligent recommendations based on your schedule, attendance patterns, and preferences.

## ✨ Features

### 🔐 Authentication
- **Secure Sign-up/Sign-in** with Supabase Auth
- **Google OAuth integration** for quick access
- **Password reset functionality**
- **User session management**

### 🎯 Smart AI Decision Engine
- **75% attendance requirement tracking** for each course
- **Intelligent recommendations** based on:
  - Current attendance percentages
  - Remaining classes in semester
  - Time gaps between classes
  - Weather conditions
  - Historical attendance patterns
  - Travel time optimization
- **Confidence scoring** for recommendations
- **Machine learning** from your attendance patterns

### 📅 Today's Classes
- **Real-time class schedule** for any selected date
- **One-click attendance marking** (Attended/Missed)
- **Visual status indicators** with color coding
- **Current attendance percentage** display for each course
- **Automatic course statistics updates**

### 📊 Dashboard & Analytics
- **AI-powered recommendations** for each day
- **Attendance impact analysis** showing how each decision affects your 75% requirement
- **Gap analysis** between classes with optimization suggestions
- **Weather and travel time considerations**
- **Confidence scores** and reasoning for each recommendation

### 📈 Course Management
- **Add/edit courses** with custom colors and codes
- **Real-time attendance tracking** (attended/total classes)
- **Visual progress indicators**
- **Automatic percentage calculations**

### 🗓️ Schedule Management
- **Weekly class schedules** with time and location
- **Schedule overrides** for specific dates
- **Gap detection and optimization**
- **Time conflict prevention**

### 📝 Attendance History
- **Complete attendance records** with month filtering
- **Edit past attendance** records with live updates
- **Delete incorrect records** with confirmation
- **Visual attendance status** (Attended/Missed/Cancelled)
- **Automatic course statistics sync**

### ⚙️ Smart Preferences
- **Maximum gap tolerance** between classes
- **Weather sensitivity settings**
- **Preferred study days**
- **Commute mode preferences**
- **Study pattern optimization**

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Supabase account (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd attendance-optimizer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Supabase**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to Settings → API and copy your:
     - Project URL
     - Anon/Public Key

4. **Configure environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your-project-url
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

5. **Set up the database**
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Run the contents of `supabase-schema.sql`

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Open your browser** to `http://localhost:5173`

## 🎯 How It Works

### AI Decision Algorithm

The app uses a sophisticated AI algorithm that considers multiple factors:

1. **Attendance Analysis**: Calculates how many classes you can still miss while maintaining 75%
2. **Critical Status Detection**: Identifies courses that require immediate attention
3. **Gap Optimization**: Suggests skipping classes when there are long breaks
4. **Pattern Learning**: Learns from your historical attendance behavior
5. **Weather Integration**: Considers weather conditions for commute decisions
6. **Smart Scheduling**: Optimizes your time by analyzing the entire day's schedule

### Usage Flow

1. **Sign up/Sign in** to access your personalized dashboard
2. **Add your courses** with total class counts (typically 40 per semester)
3. **Set up your weekly schedule** with class times and locations
4. **Configure preferences** for optimal AI recommendations
5. **Check daily recommendations** before deciding whether to attend
6. **Mark attendance** for each class to help the AI learn
7. **Review and edit** past attendance records as needed
8. **Monitor progress** through comprehensive analytics

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Backend**: Supabase (PostgreSQL + Auth)
- **Build Tool**: Vite
- **State Management**: React Hooks

## 📊 Database Schema

The app uses these main tables:
- `courses` - Course information and attendance counts
- `class_schedules` - Weekly class schedules
- `attendance_records` - Daily attendance tracking
- `schedule_overrides` - Schedule changes for specific dates
- `user_preferences` - User settings and preferences
- `ai_learning_data` - AI training data and patterns
- `performance_metrics` - Analytics and optimization data

## 🔒 Security Features

- **Row Level Security (RLS)** enabled on all tables
- **User authentication** required for all data access
- **Secure API endpoints** through Supabase
- **Data isolation** per user account

## 🎨 UI/UX Features

- **Responsive design** for desktop and mobile
- **Dark mode support** (coming soon)
- **Intuitive navigation** with clear visual hierarchy
- **Real-time updates** and instant feedback
- **Accessibility-friendly** interface
- **Beautiful animations** and transitions

## 📱 Mobile Compatibility

The app is fully responsive and works seamlessly on:
- Desktop computers
- Tablets (iPad, Android tablets)
- Mobile phones (iOS, Android)

## 🤖 AI Insights

The AI provides intelligent insights such as:
- "⚠️ 2 course(s) below 75% attendance requirement"
- "📊 Based on your history, you typically attend on Mondays"
- "⏰ You have 1 gap(s) longer than your preferred 120 minutes"
- "📅 Week 8/16 of semester (8 weeks remaining)"
- "💡 Consider skipping OS (85% attendance) to reduce gaps"

## 🎯 Future Enhancements

- **Calendar integration** (Google Calendar, Outlook)
- **Assignment tracking** and deadline reminders
- **Study group coordination**
- **Grade correlation analysis**
- **Mobile app** (React Native)
- **Notification system** for important attendance alerts
- **Advanced analytics** and reporting
- **Multi-semester support**

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

If you encounter any issues or have questions, please create an issue in the repository or contact the development team.

---

**Made with ❤️ for students who want to optimize their college experience while maintaining academic requirements.**