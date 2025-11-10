# GameVerse - Ultimate Browser Gaming Platform

A modern, full-stack browser gaming platform featuring an endless runner game built with React, Phaser 3, and Supabase.

🌐 **Live Demo**: [https://game-verse-net.lovable.app](https://game-verse-net.lovable.app)

## 🎮 Features

- **Endless Runner Game**: Dodge obstacles and compete for high scores
- **User Authentication**: Sign up, login, and manage your profile with Supabase Auth
- **Leaderboard**: Compete globally and see top players
- **Profile System**: Track your stats, high scores, and recent activity
- **Real-time Score Tracking**: Automatic score submission and ranking
- **Modern UI**: Beautiful dark theme with neon accents using Tailwind CSS and shadcn/ui

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **Game Engine**: Phaser 3
- **Backend**: Supabase (PostgreSQL + Auth)
- **Routing**: React Router DOM

## 📋 Prerequisites

- Node.js 18+ and npm
- A Supabase account and project

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/IshaanGhost/game-verse.git
   cd game-verse
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   - Create a `.env` file in the root directory
   - Add your Supabase credentials:
     ```env
     VITE_SUPABASE_URL=your_supabase_project_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```
   - Get these from your Supabase project: Settings → API

4. **Set up the database**
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Run the SQL from `supabase_setup.sql` to create tables and set up RLS policies

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   - Navigate to `http://localhost:8080`

## 🎯 How to Play

1. **Sign Up/Login**: Create an account or log in to track your progress
2. **Navigate to Play**: Click "Play" in the navigation
3. **Start Game**: Click "Start Game" button
4. **Controls**: 
   - **Left Arrow** ← Move left
   - **Right Arrow** → Move right
5. **Objective**: Dodge the falling pink obstacles for as long as possible
6. **Scoring**: Earn 1 point for each obstacle you successfully dodge
7. **Game Over**: Hit an obstacle to end the game and submit your score

## 📁 Project Structure

```
game-verse/
├── public/              # Static assets
│   ├── favicon.svg      # Website icon
│   └── robots.txt
├── src/
│   ├── components/      # React components
│   │   ├── Navigation.tsx
│   │   ├── PhaserGame.jsx  # Phaser game wrapper
│   │   └── ui/         # shadcn/ui components
│   ├── game/
│   │   └── config.js   # Phaser game configuration
│   ├── hooks/
│   │   └── useAuth.jsx # Authentication hook
│   ├── pages/          # Page components
│   │   ├── Home.tsx
│   │   ├── Play.tsx
│   │   ├── Leaderboard.tsx
│   │   ├── Profile.tsx
│   │   └── auth/
│   │       ├── Login.tsx
│   │       └── Signup.tsx
│   ├── supabaseClient.js  # Supabase client setup
│   ├── App.tsx         # Main app component
│   └── main.tsx        # Entry point
├── supabase_setup.sql  # Database setup script
├── DEPLOYMENT.md       # Deployment instructions
└── package.json
```

## 🗄️ Database Schema

### Tables

**profiles**
- `id` (UUID, Primary Key) - References auth.users
- `username` (TEXT)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)

**high_scores**
- `id` (UUID, Primary Key)
- `user_id` (UUID) - References auth.users and profiles
- `score` (INTEGER)
- `created_at` (TIMESTAMP)

### Features
- Automatic profile creation on user signup
- Row Level Security (RLS) policies for data protection
- Foreign key relationships for data integrity

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Steps:
1. Set environment variables in your deployment platform:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
2. Deploy to Vercel, Netlify, or your preferred platform
3. Ensure the database setup SQL has been run in Supabase

## 🎨 Customization

### Colors & Theme
The app uses a dark theme with neon accents. Customize colors in:
- `tailwind.config.ts` - Theme colors
- `src/index.css` - Global styles

### Game Settings
Adjust game difficulty in `src/game/config.js`:
- `PLAYER_SPEED` - Player movement speed
- `OBSTACLE_SPEED` - Obstacle falling speed
- `INITIAL_OBSTACLE_DELAY` - Time between obstacles
- `MIN_OBSTACLE_DELAY` - Minimum delay (increases difficulty)

## 📝 Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Built with [Phaser 3](https://phaser.io/) game framework
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Backend powered by [Supabase](https://supabase.com/)

## 📧 Support

For issues and questions, please open an issue on GitHub.

---

**Made with ❤️ for gamers everywhere**
