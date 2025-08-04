# Supabase Setup for Attendance Tracking App

## Prerequisites

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project

## Setup Steps

### 1. Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy your:
   - **Project URL** (looks like: `https://your-project-id.supabase.co`)
   - **Anon/Public Key** (starts with `eyJ...`)

### 2. Set Environment Variables

Create a `.env` file in your project root:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Set Up Database Tables

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase-schema.sql` into the editor
4. Click "Run" to execute the SQL

### 4. Test the Setup

1. Run `npm run dev` to start the development server
2. Open your browser to `http://localhost:5173`
3. The app should now connect to Supabase and work with persistent data

## Database Schema

The application uses the following tables:

- **courses**: Store course information (name, code, attendance stats)
- **class_schedules**: Store class schedules for each course
- **schedule_overrides**: Store schedule changes for specific dates
- **attendance_records**: Store daily attendance records
- **user_preferences**: Store user preferences and settings
- **ai_learning_data**: Store AI learning data for predictions
- **performance_metrics**: Store performance analytics

## Security

The current setup allows public access to all tables. For production use, you should:

1. Implement authentication (Supabase Auth)
2. Create proper Row Level Security (RLS) policies
3. Restrict access based on user authentication

## Data Persistence

Your data will now be stored in Supabase's PostgreSQL database and will persist:

- Between browser sessions
- Across different devices
- For months/years as needed
- With automatic backups

## Troubleshooting

### Common Issues:

1. **"Missing Supabase environment variables"**

   - Make sure your `.env` file exists and has the correct values
   - Restart your development server after adding environment variables

2. **"Error fetching courses"**

   - Check that you've run the SQL schema in Supabase
   - Verify your API keys are correct

3. **"Network error"**
   - Check your internet connection
   - Verify your Supabase project is active

### Getting Help:

- Check the browser console for detailed error messages
- Verify your Supabase project is running
- Ensure your API keys are correct and have proper permissions
