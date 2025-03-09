# 🌱 EcoVision Tracker: Sustainability Made Simple ♻️

## 🚀 Project Overview
**EcoVision Tracker** is your personal sustainability companion that makes eco-friendly living accessible and rewarding. By combining intuitive tracking tools with AI-powered features, we help you build sustainable habits and measure your positive environmental impact.

## 💡 Key Features

### 📊 Dashboard
- Track your sustainability journey with visual metrics
- Monitor your eco streak and carbon footprint reduction
- View personalized eco tips and challenges

### 🌿 Eco Actions
- Log daily sustainable actions like using reusable items or taking public transit
- Complete challenges to build eco-friendly habits
- Maintain streaks to reinforce positive behavior

### 🔍 AI Trash Scanner
- Upload photos of waste items for instant AI classification
- Learn whether items belong in recycling, compost, or landfill
- Receive educational tips on proper waste disposal
- Earn Buds rewards for recycling correctly

### 💰 EcoWallet
- Earn "Buds" (eco-currency) for sustainable actions
- Track your transaction history
- Redeem Buds for badges, merchandise, or donations to environmental causes

### 🏆 Badges & Achievements
- Earn badges for completing eco challenges
- Showcase your environmental accomplishments
- Unlock special rewards as you progress

### 📱 User Experience
- Mobile-friendly responsive design
- Intuitive navigation and clean interface
- Dark/light mode support

## 🛠️ Tech Stack
- **Frontend**: React with TypeScript, Vite, Tailwind CSS
- **Backend**: Flask API with Gemini AI integration
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Clerk
- **State Management**: React Query
- **UI Components**: shadcn/ui, Radix UI primitives
- **Visualizations**: Recharts

## 🚀 Getting Started

### Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Backend Setup
```bash
# Create and activate virtual environment (optional)
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start Flask server
python app.py
```

## 📋 Requirements
- Node.js (v18+)
- Python 3.9+
- Supabase account
- Clerk account
- Gemini API key (for AI features)

## 🔧 Environment Variables
Create a `.env` file with:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_GEMINI_API_KEY=your_gemini_api_key
VITE_API_BASE_URL=your_api_server_url  # For production deployment
```

## 📱 Features in Detail

### Eco Action Tracking
Track your daily sustainable actions, from using reusable containers to reducing water usage. Each action earns Buds and contributes to your environmental impact score.

### AI Trash Scanner
Our AI-powered waste classification system uses Google's Gemini API to analyze images of waste items and provide accurate disposal recommendations, educational tips, and Buds rewards.

### EcoWallet
Manage your earned Buds currency, view transaction history, and redeem rewards. The wallet provides a tangible incentive system for sustainable behavior.

### Badges & Achievements
Earn badges for milestones like "Early Adopter," "Waste Warrior," and "Carbon Cutter" to gamify your sustainability journey.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is licensed under the MIT License.

### 📂 Project Structure
```
eco-action-logger-06/
├── src/
│   ├── components/
│   │   ├── ui/          # Reusable UI components
│   │   ├── home/        # Home page components
│   │   ├── layout/      # Layout components
│   │   └── dashboard/   # Dashboard components
│   ├── pages/           # Route components
│   │   ├── Dashboard.tsx
│   │   ├── Index.tsx
│   │   ├── NotFound.tsx
│   │   └── TrashScanner.tsx
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utility functions and configurations
│   └── App.tsx          # Main application component
├── public/              # Static assets
└── ...config files      # Various configuration files
```

### 🚀 Getting Started

1. **Prerequisites**
   - Node.js (v18 or higher)
   - npm or yarn

2. **Installation**
   ```bash
   # Clone the repository
   git clone [repository-url]

   # Navigate to project directory
   cd eco-action-logger-06

   # Install dependencies
   npm install --legacy-peer-deps
   ```

3. **Development**
   ```bash
   # Start the development server
   npm run dev
   ```
   The application will be available at `http://localhost:8080`

4. **Building for Production**
   ```bash
   # Build the application
   npm run build

   # Preview the production build
   npm run preview
   ```

### 🔧 Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### 🎯 Features in Detail

#### Eco Action Tracking
- Log daily sustainable actions
- Track your eco streak
- View historical data
- Set personal goals

#### Trash Scanner
- AI-powered waste classification
- Real-time feedback
- Educational tips
- Waste diversion tracking

#### Dashboard
- Visual progress tracking
- Carbon footprint calculator
- Achievement badges
- Weekly/monthly reports

#### User Experience
- Responsive design
- Dark/light mode
- Intuitive navigation
- Real-time updates

### 🙏 Acknowledgments
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [React Query](https://tanstack.com/query/latest) for efficient data fetching
- [Recharts](https://recharts.org/) for beautiful charts 

## 🚀 Deployment

### Frontend Deployment (Vercel)
1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Configure the environment variables in the Vercel dashboard
4. Deploy your application

### Backend Deployment
For the Flask backend, you have several options:
1. **Render**: Easy deployment with free tier available
2. **Heroku**: Simple deployment with PostgreSQL integration
3. **Railway**: Modern platform with easy setup
4. **AWS/GCP/Azure**: More complex but highly scalable

Important: When deploying, make sure to:
1. Set the `VITE_API_BASE_URL` environment variable in your frontend to point to your deployed backend
2. Configure CORS in your backend to allow requests from your frontend domain
3. Set up your Gemini API key in your backend environment 