# 🌱 EcoVision Tracker ♻️

### 🚀 Project Overview
**EcoVision Tracker** is your **personal sustainability assistant**, combining **eco action tracking** with **AI-powered trash sorting** to help users build eco-friendly habits and learn proper waste disposal. 

### 💡 Key Features
- ✅ Log daily eco-friendly actions (e.g., using reusable bottles, taking public transit)
- 📸 Upload photos of trash items to **automatically detect** if they should go to Recycle, Compost, or Trash.
- 📊 Track personal progress with a dashboard showing **eco streaks**, waste diversion rates, and estimated **carbon footprint reduction**.
- 🔔 Get daily eco tips & challenges to stay motivated.
- 🎉 Earn badges for completing challenges and maintaining eco streaks.
- 🌍 Track your carbon footprint and environmental impact
- 📱 Mobile-friendly interface for on-the-go tracking
- 🔄 Real-time progress updates and statistics
- 🎯 Personalized eco goals and challenges
- 📈 Visual analytics and progress tracking

### 🛠️ Tech Stack
- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: React Query
- **Routing**: React Router DOM
- **Form Handling**: React Hook Form with Zod validation
- **Charts**: Recharts
- **UI Components**: Radix UI primitives
- **Date Handling**: date-fns
- **Animations**: Tailwind CSS Animate
- **Icons**: Lucide React
- **Notifications**: Sonner
- **Carousel**: Embla Carousel

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

### 🤝 Contributing
1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### 📝 License
This project is licensed under the MIT License - see the LICENSE file for details.

### 🙏 Acknowledgments
- [shadcn/ui](https://ui.shadcn.com/) for the beautiful UI components
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework
- [Vite](https://vitejs.dev/) for the blazing fast build tool
- [Radix UI](https://www.radix-ui.com/) for accessible component primitives
- [React Query](https://tanstack.com/query/latest) for efficient data fetching
- [Recharts](https://recharts.org/) for beautiful charts 